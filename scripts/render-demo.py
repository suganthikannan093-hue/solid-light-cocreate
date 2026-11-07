"""Render real capture with local synthesized narration, game audio and captions."""
import json,pathlib,subprocess
r=pathlib.Path.cwd(); ff=str(r/'.tmp/video-tools/node_modules/ffmpeg-static/ffmpeg'); probe=str(r/'.tmp/video-tools/node_modules/ffprobe-static/bin/darwin/x64/ffprobe')
doc=r/'docs/submission'; out=doc/'recordings'; meta=json.loads((doc/'demo-timeline.json').read_text()); scenes=meta['timeline']; tmp=r/'.tmp/render';tmp.mkdir(parents=True,exist_ok=True)
def run(args):subprocess.run([ff,'-hide_banner','-loglevel','error','-y',*map(str,args)],check=True)
def duration(p):return float(subprocess.check_output([probe,'-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(p)],text=True))
def stamp(t):
 ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
entries=[];audio=[]
for s in scenes:
 p=tmp/(s['id']+'.wav');run(['-i',r/s['audio'],'-af','loudnorm=I=-17:TP=-2:LRA=9,apad','-t',s['seconds'],'-ar','48000','-ac','2',p]);audio.append(p)
 words=s['text'].split();chunks=[' '.join(words[i:i+10]) for i in range(0,len(words),10)]
 for i,c in enumerate(chunks):
  begin=s['start']+s['audioSeconds']*i/len(chunks);end=s['start']+s['audioSeconds']*(i+1)/len(chunks)
  entries.append(f'{len(entries)+1}\n{stamp(begin)} --> {stamp(end)}\n{c}\n')
(doc/'solid-light-demo.srt').write_text('\n'.join(entries));(tmp/'audio.txt').write_text('\n'.join("file '"+str(p)+"'" for p in audio))
run(['-f','concat','-safe','0','-i',tmp/'audio.txt','-c:a','pcm_s16le',tmp/'narration.wav'])
raw=out/'solid-light-full-demo-raw.webm';trim=max(0,duration(raw)-meta['duration']);delay=round(meta['audioOffset']*1000)
subfile=str(doc/'solid-light-demo.srt').replace(':','\\:')
filters=f"[0:v]setpts=PTS-STARTPTS,pad=1280:800:0:0:color=0x06101b,subtitles='{subfile}':fontsdir=/System/Library/Fonts/Supplemental:force_style='FontName=Arial,FontSize=10,PrimaryColour=&H00FFFFFF,OutlineColour=&H00101010,Outline=1,Alignment=2,MarginV=7'[v];[2:a]adelay={delay}|{delay},volume=0.65[game];[1:a][game]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]"
final=out/'solid-light-cocreate-narrated.mp4';run(['-ss',trim,'-i',raw,'-i',tmp/'narration.wav','-i',r/'.tmp/demo-game-audio.webm','-filter_complex',filters,'-map','[v]','-map','[a]','-t',meta['duration'],'-c:v','libx264','-preset','fast','-crf','22','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart',final])
result={'file':str(final.relative_to(r)),'seconds':duration(final),'bytes':final.stat().st_size,'realGameplay':True,'narrator':'macOS Samantha synthesized voice','gameAudio':'Recorded WebAudio motifs, no microphone','trimmedLoadingSeconds':trim,'captions':'docs/submission/solid-light-demo.srt'}
assert result['seconds']<180
(doc/'video-manifest.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
