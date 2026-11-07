import {OfflineStrategyProvider,type WorldSnapshot,type StrategyProvider,type AgentDecision} from '../game/engine.js';
export interface Suggestion { strategy:'sturdy'|'efficient'; explanation:string }
export function parseSuggestion(value:unknown):Suggestion {
 if(!value||typeof value!=='object')throw Error('Invalid suggestion');const v=value as Record<string,unknown>;
 if(Object.keys(v).sort().join(',')!=='explanation,strategy'||!['sturdy','efficient'].includes(String(v.strategy))||typeof v.explanation!=='string'||v.explanation.length>160||/[<>\u0000-\u001f]/.test(v.explanation))throw Error('Invalid suggestion schema');
 return {strategy:v.strategy as Suggestion['strategy'],explanation:v.explanation};
}
export class CloudStrategyProvider implements StrategyProvider {
 status='Offline planner';private count=0;private offline=new OfflineStrategyProvider();
 constructor(private endpoint:string,public consent=false,private fetcher:typeof fetch=fetch.bind(globalThis),private timeoutMs=3000,private cap=3){}
 async suggest(snapshot:WorldSnapshot):Promise<Suggestion|null>{
  if(!this.consent||!this.endpoint.startsWith('https://')||this.count>=this.cap){this.status='Offline planner (cloud disabled or request cap)';return null;}
  this.count++;const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
  try{const work=(async()=>{const response=await this.fetcher(this.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({consent:true,revision:snapshot.revision,gridSize:snapshot.playerMask.size,occupied:snapshot.playerMask.pixels.reduce((a,b)=>a+b,0),goal:{source:snapshot.goal.source,target:snapshot.goal.target,canopy:snapshot.goal.canopyY!==undefined}})});if(!response.ok)throw Error('Cloud HTTP failure');return parseSuggestion(await response.json());})();
   const result=await Promise.race([work,new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('Cloud timeout'));},this.timeoutMs);})]);this.status='Cloud suggestion; local validation authoritative';return result;
  }catch{this.status='Offline fallback (cloud unavailable)';return null;}finally{clearTimeout(timer);}
 }
 async plan(snapshot:WorldSnapshot):Promise<AgentDecision>{const suggestion=await this.suggest(snapshot);return this.offline.plan({...snapshot,goal:{...snapshot.goal,...(suggestion?{strategy:suggestion.strategy}:{})}});}
}
