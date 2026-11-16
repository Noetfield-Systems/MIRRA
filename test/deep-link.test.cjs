'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('index.html','utf8');
const server=fs.readFileSync('server.js','utf8');
test('direct assessment routes load root-level scripts and stylesheet',()=>{
  assert.match(html,/href="\/styles\.css"/);
  assert.match(html,/src="\/app\.js"/);
  assert.doesNotMatch(html,/(?:href|src)="(?:styles\.css|app\.js)"/);
  assert.match(server,/sharePage/);
  assert.ok(server.includes('shareTitles'), 'quiz route titles are generated server-side');
});
test('app icon and social preview resolve from all routes',()=>{
  assert.match(html,/href="\/favicon\.svg"/);
  assert.ok(fs.existsSync('favicon.svg'));
  assert.match(html,/og:image/);
});

test('share routes supply unique page titles and canonical URLs',()=>{assert.match(server,/replaceAll\('MIRRA \| The psychology/);assert.match(server,/og:url/);});
