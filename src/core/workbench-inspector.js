function el(tag,className,text){
  const node=document.createElement(tag);
  if(className) node.className=className;
  if(text!==undefined) node.textContent=text;
  return node;
}

function finite(value,fallback=0){
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function nowMs(){
  return globalThis.performance?.now?.() ?? Date.now();
}

function decimalsFor(control){
  if(Number.isInteger(control.decimals)) return control.decimals;
  const step=Number(control.step);
  if(!Number.isFinite(step) || step<=0) return 2;
  if(step>=1) return 0;
  return Math.min(5,Math.max(0,Math.ceil(-Math.log10(step))));
}

function formatNumber(control,value){
  const n=Number(value);
  if(!Number.isFinite(n)) return "—";
  if(typeof control.format==="function") return control.format(n);
  return n.toFixed(decimalsFor(control));
}

function displayRange(control,value){
  const softMin=finite(control.softMin,0);
  const softMax=finite(control.softMax,1);
  const hardMin=Number.isFinite(control.hardMin) ? control.hardMin : softMin-(softMax-softMin)*10;
  const hardMax=Number.isFinite(control.hardMax) ? control.hardMax : softMax+(softMax-softMin)*10;
  const softSpan=Math.max(1e-9,softMax-softMin);

  let min=softMin;
  let max=softMax;

  if(value<softMin){
    min=Math.max(hardMin,value-softSpan*0.12);
  }
  if(value>softMax){
    max=Math.min(hardMax,value+softSpan*0.12);
  }

  return {min,max,hardMin,hardMax};
}

export class WorkbenchInspector {
  constructor({parameterRoot,liveRoot,restoreButton,onIntervention=()=>{}}){
    this.parameterRoot=parameterRoot;
    this.liveRoot=liveRoot;
    this.restoreButton=restoreButton;
    this.onIntervention=onIntervention;
    this.instance=null;
    this.inspector=null;
    this.numericBindings=[];
    this.liveBindings=[];
    this.editableIds=[];

    this.restoreButton.addEventListener("click",()=>{
      if(!this.inspector?.restoreDefaults) return;
      const before=this.getParameterState();
      const started=nowMs();
      this.inspector.restoreDefaults();
      const durationMs=Math.max(0,nowMs()-started);
      const after=this.getParameterState();
      const effects=this.describeParameterChanges(before,after);
      if(effects.length){
        this.onIntervention({
          operation:"restore-defaults",
          effects,
          detail:{controlCount:effects.length,durationMs}
        });
      }
      this.sync(true);
    });
  }

  mount(instance){
    this.instance=instance;
    this.inspector=instance?.inspector || null;
    this.numericBindings=[];
    this.liveBindings=[];
    this.editableIds=[];
    this.parameterRoot.replaceChildren();
    this.liveRoot.replaceChildren();

    if(!this.inspector){
      this.parameterRoot.append(
        el("div","empty-state","This experiment exposes no editable Workbench parameters.")
      );
      this.liveRoot.append(
        el("div","empty-state","No live inspector values.")
      );
      this.restoreButton.disabled=true;
      return;
    }

    this.restoreButton.disabled=typeof this.inspector.restoreDefaults!=="function";

    const schema=this.inspector.schema || {};
    for(const group of schema.groups || []){
      const section=el("section","inspector-section");
      const head=el("div","section-heading");
      const title=el("div","section-title",group.label || group.id || "Parameters");
      head.append(title);
      if(group.description){
        head.append(el("p","section-description",group.description));
      }
      section.append(head);

      for(const control of group.controls || []){
        if(control.type==="number"){
          section.append(this.#numericControl(group,control));
        }
      }

      this.parameterRoot.append(section);
    }

    for(const group of schema.liveGroups || []){
      const section=el("section","inspector-section live-section");
      const head=el("div","section-heading");
      head.append(el("div","section-title",group.label || "Live"));
      if(group.description){
        head.append(el("p","section-description",group.description));
      }
      section.append(head);

      const grid=el("div","live-grid");
      for(const item of group.values || []){
        const row=el("div","live-row");
        const label=el("span","live-label",item.label || item.id);
        const value=el("span","live-value","—");
        row.append(label,value);
        grid.append(row);
        this.liveBindings.push({item,value});
      }
      section.append(grid);
      this.liveRoot.append(section);
    }

    this.sync(true);
  }

  #provenance(group={},item={}){
    const merged={...(group.provenance || {}),...(item.provenance || {})};
    return {
      domain:String(merged.domain || "experiment"),
      scope:String(merged.scope || group.id || "parameters"),
      path:String(merged.path || item.id || "unknown")
    };
  }

  describeParameterChanges(beforeState={},afterState={},options={}){
    const requestedState=options.requestedState || null;
    const effects=[];

    for(const binding of this.numericBindings){
      const id=binding.control.id;
      const hasBefore=Object.prototype.hasOwnProperty.call(beforeState,id);
      const hasAfter=Object.prototype.hasOwnProperty.call(afterState,id);
      if(!hasBefore && !hasAfter) continue;

      const before=hasBefore ? beforeState[id] : undefined;
      const after=hasAfter ? afterState[id] : undefined;
      const hasRequested=Boolean(
        requestedState && Object.prototype.hasOwnProperty.call(requestedState,id)
      );
      const requested=hasRequested ? requestedState[id] : undefined;

      if(Object.is(before,after) && (!hasRequested || Object.is(requested,after))) continue;

      const effect={...binding.provenance,before,after};
      if(hasRequested) effect.requested=requested;
      effects.push(effect);
    }

    return effects;
  }

  #numericControl(group,control){
    const wrap=el("div","parameter-control");
    wrap.dataset.paramId=control.id;

    const header=el("div","parameter-header");
    const labelWrap=el("div","parameter-label-wrap");
    const label=el("label","parameter-label",control.label || control.id);
    if(control.shortcut){
      const kbd=el("kbd","parameter-shortcut",control.shortcut);
      labelWrap.append(label,kbd);
    }else{
      labelWrap.append(label);
    }

    const reset=el("button","icon-button","↺");
    reset.type="button";
    reset.title="Restore this parameter to its experiment default";
    reset.setAttribute("aria-label",`Reset ${control.label || control.id}`);
    const provenance=this.#provenance(group,control);

    reset.addEventListener("click",()=>{
      const before=this.#get(control.id);
      const started=nowMs();
      this.inspector?.reset?.(control.id);
      const durationMs=Math.max(0,nowMs()-started);
      const after=this.#get(control.id);
      if(!Object.is(before,after)){
        this.onIntervention({
          operation:"reset-parameter",
          effects:[{...provenance,before,after}],
          detail:{controlId:control.id,durationMs}
        });
      }
      this.sync(true);
    });

    header.append(labelWrap,reset);
    wrap.append(header);

    if(control.description){
      wrap.append(el("p","parameter-description",control.description));
    }

    const current=this.#get(control.id);
    const {min,max,hardMin,hardMax}=displayRange(control,current);

    const editor=el("div","parameter-editor");
    const range=document.createElement("input");
    range.type="range";
    range.className="parameter-slider";
    range.min=String(min);
    range.max=String(max);
    range.step=String(control.step || 0.01);
    range.value=String(current);

    const number=document.createElement("input");
    number.type="number";
    number.className="parameter-number";
    number.step=String(control.step || 0.01);
    number.min=String(hardMin);
    number.max=String(hardMax);
    number.value=formatNumber(control,current);
    number.setAttribute("aria-label",control.label || control.id);

    const unit=control.unit ? el("span","parameter-unit",control.unit) : null;
    const extreme=el("span","extreme-badge","EXTREME");
    extreme.hidden=true;
    const safety=el("span","safety-badge","SAFETY RAIL");
    safety.hidden=true;

    const apply=(value,inputKind)=>{
      const requested=Number(value);
      if(!Number.isFinite(requested)) return;
      const before=this.#get(control.id);
      const started=nowMs();
      this.inspector?.set?.(control.id,requested);
      const durationMs=Math.max(0,nowMs()-started);
      const after=this.#get(control.id);
      if(!Object.is(before,after) || !Object.is(requested,after)){
        this.onIntervention({
          operation:"set",
          effects:[{...provenance,before,after,requested}],
          detail:{controlId:control.id,inputKind,durationMs}
        });
      }
      this.sync(true);
    };

    range.addEventListener("input",()=>apply(range.value,"range"));
    number.addEventListener("change",()=>apply(number.value,"number"));
    number.addEventListener("keydown",event=>{
      if(event.key==="Enter"){
        number.blur();
      }
    });

    editor.append(range,number);
    if(unit) editor.append(unit);
    editor.append(extreme,safety);
    wrap.append(editor);

    if(control.anchors?.length){
      const anchors=el("div","parameter-anchors");
      for(const anchor of control.anchors){
        const button=el("button","anchor-button",anchor.label ?? String(anchor.value));
        button.type="button";
        button.addEventListener("click",()=>apply(anchor.value,"anchor"));
        anchors.append(button);
      }
      wrap.append(anchors);
    }

    this.numericBindings.push({
      control,range,number,extreme,safety,provenance
    });
    this.editableIds.push(control.id);

    return wrap;
  }

  #get(id){
    return finite(this.inspector?.get?.(id),0);
  }

  getParameterState(){
    if(!this.inspector) return {};
    const state={};
    for(const id of this.editableIds){
      state[id]=this.#get(id);
    }
    return state;
  }

  applyParameterState(state){
    if(!this.inspector || !state || typeof state!=="object") return;
    const allowed=new Set(this.editableIds);
    for(const [id,value] of Object.entries(state)){
      if(!allowed.has(id)) continue;
      const n=Number(value);
      if(!Number.isFinite(n)) continue;
      this.inspector.set?.(id,n);
    }
    this.sync(true);
  }

  getParameterLabels(){
    return Object.fromEntries(
      this.numericBindings.map(({control})=>[control.id,control.label || control.id])
    );
  }

  getParameterDescriptors(){
    return this.numericBindings.map(({control,provenance})=>({
      id:control.id,
      label:control.label || control.id,
      ...provenance
    }));
  }

  getComparisonDefinition(){
    const raw=this.inspector?.schema?.comparison;
    if(!raw) return null;
    const controlIds=Array.isArray(raw.controlIds) ? [...raw.controlIds] : [];
    const available=new Set(this.editableIds);
    for(const id of controlIds){
      if(!available.has(id)) throw new Error(`comparison references non-editable control: ${id}`);
    }
    return {
      id:String(raw.id || "default"),
      label:String(raw.label || raw.id || "Comparison"),
      controlIds,
      applySemantics:String(raw.applySemantics || ""),
      matchedStartHint:String(raw.matchedStartHint || "")
    };
  }

  sync(force=false){
    if(!this.inspector) return;

    for(const binding of this.numericBindings){
      const {control,range,number,extreme,safety}=binding;
      const value=this.#get(control.id);
      const {min,max,hardMin,hardMax}=displayRange(control,value);

      if(force || Number(range.min)!==min || Number(range.max)!==max){
        range.min=String(min);
        range.max=String(max);
      }

      if(force || document.activeElement!==number){
        number.value=formatNumber(control,value);
      }
      range.value=String(value);

      const outside=value<control.softMin || value>control.softMax;
      const eps=Math.max(1e-9,Math.abs(value)*1e-9);
      const atUpperSafety=hardMax>control.softMax && Math.abs(value-hardMax)<=eps;
      const atLowerSafety=hardMin<control.softMin && Math.abs(value-hardMin)<=eps;
      const atSafety=atUpperSafety || atLowerSafety;

      extreme.hidden=!outside || atSafety;
      extreme.title=outside && !atSafety
        ? "Outside the convenient soft range. This is allowed."
        : "";

      safety.hidden=!atSafety;
      safety.title=atSafety
        ? "Numerical safety rail reached. The field shows the value actually applied."
        : "";
    }

    for(const binding of this.liveBindings){
      const raw=this.inspector?.getLive?.(binding.item.id);
      binding.value.textContent=typeof binding.item.format==="function"
        ? binding.item.format(raw)
        : formatNumber(binding.item,raw);
    }
  }
}
