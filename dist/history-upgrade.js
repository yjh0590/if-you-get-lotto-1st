export const LATEST_HISTORY_EDITION=6;
export function canUpgradeHistory(s){return Boolean(s?.market&&s.learning&&!s.ended&&!s.pending&&(s.historyEdition||0)<LATEST_HISTORY_EDITION);}
export function upgradeHistory(s){
 if(!canUpgradeHistory(s))throw Error('진행 중인 선택을 마친 학습 기록에서 연결할 수 있어요.');
 // Do not reinitialize prices, holdings, comparisons or the current month's queue.
 s.historyEdition=LATEST_HISTORY_EDITION;
 s.market.historyEdition=LATEST_HISTORY_EDITION;
 s.log.push({id:s.log.length+1,month:s.month,type:'action',title:'새 역사 자료 연결',text:'누락 사건과 시작 전 배경을 포함한 역사 자료 6판을 연결했습니다. 이후 진행하는 달부터 적용하며 지나간 사건·자산·확정 선택은 바꾸지 않습니다.'});
}
