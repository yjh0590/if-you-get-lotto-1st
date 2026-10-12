export {REGIONS} from './regions.js';
export const VERSION = 1;
export const END = '2026-10';
export const SCENARIOS = [
 {id:'2008',month:'2008-08',title:'2008 · 갈림길 앞에서',description:'변화가 시작되기 직전. 당신은 어떤 안전망을 만들까?',gross:2000000000,net:1400000000},
 {id:'2017',month:'2017-02',title:'2017 · 새 페이지',description:'사회의 변화 속에서, 나의 생활도 다시 설계한다.',gross:2000000000,net:1400000000},
 {id:'2020',month:'2020-02',title:'2020 · 달라지는 일상',description:'당연했던 일상이 바뀐다면, 무엇을 지킬까?',gross:2000000000,net:1400000000}
];

// All economic rates and prices below are GAME ASSUMPTIONS, not historical observations.
export function economy(month) {
 const y=Number(month.slice(0,4));
 const prices=Math.pow(1.025,y-2020);
 return {inflation: y===2022?0.055:0.025,deposit:y>=2022?0.032:y>=2020?0.012:0.025,
  stocks:y===2008?-0.38:y===2009?0.25:y===2020?0.18:y===2022?-0.22:0.055,
  house:y===2008?-0.08:y===2021?0.12:y===2022?-0.07:0.025,
  wage:2600000*prices,businessGross:5200000*prices,businessCost:3600000*prices,
  pandemic:month>='2020-03'&&month<='2021-12',priceFactor:prices};
}
export const HISTORIES = [
 {id:'lehman',month:'2008-09',date:'2008.09.15',category:'경제',title:'리먼브러더스, 파산보호 신청',
  text:'리먼브러더스가 파산보호를 신청했다. 당신의 생활에서는 어떤 자산을 현금으로 남겨둘지 고민이 시작된다.',
  source:'미국 연방준비제도',url:'https://www.federalreserve.gov/Pubs/Bulletin/2009/articles/bankprofit/default.htm',kind:'crisis'},
 {id:'constitutional',month:'2017-03',date:'2017.03.10',category:'정치',title:'헌법재판소, 대통령 탄핵 인용',
  text:'헌법재판소가 대통령 탄핵을 인용했다. 사회의 큰 변화를 맞아, 관련 기록을 살펴보거나 사람들과 대화할 수 있다.',
  source:'헌법재판소',url:'https://law.ccourt.go.kr/site/kor/ex/bbs/View.do?bcIdx=500078&cbIdx=1097',kind:'civic'},
 {id:'pyeongchang',month:'2018-02',date:'2018.02.09',category:'사회문화',title:'평창 동계올림픽 개막',
  text:'평창 동계올림픽이 개막했다. 일상에서 잠시 벗어나 현장에서 추억을 만들거나, 집에서 경기를 즐길 수 있다.',
  source:'IOC 올림픽 자료실',url:'https://library.olympics.com/Default/digitalCollection/DigitalCollectionAttachmentDownloadHandler.ashx?documentId=173375&skipWatermark=true',kind:'culture'},
 {id:'pandemic',month:'2020-03',date:'2020.03.11',category:'사회',title:'WHO, 코로나19를 팬데믹으로 평가',
  text:'WHO가 코로나19를 팬데믹으로 평가했다. 달라지는 일상 속에서 지출과 일하는 방식을 점검한다.',
  source:'WHO',url:'https://www.who.int/news-room/speeches/item/who-director-general-s-opening-remarks-at-the-media-briefing-on-covid-19---11-march-2020',kind:'pandemic'},
 {id:'emergency-end',month:'2023-05',date:'2023.05.05',category:'사회',title:'WHO, 코로나19 국제공중보건 비상사태 종료',
  text:'WHO가 코로나19 국제공중보건 비상사태 종료를 발표했다. 질병 자체의 종식을 의미하지는 않는다. 미뤄 둔 생활 계획을 다시 살펴본다.',
  source:'WHO',url:'https://www.who.int/news-room/speeches/item/who-director-general-s-opening-remarks-at-the-media-briefing---5-may-2023',kind:'reopen'}
];
export const PERSONAL = [
 {kind:'family',category:'가족',title:'가족에게 어디까지 말할까?',text:'큰 행운을 혼자 간직할지, 가까운 가족과 나눌지. 금액보다 경계를 먼저 정해야 할 때다.'},
 {kind:'learning',category:'성장',title:'한 번쯤 배우고 싶었던 것',text:'시간과 자금에 여유가 생겼다. 새로운 분야를 배우거나, 먼저 쉬어갈 수 있다. 공부를 선택하면 6개월 뒤 결과가 도착한다.'},
 {kind:'travel',category:'경험',title:'달력에 빈칸이 생겼다',text:'가보고 싶었던 곳의 이름이 떠오른다. 멀리 떠날까, 가까운 동네부터 걸어볼까? 다음 계절에도 기억할 하루를 만들어 보자.',condition:'travel'},
 {kind:'career',category:'직업',title:'회사에서 새로운 역할을 제안했다',text:'돈 때문에 일하지 않아도 되는 지금, 일의 의미는 무엇일까? 새로운 역할을 맡거나, 지금의 균형을 지키거나, 일을 그만둘 수 있다.',condition:'job'},
 {kind:'homecare',category:'주거',title:'내 집을 내 취향으로',text:'직접 고른 집에서 살고 있다. 공간을 바꾸고 싶은 마음과 현금을 남겨둘 이유가 함께 생긴다.',condition:'home'},
 {kind:'businessplan',category:'사업',title:'가게에 단골이 생기기 시작했다',text:'가게에 다시 오는 손님이 생겼다. 홍보를 작게 시험하거나, 서비스를 다듬거나, 현재 규모를 유지할 수 있다. 결과 금액은 게임에서 고정한 가정이다.',condition:'business'},
 {kind:'hobby',category:'취미',title:'돈으로 사고 싶었던 건, 시간이었다',text:'사진, 악기, 운동. 미뤄둔 관심사를 다시 꺼내본다. 장비부터 살지, 작은 체험으로 시작할지 선택해 보자.'},
 {kind:'friend',category:'관계',title:'친구가 함께 사업하자고 한다',text:'좋은 관계와 좋은 사업은 같은 말이 아니다. 작은 규모로 시험하거나, 거절하거나, 충분히 검토할 수 있다.'},
 {kind:'scam',category:'자산',title:'“원금도, 높은 수익도 보장합니다”',text:'지인에게서 너무 좋은 투자 제안이 왔다. 확인되지 않은 권유다. 이 가상 사건에서 송금한 돈은 회수되지 않는다. 자료를 검토하거나 거절할 수도 있다.'},
 {kind:'rest',category:'일상',title:'시간이 많아도 하루는 금방 간다',text:'일을 쉬게 된 뒤 하루의 리듬이 흐려졌다. 운동과 만남으로 일상을 채우거나, 지금의 자유를 즐길 수 있다.',condition:'nojob'},
 {kind:'social',category:'관계',title:'오래된 친구에게 연락이 왔다',text:'오랜만에 함께 시간을 보내자는 연락이다. 큰돈을 쓰지 않아도 관계를 이어가는 방식은 여러 가지다.'},
 {kind:'community',category:'사회',title:'동네에서 작은 프로젝트를 시작한다',text:'동네 공간을 함께 가꾸자는 제안이 왔다. 기부하거나, 시간을 보태거나, 멀리서 응원할 수 있다. 어느 쪽도 의무는 아니다.'},
 {kind:'dream',category:'꿈과 소비',title:'당첨되면 꼭 하고 싶었던 것',text:'좋은 집에서 살기, 꿈꾸던 차 타기, 매장에서 구경만 하던 물건 사기. 이제 직접 고르고 내 생활로 만들어 볼 수 있다.'},
 {kind:'life',category:'생활',title:'지금 생활에 만족하고 있을까?',text:'요즘의 생활을 돌아본다. 조금 더 여유롭게 살지, 소비를 줄일지, 지금의 균형을 유지할지 결정한다.'}
];
