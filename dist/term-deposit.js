import {interestTaxQuote} from './interest-tax.js';
const idx=m=>Number(m.slice(0,4))*12+Number(m.slice(5))-1;
const at=i=>`${Math.floor(i/12)}-${String(i%12+1).padStart(2,'0')}`;
const validMonth=m=>typeof m==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(m)&&m>='2002-12';
const log=(s,title,text)=>s.log.push({id:s.log.length+1,month:s.month,type:'action',title,text});
export const TERM_PERIODS=[3,6,12,24];
export const canUseTermDeposits=s=>!s.ended&&!s.pending&&Boolean(s.interestTax)&&s.startAge+Math.floor((idx(s.month)-idx(s.start))/12)>=19;
export const termPrincipal=s=>(s.termDeposits?.contracts||[]).filter(c=>c.status==='active').reduce((n,c)=>n+c.amount,0);
export function termPayout(s,c,month=s.month){
 if(!validMonth(month)||month<c.month)throw Error('정산 월을 확인해 주세요.');
 const elapsed=Math.min(c.term,idx(month)-idx(c.month)),mature=elapsed===c.term,rateBP=mature?c.rateBP:c.earlyRateBP;
 const buckets=new Map();let previous=0;
 for(let i=1;i<=elapsed;i++){const accrual=at(idx(c.month)+i),cumulative=Number(BigInt(c.amount)*BigInt(rateBP)*BigInt(i)/120000n),gross=cumulative-previous;previous=cumulative;const vintage=accrual<'2005-01'?'2004-12':accrual>'2026-10'?'2026-11':'2005-01';buckets.set(vintage,(buckets.get(vintage)||0)+gross);}
 let national=0,local=0;for(const [vintage,gross] of buckets){const q=interestTaxQuote(s,gross,vintage);national+=q.national;local+=q.local;}
 const total=national+local;return {month,elapsed,kind:mature?'matured':'early',gross:previous,national,local,total,net:previous-total,principal:c.amount,payout:c.amount+previous-total};
}
export function quoteTermDeposit(s,amount,term,rate){
 if(!canUseTermDeposits(s))throw Error('현재 선택을 마친 성인 삶에서 이자 공제를 연결한 뒤 가입해 주세요.');
 if(!Number.isSafeInteger(amount)||amount<1000000||amount>1e12||amount>s.cash||!TERM_PERIODS.includes(term)||!Number.isFinite(rate)||rate<0||rate>.15)throw Error('금액·기간·현금 잔액을 확인해 주세요.');
 if((s.termDeposits?.contracts||[]).filter(c=>c.status==='active').length>=20||(s.termDeposits?.contracts.length||0)>=1000)throw Error('교육용 계약 관리 한도에 도달했습니다.');
 const rateBP=Math.round(rate*10000);if(rateBP<0||rateBP>1500)throw Error('모형 금리를 확인해 주세요.');
 const c={month:s.month,amount,term,rateBP,earlyRateBP:Math.min(rateBP,10),maturity:at(idx(s.month)+term),status:'active',consent:true};return {...c,expected:termPayout(s,c,c.maturity)};
}
export function openTermDeposit(s,amount,term,rate,consent){if(consent!==true)throw Error('교육용 계약 조건을 먼저 확인해 주세요.');const q=quoteTermDeposit(s,amount,term,rate);if(!s.termDeposits)s.termDeposits={version:1,nextId:1,contracts:[]};const {expected,...base}=q,c={...base,id:'term-'+s.termDeposits.nextId++};s.cash-=amount;s.termDeposits.contracts.push(c);log(s,'계약형 예금 모형 가입',`${amount.toLocaleString('ko-KR')}원 · 연 ${(c.rateBP/100).toFixed(2)}% 고정 · ${term}개월 · ${c.maturity} 자동 만기 수령. 기존 변동금리 잔액과 별도입니다.`);return c;}
function settle(s,c){const q=termPayout(s,c);c.status=q.kind;c.settlement=q;s.cash+=q.payout;log(s,q.kind==='matured'?'계약형 예금 만기 수령':'계약형 예금 중도해지',`${c.id} · 원금 ${q.principal.toLocaleString('ko-KR')}원 · 세전 이자 ${q.gross.toLocaleString('ko-KR')}원 · 공제 ${q.total.toLocaleString('ko-KR')}원 · 입금 ${q.payout.toLocaleString('ko-KR')}원. 교육용 월 단위 계약 계산입니다.`);return q;}
export function closeTermDeposit(s,id){const c=s.termDeposits?.contracts.find(c=>c.id===id);if(!canUseTermDeposits(s)||!c||c.status!=='active')throw Error('진행 중인 계약과 현재 선택을 확인해 주세요.');return settle(s,c);}
export function stepTermDeposits(s){const result={gross:0,net:0,national:0,local:0,principal:0};for(const c of s.termDeposits?.contracts||[]){if(c.status!=='active'||c.maturity>s.month)continue;const q=settle(s,c);for(const k of Object.keys(result))result[k]+=q[k];}return result;}
export function nextTermIncome(s,month){return (s.termDeposits?.contracts||[]).filter(c=>c.status==='active'&&c.maturity===month).reduce((n,c)=>n+termPayout(s,c,month).net,0);}
export function validTermDeposits(s){try{const t=s.termDeposits;if(t===undefined)return true;if(!s.interestTax||!t||t.version!==1||!Number.isInteger(t.nextId)||!Array.isArray(t.contracts)||t.contracts.length>1000||t.nextId!==t.contracts.length+1||t.contracts.filter(c=>c?.status==='active').length>20)return false;
 return t.contracts.every((c,i)=>{if(!c||c.id!=='term-'+(i+1)||!validMonth(c.month)||c.month<s.start||c.month<s.interestTax.activatedMonth||c.month>s.month||!TERM_PERIODS.includes(c.term)||!Number.isSafeInteger(c.amount)||c.amount<1000000||c.amount>1e12||!Number.isInteger(c.rateBP)||c.rateBP<0||c.rateBP>1500||c.earlyRateBP!==Math.min(c.rateBP,10)||c.maturity!==at(idx(c.month)+c.term)||c.consent!==true)return false;if(c.status==='active')return c.settlement===undefined&&c.maturity>s.month;if(!['matured','early'].includes(c.status)||!c.settlement||c.settlement.month>s.month)return false;const q=termPayout(s,c,c.settlement.month);return q.kind===c.status&&Object.keys(q).every(k=>c.settlement[k]===q[k]);});}catch{return false;}}
