import Module from "../Modules/Module";
import { AccessTarget } from "../Structures/Access";
import { InteractiveComponentTargets } from "./InteractionTypes";
import InteractiveBase from "./InteractiveBase";
import Discord from "discord.js";

export class InteractiveComponent<T extends InteractiveComponentTargets> extends InteractiveBase<T> {
    constructor(name: string, access: AccessTarget[], module: Module, public builder: T, private registry: Map<string, InteractiveComponent<InteractiveComponentTargets>>){
        super(name, access, module);
        this.builder.setCustomId(name);
    }

    public isMenu(): this is InteractiveComponent<Discord.SelectMenuBuilder>{
        return this.builder instanceof Discord.SelectMenuBuilder;
    }

    public isButton(): this is InteractiveComponent<Discord.ButtonBuilder>{
        return this.builder instanceof Discord.ButtonBuilder;
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