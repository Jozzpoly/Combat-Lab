export class BrowserInput {
  constructor({keyboardTarget=window, pointerTarget}={}) {
    if (!pointerTarget) throw new Error("pointerTarget required");
    this.keyboardTarget=keyboardTarget;
    this.pointerTarget=pointerTarget;
    this.keys=new Set();
    this.buttons=new Set();
    this.pointer={x:0,y:0,valid:false};

    this.onKeyDown=event=>this.keys.add(event.code);
    this.onKeyUp=event=>this.keys.delete(event.code);
    this.onBlur=()=>this.clearTransient();
    this.onPointerMove=event=>this.updatePointer(event);
    this.onPointerDown=event=>{ this.updatePointer(event); this.buttons.add(event.button); };
    this.onPointerUp=event=>{ this.updatePointer(event); this.buttons.delete(event.button); };
    this.onPointerLeave=()=>{ this.pointer.valid=false; };
  }

  attach() {
    this.keyboardTarget.addEventListener("keydown",this.onKeyDown);
    this.keyboardTarget.addEventListener("keyup",this.onKeyUp);
    this.keyboardTarget.addEventListener("blur",this.onBlur);
    this.pointerTarget.addEventListener("pointermove",this.onPointerMove);
    this.pointerTarget.addEventListener("pointerdown",this.onPointerDown);
    this.pointerTarget.addEventListener("pointerup",this.onPointerUp);
    this.pointerTarget.addEventListener("pointerleave",this.onPointerLeave);
  }

  detach() {
    this.keyboardTarget.removeEventListener("keydown",this.onKeyDown);
    this.keyboardTarget.removeEventListener("keyup",this.onKeyUp);
    this.keyboardTarget.removeEventListener("blur",this.onBlur);
    this.pointerTarget.removeEventListener("pointermove",this.onPointerMove);
    this.pointerTarget.removeEventListener("pointerdown",this.onPointerDown);
    this.pointerTarget.removeEventListener("pointerup",this.onPointerUp);
    this.pointerTarget.removeEventListener("pointerleave",this.onPointerLeave);
    this.clearTransient();
  }

  updatePointer(event) {
    const rect=this.pointerTarget.getBoundingClientRect();
    this.pointer.x=event.clientX-rect.left;
    this.pointer.y=event.clientY-rect.top;
    this.pointer.valid=true;
  }

  clearTransient() {
    this.keys.clear();
    this.buttons.clear();
  }

  snapshot() {
    return {
      keys:[...this.keys].sort(),
      buttons:[...this.buttons].sort((a,b)=>a-b),
      pointer:{...this.pointer}
    };
  }
}
