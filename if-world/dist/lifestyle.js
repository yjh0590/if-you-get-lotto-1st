import {onLifeStory} from './stories.js';
import {economy} from './data.js';
import {moneyText} from './format.js';
export const ROOMS=[
 {id:'study',name:'햇살 드는 서재',cost:6000000,happy:5,detail:'큰 책상, 책장, 독서 의자. 미뤄 두었던 공부를 시작하는 공간.'},
 {id:'cinema',name:'나만의 홈시네마',cost:12000000,happy:7,detail:'프로젝터, 스크린, 편안한 소파. 좋아하는 영화를 다시 보는 밤.'},
 {id:'gaming',name:'게임과 음악의 방',cost:8000000,happy:6,detail:'게임 장비와 오디오, 수납장. 취향에 몰입할 수 있는 작은 아지트.'},
 {id:'guest',name:'함께 쉬는 손님방',cost:5000000,happy:5,detail:'침대와 작은 테이블. 소중한 사람이 편하게 머물다 가는 공간.'}
];
export const GIFTS=[
 {id:'meal',name:'가족과 특별한 식사',cost:500000,happy:3,detail:'함께 먹고, 안부를 묻는 저녁. 관계의 변화는 단정하지 않아요.'},
 {id:'support',name:'가족의 필요한 지출 돕기',cost:10000000,happy:4,detail:'사용처와 지원 범위를 먼저 이야기해요. 증여세는 미반영입니다.'},
 {id:'talk',name:'돈보다 먼저 마음 나누기',cost:0,happy:2,detail:'어디까지 나눌지 경계를 정해요. 돈을 주지 않아도 가능한 선택.'}
];
export const HOBBIES=[{id:'painting',name:'작은 화실에서 그림 그리기',cost:200000,happy:3,detail:'재료와 첫 수업. 잘 그리는 것보다 내 손으로 한 장을 완성하는 경험.'},{id:'music',name:'악기와 첫 곡 만나기',cost:300000,happy:3,detail:'연습실과 첫 수업. 좋아하는 노래를 직접 연주하는 꿈의 시작.'},{id:'exercise',name:'나에게 맞는 운동 체험',cost:150000,happy:3,detail:'강사와 함께하는 첫 체험. 실제 건강 효과가 아닌 취미 경험으로 기록해요.'}];
export function eraWishlist(s){const year=Number(s.month.slice(0,4));if(year<2010)return {title:'2000년대, 집에서 음악과 가까운 휴가',text:'홈 오디오 · 가족 세단 · 국내 휴가',ids:['lux-audio','car-family','trip-domestic']};if(year<2016)return {title:'2010년대 초반, 내 취향을 알아가는 시간',text:'기계식 시계 · 프리미엄 세단 · 일주일 여행',ids:['lux-watch','car-premium','trip-overseas']};return {title:'2016년 이후, 이동과 생활의 새로운 취향',text:'전기 SUV · 주얼리 · 한 달 살아보기',ids:['car-electric','lux-jewelry','trip-long']};}
export const LEVELS=[{id:'simple',name:'가볍고 편안하게',factor:.8,detail:'기본 생활비 기준 80%'},{id:'balanced',name:'좋아하는 것에 여유롭게',factor:1,detail:'기본 생활비 기준 100%'},{id:'generous',name:'일상의 작은 호사',factor:1.5,detail:'기본 생활비 기준 150%'}];
export const BUCKETS=[{id:'home',name:'내 집의 열쇠 받기'},{id:'car',name:'드림카로 첫 드라이브'},{id:'room',name:'내 취향의 방 만들기'},{id:'travel',name:'시간에 쫓기지 않는 여행'},{id:'family',name:'소중한 사람과 마음 나누기'},{id:'hobby',name:'나를 위한 취미 시작하기'}];
export const FIRST_WEEK=[
 {title:'당첨번호를 몇 번이고 다시 확인한 밤',text:'평범했던 하루가 갑자기 달라졌습니다. 가장 먼저 어떤 시간을 갖고 싶나요?',options:[{id:'quiet',name:'혼자 조용히 실감하기',text:'번호를 적어 둔 종이를 다시 봤다. 서두르지 않고 나의 속도로 시작하기로 했다.'},{id:'share',name:'믿는 사람 한 명에게 털어놓기',text:'누구에게 알릴지 먼저 생각했다. 한 사람과 설렘을 나누고 공개 범위를 정했다.'}]},
 {title:'바로 바꾸지 않아도 되는 것들',text:'일, 집, 인간관계. 모두 오늘 결정할 필요는 없습니다.',options:[{id:'list',name:'하고 싶던 일 세 가지 적기',text:'집, 여행, 새로운 취미. 가격보다 원하는 일상을 먼저 적어 보았다.'},{id:'pause',name:'평소처럼 하루 보내기',text:'평소의 길을 걸었다. 갑자기 모든 것을 바꾸지 않아도 괜찮았다.'}]},
 {title:'이제, 말로만 하던 꿈을 고를 시간',text:'첫 주의 설렘을 지나 내 삶을 구체적으로 그려 봅니다.',options:[{id:'home',name:'살고 싶은 집부터 둘러보기',text:'내가 살고 싶은 공간부터 그려 보기로 했다.',shop:'home'},{id:'car',name:'드림카 만나러 가기',text:'출근용 차가 아니라, 내가 타고 싶었던 차를 골라 보기로 했다.',shop:'car'},{id:'experience',name:'미뤄 둔 여행 계획하기',text:'시간에 쫓기지 않는 여행을 상상했다.',shop:'experience'}]}
];
const fresh=()=>({week:0,rooms:[],gifts:[],moments:[],scenes:[],bucket:[],level:'balanced',baseLiving:null,used:{}});
export function lifestyle(s){return s.lifestyle||fresh();}
function writable(s){return s.lifestyle??=fresh();}
function record(s,title,text){s.log.push({id:s.log.length+1,month:s.month,type:'choice',title,text});}
function moment(s,id,title,text,cost=0){const l=writable(s);l.moments.push({id,title,text,month:s.month,cost});record(s,title,text);}
export function queueScene(s,item){const l=writable(s);const texts={home:'새 집 열쇠를 손에 쥐었습니다. 첫날을 어떻게 기억하고 싶나요?',car:'새 차의 운전석에 앉았습니다. 첫 목적지는 어디인가요?',luxury:'갖고 싶던 물건이 이제 내 것이 되었습니다. 어떤 하루에 함께하고 싶나요?',experience:'여행 가방을 챙길 시간입니다. 이 여행을 누구와 기억하고 싶나요?',room:'새로 꾸민 공간에 불이 켜졌습니다. 첫 저녁을 어떻게 보낼까요?'};l.scenes.push({id:item.id,name:item.name,type:item.type,text:texts[item.type]});}
export function sceneOptions(scene){if(scene.type==='car')return [{id:'solo',name:'혼자 좋아하는 길 달리기'},{id:'family',name:'가족과 가까운 곳으로 나들이'},{id:'friend',name:'친구와 첫 드라이브'}];if(scene.type==='room')return [{id:'solo',name:'혼자 취향에 몰입하는 저녁'},{id:'family',name:'가족과 함께 쉬어 가기'},{id:'friend',name:'친구를 초대해 공간 보여주기'}];return [{id:'solo',name:'혼자 충분히 누려보기'},{id:'family',name:'가족과 함께 기억하기'},{id:'friend',name:'친구와 기쁨 나누기'}];}
export function bucketDone(s,id){const l=lifestyle(s);return {home:Boolean(s.home||s.story?.homes?.length),car:l.moments.some(m=>m.id==='scene-car'),room:l.rooms.length>0||l.moments.some(m=>m.id==='room'),travel:(s.memories||[]).length>0,family:l.gifts.length>0||l.moments.some(m=>m.companion==='family'),hobby:l.moments.some(m=>m.id==='hobby')}[id]||false;}
export function quoteLife(s,kind,id){const l=lifestyle(s);let item,cost=0,reason='',monthlyChange=0;
 if(kind==='room'){item=ROOMS.find(x=>x.id===id);if(!s.home)reason='내 집을 구입한 뒤 꾸밀 수 있어요.';else if(l.rooms.includes(id))reason='이미 꾸민 방이에요.';}
 else if(kind==='gift'){item=GIFTS.find(x=>x.id===id);if(l.used.gift===s.month)reason='이 달에는 이미 마음을 나눴어요.';}
 else if(kind==='level'){item=LEVELS.find(x=>x.id===id);if(item){const base=l.baseLiving??s.living;monthlyChange=Math.round((base*item.factor-s.living)*s.cpi);}if(l.level===id)reason='현재 선택한 생활이에요.';}
 else if(kind==='hobby'){item=HOBBIES.find(x=>x.id===id);if(l.used.hobby===s.month)reason='취미 수업은 월 1회 선택해요.';}
 if(!item)throw Error('선택을 찾을 수 없습니다.');cost=Math.round((item.cost||0)*economy(s.month).priceFactor);if(s.ended)reason='이미 마친 삶입니다.';else if(s.cash<cost)reason='사용 가능한 현금이 부족합니다.';return {item,cost,monthlyChange,disabled:Boolean(reason),reason};}
export function doLife(s,kind,id){if(s.ended)throw Error('이미 마친 삶입니다.');const l=writable(s);
 if(kind==='bucket'){if(!BUCKETS.some(x=>x.id===id))throw Error('목표를 확인해 주세요.');l.bucket=l.bucket.includes(id)?l.bucket.filter(x=>x!==id):[...l.bucket,id];return;}
 if(kind==='week'){const step=FIRST_WEEK[l.week],o=step?.options.find(x=>x.id===id);if(!o)throw Error('현재 첫 주의 선택이 아닙니다.');moment(s,'week-'+l.week,step.title,o.text);l.week++;return {shop:o.shop};}
 if(kind==='scene'){const scene=l.scenes[0],o=scene&&sceneOptions(scene).find(x=>x.id===id);if(!o)throw Error('기억할 장면이 없습니다.');const after={home:'창문을 열고 집 안을 천천히 걸었다. 이곳에서 보낼 평범한 날들이 기대됐다.',car:'익숙한 길도 조금 다르게 느껴졌다. 목적지보다 달리는 시간을 즐겼다.',luxury:'남에게 보여주기보다 나의 취향을 즐기는 하루로 남겼다.',experience:'일정을 느슨하게 비워 두었다. 시간에 쫓기지 않는 여행의 기억이 시작됐다.',room:'좋아하는 것들로 채운 방에서 저녁을 보냈다. 이 공간이 나의 일상으로 들어왔다.'};moment(s,'scene-'+scene.type,scene.name+'의 첫 기억',o.name+'. '+after[scene.type]);l.moments.at(-1).companion=id;l.scenes.shift();s.happy=Math.min(100,s.happy+2);return;}
 const q=quoteLife(s,kind,id);if(q.disabled)throw Error(q.reason);s.cash-=q.cost;
 if(kind==='room'){l.rooms.push(id);queueScene(s,{id,name:q.item.name,type:'room'});}
 if(kind==='gift'){l.gifts.push({id,month:s.month,cost:q.cost});l.used.gift=s.month;}
 if(kind==='hobby')l.used.hobby=s.month;
 if(kind==='level'){l.baseLiving??=s.living;s.living=Math.round(l.baseLiving*q.item.factor);l.level=id;record(s,q.item.name,`생활 수준을 정했습니다. 월 기본 생활비 변화 ${moneyText(q.monthlyChange)}. 주거·차량 비용은 별도입니다.`);}
 else{moment(s,kind,q.item.name,`${q.item.detail} 지출 ${moneyText(q.cost)}. 비용과 만족 효과는 게임 가정입니다.`,q.cost);s.happy=Math.min(100,s.happy+(q.item.happy||0));}
 onLifeStory(s,kind,id,q.item.name);
 return q;
}
export function validLifestyle(s){if(s.lifestyle===undefined)return true;const l=s.lifestyle;if(!l||!Number.isInteger(l.week)||l.week<0||l.week>FIRST_WEEK.length||!LEVELS.some(x=>x.id===l.level)||!(l.baseLiving===null||(Number.isFinite(l.baseLiving)&&l.baseLiving>=0&&l.baseLiving<=1e15)))return false;
 for(const [key,list] of [['rooms',ROOMS],['bucket',BUCKETS]])if(!Array.isArray(l[key])||new Set(l[key]).size!==l[key].length||!l[key].every(id=>list.some(x=>x.id===id)))return false;
 if(!l.used||typeof l.used!=='object'||Object.values(l.used).some(v=>typeof v!=='string'||!/^\d{4}-\d{2}$/.test(v)))return false;
 if(!Array.isArray(l.gifts)||l.gifts.length>2000||!l.gifts.every(x=>x&&GIFTS.some(g=>g.id===x.id)&&typeof x.month==='string'&&Number.isFinite(x.cost)&&x.cost>=0))return false;
 if(!Array.isArray(l.moments)||l.moments.length>5000||!l.moments.every(x=>x&&['id','title','text','month'].every(k=>typeof x[k]==='string')&&Number.isFinite(x.cost)&&x.cost>=0))return false;
 return Array.isArray(l.scenes)&&l.scenes.length<=1000&&l.scenes.every(x=>x&&['id','name','text'].every(k=>typeof x[k]==='string')&&['home','car','luxury','experience','room'].includes(x.type));}
