import {LOTTERY_RECORDS} from './lottery-data.js';
export const CATALOG = LOTTERY_RECORDS;
export const TODAY='2026-10-12';
export function weeklyDate(round){if(!Number.isInteger(round)||round<1||round>latestRound())throw Error('선택 가능한 회차가 아닙니다.');return new Date(Date.UTC(2002,11,7)+(round-1)*7*86400000).toISOString().slice(0,10);}
export function latestRound(){return Math.floor((Date.parse(TODAY+'T00:00:00Z')-Date.UTC(2002,11,7))/(7*86400000))+1;}
export function parseNumbers(text){const n=Array.isArray(text)?text:String(text).split(/[,\s]+/).filter(Boolean).map(Number);if(n.length!==6||new Set(n).size!==6||n.some(v=>!Number.isInteger(v)||v<1||v>45))throw Error('1~45 사이의 서로 다른 번호 6개를 입력해 주세요.');return n.slice().sort((a,b)=>a-b);}
export function validateRecord(raw){
 const round=Number(raw.round??raw.drwNo),date=raw.date??raw.drwNoDate;
 const numbers=parseNumbers(raw.numbers??[raw.drwtNo1,raw.drwtNo2,raw.drwtNo3,raw.drwtNo4,raw.drwtNo5,raw.drwtNo6]);
 const bonus=Number(raw.bonus??raw.bnusNo),winners=Number(raw.winners??raw.firstPrzwnerCo),perWinner=Number(raw.perWinner??raw.firstWinam??raw.firstWinamnt),pool=Number(raw.pool??raw.firstAccumamnt??(winners*perWinner));
 if(!Number.isInteger(round)||round<1||round>latestRound())throw Error('회차 범위를 확인해 주세요.');
 if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date||date<'2002-12-07'||date>TODAY)throw Error('실제 추첨일을 확인해 주세요.');
 if(!Number.isInteger(bonus)||bonus<1||bonus>45||numbers.includes(bonus))throw Error('보너스 번호를 확인해 주세요.');
 if(!Number.isInteger(winners)||winners<0||winners>100000||!Number.isSafeInteger(perWinner)||perWinner<0||perWinner>1e12||!Number.isSafeInteger(pool)||pool<0||pool>1e14||(winners>0&&perWinner===0))throw Error('당첨자 수와 당첨금을 확인해 주세요.');
 let source='';if(raw.source){const u=new URL(raw.source);if(u.protocol!=='https:')throw Error('출처는 HTTPS 주소로 입력해 주세요.');source=u.href;}
 return {round,date,numbers,bonus,winners,perWinner,pool,source,status:raw.status||'사용자 입력 · 검증 필요',poolNote:typeof raw.poolNote==='string'?raw.poolNote:''};
}
export function playerPrize(record,policy='replace'){
 if(record.winners===0){if(record.pool<=0)throw Error('당첨자가 없는 회차는 가상 지급액 또는 배정액을 입력해야 합니다.');return {gross:record.pool,simulatedWinners:1,hypothetical:true};}
 if(policy==='add')return {gross:Math.floor(record.pool/(record.winners+1)),simulatedWinners:record.winners+1,hypothetical:true};
 return {gross:record.perWinner,simulatedWinners:record.winners,hypothetical:false};
}
export function resolvePurchaseDate(date,time='12:00',records=CATALOG){
 if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)throw Error('달력에서 날짜를 선택해 주세요.');
 if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('구매 시간을 확인해 주세요.');
 const day=new Date(date+'T00:00:00Z').getUTCDay(),minutes=Number(time.slice(0,2))*60+Number(time.slice(3));
 if(minutes<360)throw Error('판매 시작은 오전 06:00입니다. 구매 시간을 바꿔 주세요.');
 if(day===6&&minutes>=1200)throw Error('토요일은 20:00부터 판매가 종료됩니다. 20:00 이전 또는 다음 날 06:00 이후를 선택해 주세요.');
 const sorted=records.slice().sort((a,b)=>a.date.localeCompare(b.date));
 if(date<sorted[0].date)throw Error('현재 선택 범위는 첫 추첨일인 2002-12-07부터입니다.');
 const target=sorted.find(r=>r.date>=date);
 if(!target)throw Error('이 날짜의 다음 추첨은 아직 자료가 없습니다. 1,245회 추첨일인 2026-10-10 이전 날짜를 골라 주세요.');
 return {record:target,purchaseDate:date,purchaseTime:time,drawDate:target.date};
}
