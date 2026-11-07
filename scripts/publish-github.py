"""Run only after owner publication authorization; secret path comes from private delivery."""
import os,sys,subprocess,json,pathlib
secret_path=pathlib.Path(sys.argv[1]);token=secret_path.read_text().strip()
env={**os.environ,'GH_TOKEN':token,'GIT_TERMINAL_PROMPT':'0'}
def run(args):
 result=subprocess.run(args,env=env,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 if result.returncode:raise RuntimeError(result.stderr[:1500])
 return result.stdout.strip()
try:
 login=run(['gh','api','user','--jq','.login'])
 if login!='suganthikannan093-hue':raise RuntimeError('Token account differs from connected account: '+login)
 name='solid-light-cocreate';repo=login+'/'+name
 run(['gh','repo','create',repo,'--public','--description','SOLID LIGHT: CO-CREATE — hands-first WebXR spatial construction puzzles with an offline planning agent','--source','.','--remote','origin'])
 run(['git','-c','credential.helper=','-c','credential.helper=!gh auth git-credential','push','-u','origin','main'])
 pages=json.loads(run(['gh','api','--method','POST','repos/'+repo+'/pages','-f','build_type=workflow']))
 result={'repository':'https://github.com/'+repo,'pages':pages.get('html_url'),'status':'pushed; deployment and public gameplay verification pending'}
 pathlib.Path('docs/evidence/publication.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
finally:
 try:secret_path.unlink()
 except FileNotFoundError:pass
