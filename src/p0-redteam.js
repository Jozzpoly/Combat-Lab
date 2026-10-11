// Kills or limits the first P0 material-chain positive, no best-case filtering.
// Robustness is POST-HOC: do not pass it off as predeclared discovery data.
import {continuation} from "./p0-chain.js";
function compare(a,b){return {
 openedGate:Math.abs(b.gateAfterOpener)>0.3,
 changedCross:b.runnerCrossed&&!a.runnerCrossed,
 ordinaryCross:a.runnerCrossed,
 sameCross:b.runnerCrossed===a.runnerCrossed,
 deltaX:+(b.runnerAfter.x-a.runnerAfter.x).toFixed(4),
 closedGateContact:a.runnerGateImpulse,
 openedGateContact:b.runnerGateImpulse,
 firstActionGateContact:b.openerGateImpulse
};}
export function redteamP0(mode="all"){
 const data=[];
 if(["all","spatial"].includes(mode)){
  for(const y of [10.6,11.6,12.6])
   for(const speed of [4.75,5.5,6.25]){
    const key={worldSupport:"finite",kind:"small",speed,runnerY:y,openerKind:"bulky"};
    const closed=continuation({...key,changed:false});
    const opened=continuation({...key,changed:true});
    data.push({axis:"lateral start and impulse",key,closed,opened,compare:compare(closed,opened)});
   }
 }
 if(["all","opener"].includes(mode)){
  for(const openerKind of ["small","bulky","lever","rigid-lever"])
   for(const speed of [3.5,5.5]){
    const key={worldSupport:"finite",kind:"small",speed,runnerY:11.6,openerKind};
    const closed=continuation({...key,changed:false});
    const opened=continuation({...key,changed:true});
    data.push({axis:"different first-actor morphology",key,closed,opened,compare:compare(closed,opened)});
   }
 }
 if(data.some(x=>!x.closed.finite||!x.opened.finite||
  x.closed.rootDriveInSecond!==0||x.opened.rootDriveInSecond!==0||
  x.closed.openerGateImpulse!==0||
  x.closed.firstStageSource!==0))
  throw Error("P0 robustness invalid solver or contaminated motor source");
 return {
  status:"POST-HOC RED TEAM, not qualified experience",
  axis:mode,cases:data.length,
  thresholds:"passage beyond x20.7 is a descriptive crossing, not a universal game success criterion",
  count:{openedGate:data.filter(x=>x.compare.openedGate).length,
   categoricalNewAccess:data.filter(x=>x.compare.changedCross).length,
   ordinaryCross:data.filter(x=>x.compare.ordinaryCross).length,
   changedTravel:data.filter(x=>Math.abs(x.compare.deltaX)>.2).length},
  data};
}
