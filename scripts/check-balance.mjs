import {writeFileSync} from 'node:fs';
import {createGame,decide,advance,choices,choiceCost,worth,validateSave,age} from '../dist/engine.js';
import {trade} from '../dist/market.js';
const rows=[];
for(const balance of [false,true])for(const asset of ['cash','deposit','gold','usd','energy','index']){
 const s=createGame({age:28,month:'2003-01',net:1400000000,gross:1400000000,region:'incheon',market:true,allocation:'cash',balance,beta:true,difficulty:'normal',riskSeed:337,lifetime:true,random:()=>0});
 if(asset==='deposit'){s.deposit=s.cash;s.cash=0;}else if(asset!=='cash')trade(s,asset,'buy',Math.floor(s.cash*.99));
 let months=0,guard=0,totalSalary=0,totalSpending=0,totalInterestTax=0;
 while(!s.ended&&guard++<3000){if(s.pending){const candidates=choices(s).filter(c=>c.id!=='return'||!(s.household?.jobReadyAt>Number(s.month.slice(0,4))*12+Number(s.month.slice(5))-1));candidates.sort((a,b)=>choiceCost(s,a.id)-choiceCost(s,b.id));decide(s,candidates[0].id);}else{const before=s.month;advance(s);if(s.month!==before){months++;totalSalary+=s.lastFlow.salary;totalSpending+=s.lastFlow.spending;totalInterestTax+=s.lastFlow.interestWithholding||0;}}if(!validateSave(s))throw Error(`Invalid ${balance}/${asset}/${s.month}`);}
 if(guard>=3000)throw Error('Simulation did not finish');rows.push({model:balance?'v1.3 household + balanced market':'legacy market + income',asset,endAge:age(s),months,nominalNetWorth:worth(s),startPurchasingPowerNetWorth:Math.round(worth(s)/s.cpi),netSalaryReceived:totalSalary,livingAndInsuranceSpending:totalSpending,interestModelWithholding:totalInterestTax});
}
writeFileSync('balance-validation.json',JSON.stringify({method:'Same 2003-01 start, 1.4bn KRW, age 28, fixed incident seed, death 75. Initial asset choice held without automatic reinvestment. Lowest-cost available event choices. Synthetic price/wage/cost models, not actual historical returns. Comparing two combined models does not isolate causality.',rows},null,2)+'\n');
for(const r of rows)console.log(`${r.model} | ${r.asset} | nominal ${(r.nominalNetWorth/1e8).toFixed(1)}억 | start purchasing power ${(r.startPurchasingPowerNetWorth/1e8).toFixed(1)}억`);
