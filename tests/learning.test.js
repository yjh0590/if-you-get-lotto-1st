import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,decide,advance,age,validateSave,availableActions,action,quotePurchase,salaryIncome,choices,choiceCost} from '../dist/engine.js';
import {quoteTrade,trade} from '../dist/market.js';
import {comparisonRows,contemporaryBrief} from '../dist/learning.js';
import {renderLearning,renderNotebook} from '../dist/learning-ui.js';
import {avatarScene,lifeStage} from '../dist/avatar.js';
import {economy} from '../dist/data.js';
import {moneyText} from '../dist/format.js';
const ctx={escape:s=>String(s).replaceAll('<','&lt;'),won:moneyText,date:s=>s};
const adult=(month='2008-07')=>createGame({month,age:28,net:1000000000,gross:1000000000,region:'incheon',market:true,learn:true,allocation:'cash',lifetime:true,random:()=>0});
const child=()=>createGame({startMode:'birth',month:'2002-12',age:0,net:20000000,gross:20000000,region:'incheon',market:true,learn:true,lifetime:true,random:()=>0});
function resolve(s){if(!s.pending)return;if(s.pending.kind==='history-study')decide(s,s.pending.stage==='before'?'cashflow':'understood');else if(s.pending.kind==='growth')decide(s,'observe');else decide(s,choices(s).find(c=>choiceCost(s,c.id)===0).id);}
test('birth begins with guardian income and no lottery award or child trades',()=>{
 const s=child();assert.equal(age(s),0);assert.equal(s.job,false);assert.equal(s.draw,null);
 assert.equal(salaryIncome(s),economy(s.month).wage*1.5);assert.equal(s.market.trades.length,0);
 assert.equal(s.initial,20000000);assert.ok(validateSave(s));assert.equal(quoteTrade(s,'usd','buy',10000).disabled,true);
 assert.throws(()=>trade(s,'usd','buy',10000));assert.ok(availableActions(s).every(a=>a.disabled));assert.equal(quotePurchase(s,'car-premium').disabled,true);
});
test('preparation stops before the event month and cannot leak later title or prices',()=>{
 const s=adult();decide(s,'slow');const prices={...s.market.prices};advance(s,12);
 assert.equal(s.month,'2008-07');assert.equal(s.pending.stage,'before');assert.deepEqual(s.market.prices,prices);
 const html=renderLearning(s,ctx);assert.ok(!html.includes('リーマン'));assert.ok(!html.includes('리먼'));assert.ok(!html.includes('저탄소 녹색성장 방향 발표'));
 assert.ok(validateSave(s));const cash=s.cash;decide(s,'exposure');assert.equal(s.cash,cash);assert.equal(s.month,'2008-07');
});
test('prepared decision advances to sourced history and records concepts once with no reward',()=>{
 const s=adult();decide(s,'slow');advance(s);decide(s,'cashflow');advance(s);
 assert.equal(s.month,'2008-08');assert.equal(s.pending.stage,'after');assert.ok(validateSave(s));
 const html=renderLearning(s,ctx);assert.match(html,/실제 역사 기록/);assert.match(html,/게임에서 일어난/);assert.match(html,/148656226/);
 const cash=s.cash;decide(s,'review');assert.equal(s.cash,cash);assert.equal(s.learning.entries.length,1);assert.ok(s.learning.concepts.includes('policy'));
 assert.match(renderNotebook(s,ctx),/복습 표시/);assert.throws(()=>decide(s,'review'));assert.ok(validateSave(s));
});
test('same month multiple events have one preparation and separate learning records',()=>{
 const s=adult('2020-02');decide(s,'slow');advance(s);decide(s,'cashflow');advance(s);
 assert.equal(s.pending.economicId,'m-pandemic');decide(s,'understood');assert.equal(s.pending.economicId,'m-fed2020');
 const prices={...s.market.prices};decide(s,'understood');assert.deepEqual(s.market.prices,prices);assert.equal(s.learning.entries.length,2);assert.deepEqual(s.learning.prepared,['2020-03']);assert.ok(validateSave(s));
});
test('shadow portfolios include fees, do not mutate personal assets and use only played prices',()=>{
 const s=adult();const cash=s.cash;const rows=comparisonRows(s);assert.equal(rows[0].value,s.initial);assert.equal(rows[1].value,s.initial);assert.ok(rows[2].value<s.initial);assert.equal(s.cash,cash);
 decide(s,'slow');advance(s);decide(s,'cashflow');advance(s);assert.equal(s.learning.comparison.months,1);assert.ok(comparisonRows(s)[1].value>s.initial);assert.ok(validateSave(s));
});
test('family grows through childhood, transitions at 19 and preserves save compatibility',()=>{
 const s=child();decide(s,'observe');let iterations=0;
 while(age(s)<19&&iterations++<500){if(s.pending)resolve(s);else advance(s,12);assert.ok(validateSave(s),s.month);}
 assert.ok(iterations<500);assert.equal(age(s),19);assert.equal(s.guardian,false);assert.equal(s.job,true);assert.equal(salaryIncome(s),economy(s.month).wage);
 assert.ok(availableActions(s).some(a=>a.id==='job'&&!a.disabled));assert.ok(validateSave(JSON.parse(JSON.stringify(s))));
});
test('growth practice deducts cost once and cannot grant investment permissions',()=>{
 const s=child(),cash=s.cash;decide(s,'practice');assert.equal(s.cash,cash-20000);assert.throws(()=>decide(s,'practice'));assert.throws(()=>action(s,'job'));assert.equal(s.job,false);
});
test('pictograms show integer age and age appropriate props without facial details',()=>{
 const s=child();s.month='2003-11';assert.equal(lifeStage(s).years,0);s.month='2003-12';assert.equal(lifeStage(s).years,1);
 for(const [year,key] of [[0,'baby'],[5,'child'],[10,'school'],[16,'teen'],[25,'young'],[45,'adult'],[65,'mature'],[80,'senior']]){const t={...s,month:s.start,startAge:year};assert.equal(lifeStage(t).key,key);assert.match(avatarScene(t),/role="img"/);assert.ok(!avatarScene(t).includes('face-eye'));}
});
test('future is labeled imaginary and no future historical lesson is fabricated',()=>{
 const s=adult('2026-10');decide(s,'slow');advance(s);assert.equal(s.month,'2026-11');assert.notEqual(s.pending?.kind,'history-study');assert.match(renderLearning(s,ctx),/가상 미래/);assert.ok(validateSave(s));
});
test('corrupt learning imports and immature job ownership are rejected',()=>{
 const s=child();s.learning.comparison.months=99;assert.equal(validateSave(s),false);s.learning.comparison.months=0;s.job=true;assert.equal(validateSave(s),false);
 const a=adult();a.learning.entries=[{id:'fake',month:a.month,reflection:'understood',choice:null,concepts:[]}];assert.equal(validateSave(a),false);
});

test('contemporary information uses only already public months and expires',()=>{assert.equal(contemporaryBrief('2008-06'),null);assert.equal(contemporaryBrief('2008-07').date,'2008-07-15');assert.equal(contemporaryBrief('2009-01'),null);assert.equal(contemporaryBrief('2019-12'),null);assert.equal(contemporaryBrief('2020-02').date,'2020-01-30');assert.equal(contemporaryBrief('2022-02').date,'2022-01-26');});
