import {writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
export default async function({page,frame,workspaceRoot}){
 const dir=path.join(workspaceRoot,'docs/submission/recordings');
 await mkdir(dir,{recursive:true});
 const raw=path.join(dir,'solid-light-xr-demo-raw.webm');
 const audioPath=path.join(workspaceRoot,'.tmp/xr-demo-game-audio.webm');
 await mkdir(path.join(workspaceRoot,'.tmp'),{recursive:true});
 const result=await frame.evaluate(()=>new Promise((resolve,reject)=>{
  const cap=window.__xrCapture;
  if(!cap){reject(Error('XR capture was not started'));return;}
  cap.rec.onstop=()=>{
   const blob=new Blob(cap.chunks,{type:cap.mime||'video/webm'});
   const reader=new FileReader();
   reader.onload=()=>resolve({dataUrl:String(reader.result),seconds:(performance.now()-cap.started)/1000,width:cap.width,height:cap.height,bytes:blob.size});
   reader.onerror=()=>reject(Error('XR capture read failed'));
   reader.readAsDataURL(blob);
  };
  cap.rec.stop();
 }));
 await writeFile(raw,Buffer.from(result.dataUrl.split(',')[1],'base64'));
 let audio='';
 try{audio=await frame.evaluate(()=>window.solidLight.stopAudioCapture());if(audio)await writeFile(audioPath,Buffer.from(audio.split(',')[1],'base64'));}catch{}
 delete result.dataUrl;
 return {...result,raw:'docs/submission/recordings/solid-light-xr-demo-raw.webm',audio:audio?' .tmp/xr-demo-game-audio.webm':''};
}
