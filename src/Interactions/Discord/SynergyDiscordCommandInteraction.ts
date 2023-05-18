import Discord from "discord.js";
import Synergy from "../../Synergy";
import { ISynergyDiscordInteractionOptions, SynergyDiscordInteraction } from "./SynergyDiscordInteraction";
import { SynergyCommandInteraction } from "../SynergyCommandInteraction";
import { SynergyInteractionType } from "../SynergyInteraction";

export interface ISynergyDiscordCommandInteractionOptions<T extends Discord.CommandInteraction> extends ISynergyDiscordInteractionOptions<T> {
    name: string;
}

export class SynergyDiscordCommandInteraction<T extends Discord.CommandInteraction = Discord.CommandInteraction> extends SynergyDiscordInteraction<T> implements SynergyCommandInteraction {
    public name: string;
    constructor(bot: Synergy, options: ISynergyDiscordCommandInteractionOptions<T>) {
        super(bot, options, SynergyInteractionType.Command);
        this.name = options.name;
    }
}