export class ExperimentRegistry {
  constructor() {
    this.definitions=new Map();
  }

  register(definition) {
    if (!definition || typeof definition !== "object") throw new Error("experiment definition required");
    if (!definition.id || typeof definition.id !== "string") throw new Error("experiment id required");
    if (!definition.title || typeof definition.title !== "string") throw new Error("experiment title required");
    if (typeof definition.create !== "function") throw new Error("experiment create() required");
    if (this.definitions.has(definition.id)) throw new Error(`duplicate experiment id: ${definition.id}`);
    this.definitions.set(definition.id, definition);
    return definition;
  }

  list() {
    return [...this.definitions.values()].map(({id,title,purpose="",controls=""})=>({id,title,purpose,controls}));
  }

  create(id, context={}) {
    const definition=this.definitions.get(id);
    if (!definition) throw new Error(`unknown experiment: ${id}`);
    const instance=definition.create(context);
    for (const name of ["step","render","reset"]) {
      if (typeof instance?.[name] !== "function") throw new Error(`${id} instance missing ${name}()`);
    }
    return {definition, instance};
  }
}
