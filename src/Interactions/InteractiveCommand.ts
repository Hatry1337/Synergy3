import Module from "../Modules/Module";
import { AccessTarget } from "../Structures/Access";
import { InteractionTypeOf, InteractiveCommandTargets } from "./InteractionTypes";
import InteractiveBase from "./InteractiveBase";
import Discord from "discord.js";
import { ContextMenuCommandBuilder, SlashCommandBuilder } from "@discordjs/builders";
import { CallbackTypeOf, User } from "..";

export type AutocompleteCallback = (interaction: Discord.AutocompleteInteraction, user: User) => Promise<void>;
export class InteractiveCommand<T extends InteractiveCommandTargets> extends InteractiveBase<T> {
    public isUpdated: boolean = true;
    public isPushed: boolean = false;
    private autocompleteCallback?: AutocompleteCallback;
    private subcommandCallbacks: Map<string, CallbackTypeOf<T>> = new Map();

    constructor(name: string, access: AccessTarget[], module: Module, public builder: T, readonly forGuildId?: string){
        super(name, access, module);
        this.builder.setName(this.name);
    }

    public isSlashCommand(): this is InteractiveCommand<SlashCommandBuilder>{
        return this.builder instanceof SlashCommandBuilder;
    }

    public isContextMenuCommand(): this is InteractiveCommand<ContextMenuCommandBuilder>{
        return this.builder instanceof ContextMenuCommandBuilder;
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
     *  Add subcommand callback function
     * @param callback function to execute when received interaction with subcommand
     */
    public onSubcommand(name: string, callback: CallbackTypeOf<T>){
        this.subcommandCallbacks.set(name, callback);
        return this;
    }

    /**
     * Don't execute this function directly! It is for internal calls 
     */
     public async _exec(interaction: InteractionTypeOf<T>, user: User){
        this.lastInteraction = interaction;

        if(interaction instanceof Discord.CommandInteraction && interaction.options.getSubcommand(false)){
            let cb = this.subcommandCallbacks.get(interaction.options.getSubcommand());
            if(cb){
                await cb(interaction, user);
                return;
            }
        }

        if(this.execCallback){
            await this.execCallback(interaction, user);
            return;
        }
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
    public async _autocomplete(interaction: Discord.AutocompleteInteraction, user: User){
        if(this.autocompleteCallback){
            await this.autocompleteCallback(interaction, user);
        }
    }
}