import { OfflineStrategyProvider, type WorldSnapshot } from './engine.js';
const planner=new OfflineStrategyProvider();
self.onmessage=(event:MessageEvent<WorldSnapshot>)=>{
 try {self.postMessage({revision:event.data.revision,result:planner.plan(event.data)});}
 catch(error){self.postMessage({revision:event.data.revision,error:String(error)});}
};
