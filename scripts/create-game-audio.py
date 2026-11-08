"""Build bundled, offline game audio using macOS Samantha and an original score."""
from pathlib import Path
import json, math, wave, struct, subprocess
out=Path('src/game/audio');out.mkdir(exist_ok=True)
ffmpeg='.tmp/video-tools/node_modules/ffmpeg-static/ffmpeg'
lines={
'intro':'Hello, I am Luma. Your outline gives us length and height. I will find the depth. Pinch and hold, trace a closed loop around the ribbon, then release.',
'chapter2':'The incomplete span. First draw around the short ribbon. Let us see how far our light can reach.',
'chapter3':'Welcome to the Light Garden. First draw a thin lower path. Then we will add a separate roof above it.',
'chapter4':'The Last Spark. Build a sheltered crossing with a limited supply of light. A thinner outline saves energy.',
'length':'I can add depth, but I cannot add missing length. Extend your cyan outline across the amber marks.',
'roof':'Our path works. Now add a second closed loop around the upper roof guide. Keep the space between them clear.',
'budget':'Our shape uses too much light. Trim your outline inside the guide, then I will test it again.',
'open':'Bring the glowing end back to the start. Close your loop, then release.',
'build':'We found a safe route. Watch our traveler cross the light.',
'success':'We made it together. Choose Next level when you are ready.',
'finale':'We built this together. Your outline and my depth brought our traveler home. Thank you for creating with me.'}
for key,line in lines.items():
 raw=Path('/tmp')/('solid-light-'+key+'.aiff')
 subprocess.run(['say','-v','Samantha','-r','165','-o',str(raw),line],check=True)
 subprocess.run([ffmpeg,'-hide_banner','-loglevel','error','-y','-i',str(raw),'-c:a','aac','-b:a','96k',str(out/(key+'.m4a'))],check=True)
 raw.unlink()
# Original 32-second C major / A minor ambient loop, with soft pads and bell arpeggios.
rate=24000;seconds=32;chords=[[48,55,60,64],[45,52,57,60],[41,48,53,57],[43,50,55,59]]
raw=Path('/tmp/solid-light-music.wav')
with wave.open(str(raw),'wb') as w:
 w.setnchannels(2);w.setsampwidth(2);w.setframerate(rate)
 data=bytearray()
 for i in range(rate*seconds):
  t=i/rate;part=int(t//8);local=t%8;env=min(1,local/1.5,(8-local)/1.5)
  pad=sum(math.sin(2*math.pi*(440*2**((n-69)/12))*t) for n in chords[part])*.025*env
  beat=int(t//1);age=t%1;note=chords[part][beat%4]+24;freq=440*2**((note-69)/12)
  bell=.065*math.exp(-age*5)*min(1,age/.015)*(math.sin(2*math.pi*freq*t)+.2*math.sin(2*math.pi*freq*2*t))
  fade=min(1,t/.2,(seconds-t)/.2);v=(pad+bell)*fade
  data.extend(struct.pack('<hh',int(v*32767),int((pad+bell*.85)*fade*32767)))
 w.writeframes(data)
subprocess.run([ffmpeg,'-hide_banner','-loglevel','error','-y','-i',str(raw),'-c:a','aac','-b:a','128k',str(out/'music.m4a')],check=True);raw.unlink()
(out/'credits.json').write_text(json.dumps({'voice':'Locally synthesized macOS Samantha','music':'Original procedural ambient composition by SOLID LIGHT','lines':lines},indent=2)+'\n')
print('Created',len(lines),'voice cues and original ambient loop')
