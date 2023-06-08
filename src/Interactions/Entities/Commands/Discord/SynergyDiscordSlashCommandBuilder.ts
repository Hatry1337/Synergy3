import Discord from "discord.js";
import { SynergyCommandBuilder, SynergyCommandBuilderType } from "../SynergyCommandBuilder";
import { SynergyDiscordCommandInteraction } from "../../../Discord/SynergyDiscordCommandInteraction";
import User from "../../../../Structures/User";

export type SlashCommandCallbackInteraction = SynergyDiscordCommandInteraction<Discord.ChatInputCommandInteraction>;

// #TODO Make synergy interaction wrapper for autocomplete discord interactions.
export type SlashCommandAutocompleteCallback = (interaction: Discord.AutocompleteInteraction, user: User) => Promise<void>;
export type SlashCommandExecutionCallback = (interaction: SlashCommandCallbackInteraction) => Promise<void>;

export class SynergyDiscordSlashCommandBuilder extends SynergyCommandBuilder<SynergyDiscordCommandInteraction<Discord.ChatInputCommandInteraction>> {
    protected type: SynergyCommandBuilderType = SynergyCommandBuilderType.DiscordSlash;
    public isUpdated: boolean = true;
    public isPushed: boolean = false;
    private autocompleteCallback?: SlashCommandAutocompleteCallback;
    private subcommandCallbacks: Map<string, SlashCommandExecutionCallback> = new Map();

    public constructor() {
        super();
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
     * @param name name of subcommand
     * @param callback function to execute when received interaction with subcommand
     */
    public setSubcommandCallback(name: string, callback: SlashCommandExecutionCallback){
        this.subcommandCallbacks.set(name, callback);
        return this;
    }

    public override async _exec(interaction: SlashCommandCallbackInteraction){
        if(interaction.discordInteraction.isChatInputCommand() && interaction.discordInteraction.options.getSubcommand(false)){
            let cb = this.subcommandCallbacks.get(interaction.discordInteraction.options.getSubcommand());
            if(cb){
                await cb(interaction);
                return;
            }
        }

        if(this.execCallback){
            await this.execCallback(interaction);
            return;
        }
    }

    /**
     *  Set command autocomplete callback function
     * @param callback function to execute when received autocomplete interaction
     */
    public onAutocomplete(callback: SlashCommandAutocompleteCallback){
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