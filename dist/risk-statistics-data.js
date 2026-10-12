// KICJ 2024 official summary: age-specific crime victimization (%).
// Keep reported age bands; do not invent single-age or joint age/sex estimates.
export const SURVEY_2024=Object.freeze({id:'kicj-2024',year:2024,period:'2024-01-01 ~ 2024-12-31',published:'2025-12-31',registered:'2026-02-28',surveyPeriod:'2025-08-25 ~ 2025-10-02',source:'한국형사·법무정책연구원',title:'전국범죄피해조사 2024',url:'https://www.kicj.re.kr/board.es?act=view&bid=0001&list_no=17925&mid=a10101000000',locator:'국문요약 · 범죄피해 취약성 요인 · 연령에 따른 범죄피해율; 본문 제8장 제3절(221~224쪽)',population:'국내 거주 일반가구의 만 14세 이상 가구원',samplePeople:14732,sampleHouseholds:7069,weighting:'설계 가중치·무응답 조정·사후 층화',precision:'공식 요약 소수점 한 자리',confidenceInterval:null,limitation:'연령별 표본수·오차구간은 이번 데이터에 미수록. 사후 회상 조사이며 미래 개인 위험의 예측이 아님. 사이버 문항 변경으로 이전 조사와 비교 시 주의.'});
const values=[
 [14,19,'10대',3.0,1.0,0.6,2.2],
 [20,29,'20대',6.6,1.3,1.1,1.4],
 [30,39,'30대',8.5,1.8,2.3,1.3],
 [40,49,'40대',7.4,0.9,2.6,1.1],
 [50,59,'50대',7.5,1.2,2.9,0.8],
 [60,69,'60대',6.6,1.1,3.4,1.0],
 [70,null,'70대 이상',3.7,0.3,1.7,0.2]
];
export const RISK_AGE_ROWS=Object.freeze(values.flatMap(([minAge,maxAge,ageBand,...rates])=>['property','theft','fraud','violence'].map((type,i)=>Object.freeze({id:`kicj-2024-${minAge}-${type}`,sourceId:SURVEY_2024.id,year:2024,minAge,maxAge,ageBand,type,annualPercent:rates[i],metric:'annual-experience-percent',implemented:type==='fraud'}))));
export const RISK_TYPE_NAMES=Object.freeze({property:'재산범죄',theft:'대인절도',fraud:'사기',violence:'폭력범죄'});
