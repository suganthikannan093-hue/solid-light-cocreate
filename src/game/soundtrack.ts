const urls = import.meta.glob('./audio/*.m4a', {eager:true,query:'?url',import:'default'}) as Record<string,string>;
export type VoiceCue = 'intro'|'chapter2'|'chapter3'|'chapter4'|'length'|'roof'|'budget'|'open'|'build'|'success'|'finale';
/** One mix for bundled offline voice, ambient music, effects and recordings. */
export class Soundtrack {
 context?:AudioContext;
 output?:GainNode;
 private musicGain?:GainNode;
 private analyser?:AnalyserNode;
 private music?:AudioBufferSourceNode;
 private voice?:AudioBufferSourceNode;
 private buffers=new Map<string,Promise<AudioBuffer>>();
 private ready=new Set<string>();
 private muted=false;
 private volume=0.8;
 private paused=false;
 private generation=0;
 private pending:VoiceCue='intro';
 private lastCue='';
 private voicePlaying='';
 private error='';
 private sample=new Float32Array(256);
 private level=0;
 private now=0;
 private load(name:string):Promise<AudioBuffer>{
  let buffer=this.buffers.get(name);
  if(!buffer){buffer=fetch(urls[`./audio/${name}.m4a`]).then(r=>{if(!r.ok)throw Error(`Audio HTTP ${r.status}`);return r.arrayBuffer();}).then(b=>this.context!.decodeAudioData(b)).then(b=>{this.ready.add(name);return b;});this.buffers.set(name,buffer);buffer.catch(()=>this.buffers.delete(name));}
  return buffer;
 }
 unlock(){
  try{
   if(!this.context){const c=this.context=new AudioContext();this.output=c.createGain();this.output.gain.value=this.muted?0:this.volume;this.analyser=c.createAnalyser();this.analyser.fftSize=256;this.output.connect(this.analyser).connect(c.destination);this.musicGain=c.createGain();this.musicGain.gain.value=.55;this.musicGain.connect(this.output);
    // Fetch/decode all short cues up front so the loaded experience works offline.
    for(const name of Object.keys(urls).map(p=>p.split('/').pop()!.replace('.m4a','')))void this.load(name).catch(()=>{this.error='Some audio could not load. Reconnect and try Help.';});
   }
   if(!this.paused)void this.context.resume().then(()=>{if(this.context?.state!=='running'){this.error='Tap Enable sound, or press Help, to start audio.';return;}this.error=this.error.startsWith('Tap Enable')||this.error.startsWith('Select Help')?'':this.error;if(!this.muted&&!this.paused){this.startMusic();if(this.pending)this.speak(this.pending);}}).catch(()=>{this.error='Tap Enable sound, or press Help, to start audio.';});
  }catch{this.error='Audio unavailable in this browser.';}
 }
 private startMusic(){if(this.music||!this.context)return;const source=this.context.createBufferSource();this.music=source;void this.load('music').then(buffer=>{if(this.music!==source)return;source.buffer=buffer;source.loop=true;source.connect(this.musicGain!);source.start();}).catch(()=>{this.music=undefined;this.error='Background music could not load.';});}
 speak(cue:VoiceCue,repeat=false){
  this.pending=cue;
  if(!this.context||this.muted||this.paused||(!repeat&&this.lastCue===cue))return;
  this.lastCue=cue;const generation=++this.generation;this.voice?.stop();this.voice=undefined;this.voicePlaying='';
  void this.load(cue).then(buffer=>{
   if(generation!==this.generation||this.muted||this.paused)return;
   const source=this.context!.createBufferSource();source.buffer=buffer;source.connect(this.output!);this.voice=source;this.voicePlaying=cue;this.musicGain!.gain.setTargetAtTime(.12,this.context!.currentTime,.12);
   source.onended=()=>{if(this.voice===source){this.voice=undefined;this.voicePlaying='';this.musicGain!.gain.setTargetAtTime(.55,this.context!.currentTime,.4);}};source.start();
  }).catch(()=>{this.lastCue='';this.error='Voice could not load. Select Help to retry.';});
 }
 setMuted(value:boolean){this.muted=value;if(value){this.cancelVoice();}this.output?.gain.setTargetAtTime(value||this.paused?0:this.volume,this.context!.currentTime,.025);if(!value){this.lastCue='';this.unlock();}}
 setPaused(value:boolean){if(this.paused===value)return;this.paused=value;if(value){this.cancelVoice();this.output?.gain.setValueAtTime(0,this.context!.currentTime);void this.context?.suspend();}else{this.output?.gain.setValueAtTime(this.muted?0:this.volume,this.context!.currentTime);this.unlock();}}
 cancelVoice(){this.generation++;this.voice?.stop();this.voice=undefined;this.voicePlaying='';this.lastCue='';if(this.context)this.musicGain?.gain.setTargetAtTime(.55,this.context.currentTime,.2);}
 motif(kind:'draw'|'build'|'ask'|'success'|'test-fail'){
  if(!this.context)this.unlock();if(!this.context||this.muted||this.paused)return;
  const c=this.context;
  const notes={draw:[392],build:[392,523,659],ask:[523,440,392],success:[523,659,784,1046],'test-fail':[330,294]}[kind];
  notes.forEach((frequency,i)=>{const osc=c.createOscillator(),gain=c.createGain(),time=c.currentTime+i*.105;osc.frequency.value=frequency;gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(.075,time+.015);gain.gain.exponentialRampToValueAtTime(.001,time+.22);osc.connect(gain).connect(this.output!);osc.start(time);osc.stop(time+.25);});
 }
 setVolume(value:number){this.volume=Math.max(0,Math.min(1,value));if(!this.muted&&!this.paused)this.output?.gain.setTargetAtTime(this.volume,this.context?.currentTime??0,.025);}
 status(){if(this.analyser){this.analyser.getFloatTimeDomainData(this.sample);this.level=Math.sqrt(this.sample.reduce((s,v)=>s+v*v,0)/this.sample.length);this.now=this.context!.currentTime;}return {state:this.context?.state??'locked',muted:this.muted,paused:this.paused,music:!!this.music,voice:this.voicePlaying,loaded:this.ready.size,rms:this.level,time:this.now,error:this.error,volume:this.volume};}
 dispose(){this.generation++;this.voice?.stop();try{this.music?.stop();}catch{/* A still-loading source has not started. */}this.music=undefined;void this.context?.close();}
}
