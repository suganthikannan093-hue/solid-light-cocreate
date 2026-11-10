import type {Point,FailureReason,LevelGoal} from './engine.js';
export const CLOSURE_GAP=0.22;
export function samplePoint(points:Point[],raw:Point,interpolate=false):void {
 const last=points[points.length-1];
 const dist=last?Math.hypot(raw[0]-last[0],raw[1]-last[1]):Infinity;
 if(last&&dist<.004)return;
 // Fill large gaps from dropped pointer events without rewriting deliberate corners in tests.
 if(interpolate&&last&&dist>.08){
  const steps=Math.min(8,Math.floor(dist/.04));
  for(let i=1;i<=steps;i++)points.push([last[0]+(raw[0]-last[0])*i/(steps+1),last[1]+(raw[1]-last[1])*i/(steps+1)]);
 }
 // Smooth tiny jitter; preserve deliberate corners and sparse input endpoints.
 const nearby=last&&dist<.04;
 points.push(nearby?[last[0]+.85*(raw[0]-last[0]),last[1]+.85*(raw[1]-last[1])]:raw);
 if(points.length>2048)points.splice(1,1);
}
export function strokeGap(points:Point[]):number{if(points.length<2)return Infinity;const a=points[0],b=points[points.length-1];return Math.hypot((a[0]-b[0])*1.28,(a[1]-b[1])*.64);}
export function strokeClosure(points:Point[]):{closed:boolean;gap:number}{if(points.length<3)return {closed:false,gap:Infinity};const gap=strokeGap(points);return {closed:gap<=CLOSURE_GAP,gap};}
/** Snap a nearly closed outline back to its start so LUMA receives a loop, not a gap. */
export function closeIfNear(points:Point[]):{closed:boolean;points:Point[];gap:number}{
 const closure=strokeClosure(points);
 if(!closure.closed)return {closed:false,points,gap:closure.gap};
 const first=points[0],last=points[points.length-1];
 const already=Math.hypot(last[0]-first[0],last[1]-first[1])<.002;
 return {closed:true,points:already?points:[...points,first],gap:closure.gap};
}
export function friendlyFailure(reason?:FailureReason):string {switch(reason){case 'DISCONNECTED_SPAN':return 'Connect A to B: your loop stops before the far bank. The amber marks show the missing stretch. Draw a longer closed loop that reaches B.';case 'EMPTY_USER_MASK':return 'Draw one closed loop around the dotted ribbon, then release.';case 'INSUFFICIENT_CLEARANCE':return 'Leave air above the path: keep the lower loop thin so our traveler has room to stand.';case 'UNSUPPORTED_PATH':case 'NO_WALKABLE_PATH':return 'Keep a continuous, thick ribbon between A and B along the guide.';case 'RESOURCE_BUDGET':return 'Trim the amber outer edges to fit our light budget. Keep A and B covered inside the tighter guide.';case 'INSUFFICIENT_SHELTER':return 'The path works. Raise your outline to include the upper roof guide.';default:return 'Try another outline around the dotted ribbon.';}}
export function examplePoint(x0:number,x1:number,y0:number,y1:number,t:number):Point {const p=(t%1)*4;return p<1?[x0+(x1-x0)*p,y0]:p<2?[x1,y0+(y1-y0)*(p-1)]:p<3?[x1-(x1-x0)*(p-2),y1]:[x0,y1-(y1-y0)*(p-3)];}

export function drawingGuide(level:number,goal:LevelGoal,roofStep=false,needsExtension=false){const wide=level===4&&!needsExtension;const tightSpark=level===4&&needsExtension;return {x0:(wide?goal.source-2:tightSpark?goal.source-0.5:goal.source-(level===3?1.5:1))/32,x1:(wide?goal.target+3:tightSpark?goal.target+1.5:level===2&&!needsExtension?19:goal.target+(level===3?2.5:2))/32,y0:(level===3&&roofStep?16:level===3?6.25:7)/32,y1:level===4||level===3&&roofStep?18/32:(level===3?10.75:10)/32};}

export function chapterIntro(level:number,variant=0,budget?:number):string{
 if(level===1)return '01 · Pinch and hold. Go around the dotted ribbon in one closed loop, then release.';
 if(level===2)return '02 · Incomplete Span. Start with the SHORT dotted ribbon. LUMA will test a solid, fall short, and ask you to extend the loop to B with your hands.';
 if(level===3)return '03 of 4 · TWO LOOPS. First pinch a thin LOWER path from A to B. After LUMA confirms, add a SECOND closed loop around the UPPER roof. Next is The Last Spark.';
 return `04 of 4 · The Last Spark — the ending${variant?' / Remix '+(((variant-1)%4)+1)+'/4':''}. One sheltered crossing${budget?` within ${budget} light units`:''}. Stay inside the tighter guide so the traveler can reach home.`;
}

export function disconnectedSpanHint():string{
 return 'LUMA’s bridge falls short — its search cannot invent the missing length. The amber marks the gap. Extend your cyan loop to B with your hands, then release. Only you can add length; LUMA will replan the depth.';
}

export function incompleteSpanSuccess():string{
 return 'YOU EXTENDED THE SPAN. LUMA’s first solid fell short; your longer loop made a safe crossing. Our traveler is home. Choose Next level for the Light Garden.';
}

export function budgetHint(cost?:number,budget?:number):string{
 const used=cost!=null&&budget!=null?` Light used: ${cost} / ${budget}.`:'';
 return 'Trim the amber outer edges to fit our light budget. Keep A and B covered inside the tighter guide.'+used;
}
