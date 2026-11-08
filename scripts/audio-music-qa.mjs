import {writeFile} from 'node:fs/promises';
export default async function({frame,workspaceRoot}){
 await frame.waitForFunction(()=>{const a=window.solidLight.audioState();return a.state==='running'&&a.voice===''&&a.music&&a.rms>.001;},null,{timeout:15000});
 const before=await frame.evaluate(()=>window.solidLight.audioState());
 await new Promise(resolve=>setTimeout(resolve,33000));
 const after=await frame.evaluate(()=>window.solidLight.audioState());
 if(after.state!=='running'||after.voice||after.rms<.001||after.time-before.time<32)throw Error('Music did not continue across a complete loop: '+JSON.stringify(after));
 const report={pass:true,before,after,at:new Date().toISOString()};await writeFile(workspaceRoot+'/docs/evidence/audio-music-qa.json',JSON.stringify(report,null,2));return report;
}
