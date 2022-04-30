import Module from "../Modules/Module";
import { AccessTarget } from "../Structures/Access";
import { InteractiveCommandTargets } from "./InteractionTypes";
import { InteractiveBase } from "./InteractiveBase";
import Discord from "discord.js";

export type AutocompleteCallback = (interaction: Discord.AutocompleteInteraction) => Promise<void>;
export class InteractiveCommand<T extends InteractiveCommandTargets> extends InteractiveBase<T> {
    public isUpdated: boolean = true;
    public isPushed: boolean = false;
    private autocompleteCallback?: AutocompleteCallback;

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

    /**
     *  Set command autocomplete callback function
     * @param callback function to execute when received autocomplete interaction
     */
     public onAutocomplete(callback: AutocompleteCallback){
        this.autocompleteCallback = callback;
        return this;
    }

    /**
     * Don't execute this function directly! It is for internal calls 
     */
    public async _autocomplete(interaction: Discord.AutocompleteInteraction){
        if(this.autocompleteCallback){
            await this.autocompleteCallback(interaction);
        }
    }
}