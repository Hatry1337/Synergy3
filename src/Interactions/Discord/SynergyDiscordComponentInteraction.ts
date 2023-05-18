import Discord from "discord.js";
import Synergy from "../../Synergy";
import { ISynergyDiscordInteractionOptions, SynergyDiscordInteraction } from "./SynergyDiscordInteraction";
import { SynergyInteractionType } from "../SynergyInteraction";
import { SynergyComponentInteraction } from "../SynergyComponentInteraction";

export interface ISynergyDiscordComponentInteractionOptions<T extends Discord.MessageComponentInteraction> extends ISynergyDiscordInteractionOptions<T> {
    customId: string;
}

export class SynergyDiscordComponentInteraction<T extends Discord.MessageComponentInteraction = Discord.MessageComponentInteraction> extends SynergyDiscordInteraction<T> implements SynergyComponentInteraction {
    public customId: string;
    constructor(bot: Synergy, options: ISynergyDiscordComponentInteractionOptions<T>) {
        super(bot, options, SynergyInteractionType.Component);
        this.customId = options.customId;
    }
}