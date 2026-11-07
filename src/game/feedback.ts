import type {Point,FailureReason,LevelGoal} from './engine.js';
export function samplePoint(points:Point[],raw:Point):void {
 const last=points[points.length-1];if(last&&Math.hypot(raw[0]-last[0],raw[1]-last[1])<.004)return;
 // Smooth tiny jitter; preserve deliberate corners and sparse input endpoints.
 const nearby=last&&Math.hypot(raw[0]-last[0],raw[1]-last[1])<.04;
 points.push(nearby?[last[0]+.85*(raw[0]-last[0]),last[1]+.85*(raw[1]-last[1])]:raw);
 if(points.length>2048)points.splice(1,1);
}
export function strokeClosure(points:Point[]):{closed:boolean;gap:number}{if(points.length<3)return {closed:false,gap:Infinity};const a=points[0],b=points[points.length-1];const gap=Math.hypot((a[0]-b[0])*1.28,(a[1]-b[1])*.64);return {closed:gap<=.14,gap};}
export function friendlyFailure(reason?:FailureReason):string {switch(reason){case 'DISCONNECTED_SPAN':return 'Connect A to B: your filled outline stops before the far end.';case 'EMPTY_USER_MASK':return 'Draw one closed loop around the dotted ribbon, then release.';case 'INSUFFICIENT_CLEARANCE':return 'Leave air above the path: keep the lower loop thin so our traveler has room to stand.';case 'UNSUPPORTED_PATH':case 'NO_WALKABLE_PATH':return 'Keep a continuous, thick ribbon between A and B along the guide.';case 'RESOURCE_BUDGET':return 'Trim the amber outer edges to fit our light budget. Keep A and B covered inside the tighter guide.';case 'INSUFFICIENT_SHELTER':return 'The path works. Raise your outline to include the upper roof guide.';default:return 'Try another outline around the dotted ribbon.';}}
export function examplePoint(x0:number,x1:number,y0:number,y1:number,t:number):Point {const p=(t%1)*4;return p<1?[x0+(x1-x0)*p,y0]:p<2?[x1,y0+(y1-y0)*(p-1)]:p<3?[x1-(x1-x0)*(p-2),y1]:[x0,y1-(y1-y0)*(p-3)];}

export function drawingGuide(level:number,goal:LevelGoal,roofStep=false,needsExtension=false){const wide=level===4&&!needsExtension;return {x0:(wide?goal.source-2:goal.source-(level===3?1.5:1))/32,x1:(wide?goal.target+3:level===2&&!needsExtension?19:goal.target+(level===3?2.5:2))/32,y0:(level===3&&roofStep?16:level===3?6.25:7)/32,y1:level===4||level===3&&roofStep?18/32:(level===3?10.75:10)/32};}
