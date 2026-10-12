import {jobTransition,insuranceBenefit,recordInsuranceBenefit} from './household.js';
import {riskRow,annualToMonthly,statisticalAge,deterministicRiskRoll} from './risk-statistics.js';
import {livingShortfall,loanDue} from './credit.js';
const idx=m=>Number(m.slice(0,4))*12+Number(m.slice(5))-1;
const clamp=n=>Math.max(0,Math.min(100,n));
const hash=t=>{let h=2166136261;for(const c of String(t))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0)/4294967295;};
export const INCIDENTS={
 illness:{title:'가상 입원비가 발생했습니다',text:'가계 모형의 의료비 연습 상황입니다. 실제 입원 확률이나 치료비 통계가 아닙니다. 민간보험 모형을 보유했다면 가정한 보장액을 비용에서 차감합니다.'},
 fraud:{title:'거래 뒤 사기 피해를 확인했습니다',text:'사기 피해 경험을 재현한 장면입니다. 모형 손실액은 이미 현금에서 반영했습니다. 지금 선택은 피해 이후의 대응이며, 신고가 환급이나 처벌을 보장하지 않습니다.'},
 repair:{title:'갑작스러운 수리비',text:'생활에 쓰던 물건에 수리가 필요합니다. 자산 보유 상황에 맞춘 가상 사건이며 실제 사고 통계가 아닙니다.'},
 job:{title:'고용이 흔들리는 달',text:'근로 계약이 종료되는 가상 상황입니다. 대응을 확정하면 급여가 중단되고 3개월의 재취업 준비 기간을 둡니다. 실제 실업·구직 확률이 아닙니다.'},
 scam:{title:'확정 수익을 약속하는 제안',text:'지인이 높은 수익을 보장하며 서류 확인 전에 송금을 권합니다. 검증·거절·송금 중 결정하세요. 실제 인물이나 사건이 아닌 학습 시나리오입니다.'},
 dispute:{title:'가게 계약을 둘러싼 분쟁',text:'거래 상대와 계약 해석이 달라 해결 비용을 선택하는 가상 상황입니다. 고소만으로 유죄·벌금이 확정되는 설정은 아닙니다. 비용과 결과는 법률 예측이 아닙니다.'},
 refund:{title:'예상하지 못한 환급',text:'이전 생활 지출의 일부가 반환되는 가상 상황입니다. 실제 세금 환급 계산은 아닙니다.'}
};
export function initializeRules(s,difficulty='normal',seed){if(seed!==undefined&&(!Number.isInteger(seed)||seed<0||seed>2147483647))throw Error('사건 시드를 확인해 주세요.');if(!['normal','hard'].includes(difficulty))throw Error('난이도를 확인해 주세요.');s.rules={version:1,difficulty,seed:seed??Math.floor(Math.random()*2147483647),lastRiskMonth:null,queue:null,incidents:[],confirmed:[],achievements:[],hardshipPeak:0,recoveryMonths:0,trackedMonth:s.month,statistics:{version:1,lastDrawMonth:null,seenYears:[],backlog:[]}};}
export function queueStatisticalFraud(s){const r=s.rules,t=r?.statistics;if(!t||t.lastDrawMonth===s.month)return;t.lastDrawMonth=s.month;const year=Number(s.month.slice(0,4)),years=statisticalAge(s),row=riskRow(year,years);if(!row||years<19||t.seenYears.includes(year))return;const rate=annualToMonthly(row.annualPercent/100);if(deterministicRiskRoll(r.seed,s.month,'fraud')>=rate)return;
 const loss=Math.max(0,Math.min(s.cash,Math.round(s.cash*(r.difficulty==='hard'?.2:.1)),Math.round((r.difficulty==='hard'?10000000:5000000)*s.cpi)));s.cash-=loss;if(s.lastFlow){s.lastFlow.incidentLoss=(s.lastFlow.incidentLoss||0)+loss;s.lastFlow.net-=loss;}
 const event={id:'risk-'+s.month+'-fraud',kind:'risk',category:'통계 기반 · 사후 재현',type:'fraud',cost:0,loss,statMonth:s.month,statAge:years,statisticId:row.id,title:INCIDENTS.fraud.title,text:INCIDENTS.fraud.text+' 모형 손실 '+loss.toLocaleString('ko-KR')+'원. 손실액은 실제 피해액 통계가 아닙니다.'};
 t.seenYears.push(year);r.incidents.push({id:event.id,month:s.month,type:'fraud',fortune:-1,resolved:false,choice:null,statAge:years,statisticId:row.id,loss});if(r.queue)t.backlog.push(event);else r.queue=event;
 s.log.push({id:s.log.length+1,month:s.month,type:'event',title:event.title,text:row.year+'년 '+row.ageBand+' 연간 사기 피해 경험률 '+row.annualPercent.toFixed(1)+'%를 월 독립·동일 위험 가정으로 환산. 사후 조사 자료로 재현. 모형 현금 손실 '+loss.toLocaleString('ko-KR')+'원. 피해액·회복은 게임 가정.'});
}
export function queueRisk(s){const r=s.rules;if(!r||s.ended||statisticalAge(s)<19)return;if(r.statistics)queueStatisticalFraud(s);
 if(r.queue)return;
 if(r.statistics&&r.difficulty==='normal'){if(s.household&&(!r.lastRiskMonth||idx(s.month)-idx(r.lastRiskMonth)>=6)&&deterministicRiskRoll(r.seed,s.month,'medical-practice')<.005){const cost=Math.min(100000000,Math.max(10000,Math.round(5000000*s.cpi))),event={id:'risk-'+s.month,kind:'risk',category:'가상 의료비 연습 · 실제 발생률 미연결',type:'illness',cost,title:INCIDENTS.illness.title,text:INCIDENTS.illness.text};r.queue=event;r.lastRiskMonth=s.month;r.incidents.push({id:event.id,month:s.month,type:'illness',fortune:-1,resolved:false,choice:null});}return;}
 if(r.lastRiskMonth&&idx(s.month)-idx(r.lastRiskMonth)<6)return;
 const roll=hash(r.seed+':'+s.month),chance=r.difficulty==='hard'?.08:.01;
 if(roll>=chance&&roll<.985)return;
 const types=['repair',...(s.household?['illness']:[]),...(!r.statistics?['scam']:[]),...(s.job?['job']:[]),...(s.business?['dispute']:[])],type=roll>=.985?'refund':types[Math.floor(hash(s.month+':'+r.seed+'kind')*types.length)];
 const factor=s.cpi,base=type==='illness'?5000000:type==='repair'?(s.car?1500000:s.home?2500000:350000):type==='job'?300000:type==='scam'?Math.min(5000000,Math.max(100000,Math.round(s.cash*.1))):type==='dispute'?1000000:200000;
 const cost=Math.min(100000000,Math.max(10000,Math.round(base*factor)));
 const event={id:'risk-'+s.month,kind:'risk',category:r.statistics?'가상 연습 사건 · 어려움':'가상 생활 사건',type,cost,title:INCIDENTS[type].title,text:INCIDENTS[type].text};r.queue=event;r.lastRiskMonth=s.month;r.incidents.push({id:event.id,month:s.month,type,fortune:type==='refund'?1:-1,resolved:false,choice:null});
}
export function riskChoices(s){const p=s.pending;if(p?.kind!=='risk')return [];const cost=p.cost;
 switch(p.type){
 case 'illness':return [['care','치료와 회복 계획',p.cost,0],['basic','기본 치료와 생활 조정',Math.round(p.cost*.6),4]].map(([id,title,gross,health])=>({id,title,gross,health,cost:gross-insuranceBenefit(s,gross),detail:'모형 의료비 '+gross.toLocaleString('ko-KR')+'원 · 보험 차감 '+insuranceBenefit(s,gross).toLocaleString('ko-KR')+'원'+(health?' · 건강 −'+health:'')}));
 case 'fraud':return [{id:'report',title:'거래 기록과 신고 자료 준비',detail:'추가 모형 비용 없음 · 만족 −3 · 손실 반영 완료 · 환급 보장 없음',cost:0},{id:'support',title:'주변에 알리고 생활 계획 정리',detail:'추가 모형 비용 없음 · 회복 지원 선택 · 만족 −2',cost:0},{id:'pause',title:'잠시 쉬며 지출부터 점검',detail:'추가 모형 비용 없음 · 만족 −5',cost:0}];
 case 'repair':return [{id:'repair',title:'제대로 수리하기',detail:'수리비 전액 · 생활 만족 유지',cost},{id:'temporary',title:'저렴한 임시 수리',detail:'수리비 절반 · 불편으로 만족 −4',cost:Math.round(cost/2)},{id:'wait',title:'당장은 사용을 멈추기',detail:'비용 없음 · 불편으로 만족 −8',cost:0}];
 case 'job':return [{id:'search',title:'재취업 준비에 집중',detail:'준비비 지출 · 3개월간 급여 중단',cost},{id:'budget',title:'생활비를 먼저 줄이기',detail:'기본 생활비 −10% · 3개월간 급여 중단 · 만족 −3',cost:0},{id:'rest',title:'당분간 쉬며 계획 세우기',detail:'비용 없음 · 급여 중단 · 3개월 뒤 직업 선택 가능',cost:0}];
 case 'scam':return [{id:'verify',title:'서류와 상대방부터 확인',detail:'비용 없음 · 송금 보류',cost:0},{id:'reject',title:'제안을 거절하기',detail:'비용 없음 · 송금하지 않음',cost:0},{id:'send',title:'설명을 믿고 송금하기',detail:'송금액 전액 손실로 끝나는 가상 시나리오',cost}];
 case 'dispute':return [{id:'advice',title:'자료를 정리하고 조정 진행',detail:'모형 해결비 전액 · 결과는 법률 예측 아님',cost},{id:'talk',title:'대화로 조정 시도',detail:'모형 해결비 60% · 만족 −3',cost:Math.round(cost*.6)},{id:'ignore',title:'대응하지 않고 미루기',detail:'모형 해결비 3배 · 만족 −6',cost:cost*3}];
 default:return [{id:'buffer',title:'생활 안전망에 남기기',detail:'가상 환급금 수령 · 현금 유지',cost:0},{id:'enjoy',title:'일부를 나를 위해 쓰기',detail:'환급금 절반 소비 · 만족 +3',cost:0}];
 }
}
export function resolveRisk(s,id){const p=s.pending,c=riskChoices(s).find(x=>x.id===id);if(!c)throw Error('위험 사건의 선택을 확인해 주세요.');
 const pay=c.cost;if(p.type==='illness'){recordInsuranceBenefit(s,c.gross);s.health=clamp(s.health-c.health);}if(pay>s.cash&&p.type==='scam')throw Error('송금할 현금이 부족합니다.');
 if(pay>s.cash){s.debt+=pay-s.cash;s.cash=0;}else s.cash-=pay;
 if(p.type==='fraud')s.happy-=id==='support'?2:id==='pause'?5:3;
 if(p.type==='repair')s.happy-=id==='temporary'?4:id==='wait'?8:0;
 if(p.type==='job'){jobTransition(s,false);s.rules.jobReadyAt=idx(s.month)+3;if(id==='budget'){s.living=Math.round(s.living*.9);s.happy-=3;}}
 if(p.type==='scam'&&id==='send')s.happy-=8;
 if(p.type==='dispute')s.happy-=id==='talk'?3:id==='ignore'?6:0;
 if(p.type==='refund'){s.cash+=p.cost;if(id==='enjoy'){s.cash-=Math.round(p.cost/2);s.happy+=3;}}
 s.happy=clamp(s.happy);const row=s.rules.incidents.find(x=>x.id===p.id);row.resolved=true;row.choice=id;s.rules.queue=s.rules.statistics?.backlog.shift()||null;
 s.log.push({id:s.log.length+1,month:s.month,type:'choice',title:c.title,text:`${p.title} · 비용 ${pay.toLocaleString('ko-KR')}원.${p.type==='refund'?' 가상 환급 '+p.cost.toLocaleString('ko-KR')+'원.':''} 부족분은 은행대출이 아닌 생활비 부족분으로 기록합니다. ${p.type==='fraud'?'발생률은 통계 기반의 월 환산이며, 손실액·회복 결과는 게임 가정입니다.':'확률·비용·결과는 게임 가정입니다.'}`});
}
export function trackLife(s,expense){const r=s.rules;if(!r)return;const shortfall=livingShortfall(s);r.hardshipPeak=Math.max(r.hardshipPeak,shortfall);if(r.trackedMonth!==s.month){r.recoveryMonths=shortfall===0&&r.hardshipPeak>0&&s.cash>=expense?Math.min(3,r.recoveryMonths+1):0;r.trackedMonth=s.month;}
 const add=(id,title)=>{if(!r.achievements.some(x=>x.id===id))r.achievements.push({id,title,month:s.month});};
 if(expense>0&&s.cash+s.deposit>=expense*6+loanDue(s)*6)add('buffer','6개월의 안전망');
 if(s.credit?.contracts.some(c=>c.balance+c.arrearsInterest===0))add('repaid','대출 한 건 완납');
 if(r.recoveryMonths>=3)add('recovery','부족분을 정리하고 다시 안정');
 if(r.incidents.some(x=>x.type==='scam'&&x.resolved&&['verify','reject'].includes(x.choice)))add('verified','송금 전에 멈춰 보기');
}
export function satisfaction(s){return s.happy<20?'불만족':s.happy<40?'아쉬움':s.happy<60?'보통':s.happy<80?'만족':'완전 만족';}
export function fortune(s){const list=s.rules?.incidents||[];if(!list.length)return {grade:'미집계',score:0,count:0};const score=list.reduce((n,x)=>n+x.fortune,0);return {grade:score>=3?'S':score>=1?'A':score===0?'B':score>=-2?'C':'D',score,count:list.length};}
export function validRules(s){const r=s.rules;if(r===undefined)return true;if(!r||r.version!==1||!['normal','hard'].includes(r.difficulty)||!Number.isInteger(r.seed)||r.seed<0||r.seed>2147483647)return false;
 if(!Array.isArray(r.confirmed)||r.confirmed.length>5000||new Set(r.confirmed.map(x=>x?.key)).size!==r.confirmed.length||!r.confirmed.every(x=>x&&typeof x.key==='string'&&typeof x.choice==='string'&&typeof x.title==='string'&&typeof x.month==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(x.month)&&x.month>=s.start&&x.month<=s.month))return false;
 if(!Array.isArray(r.incidents)||r.incidents.length>500||new Set(r.incidents.map(x=>x?.id)).size!==r.incidents.length||!r.incidents.every(x=>x&&INCIDENTS[x.type]&&typeof x.id==='string'&&typeof x.month==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(x.month)&&x.month>=s.start&&x.month<=s.month&&x.id==='risk-'+x.month+(x.type==='fraud'?'-fraud':'')&&x.fortune===(x.type==='refund'?1:-1)&&typeof x.resolved==='boolean'&&(x.choice===null||typeof x.choice==='string')))return false;
 if(r.queue&&(!INCIDENTS[r.queue.type]||r.queue.kind!=='risk'||!Number.isSafeInteger(r.queue.cost)||r.queue.cost<(r.queue.type==='fraud'?0:10000)||r.queue.cost>100000000||!r.incidents.some(x=>x.id===r.queue.id&&!x.resolved)))return false;
 if(s.pending?.kind==='risk'&&(!r.queue||s.pending.id!==r.queue.id||s.pending.type!==r.queue.type||s.pending.cost!==r.queue.cost))return false;
 if(r.lastRiskMonth!==null&&(typeof r.lastRiskMonth!=='string'||!/\d{4}-(0[1-9]|1[0-2])$/.test(r.lastRiskMonth)||r.lastRiskMonth>s.month))return false;
 if(!Array.isArray(r.achievements)||r.achievements.length>4||new Set(r.achievements.map(x=>x?.id)).size!==r.achievements.length||!r.achievements.every(x=>x&&['buffer','repaid','recovery','verified'].includes(x.id)&&typeof x.title==='string'&&typeof x.month==='string'))return false;
 if(r.statistics!==undefined){const t=r.statistics;if(!t||t.version!==1||!Array.isArray(t.seenYears)||t.seenYears.length>1||!t.seenYears.every(y=>y===2024)||new Set(t.seenYears).size!==t.seenYears.length||!Array.isArray(t.backlog)||t.backlog.length>1||t.lastDrawMonth!==null&&(typeof t.lastDrawMonth!=='string'||!/^\d{4}-(0[1-9]|1[0-2])$/.test(t.lastDrawMonth)||t.lastDrawMonth<s.start||t.lastDrawMonth>s.month))return false;
 const events=[r.queue,...t.backlog].filter(Boolean),fraudRows=r.incidents.filter(x=>x.type==='fraud');if(new Set(events.map(x=>x.id)).size!==events.length||fraudRows.length!==t.seenYears.length||fraudRows.some(x=>Number(x.month.slice(0,4))!==2024))return false;
 for(const ev of events.filter(x=>x.type==='fraud')){const row=riskRow(Number(ev.statMonth?.slice(0,4)),ev.statAge);if(!row||row.id!==ev.statisticId||ev.id!=='risk-'+ev.statMonth+'-fraud'||ev.statMonth<s.start||ev.statMonth>s.month||ev.statAge<19||ev.statAge!==s.startAge+Math.floor((idx(ev.statMonth)-idx(s.start))/12)||ev.cost!==0||!Number.isSafeInteger(ev.loss)||ev.loss<0||ev.loss>100000000||!fraudRows.some(x=>x.id===ev.id&&!x.resolved))return false;}
 if(t.backlog.some(x=>x.type!=='fraud'))return false;
 for(const x of fraudRows){const row=riskRow(Number(x.month.slice(0,4)),x.statAge);if(!row||row.id!==x.statisticId||x.statAge<19||x.statAge!==s.startAge+Math.floor((idx(x.month)-idx(s.start))/12)||!Number.isSafeInteger(x.loss)||x.loss<0||x.loss>100000000)return false;}
 if(s.pending?.type==='fraud'&&['loss','statAge','statMonth','statisticId'].some(k=>s.pending[k]!==r.queue[k]))return false;
 }else if(r.incidents.some(x=>x.type==='fraud'))return false;
 if(r.trackedMonth!==s.month)return false;
 if(r.luckFeeling!==undefined&&(!Number.isInteger(r.luckFeeling)||r.luckFeeling<0||r.luckFeeling>10))return false;
 if(r.comfortMonth!==undefined&&(typeof r.comfortMonth!=='string'||!/^\d{4}-(0[1-9]|1[0-2])$/.test(r.comfortMonth)||r.comfortMonth<s.start||r.comfortMonth>s.month))return false;
 return Number.isFinite(r.hardshipPeak)&&r.hardshipPeak>=0&&r.hardshipPeak<=1e15&&Number.isInteger(r.recoveryMonths)&&r.recoveryMonths>=0&&r.recoveryMonths<=3&&(r.jobReadyAt===undefined||Number.isInteger(r.jobReadyAt)&&r.jobReadyAt>=idx(s.start)&&r.jobReadyAt<=idx(s.endAt||'2026-10')+3);
}

export const COMFORT_CHOICES={reading:{title:'운세 이야기 듣기',cost:30000,happiness:2,feeling:1},ritual:{title:'굿으로 마음 다잡기',cost:500000,happiness:5,feeling:2}};
export function chooseComfort(s,id){const c=COMFORT_CHOICES[id],r=s.rules;if(!c||!r||s.ended||s.pending||s.startAge+Math.floor((idx(s.month)-idx(s.start))/12)<19)throw Error('현재는 이 생활 선택을 할 수 없습니다.');if(r.comfortMonth===s.month)throw Error('이달의 마음 다잡기 선택은 이미 확정했습니다.');if(s.cash<c.cost)throw Error('사용 가능한 현금이 부족합니다.');s.cash-=c.cost;s.happy=clamp(s.happy+c.happiness);r.luckFeeling=Math.min(10,(r.luckFeeling||0)+c.feeling);r.comfortMonth=s.month;s.log.push({id:s.log.length+1,month:s.month,type:'choice',title:c.title,text:`가상 소비 ${c.cost.toLocaleString('ko-KR')}원. 만족 +${c.happiness}, 운 체감 +${c.feeling}. 실제 서비스 가격이 아니며 사고·사기 확률과 시장 가격은 바뀌지 않습니다.`});}
