'use strict';
/* MIRRA first-party aggregate progress readback; never exposes personal answers. */
async function loadExtendedGrowth(){
 const tbody=document.getElementById('question-progress'),reach=document.getElementById('question-reach'),sentiment=document.getElementById('result-sentiment');
 if(!tbody||!reach||!sentiment)return;
 const cell=(tag,value)=>{const n=document.createElement(tag);n.textContent=String(value);return n};
 try{
  const res=await fetch('/api/growth/progress',{cache:'no-store'});
  if(!res.ok)throw Error('Question progress is temporarily unavailable.');
  const data=await res.json();
  tbody.replaceChildren();reach.replaceChildren();sentiment.replaceChildren();
  for(const j of data.journeys||[]){
   const row=document.createElement('tr');
   for(const v of [j.journey,j.observed_browser_days,(j.mean_questions_answered??0)+' / '+j.total_questions,j.completions,j.incomplete]){
    row.append(cell('td',v??0));
   }
   tbody.append(row);
  }
  if(!data.journeys?.length){
   const row=document.createElement('tr');const td=cell('td','No recorded quiz progress yet');td.colSpan=5;row.append(td);tbody.append(row);
  }
  const top=data.journeys?.[0];
  const steps=(data.steps||[]).filter(x=>x.journey===top?.journey);
  if(top&&steps.length){
   reach.setAttribute('aria-label','Question reach for '+top.journey);
   const max=Math.max(1,Number(top.observed_browser_days));
   for(const s of steps){
    const wrap=document.createElement('div');wrap.className='qreach-item';
    const bar=document.createElement('span');bar.className='qreach-bar';bar.style.height=Math.max(3,Math.round(Number(s.reached||0)/max*115))+'px';bar.title=s.reached+' browser-journey-days reached question '+s.step;
    wrap.append(bar,cell('small','Q'+s.step));reach.append(wrap);
   }
  }else reach.append(cell('small','No observed question-level progress yet.'));
  for(const item of data.feedback||[]){
   const row=document.createElement('tr');
   for(const v of [item.journey,item.responses,item.mean_rating===null?'Hidden until 5 responses':item.mean_rating,item.would_return_yes===null?'Hidden until 5 responses':item.would_return_yes]){
    row.append(cell('td',v));
   }sentiment.append(row);
  }
  if(!data.feedback?.length){const row=document.createElement('tr');const td=cell('td','No voluntary ratings yet');td.colSpan=4;row.append(td);sentiment.append(row)}
  const heading=document.getElementById('suggested-next'),basis=document.getElementById('suggested-basis');
  if(!data.journeys?.length){heading.textContent='Prove first-answer activation.';basis.textContent='Publish a clear, free 3-minute entry point; recruit opt-in testers and measure how many answer the first question.'}
  else if(top.incomplete>top.completions){heading.textContent='Shorten the difficult part of '+top.journey+'.';basis.textContent='Inspect questions where the aggregate reach curve drops. Offer a more useful transition and test on mobile.'}
  else if((data.feedback||[]).some(x=>x.responses>=5&&Number(x.mean_rating)<3.5)){heading.textContent='Improve how the result feels.';basis.textContent='At least five participants rated an experience below 3.5/5. Revisit relevance and clarity before adding more content.'}
  else {heading.textContent='Help people return for one more meaningful moment.';basis.textContent='Focus on a daily micro-lesson or voluntary two-person invite. Track actual return visits, not only preferences.'}
 }catch(e){tbody.replaceChildren();const tr=document.createElement('tr');const td=cell('td',e.message);td.colSpan=5;tr.append(td);tbody.append(tr);reach.replaceChildren();reach.append(cell('small','Growth readback unavailable.'))}
}
const refreshGrowth=document.getElementById('refresh');
if(refreshGrowth)refreshGrowth.addEventListener('click',loadExtendedGrowth);
loadExtendedGrowth();
