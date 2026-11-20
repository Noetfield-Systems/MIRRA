'use strict';
/* Browser-native zero-database regression: synthetic QA, not real users. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const BASE=process.env.MIRRA_PUBLIC_QA_BASE_URL||'http://127.0.0.1:3011';
if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(BASE))throw Error('PUBLIC_QA_LOCALHOST_ONLY');
async function step(page,index,choice){
 const number=String(index+1).padStart(2,'0');
 await page.waitForFunction(n=>document.querySelector('.qno')?.textContent?.includes('Question '+n+'.'),number,{timeout:11000});
 await page.locator('[data-answer="'+choice+'"]').first().click();
}
async function checkSize(page,label){
 const x=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
 assert.ok(x.scroll<=x.client+2,label+' horizontal overflow: '+JSON.stringify(x));
}
async function main(){
 const health=await (await fetch(BASE+'/api/health')).json();
 assert.equal(health.database,false,'This journey must use a disposable no-DB instance');
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 try{
  const owner=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await owner.newPage();page.on('pageerror',e=>errors.push('owner: '+e.message));
  await page.goto(BASE+'/?mirra_qa=1',{waitUntil:'domcontentloaded'});
  await page.locator('.hero').waitFor();
  await checkSize(page,'home/mobile');
  assert.ok(await page.locator('.bottom-nav').isVisible(),'Mobile quick navigation must be visible');
  await page.locator('.bottom-nav [data-route="together"]').click();
  await page.locator('[data-action="start-together"]').first().click();
  for(let i=0;i<8;i++)await step(page,i,i%4+1);
  await page.locator('#creator-name-form').waitFor({timeout:15000});
  await page.locator('#creator-name-form [name="name"]').fill('Example A');
  await page.locator('#creator-name-form button[type="submit"]').click();
  await page.locator('.invite-code').waitFor({timeout:15000});
  const invitation=(await page.locator('.invite-code').innerText()).trim();
  assert.ok(invitation.startsWith(BASE+'/?invite=local.'),'Generated guest link must be browser-local');
  const guest=await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const friend=await guest.newPage();friend.on('pageerror',e=>errors.push('guest: '+e.message));
  await friend.goto(invitation,{waitUntil:'domcontentloaded'});
  await friend.locator('#guest-name-form').waitFor({timeout:12000});
  await friend.locator('#guest-name-form [name="name"]').fill('Example B');
  await friend.locator('#guest-name-form button[type="submit"]').click();
  for(let i=0;i<8;i++)await step(friend,i,(i+1)%4+1);
  await friend.locator('.comparison-grid').waitFor({timeout:15000});
  assert.ok(await friend.locator('[data-action="share-invite"]').count(),'Return-link action must be visible');
  assert.ok(friend.url().includes('invite=local.'),'Completed comparison needs its own reusable link');
  await checkSize(friend,'completed Together/mobile');
  await guest.close();
  await page.goto(BASE+'/#mirror',{waitUntil:'domcontentloaded'});
  await page.locator('#mirror-form').waitFor({timeout:10000});
  await page.locator('#mirror-form [name="message"]').fill('I have a difficult decision about my work.');
  await page.locator('#mirror-form button[type="submit"]').click();
  await page.locator('.bubble.agent').last().waitFor();
  const conversation=await page.locator('.conversation').innerText();
  assert.match(conversation,/guided question|most to you/i,'Mirror must give an on-device guided response');
  await page.goto(BASE+'/#journal',{waitUntil:'domcontentloaded'});
  await page.locator('#journal-form textarea[name="text"]').fill('A private thought I want to remember.');
  await page.locator('#journal-form button[type="submit"]').click();
  await page.locator('.journal-entry').waitFor({timeout:10000});
  await checkSize(page,'journal/mobile');
  await page.setViewportSize({width:1440,height:900});
  await page.goto(BASE+'/?mirra_qa=1',{waitUntil:'domcontentloaded'});
  await page.locator('.hero').waitFor();
  await checkSize(page,'home/desktop');
  await owner.close();
  assert.deepEqual(errors,[],'Browser JS must not throw');
  console.log('MIRRA_PUBLIC_PREVIEW_E2E_PASS',JSON.stringify({mobile:true,desktop:true,guestTogether:true,guestSharedResult:true,guidedMirror:true,localJournal:true,scriptErrors:errors.length,synthetic:true}));
 }finally{await browser.close()}
}
main().catch(e=>{console.error('MIRRA_PUBLIC_PREVIEW_E2E_FAIL',e.stack||e.message);process.exitCode=1});
