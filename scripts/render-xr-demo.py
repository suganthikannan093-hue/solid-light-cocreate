"""Mux emulator XR capture with pinch-only narration. Enforces the three-minute cap."""
import json, pathlib, subprocess, hashlib
r = pathlib.Path.cwd()
ff = str(r / '.tmp/video-tools/node_modules/ffmpeg-static/ffmpeg')
probe = str(r / '.tmp/video-tools/node_modules/ffprobe-static/bin/darwin/x64/ffprobe')
doc = r / 'docs/submission'
out = doc / 'recordings'
meta = json.loads((doc / 'xr-demo-timeline.json').read_text())
scenes = meta['timeline']
tmp = r / '.tmp/xr-render'
tmp.mkdir(parents=True, exist_ok=True)

def run(args):
    subprocess.run([ff, '-hide_banner', '-loglevel', 'error', '-y', *map(str, args)], check=True)

def duration(p):
    return float(subprocess.check_output([probe, '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', str(p)], text=True))

def stamp(t):
    ms = round(t * 1000)
    return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'

entries, audio = [], []
for s in scenes:
    p = tmp / (s['id'] + '.wav')
    rate = s.get('playbackRate', 1)
    lead = s.get('leadIn', 0)
    filters = f'atempo={rate},loudnorm=I=-17:TP=-2:LRA=9,adelay={round(lead*1000)}:all=1,apad'
    run(['-i', r / s['audio'], '-af', filters, '-t', s['seconds'], '-ar', '48000', '-ac', '2', p])
    audio.append(p)
    words = s['text'].split()
    chunks = [' '.join(words[i:i+10]) for i in range(0, len(words), 10)]
    for i, c in enumerate(chunks):
        begin = s['start'] + lead + s['audioSeconds'] / rate * i / len(chunks)
        end = s['start'] + lead + s['audioSeconds'] / rate * (i + 1) / len(chunks)
        entries.append(f'{len(entries)+1}\n{stamp(begin)} --> {stamp(end)}\n{c}\n')
(doc / 'solid-light-xr-demo.srt').write_text('\n'.join(entries))
(tmp / 'audio.txt').write_text('\n'.join("file '" + str(p) + "'" for p in audio))
run(['-f', 'concat', '-safe', '0', '-i', tmp / 'audio.txt', '-c:a', 'pcm_s16le', tmp / 'narration.wav'])
raw = out / 'solid-light-xr-demo-raw.webm'
game = r / '.tmp/xr-demo-game-audio.webm'
subfile = str(doc / 'solid-light-xr-demo.srt').replace(':', '\\:')
filters = (
    "[0:v]setpts=PTS-STARTPTS,scale=1280:720:force_original_aspect_ratio=decrease,"
    "pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x06101b,"
    f"subtitles='{subfile}':fontsdir=/System/Library/Fonts/Supplemental:"
    "force_style='FontName=Arial,FontSize=18,PrimaryColour=&H00FFFFFF,OutlineColour=&H00101010,Outline=1,Alignment=2,MarginV=24'[v]"
)
args = ['-i', raw, '-i', tmp / 'narration.wav']
if game.exists():
    filters += ';[2:a]volume=0.55[game];[1:a][game]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]'
    args += ['-i', game]
else:
    filters += ';[1:a]alimiter=limit=0.95[a]'
final = out / 'solid-light-xr-demo.mp4'
run([*args, '-filter_complex', filters, '-map', '[v]', '-map', '[a]', '-t', meta['duration'],
     '-c:v', 'libx264', '-preset', 'fast', '-crf', '22', '-pix_fmt', 'yuv420p',
     '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', final])
seconds = duration(final)
assert seconds < 180, seconds
digest = hashlib.sha256(final.read_bytes()).hexdigest()
result = {
    'file': str(final.relative_to(r)),
    'seconds': seconds,
    'bytes': final.stat().st_size,
    'sha256': digest,
    'realGameplay': True,
    'capture': 'Official IWSDK IWER Quest 3 emulator, hand input',
    'narrator': 'OpenAI marin, AI-generated conversational XR narration',
    'physicalQuest': False,
    'captions': 'docs/submission/solid-light-xr-demo.srt',
}
(doc / 'xr-video-manifest.json').write_text(json.dumps(result, indent=2))
print(json.dumps(result))
