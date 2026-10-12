// Ordinary resident bank-interest withholding; product rates remain fictional.
const monthOK=m=>typeof m==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(m)&&m>='2002-12';
const idx=m=>Number(m.slice(0,4))*12+Number(m.slice(5))-1;
export function interestTaxQuote(s,gross,month=s.month){
 if(!Number.isSafeInteger(gross)||gross<0||gross>1e15||!monthOK(month))throw Error('이자 계산 자료를 확인해 주세요.');
 if(!s.interestTax){const total=s.household?Math.round(gross*.15):0;return {month,gross,national:0,local:0,total,net:gross-total,rate:null,mode:'legacy'};}
 const rate=month<'2005-01'?1500:1400;
 // Won-floor is an explicit simplified game convention, not bank rounding.
 const national=Number(BigInt(gross)*BigInt(rate)/10000n),local=Number(BigInt(national)/10n),total=national+local;
 return {month,gross,national,local,total,net:gross-total,rate:rate/100,mode:month>'2026-10'?'future-assumption':'ordinary'};
}
export function canEnableInterestTax(s){return !s.interestTax&&!s.pending&&!s.ended;}
export function enableInterestTax(s){
 if(!canEnableInterestTax(s))throw Error('현재 선택을 마친 진행 중인 삶에서 연결해 주세요.');
 initializeInterestTax(s);s.log.push({id:s.log.length+1,month:s.month,type:'action',title:'예금 이자 공제 연결',text:'다음 진행 월부터 일반과세 원천징수 모형을 적용합니다. 기존 자산·공제·장부는 다시 계산하지 않습니다.'});return s;
}
export function initializeInterestTax(s){s.interestTax={version:1,activatedMonth:s.month,rows:[]};}
export function recordInterestTax(s,q){if(!s.interestTax)return;const rows=s.interestTax.rows;if(q.month<=s.interestTax.activatedMonth||rows.at(-1)?.month>=q.month)throw Error('중복 이자 기록입니다.');rows.push({...q});}
export function validInterestTax(s){
 if(s.interestTax===undefined)return true;
 try{const t=s.interestTax;if(!t||t.version!==1||!monthOK(t.activatedMonth)||t.activatedMonth<s.start||t.activatedMonth>s.month||!Array.isArray(t.rows)||t.rows.length!==idx(s.month)-idx(t.activatedMonth))return false;
 return t.rows.every((r,i)=>{if(!r||!monthOK(r.month)||idx(r.month)!==idx(t.activatedMonth)+i+1)return false;const q=interestTaxQuote(s,r.gross,r.month);return Object.keys(q).every(k=>r[k]===q[k]);});}catch{return false;}
}
export function annualInterestRows(s){const result=new Map();for(const r of s.interestTax?.rows||[]){const year=r.month.slice(0,4);if(!result.has(year))result.set(year,{year,months:0,gross:0,total:0,net:0});const y=result.get(year);y.months++;for(const k of ['gross','total','net'])y[k]+=r[k];}for(const c of s.termDeposits?.contracts||[]){const r=c.settlement;if(!r)continue;const year=r.month.slice(0,4);if(!result.has(year))result.set(year,{year,months:0,gross:0,total:0,net:0});const y=result.get(year);for(const k of ['gross','total','net'])y[k]+=r[k];y.termSettlements=(y.termSettlements||0)+1;}return [...result.values()].sort((a,b)=>a.year.localeCompare(b.year));}
