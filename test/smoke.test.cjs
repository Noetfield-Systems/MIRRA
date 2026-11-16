'use strict';
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
let child;
const port=39181;
const base='http://127.0.0.1:'+port;
before(async()=>{
 child=spawn(process.execPath,['server.js'],{env:{...process.env,DATABASE_URL:'',PORT:String(port)},stdio:['ignore','pipe','pipe']});
 let errors='';child.stderr.on('data',d=>errors+=d.toString());
 for(let i=0;i<70;i++){
  if(child.exitCode!==null)throw Error('MIRRA exited: '+errors.slice(-800));
  try{const r=await fetch(base+'/api/health');if(r.ok)return}catch{}
  await new Promise(r=>setTimeout(r,100));
 }
 throw Error('MIRRA server did not start: '+errors.slice(-800));
});
after(()=>{if(child)child.kill('SIGTERM')});
test('MIRRA 2 landing and modules are served',async()=>{
 let r=await fetch(base+'/');assert.equal(r.status,200);const html=await r.text();assert.match(html,/The psychology of being human/);assert.ok(html.includes('app.js'));
 r=await fetch(base+'/app.js');assert.equal(r.status,200);assert.match(await r.text(),/Personality/);
 r=await fetch(base+'/styles.css');assert.equal(r.status,200);
 r=await fetch(base+'/assets/portrait.webp');assert.equal(r.status,200);
});
test('API health is served and reports unconfigured account service accurately',async()=>{
 let r=await fetch(base+'/api/health');assert.equal(r.status,200);let j=await r.json();assert.equal(j.ok,true);assert.equal(j.database,false);
 r=await fetch(base+'/api/config');assert.equal(r.status,200);j=await r.json();assert.equal(j.accounts,false);
});
test('a missing page returns a genuine 404',async()=>{const r=await fetch(base+'/no-such-page');assert.equal(r.status,404)});
test('original assessment library remains accessible',async()=>{
 let r=await fetch(base+'/classic');assert.equal(r.status,200);let t=await r.text();assert.match(t,/Personality Atlas/);
 r=await fetch(base+'/enhancements.js');assert.equal(r.status,200);t=await r.text();assert.match(t,/The Emotional Landscape/);
});
test('MIRRA 2 scoring data and new experiences are present',()=>{
 const items=JSON.parse(fs.readFileSync('ipip-items.json','utf8'));
 assert.equal(items.length,50);
 const script=fs.readFileSync('app.js','utf8');
 for(const keyword of ['relationships','decisions','emotions','boundaries','values','social','resilience','habits'])assert.ok(script.includes(keyword),keyword);
});