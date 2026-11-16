'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const app=fs.readFileSync('app.js','utf8');const srv=fs.readFileSync('server.js','utf8');const home=fs.readFileSync('index.html','utf8');
test('free entry and sharing are featured in the main product',()=>{for(const x of ['quick-start','guestInvite','daily','community','shareExperience','feedback-form','analyticsOff'])assert.ok(app.includes(x),x);assert.match(home,/Community/);assert.doesNotMatch(home,/Membership<\/button>/)});
test('anonymous funnel never transmits assessment answers',()=>{const method=app.substring(app.indexOf('async function track('),app.indexOf('function shareExperience'));assert.match(method,/visitor:trackingId\(\),kind,journey,source/);assert.doesNotMatch(method,/answers:/);assert.match(srv,/mirra_funnel_events/);assert.match(srv,/mirra_guest_invites/)});
test('acquisition paths are listed in sitemap',()=>{const xml=fs.readFileSync('sitemap.xml','utf8');assert.match(xml,/q\/emotions/);assert.match(xml,/q\/relationships/);assert.match(xml,/q\/ipip50/)});
