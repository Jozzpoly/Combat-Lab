import {
  createSequentialDynamicEncounterState,
  sequentialDynamicEncounterSnapshot,
  stepSequentialDynamicEncounterState
} from "../src/research/sequential-dynamic-encounters.js";

const WORLD={width:2000,height:700};
const DEFAULTS={passingSide:1,secondChallenge:0};

function secondPartner(authored){
  return authored.secondChallenge===1 ? "B" : "C";
}

function createPair(authored){
  const common={
    passingSideA:authored.passingSide,
    secondChallengePartner:secondPartner(authored),
    world:WORLD
  };
  return {
    baseline:createSequentialDynamicEncounterState({
      ...common,
      episodeMode:"lifetime"
    }),
    candidate:createSequentialDynamicEncounterState({
      ...common,
      episodeMode:"episodic"
    })
  };
}

function panelTransform(view,index){
  const panelWidth=view.width/2;
  const pad=24;
  const scale=Math.min(
    (panelWidth-pad*2)/WORLD.width,
    (view.height-pad*2)/WORLD.height
  );
  const panelX=index*panelWidth;
  const ox=panelX+(panelWidth-WORLD.width*scale)*0.5;
  const oy=(view.height-WORLD.height*scale)*0.5;
  return {
    scale,panelX,panelWidth,
    x:value=>ox+value*scale,
    y:value=>oy+value*scale
  };
}

function drawBody(ctx,t,position,radius,fill,stroke){
  ctx.fillStyle=fill;
  ctx.strokeStyle=stroke;
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(t.x(position.x),t.y(position.y),radius*t.scale,0,Math.PI*2);
  ctx.fill();
  ctx.stroke();
}

function drawTarget(ctx,t,target){
  ctx.fillStyle="#5cc489";
  ctx.beginPath();
  ctx.arc(t.x(target.x),t.y(target.y),8*t.scale,0,Math.PI*2);
  ctx.fill();
}

function renderPanel(ctx,view,index,state,{label,subLabel,candidate}){
  const t=panelTransform(view,index);
  const snap=sequentialDynamicEncounterSnapshot(state);
  const bTarget=state.passiveActors.B.target;
  const cTarget=state.passiveActors.C.target;

  ctx.save();
  ctx.fillStyle="rgba(12,17,23,.72)";
  ctx.fillRect(t.panelX,0,t.panelWidth,view.height);

  ctx.strokeStyle="#3e4652";
  ctx.lineWidth=3;
  ctx.strokeRect(t.x(0),t.y(0),WORLD.width*t.scale,WORLD.height*t.scale);

  drawTarget(ctx,t,snap.actorA.target);
  if(state.passiveActors.B.mode!=="DORMANT") drawTarget(ctx,t,bTarget);
  if(state.passiveActors.C.mode!=="DORMANT") drawTarget(ctx,t,cTarget);

  drawBody(
    ctx,t,snap.actorA.position,
    state.bodies.find(body=>body.id==="A").radius,
    candidate ? "#4d9fe0" : "#a75b5b",
    candidate ? "#cbeaff" : "#ffc0c0"
  );
  drawBody(
    ctx,t,snap.passive.B.position,snap.passive.B.radius,
    "#b57b4b","#efb47e"
  );
  drawBody(
    ctx,t,snap.passive.C.position,snap.passive.C.radius,
    "#7d68b5","#d8c9ff"
  );

  ctx.fillStyle="#e9eef5";
  ctx.font="600 14px system-ui, sans-serif";
  ctx.fillText(label,t.panelX+18,24);
  ctx.font="12px ui-monospace, monospace";
  ctx.fillStyle="#b8c5d2";
  ctx.fillText(subLabel,t.panelX+18,43);
  ctx.fillText(
    "status "+snap.status+
    " · A "+snap.actorA.mode+
    " · encounters "+snap.actorA.encounterCount+
    " · rearms "+snap.actorA.rearmHistory.length,
    t.panelX+18,62
  );
  ctx.fillText(
    "second "+snap.secondChallengePartner+
    (snap.secondChallengeReleased ? " released" : " waiting"),
    t.panelX+18,81
  );

  ctx.restore();
}

export const dynamicEncounterSalvageD1={
  id:"dynamic-encounter-salvage-d1",
  title:"D1 Salvage — Encounter Episodes A/B",
  kind:"research",
  purpose:"Put the D1 result on the table: identical first contact, clearance and progress feed a lifetime one-shot competence beside an episodically re-armable local encounter competence.",
  controls:"Edit passing convention and whether the second challenge reuses B or introduces C · both lanes rebuild to the same matched start",

  create(){
    const authored={...DEFAULTS};
    let pair=createPair(authored);

    function rebuild(){
      pair=createPair(authored);
    }

    function set(id,value){
      const n=Number(value);
      if(!Number.isFinite(n)) return;
      if(id==="passingSide"){
        authored.passingSide=Math.max(-1,Math.min(1,Math.round(n)));
        rebuild();
      }
      if(id==="secondChallenge"){
        authored.secondChallenge=Math.max(0,Math.min(1,Math.round(n)));
        rebuild();
      }
    }

    const inspector={
      schema:{
        comparison:{
          id:"d1-encounter-episode",
          label:"Encounter episode authority",
          controlIds:["passingSide","secondChallenge"],
          applySemantics:"Rebuild both lanes with the same authored encounter conditions.",
          matchedStartHint:"Every edit restarts both lifetime and episodic specimens from an identical start."
        },
        groups:[
          {
            id:"encounter",
            label:"Matched encounter conditions",
            description:"No crowd coordinator or prediction layer is added. This isolates whether local encounter competence can become available again after factual separation and progress.",
            controls:[
              {
                id:"passingSide",type:"number",label:"A passing side",
                default:1,softMin:-1,softMax:1,hardMin:-1,hardMax:1,step:1,decimals:0,
                anchors:[
                  {label:"RIGHT",value:-1},
                  {label:"NONE",value:0},
                  {label:"LEFT",value:1}
                ]
              },
              {
                id:"secondChallenge",type:"number",label:"Second challenge",
                default:0,softMin:0,softMax:1,hardMin:0,hardMax:1,step:1,decimals:0,
                anchors:[
                  {label:"NEW C",value:0},
                  {label:"SAME B",value:1}
                ]
              }
            ]
          }
        ],
        liveGroups:[
          {
            id:"outcome",
            label:"Matched outcome",
            description:"The first encounter is shared. The divergence should appear only after factual re-arm evidence exists.",
            values:[
              {id:"baselineStatus",label:"Lifetime status",format:value=>String(value)},
              {id:"baselineEncounters",label:"Lifetime encounters",decimals:0},
              {id:"candidateStatus",label:"D1 status",format:value=>String(value)},
              {id:"candidateEncounters",label:"D1 encounters",decimals:0},
              {id:"candidateRearms",label:"D1 re-arms",decimals:0},
              {id:"released",label:"Second challenge released",format:value=>value ? "YES" : "no"}
            ]
          }
        ]
      },

      get(id){
        return Object.prototype.hasOwnProperty.call(authored,id) ? authored[id] : undefined;
      },

      set,

      reset(id){
        if(Object.prototype.hasOwnProperty.call(DEFAULTS,id)){
          authored[id]=DEFAULTS[id];
          rebuild();
        }
      },

      restoreDefaults(){
        Object.assign(authored,DEFAULTS);
        rebuild();
      },

      getLive(id){
        const a=sequentialDynamicEncounterSnapshot(pair.baseline);
        const b=sequentialDynamicEncounterSnapshot(pair.candidate);
        if(id==="baselineStatus") return a.status;
        if(id==="baselineEncounters") return a.actorA.encounterCount;
        if(id==="candidateStatus") return b.status;
        if(id==="candidateEncounters") return b.actorA.encounterCount;
        if(id==="candidateRearms") return b.actorA.rearmHistory.length;
        if(id==="released") return b.secondChallengeReleased;
        return undefined;
      }
    };

    return {
      step(_input,dt){
        stepSequentialDynamicEncounterState(pair.baseline,dt);
        stepSequentialDynamicEncounterState(pair.candidate,dt);
      },

      render(ctx,view){
        renderPanel(ctx,view,0,pair.baseline,{
          label:"LIFETIME BASELINE",
          subLabel:"one encounter competence for the whole trial",
          candidate:false
        });
        renderPanel(ctx,view,1,pair.candidate,{
          label:"D1",
          subLabel:"competence re-arms only after separation + progress",
          candidate:true
        });

        ctx.save();
        ctx.strokeStyle="rgba(255,255,255,.14)";
        ctx.beginPath();
        ctx.moveTo(view.width/2,0);
        ctx.lineTo(view.width/2,view.height);
        ctx.stroke();
        ctx.restore();
      },

      reset(){
        rebuild();
      },

      inspector,

      query(name){
        if(name==="d1-salvage-pair"){
          return {
            baseline:sequentialDynamicEncounterSnapshot(pair.baseline),
            candidate:sequentialDynamicEncounterSnapshot(pair.candidate)
          };
        }
        return null;
      },

      snapshot(){
        return {
          baseline:sequentialDynamicEncounterSnapshot(pair.baseline),
          candidate:sequentialDynamicEncounterSnapshot(pair.candidate)
        };
      }
    };
  }
};
