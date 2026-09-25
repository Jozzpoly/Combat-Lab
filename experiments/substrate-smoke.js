const SPEED=180;

function has(input,code) {
  return input.keys.includes(code);
}

export const substrateSmoke = {
  id:"substrate-smoke",
  title:"Substrate smoke probe",
  purpose:"Exercises raw input, fixed stepping, reset, rendering and debug plumbing without defining combat semantics.",
  controls:"WASD / arrows move the probe · pointer is observed · Reset returns to center",

  create() {
    const initial={x:0,y:0};
    const state={...initial,time:0,trail:[],lastPointer:null};

    return {
      step(input,dt) {
        const x=(has(input,"KeyD")||has(input,"ArrowRight")?1:0)-(has(input,"KeyA")||has(input,"ArrowLeft")?1:0);
        const y=(has(input,"KeyS")||has(input,"ArrowDown")?1:0)-(has(input,"KeyW")||has(input,"ArrowUp")?1:0);
        const length=Math.hypot(x,y) || 1;
        state.x+=(x/length)*SPEED*dt;
        state.y+=(y/length)*SPEED*dt;
        state.time+=dt;
        state.lastPointer=input.pointer.valid ? {...input.pointer} : null;

        state.trail.push({x:state.x,y:state.y});
        if (state.trail.length>90) state.trail.shift();
      },

      render(ctx,view,{debug=false}={}) {
        const cx=view.width*0.5;
        const cy=view.height*0.5;

        ctx.save();
        ctx.strokeStyle="rgba(255,255,255,.06)";
        ctx.lineWidth=1;
        for (let x=cx%40;x<view.width;x+=40) {
          ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,view.height); ctx.stroke();
        }
        for (let y=cy%40;y<view.height;y+=40) {
          ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(view.width,y); ctx.stroke();
        }

        if (state.trail.length>1) {
          ctx.strokeStyle="rgba(120,180,255,.35)";
          ctx.beginPath();
          state.trail.forEach((p,i)=>{
            const sx=cx+p.x, sy=cy+p.y;
            if (i===0) ctx.moveTo(sx,sy); else ctx.lineTo(sx,sy);
          });
          ctx.stroke();
        }

        ctx.fillStyle="#88c7ff";
        ctx.beginPath();
        ctx.arc(cx+state.x,cy+state.y,10,0,Math.PI*2);
        ctx.fill();

        if (state.lastPointer) {
          const p=state.lastPointer;
          ctx.strokeStyle="#f0c06a";
          ctx.beginPath();
          ctx.moveTo(p.x-8,p.y); ctx.lineTo(p.x+8,p.y);
          ctx.moveTo(p.x,p.y-8); ctx.lineTo(p.x,p.y+8);
          ctx.stroke();
        }

        if (debug) {
          ctx.fillStyle="#d9e0e8";
          ctx.font="12px ui-monospace, monospace";
          ctx.fillText(`probe=(${state.x.toFixed(1)}, ${state.y.toFixed(1)})`,16,24);
          ctx.fillText(`t=${state.time.toFixed(3)}`,16,42);
        }
        ctx.restore();
      },

      reset() {
        state.x=initial.x;
        state.y=initial.y;
        state.time=0;
        state.trail.length=0;
        state.lastPointer=null;
      },

      snapshot() {
        return {
          x:state.x,
          y:state.y,
          time:state.time,
          trailLength:state.trail.length
        };
      }
    };
  }
};
