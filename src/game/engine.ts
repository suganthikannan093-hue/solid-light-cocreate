export const N = 32;
export type Point = [number, number];
export type Cell = [number, number, number];
export interface Mask2D { size:number; pixels:Uint8Array; revision:number }
export interface VoxelVolume { dimensions:[number,number,number]; occupancy:Uint8Array; revision:number }
export interface LevelGoal { source:number; target:number; deck:number; footprint:number; clearance:number; thickness:number; canopyY?:number; strategy?:'sturdy'|'efficient'; voxelBudget?:number }
export type FailureReason = 'EMPTY_USER_MASK'|'DISCONNECTED_SPAN'|'INSUFFICIENT_CLEARANCE'|'UNSUPPORTED_PATH'|'NO_WALKABLE_PATH'|'TIME_BUDGET_EXCEEDED'|'INVALID_CANDIDATE'|'INSUFFICIENT_SHELTER'|'RESOURCE_BUDGET';
export interface GeometryDiagnostic { reason:FailureReason; columns:number[]; message:string; region?:'canopy'|'trim' }
export interface ValidationReport { pass:boolean; failures:FailureReason[]; diagnostics:GeometryDiagnostic[]; path:Cell[]; score:number; constraints?:{path:boolean;shelter:boolean};cost?:number;budget?:number }
export interface AttemptSummary { id:string; width:number; deck:number; pass:boolean; failures:FailureReason[]; score:number }
export interface AgentDecision { phase:'success'|'needs-user'|'unable-to-solve'; side:Mask2D; volume:VoxelVolume; report:ValidationReport; attempts:AttemptSummary[]; elapsed:number }
export interface WorldSnapshot { revision:number; playerMask:Mask2D; goal:LevelGoal; previousAttempts:AttemptSummary[] }
export interface GameState { level:number; revision:number; phase:string; message:string; paused:boolean; stroke:Point[];openGap:boolean;front:number[]; side:number[]; instances:number; decision:AgentDecision|undefined; events:Array<Record<string,unknown>>; render:{frame:number;calls:number;triangles:number;points:number;lines:number}; completed:number[]; roofStep:boolean }
export interface SearchBudget { maxCandidates:number; milliseconds:number }
export interface AgentObservation { occupied:number; missingColumns:number[] }
export interface StrategyProvider { plan(snapshot:WorldSnapshot,budget?:SearchBudget):AgentDecision|Promise<AgentDecision> }
export interface FeatureFlags { enableLevel3:boolean; enableCloudLLM:boolean; enablePassthrough:boolean }
export const featureFlags:FeatureFlags={enableLevel3:typeof location==='undefined'||!new URLSearchParams(location.search).has('p0only'),enableCloudLLM:typeof location!=='undefined'&&new URLSearchParams(location.search).has('cloud'),enablePassthrough:false};
export function goalFor(level:number,variant=0):LevelGoal {const presets=[{source:3,target:28,footprint:5,voxelBudget:1700},{source:4,target:27,footprint:7,voxelBudget:1600},{source:5,target:26,footprint:7,voxelBudget:1450},{source:2,target:29,footprint:9,voxelBudget:2750}];return {source:level===1?4:2,target:level===1?27:29,deck:10,footprint:5,clearance:6,thickness:3,...(level>=3?{canopyY:16,strategy:'sturdy' as const}:{}),...(level===4?presets[variant%presets.length]:{})};}

export const emptyMask=(revision=0):Mask2D=>({size:N,pixels:new Uint8Array(N*N),revision});
export function rectangle(x0:number,y0:number,x1:number,y1:number,revision=0):Mask2D {
 const m=emptyMask(revision);for(let y=Math.max(0,y0);y<=Math.min(N-1,y1);y++)for(let x=Math.max(0,x0);x<=Math.min(N-1,x1);x++)m.pixels[x+N*y]=1;return m;
}
// Garden strokes add only pixels the human actually drew; planner ownership is unchanged.
export function addMask(base:Mask2D,stroke:Mask2D,revision:number):Mask2D {const next=emptyMask(revision);for(let i=0;i<next.pixels.length;i++)next.pixels[i]=base.pixels[i]||stroke.pixels[i]?1:0;return next;}
export function rasterize(input:Point[],revision:number):Mask2D {
 const mask=emptyMask(revision);if(input.length<3)return mask;
 const points=input.slice(0,2048).map(([x,y])=>[Math.max(0,Math.min(1,x)),Math.max(0,Math.min(1,y))] as Point);
 let area=0;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++) {
  const px=(x+.5)/N,py=(y+.5)/N;let inside=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++) {const a=points[i],b=points[j];if((a[1]>py)!==(b[1]>py)&&px<(b[0]-a[0])*(py-a[1])/(b[1]-a[1])+a[0])inside=!inside;}
  if(inside){mask.pixels[x+N*y]=1;area++;}
 }
 if(area<6)mask.pixels.fill(0);return mask;
}
export const index=(x:number,y:number,z:number)=>x+N*(y+N*z);
export function buildIntersection(front:Mask2D,side:Mask2D):VoxelVolume {
 const occupancy=new Uint8Array(N*N*N);
 for(let z=0;z<N;z++)for(let y=0;y<N;y++)if(side.pixels[z+N*y])for(let x=0;x<N;x++)occupancy[index(x,y,z)]=front.pixels[x+N*y];
 return {dimensions:[N,N,N],occupancy,revision:front.revision};
}
export function inspectWorld(front:Mask2D,goal:LevelGoal):AgentObservation {
 const missingColumns:number[]=[];let occupied=0;for(const p of front.pixels)occupied+=p;
 for(let x=goal.source;x<=goal.target;x++){let filled=false;for(let y=0;y<N;y++)filled ||=!!front.pixels[x+N*y];if(!filled)missingColumns.push(x);}
 return {occupied,missingColumns};
}
export function validate(volume:VoxelVolume,goal:LevelGoal):ValidationReport {
 const a=volume.occupancy;const solid=(x:number,y:number,z:number)=>x>=0&&x<N&&y>=0&&y<N&&z>=0&&z<N&&a[index(x,y,z)]===1;
 const standable=new Uint8Array(N*N*N);let supports=0;
 // Rigid light decks are supported by bank-to-bank connectivity. Minimum local thickness and footprint are mandatory.
 const radius=Math.floor(goal.footprint/2);
 for(let z=radius;z<N-radius;z++)for(let x=0;x<N;x++)for(let y=Math.max(2,goal.deck-1);y<=goal.deck+1;y++) {
  let ok=true;for(let dx=-1;dx<=1;dx++)for(let dz=-radius;dz<=radius;dz++)for(let d=1;d<=goal.thickness;d++)if(!solid(x+dx,y-d,z+dz))ok=false;
  for(let dx=-1;dx<=1;dx++)for(let dz=-radius;dz<=radius;dz++)for(let h=0;h<goal.clearance;h++)if(solid(x+dx,y+h,z+dz))ok=false;
  if(ok){standable[index(x,y,z)]=1;supports++;}
 }
 const queue:Cell[]=[],parents=new Int32Array(N*N*N).fill(-2);
 for(let z=1;z<N-1;z++)if(standable[index(goal.source,goal.deck,z)]){queue.push([goal.source,goal.deck,z]);parents[index(goal.source,goal.deck,z)]=-1;}
 let end:Cell|undefined;
 for(let q=0;q<queue.length;q++) {const [x,y,z]=queue[q];if(x===goal.target&&y===goal.deck){end=queue[q];break;}
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])for(let dy=-1;dy<=1;dy++) {const xx=x+dx,yy=y+dy,zz=z+dz;if(xx<goal.source||xx>goal.target||yy<0||yy>=N||zz<1||zz>=N-1)continue;const k=index(xx,yy,zz);if(standable[k]&&parents[k]===-2){parents[k]=index(x,y,z);queue.push([xx,yy,zz]);}}
 }
 const path:Cell[]=[];if(end){let k=index(...end);while(k>=0){const z=Math.floor(k/(N*N)),y=Math.floor(k/N)%N,x=k%N;path.push([x,y,z]);k=parents[k];}path.reverse();}
 const missing:number[]=[];for(let x=goal.source;x<=goal.target;x++){let exists=false;for(let y=0;y<N;y++)for(let z=0;z<N;z++)exists ||=solid(x,y,z);if(!exists)missing.push(x);}
 const reason:FailureReason=missing.length?'DISCONNECTED_SPAN':supports?'NO_WALKABLE_PATH':'INSUFFICIENT_CLEARANCE';
 let shelter=true;const uncovered:number[]=[];if(goal.canopyY!==undefined){for(let x=goal.source;x<=goal.target;x++){let covered=false;for(let z=radius;z<N-radius;z++){let ok=true;for(let dx=-1;dx<=1;dx++)for(let dz=-radius;dz<=radius;dz++)if(!solid(x+dx,goal.canopyY,z+dz))ok=false;covered ||=ok;}if(!covered)uncovered.push(x);}for(const [x,,z] of path){let ok=true;for(let dx=-1;dx<=1;dx++)for(let dz=-radius;dz<=radius;dz++)if(!solid(x+dx,goal.canopyY,z+dz))ok=false;if(!ok&&!uncovered.includes(x))uncovered.push(x);}shelter=uncovered.length===0;}
 const cost=a.reduce((sum,value)=>sum+value,0);const pathOK=path.length>0,pass=pathOK&&shelter;if(pass&&goal.voxelBudget!==undefined&&cost>goal.voxelBudget){const columns:number[]=[];for(let x=0;x<N;x++)if(x<goal.source-1||x>goal.target+1){let filled=false;for(let y=0;y<N;y++)for(let z=0;z<N;z++)filled ||=solid(x,y,z);if(filled)columns.push(x);}return {pass:false,path,cost,budget:goal.voxelBudget,failures:['RESOURCE_BUDGET'],diagnostics:[{reason:'RESOURCE_BUDGET',columns,region:'trim',message:'Trim the amber outer edges. Keep A and B covered inside the tighter guide.'}],score:0,constraints:{path:true,shelter:true}};}if(pathOK&&!shelter)return {pass:false,path,failures:['INSUFFICIENT_SHELTER'],diagnostics:[{reason:'INSUFFICIENT_SHELTER',columns:uncovered,region:'canopy',message:'Our path works, but the garden needs shelter. Raise your cyan outline through the upper amber band.'}],score:0,constraints:{path:pathOK,shelter}};
 return {pass,path,cost,budget:goal.voxelBudget,constraints:{path:pathOK,shelter},failures:pass?[]:[reason],diagnostics:pass?[]:[{reason,columns:missing,message:missing.length?'Extend your cyan outline through the amber marked columns.':'Draw a solid band along the guide, with room above for our traveler.'}],score:pass?100000-a.reduce((s,v)=>s+v,0):queue.length};
}
export function proposeProjection(deck:number,width:number,thickness:number,revision:number,goal:LevelGoal):Mask2D {
 const side=rectangle(Math.floor((N-width)/2),deck-thickness,Math.floor((N+width)/2)-1,deck-1,revision);
 if(goal.canopyY!==undefined){const lo=Math.floor((N-width)/2),hi=Math.floor((N+width)/2)-1;for(let z=lo;z<=hi;z++)for(let y=goal.canopyY;y<=goal.canopyY+1;y++)side.pixels[z+N*y]=1;for(let y=deck-1;y<=goal.canopyY+1;y++){side.pixels[lo+N*y]=1;side.pixels[hi+N*y]=1;}}
 return side;
}
export class OfflineStrategyProvider implements StrategyProvider {
 plan(snapshot:WorldSnapshot,budget:SearchBudget={maxCandidates:24,milliseconds:800}):AgentDecision {
  const start=performance.now(),{playerMask:front,goal}=snapshot,observation=inspectWorld(front,goal),attempts:AttemptSummary[]=[];
  const preferredWidth=goal.canopyY!==undefined?(goal.strategy==='efficient'?9:23):Math.min(23,Math.max(5,Math.round(observation.occupied/(goal.target-goal.source+1)*2+3)));
  let side=emptyMask(front.revision),volume=buildIntersection(front,side),report=validate(volume,goal),best:AgentDecision|undefined;let closest:AgentDecision|undefined;
  for(const deck of [goal.deck,goal.deck+1,goal.deck-1])for(const width of [5,9,15,23])for(const thickness of [3,4]) {
   if(attempts.length>=budget.maxCandidates||performance.now()-start>budget.milliseconds)break;
   side=proposeProjection(deck,width,thickness,front.revision,goal);
   volume=buildIntersection(front,side);report=validate(volume,goal);if(report.pass)report.score-=Math.abs(width-preferredWidth)*1000;
   attempts.push({id:`${deck}-${width}-${thickness}`,width,deck,pass:report.pass,failures:report.failures,score:report.score});
   if(!report.pass&&(!closest||report.path.length>closest.report.path.length||(report.path.length===closest.report.path.length&&report.score>closest.report.score)))closest={phase:'needs-user',side,volume,report,attempts,elapsed:0};
   if(report.pass&&(!best||report.score>best.report.score))best={phase:'success',side,volume,report,attempts,elapsed:0};
  }
  if(best)return {...best,attempts,elapsed:performance.now()-start};
  if(closest){side=closest.side;volume=closest.volume;report=closest.report;}
  if(!observation.occupied){report={...report,failures:['EMPTY_USER_MASK'],diagnostics:[{reason:'EMPTY_USER_MASK',columns:[],message:'Pinch and hold to draw a closed outline around the dotted guide.'}]};}
  else if(observation.missingColumns.length){report={...report,failures:['DISCONNECTED_SPAN'],diagnostics:[{reason:'DISCONNECTED_SPAN',columns:observation.missingColumns,message:'My side view cannot add missing length. Extend your cyan outline across the amber marks.'}]};}
  return {phase:'needs-user',side,volume,report,attempts,elapsed:performance.now()-start};
 }
}
export const isCurrentRevision=(current:number,incoming:number)=>current===incoming;
