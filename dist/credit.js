// Contract mechanics are explicit. Rates/limits are an opt-in educational model,
// NOT historical Korean bank products, DSR regulations or lending approval.
const index=m=>Number(m.slice(0,4))*12+Number(m.slice(5))-1;
const age=s=>s.startAge+Math.floor((index(s.month)-index(s.start))/12);
const round=Math.round;
export function loanLiability(s){return (s.credit?.contracts||[]).reduce((n,c)=>n+c.balance+c.arrearsInterest,0);}
export function livingShortfall(s){return Math.max(0,round(s.debt-loanLiability(s)));}
export function loanDue(s){return (s.credit?.contracts||[]).reduce((n,c)=>n+due(c).total,0);}
function due(c){const interest=round(c.balance*c.rate/12),principal=Math.min(c.balance,c.arrearsPrincipal+(c.paidMonths>=c.term?c.balance:Math.ceil(c.amount/c.term)));return {interest,principal,total:interest+c.arrearsInterest+principal};}
export function quoteLoan(s,amount,term,earned){
 const rate=Math.max(.03,Math.min(.15,(s.market?.deposit||.025)+.04));
 const limit=Math.min(100000000,Math.max(0,round(earned*12*.8)));
 const firstPrincipal=Math.ceil(amount/term),firstInterest=round(amount*rate/12);
 const payment=firstPrincipal+firstInterest,capacity=Math.max(0,round(earned*.3-loanDue(s)));
 let reason='';if(s.ended||age(s)<19)reason='대출은 진행 중인 성인 삶에서만 신청할 수 있어요.';
 else if(!Number.isSafeInteger(amount)||amount<1000000||amount>100000000||![12,24,36,60].includes(term))reason='금액은 100만~1억 원, 기간은 12·24·36·60개월 중 선택하세요.';
 else if(!Number.isFinite(earned)||earned<=0)reason='급여 또는 가게의 양수 소득이 필요합니다.';
 else if(livingShortfall(s)>0||(s.credit?.contracts||[]).some(c=>c.arrearsInterest>0||c.arrearsPrincipal>0))reason='생활비 부족분 또는 연체를 먼저 정리해 주세요.';
 else if((s.credit?.contracts||[]).filter(c=>c.balance+c.arrearsInterest>0).length>=3)reason='이 모형에서는 진행 중인 대출을 3건까지 관리합니다.';
 else if((s.credit?.contracts||[]).some(c=>c.month===s.month))reason='이 모형의 신규 대출은 한 달에 한 건입니다.';
 else if(amount+loanLiability(s)>limit)reason='모형의 소득 기반 원금 한도를 초과합니다.';
 else if(payment>capacity)reason='첫 달 원리금이 모형의 소득 대비 상환 여력을 초과합니다.';
 return {amount,term,rate,firstPrincipal,firstInterest,payment,capacity,limit,disabled:Boolean(reason),reason};
}
export function borrow(s,amount,term,earned,consent=false){
 if(consent!==true)throw Error('실제 은행상품이 아닌 교육용 조건임을 확인해 주세요.');
 const q=quoteLoan(s,amount,term,earned);if(q.disabled)throw Error(q.reason);
 s.credit??={version:1,nextId:1,contracts:[]};const id='loan-'+s.credit.nextId++;
 s.credit.contracts.push({id,month:s.month,amount,balance:amount,rate:q.rate,term,paidMonths:0,arrearsPrincipal:0,arrearsInterest:0,totalInterest:0,totalPaid:0,consent:true});
 s.cash+=amount;s.debt+=amount;
 s.log.push({id:s.log.length+1,month:s.month,type:'action',title:'교육용 신용대출 계약 확정',text:`${amount.toLocaleString('ko-KR')}원, ${term}개월, 고정 연 ${(q.rate*100).toFixed(2)}%, 원금균등상환. 현금과 부채가 함께 증가합니다. 실제 당시 은행 조건·법정 심사·신용평점·세금은 미연결입니다.`});
 return q;
}
export function stepCredit(s){
 const flow={interestIncurred:0,interestPaid:0,principalPaid:0,due:0};
 for(const c of s.credit?.contracts||[]){if(c.balance+c.arrearsInterest<=0||c.month>=s.month)continue;
  const d=due(c);flow.due+=d.total;flow.interestIncurred+=d.interest;
  let available=Math.max(0,s.cash),paidInterest=Math.min(available,c.arrearsInterest+d.interest);
  const paidOld=Math.min(c.arrearsInterest,paidInterest),paidNew=paidInterest-paidOld;
  c.arrearsInterest=c.arrearsInterest-paidOld+d.interest-paidNew;
  s.debt+=d.interest-paidNew-paidOld;s.cash-=paidInterest;available-=paidInterest;
  const principal=Math.min(available,d.principal);s.cash-=principal;s.debt-=principal;c.balance-=principal;
  c.arrearsPrincipal=Math.max(0,d.principal-principal);c.paidMonths=Math.min(c.term,c.paidMonths+1);c.totalInterest+=d.interest;c.totalPaid+=principal+paidInterest;
  flow.interestPaid+=paidInterest;flow.principalPaid+=principal;
  if(principal+paidInterest>0)s.log.push({id:s.log.length+1,month:s.month,type:'action',title:'대출 원리금 납부',text:`${c.id} · 원금 ${principal.toLocaleString('ko-KR')}원 / 이자 ${paidInterest.toLocaleString('ko-KR')}원. 미납 원금 ${c.arrearsPrincipal.toLocaleString('ko-KR')}원 / 미납 이자 ${c.arrearsInterest.toLocaleString('ko-KR')}원.`});
 }
 return flow;
}
export function quotePrepayment(s,id,amount){const c=s.credit?.contracts.find(x=>x.id===id);let reason='';if(s.ended||age(s)<19||!c)reason='상환할 성인 삶의 진행 중인 계약을 확인해 주세요.';else if(!Number.isSafeInteger(amount)||amount<=0)reason='상환 금액은 양의 정수로 입력하세요.';else if(amount>s.cash)reason='현금이 부족합니다.';else if(amount>c.balance+c.arrearsInterest)reason='남은 원금과 미납 이자를 초과합니다.';const interest=c?Math.min(amount,c.arrearsInterest):0,principal=c?Math.min(c.balance,amount-interest):0;return {id,amount,interest,principal,fee:0,disabled:Boolean(reason),reason};}
export function prepay(s,id,amount){const q=quotePrepayment(s,id,amount);if(q.disabled)throw Error(q.reason);const c=s.credit.contracts.find(x=>x.id===id);s.cash-=q.amount;s.debt-=q.amount;c.arrearsInterest-=q.interest;c.balance-=q.principal;c.arrearsPrincipal=Math.min(c.arrearsPrincipal,c.balance);c.totalPaid+=q.amount;s.log.push({id:s.log.length+1,month:s.month,type:'action',title:'대출 추가 상환',text:`${id} · 원금 ${q.principal.toLocaleString('ko-KR')}원, 미납 이자 ${q.interest.toLocaleString('ko-KR')}원. 이 교육 모형은 중도상환수수료가 0원이며 실제 상품 조건이 아닙니다.`});return q;}
export function repayShortfall(s,amount){if(s.ended||age(s)<19||!Number.isSafeInteger(amount)||amount<=0||amount>s.cash||amount>livingShortfall(s))throw Error('생활비 부족분과 사용 가능한 현금 안에서 상환하세요.');s.cash-=amount;s.debt-=amount;s.log.push({id:s.log.length+1,month:s.month,type:'action',title:'생활비 부족분 상환',text:`${amount.toLocaleString('ko-KR')}원을 상환했습니다. 은행대출 원리금과 별도로 관리합니다.`});}
export function validCredit(s){const c=s.credit;if(c===undefined)return true;if(!c||c.version!==1||!Number.isInteger(c.nextId)||c.nextId<1||!Array.isArray(c.contracts)||c.contracts.length>1500||new Set(c.contracts.map(x=>x?.id)).size!==c.contracts.length||new Set(c.contracts.map(x=>x?.month)).size!==c.contracts.length)return false;
 if(!c.contracts.every(x=>x&&/^loan-[1-9]\d*$/.test(x.id)&&Number(x.id.slice(5))<c.nextId&&/^\d{4}-(0[1-9]|1[0-2])$/.test(x.month)&&x.month>=s.start&&x.month<=s.month&&x.consent===true&&Number.isSafeInteger(x.amount)&&x.amount>=1000000&&x.amount<=100000000&&[12,24,36,60].includes(x.term)&&Number.isInteger(x.paidMonths)&&x.paidMonths>=0&&x.paidMonths<=x.term&&Number.isFinite(x.rate)&&x.rate>=.03&&x.rate<=.15&&['balance','arrearsPrincipal','arrearsInterest','totalInterest','totalPaid'].every(k=>Number.isSafeInteger(x[k])&&x[k]>=0&&x[k]<=1e15)&&x.balance<=x.amount&&x.arrearsPrincipal<=x.balance&&x.totalPaid===x.amount-x.balance+x.totalInterest-x.arrearsInterest))return false;
 return loanLiability(s)<=s.debt;
}
export function moveReserve(s,side,amount){if(s.ended||age(s)<19||!['deposit','withdraw'].includes(side)||!Number.isSafeInteger(amount)||amount<=0||amount>1e12)throw Error('성인 삶에서 이동할 양의 정수 금액을 확인하세요.');const source=side==='deposit'?'cash':'deposit',target=side==='deposit'?'deposit':'cash';if(s[source]<amount)throw Error('이동할 잔액이 부족합니다.');s[source]-=amount;s[target]+=amount;s.log.push({id:s.log.length+1,month:s.month,type:'action',title:side==='deposit'?'예금잔액으로 이동':'예금잔액에서 인출',text:`${amount.toLocaleString('ko-KR')}원을 이동했습니다. 순자산은 유지됩니다. 실제 상품 계약이 아닌 기존 게임의 변동금리 잔액입니다.`});}
