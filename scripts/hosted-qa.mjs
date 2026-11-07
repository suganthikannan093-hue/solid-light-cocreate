import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import desktopQA from './desktop-qa.mjs';
const url=process.argv[2];if(!url?.startsWith('https://'))throw Error('Pass the actual public HTTPS URL');
const browser=await chromium.launch({channel:'chromium',headless:true,args:['--use-gl=angle','--use-angle=metal']});
const context=await browser.newContext({viewport:{width:1000,height:720}});const page=await context.newPage();
const errors=[],failed=[];page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failed.push(r.url()));
try{const response=await page.goto(url);if(response.status()!==200)throw Error('HTTP '+response.status());await page.waitForFunction(()=>!!window.solidLight);await page.waitForLoadState('networkidle');await context.setOffline(true);const result=await desktopQA({page,frame:page.mainFrame(),workspaceRoot:process.cwd()});if(errors.length||failed.length)throw Error(JSON.stringify({errors,failed}));await writeFile('docs/evidence/hosted-qa.json',JSON.stringify({url,pass:true,errors,failed,result,at:new Date().toISOString()},null,2));console.log('PASS public HTTPS gameplay, assets and offline-after-load planner: '+url);}
finally{await context.close();await browser.close();}
