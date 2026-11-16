'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {ITEMS,scoreIPIP}=require('../ipip-data.cjs');
test('IPIP has exactly 50 public-domain items with ten per dimension',()=>{assert.equal(ITEMS.length,50);for(const id of 'EACSI')assert.equal(ITEMS.filter(i=>i.dimension===id).length,10)});
test('neutral responses produce neutral domain indices',()=>{const dims=scoreIPIP(Array(50).fill(3)).dimensions;assert.equal(dims.length,5);assert.ok(dims.every(d=>d.index===50))});
test('reverse keyed responses are scored in the opposite direction',()=>{const a=Array(50).fill(3);a[1]=1;const low=scoreIPIP(a).dimensions.find(d=>d.id==='A').rawMean;a[1]=5;const high=scoreIPIP(a).dimensions.find(d=>d.id==='A').rawMean;assert.ok(low>high)});
test('out of range or missing answers fail validation',()=>{assert.throws(()=>scoreIPIP(Array(49).fill(3)));assert.throws(()=>scoreIPIP(Array(50).fill(6)));assert.throws(()=>scoreIPIP(Array(50).fill('3')))});
test('score dimensions remain within 0-100',()=>{for(const val of [1,2,3,4,5]){const dims=scoreIPIP(Array(50).fill(val)).dimensions;assert.ok(dims.every(d=>d.index>=0&&d.index<=100))}});
