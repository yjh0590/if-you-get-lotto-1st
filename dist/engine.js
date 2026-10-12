import {domesticConditions} from './korea-economy.js';
import {MARKET_EVENTS} from './market-data.js';
import {marketValue,marketRates,initializeMarket,stepMarket,economicEvent,acknowledgeEconomic,validMarket,trade,sellHalfThemes} from './market.js';
import {STORY_NODES,nextStory,storyChoices,resolveStory,onJobChange,onPurchaseStory,validStories,trackHomeSale,pruneStoryQueue} from './stories.js';
import {queueScene,validLifestyle} from './lifestyle.js';
import {SHOP_ITEMS,SHOP_BY_ID} from './shop-data.js';
import {moneyText} from './format.js';
import {VERSION,END,REGIONS,economy,HISTORIES,PERSONAL} from './data.js';
const clamp = n => Math.max(0,Math.min(100,n));
const round = n => Math.round(n);
export const monthIndex = m => Number(m.slice(0,4))*12+Number(m.slice(5,7))-1;
export function nextMonth(m){const i=monthIndex(m)+1;return `${Math.floor(i/12)}-${String(i%12+1).padStart(2,'0')}`;}
export function monthAt(index){return `${Math.floor(index/12)}-${String(index%12+1).padStart(2,'0')}`;}
export function endMonth(s){return s.endAt||END;}
export function sampleDeathAge(startAge,random=Math.random){
 let death=Math.max(75,startAge+1);
 while(death<100&&random()>=0.16)death++;
 return death;
}
export function simulationPhase(s){return s.month>END?'가상 미래':'과거 시뮬레이션';}
function finishLife(s){s.ended=true;s.pending=null;s.reason=`${age(s)}세, 이 삶의 마지막 장에 도착했습니다.`;note(s,'result','한 사람의 삶이 기록으로 남았다',`${s.startDate||s.start}부터 ${s.month}까지. 사망 시점은 실제 수명 예측이 아닌 게임 규칙입니다.`);}
export function worth(s){return round(marketValue(s)+s.cash+s.deposit+s.stocks+s.home+(s.vehicle?.value||0)+(s.collection||[]).reduce((sum,x)=>sum+x.value,0)-s.debt);}
export function age(s){return s.startAge+Math.floor((monthIndex(s.month)-monthIndex(s.start))/12);}
export function expenses(s){return round(s.living* s.cpi+(s.home?(s.homeMaintenance??150000)*s.cpi:s.rent*s.cpi)+(s.car?(s.vehicle?.maintenanceBase??200000)*s.cpi:0));}
export function gameEconomy(s){return {...economy(s.month),...(marketRates(s)||{})};}
export function businessValue(s){return s.business ? economy(s.month).businessGross*domesticConditions(s).revenueFactor*(economy(s.month).pandemic?(s.digital?0.8:0.55):1)-economy(s.month).businessCost : 0;}
export function income(s){return round((s.job?economy(s.month).wage:0)+businessValue(s)+s.deposit*gameEconomy(s).deposit/12);}
export function note(s,type,title,text){s.log.push({id:s.log.length+1,month:s.month,type,title,text});}
export function createGame(config){
 if(config.startMode!==undefined&&config.startMode!=='lottery')throw Error('시작 모드를 확인해 주세요.');
 const minimum='2002-12';
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(config.month)||config.month<minimum||config.month>END)throw Error('시작 시점을 확인해 주세요.');
 if(!Number.isFinite(config.net)||!Number.isFinite(config.gross)||config.net<=0||config.net>config.gross||config.gross>1e12)throw Error('수령액은 0원 초과, 세전 금액 이하여야 합니다.');
 if(!Number.isInteger(config.age)||config.age<19||config.age>80||!Object.hasOwn(REGIONS,config.region))throw Error('인물 설정을 확인해 주세요.');
 if(config.gender!==undefined&&!['male','female','unspecified'].includes(config.gender))throw Error('성별 설정을 확인해 주세요.');
 if(config.startDate!==undefined&&(typeof config.startDate!=='string'||config.startDate.slice(0,7)!==config.month||Number.isNaN(Date.parse(config.startDate+'T00:00:00Z'))))throw Error('추첨일을 확인해 주세요.');
 const eco=economy(config.month),region=REGIONS[config.region];
 const lifetime=config.lifetime===true;const deathAge=lifetime?sampleDeathAge(config.age,config.random||Math.random):null;
 const s={startMode:config.startMode||'lottery',lifetime,gender:config.gender||'unspecified',startDate:config.startDate||config.month+'-01',draw:config.draw||null,deathAge,endAt:lifetime?monthAt(monthIndex(config.month)+(deathAge-config.age)*12):END,version:VERSION,name:(config.name||'여행자').slice(0,20),region:config.region,startAge:config.age,
  month:config.month,start:config.month,round:(config.round||'가상 회차').slice(0,30),gross:round(config.gross),initial:round(config.net),
  cash:round(config.net),deposit:0,stocks:0,home:0,debt:0,job:true,business:false,digital:false,car:false,
  living:round(1600000*eco.priceFactor),rent:round(region.rent*eco.priceFactor),houseBase:round(region.house*eco.priceFactor),
  cpi:1,happy:65,health:80,seen:[],pending:{id:'welcome',kind:'welcome',category:'내 삶',title:'행운 다음에는, 선택이 있다',text:'당첨금이 들어왔다. 먼저 돈을 나누어 둘지, 일을 계속할지, 삶을 천천히 바꿀지 결정해 보자.'},
  purchaseSelection:config.purchaseSelection||null,vehicle:null,collection:[],memories:[],homeDetails:null,homeMaintenance:150000,personalCount:0,deferred:[],used:{},log:[],timeline:[],ended:false,reason:'',lastFlow:null};
 note(s,'start','또 다른 삶이 시작됐다',`${s.round} · 세전 ${s.gross.toLocaleString('ko-KR')}원 / 설정 수령액 ${s.initial.toLocaleString('ko-KR')}원. 금액·공제는 사용자 설정 또는 게임 가정.`);
 if(s.purchaseSelection)note(s,'start','달력에서 고른 구매 시점',`${s.purchaseSelection.date} ${s.purchaseSelection.time}에 구매한 것으로 가정합니다. 당첨과 인생 시작은 ${s.startDate}입니다.`);
 if(config.market===true){initializeMarket(s,config.allocation||'balanced');s.market.lifeEvents=config.lifeEvents===true;s.market.domesticEconomy=true;}
 s.timeline.push({month:s.month,worth:worth(s)});return s;
}
function eventAt(s){
 const h=HISTORIES.find(h=>h.month===s.month&&!s.seen.includes(h.id));
 if(h){s.seen.push(h.id);const financial=MARKET_EVENTS.find(e=>e.history===h.id&&s.market?.notices.includes(e.id));return {...h,...(financial?{economicId:financial.id}:{})};}
 const marketEvent=economicEvent(s);if(marketEvent)return marketEvent;
 if(s.market?.lifeEvents===false)return null;
 const follow=nextStory(s);if(follow)return follow;
 const elapsed=monthIndex(s.month)-monthIndex(s.start);
 if(elapsed>0&&elapsed%3===0){
  const eligible=PERSONAL.filter(p=>!p.condition||(p.condition==='job'&&s.job)||(p.condition==='nojob'&&!s.job)||(p.condition==='home'&&s.home>0)||(p.condition==='business'&&s.business)||(p.condition==='travel'&&!economy(s.month).pandemic));
  const p=eligible[(s.personalCount||0)%eligible.length];s.personalCount=(s.personalCount||0)+1;
  return {...p,id:`personal-${elapsed}`,category:p.category||'내 삶'};
 }
 return null;
}
export function choices(s){
 const e=s.pending;if(!e)return [];if(e.kind==='story')return storyChoices(s);
 const opt=(id,title,detail)=>({id,title,detail});
 switch(e.kind){
 case 'welcome':return [...(s.market?[opt('market-review','처음 자산 배분부터 살펴보기','경제 시장 열기 · 이 선택 자체의 비용 없음')]:[]),opt('first-week','당첨 첫 주의 설렘부터 느껴보기','첫 주의 이야기 열기 · 날짜와 돈은 그대로'),opt('safe','예금으로 안전망 만들기','현금의 30%를 예금으로 이동 · 재산 총액 유지'),opt('quit','일을 그만두고 쉬기','근로소득 중단 · 만족 +8'),opt('slow','일을 계속하며 천천히 결정','근로소득 유지 · 만족 +2'),opt('wish','집·차·명품부터 골라보기','위시리스트 열기 · 이 선택 자체에는 비용 없음')];
 case 'economic':return [opt('market-review','내 자산을 재배분해 보기','시장 화면 열기 · 거래 시 수수료 발생'),opt('hold','현재 자산 배분 유지하기','사건을 확인하고 다음 달로 진행')];
 case 'crisis':return [opt('liquid','주식의 절반을 현금으로',s.market?'모든 테마 주식 수량의 약 50% 매도 · 수수료 차감':'현재 평가액 기준 50% 매도'),opt('cut','생활비 15% 줄이기','기본 생활비 −15% · 만족 −3'),opt('hold','현재 계획을 유지','보유 자산과 생활비 유지')];
 case 'civic':return [opt('read','기록을 읽으며 이해하기','비용 없음 · 금전 효과 없음'),opt('talk','가까운 사람들과 대화하기','비용 없음 · 금전 효과 없음'),opt('observe','일상을 이어가며 지켜보기','비용 없음 · 금전 효과 없음')];
 case 'culture':return [opt('visit','현장에서 추억 만들기','150만 원 지출 · 만족 +6'),opt('watch','집에서 함께 즐기기','10만 원 지출 · 만족 +3'),opt('skip','일상에 집중하기','비용 없음')];
 case 'pandemic':return [opt('digital',s.business?'가게의 비대면 판매 준비':'집에서 생활할 환경 준비',s.business?'300만 원 지출 · 가정된 매출 감소 완화':'100만 원 지출 · 만족 +3'),opt('buffer','생활비 10% 줄이기','기본 생활비 −10% · 만족 −2'),opt('keep','현재 방식을 유지','상황을 지켜보며 생활 유지')];
 case 'reopen':return [opt('trip','미뤄 둔 여행 떠나기','300만 원 지출 · 만족 +6'),opt('meet','가까운 사람들 만나기','30만 원 지출 · 만족 +3'),opt('keep','지금의 생활 이어가기','비용 없음')];
 case 'family':return [opt('gift','범위를 정해서 가족 지원','1,000만 원 지출 · 만족 +4 · 증여세는 미반영'),opt('boundary','당첨 사실만 알리고 경계 정하기','비용 없음 · 만족 +2'),opt('private','혼자 간직하기','비용 없음')];
 case 'learning':return [opt('learn','새로운 분야 공부하기','200만 원 지출 · 6개월 뒤 만족 +5'),opt('rest','일주일 쉬어가기','100만 원 지출 · 건강 +3'),opt('continue','지금 일상을 유지하기','비용 없음')];
 case 'dream':return [opt('shop-home','내가 살고 싶은 집 찾아보기','집 유형과 구매비·관리비를 직접 확인'),opt('shop-car','꿈꾸던 차 골라보기','차량 유형과 구매비·유지비를 직접 확인'),opt('shop-luxury','갖고 싶던 명품 쇼핑하기','가방·시계·주얼리·옷장을 직접 선택')];
 case 'travel':return [opt('long','일주일 여행 떠나기','300만 원 지출 · 만족 +7'),opt('near','가까운 곳에서 하루 보내기','20만 원 지출 · 만족 +3'),opt('later','다음 기회를 기다리기','비용 없음')];
 case 'career':return [opt('accept','새로운 역할 맡기','당장 비용 없음 · 3개월 뒤 격려금 100만 원 (고정 가정)'),opt('stay','현재 일의 균형 유지','비용 없음 · 만족 +2'),opt('leave','일을 그만두기','급여 중단 · 만족 +4')];
 case 'homecare':return [opt('renovate','공간을 새롭게 꾸미기','1,000만 원 지출 · 만족 +6 · 집 평가액은 유지'),opt('small','작은 가구만 바꾸기','100만 원 지출 · 만족 +3'),opt('keep','지금 공간을 유지','비용 없음')];
 case 'businessplan':return [opt('campaign','작은 홍보 실험','300만 원 지출 · 3개월 뒤 200만 원 회수 (고정 가정)'),opt('service','서비스부터 다듬기','50만 원 지출 · 만족 +2'),opt('steady','현재 규모 유지','비용 없음')];
 case 'hobby':return [opt('gear','장비를 사고 꾸준히 시작','200만 원 지출 · 만족 +5'),opt('trial','먼저 체험 수업 듣기','20만 원 지출 · 만족 +3'),opt('free','돈 없이 시작할 취미 찾기','비용 없음 · 만족 +1')];
 case 'scam':return [opt('send','제안을 믿고 송금하기','1,000만 원 지출 · 회수금 0원 (가상 사건)'),opt('verify','자료를 확인하고 보류','비용 없음 · 송금하지 않음'),opt('reject','제안을 거절하기','비용 없음')];
 case 'rest':return [opt('routine','운동으로 생활 리듬 만들기','50만 원 지출 · 건강 +5 · 만족 +2'),opt('meet','정기적으로 친구 만나기','20만 원 지출 · 만족 +4'),opt('free','당분간 자유롭게 쉬기','비용 없음 · 건강 +1')];
 case 'social':return [opt('host','작은 모임 준비하기','50만 원 지출 · 만족 +4'),opt('coffee','가볍게 만나기','5만 원 지출 · 만족 +3'),opt('call','전화로 안부 전하기','비용 없음 · 만족 +1')];
 case 'community':return [opt('donate','프로젝트에 기부하기','100만 원 지출 · 만족 +3'),opt('time','내 시간을 보태기','비용 없음 · 만족 +2'),opt('cheer','소식만 받아보기','비용 없음')];
 case 'friend':return [opt('pilot','작게 시험해 보기','500만 원 지출 · 6개월 뒤 200만 원 회수 (고정 가정)'),opt('decline','정중히 거절하기','비용 없음'),opt('review','검토만 함께 해보기','20만 원 지출 · 만족 +2')];
 default:return [opt('upgrade','조금 더 여유롭게 살기','기본 생활비 +15% · 만족 +4'),opt('simple','소비 줄이고 가볍게 살기','기본 생활비 −10% · 만족 −2'),opt('balance','현재의 균형 유지하기','비용 없음 · 만족 +1')];
 }
}
export function choiceCost(s,id){const k=s.pending?.kind;if(k==='story')return storyChoices(s).find(o=>o.id===id)?.cost||0;if(k==='culture')return id==='visit'?1500000:id==='watch'?100000:0;
 if(k==='pandemic'&&id==='digital')return s.business?3000000:1000000;
 if(k==='reopen')return id==='trip'?3000000:id==='meet'?300000:0;
 if(k==='family'&&id==='gift')return 10000000;
 if(k==='learning')return id==='learn'?2000000:id==='rest'?1000000:0;
 if(k==='friend')return id==='pilot'?5000000:id==='review'?200000:0;
 const costs={travel:{long:3000000,near:200000},homecare:{renovate:10000000,small:1000000},businessplan:{campaign:3000000,service:500000},hobby:{gear:2000000,trial:200000},scam:{send:10000000},rest:{routine:500000,meet:200000},social:{host:500000,coffee:50000},community:{donate:1000000}};
 return costs[k]?.[id]||0;}
export function decide(s,id){
 if(s.ended||!s.pending)throw Error('현재 선택할 사건이 없습니다.');
 const option=choices(s).find(x=>x.id===id);if(!option)throw Error('잘못된 선택입니다.');
 if(s.pending.kind==='story'){resolveStory(s,id);if(s.month===endMonth(s)){if(s.lifetime)finishLife(s);else{s.ended=true;s.reason='현재 시점에 도착했습니다.';}}return s;}
 const cost=choiceCost(s,id);if(s.cash<cost)throw Error('사용 가능한 현금이 부족합니다. 예금을 인출하거나 자산을 매도해 주세요.');
 const k=s.pending.kind,economicId=s.pending.economicId; s.cash-=cost;
 if(k==='welcome'){if(id==='safe'){const n=round(s.cash*.3);s.cash-=n;s.deposit+=n;}if(id==='quit'){s.job=false;onJobChange(s);s.happy+=8;}if(id==='slow')s.happy+=2;}
 if(k==='crisis'){if(id==='liquid'){if(s.market)sellHalfThemes(s);else{const n=round(s.stocks*.5);s.stocks-=n;s.cash+=n;}}if(id==='cut'){s.living=round(s.living*.85);s.happy-=3;}}
 if(k==='culture')s.happy+=id==='visit'?6:id==='watch'?3:0;
 if(k==='pandemic'){if(id==='digital'){if(s.business)s.digital=true;else s.happy+=3;}if(id==='buffer'){s.living=round(s.living*.9);s.happy-=2;}}
 if(k==='reopen')s.happy+=id==='trip'?6:id==='meet'?3:0;
 if(k==='family')s.happy+=id==='gift'?4:id==='boundary'?2:0;
 const due=(months)=>{let m=s.month;for(let i=0;i<months;i++)m=nextMonth(m);return m;};
 if(k==='learning'){if(id==='learn')s.deferred.push({month:due(6),title:'새로운 공부가 일상의 자신감이 됐다',cash:0,happy:5});if(id==='rest')s.health+=3;}
 if(k==='friend'){if(id==='pilot')s.deferred.push({month:due(6),title:'작은 사업 시험을 마쳤다',cash:2000000,happy:0});if(id==='review')s.happy+=2;}
 if(k==='life'){if(id==='upgrade'){s.living=round(s.living*1.15);s.happy+=4;}if(id==='simple'){s.living=round(s.living*.9);s.happy-=2;}if(id==='balance')s.happy++;}
 if(k==='travel')s.happy+=id==='long'?7:id==='near'?3:0;
 if(k==='career'){if(id==='accept')s.deferred.push({month:due(3),title:'새 역할의 첫 프로젝트를 마쳤다',cash:1000000,happy:2});if(id==='stay')s.happy+=2;if(id==='leave'){s.job=false;onJobChange(s);s.happy+=4;}}
 if(k==='homecare')s.happy+=id==='renovate'?6:id==='small'?3:0;
 if(k==='businessplan'){if(id==='campaign')s.deferred.push({month:due(3),title:'가게의 홍보 실험 결과가 도착했다',cash:2000000,happy:1});if(id==='service')s.happy+=2;}
 if(k==='hobby')s.happy+=id==='gear'?5:id==='trial'?3:1;
 if(k==='rest'){if(id==='routine'){s.health+=5;s.happy+=2;}if(id==='meet')s.happy+=4;if(id==='free')s.health+=1;}
 if(k==='social')s.happy+=id==='host'?4:id==='coffee'?3:1;
 if(k==='community')s.happy+=id==='donate'?3:id==='time'?2:0;
 s.happy=clamp(s.happy);s.health=clamp(s.health);
 note(s,'choice',option.title,`${s.pending.title} · ${option.detail}${s.pending.url?' · 사건 출처: '+s.pending.source:''}`);
 acknowledgeEconomic(s,economicId);s.pending=null;
 if(k==='welcome'){const initialHistory=HISTORIES.find(h=>h.month===s.month&&!s.seen.includes(h.id));if(initialHistory){s.seen.push(initialHistory.id);s.pending={...initialHistory};note(s,'news',initialHistory.title,initialHistory.text);}}
 if(!s.pending&&!s.ended&&s.month<endMonth(s))s.pending=economicEvent(s);
 if(s.month===endMonth(s)&&!s.pending){if(s.lifetime)finishLife(s);else{s.ended=true;s.reason='현재 시점에 도착했습니다.';}}return s;
}
export function availableActions(s){const eco=gameEconomy(s);return [
 {id:'deposit',title:'예금하기',detail:'현금 1,000만 원을 예금으로 이동',cost:10000000},
 {id:'withdraw',title:'예금 인출',detail:'최대 1,000만 원을 현금으로 이동',requires:s.deposit>0},
 {id:'invest',title:'분산 주식 매수',detail:'1,000만 원 매수 · 가상 지수',cost:10000000},
 {id:'sell',title:'주식 매도',detail:'최대 1,000만 원을 현금으로 이동',requires:s.market?(s.market.holdings.index?.units||0)>0:s.stocks>0},
 {id:'house',title:s.home?'집 매도':'집 구매',detail:s.home?'평가액의 98% 현금 회수 · 월세 전환':`${round(s.houseBase*1.03).toLocaleString('ko-KR')}원 · 거래비용 3% 포함`,cost:s.home?0:round(s.houseBase*1.03)},
 {id:'job',title:s.job?'퇴사하기':'다시 일하기',detail:s.job?'급여 중단 · 선택 후 다음 달부터 반영':`월 급여 약 ${round(eco.wage).toLocaleString('ko-KR')}원`,once:true},
 {id:'business',title:s.business?'가게 정리':'작은 가게 시작',detail:s.business?'회수금 없음 · 영업손익 중단':'5,000만 원 창업비 · 손익은 게임 가정',cost:s.business?0:50000000,once:true},
 {id:'car',title:s.car?'차 처분':'차 구매',detail:s.car?(s.vehicle?'차 평가액의 98% 현금 회수 · 유지비 중단':'회수금 없음 · 월 유지비 중단'):'3,000만 원 지출 · 월 유지비 20만 원 × 물가 배율',cost:s.car?0:30000000,once:true},
 {id:'simple',title:'생활비 줄이기',detail:'기본 생활비 −10% · 월 1회',once:true},
 {id:'leisure',title:'나를 위한 하루',detail:'30만 원 지출 · 만족 +2 · 월 1회',cost:300000,once:true}
 ].map(a=>({...a,disabled:s.ended||a.requires===false||(a.cost||0)>s.cash||(a.once&&s.used[a.id]===s.month)||(a.id==='simple'&&s.living<400000)}));}
export function action(s,id){
 const a=availableActions(s).find(a=>a.id===id);if(!a||a.disabled)throw Error('지금은 실행할 수 없습니다.');
 if(s.market&&['invest','sell'].includes(id)){trade(s,'index',id==='invest'?'buy':'sell',10000000);return s;}
 const before=worth(s);s.cash-=a.cost||0;
 if(id==='deposit')s.deposit+=10000000;
 if(id==='withdraw'){const n=Math.min(10000000,s.deposit);s.deposit-=n;s.cash+=n;}
 if(id==='invest')s.stocks+=10000000;
 if(id==='sell'){const n=Math.min(10000000,s.stocks);s.stocks-=n;s.cash+=n;}
 if(id==='house'){if(s.home){trackHomeSale(s);s.cash+=round(s.home*.98);s.home=0;s.homeDetails=null;if(s.lifestyle){s.lifestyle.rooms=[];s.lifestyle.scenes=s.lifestyle.scenes.filter(x=>!['home','room'].includes(x.type));}}else{s.home=s.houseBase;s.homeMaintenance=150000;s.homeDetails=null;}}
 if(id==='job'){s.job=!s.job;onJobChange(s);}
 if(id==='business'){s.business=!s.business;s.digital=false;}
 if(id==='car'){if(s.vehicle){s.cash+=round(s.vehicle.value*.98);s.vehicle=null;}s.car=!s.car;}
 if(id==='simple'){s.living=round(s.living*.9);s.happy-=1;}
 if(id==='leisure')s.happy+=2;
 pruneStoryQueue(s);
 s.happy=clamp(s.happy);s.used[id]=s.month;note(s,'action',a.title,`${a.detail} · 순자산 변화 ${worth(s)-before}원`);return s;
}
export function advance(s,count=1){
 if(!Number.isInteger(count)||count<1||count>12)throw Error('진행 기간은 1~12개월입니다.');
 if(s.ended||s.pending)throw Error('먼저 현재 사건의 선택을 마쳐 주세요.');
 for(let i=0;i<count;i++){
 if(s.month>=endMonth(s)){if(s.lifetime)finishLife(s);else{s.ended=true;s.reason='현재 시점에 도착했습니다.';}break;}
 s.month=nextMonth(s.month);const before=worth(s);stepMarket(s);const eco=gameEconomy(s);
 const salary=round(s.job?eco.wage:0),business=round(businessValue(s)),interest=round(s.deposit*eco.deposit/12);
 s.cpi*=Math.pow(1+eco.inflation,1/12);const spending=expenses(s);
 s.cash+=salary+business+interest-spending;
 s.stocks=round(s.stocks*Math.pow(1+eco.stocks,1/12));
 if(s.vehicle)s.vehicle.value=Math.max(round(s.vehicle.purchasePrice*.1),round(s.vehicle.value*Math.pow(1-s.vehicle.decay,1/12)));
 for(const asset of s.collection||[])asset.value=Math.max(round(asset.purchasePrice*.1),round(asset.value*Math.pow(1-asset.decay,1/12)));
 s.home=round(s.home*Math.pow(1+eco.house,1/12));s.houseBase=round(s.houseBase*Math.pow(1+eco.house,1/12));
 for(const d of s.deferred.filter(d=>d.month===s.month)){s.cash+=d.cash;s.happy+=d.happy;note(s,'result',d.title,`이전 선택의 결과 · 현금 +${d.cash.toLocaleString('ko-KR')}원 · 만족 +${d.happy} (게임 가정)`);}
 s.deferred=s.deferred.filter(d=>d.month>s.month);
 if(s.cash<0){s.debt+=-s.cash;s.cash=0;}else if(s.debt){const paid=Math.min(s.cash,s.debt);s.cash-=paid;s.debt-=paid;}
 s.happy=clamp(s.happy);s.health=clamp(s.health);
 s.lastFlow={salary,business,interest,spending,net:salary+business+interest-spending};
 note(s,'month','한 달의 생활',`급여 ${salary.toLocaleString('ko-KR')}원 · 사업손익 ${business.toLocaleString('ko-KR')}원 · 이자 ${interest.toLocaleString('ko-KR')}원 · 생활·주거비 ${spending.toLocaleString('ko-KR')}원`);
 s.timeline.push({month:s.month,worth:worth(s)});
 s.pending=s.month>=endMonth(s)?null:eventAt(s);
 if(s.pending)note(s,'news',s.pending.title,s.pending.text);
 if(!s.lifetime&&s.debt>=50000000){s.ended=true;s.pending=null;s.reason='생활비 부족분이 5,000만 원에 도달했습니다. 자산 배분을 바꾸어 다시 시작해 보세요.';}
 if(!s.pending&&!s.ended&&s.month<endMonth(s))s.pending=economicEvent(s);
 if(s.month===endMonth(s)&&!s.pending){if(s.lifetime)finishLife(s);else{s.ended=true;s.reason='현재 시점에 도착했습니다.';}}
 if(s.pending||s.ended)break;
 }return s;
}
export function validateSave(s){
 if(!s||!validMarket(s)||!validStories(s)||!validLifestyle(s)||s.version!==VERSION||typeof s.name!=='string'||typeof s.round!=='string'||!Object.hasOwn(REGIONS,s.region))return false;
 for(const k of ['cash','deposit','stocks','home','debt','initial','gross','living','rent','houseBase','cpi','happy','health','startAge'])if(!Number.isFinite(s[k])||s[k]<0||s[k]>1e15)return false;
 if(s.startMode!==undefined&&s.startMode!=='lottery')return false;
 const minimum='2002-12';
 if(s.initial<=0||s.initial>s.gross||s.cpi<=0||s.happy>100||s.health>100||s.startAge<19||s.startAge>80)return false;
 for(const k of ['month','start'])if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(s[k])||s[k]<minimum||s[k]>(k==='start'?END:endMonth(s)))return false;
 if(s.month<s.start||!Array.isArray(s.log)||!Array.isArray(s.timeline)||!Array.isArray(s.seen)||!Array.isArray(s.deferred)||!s.used||typeof s.used!=='object')return false;
 if(s.log.length>10000||!s.log.every(l=>l&&['id','month','type','title','text'].every(k=>typeof l[k]===(k==='id'?'number':'string'))))return false;
 if(!s.timeline.every(t=>t&&typeof t.month==='string'&&Number.isFinite(t.worth)))return false;
 if(!s.seen.every(x=>typeof x==='string')||!s.deferred.every(d=>d&&typeof d.month==='string'&&typeof d.title==='string'&&Number.isFinite(d.cash)&&Number.isFinite(d.happy)))return false;
 if(s.pending&&(!['economic','story','welcome','crisis','civic','culture','pandemic','reopen',...PERSONAL.map(p=>p.kind)].includes(s.pending.kind)||typeof s.pending.title!=='string'||typeof s.pending.text!=='string'))return false;
 if(s.pending?.kind==='economic'&&(!s.market||!s.market.notices.includes(s.pending.economicId)))return false;
 if(s.pending?.kind==='story'&&(!STORY_NODES[s.pending.storyId]||typeof s.pending.origin!=='string'||!s.story?.seen.includes(s.pending.storyId)))return false;
 if(s.purchaseSelection!==undefined&&s.purchaseSelection!==null){const x=s.purchaseSelection;if(x.mode!=='calendar'||typeof x.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||typeof x.time!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(x.time))return false;}
 if(s.homeMaintenance!==undefined&&(!Number.isFinite(s.homeMaintenance)||s.homeMaintenance<0||s.homeMaintenance>1e12))return false;
 const validAsset=a=>a&&typeof a.id==='string'&&SHOP_BY_ID[a.id]&&typeof a.name==='string'&&['purchasePrice','value','maintenanceBase','decay'].every(k=>Number.isFinite(a[k])&&a[k]>=0)&&a.purchasePrice<=1e15&&a.value<=1e15&&a.decay<1&&typeof a.month==='string';
 if(s.vehicle!==undefined&&s.vehicle!==null&&(!validAsset(s.vehicle)||SHOP_BY_ID[s.vehicle.id].type!=='car'||!s.car))return false;
 if(s.collection!==undefined&&(!Array.isArray(s.collection)||s.collection.length>100||new Set(s.collection.map(a=>a?.id)).size!==s.collection.length||!s.collection.every(a=>validAsset(a)&&SHOP_BY_ID[a.id].type==='luxury')))return false;
 if(s.homeDetails!==undefined&&s.homeDetails!==null&&(!SHOP_BY_ID[s.homeDetails.id]||SHOP_BY_ID[s.homeDetails.id].type!=='home'||typeof s.homeDetails.name!=='string'||!s.home))return false;
 if(s.memories!==undefined&&(!Array.isArray(s.memories)||s.memories.length>1000||!s.memories.every(m=>m&&typeof m.id==='string'&&SHOP_BY_ID[m.id]?.type==='experience'&&typeof m.name==='string'&&typeof m.month==='string'&&Number.isFinite(m.cost)&&m.cost>=0)))return false;
 if(s.lifetime!==undefined&&typeof s.lifetime!=='boolean')return false;
 if(!s.lifetime&&s.endAt!==undefined&&s.endAt!==END)return false;
 if(s.lifetime){if(!Number.isInteger(s.deathAge)||s.deathAge<75||s.deathAge>100||s.deathAge<=s.startAge||s.endAt!==monthAt(monthIndex(s.start)+(s.deathAge-s.startAge)*12))return false;}
 if(s.gender!==undefined&&!['male','female','unspecified'].includes(s.gender))return false;
 if(s.startDate!==undefined&&(typeof s.startDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s.startDate)||s.startDate.slice(0,7)!==s.start))return false;
 if(s.draw!==undefined&&s.draw!==null){const d=s.draw;if(!Number.isInteger(d.round)||d.round<1||d.round>100000||!Array.isArray(d.numbers)||d.numbers.length!==6||new Set(d.numbers).size!==6||d.numbers.some(n=>!Number.isInteger(n)||n<1||n>45)||!Number.isInteger(d.bonus)||d.bonus<1||d.bonus>45||d.numbers.includes(d.bonus)||!Number.isInteger(d.winners)||d.winners<0||!Number.isInteger(d.simulatedWinners)||d.simulatedWinners<1)return false;}
 if(s.personalCount!==undefined&&(!Number.isInteger(s.personalCount)||s.personalCount<0||s.personalCount>10000))return false;
 if(s.pending?.url){try{const u=new URL(s.pending.url);if(u.protocol!=='https:'||!['www.korea.kr','www.pa.go.kr','www.sec.gov','www.ecb.europa.eu','www.bankofengland.co.uk','www.who.int','www.federalreserve.gov','law.ccourt.go.kr','library.olympics.com'].includes(u.hostname))return false;}catch{return false;}}
 return ['job','business','digital','car','ended'].every(k=>typeof s[k]==='boolean');
}

export function quotePurchase(s,id){
 const item=SHOP_BY_ID[id];if(!item)throw Error('상품을 찾을 수 없습니다.');
 const price=round(item.type==='home'?s.houseBase*item.factor:item.price*economy(s.month).priceFactor);
 const fee=round(price*(item.type==='home'?.03:item.type==='car'?.07:0));
 const credit=item.type==='car'&&s.vehicle?round(s.vehicle.value*.98):0;
 const cost=price+fee-credit,monthly=round(item.monthly*economy(s.month).priceFactor);
 const currentMaintenance=item.type==='home'?(s.home?(s.homeMaintenance??150000)*s.cpi:s.rent*s.cpi):item.type==='car'?(s.car?(s.vehicle?.maintenanceBase??200000)*s.cpi:0):0;
 let reason='';if(s.ended)reason='이미 마친 삶입니다.';else if(item.minYear&&Number(s.month.slice(0,4))<item.minYear)reason=`${item.minYear}년 이후 선택 가능합니다. (게임 기준)`;else if(item.type==='home'&&s.home)reason='현재 집을 먼저 매도해 주세요.';else if(item.type==='car'&&s.vehicle?.id===id)reason='이미 타고 있는 차입니다.';else if(item.type==='experience'&&(s.memories||[]).some(m=>m.month===s.month))reason='이 달에는 이미 여행을 선택했어요.';else if(item.type==='luxury'&&(s.collection||[]).some(x=>x.id===id))reason='이미 소장한 물건입니다.';else if(item.overseas&&economy(s.month).pandemic)reason='이 기간에는 해외여행을 제한합니다. (게임 가정)';else if(s.cash<cost)reason='사용 가능한 현금이 부족합니다.';
 return {item,price,fee,credit,cost,monthly,monthlyChange:round(monthly-currentMaintenance),disabled:Boolean(reason),reason};
}
export function purchase(s,id){
 const q=quotePurchase(s,id);if(q.disabled)throw Error(q.reason);const item=q.item,before=worth(s);
 s.cash-=q.cost;
 if(item.type==='home'){s.home=q.price;s.homeMaintenance=q.monthly/s.cpi;s.homeDetails={id:item.id,name:item.name,tag:item.tag,month:s.month};}
 if(item.type==='car'){s.car=true;s.vehicle={id:item.id,name:item.name,tag:item.tag,month:s.month,purchasePrice:q.price,value:q.price,maintenanceBase:q.monthly/s.cpi,decay:item.decay};}
 if(item.type==='luxury'){s.collection??=[];s.collection.push({id:item.id,name:item.name,tag:item.tag,month:s.month,purchasePrice:q.price,value:round(q.price*item.resale),maintenanceBase:0,decay:item.decay});}
 if(item.type==='experience'){s.memories??=[];s.memories.push({id:item.id,name:item.name,month:s.month,cost:q.price});}
 onPurchaseStory(s,item);
 queueScene(s,item);
 s.happy=clamp(s.happy+item.happy);
 note(s,'purchase',item.name+'을 선택했다',`구매 ${moneyText(q.price)}. 부대비용 ${moneyText(q.fee)}.${q.credit?' 기존 차량 정리 '+moneyText(q.credit)+'.':''} 이후 월 비용 ${moneyText(q.monthly)}. 만족 +${item.happy}. 순자산 변화 ${moneyText(worth(s)-before)}. 가격·유지비·감가·중고 가치는 게임 가정입니다.`);
 return q;
}
export function sellCollectionItem(s,id){
 if(s.ended)throw Error('이미 마친 삶입니다.');const asset=(s.collection||[]).find(x=>x.id===id);if(!asset)throw Error('소장한 물건이 아닙니다.');const amount=round(asset.value*.95);s.cash+=amount;s.collection=s.collection.filter(x=>x.id!==id);pruneStoryQueue(s);note(s,'action',asset.name+'을 정리했다',`${moneyText(amount)} 현금 회수. 중고 평가액에서 거래비용 5%를 차감한 게임 가정입니다.`);return amount;
}
