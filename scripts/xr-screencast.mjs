import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync,mkdirSync,existsSync,unlinkSync,rmSync} from 'node:fs';
const session=JSON.parse(readFileSync('.iwsdk/runtime/session.json','utf8'));
const endpoint=session.browserAutomation?.endpoint;
if(!endpoint)throw Error('No CDP endpoint in runtime session');
const stop='.tmp/xr-screencast-stop';
const dir='.tmp/xr-frames';
if(existsSync(stop))unlinkSync(stop);
rmSync(dir,{recursive:true,force:true});
mkdirSync(dir,{recursive:true});
const browser=await chromium.connectOverCDP(endpoint);
const pages=browser.contexts().flatMap(c=>c.pages());
const page=pages.find(p=>/localhost:8081\/?$/.test(p.url()))||pages.find(p=>p.url().includes('localhost:8081'))||pages[0];
if(!page)throw Error('No app page for screencast');
const client=await page.context().newCDPSession(page);
let n=0, started=Date.now();
client.on('Page.screencastFrame',async event=>{
 const i=n++;
 writeFileSync(`${dir}/${String(i).padStart(5,'0')}.jpg`,Buffer.from(event.data,'base64'));
 try{await client.send('Page.screencastFrameAck',{sessionId:event.sessionId});}catch{}
});
await client.send('Page.startScreencast',{format:'jpeg',quality:70,everyNthFrame:1,maxWidth:1280,maxHeight:720});
writeFileSync('.tmp/xr-screencast-ready','1');
while(!existsSync(stop))await new Promise(r=>setTimeout(r,150));
try{await client.send('Page.stopScreencast');}catch{}
writeFileSync('.tmp/xr-screencast-meta.json',JSON.stringify({frames:n,seconds:(Date.now()-started)/1000,url:page.url()},null,2));
process.exit(0);
