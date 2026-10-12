import {interestTaxQuote} from './interest-tax.js';
import {ALL_HISTORY_EVENTS as MARKET_EVENTS} from './history-catalog.js';
import {eventsFor} from './market.js';
const idx=m=>Number(m.slice(0,4))*12+Number(m.slice(5))-1;
export const CONTEMPORARY_BRIEFS=[
 {date:'2008-07-15',title:'당시 공개 정보 · 금융 불안과 물가 부담',text:'연준 의회 증언은 신용 여건 악화와 에너지·원자재 가격 상승이 미국 경제와 가계 구매력을 압박한다고 설명했습니다. 이후 특정 금융기관의 결말은 아직 이 카드에 포함하지 않습니다.',source:'미 연준 의회 증언',url:'https://www.federalreserve.gov/newsevents/testimony/bernanke20080715a.htm'},
 {date:'2020-01-30',title:'당시 공개 정보 · 국제 공중보건 비상사태',text:'WHO는 신종 코로나바이러스 발생을 국제공중보건 비상사태로 선언했습니다. 이것은 당시의 결정이며 이후 팬데믹 평가나 주가 결과를 미리 알려주는 정보가 아닙니다.',source:'WHO 긴급위원회 성명',url:'https://www.who.int/news/item/30-01-2020-statement-on-the-second-meeting-of-the-international-health-regulations-(2005)-emergency-committee-regarding-the-outbreak-of-novel-coronavirus-(2019-ncov)'},
 {date:'2022-01-26',title:'당시 공개 정보 · 높은 물가와 통화정책 전망',text:'연준은 물가가 목표를 크게 웃돈다고 설명하며 금리 인상이 곧 적절해질 것으로 예상했습니다. 앞으로의 실제 인상 날짜와 폭은 이 카드에 공개하지 않습니다.',source:'미 연준 FOMC 성명',url:'https://www.federalreserve.gov/newsevents/pressreleases/monetary20220126a.htm'}
];
export function contemporaryBrief(month){return CONTEMPORARY_BRIEFS.findLast(b=>b.date.slice(0,7)<=month&&idx(month)-idx(b.date.slice(0,7))<=3)||null;}
export const CONCEPTS=[
 {id:'fx',name:'환율',text:'원/달러 환율이 높아지면 같은 달러의 원화 평가액은 커집니다. 수입품 부담과 수출기업 효과는 비용·계약·수요에 따라 달라집니다.',url:'https://www.bok.or.kr/portal/main/contents.do?menuNo=200407'},
 {id:'interest',name:'금리',text:'금리는 원금에 대한 이자의 비율입니다. 예금의 이자 수입과 자금 조달 비용에 영향을 줍니다. 정책금리와 내가 받는 예금금리는 같은 값이 아닙니다.',url:'https://www.bok.or.kr/portal/bbs/B0000216/view.do?menuNo=200134&nttId=10061677'},
 {id:'real',name:'실질 구매력',text:'돈의 액수가 같아도 물가가 오르면 살 수 있는 양은 줄어듭니다. 예금도 이자율만 보지 않고 물가 상승을 함께 비교해야 합니다.',url:'https://www.bok.or.kr/portal/bbs/B0000369/view.do?menuNo=201303&nttId=10081805'},
 {id:'liquidity',name:'유동성과 안전망',text:'생활비에 쓸 현금과 바로 바꿀 수 있는 자산을 구분해 봅니다. 평가액이 크더라도 당장 지출에 사용할 돈이 부족할 수 있습니다.',url:null},
 {id:'diversity',name:'자산 비교와 위험',text:'여러 자산은 같은 사건에 서로 다르게 반응할 수 있습니다. 분산해도 손실이 없어지는 것은 아닙니다. 게임의 단순 비교는 실제 투자 판단을 대신하지 않습니다.',url:null},
 {id:'policy',name:'정책과 경제 경로',text:'정책 발표, 실제 집행, 경제 성과는 구분해야 합니다. 정부 방향 외에도 세계 경기·금융 환경·기업과 가계의 선택이 결과에 영향을 줍니다.',url:null}
];
const CHOICES=[{id:'cashflow',title:'생활비와 안전망부터 확인',detail:'현금·예금으로 버틸 수 있는 기간을 살펴본다.'},{id:'exposure',title:'환율과 자산 구성을 확인',detail:'달러·금·주식이 어떤 변화를 받을지 생각한다.'},{id:'household',title:'가족의 소비와 일부터 확인',detail:'물가·일자리·사업과 생활비의 연결을 살펴본다.'}];
export const studyChoices=()=>CHOICES;
export function initializeLearning(s){if(s.learning)return;s.learning={version:1,prepared:[],entries:[],concepts:[],before:null,comparison:{start:s.month,budget:s.initial,deposit:s.initial,usdUnits:s.initial/(1.004*s.market.prices.usd),indexUnits:s.initial/(1.002*s.market.prices.index),months:0}};}
export function prepareStudy(s,month){
 if(!s.learning||s.pending||s.ended||s.learning.prepared.includes(month)||month>s.endAt)return false;
 const event=eventsFor(month,s.market?.model,s.market?.historyEdition).find(e=>!e.future);
 if(!event)return false;
 // Educational scenario, not a quote from a historical newspaper or future fact.
 s.pending={id:'study-before-'+month,kind:'history-study',category:'경제사 학습',stage:'before',target:month,title:'결과를 보기 전, 무엇부터 살펴볼까?',text:'다음 학습 장면으로 넘어가기 전에 판단의 기준을 골라 보세요. 미래 사건의 이름과 가격은 아직 공개하지 않습니다. 이 카드는 당시 신문을 재현한 것이 아닌 교육용 상황입니다.'};
 return true;
}
export function resolveStudyPreparation(s,id){const choice=CHOICES.find(c=>c.id===id);if(!choice||s.pending?.kind!=='history-study'||s.pending.stage!=='before')throw Error('현재 학습 선택을 확인해 주세요.');const target=s.pending.target;s.learning.prepared.push(target);s.learning.before={month:target,choice:id,prices:{...s.market.prices},cash:s.cash,deposit:s.deposit};s.log.push({id:s.log.length+1,month:s.month,type:'choice',title:choice.title,text:'교육용 준비 선택. 자산은 자동 매매하지 않습니다. 성인은 자산 시장에서 직접 조정한 뒤 시간을 진행할 수 있습니다.'});s.pending=null;}
function conceptsFor(e){return e.concepts|| (e.policy?['policy','real']:e.id.includes('hike')||e.id.includes('cut')||e.id.includes('zero')?['interest','real','fx']:['fx','liquidity','diversity']);}
export function studyAfter(s,event){if(!s.learning||!event?.economicId)return event;const e=MARKET_EVENTS.find(x=>x.id===event.economicId);if(!e)return event;return {...event,kind:'history-study',stage:'after',title:e.title,text:e.text};}
export function resolveStudyAfter(s,id){
 if(s.pending?.kind!=='history-study'||s.pending.stage!=='after'||!['understood','review'].includes(id))throw Error('현재 역사 해설을 확인해 주세요.');
 const e=MARKET_EVENTS.find(x=>x.id===s.pending.economicId),concepts=conceptsFor(e);
 if(!s.learning.entries.some(x=>x.id===e.id))s.learning.entries.push({id:e.id,month:s.month,choice:s.learning.before?.month===s.month?s.learning.before.choice:null,reflection:id,concepts});
 s.learning.concepts=[...new Set([...s.learning.concepts,...concepts])];
 s.log.push({id:s.log.length+1,month:s.month,type:'choice',title:id==='review'?'개념을 다시 살펴보기':'경제사의 한 장면을 기록했다',text:e.title+' · '+concepts.map(id=>CONCEPTS.find(c=>c.id===id).name).join(' / ')+'. 금전 보상과 정답 점수는 없습니다.'});
 return e.id;
}
export function stepLearning(s){if(!s.learning)return;const c=s.learning.comparison;if(s.interestTax)c.deposit+=interestTaxQuote(s,Math.round(c.deposit*s.market.deposit/12)).net;else c.deposit*=1+s.market.deposit/12;c.months++;}
export function comparisonRows(s){if(!s.learning)return [];const c=s.learning.comparison;return [{name:'원화 현금',value:c.budget,risk:'명목 액수 유지 · 물가 위험'},{name:'원화 예금',value:c.deposit,risk:'월 복리 재투자 가정 · '+(s.interestTax?'연결 이후 공제 반영 · ':'기존 세전 비교 · ')+'금리·물가 위험'},{name:'달러',value:c.usdUnits*s.market.prices.usd*(1-.004),risk:'매수·현재 전량 매도 수수료 반영 · 환율 위험'},{name:'분산 가상 주식',value:c.indexUnits*s.market.prices.index*(1-.002),risk:'매수·현재 전량 매도 수수료 반영 · 가격 위험'}].map(x=>({...x,change:x.value-c.budget,real:x.value/s.cpi}));}
export function learningPath(s){if(!s.learning)return [];return s.learning.entries.map(x=>({...x,event:MARKET_EVENTS.find(e=>e.id===x.id)}));}
export function validLearning(s){
 const l=s.learning;if(l===undefined)return true;if(!l||l.version!==1||!s.market||!Array.isArray(l.prepared)||!Array.isArray(l.entries)||!Array.isArray(l.concepts))return false;
 if(l.prepared.length>1500||new Set(l.prepared).size!==l.prepared.length||!l.prepared.every(m=>typeof m==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(m)&&m>=s.start&&m<=s.endAt))return false;
 if(l.entries.length>MARKET_EVENTS.length||new Set(l.entries.map(x=>x?.id)).size!==l.entries.length||!l.entries.every(x=>x&&MARKET_EVENTS.some(e=>e.id===x.id&&e.month===x.month)&&x.month>=s.start&&x.month<=s.month&&['understood','review'].includes(x.reflection)&&(x.choice===null||CHOICES.some(c=>c.id===x.choice))&&Array.isArray(x.concepts)&&x.concepts.every(id=>CONCEPTS.some(c=>c.id===id))))return false;
 if(!l.concepts.every(id=>CONCEPTS.some(c=>c.id===id)))return false;
 const c=l.comparison;if(!c||c.start!==s.start||c.budget!==s.initial||!['budget','deposit','usdUnits','indexUnits','months'].every(k=>Number.isFinite(c[k])&&c[k]>=0&&c[k]<=1e15)||c.months!==idx(s.month)-idx(s.start))return false;
 if(l.before!==null&&(!l.before||!l.prepared.includes(l.before.month)||!CHOICES.some(c=>c.id===l.before.choice)))return false;
 if(s.pending?.kind==='history-study'){const p=s.pending;if(p.stage==='before'){if(p.target!==`${Math.floor((idx(s.month)+1)/12)}-${String((idx(s.month)+1)%12+1).padStart(2,'0')}`||!eventsFor(p.target,s.market?.model,s.market?.historyEdition).some(e=>!e.future)||l.prepared.includes(p.target))return false;}else if(p.stage==='after'){if(!s.market.notices.includes(p.economicId)||!MARKET_EVENTS.some(e=>e.id===p.economicId))return false;}else return false;}
 return true;
}
