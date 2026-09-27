import {
  createDynamicEncounterState,
  dynamicEncounterSnapshot,
  setDynamicEncounterPassingSide,
  stepDynamicEncounterState
} from "../src/research/dynamic-encounter.js";

const WORLD={width:1400,height:700};
const DEFAULTS={
  aPassingSide:0,
  bPassingSide:0
};

function sideLabel(value){
  if(value===1) return "LEFT";
  if(value===-1) return "RIGHT";
  return "NONE";
}

function viewTransform(view){
  const pad=34;
  const scale=Math.min((view.width-pad*2)/WORLD.width,(view.height-pad*2)/WORLD.height);
  const ox=(view.width-WORLD.width*scale)*0.5;
  const oy=(view.height-WORLD.height*scale)*0.5;
  return {scale,ox,oy,x:v=>ox+v*scale,y:v=>oy+v*scale};
}

function drawArrow(ctx,t,from,velocity,stroke){
  const d=Math.hypot(velocity.x,velocity.y);
  if(d<1e-9) return;
  const scale=0.36;
  const to={x:from.x+velocity.x*scale,y:from.y+velocity.y*scale};
  ctx.strokeStyle=stroke;
  ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(t.x(from.x),t.y(from.y));
  ctx.lineTo(t.x(to.x),t.y(to.y));
  ctx.stroke();
}

function createState(authored){
  return createDynamicEncounterState({
    passingSideA:authored.aPassingSide,
    passingSideB:authored.bPassingSide,
    world:WORLD
  });
}

export const dynamicEncounterCellD0={
  id:"dynamic-encounter-cell-d0",
  title:"Dynamic Encounter Cell D0",
  kind:"research",
  purpose:"Test one missing organism competence: persistent dynamic obstruction may trigger an explicit local passing-side decision without hidden reciprocal choreography.",
  controls:"Autonomous head-on encounter · -1 RIGHT / 0 NONE / +1 LEFT · Reset World for matched trial",

  create(){
    const authored={...DEFAULTS};
    let state=createState(authored);

    function setSide(id,value){
      const rounded=Math.max(-1,Math.min(1,Math.round(Number(value))));
      if(!Number.isFinite(rounded)) return;
      authored[id]=rounded;
      const actorId=id==="aPassingSide" ? "A" : "B";
      setDynamicEncounterPassingSide(state,actorId,rounded);
    }

    const inspector={
      schema:{
        comparison:{
          id:"dynamic-encounter-convention",
          label:"Dynamic passing convention",
          controlIds:["aPassingSide","bPassingSide"],
          applySemantics:"Apply changes only each actor's authored local passing-side convention; current encounter state is preserved.",
          matchedStartHint:"Reset World separately before interpreting a convention change as a matched encounter trial."
        },
        groups:[
          {
            id:"encounter-a",
            provenance:{domain:"organism",scope:"body:A"},
            label:"Actor A",
            description:"Local passing-side convention used only after persistent dynamic no-progress.",
            controls:[
              {
                id:"aPassingSide",type:"number",label:"Passing side",
                description:"-1 RIGHT · 0 NONE · +1 LEFT relative to current travel direction.",
                default:0,softMin:-1,softMax:1,hardMin:-1,hardMax:1,step:1,decimals:0,
                anchors:[
                  {label:"RIGHT",value:-1},
                  {label:"NONE",value:0},
                  {label:"LEFT",value:1}
                ]
              }
            ]
          },
          {
            id:"encounter-b",
            provenance:{domain:"organism",scope:"body:B"},
            label:"Actor B",
            description:"Independent local convention; no pair-level coordinator chooses a shared side.",
            controls:[
              {
                id:"bPassingSide",type:"number",label:"Passing side",
                description:"-1 RIGHT · 0 NONE · +1 LEFT relative to current travel direction.",
                default:0,softMin:-1,softMax:1,hardMin:-1,hardMax:1,step:1,decimals:0,
                anchors:[
                  {label:"RIGHT",value:-1},
                  {label:"NONE",value:0},
                  {label:"LEFT",value:1}
                ]
              }
            ]
          }
        ],
        liveGroups:[
          {
            id:"encounter",
            label:"Encounter outcome",
            description:"Preferred motion, dynamic block and local decision remain separate evidence.",
            values:[
              {id:"status",label:"Trial",format:value=>String(value)},
              {id:"aMode",label:"A mode",format:value=>String(value)},
              {id:"bMode",label:"B mode",format:value=>String(value)},
              {id:"aGoalDistance",label:"A goal distance",decimals:1},
              {id:"bGoalDistance",label:"B goal distance",decimals:1},
              {id:"contactSteps",label:"Contact-pair steps",decimals:0}
            ]
          }
        ]
      },

      get(id){
        return Object.prototype.hasOwnProperty.call(authored,id) ? authored[id] : undefined;
      },

      set(id,value){
        if(id==="aPassingSide" || id==="bPassingSide") setSide(id,value);
      },

      reset(id){
        if(Object.prototype.hasOwnProperty.call(DEFAULTS,id)) setSide(id,DEFAULTS[id]);
      },

      restoreDefaults(){
        for(const [id,value] of Object.entries(DEFAULTS)) setSide(id,value);
      },

      getLive(id){
        const snap=dynamicEncounterSnapshot(state);
        if(id==="status") return snap.status;
        if(id==="aMode") return snap.actors.A.mode;
        if(id==="bMode") return snap.actors.B.mode;
        if(id==="aGoalDistance") return snap.actors.A.goalDistance;
        if(id==="bGoalDistance") return snap.actors.B.goalDistance;
        if(id==="contactSteps") return snap.contactPairSteps;
        return undefined;
      }
    };

    return {
      step(_input,dt){
        stepDynamicEncounterState(state,dt);
      },

      render(ctx,view,{debug=false}={}){
        const t=viewTransform(view);
        const snap=dynamicEncounterSnapshot(state);

        ctx.save();
        ctx.strokeStyle="#3e4652";
        ctx.lineWidth=3;
        ctx.strokeRect(t.x(0),t.y(0),WORLD.width*t.scale,WORLD.height*t.scale);

        ctx.strokeStyle="rgba(255,255,255,.08)";
        ctx.setLineDash([7,7]);
        ctx.beginPath();
        ctx.moveTo(t.x(WORLD.width/2),t.y(80));
        ctx.lineTo(t.x(WORLD.width/2),t.y(WORLD.height-80));
        ctx.stroke();
        ctx.setLineDash([]);

        for(const [key,fill,stroke] of [
          ["A","#4d9fe0","#cbeaff"],
          ["B","#b57b4b","#efb47e"]
        ]){
          const actor=snap.actors[key];
          const body=state.bodies.find(candidate=>candidate.id===key);
          drawArrow(ctx,t,actor.position,actor.desiredVelocity,stroke);

          ctx.fillStyle=fill;
          ctx.strokeStyle=stroke;
          ctx.lineWidth=2;
          ctx.beginPath();
          ctx.arc(t.x(actor.position.x),t.y(actor.position.y),body.radius*t.scale,0,Math.PI*2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle="#5cc489";
          ctx.beginPath();
          ctx.arc(t.x(actor.target.x),t.y(actor.target.y),8*t.scale,0,Math.PI*2);
          ctx.fill();
        }

        if(debug){
          ctx.fillStyle="#e9eef5";
          ctx.font="13px ui-monospace, monospace";
          ctx.fillText(
            `trial ${snap.status} · contact steps ${snap.contactPairSteps}`,
            18,24
          );
          ctx.fillText(
            `A ${snap.actors.A.mode} · side ${sideLabel(snap.actors.A.passingSide)} · goal ${snap.actors.A.goalDistance.toFixed(1)}`,
            18,43
          );
          ctx.fillText(
            `B ${snap.actors.B.mode} · side ${sideLabel(snap.actors.B.passingSide)} · goal ${snap.actors.B.goalDistance.toFixed(1)}`,
            18,62
          );
        }

        ctx.restore();
      },

      reset(){
        state=createState(authored);
      },

      inspector,

      query(name){
        if(name==="dynamic-encounter-causal") return dynamicEncounterSnapshot(state);
        return null;
      },

      snapshot(){
        return dynamicEncounterSnapshot(state);
      }
    };
  }
};
