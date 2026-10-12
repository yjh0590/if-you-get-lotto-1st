import {readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
for(const file of ['dist/index.html','dist/styles.css','dist/data.js','dist/engine.js','dist/app.js','dist/lottery.js','dist/lottery-data.js','dist/regions.js','dist/format.js','dist/shop-data.js','dist/lifestyle.js','dist/lifestyle-ui.js','dist/stories.js','dist/stories-ui.js','dist/market-data.js','dist/market.js','dist/market-ui.js','dist/policy-data.js','dist/korea-economy.js','dist/korea-ui.js','dist/learning.js','dist/learning-ui.js','dist/avatar.js']) if(!existsSync(file)) throw new Error(`Missing ${file}`);
for(const file of ['dist/data.js','dist/engine.js','dist/app.js','dist/lottery.js','dist/lottery-data.js','dist/regions.js','dist/format.js','dist/shop-data.js','dist/lifestyle.js','dist/lifestyle-ui.js','dist/stories.js','dist/stories-ui.js','dist/market-data.js','dist/market.js','dist/market-ui.js','dist/policy-data.js','dist/korea-economy.js','dist/korea-ui.js','dist/learning.js','dist/learning-ui.js','dist/avatar.js']) execFileSync(process.execPath,['--check',file]);
const html=readFileSync('dist/index.html','utf8');
for(const path of ['styles.css','app.js']) if(!html.includes(path)) throw new Error(`Unlinked ${path}`);
console.log('Static build verified. Output: dist/');
