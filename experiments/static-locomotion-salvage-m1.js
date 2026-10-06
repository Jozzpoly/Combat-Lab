import {
  STATIC_LOCOMOTION_POLICIES,
  createStaticLocomotionState,
  setStaticLocomotionDesiredVelocity,
  staticLocomotionSnapshot,
  stepStaticLocomotionState
} from "../src/research/static-locomotion.js";

const WORLD={width:800,height:500};
const WALL={id:"wall",x:500,y:80,w:40,h:340};
const START={x:480,y:200};
const DEFAULTS={desiredX:20,desiredY:100};

function createPair(authored){
  const common={
    position:START,
    desiredVelocity:{x:authored.desiredX,y:authored.desiredY},
    radius:20,
    world:WORLD,
    obstacles:[WALL]
  };
  return {
    baseline:createStaticLocomotionState({
      ...common,
      policy:STATIC_LOCOMOTION_POLICIES.DISCARD_REMAINDER
    }),
    candidate:createStaticLocomotionState({
      ...common,
      policy:STATIC_LOCOMOTION_POLICIES.RESIDUAL_SLIDE
    })
  };
}

function panelTransform(view,index){
  const panelWidth=view.width/2;
  const pad=28;
  const scale=Math.min(
    (panelWidth-pad*2)/WORLD.width,
    (view.height-pad*2)/WORLD.height
  );
  const panelX=index*panelWidth;
  const ox=panelX+(panelWidth-WORLD.width*scale)*0.5;
  const oy=(view.height-WORLD.height*scale)*0.5;
  return {
    scale,ox,oy,
    x:value=>ox+value*scale,
    y:value=>oy+value*scale
  };
}

function drawArrow(ctx,t,from,velocity,stroke){
  const length=Math.hypot(velocity.x,velocity.y);
  if(length<1e-9) return;
  const factor=Math.min(0.45,90/length);
  const to={x:from.x+velocity.x*factor,y:from.y+velocity.y*factor};
  ctx.strokeStyle=stroke;
  ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(t.x(from.x),t.y(from.y));
  ctx.lineTo(t.x(to.x),t.y(to.y));
  ctx.stroke();
}

function renderLane(ctx,view,index,state,{label,subLabel,fill,stroke}){
  const t=panelTransform(view,index);
  const snap=staticLocomotionSnapshot(state);

  ctx.save();
  ctx.fillStyle="rgba(12,17,23,.72)";
  ctx.fillRect(index*view.width/2,0,view.width/2,view.height);

  ctx.strokeStyle="#3e4652";
  ctx.lineWidth=3;
  ctx.strokeRect(t.x(0),t.y(0),WORLD.width*t.scale,WORLD.height*t.scale);

  ctx.fillStyle="#29303a";
  ctx.fillRect(t.x(WALL.x),t.y(WALL.y),WALL.w*t.scale,WALL.h*t.scale);

  drawArrow(
    ctx,t,
    {x:snap.body.x,y:snap.body.y},
    snap.body.desiredVelocity,
    stroke
  );

  ctx.fillStyle=fill;
  ctx.strokeStyle=stroke;
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(
    t.x(snap.body.x),
    t.y(snap.body.y),
    snap.body.radius*t.scale,
    0,Math.PI*2
  );
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle="#e9eef5";
  ctx.font="600 14px system-ui, sans-serif";
  ctx.fillText(label,index*view.width/2+18,24);
  ctx.font="12px ui-monospace, monospace";
  ctx.fillStyle="#b8c5d2";
  ctx.fillText(subLabel,index*view.width/2+18,43);
  ctx.fillText(
    "pos "+snap.body.x.toFixed(1)+", "+snap.body.y.toFixed(1)+
    " · contacts "+snap.totalContacts,
    index*view.width/2+18,62
  );
  ctx.restore();
}

export const staticLocomotionSalvageM1={
  id:"static-locomotion-salvage-m1",
  title:"M1 Salvage — Wall Contact A/B",
  kind:"research",
  purpose:"Put the M1 result on the table: the exact old zero-fraction wall death runs beside the qualified residual-slide candidate under the same live motor demand.",
  controls:"Edit exact X/Y motor demand live · left is old discard-remainder baseline · right is M1 residual-slide · Reset World restores the same contact start",

  create(){
    const authored={...DEFAULTS};
    let pair=createPair(authored);

    function applyDesired(){
      const desired={x:authored.desiredX,y:authored.desiredY};
      setStaticLocomotionDesiredVelocity(pair.baseline,desired);
      setStaticLocomotionDesiredVelocity(pair.candidate,desired);
    }

    function set(id,value){
      const n=Number(value);
      if(!Number.isFinite(n)) return;
      if(id==="desiredX") authored.desiredX=Math.max(-100000,Math.min(100000,n));
      if(id==="desiredY") authored.desiredY=Math.max(-100000,Math.min(100000,n));
      applyDesired();
    }

    const inspector={
      schema:{
        comparison:{
          id:"m1-live-demand",
          label:"Matched motor demand",
          controlIds:["desiredX","desiredY"],
          applySemantics:"Apply the same motor demand live to both baseline and M1 candidate.",
          matchedStartHint:"Reset World returns both bodies to the exact same tangent contact start."
        },
        groups:[
          {
            id:"demand",
            label:"Matched live motor demand",
            description:"No protective movement preset. Exact values apply to both lanes; extreme values are allowed for stress.",
            controls:[
              {
                id:"desiredX",type:"number",label:"Demand X",
                default:20,softMin:-200,softMax:200,hardMin:-100000,hardMax:100000,
                step:10,decimals:0,
                anchors:[
                  {label:"TANGENT ONLY",value:0},
                  {label:"INTO WALL",value:20},
                  {label:"AWAY",value:-100}
                ]
              },
              {
                id:"desiredY",type:"number",label:"Demand Y",
                default:100,softMin:-200,softMax:200,hardMin:-100000,hardMax:100000,
                step:10,decimals:0,
                anchors:[
                  {label:"DOWN",value:-100},
                  {label:"STOP",value:0},
                  {label:"UP",value:100}
                ]
              }
            ]
          }
        ],
        liveGroups:[
          {
            id:"outcome",
            label:"Matched outcome",
            description:"The left lane reproduces the old sticky contact rule. The right lane preserves legal tangent motion while hard normal penetration remains blocked.",
            values:[
              {id:"baselineY",label:"Baseline Y",decimals:1},
              {id:"candidateY",label:"M1 Y",decimals:1},
              {id:"deltaY",label:"M1 - baseline Y",decimals:1},
              {id:"baselineContacts",label:"Baseline contacts",decimals:0},
              {id:"candidateContacts",label:"M1 contacts",decimals:0}
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
          applyDesired();
        }
      },

      restoreDefaults(){
        Object.assign(authored,DEFAULTS);
        applyDesired();
      },

      getLive(id){
        const a=staticLocomotionSnapshot(pair.baseline);
        const b=staticLocomotionSnapshot(pair.candidate);
        if(id==="baselineY") return a.body.y;
        if(id==="candidateY") return b.body.y;
        if(id==="deltaY") return b.body.y-a.body.y;
        if(id==="baselineContacts") return a.totalContacts;
        if(id==="candidateContacts") return b.totalContacts;
        return undefined;
      }
    };

    return {
      step(_input,dt){
        stepStaticLocomotionState(pair.baseline,dt);
        stepStaticLocomotionState(pair.candidate,dt);
      },

      render(ctx,view){
        renderLane(ctx,view,0,pair.baseline,{
          label:"OLD CONTACT",
          subLabel:"discard remainder → filmed wall-death class",
          fill:"#a75b5b",
          stroke:"#ffc0c0"
        });
        renderLane(ctx,view,1,pair.candidate,{
          label:"M1",
          subLabel:"residual slide → tangent survives, normal stays hard",
          fill:"#4d9fe0",
          stroke:"#cbeaff"
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
        pair=createPair(authored);
      },

      inspector,

      query(name){
        if(name==="m1-salvage-pair"){
          return {
            baseline:staticLocomotionSnapshot(pair.baseline),
            candidate:staticLocomotionSnapshot(pair.candidate)
          };
        }
        return null;
      },

      snapshot(){
        return {
          baseline:staticLocomotionSnapshot(pair.baseline),
          candidate:staticLocomotionSnapshot(pair.candidate)
        };
      }
    };
  }
};
