// W1: whole-scene COMPOSITION trial. The proven PR2 articulated contact
// mechanics are a donor, not an accepted organism foundation.
//
// Physical difference from PR2: non-selected residents have NO hidden root
// ground brake or jaw servo actuation. Their dynamics are passive until
// the operator selects them. This explicitly sacrifices fake resident life;
// it does NOT provide AI or real-world foot support.
import {EffectorField,V} from "./effector-world.js";

export class CommonsField extends EffectorField {
  static async create(){return new CommonsField();}
  static fromScene(recipe){
    // Same fixed-world constraints as the underlying effector field.
    // Ensure the edited scene keeps our explicit passive-resident semantics.
    const field=EffectorField.fromScene(recipe);
    Object.setPrototypeOf(field,CommonsField.prototype);
    return field;
  }
  motor(a,control){
    if(a.id!==this.selected)return; // no implicit brake, arm torque or life
    return super.motor(a,control);
  }
  populate(){
    // ONE continuous open material place. Two embodied types, two instances
    // each. This is not a crossing route, assigned mission, puzzle or autoplay.
    // Positions are intentionally not organized into independent stations.
    const left=this.spawn("pincer",V(8.7,11.9));
    this.spawn("ram",V(25.3,12.2),Math.PI);
    this.spawn("pincer",V(10.2,17.4),-.65);
    this.spawn("ram",V(25.0,17.4),Math.PI);
    this.select(left.id);

    // Light/medium/heavy FREE matter: no script, keys, hold or world motor.
    // Long narrow bodies can rotate under off-axis finite collision impulses.
    for(const item of [
      {x:12.05,y:11.9,hx:.45,hy:.48,mass:13},
      {x:16.0,y:12.2,hx:.60,hy:.55,mass:48},
      {x:18.7,y:10.8,hx:1.35,hy:.17,mass:75},
      {x:21.0,y:12.7,hx:.72,hy:.66,mass:230},
      {x:13.4,y:15.4,hx:.42,hy:.43,mass:19},
      {x:18.2,y:16.5,hx:1.20,hy:.24,mass:90},
      {x:23.0,y:8.7,hx:.42,hy:.52,mass:35}
    ])this.addBox(item,false);

    // Constrained matter shares the SAME contact field and can be pushed,
    // wedged and disturbed. There is no authored correct opening sequence.
    this.addGate({x:14.0,y:9.0,length:3.0,mass:60},false);
    this.addGate({x:20.8,y:15.0,length:2.3,mass:100},false);

    this.world.propagateModifiedBodyPositionsToColliders();
  }
}
