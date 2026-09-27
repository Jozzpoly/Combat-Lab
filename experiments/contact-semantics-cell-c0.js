import {
  contactOutcomeSnapshot,
  createHeadOnContactState,
  setContactBodyParameter,
  stepHeadOnContactState
} from "../src/research/contact-semantics.js";

const DEFAULTS={
  aMass:1,
  aMotorAuthority:1,
  aContactResistance:1,
  bMass:1,
  bMotorAuthority:1,
  bContactResistance:1
};

const RAILS={
  mass:{softMin:0.5,softMax:5,hardMin:0.1,hardMax:20,step:0.1},
  motorAuthority:{softMin:0.5,softMax:3,hardMin:0.1,hardMax:10,step:0.1},
  contactResistance:{softMin:0.25,softMax:4,hardMin:0.1,hardMax:10,step:0.1}
};

function viewTransform(view){
  const world={width:1400,height:600};
  const pad=34;
  const scale=Math.min((view.width-pad*2)/world.width,(view.height-pad*2)/world.height);
  const ox=(view.width-world.width*scale)*0.5;
  const oy=(view.height-world.height*scale)*0.5;
  return {scale,ox,oy,x:v=>ox+v*scale,y:v=>oy+v*scale};
}

function drawArrow(ctx,t,from,velocity){
  const scale=0.42;
  const to={x:from.x+velocity.x*scale,y:from.y+velocity.y*scale};
  ctx.beginPath();
  ctx.moveTo(t.x(from.x),t.y(from.y));
  ctx.lineTo(t.x(to.x),t.y(to.y));
  ctx.stroke();
}

function createState(authored){
  return createHeadOnContactState({
    a:{
      mass:authored.aMass,
      motorAuthority:authored.aMotorAuthority,
      contactResistance:authored.aContactResistance
    },
    b:{
      mass:authored.bMass,
      motorAuthority:authored.bMotorAuthority,
      contactResistance:authored.bContactResistance
    },
    trialDuration:4
  });
}

function bodyForId(state,id){
  return state.bodies.find(body=>body.id===id);
}

function parameterBinding(id){
  if(id.startsWith("a")) return {body:"A",key:id.slice(1)};
  if(id.startsWith("b")) return {body:"B",key:id.slice(1)};
  return null;
}

function normalizedKey(key){
  if(key==="Mass") return "mass";
  if(key==="MotorAuthority") return "motorAuthority";
  if(key==="ContactResistance") return "contactResistance";
  return null;
}

export const contactSemanticsCellC0={
  id:"contact-semantics-cell-c0",
  title:"Contact Semantics Cell C0",
  kind:"research",
  purpose:"Isolate body-body contact: compare hold, yield and displacement while mass, motor authority and contact resistance remain independently authored.",
  controls:"Autonomous opposed intents · edit bodies live · Reset World for matched start",

  create(){
    const authored={...DEFAULTS};
    let state=createState(authored);

    function apply(id,value){
      const binding=parameterBinding(id);
      if(!binding) return;
      const key=normalizedKey(binding.key);
      if(!key) return;
      const body=bodyForId(state,binding.body);
      if(!body) return;
      const rails=RAILS[key];
      const n=Math.max(rails.hardMin,Math.min(rails.hardMax,Number(value)));
      if(!Number.isFinite(n)) return;
      authored[id]=n;
      setContactBodyParameter(body,key,n);
    }

    const inspector={
      schema:{
        comparison:{
          id:"contact-pair-authoring",
          label:"Contact pair authoring",
          controlIds:[
            "aMass","aMotorAuthority","aContactResistance",
            "bMass","bMotorAuthority","bContactResistance"
          ],
          applySemantics:"Apply changes only authored body contact parameters; current trial state is preserved.",
          matchedStartHint:"Reset World separately before interpreting A/B as a matched contact trial."
        },
        groups:[
          {
            id:"body-a",
            provenance:{domain:"specimen",scope:"body:A"},
            label:"Body A",
            description:"Moves right. Mass, motor authority and contact resistance are independent candidate axes.",
            controls:[
              {id:"aMass",type:"number",label:"Mass",default:1,...RAILS.mass,decimals:2},
              {id:"aMotorAuthority",type:"number",label:"Motor authority",default:1,...RAILS.motorAuthority,decimals:2},
              {id:"aContactResistance",type:"number",label:"Contact resistance",default:1,...RAILS.contactResistance,decimals:2}
            ]
          },
          {
            id:"body-b",
            provenance:{domain:"specimen",scope:"body:B"},
            label:"Body B",
            description:"Moves left under the same temporary C0 law.",
            controls:[
              {id:"bMass",type:"number",label:"Mass",default:1,...RAILS.mass,decimals:2},
              {id:"bMotorAuthority",type:"number",label:"Motor authority",default:1,...RAILS.motorAuthority,decimals:2},
              {id:"bContactResistance",type:"number",label:"Contact resistance",default:1,...RAILS.contactResistance,decimals:2}
            ]
          }
        ],
        liveGroups:[
          {
            id:"outcome",
            label:"Contact outcome",
            description:"Read-only trial evidence. Contact resistance is a candidate yielding axis, not accepted Feniks physics.",
            values:[
              {id:"status",label:"Trial",format:value=>String(value)},
              {id:"contactPairSteps",label:"Contact-pair steps",decimals:0},
              {id:"midpointShift",label:"Contact midpoint shift",decimals:1},
              {id:"separation",label:"Body separation",decimals:1},
              {id:"aAcceleration",label:"A acceleration",decimals:1},
              {id:"bAcceleration",label:"B acceleration",decimals:1}
            ]
          }
        ]
      },

      get(id){
        return Object.prototype.hasOwnProperty.call(authored,id) ? authored[id] : undefined;
      },

      set(id,value){
        apply(id,value);
      },

      reset(id){
        if(Object.prototype.hasOwnProperty.call(DEFAULTS,id)) apply(id,DEFAULTS[id]);
      },

      restoreDefaults(){
        for(const [id,value] of Object.entries(DEFAULTS)) apply(id,value);
      },

      getLive(id){
        const out=contactOutcomeSnapshot(state);
        if(id==="status") return out.status;
        if(id==="contactPairSteps") return out.contactPairSteps;
        if(id==="midpointShift") return out.midpointShift;
        if(id==="separation") return out.separation;
        if(id==="aAcceleration") return out.bodies.A.acceleration;
        if(id==="bAcceleration") return out.bodies.B.acceleration;
        return undefined;
      }
    };

    return {
      step(_input,dt){
        stepHeadOnContactState(state,dt,{iterations:12,pairOrder:"forward"});
      },

      render(ctx,view,{debug=false}={}){
        const t=viewTransform(view);
        const out=contactOutcomeSnapshot(state);
        const a=state.bodies[0];
        const b=state.bodies[1];

        ctx.save();
        ctx.strokeStyle="#3e4652";
        ctx.lineWidth=3;
        ctx.strokeRect(t.x(0),t.y(0),1400*t.scale,600*t.scale);

        ctx.strokeStyle="rgba(255,255,255,.08)";
        ctx.setLineDash([7,7]);
        ctx.beginPath();
        ctx.moveTo(t.x(state.initialMidpoint),t.y(100));
        ctx.lineTo(t.x(state.initialMidpoint),t.y(500));
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle="rgba(143,213,255,.65)";
        ctx.lineWidth=3;
        drawArrow(ctx,t,{x:a.x,y:a.y},a.desiredVelocity);
        ctx.strokeStyle="rgba(239,180,126,.65)";
        drawArrow(ctx,t,{x:b.x,y:b.y},b.desiredVelocity);

        for(const [body,fill,stroke] of [
          [a,"#4d9fe0","#cbeaff"],
          [b,"#b57b4b","#efb47e"]
        ]){
          ctx.fillStyle=fill;
          ctx.strokeStyle=stroke;
          ctx.lineWidth=2;
          ctx.beginPath();
          ctx.arc(t.x(body.x),t.y(body.y),body.radius*t.scale,0,Math.PI*2);
          ctx.fill();
          ctx.stroke();
        }

        if(debug){
          ctx.fillStyle="#e9eef5";
          ctx.font="13px ui-monospace, monospace";
          ctx.fillText(
            `trial ${out.status} · contacts ${out.contactPairSteps} · midpoint Δ ${out.midpointShift.toFixed(1)}`,
            18,24
          );
          ctx.fillText(
            `A m${a.mass.toFixed(2)} motor${a.motorAuthority.toFixed(2)} resist${a.contactResistance.toFixed(2)} → desired +x`,
            18,43
          );
          ctx.fillText(
            `B m${b.mass.toFixed(2)} motor${b.motorAuthority.toFixed(2)} resist${b.contactResistance.toFixed(2)} → desired -x`,
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
        if(name==="contact-causal-state") return contactOutcomeSnapshot(state);
        return null;
      },

      snapshot(){
        return contactOutcomeSnapshot(state);
      }
    };
  }
};
