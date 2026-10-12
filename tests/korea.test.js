import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,decide,advance,businessValue,income,validateSave} from '../dist/engine.js';
import {economy} from '../dist/data.js';
import {domesticConditions,enableDomesticEconomy} from '../dist/korea-economy.js';
import {renderKorea} from '../dist/korea-ui.js';
import {moneyText} from '../dist/format.js';
const game=month=>createGame({month,net:1000000000,gross:1000000000,age:28,region:'incheon',market:true,allocation:'balanced'});
test('domestic policy starts next month and does not use later government plans',()=>{
 const before=domesticConditions(game('2017-06'));
 const announcement=domesticConditions(game('2017-07'));
 const after=domesticConditions(game('2017-08'));
 assert.equal(before.policy,0);assert.equal(announcement.policy,0);assert.ok(after.policy>0);
});
test('higher model rates and inflation reduce domestic demand within bounds',()=>{
 const s=game('2019-05'),base=domesticConditions(s).demand;
 s.market.deposit+=.02;s.market.inflation+=.02;
 assert.ok(domesticConditions(s).demand<base);
 s.market.deposit=1;s.market.inflation=1;assert.ok(domesticConditions(s).demand>=75);
 s.market.deposit=-1;s.market.inflation=-1;assert.ok(domesticConditions(s).demand<=120);
});
test('business revenue uses demand once and monthly ledger uses the same calculation',()=>{
 const s=game('2019-05');s.business=true;decide(s,'slow');advance(s);
 const eco=economy(s.month),expected=eco.businessGross*domesticConditions(s).revenueFactor-eco.businessCost;
 assert.equal(businessValue(s),expected);
 assert.equal(s.lastFlow.business,Math.round(expected));
 assert.equal(income(s),Math.round(eco.wage+expected+s.deposit*s.market.deposit/12));
 assert.ok(validateSave(s));
});
test('old saves keep their business model until enabled without changing prior money or ledger',()=>{
 const s=game('2019-05');s.business=true;delete s.market.domesticEconomy;
 const old=JSON.stringify({cash:s.cash,deposit:s.deposit,history:s.timeline});
 assert.equal(domesticConditions(s).revenueFactor,1);
 const eco=economy(s.month);assert.equal(businessValue(s),eco.businessGross-eco.businessCost);
 assert.ok(validateSave(s));enableDomesticEconomy(s);
 assert.equal(JSON.stringify({cash:s.cash,deposit:s.deposit,history:s.timeline}),old);
 assert.notEqual(domesticConditions(s).revenueFactor,1);
 const logs=s.log.length;enableDomesticEconomy(s);assert.equal(s.log.length,logs);
 s.market.domesticEconomy='yes';assert.equal(validateSave(s),false);
});
test('domestic briefing shows budget and model limits without leaking later events',()=>{
 const s=game('2003-04');const html=renderKorea(s,{escape:String,won:moneyText,date:x=>x});
 assert.match(html,/대한민국 경제 속/);assert.match(html,/예상 월 잔액/);
 assert.match(html,/노무현/);assert.ok(!html.includes('이재명'));
 assert.match(html,/실제 한국 경제 통계/);assert.match(html,/data-tab="market"/);
 assert.match(html,/data-tab="assets"/);assert.match(html,/data-tab="life"/);
 assert.ok(!/NaN|undefined/.test(html));
});
test('legacy non-market and completed records have safe briefing states',()=>{
 const s=game('2019-05');delete s.market;
 assert.equal(domesticConditions(s).revenueFactor,1);
 assert.match(renderKorea(s,{escape:String,won:moneyText,date:x=>x}),/data-market-enable/);
 const ended=game('2019-05');ended.ended=true;ended.pending=null;
 const html=renderKorea(ended,{escape:String,won:moneyText,date:x=>x});
 assert.match(html,/삶의 결산/);assert.match(html,/data-advance="1" disabled/);
 assert.throws(()=>enableDomesticEconomy(ended));
});
