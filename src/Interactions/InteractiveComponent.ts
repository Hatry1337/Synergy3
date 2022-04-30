import Module from "../Modules/Module";
import { AccessTarget } from "../Structures/Access";
import { InteractiveComponentTargets } from "./InteractionTypes";
import { InteractiveBase } from "./InteractiveBase";

export class InteractiveComponent<T extends InteractiveComponentTargets> extends InteractiveBase<T> {
    constructor(name: string, access: AccessTarget[], module: Module, public builder: T, private registry: Map<string, InteractiveComponent<InteractiveComponentTargets>>){
        super(name, access, module);
        this.builder.setCustomId(name);
    }

    /**
     * Get component structure builder
     */
     public build(f: (builder: T) => Omit<T, any>){
        f(this.builder);
        return this;
    }
    
    /**
     * Remove component from registry
     */
    public destroy(){
        this.registry.delete(this.name);
    }
}