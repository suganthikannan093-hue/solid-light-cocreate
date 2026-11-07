// Bounded speech generation. Credential file is read privately, never logged.
import {readFile,writeFile,mkdir}from'node:fs/promises';import{execFileSync}from'node:child_process';import{createHash}from'node:crypto';
let key=(await readFile(process.argv[2],'utf8')).trim();
const scenes=JSON.parse(await readFile('docs/submission/narration.json','utf8')),timeline=JSON.parse(await readFile('docs/submission/demo-timeline.json','utf8')),results=[];
await mkdir('.tmp/voice-natural',{recursive:true});
const instructions='Speak as a relaxed developer showing a game to one person beside them. Warm, grounded and conversational, with a natural neutral English accent. Vary emphasis with the meaning. Use small pauses between thoughts and a gentle falling cadence. No sales pitch, announcer voice, dramatic delivery, forced enthusiasm, or artificial filler words. Keep a comfortable but clear pace, roughly 155 words per minute. Pronounce Luma as loo-ma. Read only the supplied words.';
try{for(const scene of scenes){
 const payload={model:'gpt-4o-mini-tts',voice:'marin',input:scene.text,instructions,response_format:'wav',speed:1},digest=createHash('sha256').update(JSON.stringify(payload)).digest('hex'),file=`.tmp/voice-natural/${scene.id}.wav`,cache=`.tmp/voice-natural/${scene.id}.sha256`;
 let cached=false;try{cached=(await readFile(cache,'utf8'))===digest;await readFile(file);}catch{cached=false;}
 if(!cached){const response=await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(60000)});if(!response.ok){let code='unknown';try{code=(await response.json()).error?.code;}catch{}throw Error(`Speech status ${response.status}, code ${code}`);}await writeFile(file,Buffer.from(await response.arrayBuffer()));await writeFile(cache,digest);}
 const seconds=Number(execFileSync('.tmp/video-tools/node_modules/ffprobe-static/bin/darwin/x64/ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',file],{encoding:'utf8'})),original={...timeline.timeline.find(s=>s.id===scene.id)};original.seconds=Math.max(original.seconds,scene.minimum??0);
 if(seconds/(scene.playbackRate??1)+(scene.leadIn??0)>original.seconds-.25)throw Error(`Shorten ${scene.id}: ${seconds.toFixed(2)} seconds exceeds slot ${original.seconds}`);
 results.push({...original,...scene,audio:file,audioSeconds:seconds,voice:'OpenAI marin, AI-generated conversational narration'});console.log(JSON.stringify({scene:scene.id,audioSeconds:seconds,slotSeconds:original.seconds}));
 }await writeFile('.tmp/natural-voice-timing.json',JSON.stringify(results,null,2));}finally{key='';}
