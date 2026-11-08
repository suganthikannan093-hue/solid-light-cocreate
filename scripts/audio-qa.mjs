import {writeFile} from 'node:fs/promises';
import {clickControl} from './ui-controls.mjs';
export default async function({page,frame,workspaceRoot}){
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await frame.waitForFunction(()=>!!window.solidLight?.audioState);
 const state=()=>frame.evaluate(()=>window.solidLight.audioState());
 const results=[];
 await clickControl(frame,'Help');
 await frame.waitForFunction(()=>{const a=window.solidLight.audioState();return a.state==='running'&&a.music&&a.voice==='intro'&&a.rms>.001;},null,{timeout:25000});
 results.push({check:'first gesture unlocks music and voice with nonzero output',state:await state()});
 await frame.evaluate(()=>window.solidLight.startAudioCapture());
 await new Promise(resolve=>setTimeout(resolve,2500));
 const capture=await frame.evaluate(()=>window.solidLight.stopAudioCapture());
 await writeFile(workspaceRoot+'/docs/evidence/audio-preview.webm',Buffer.from(capture.split(',')[1],'base64'));
 await frame.waitForFunction(()=>window.solidLight.audioState().loaded===12);
 await clickControl(frame,'Mute');
 await frame.waitForFunction(()=>{const a=window.solidLight.audioState();return a.muted&&a.rms<.00001;});
 results.push({check:'master mute silences music, voice and effects',state:await state()});
 await clickControl(frame,'Mute');
 await frame.waitForFunction(()=>window.solidLight.audioState().rms>.001);
 await clickControl(frame,'Pause / Resume');
 await frame.waitForFunction(()=>window.solidLight.audioState().state==='suspended');
 results.push({check:'pause suspends mix',state:await state()});
 await clickControl(frame,'Pause / Resume');
 await frame.waitForFunction(()=>window.solidLight.audioState().state==='running');
 await clickControl(frame,'Level 3');
 await frame.waitForFunction(()=>window.solidLight.audioState().voice==='chapter3');
 results.push({check:'chapter selection replaces voice',state:await state()});
 // Every bundled asset is decoded before testing offline chapter guidance.
 await page.context().setOffline(true);
 try{await clickControl(frame,'Level 4');await frame.waitForFunction(()=>window.solidLight.audioState().voice==='chapter4');results.push({check:'voice works offline after loading',state:await state()});}
 finally{await page.context().setOffline(false);}
 if(errors.length)throw Error(errors.join('\n'));
 const report={pass:true,results,errors,at:new Date().toISOString()};
 await writeFile(workspaceRoot+'/docs/evidence/audio-qa.json',JSON.stringify(report,null,2));return report;
}
