import test from "node:test";
import assert from "node:assert/strict";

import {
  createActor,
  directionalInvMass,
  supportAlignment
} from "../src/actor.js";
import {
  applyDriveContact,
  probeDriveContact
} from "../src/exchange.js";
import { runPolicy } from "../src/rehearsal.js";

const tuning={
  supportScale:1,
  omnidirectionalSupport:false,
  driveKeepsSupport:false,
  driveMaterialScale:1
};

function committedDrive(attacker,target){
  attacker.action.mode="commit";
  attacker.action.time=0.1;
  attacker.action.commitX=1;
  attacker.action.commitY=0;
  attacker.action.contactResolved=false;
  attacker.x=100;
  attacker.y=100;
  target.x=145;
  target.y=100;
}

test("E0b SET support is directional rather than global mass",()=>{
  const actor=createActor({id:"set",x:0,y:0,facing:0});
  actor.setHeld=true;

  const front=supportAlignment(actor,1,0);
  const side=supportAlignment(actor,0,1);
  const rear=supportAlignment(actor,-1,0);

  assert.equal(front,1);
  assert.equal(side,0);
  assert.equal(rear,0);

  const base=1/actor.spec.mass;
  const frontInv=directionalInvMass(actor,1,0,{supportScale:1});
  const sideInv=directionalInvMass(actor,0,1,{supportScale:1});

  assert.ok(frontInv<base*0.3);
  assert.equal(sideInv,base);
});

test("E0b aligned SET yields less to the same DRIVE than misaligned SET",()=>{
  const run=facing=>{
    const attacker=createActor({id:"a",x:100,y:100,facing:0});
    const target=createActor({id:"b",x:145,y:100,facing});
    target.setHeld=true;
    committedDrive(attacker,target);
    const candidate=probeDriveContact(attacker,target);
    assert.ok(candidate);
    const event=applyDriveContact(attacker,target,candidate,tuning);
    return event;
  };

  const aligned=run(Math.PI);
  const side=run(Math.PI/2);

  assert.ok(aligned.targetSupport>0.99);
  assert.equal(side.targetSupport,0);
  assert.ok(aligned.targetDelta<side.targetDelta*0.3);
});

test("E0b DRIVE sacrifices held SET support unless explicit ablation keeps it",()=>{
  const actor=createActor({id:"a",x:0,y:0,facing:0});
  actor.setHeld=true;
  actor.action.mode="commit";
  actor.action.commitX=1;
  actor.action.commitY=0;

  assert.equal(
    supportAlignment(actor,1,0,{driveKeepsSupport:false}),
    0
  );
  assert.equal(
    supportAlignment(actor,1,0,{driveKeepsSupport:true}),
    1
  );
});

test("E0b exploratory mirrored matrix remains finite and boundary-independent",()=>{
  const cases=[
    ["deny","static-set"],
    ["deny","set-track"],
    ["deny","set-drive"],
    ["deny","blind-drive"],
    ["deny","lateral-yield"],
    ["deny","retreat"],
    ["deny","movement-track"],
    ["breach","blind-drive"],
    ["breach","set-drive"],
    ["breach","angle-left"],
    ["breach","angle-right"],
    ["breach","angle-switch"],
    ["breach","movement-only"],
    ["breach","retreat"]
  ];
  const result={};

  for(const [role,policy] of cases){
    result[role+":"+policy]=runPolicy({role,policy});
  }

  console.log("E0B_EXPLORATORY_MATRIX",JSON.stringify(result));

  for(const value of Object.values(result)){
    assert.equal(value.finite,true);
    assert.equal(value.boundaryFrames,0);
  }

  assert.equal(result["deny:retreat"].result,"breached");
  assert.equal(result["breach:retreat"].result,"blocked");
});

test("E0b broad-start red team measures blind DRIVE and static SET without tuning assertions",()=>{
  const offsets=[-300,-180,-90,0,90,180,300];
  const result={
    denyStaticSet:[],
    denySetTrack:[],
    denyBlindDrive:[],
    breachBlindDrive:[],
    breachAngleLeft:[],
    breachAngleSwitch:[]
  };

  for(const offset of offsets){
    const playerX=800-offset/2;
    const adversaryX=800+offset/2;
    const common={playerX,adversaryX};

    result.denyStaticSet.push(runPolicy({
      role:"deny",policy:"static-set",...common
    }));
    result.denySetTrack.push(runPolicy({
      role:"deny",policy:"set-track",...common
    }));
    result.denyBlindDrive.push(runPolicy({
      role:"deny",policy:"blind-drive",...common
    }));
    result.breachBlindDrive.push(runPolicy({
      role:"breach",policy:"blind-drive",...common
    }));
    result.breachAngleLeft.push(runPolicy({
      role:"breach",policy:"angle-left",...common
    }));
    result.breachAngleSwitch.push(runPolicy({
      role:"breach",policy:"angle-switch",...common
    }));
  }

  const count=(arr,label)=>arr.filter(x=>x.result===label).length;
  const compact=arr=>arr.map(x=>({
    result:x.result,
    time:x.time,
    margin:x.accessMargin,
    support:x.maxAdversarySupport,
    px:x.player.x,
    ax:x.adversary.x
  }));

  const summary={
    offsets,
    denyStaticSetHeld:count(result.denyStaticSet,"held"),
    denySetTrackHeld:count(result.denySetTrack,"held"),
    denyBlindDriveHeld:count(result.denyBlindDrive,"held"),
    breachBlindDriveCrossed:count(result.breachBlindDrive,"crossed"),
    breachAngleLeftCrossed:count(result.breachAngleLeft,"crossed"),
    breachAngleSwitchCrossed:count(result.breachAngleSwitch,"crossed"),
    breachBlindDrive:compact(result.breachBlindDrive),
    denySetTrack:compact(result.denySetTrack),
    maxBoundary:Math.max(...Object.values(result).flat().map(x=>x.boundaryFrames))
  };

  console.log("E0B_BROAD_START_SUMMARY",JSON.stringify(summary));
  assert.equal(summary.maxBoundary,0);
});

test("E0b broad matched ablations isolate directionality support sacrifice and captured commitment",()=>{
  const offsets=[-300,-180,-90,0,90,180,300];
  const result={
    blindDirectional:[],
    blindOmni:[],
    blindNoSupport:[],
    blindNoSetCost:[],
    setDriveSacrifice:[],
    setDriveKeepsSupport:[],
    angleCaptured:[],
    angleHoming:[]
  };

  for(const offset of offsets){
    const playerX=800-offset/2;
    const adversaryX=800+offset/2;
    const common={role:"breach",playerX,adversaryX};

    result.blindDirectional.push(runPolicy({
      ...common,policy:"blind-drive"
    }));
    result.blindOmni.push(runPolicy({
      ...common,policy:"blind-drive",
      omnidirectionalSupport:true
    }));
    result.blindNoSupport.push(runPolicy({
      ...common,policy:"blind-drive",
      supportScale:0
    }));
    result.blindNoSetCost.push(runPolicy({
      ...common,policy:"blind-drive",
      setMoveScale:1,
      setTurnScale:1
    }));

    result.setDriveSacrifice.push(runPolicy({
      ...common,policy:"set-drive",
      driveKeepsSupport:false
    }));
    result.setDriveKeepsSupport.push(runPolicy({
      ...common,policy:"set-drive",
      driveKeepsSupport:true
    }));

    result.angleCaptured.push(runPolicy({
      ...common,policy:"angle-switch",
      homingDrive:false
    }));
    result.angleHoming.push(runPolicy({
      ...common,policy:"angle-switch",
      homingDrive:true
    }));
  }

  const crossed=arr=>arr.filter(x=>x.result==="crossed").length;
  const compact=arr=>arr.map(x=>({
    result:x.result,
    time:x.time,
    margin:x.accessMargin,
    contacts:x.playerDriveContacts
  }));

  const summary={
    offsets,
    blindDirectionalCrossed:crossed(result.blindDirectional),
    blindOmniCrossed:crossed(result.blindOmni),
    blindNoSupportCrossed:crossed(result.blindNoSupport),
    blindNoSetCostCrossed:crossed(result.blindNoSetCost),
    setDriveSacrificeCrossed:crossed(result.setDriveSacrifice),
    setDriveKeepsSupportCrossed:crossed(result.setDriveKeepsSupport),
    angleCapturedCrossed:crossed(result.angleCaptured),
    angleHomingCrossed:crossed(result.angleHoming),
    angleCaptured:compact(result.angleCaptured),
    angleHoming:compact(result.angleHoming),
    sacrifice:compact(result.setDriveSacrifice),
    keepSupport:compact(result.setDriveKeepsSupport)
  };

  console.log("E0B_BROAD_ABLATION_SUMMARY",JSON.stringify(summary));

  for(const group of Object.values(result)){
    for(const value of group){
      assert.equal(value.finite,true);
      assert.equal(value.boundaryFrames,0);
    }
  }
});

test("E0b matched ablations expose support orientation mobility and commitment trade",()=>{
  const base={
    role:"breach",
    policy:"blind-drive",
    playerX:800,
    adversaryX:800
  };
  const variants={
    normal:runPolicy(base),
    noSupport:runPolicy({...base,supportScale:0}),
    omnidirectional:runPolicy({...base,omnidirectionalSupport:true}),
    noSetCost:runPolicy({...base,setMoveScale:1,setTurnScale:1}),
    driveKeepsSupport:runPolicy({...base,driveKeepsSupport:true}),
    homingDrive:runPolicy({...base,homingDrive:true}),
    noDriveMaterial:runPolicy({
      ...base,
      driveCarryScale:0,
      driveMaterialScale:0
    }),
    movementOnly:runPolicy({
      role:"breach",
      policy:"movement-only",
      playerX:800,
      adversaryX:800
    })
  };

  console.log("E0B_MATCHED_ABLATIONS",JSON.stringify(variants));

  for(const value of Object.values(variants)){
    assert.equal(value.finite,true);
    assert.equal(value.boundaryFrames,0);
  }
});
