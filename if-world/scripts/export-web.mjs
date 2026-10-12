import {cpSync,mkdirSync,rmSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const output=resolve('exports/if-world');
if(!existsSync('dist/index.html'))throw Error('dist/index.html is missing');
rmSync(output,{recursive:true,force:true});mkdirSync(output,{recursive:true});cpSync('dist',output,{recursive:true});
console.log('Static game exported to '+output+' (copy this folder into your site projects directory).');
