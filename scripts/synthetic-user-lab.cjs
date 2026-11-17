'use strict';
/*
 * MIRRA Synthetic User Lab: isolated local browser actors, not real users.
 * Run only against a disposable localhost server / database. Screenshots are QA evidence.
 */
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const config=require('../config/SYNTHETIC_USER_LAB_V1.json');
const BASE=process.env.MIRRA_LAB_BASE_URL||'http://127.0.0.1:3000';
const OUTPUT=path.resolve(process.env.MIRRA_LAB_ARTIFACTS||'artifacts/synthetic-lab');
const errs=[],findings=[],cases=[];
const now=()=>new Date().toISOString();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const add=(persona,priority,criterion,detail,action)=>findings.push({persona,priority,criterion,detail,action,source_type:'SYNTHETIC_QA_HYPOTHESIS'});
function safeName(s){return s.replace(/[^a-z0-9_-]/gi,'_')}
async function safeShot(page,id,stage){try{const file=path.join(OUTPUT,safeName(id)+'_'+safeName(stage)+'.png');await page.screenshot({path:file,fullPage:true,animations:'disabled',timeout:12000});return file}catch(e){add(id,'P2','screenshot',e.message,'Check screenshot capture');return null}}
function recordErrors(page,id){
 page.on('pageerror',e=>{errs.push({persona:id,type:'js_error',message:String(e.message).slice(0,300)})});
 page.on('response',r=>{if(r.url().startsWith(BASE)&&r.status()>=400&&r.request().resourceType()!=='image')errs.push({persona:id,type:'same_origin_http_'+r.status(),url:r.url()})});
}
async function before(page,id){
 const w=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,height:document.documentElement.scrollHeight,title:document.title,language:document.documentElement.lang}));
 if(w.scroll>w.client+2)add(id,'P0','horizontal_overflow','Scroll width '+w.scroll+' exceeds viewport '+w.client,'Fix intrinsic sizing at this viewport');
 if(w.language!=='en')add(id,'P2','language','Document lang='+w.language,'Confirm English-first document semantics');
 if((page.viewportSize()?.width||1200)<=430&&await page.locator('.report-actions .btn').count()){
  const widths=await page.locator('.report-actions .btn').evaluateAll(nodes=>nodes.map(n=>Math.round(n.getBoundingClientRect().width)));
  const tiny=widths.filter(w=>w<180);
  if(tiny.length)add(id,'P0','narrow_result_actions',tiny.length+' result action buttons under 180px ('+widths.join(',')+')','Stack report action buttons at full phone width');
 }
 const answerButtons=await page.locator('.answer').count();
 if(answerButtons){
  const h=await page.locator('.answer').first().evaluate(el=>Math.round(el.getBoundingClientRect().height));
  if(h<44)add(id,'P1','touch_target','Answer control height '+h+'px','Increase answer tap region to 44px or more');
  const labels=await page.locator('.answer').evaluateAll(xs=>xs.filter(x=>!x.innerText.trim()).length);
  if(labels)add(id,'P0','accessible_labels',labels+' answer buttons have no visible label','Fix answer control names');
 }
 return w;
}
async function waitQuestion(page,i){
 const value=String(i+1).padStart(2,'0');
 await page.waitForFunction(expected=>{
   const el=document.querySelector('.qno');
   return el&&el.textContent.includes('Question '+expected+'.');
 },value,{timeout:10000});
}
async function quiz(page,persona,{route,questions,explicit=false,style='varied'}={}){
 let stats={questions:0,route};
 await page.goto(BASE+(route==='together'?'/?mirra_qa=1#together':'/q/'+route+'?mirra_qa=1&utm_source=synthetic_qa'),{waitUntil:'domcontentloaded',timeout:25000});
 if(route==='together'){await page.locator('[data-action="start-together"]').first().click();}
 await waitQuestion(page,0);
 const beforeSize=await before(page,persona.id);
 if(persona.id==='curious_newcomer'||persona.id==='evidence_skeptic')await safeShot(page,persona.id,'first_question');
 for(let i=0;i<questions;i++){
  await waitQuestion(page,i);
  if(i===2&&persona.id==='thoughtful_returner'){
   await page.locator('[data-action="previous"]').click();
   await waitQuestion(page,i-1);
   await page.locator('[data-answer="4"]').first().click();
   await waitQuestion(page,i);
  }
  let value=style==='first'?1:style==='balanced'?i%5+1:(i*3+1)%4+1;
  if(value===5&&!explicit)value=4;
  if(style==='keyboard'&&i===0){
   await page.locator('[data-answer="'+value+'"]').focus();
   await page.keyboard.press('Enter');
  }else await page.locator('[data-answer="'+value+'"]').first().click();
  if(explicit){await page.locator('[data-action="next"]').first().click();}
  stats.questions++;
 }
 await page.waitForFunction(type=>{
  if(type==='together')return document.querySelector('#creator-name-form,#guest-name-form,.comparison-grid,.invite-box')!==null;
  return document.querySelector('.report-hero')!==null;
 },route,{timeout:15000});
 stats.after=await before(page,persona.id);
 if(route!=='together'){
  const reportText=await page.locator('#app').innerText();
  if(!/reflection|portrait|dimension|perspective/i.test(reportText))add(persona.id,'P0','report_quality','Result copy not detected','Check report page content');
  await safeShot(page,persona.id,'report');
 }
 return stats;
}
async function personaCase(browser,persona){
 const context=await browser.newContext({viewport:persona.viewport,locale:'en-US',reducedMotion:'reduce',colorScheme:'light',deviceScaleFactor:1});
 await context.addInitScript(()=>{
  localStorage.setItem('mirra2:analyticsOff','true');
  Object.defineProperty(navigator,'doNotTrack',{get:()=> '1',configurable:true});
 });
 const page=await context.newPage();recordErrors(page,persona.id);
 const start=Date.now();let info={};let status='PASS';
 try{
  if(persona.id==='daily_journaler'){
   await page.goto(BASE+'/?mirra_qa=1#daily',{waitUntil:'domcontentloaded'});
   await page.locator('#daily-form').waitFor({timeout:15000});
   await before(page,persona.id);
   await page.locator('textarea[name="reflection"]').fill('I noticed that small pauses help me listen better.');
   await page.locator('#daily-form button[type="submit"]').click();
   await page.waitForFunction(()=>document.querySelector('.daily-complete')!==null,{timeout:10000});
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('.daily-complete').waitFor();
   info={saved_reopen:true};await safeShot(page,persona.id,'daily');
  }else if(persona.id==='connection_seeker'){
   info=await quiz(page,persona,{route:'together',questions:8});
   await page.locator('#creator-name-form input[name="name"]').fill('Sample Tester A');
   await page.locator('#creator-name-form button[type="submit"]').click();
   await page.locator('.invite-code').waitFor({timeout:12000});
   const invite=await page.locator('.invite-code').innerText();
   assert.ok(invite.startsWith(BASE+'/?invite='),'Local-only invitation was not created');
   const guest=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
   await guest.addInitScript(()=>localStorage.setItem('mirra2:analyticsOff','true'));
   const other=await guest.newPage();recordErrors(other,'guest_second_persona');
   await other.goto(invite,{waitUntil:'domcontentloaded'});
   await other.locator('#guest-name-form input[name="name"]').fill('Sample Tester B');
   await other.locator('#guest-name-form button[type="submit"]').click();
   await waitQuestion(other,0);
   for(let i=0;i<8;i++){await waitQuestion(other,i);await other.locator('[data-answer="'+(i%4+1)+'"]').first().click();}
   await other.locator('.comparison-grid').waitFor({timeout:20000});
   info.guest_completed=true;
   await safeShot(other,persona.id,'two_person_comparison');
   await guest.close();
  }else if(persona.id==='fictional_demo'){
   await page.goto(BASE+'/?mirra_qa=1#together',{waitUntil:'domcontentloaded'});
   await page.locator('[data-action="demo-together"]').first().click();
   await waitQuestion(page,0);
   for(let i=0;i<8;i++){
    await waitQuestion(page,i);
    await page.locator('[data-answer="'+(i%4+1)+'"]').first().click();
   }
   await page.locator('.demo-compare-grid').waitFor({timeout:12000});
   const rows=await page.locator('.demo-row').count();
   const content=await page.locator('#app').innerText();
   if(rows!==8)add(persona.id,'P0','sample_preview','Expected eight sample comparisons, got '+rows,'Review preview renderer');
   if(!/fictional example/i.test(content))add(persona.id,'P0','sample_label','Preview should be clearly marked as an example','Add visible demo label');
   await before(page,persona.id);
   await safeShot(page,persona.id,'sample_comparison');
   info={sample_comparison_rows:rows,example_marked:/fictional example/i.test(content)};
  }else if(persona.id==='learning_explorer'){
   await page.goto(BASE+'/?mirra_qa=1#learn',{waitUntil:'domcontentloaded'});
   await page.locator('.m-learning-library').waitFor({timeout:12000});
   await page.locator('[data-m-guide="rowan"]').click();
   await page.locator('[data-m-lesson="emotions:0"]').click();
   await page.locator('.m-lesson').waitFor({timeout:8000});
   await page.locator('[data-m-complete="emotions:0"]').click();
   const points=await page.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('mirra2:explorationLedger')||'{"awards":{}}').awards).reduce((a,x)=>a+(x.points||0),0));
   if(points!==10)add(persona.id,'P0','learning_rewards','A new chapter should award ten points once, got '+points,'Repair device-local ledger');
   await page.locator('[data-m-go="library"]').click();
   await page.locator('.m-learning-library').waitFor({timeout:8000});
   await before(page,persona.id);
   await safeShot(page,persona.id,'learning_room');
   const quizInfo=await quiz(page,persona,{route:'friendship',questions:10});
   await page.locator('#m-result-feedback [name="rating"][value="4"]').check();
   await page.locator('#m-result-feedback button[type="submit"]').click();
   await page.locator('.m-thankyou').waitFor({timeout:10000});
   info={...quizInfo,learning_points:points,feedback_submitted:true};
  }else if(persona.id==='evidence_skeptic'){
   info=await quiz(page,persona,{route:'ipip50',questions:50,explicit:true,style:'balanced'});
   const dim=await page.locator('.report-dimension').count();
   if(dim!==5)add(persona.id,'P0','scoring','Expected 5 factor score rows, observed '+dim,'Review Big Five renderer');
   if(!/not a population percentile|not population percentiles/i.test(await page.locator('#app').innerText()))add(persona.id,'P1','scientific_framing','Big Five percentile caveat not evident in report','Clarify non-percentile interpretation');
   info.dimensions=dim;
  }else if(persona.id==='low_frictions'){
   info=await quiz(page,persona,{route:'emotions',questions:8,style:'keyboard'});
   const bad=await page.locator('button').evaluateAll(xs=>xs.filter(x=>!x.getAttribute('aria-label')&&!x.innerText.trim()).length);
   if(bad)add(persona.id,'P2','unlabeled_actions',bad+' button(s) have no accessible name','Improve icon-only buttons accessibility');
   info.unlabeled_buttons=bad;
  }else if(persona.id==='resilient_images'){
   await page.route(/images\.unsplash\.com/,r=>r.abort('failed'));
   info=await quiz(page,persona,{route:'values',questions:8});
   const broken=await page.locator('#app img').evaluateAll(xs=>xs.filter(x=>!x.complete||x.naturalWidth===0).length);
   if(broken)add(persona.id,'P1','external_photography',broken+' images broken when third-party CDN blocked','Self-host licensed imagery / use reliable fallback');
   info.broken_images=broken;
  }else{
   info=await quiz(page,persona,{route:persona.route,questions:8,style:persona.answer_strategy==='first option'?'first':'varied'});
   if(persona.id==='thoughtful_returner'){
    await page.reload({waitUntil:'domcontentloaded'});
    const draft=await page.evaluate(()=>JSON.parse(localStorage.getItem('mirra2:localReports')||'[]').length);
    if(draft<1)add(persona.id,'P0','persistence','Completed report missing after reload','Repair guest report retention');
    info.local_reports=draft;
   }
  }
 }catch(error){status='FAIL';errs.push({persona:persona.id,type:'scenario_failure',message:String(error?.message||error).slice(0,500)});try{await safeShot(page,persona.id,'failure')}catch{}}
 finally{
  cases.push({persona:persona.id,label:persona.label,status,duration_ms:Date.now()-start,...info});
  await context.close();
 }
}
function score(){
 const failed=cases.filter(c=>c.status==='FAIL').length;
 const critical=findings.filter(f=>f.priority==='P0').length+errs.length;
 const major=findings.filter(f=>f.priority==='P1').length;
 return {scenarios:cases.length,passed:cases.length-failed,failed,critical,major,decision:critical?'QA_REPAIR_REQUIRED':major?'PASS_WITH_IMPROVEMENTS':'BROWSER_PATHS_VERIFIED'};
}
async function main(){
 if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(BASE))throw Error('LAB_REQUIRES_DISPOSABLE_LOOPBACK_SERVER');
 if(config.is_real_audience!==false)throw Error('SYNTHETIC_LABEL_MISSING');
 fs.mkdirSync(OUTPUT,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{for(const persona of config.personas)await personaCase(browser,persona);}
 finally{await browser.close();}
 const report={schema:'mirra.synthetic-user-lab-report.v1',generated_at:now(),synthetic:true,real_people:0,production_events_sent:0,live_customer_retention_measured:false,
  summary:score(),personas:cases,critic_findings:findings,errors:errs,
  recommendations:[
  {priority:'P0',owner:'MIRRA-PRODUCT',next:'Repair failing browser flow, rerun isolated user journey',when:'if any P0'},
  {priority:'P1',owner:'MIRRA-DESIGN',next:'Review screenshots at mobile and desktop, polish recurring visual issues',when:'if visual findings'},
  {priority:'P1',owner:'MIRRA-CONTENT',next:'Audit credibility and humanity of report language with real evidence',when:'always'},
  {priority:'P1',owner:'MIRRA-GROWTH',next:'Continue opt-in five-person user research separately; never count bots',when:'always'}
  ],source_proof:'Run artifacts and exact GitHub SHA, not verified real users'};
 const file=path.join(OUTPUT,'report.json');fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
 console.log('MIRRA_SYNTHETIC_LAB',JSON.stringify({summary:report.summary,report:file,personas:cases.map(x=>({id:x.persona,status:x.status}))}));
 if(report.summary.critical)process.exitCode=1;
}
main().catch(e=>{console.error('MIRRA_SYNTHETIC_LAB_FATAL',e);process.exitCode=1;});
