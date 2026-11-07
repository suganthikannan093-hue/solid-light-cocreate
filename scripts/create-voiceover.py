import pathlib,json,subprocess
root=pathlib.Path.cwd();voice=root/'.tmp/voice';voice.mkdir(parents=True,exist_ok=True)
probe=root/'.tmp/video-tools/node_modules/ffprobe-static/bin/darwin/x64/ffprobe'
scenes=json.loads((root/'docs/submission/narration.json').read_text())
for scene in scenes:
 text=voice/(scene['id']+'.txt');audio=voice/(scene['id']+'.aiff');text.write_text(scene['text'])
 subprocess.run(['say','-v','Samantha','-r','165','-f',str(text),'-o',str(audio)],check=True)
 duration=float(subprocess.check_output([str(probe),'-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(audio)],text=True))
 scene['audio']=str(audio.relative_to(root));scene['audioSeconds']=duration;scene['seconds']=max(scene['minimum'],duration+.7)
(root/'docs/submission/voiceover-timing.json').write_text(json.dumps(scenes,indent=2))
print(json.dumps({'voice':'macOS Samantha, synthesized narration','sceneSeconds':{x['id']:round(x['seconds'],2) for x in scenes},'totalSeconds':round(sum(x['seconds'] for x in scenes),2)}))
