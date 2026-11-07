import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const result=JSON.parse(execFileSync('npx',['@iwsdk/cli','browser','run','scripts/inspect.mjs'],{encoding:'utf8',timeout:25000})).data.result;
if(result.phase!=='level-complete'||!result.decision.pass)throw Error(JSON.stringify(result));writeFileSync('docs/evidence/xr-hand-result.json',JSON.stringify({pass:true,...result},null,2));console.log('PASS final Level 1 hand input and verified crossing.');
