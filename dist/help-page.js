import {renderHelp,normalizeHelpSection} from './help-ui.js';
const root=document.querySelector('#help-app');
function render(){root.innerHTML=renderHelp(normalizeHelpSection(location.hash.slice(1)),{standalone:true});}
document.addEventListener('click',event=>{const button=event.target.closest('button[data-help-section]');if(!button)return;location.hash=normalizeHelpSection(button.dataset.helpSection);});
window.addEventListener('hashchange',render);render();
