import Module from "../Modules/Module";
import { AccessTarget } from "../Structures/Access";
import User from "../Structures/User";
import { CallbackTypeOf, InteractionTypeOf, InteractiveTargets } from "./InteractionTypes";

export default class InteractiveBase<T extends InteractiveTargets> {
    private execCallback?: CallbackTypeOf<T>;
    public lastInteraction?: InteractionTypeOf<T>

    constructor(readonly name: string, public access: AccessTarget[], public module: Module){
    }

    /**
     *  Set command callback function
     * @param callback function to execute when received interaction
     */
     public onExecute(callback: CallbackTypeOf<T>){
        this.execCallback = callback;
        return this;
    }

    /**
     * Don't execute this function directly! It is for internal calls 
     */
    public async _exec(interaction: InteractionTypeOf<T>, user: User){
        this.lastInteraction = interaction;
        if(this.execCallback){
            await this.execCallback(interaction, user);
        }
    }
}