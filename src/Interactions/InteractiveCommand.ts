import Module from "../Modules/Module";
import { AccessTarget } from "../Structures/Access";
import { InteractiveCommandTargets } from "./InteractionTypes";
import { InteractiveBase } from "./InteractiveBase";

export class InteractiveCommand<T extends InteractiveCommandTargets> extends InteractiveBase<T> {
    public isUpdated: boolean = true;
    public isPushed: boolean = false;

    constructor(name: string, access: AccessTarget[], module: Module, public builder: T, readonly forGuildId?: string){
        super(name, access, module);
        this.builder.setName(this.name);
    }

    /**
     * Get command structure builder
     */
     public build(f: (builder: T) => Omit<T, any>){
        f(this.builder);
        return this;
    }

    /**
     * Mark command as ready to upload
     */
    public commit(){
        this.isUpdated = false;
        return this;
    }
}