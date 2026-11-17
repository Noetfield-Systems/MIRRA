'use strict';
/**
 * MIRRA Living Experience 2.1
 * Enhances existing product without inventing social users or gating the first visit.
 * Fictional editorial guides are explicitly labeled; rewards are device-local and non-monetary.
 */
(function(){
 const catalog=MIRRA_CURRICULUM;
 const chapterKeys=Object.keys(catalog.lessons);
 const originalRender=render;
 const originalChoose=chooseAnswer;
 const originalComplete=completeQuiz;
 const earnKey='explorationLedger';
 const readLedger=()=>{const x=getLocal(earnKey,{awards:{}});return x&&x.awards&&typeof x.awards==='object'?x:{awards:{}}};
 const xp=()=>Object.values(readLedger().awards).reduce((sum,x)=>sum+(Number(x.points)||0),0);
 const award=(key,points)=>{
  const x=readLedger();
  if(x.awards[key])return 0;
  x.awards[key]={points,at:new Date().toISOString()};
  putLocal(earnKey,x);
  return points;
 };
 const rank=()=>{const total=xp();return total>=180?'Steady Explorer':total>=80?'Curious Mind':total>=25?'First Chapter':'New Beginning'};
 const guide=()=>catalog.guides.find(x=>x.id===getLocal('guide','ari'))||catalog.guides[0];
 const safe=(x)=>escapeText(x);
 const portrait=g=>'<span class="m-guide-portrait m-'+g.color+'" aria-hidden="true">'+g.symbol+'<img src="'+safe(g.illustrative_photo||'')+'" alt="" loading="lazy" onerror="this.style.display=\'none\'" /></span>';
 const taken=(key)=>!!readLedger().awards[key];
 const completedLessons=()=>Object.keys(readLedger().awards).filter(x=>x.startsWith('lesson:')).length;
 const approved=()=>navigator.webdriver!==true&&!new URL(location.href).searchParams.has('mirra_qa')&&navigator.doNotTrack!=='1'&&!getLocal('analyticsOff',false);
 async function signalProgress(journey,index,total,done=false){
  if(!approved()||!journey||journey==='together'||state.demoMode||state.guestMode||total<8||total>60)return;
  try{await request('/api/quiz-progress',{method:'POST',json:{visitor:trackingId(),journey,source:state.source,answered:index,total,completed:done}})}catch{}
 }
 function ribbon(){
  const g=guide(),total=xp(),next=total<25?25:total<80?80:total<180?180:null;
  const width=next?Math.max(2,Math.min(100,Math.round(total/next*100))):100;
  return '<section class="container m-ribbon" aria-label="Your MIRRA progress"><div class="m-ribbon-guide">'+portrait(g)+'<div><span class="eyebrow">YOUR FICTIONAL EDITORIAL GUIDE</span><h2>'+safe(g.name)+' <em>is curious about your story.</em></h2><p>'+safe(g.copy)+'</p></div></div><div class="m-ribbon-score"><span class="eyebrow">YOUR PROGRESS</span><strong>'+total+'</strong><small>reflection points · '+rank()+'</small><div class="m-meter"><i style="width:'+width+'%"></i></div><button class="btn small" data-route="learn">Explore short lessons ↗</button></div></section>';
 }
 function weeklyMissions(){
  const saved=getLocal('localReports',[]);
  const didQuiz=saved.some(x=>x.createdAt?.startsWith(localDay()));
  const days=hasToday(),didLesson=Object.keys(readLedger().awards).some(x=>x.startsWith('lesson:')&&readLedger().awards[x].at?.startsWith(localDay()));
  const missions=[
   {done:didQuiz,title:'A moment of self-discovery',detail:'Complete one reflection',route:'discover'},
   {done:days,title:'A daily pause',detail:'Notice what today is teaching you',route:'daily'},
   {done:didLesson,title:'One small lesson',detail:'Practice a new perspective',route:'learn'}
  ];
  return '<section class="container m-mission-section"><div class="section-head"><div><span class="eyebrow">TODAY AT MIRRA</span><h2 class="section-title">Three little things.<br><em>Your own pace.</em></h2></div><p>No guilt if you miss a day. Every moment is yours to choose.</p></div><div class="m-mission-grid">'+missions.map((m,i)=>'<button class="m-mission" data-route="'+m.route+'"><span class="m-mission-number">'+String(i+1).padStart(2,'0')+'</span><span><strong>'+safe(m.title)+'</strong><small>'+safe(m.detail)+'</small></span><span class="m-mission-check">'+(m.done?'Complete':'Explore ↗')+'</span></button>').join('')+'</div></section>';
 }
 function recommendedLesson(){
  const previous=getLocal('recentReport',null)?.journey;
  if(['relationships','communication','friendship','conflict'].includes(previous))return 'connection';
  if(['boundaries','selfcare','resilience'].includes(previous))return 'boundaries';
  if(['decisions','motivation','focus','transitions'].includes(previous))return 'choices';
  return 'emotions';
 }
 function chapterView(sel){
  const path=catalog.lessons[sel.path],lesson=path.lessons[sel.index],who=guide();
  const id='lesson:'+sel.path+':'+sel.index,done=taken(id);
  return intro('MIRRA LEARNING','A little more<br><em>understanding.</em>','No right answers here. One small idea, one real-life practice.')+
   '<section class="container m-lesson-shell"><button class="btn-link" data-m-go="library">← All learning paths</button>'+
   '<div class="m-lesson-layout"><article class="m-lesson"><span class="eyebrow">'+safe(path.tag)+' / CHAPTER '+(sel.index+1)+' OF '+path.lessons.length+'</span>'+
   '<h2>'+safe(lesson.title)+'</h2><p class="m-lesson-reading">'+safe(lesson.reading)+'</p><blockquote>'+safe(lesson.example)+'</blockquote>'+
   '<h3>A question to carry with you.</h3><p>'+safe(lesson.prompt)+'</p><div class="m-lesson-practice"><span class="eyebrow">TRY THIS, GENTLY</span><p>'+safe(lesson.practice)+'</p></div>'+
   '<div class="group-buttons"><button class="btn dark" data-m-complete="'+sel.path+':'+sel.index+'">'+(done?'Already explored · Reflect again':'Complete this chapter · +10 points')+' ↗</button>'+
   (sel.index+1<path.lessons.length?'<button class="btn" data-m-lesson="'+sel.path+':'+(sel.index+1)+'">Next chapter ↗</button>':'<button class="btn" data-m-go="library">Choose another path ↗</button>')+'</div><p class="privacy-note">Points are a playful progress marker, not a score of your psychology. Saved on this device.</p></article>'+
   '<aside class="m-lesson-guide">'+portrait(who)+'<span class="eyebrow">A FICTIONAL GUIDE</span><h3>'+safe(who.name)+'</h3><p>'+safe(who.copy)+'</p><strong>'+xp()+' reflection points</strong></aside></div></section>';
 }
 function libraryView(){
  const g=guide(),rec=recommendedLesson();
  const chapters=Object.entries(catalog.lessons).map(([id,p])=>{
   const done=p.lessons.filter((_,i)=>taken('lesson:'+id+':'+i)).length,idx=done<4?done:0;
   return '<article class="m-learning-card '+(id===rec?'recommended':'')+'"><span class="eyebrow">'+safe(p.tag)+'</span><h3>'+safe(p.name)+'</h3><p>'+safe(p.intro)+'</p><div class="m-module-progress"><span>'+done+' / 4 chapters</span><div class="m-meter"><i style="width:'+(done/4*100)+'%"></i></div></div>'+
   '<button class="btn small" data-m-lesson="'+id+':'+idx+'">'+(done?'Continue exploring':'Begin this path')+' ↗</button></article>';
  }).join('');
  const guides=catalog.guides.map(v=>'<button class="m-guide-choice '+(v.id===g.id?'selected':'')+'" data-m-guide="'+v.id+'">'+portrait(v)+'<span><strong>'+safe(v.name)+'</strong><small>'+safe(v.role)+'</small><em>'+safe(v.copy)+'</em><small>Fictional editorial character</small></span></button>').join('');
  return intro('THE MIRRA LEARNING ROOM','Learn about yourself.<br><em>Little by little.</em>','Sixteen beautifully short chapters across four practical paths. Meaningful enough to keep, small enough to try today.')+
    '<section class="container m-learning-library"><div class="m-progress-intro"><span class="eyebrow">YOUR INNER ATLAS</span><div><strong>'+xp()+'</strong><span>reflection points</span></div><p>'+rank()+'. Your progress is private and saved on this device. You can explore everything for free.</p></div>'+
    '<div class="section-head"><div><span class="eyebrow">FIND YOUR PATH</span><h2 class="section-title">Four ways to<br><em>grow.</em></h2></div><p>Recommended for you: '+safe(catalog.lessons[rec].name)+'. Start anywhere, in any order.</p></div>'+
    '<div class="m-learning-grid">'+chapters+'</div>'+
    '<div class="section-head"><div><span class="eyebrow">THE FICTIONAL GUIDES</span><h2 class="section-title">Different voices.<br><em>One curious world.</em></h2></div><p>These editorial characters suggest perspectives; they are not real members, therapists or live AI companions.</p></div><div class="m-guide-grid">'+guides+'</div></section>';
 }
 function feedback(r){
  if(!r)return '';
  return '<section class="container m-feedback"><div><span class="eyebrow">YOUR VOICE BUILDS MIRRA</span><h2>Was this reflection<br><em>worth your time?</em></h2><p>Your private rating helps us make the next version more thoughtful. No public reviews or quiz answers are shared.</p></div>'+
   '<form id="m-result-feedback"><fieldset><legend>How useful was this reflection?</legend><div class="m-ratings">'+[1,2,3,4,5].map(n=>'<label><input type="radio" name="rating" value="'+n+'" required><span>'+n+'</span></label>').join('')+'</div></fieldset>'+
   '<label class="m-feedback-check"><input type="checkbox" name="returnIntent"><span>I would like to come back for another experience.</span></label>'+
   '<label class="field"><span>WHAT SHOULD WE IMPROVE? (OPTIONAL)</span><textarea name="feedback" maxlength="500" placeholder="Something you liked, missed, or would change..."></textarea></label>'+
   '<button class="btn dark" type="submit">Share private feedback ↗</button></form></section>';
 }
 function guideCardOnReport(){
  const r=state.result||getLocal('recentReport',null);
  if(!r)return '';
  const newPrompt=r.score?.practice;
  return '<section class="container m-after-report"><div><span class="eyebrow">A SMALL STEP BEYOND THE QUIZ</span><h2>'+(newPrompt?'A thought to take<br><em>into real life.</em>':'A new perspective<br><em>starts here.</em>')+'</h2><p>'+safe(newPrompt||'Think of one moment when this tendency helped you. When might another response be useful?')+'</p><button class="btn" data-route="learn">Discover practical lessons ↗</button></div><div><span class="eyebrow">YOUR PROGRESS ON THIS DEVICE</span><strong>'+xp()+'</strong><p>Reflection points. Not a clinical score, ranking or reward with monetary value.</p></div></section>';
 }
 const invitationTemplates={
  friend:'Quick favor? I’m helping test MIRRA, a new little space for self-discovery and better conversations. It takes about 3 minutes, is free, and needs no account. Try it and tell me what feels genuinely good or confusing: ',
  partner:'I found a thoughtful two-person experience called MIRRA Together. It asks eight small questions and compares our perspectives. Want to try it with me? No sign-up or payment: ',
  creator:'I’m looking for honest early feedback on MIRRA, a beautifully simple psychology and connection app. Would you try one free reflection and tell me where you lost interest or wanted more? No account required: '
 };
 function inviteKit(){
  return '<section class="container m-sharekit"><div><span class="eyebrow">INVITE SOMEONE WHO MATTERS</span><h2>An honest invitation.<br><em>Not a sales pitch.</em></h2><p>Choose a message, send it to someone who might enjoy reflecting, and ask for frank feedback. Every invitation is voluntary.</p></div><div class="m-sharekit-actions">'+
  Object.entries(invitationTemplates).map(([k,v])=>'<button class="m-sharekit-btn" data-m-message="'+k+'"><strong>'+safe(k==='friend'?'Invite a friend':k==='partner'?'Share with a partner':'Ask a creator to test')+'</strong><span>Copy the short English invitation ↗</span></button>').join('')+'</div></section>';
 }

 function exitPulse(){
  return '<div class="m-exit-pulse"><button type="button" class="btn-link" data-m-pause="1">Not finding what you hoped for? Tell us why.</button>'+
  '<div id="m-exit-panel" hidden><form id="m-exit-survey"><span class="eyebrow">ONE QUICK QUESTION</span>'+
  '<h3>What would make this experience better?</h3>'+
  '<div class="m-exit-reasons">'+
  ['Questions feel too long','The topic is not relevant','The wording is confusing','I want something different'].map((v,i)=>'<label><input type="radio" name="reason" value="'+i+'" required><span>'+v+'</span></label>').join('')+'</div>'+
  '<button type="submit" class="btn dark">Send private feedback ↗</button><p class="privacy-note">No answers, contact details or account are attached to this note.</p></form></div></div>';
 }
 render=function(){
  if(state.route==='learn'){
   refreshNav();app.innerHTML=state.learningSelection?chapterView(state.learningSelection):libraryView();
   document.title='Learn and reflect | MIRRA';
   const mobile=document.querySelector('#mobile-nav');if(mobile)mobile.hidden=true;
   const menu=document.querySelector('#menu-toggle');if(menu)menu.setAttribute('aria-expanded','false');
   return;
  }
  originalRender();
  if(state.route==='quiz'){
   const note=app.querySelector('.privacy-note');if(note)note.insertAdjacentHTML('afterend',exitPulse());
  }
  if(state.route==='home'){
   const hero=app.querySelector('.hero');if(hero)hero.insertAdjacentHTML('afterend',ribbon());
   const features=app.querySelector('.experience-pick');if(features)features.insertAdjacentHTML('afterend',weeklyMissions());
  }
  if(state.route==='daily'&&hasToday())award('daily:'+localDay(),5);
  if(state.route==='report'){
   app.insertAdjacentHTML('beforeend',guideCardOnReport()+feedback(state.result||getLocal('recentReport',null)));
  }
  if(state.route==='community')app.insertAdjacentHTML('beforeend',inviteKit());
  if(state.route==='guestSpace'){
   const page=app.querySelector('.page-body');if(page)page.insertAdjacentHTML('afterbegin',ribbon());
  }
 };
 chooseAnswer=function(value){
  const journey=state.journey,index=state.idx,total=journey==='ipip50'?state.ipip.length:journey==='together'?8:genres[journey]?.questions?.length||0,guest=!!state.guestMode,demo=!!state.demoMode;
  originalChoose(value);
  if(!guest&&!demo)void signalProgress(journey,index+1,total,false);
 };
 completeQuiz=async function(){
  const journey=state.journey,total=journey==='ipip50'?state.ipip.length:journey==='together'?8:genres[journey]?.questions?.length||0;
  const guest=!!state.guestMode,demo=!!state.demoMode;
  await originalComplete();
  if(!guest&&!demo&&journey!=='together'&&state.route==='report'&&state.result?.journey===journey){
   const earned=award('quiz:'+journey,journey==='ipip50'?25:20);
   void signalProgress(journey,total,total,true);
   render();
   if(earned)toast('A new chapter explored. +'+earned+' reflection points.');
  }
 };
 document.addEventListener('click',e=>{
  const el=e.target.closest('[data-m-lesson],[data-m-guide],[data-m-complete],[data-m-go],[data-m-message],[data-m-pause]');
  if(!el)return;
  e.preventDefault();
  if(el.dataset.mPause!==undefined){const panel=document.getElementById('m-exit-panel');if(panel){panel.hidden=!panel.hidden;if(!panel.hidden)panel.scrollIntoView({block:'nearest',behavior:'smooth'});}return;}
  if(el.dataset.mLesson){
   const [key,indexStr]=el.dataset.mLesson.split(':'),index=Number(indexStr);
   if(!catalog.lessons[key]?.lessons[index])return;
   state.learningSelection={path:key,index};route('learn');return;
  }
  if(el.dataset.mGuide){
   if(catalog.guides.some(g=>g.id===el.dataset.mGuide)){putLocal('guide',el.dataset.mGuide);render();toast('Your guide is here.')}return;
  }
  if(el.dataset.mComplete){
   const [key,indexStr]=el.dataset.mComplete.split(':'),index=Number(indexStr);
   if(!catalog.lessons[key]?.lessons[index])return;
   const gained=award('lesson:'+key+':'+index,10);
   if(gained&&approved())void track('lesson_completed',key);
   render();toast(gained?'Your curiosity earned +10 reflection points.':'You have already explored this chapter.');return;
  }
  if(el.dataset.mGo==='library'){state.learningSelection=null;route('learn');return;}
  if(el.dataset.mMessage){
   const kind=el.dataset.mMessage,txt=invitationTemplates[kind];if(!txt)return;
   const uri=location.origin+(kind==='partner'?'/?utm_source=partner_invite#together':'/q/'+(kind==='creator'?'relationships':'emotions')+'?utm_source='+kind+'_invite');
   copy(txt+uri);return;
  }
 });
 document.addEventListener('submit',async e=>{
  if(e.target.id==='m-exit-survey'){
   e.preventDefault();const form=e.target,data=Object.fromEntries(new FormData(form));
   const labels=['Questions feel too long','The topic is not relevant','The wording is confusing','I want something different'];
   const index=Number(data.reason);
   if(!Number.isInteger(index)||index<0||index>=labels.length)return toast('Please choose one reason.');
   try{
    await request('/api/feedback',{method:'POST',json:{area:'questions',journey:state.journey||'general',text:'Early-exit feedback: '+labels[index]+'.'}});
    form.innerHTML='<p class="m-exit-thanks">Thank you. Your suggestion will help us make MIRRA better.</p>';
   }catch(error){toast(error.message||'Could not send feedback');}
   return;
  }
  if(e.target.id!=='m-result-feedback')return;
  e.preventDefault();const form=e.target,data=Object.fromEntries(new FormData(form));
  const rating=Number(data.rating||0);
  if(!Number.isInteger(rating)||rating<1||rating>5)return toast('Choose a rating between 1 and 5.');
  const comment=String(data.feedback||'').trim().slice(0,500);
  const summary=comment.length>=8?comment:'Private '+rating+'/5 experience feedback. No free-text comment.';
  const journey=state.result?.journey||getLocal('recentReport',null)?.journey||'general';
  try{
   await request('/api/feedback',{method:'POST',json:{area:'questions',rating,journey,wouldReturn:data.returnIntent==='on',text:summary}});
   form.innerHTML='<div class="m-thankyou"><strong>Thank you for helping MIRRA grow.</strong><p>Your private feedback was saved. Every thoughtful response helps us decide what to improve.</p><button class="btn" data-route="learn">Explore a short lesson ↗</button></div>';
  }catch(err){toast(err.message||'Could not send feedback right now.');}
 });
})();