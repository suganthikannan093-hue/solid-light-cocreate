import subprocess,pathlib
r=pathlib.Path.cwd();ff=r/'.tmp/video-tools/node_modules/ffmpeg-static/ffmpeg'
subprocess.run([str(ff),'-hide_banner','-loglevel','error','-y','-i',str(r/'docs/submission/recordings/solid-light-cocreate-narrated.mp4'),'-vf','fps=1/20,scale=300:-1,tile=3x3','-frames:v','1',str(r/'.tmp/demo-contact.jpg')],check=True)
