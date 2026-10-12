import {termPrincipal} from './term-deposit.js';
// Read-only ordinary won-deposit limit comparison, not insurance-payment adjudication.
const money=n=>Number.isSafeInteger(n)&&n>=0&&n<=1e15;
export const PROTECTION_SOURCE='https://fsc.go.kr/po010101/84974';
export function protectionRule(month){
 if(typeof month!=='string'||!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)||month<'2002-12')return null;
 if(month>'2026-10')return null;
 return {month,limit:month<'2025-09'?50000000:100000000,effective:month<'2025-09'?'2001-01-01':'2025-09-01'};
}
export function protectionQuote(month,accounts){
 const rule=protectionRule(month);if(!rule)throw Error('이 시기의 보호 규칙은 미연결입니다.');
 if(!Array.isArray(accounts)||accounts.length>100)throw Error('비교 계좌를 확인해 주세요.');
 const grouped=new Map();let total=0;
 for(const a of accounts){if(!a||typeof a.company!=='string'||!a.company.trim()||a.company.length>80||!money(a.principal)||!money(a.interest))throw Error('금융회사·원금·이자 입력을 확인해 주세요.');
 const amount=a.principal+a.interest;total+=amount;if(!money(total)||!money(amount))throw Error('비교 금액이 너무 큽니다.');const company=a.company.trim();grouped.set(company,(grouped.get(company)||0)+amount);}
 const companies=[...grouped].map(([company,amount])=>({company,amount,within:Math.min(amount,rule.limit),excess:Math.max(0,amount-rule.limit)}));
 return {...rule,total,within:companies.reduce((n,x)=>n+x.within,0),excess:companies.reduce((n,x)=>n+x.excess,0),companies};
}
export function compareProtection(month,principal,interest,count){
 if(!money(principal)||!money(interest)||!money(principal+interest)||!Number.isInteger(count)||count<1||count>20)throw Error('금액과 금융회사 수(1~20)를 확인해 주세요.');
 const split=n=>Array.from({length:count},(_,i)=>Math.floor(n/count)+(i<n%count?1:0));const principals=split(principal),interests=split(interest);
 return {same:protectionQuote(month,principals.map((n,i)=>({company:'same',principal:n,interest:interests[i]}))),separate:protectionQuote(month,principals.map((n,i)=>({company:'company-'+i,principal:n,interest:interests[i]})))};
}
export function renderProtectionResult(q,{won}){return `<div class="protection-metrics"><div><span>비교 원금 + 가정한 소정의 이자</span><b>${won(q.total)}</b></div><div><span>기본 한도 안의 비교 금액</span><b>${won(q.within)}</b></div><div><span>기본 한도를 넘는 비교 금액</span><b>${won(q.excess)}</b></div></div>`;}
export function renderProtection(s,{won}){const rule=protectionRule(s.month);return `<details class="finance-help"><summary>예금자보호 · 한도와 분산 비교</summary>${rule?`<p>${s.month} 기준 1인·금융회사별 기본 한도 <b>${won(rule.limit)}</b>.</p><p>현재 예금잔액을 보호대상 일반 원화 예금으로 한 금융회사에 맡겼다고 가정합니다. 게임은 금융회사별 계좌를 아직 구분하지 않습니다.</p>${renderProtectionResult(protectionQuote(s.month,[{company:'game',principal:Math.round(s.deposit)+termPrincipal(s),interest:0}]),{won})}<p>위 점검은 변동금리 예금잔액과 활성 계약 원금을 합산하며 미지급 소정의 이자는 0원으로 가정합니다. 계약 미지급 이자를 포함하면 초과액이 더 커질 수 있습니다. 지급된 이자는 이미 현금에 들어갑니다. 현금·주식·달러·금은 이 예금 비교에 포함하지 않습니다.</p><button class="btn secondary small" data-protection-open="yes">금융회사 분산 비교해 보기</button>`:'<p>이 시기의 보호 한도는 미연결입니다. 미래 법령을 확정된 규칙으로 표시하지 않습니다.</p>'}<p>같은 금융회사의 여러 통장·지점은 합산합니다. 원금과 소정의 이자를 합한 한도이며 약정 이자 전액이 자동 보장된다는 뜻이 아닙니다. 보호대상 상품과 금융회사인지 먼저 확인해야 합니다.</p><p>한도 초과액이 곧 손실액은 아닙니다. 실제 보험금 지급액·채무 상계·지급 시기·초과액 회수·별도 보호상품은 재현하지 않습니다. 금융기관 파산이나 손실 확률을 임의로 만들지 않습니다.</p><a href="${PROTECTION_SOURCE}" target="_blank" rel="noopener noreferrer">금융위원회 · 보호 한도 변경과 Q&amp;A ↗</a></details>`;}

export function reserveProtectionPreview(s,side,amount,{won}){if(!['deposit','withdraw'].includes(side)||!money(amount)||amount===0)throw Error('이동할 양의 정수 금액을 확인해 주세요.');const source=side==='deposit'?s.cash:s.deposit;if(amount>source)throw Error('이동할 잔액이 부족합니다.');const balance=Math.round(s.deposit+(side==='deposit'?amount:-amount));if(!money(balance))throw Error('이동 후 금액을 확인해 주세요.');if(!protectionRule(s.month))return `<p>이동 후 예금잔액 ${won(balance)}. 이 시기의 보호 한도는 미연결입니다.</p>`;const q=protectionQuote(s.month,[{company:'game',principal:balance+termPrincipal(s),interest:0}]);return `<p>이동 후 예금잔액 <b>${won(balance)}</b>. 활성 계약 원금도 합산해 한 금융회사·미지급 소정의 이자 0원으로 점검합니다.</p>${renderProtectionResult(q,{won})}<p>한도 초과액은 확정 손실액이 아닙니다. 실제 상품 가입이나 예금보험 지급액을 확정하지 않습니다.</p>`;}
