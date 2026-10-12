import {policyFor,policyWeight} from './policy-data.js';

// Illustrative monthly domestic-demand model, NOT Korean statistical data.
// It affects business revenue only; prices already incorporate market events.
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function previousMonth(month){const i=Number(month.slice(0,4))*12+Number(month.slice(5))-2;return `${Math.floor(i/12)}-${String(i%12+1).padStart(2,'0')}`;}
export function domesticConditions(s){
 const m=s.market;
 if(!m)return {demand:100,revenueFactor:1,policy:0,financing:0,prices:0,enabled:false};
 const p=policyFor(previousMonth(s.month));
 const policy=(p?.tilt.consumer||0)*10000*policyWeight(p,s.month);
 const financing=clamp((.025-m.deposit)*200,-10,10);
 const prices=clamp((.025-m.inflation)*200,-10,10);
 const demand=clamp(100+policy+financing+prices,75,120);
 return {demand,revenueFactor:m.domesticEconomy===true?demand/100:1,policy,financing,prices,enabled:m.domesticEconomy===true};
}
export function enableDomesticEconomy(s){
 if(!s.market||s.ended)throw Error('진행 중인 경제 시장에서 연결할 수 있어요.');
 if(s.market.domesticEconomy===true)return;
 s.market.domesticEconomy=true;
 s.log.push({id:s.log.length+1,month:s.month,type:'action',title:'한국 경제와 나의 가게를 연결했다',text:'내수 모형을 이후 월 매출에 반영합니다. 기존 잔액과 과거 장부는 바꾸지 않습니다. 내수 점수와 매출 계수는 게임 가정입니다.'});
}
