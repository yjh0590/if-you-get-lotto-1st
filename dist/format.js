export function parseMoneyInput(value){const text=String(value).trim();if(!/^\d[\d,]*$/.test(text))throw Error('금액은 숫자와 쉼표로 입력해 주세요.');const n=Number(text.replaceAll(',',''));if(!Number.isSafeInteger(n)||n<0)throw Error('금액 범위를 확인해 주세요.');return n;}
export function moneyApprox(n){const a=Math.abs(n);return a>=1e8?`약 ${(a/1e8).toLocaleString('ko-KR',{minimumFractionDigits:2,maximumFractionDigits:2})}억 원`:a>=1e4?`약 ${(a/1e4).toLocaleString('ko-KR',{maximumFractionDigits:2})}만 원`:'';}
export function moneyText(n){const value=Math.round(n),approx=moneyApprox(value);return `${value.toLocaleString('ko-KR')}원${approx?' ('+approx+')':''}`;}
export function sentenceLines(text){return String(text).split(/(?<=[.!?。！？])\s+(?=[가-힣A-Za-z0-9“‘「『])/u).map(s=>s.trim()).filter(Boolean);}
const moneyPattern=/(-?\d[\d,]*(?:\.\d+)?)\s*(억|만)?\s*원(?:\s*\(약\s*[^)]*\))?/g;
export function moneyTokens(text){return [...String(text).matchAll(moneyPattern)].map(m=>({start:m.index,end:m.index+m[0].length,value:Math.round(Number(m[1].replaceAll(',',''))*(m[2]==='억'?1e8:m[2]==='만'?1e4:1))}));}
// Format actual text nodes; never rewrite links, dates, input values or HTML strings.
export function applyReadability(root){
 if(!root||typeof document==='undefined'||typeof document.createTreeWalker!=='function')return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];let node;
 while((node=walker.nextNode()))nodes.push(node);
 for(const node of nodes){
  const parent=node.parentElement;if(!parent||parent.closest('script,style,svg,input,textarea,select,option,a,.money-value,.money-note'))continue;
  const text=node.textContent;if(!text.trim())continue;
  const prose=Boolean(parent.closest('p,li,.note,.game-assumption,.intro-rule,.notice,.era-note,.zero-winner,.choice-feedback small'));
  const lines=prose?sentenceLines(text):[text];
  if(lines.length<=1&&moneyTokens(text).length===0)continue;
  const fragment=document.createDocumentFragment();
  lines.forEach((line,i)=>{if(i)fragment.append(document.createElement('br'));let cursor=0;for(const t of moneyTokens(line)){fragment.append(document.createTextNode(line.slice(cursor,t.start)));const span=document.createElement('span');span.className='money-value';const raw=document.createElement('span');raw.className='money-raw';raw.textContent=Math.round(t.value).toLocaleString('ko-KR')+'원';span.append(raw);const approx=moneyApprox(t.value);if(approx){const small=document.createElement('small');small.className='money-note';small.textContent=' ('+approx+')';span.append(small);}fragment.append(span);cursor=t.end;}fragment.append(document.createTextNode(line.slice(cursor)));});
  node.replaceWith(fragment);
 }
}
