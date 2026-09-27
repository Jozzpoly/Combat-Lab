import test from "node:test";
import assert from "node:assert/strict";
import {integratedEcologyRehearsalR0} from "../experiments/integrated-ecology-rehearsal-r0.js";

test("rehearsal population authoring is exact and applies only on explicit Reset World",()=>{
  const instance=integratedEcologyRehearsalR0.create();
  assert.equal(instance.snapshot().population,8);

  instance.inspector.set("population",24);
  assert.equal(instance.inspector.get("population"),24);
  assert.equal(instance.snapshot().population,8);
  assert.equal(instance.snapshot().authoredPopulation,24);

  instance.reset();
  assert.equal(instance.snapshot().population,24);
  assert.equal(instance.snapshot().authoredPopulation,24);
});

test("rehearsal passing-side authoring remains live without rebuilding the world",()=>{
  const instance=integratedEcologyRehearsalR0.create();
  const before=instance.snapshot().actors["resident-1"].position;

  instance.inspector.set("passingSide",0);
  const after=instance.snapshot();

  assert.deepEqual(after.actors["resident-1"].position,before);
  assert.equal(after.authoredPassingSide,0);
  assert.equal(after.actors["resident-1"].passingSide,0);
});

test("rehearsal selection exposes one causal subject and no global selection by default",()=>{
  const instance=integratedEcologyRehearsalR0.create();
  assert.equal(instance.snapshot().selectedId,null);
  assert.equal(instance.query("selected-subject"),null);

  const actor=instance.snapshot().actors["resident-1"];
  const fakeCamera={
    zoom:1,
    screenToWorld(){ return {...actor.position}; }
  };
  const picked=instance.pick({
    screen:{x:10,y:10},
    camera:fakeCamera,
    view:{width:100,height:100}
  });

  assert.equal(picked.after,"resident-1");
  assert.equal(picked.inspectorMode,"observe");
  const causal=instance.query("selected-subject");
  assert.equal(causal.id,"resident-1");
  assert.ok(Number.isFinite(causal.purpose.goalDistance));
  assert.ok(causal.body.radius>0);
  assert.ok(Array.isArray(causal.dynamic.partners));
});

test("rehearsal reset clears selection while preserving authored trial configuration",()=>{
  const instance=integratedEcologyRehearsalR0.create();
  instance.inspector.set("population",12);
  instance.inspector.set("passingSide",-1);
  const actor=instance.snapshot().actors["resident-1"];
  instance.pick({
    screen:{x:0,y:0},
    camera:{zoom:1,screenToWorld(){return {...actor.position};}},
    view:{width:100,height:100}
  });

  instance.reset();
  const snap=instance.snapshot();
  assert.equal(snap.population,12);
  assert.equal(snap.selectedId,null);
  assert.equal(snap.authoredPassingSide,-1);
  assert.equal(snap.actors["resident-1"].passingSide,-1);
});


test("rehearsal Observe translates selected state into purpose, plan and causal why",()=>{
  const instance=integratedEcologyRehearsalR0.create();
  const actor=instance.snapshot().actors["resident-1"];
  instance.pick({
    screen:{x:0,y:0},
    camera:{zoom:1,screenToWorld(){return {...actor.position};}},
    view:{width:100,height:100}
  });

  assert.match(instance.inspector.getLive("purpose"),/^reach \(/);
  assert.match(instance.inspector.getLive("plan"),/direct/i);
  assert.match(instance.inspector.getLive("why"),/direct progress/i);
  assert.equal(instance.inspector.getLive("blockedBy"),"");
  assert.ok(Number.isFinite(instance.inspector.getLive("radius")));
  assert.ok(Number.isFinite(instance.inspector.getLive("mass")));
});

test("rehearsal Observe reports a real historical static decision instead of only raw timers",()=>{
  const instance=integratedEcologyRehearsalR0.create();
  const initial=instance.snapshot().actors["resident-1"];
  instance.pick({
    screen:{x:0,y:0},
    camera:{zoom:1,screenToWorld(){return {...initial.position};}},
    view:{width:100,height:100}
  });

  const idle={keys:[],buttons:[],pointer:{x:0,y:0,valid:false}};
  for(let i=0;i<520;i++) instance.step(idle,1/120);

  const decision=instance.inspector.getLive("decision");
  assert.match(decision,/static replan/i);
  assert.match(instance.inspector.getLive("plan"),/(route|direct)/i);
});
