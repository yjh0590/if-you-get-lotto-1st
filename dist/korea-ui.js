import {domesticConditions} from './korea-economy.js';
import {MARKET_EVENTS} from './market-data.js';
import {renderPolicyContext} from './market-ui.js';
import {income,expenses,worth,businessValue} from './engine.js';

export function renderKorea(s,{escape:e,won,date}){
 if(!s.market)return `<section class="card"><h2>한국 경제와 나의 생활</h2><p>기존 자산을 유지하고 경제 시장을 열어 브리핑을 시작할 수 있어요.</p><button class="btn" data-market-enable="yes">경제 시장 연결하기</button></section>`;
 const m=s.market,d=domesticConditions(s),spend=expenses(s),earn=income(s),net=earn-spend;
 const prev=m.history.at(-2)?.prices.usd;
 const fx=prev?(m.prices.usd/prev-1)*100:null;
 const fxText=fx===null?'첫 관측':`${fx>=0?'+':''}${fx.toFixed(2)}% · 전월 대비`;
 const real=((1+m.deposit)/(1+m.inflation)-1)*100;
 const reserve=spend>0?(s.cash+s.deposit)/spend:0;
 const recent=MARKET_EVENTS.filter(x=>x.month<=s.month).slice(-5).reverse();
 const metrics=[
  ['원/달러',won(m.prices.usd),fxText+' · 1달러 기준'],
  ['예금금리',`${(m.deposit*100).toFixed(2)}%`,'모형 연 금리 · 기준금리와 구분'],
  ['소비자물가',`${(m.inflation*100).toFixed(2)}%`,'모형 연 상승률 · 생활비에 반영'],
  ['주거 흐름',`${(m.house*100).toFixed(2)}%`,'모형 연 변동률 · 보유 주택에 반영'],
  ['내수 환경',`${d.demand.toFixed(1)}`,'100 = 모형 중립 · 통계 지수 아님'],
  ['현금 구매력',`${(100/s.cpi).toFixed(1)}`,'시작 시점의 같은 현금 = 100']
 ];
 return `<section class="korea-hero"><div><span class="eyebrow">IF WORLD / KOREA ECONOMY</span><h2>대한민국 경제 속,<br>나의 다음 선택.</h2><p>정부의 방향, 세계의 사건, 매달 달라지는 생활.<br>이달의 환경을 읽고 나의 돈과 삶을 결정해요.</p></div><div class="korea-calendar"><b>${date(s.month)}</b><span>월 단위 경제 브리핑</span><button class="btn" data-advance="1" ${s.pending||s.ended?'disabled':''}>한 달 진행 →</button><button class="text-button" data-advance="12" ${s.pending||s.ended?'disabled':''}>다음 사건까지</button></div></section>
 <p class="korea-model-note">표시된 지표와 경제 효과는 게임 모형입니다. 실제 한국 경제 통계와 과거 시세는 아직 연결하지 않았습니다.</p>
 ${s.pending?`<section class="korea-decision"><div><span class="mini-label">이번 달의 선택</span><h3>${e(s.pending.title)}</h3><p>${e(s.pending.text)}</p></div><button class="btn secondary" data-tab="life">사건 읽고 결정하기 →</button></section>`:s.ended?'<section class="korea-decision"><h3>생애의 마지막 달에 도착했습니다.</h3><button class="btn secondary" data-tab="life">삶의 결산 보기 →</button></section>':''}
 <div class="capital-receipt"><span>당첨 시작 설정 수령액 <b>${won(s.initial)}</b></span><span>최초 자산 배분 수수료 <b>${won(m.initialFees||0)}</b></span></div>
 <section class="korea-indicators" aria-label="한국 경제 모형 지표">${metrics.map(([label,value,detail])=>`<article><span>${label}</span><strong>${value}</strong><small>${detail}</small></article>`).join('')}</section>
 ${renderPolicyContext(s,{escape:e,date})}
 <section class="korea-channels"><div class="section-heading"><h3>경제가 내 생활에 닿는 경로</h3><span class="mini-label">게임 안에서 연결된 효과</span></div><div class="korea-path-grid"><article><span>01 / 정책과 산업</span><h4>발표 → 테마와 내수</h4><p>발표된 정책 방향은 다음 달부터 산업별 반응에 반영됩니다. 내수 모형은 가게의 매출에도 연결됩니다.</p></article><article><span>02 / 대외 환경</span><h4>세계 사건 → 환율과 자산</h4><p>대외 사건과 월별 변동이 달러·금·가상 주식에 함께 반영됩니다. 같은 사건도 보유 자산에 따라 결과가 달라집니다.</p></article><article><span>03 / 가계와 주거</span><h4>금리·물가 → 이자와 지출</h4><p>예금금리는 이자 수입을, 물가는 생활비와 구매력을 바꿉니다. 주거 모형은 집의 평가액에 반영됩니다.</p></article></div><p class="note">화면의 금리는 게임 내 예금금리입니다. 실제 한국은행 기준금리 시계열은 미연결이며, 취임만으로 금리를 일괄 변경하지 않습니다.</p></section>
 <div class="korea-columns"><section class="card korea-household"><span class="eyebrow">MY HOUSEHOLD</span><h3>이 환경에서, 나의 가계는</h3><div class="korea-money"><span>현재 순자산</span><strong>${won(worth(s))}</strong></div>${[['예상 월 수입',earn],['예상 월 지출',spend],['예상 월 잔액',net],['가게 예상 월 손익',businessValue(s)]].map(([label,v])=>`<div class="flow-row"><span>${label}</span><b>${won(v)}</b></div>`).join('')}<p>현금과 예금으로 현재 지출 약 <b>${reserve.toFixed(1)}개월</b>을 감당할 수 있어요.<br>추가 수입 없이 같은 지출이 유지된다는 단순 계산입니다.</p><p>현재 금리·물가가 1년 유지된다면 예금의 물가 조정 수익률은 약 <b>${real.toFixed(2)}%</b>입니다. 세전 가정이며 미래 수익 예측이 아닙니다.</p><div class="korea-actions"><button class="btn small" data-tab="market">달러·금·주식 거래</button><button class="btn secondary small" data-tab="assets">가계·일·사업 조정</button><button class="text-button" data-tab="shop">주거·소비 계획 →</button></div></section>
 <section class="card korea-demand"><span class="eyebrow">DOMESTIC DEMAND / GAME MODEL</span><h3>내수 환경은 어떻게 만들어졌을까?</h3><p>중립 100을 기준으로 정책·자금 조달·물가 부담을 합산합니다. 실제 소비·고용 통계가 아닙니다.</p>${[['정책의 내수 방향',d.policy],['금리 부담',d.financing],['물가 부담',d.prices]].map(([label,v])=>`<div class="flow-row"><span>${label}</span><b>${v>=0?'+':''}${v.toFixed(2)}점</b></div>`).join('')}<p>가게 매출 적용 배율 <b>×${d.revenueFactor.toFixed(3)}</b><br>기존 감염병 매출 규칙과 사업비는 별도로 계산합니다. 급여·실업률은 이 내수 점수에 연결하지 않았습니다.</p>${!d.enabled?`<p>이전 저장 기록의 매출 규칙을 유지하고 있어요. 연결하면 이후 월 매출부터 내수 환경을 반영합니다.</p><button class="btn secondary small" data-domestic-enable="yes" ${s.ended?'disabled':''}>내수 환경을 가게에 연결</button>`:'<span class="korea-connected">내수와 가게 매출 연결됨</span>'}</section></div>
 <section class="korea-news"><div class="section-heading"><h3>지금까지의 주요 경제 소식</h3><span class="mini-label">정부·정책과 대외 사건 · 월 기준</span></div>${recent.length?recent.map(x=>`<article><time>${date(x.date)}</time><div><span class="mini-label">${x.policy?'정부·정책':'대외·시장'}</span><h4>${e(x.title)}</h4><p>${e(x.text)}</p><a href="${e(x.url)}" target="_blank" rel="noopener noreferrer">${e(x.source)} ↗</a></div></article>`).join(''):'<p>이 시작 월 이전에 내장된 경제 사건이 없습니다. 시간을 진행하면 소식이 쌓입니다.</p>'}<p class="note">일별 순서는 재현하지 않습니다. 같은 달의 발표는 월 기준 브리핑에 함께 표시합니다.</p></section>`;
}
