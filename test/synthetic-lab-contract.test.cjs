'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs');
const p=JSON.parse(fs.readFileSync('config/SYNTHETIC_USER_LAB_V1.json','utf8'));
const app=fs.readFileSync('app.js','utf8'),srv=fs.readFileSync('server.js','utf8'),wf=fs.readFileSync('.github/workflows/quality.yml','utf8');
test('ten synthetic personas stay distinct from real user claims',()=>{
 a.equal(p.is_real_audience,false);a.equal(p.personas.length,10);a.equal(new Set(p.personas.map(x=>x.id)).size,10);
 a.match(app,/navigator.webdriver===true/);a.match(srv,/MIRRA_SYNTHETIC_LAB/);
});
test('reuse original quality workflow and disposable database',()=>{
 a.match(wf,/cron: '17 \*\/6 \* \* \*'/);a.match(wf,/npx playwright install --with-deps chromium/);
 a.match(wf,/MIRRA_SYNTHETIC_LAB: "1"/);a.match(wf,/mirra-synthetic-server.log/);
 a.match(wf,/SELECT count\(\*\)::int n FROM mirra_funnel_events/);
});
test('real-user experiment attribution excludes browser actor metrics',()=>{
 const program=JSON.parse(fs.readFileSync('config/MIRRA_GROWTH_PROGRAM_V1.json','utf8'));
 a.equal(program.synthetic_lab.public_user_count_contribution,0);
 a.equal(program.synthetic_lab.real_user_validation_required,true);
 a.equal(program.synthetic_lab.synthetic_personas,p.personas.length);
});

test('small-phone report wraps long titles and Big Five avoids percentile claims',()=>{
 const css=fs.readFileSync('styles.css','utf8');
 a.match(css,/\.report-summary b\{overflow-wrap:anywhere/);
 a.match(app,/not population percentiles, clinical diagnoses/);
});

test('Together has an explicit fictional preview without invented community activity',()=>{
 a.match(app,/function demoTogether\(\)/);a.match(app,/Alex is a fictional example/);
 a.match(app,/state.demoMode/);a.match(app,/data-action="demo-together"/);
});

test('fictional example is exercised in a separate browser scenario',()=>{
 a.ok(p.personas.some(x=>x.id==='fictional_demo'));
 a.match(fs.readFileSync('scripts/synthetic-user-lab.cjs','utf8'),/fictional_demo/);
});

test('learning and real feedback are exercised by the tenth browser scenario',()=>{
 a.ok(p.personas.some(x=>x.id==='learning_explorer'));
 const s=fs.readFileSync('scripts/synthetic-user-lab.cjs','utf8');
 a.match(s,/learning_explorer/);a.match(s,/m-result-feedback/);
});
