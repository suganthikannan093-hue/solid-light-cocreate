export default async function({frame}){
 const play=frame.locator('button[title="Play mode (lock pointer)"]');
 if(await play.count())await play.click().catch(()=>{});
 return frame.evaluate(()=>{
  const w=window.solidLight.world;
  try{window.solidLight.startAudioCapture();}catch{}
  try{
   const source=w.renderer.domElement;
   const stream=source.captureStream(24);
   const mime=['video/webm;codecs=vp8','video/webm'].find(t=>MediaRecorder.isTypeSupported(t))||'video/webm';
   const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:2500000});
   const chunks=[];
   rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   rec.start(250);
   window.__xrCapture={rec,chunks,started:performance.now(),width:source.width,height:source.height,mime};
   return {started:true,width:source.width,height:source.height,presenting:w.renderer.xr.isPresenting,mime};
  }catch(error){
   return {started:false,error:String(error),presenting:w.renderer.xr.isPresenting};
  }
 });
}
