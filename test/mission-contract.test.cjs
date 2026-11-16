'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cfg=JSON.parse(fs.readFileSync('config/MIRRA_GROWTH_PROGRAM_V1.json','utf8'));
test('Founder first five verified volunteers and no payment gate stay canonical',()=>{
 assert.equal(cfg.schema,'mirra.human-connection-growth-program.v1');
 assert.deepEqual(cfg.targets.verified_volunteer_users.slice(0,4),[5,10,50,100]);
 assert.equal(cfg.monetization_priority,'NONE_UNTIL_REAL_USER_RETENTION');
 assert.equal(cfg.safety_and_truth.no_new_os,true);
 assert.equal(cfg.safety_and_truth.no_new_scheduler,true);
 assert.equal(cfg.safety_and_truth.no_duplicate_crm,true);
 assert.equal(cfg.current_real_users_verified,null);
});
test('unique sourced benchmarks, bounded tasks and roles have stable owners',()=>{
 const b=cfg.benchmarks,w=cfg.workstreams;
 assert.ok(b.length>=8&&w.length>=16&&cfg.roles.length>=5);
 assert.equal(new Set(b.map(x=>x.id)).size,b.length);
 assert.equal(new Set(w.map(x=>x.id)).size,w.length);
 const roles=new Set(cfg.roles.map(x=>x.id));
 for(const task of w){assert.ok(roles.has(task.owner));assert.match(task.id,/^F[0-9]{2}$/);assert.ok(task.acceptance.length>=35);assert.equal(task.status,'DEFINED_NOT_DISPATCHED')}
 for(const item of b){assert.match(item.primary_url,/^https:\/\//);assert.equal(item.last_verified_date,null)}
});
test('must distinguish mere browser metrics from real users and keep IPIP claims exact',()=>{
 assert.match(cfg.metrics_units.anonymous_browsers,/unverified/i);
 assert.match(cfg.safety_and_truth.psychometrics,/IPIP/);
 assert.match(cfg.cadence.observer,/existing Launch Factory/);
 assert.match(fs.readFileSync('docs/MIRRA_HUMAN_CONNECTION_BLUEPRINT_V1.md','utf8'),/not an executed coding agent/i);
});
