import {MARKET_EVENTS} from './market-data.js';
import {HISTORY_PHASE6} from './history-phase6.js';
import {HISTORY_PHASE5} from './history-phase5.js';
import {HISTORY_PHASE4} from './history-phase4.js';
import {HISTORY_PHASE3} from './history-phase3.js';
import {HISTORY_PHASE2} from './history-phase2.js';
import {HISTORY_EXPANSION} from './history-expansion.js';
export const ALL_HISTORY_EVENTS=[...MARKET_EVENTS,...HISTORY_EXPANSION,...HISTORY_PHASE2,...HISTORY_PHASE3,...HISTORY_PHASE4,...HISTORY_PHASE5,...HISTORY_PHASE6].sort((a,b)=>(a.date.length<10?a.month+'-99':a.date).localeCompare(b.date.length<10?b.month+'-99':b.date));
export const historyDate=(event,date)=>event.dateLabel||date(event.date);
