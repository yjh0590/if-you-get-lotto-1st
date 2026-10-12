import {POLICY_EVENTS} from './policy-data.js';
// Event dates/facts have sources. Every price, return, FX move and Korean deposit rate is a GAME ASSUMPTION.
export const MARKET_ASSETS=[
 {id:'usd',name:'미국 달러',symbol:'USD',theme:'외화',unit:'달러',fee:.004,description:'달러 수량을 보유합니다. 원/달러 모형 환율이 바뀌면 원화 평가액이 달라져요.'},
 {id:'gold',name:'금',symbol:'GOLD',theme:'귀금속',unit:'g',fee:.005,description:'모형 금 가격(달러/g)과 원/달러 환율을 함께 반영합니다. 실물 배송·보관·세금은 미반영입니다.'},
 {id:'index',name:'IF 분산시장',symbol:'IF-MKT',theme:'분산 지수',unit:'주',fee:.002,description:'게임용 분산 주식 지수입니다. 실제 지수·ETF가 아닙니다.'},
 {id:'chip',name:'IF 반도체',symbol:'IF-CHIP',theme:'반도체',unit:'주',fee:.002,description:'설비·수요·세계 경기의 변화에 반응하는 가상 테마 주식입니다.'},
 {id:'software',name:'IF 디지털',symbol:'IF-TECH',theme:'소프트웨어·디지털',unit:'주',fee:.002,description:'디지털 수요와 금리에 반응합니다. 특정 기업이나 실제 수익률을 재현하지 않습니다.'},
 {id:'health',name:'IF 헬스케어',symbol:'IF-CARE',theme:'의료·헬스케어',unit:'주',fee:.002,description:'의료 수요와 경기의 영향을 서로 다르게 받는 가상 주식입니다.'},
 {id:'travel',name:'IF 여행',symbol:'IF-TRIP',theme:'여행·항공',unit:'주',fee:.002,description:'이동 제한과 여행 재개가 게임상 수요를 바꿉니다.'},
 {id:'energy',name:'IF 에너지',symbol:'IF-ENG',theme:'에너지',unit:'주',fee:.002,description:'경기·물가·공급 여건에 반응합니다. 원자재 직접 투자 상품은 아닙니다.'},
 {id:'finance',name:'IF 금융',symbol:'IF-FIN',theme:'은행·금융',unit:'주',fee:.002,description:'금리 상승이 항상 호재는 아닙니다. 신용위험과 경기 영향도 반영합니다.'},
 {id:'consumer',name:'IF 생활소비',symbol:'IF-LIFE',theme:'생활소비',unit:'주',fee:.002,description:'가계 수요와 생활 물가의 변화에 반응하는 가상 주식입니다.'}
];
export const MARKET_BY_ID=Object.fromEntries(MARKET_ASSETS.map(a=>[a.id,a]));
export const STOCK_IDS=MARKET_ASSETS.filter(a=>!['usd','gold'].includes(a.id)).map(a=>a.id);
export const ALLOCATIONS=[{id:'cash',name:'현금부터 직접 배분',weights:{}},{id:'balanced',name:'여러 자산으로 시작',weights:{deposit:.2,usd:.1,gold:.1,index:.2}},{id:'defensive',name:'예금·달러·금 중심',weights:{deposit:.4,usd:.15,gold:.15}},{id:'themes',name:'테마 주식도 함께',weights:{deposit:.1,usd:.1,gold:.1,chip:.1,software:.1,health:.1,index:.1}}];
const fed=(d)=>`https://www.federalreserve.gov/newsevents/pressreleases/monetary${d}a.htm`;
const GLOBAL_EVENTS=[
 {id:'m-lehman',history:'lehman',month:'2008-09',date:'2008-09-15',title:'리먼브러더스 파산보호 신청',text:'금융기관의 신용위험과 경기 불확실성이 커지는 사건입니다. 아래 시장 반응은 실제 역사 수익률이 아닌 게임 가정입니다.',source:'미국 SEC',url:'https://www.sec.gov/newsroom/press-releases/2008-198-statement-regarding-recent-market-events-lehman-brothers-updated',effects:{index:-.18,chip:-.22,software:-.17,health:-.08,travel:-.20,energy:-.14,finance:-.30,consumer:-.10,usd:.12,goldUSD:.05},deposit:.018,house:-.01,inflation:.02},
 {id:'m-zero2008',month:'2008-12',date:'2008-12-16',title:'미 연준, 정책금리 목표 0~0.25%',text:'연준이 초저금리 목표 범위를 도입했습니다. 이것은 미국 정책금리 사실이며 게임의 원화 예금금리와 동일한 수치가 아닙니다.',source:'미국 연방준비제도',url:'https://www.federalreserve.gov/newsevents/pressreleases/monetary20081216b.htm',effects:{index:.04,software:.05,finance:.02,usd:-.03,goldUSD:.04},deposit:.012,house:.012},
 {id:'m-qe2010',month:'2010-11',date:'2010-11-03',title:'미 연준, 추가 국채 매입 계획',text:'연준은 장기 국채 6,000억 달러 추가 매입 계획을 발표했습니다. 유동성 공급의 시장 효과는 별도 모형으로 반영합니다.',source:'미국 연방준비제도',url:fed('20101103'),effects:{index:.06,chip:.07,software:.09,usd:-.04,goldUSD:.06},deposit:.015,house:.03},
 {id:'m-euro2012',month:'2012-07',date:'2012-07-26',title:'ECB, 유로화 보존 의지 표명',text:'ECB 총재는 권한 안에서 유로화를 보존하기 위한 행동 의지를 밝혔습니다. 불확실성 완화에 따른 가격 효과는 게임 가정입니다.',source:'유럽중앙은행',url:'https://www.ecb.europa.eu/press/key/date/2012/html/sp120726.en.html',effects:{index:.04,finance:.06,consumer:.03,usd:-.02,goldUSD:-.02},deposit:.018},
 {id:'m-boe2016',month:'2016-08',date:'2016-08-04',title:'영란은행, 금리 인하와 지원책 발표',text:'영란은행이 Bank Rate를 0.25%로 낮추고 경제 지원책을 발표했습니다. 원화 예금이나 달러의 방향은 이 사실만으로 결정되지 않습니다.',source:'영란은행',url:'https://www.bankofengland.co.uk/monetary-policy-summary-and-minutes/2016/mpc-august-2016',effects:{index:-.02,finance:-.04,travel:-.03,usd:.025,goldUSD:.025},deposit:.017},
 {id:'m-pandemic',history:'pandemic',month:'2020-03',date:'2020-03-11',title:'WHO, 코로나19 팬데믹 평가',text:'이동과 대면 활동의 제약을 시장 테마에 연결합니다. 모든 업종이 같은 방향으로 움직인다고 가정하지 않습니다.',source:'WHO',url:'https://www.who.int/news-room/speeches/item/who-director-general-s-opening-remarks-at-the-media-briefing-on-covid-19---11-march-2020',effects:{index:-.16,chip:-.10,software:.08,health:.12,travel:-.40,energy:-.22,finance:-.18,consumer:-.05,usd:.06,goldUSD:.035},deposit:.01,house:0,inflation:.015},
 {id:'m-fed2020',month:'2020-03',date:'2020-03-15',title:'미 연준, 긴급 금리 인하',text:'연준이 정책금리 목표를 0~0.25%로 낮췄습니다. 같은 달 WHO 사건과 별개의 정책 사건이며 모형 효과도 구분합니다.',source:'미국 연방준비제도',url:fed('20200315'),effects:{index:.05,software:.07,finance:.02,usd:-.025,goldUSD:.04},deposit:.008,house:.04},
 {id:'m-hike2022',month:'2022-03',date:'2022-03-16',title:'미 연준, 정책금리 인상',text:'연준이 정책금리 목표를 0.25~0.5%로 올렸습니다. 금리·할인율·자금 조달 경로를 게임 시장에 반영합니다.',source:'미국 연방준비제도',url:fed('20220316'),effects:{index:-.06,chip:-.08,software:-.12,health:-.03,travel:-.04,energy:.08,finance:.035,consumer:-.05,usd:.06,goldUSD:-.03},deposit:.027,house:-.025,inflation:.05},
 {id:'m-hike2022b',month:'2022-05',date:'2022-05-04',title:'미 연준, 추가 금리 인상과 자산 축소 계획',text:'연준은 정책금리 목표를 0.75~1%로 올리고 6월부터 보유 자산을 줄이는 계획을 발표했습니다.',source:'미국 연방준비제도',url:fed('20220504'),effects:{index:-.05,chip:-.07,software:-.09,finance:-.02,usd:.04,goldUSD:-.02},deposit:.032,house:-.03,inflation:.05},
 {id:'m-reopen',history:'emergency-end',month:'2023-05',date:'2023-05-05',title:'WHO, 코로나19 국제 비상사태 종료',text:'국제공중보건 비상사태 종료는 질병의 종식을 뜻하지 않습니다. 여행·대면 소비의 게임 수요를 조정합니다.',source:'WHO',url:'https://www.who.int/news-room/speeches/item/who-director-general-s-opening-remarks-at-the-media-briefing---5-may-2023',effects:{travel:.15,consumer:.06,index:.025,health:-.04,usd:-.02},house:.015,inflation:.025},
 {id:'m-cut2024',month:'2024-09',date:'2024-09-18',title:'미 연준, 정책금리 0.5%p 인하',text:'연준이 정책금리 목표를 4.75~5%로 낮췄습니다. 이 사실만으로 모든 주식이 오르는 것은 아니며 모형은 테마별로 반영합니다.',source:'미국 연방준비제도',url:fed('20240918'),effects:{index:.04,chip:.06,software:.07,finance:-.015,usd:-.035,goldUSD:.04},deposit:.026,house:.02,inflation:.025}
];
export const MARKET_EVENTS=[...GLOBAL_EVENTS,...POLICY_EVENTS].sort((a,b)=>a.date.localeCompare(b.date));
