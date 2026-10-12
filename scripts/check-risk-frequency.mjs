import {writeFileSync} from 'node:fs';
import {RISK_AGE_ROWS} from '../dist/risk-statistics-data.js';
import {annualToMonthly,deterministicRiskRoll} from '../dist/risk-statistics.js';
const samples=40000,rows=[];
for(const r of RISK_AGE_ROWS.filter(r=>r.type==='fraud'&&r.minAge>=20)){
 let experienced=0;const p=r.annualPercent/100,q=annualToMonthly(p);
 for(let seed=0;seed<samples;seed++)for(let month=1;month<=12;month++){if(deterministicRiskRoll(seed,`2024-${String(month).padStart(2,'0')}`,'fraud')<q){experienced++;break;}}
 const observed=experienced/samples,tolerance=5*Math.sqrt(p*(1-p)/samples)+.0002;
 if(Math.abs(observed-p)>tolerance)throw Error(`${r.ageBand}: annual rate outside tolerance`);
 rows.push({ageBand:r.ageBand,annualReferencePercent:r.annualPercent,monthlyModelPercent:q*100,syntheticSeeds:samples,experienced,observedModelPercent:observed*100,absoluteTolerancePercent:tolerance*100});
}
const report={description:'Seeded first-experience sampler verification, not validation of Korean population risk or learning outcomes.',fullCalendarYear:true,constantAgeBand:true,oneFirstExperiencePerYear:true,model:'1-(1-p)^(1/12), monthly independent draws',rows};
writeFileSync('risk-frequency-validation.json',JSON.stringify(report,null,2)+'\n');
console.log(rows.map(r=>`${r.ageBand}: reference ${r.annualReferencePercent.toFixed(1)}%, synthetic ${r.observedModelPercent.toFixed(3)}% (${r.syntheticSeeds} seeds)`).join('\n'));
