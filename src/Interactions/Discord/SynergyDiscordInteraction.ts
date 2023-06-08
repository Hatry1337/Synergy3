import Discord from "discord.js";
import Synergy from "../../Synergy";
import { ModulePlatform } from "../../Modules/Module";
import { Stream } from "node:stream";
import { SynergyDiscordComponentInteraction } from "./SynergyDiscordComponentInteraction";
import { SynergyDiscordCommandInteraction } from "./SynergyDiscordCommandInteraction";
import {
    ISynergyInteractionOptions,
    ISynergyInteractionReplyOptions,
    SynergyInteraction,
    SynergyInteractionType
} from "../SynergyInteraction";

type DiscordCommandOrComponentInteraction = Discord.CommandInteraction | Discord.MessageComponentInteraction;

export interface ISynergyDiscordInteractionReplyOptions extends ISynergyInteractionReplyOptions {
    tts?: boolean;
    ephemeral?: boolean;
    fetchReply?: boolean;
    embeds?: Discord.EmbedBuilder[];
    allowedMentions?: Discord.MessageMentionOptions;
    flags?: Discord.BitFieldResolvable<
        Extract<Discord.MessageFlagsString, 'Ephemeral' | 'SuppressEmbeds'>,
        Discord.MessageFlags.Ephemeral | Discord.MessageFlags.SuppressEmbeds
        >;
    attachments?: (
        | Discord.JSONEncodable<Discord.APIAttachment>
        | Discord.Attachment
        | Discord.AttachmentBuilder
        | Discord.AttachmentPayload
        )[];
    components?: (
        | Discord.JSONEncodable<Discord.APIActionRowComponent<Discord.APIMessageActionRowComponent>>
        | Discord.ActionRowData<Discord.MessageActionRowComponentData | Discord.MessageActionRowComponentBuilder>
        | Discord.APIActionRowComponent<Discord.APIMessageActionRowComponent>
        )[];
}

export interface ISynergyDiscordInteractionOptions<T extends DiscordCommandOrComponentInteraction> extends Omit<ISynergyInteractionOptions<ModulePlatform.Discord>, "name" | "platform"> {
    discordInteraction: T;
}

export abstract class SynergyDiscordInteraction<T extends DiscordCommandOrComponentInteraction = DiscordCommandOrComponentInteraction> extends SynergyInteraction<ModulePlatform.Discord> {
    public readonly discordInteraction: T;

    protected constructor(bot: Synergy, options: Omit<ISynergyDiscordInteractionOptions<T>, "platform">, type: SynergyInteractionType) {
        super(bot, {
            ...options,
            platform: ModulePlatform.Discord
        }, type);
        this.discordInteraction = options.discordInteraction;
        Discord.AutocompleteInteraction
    }

    public isComponent(): this is SynergyDiscordComponentInteraction {
        return this.type === SynergyInteractionType.Component;
    }

    public isCommand(): this is SynergyDiscordCommandInteraction {
        return this.type === SynergyInteractionType.Command;
    }

    public async reply(options: ISynergyDiscordInteractionReplyOptions) {
        let files:(
            | Discord.BufferResolvable
            | Stream
            | Discord.JSONEncodable<Discord.APIAttachment>
            | Discord.Attachment
            | Discord.AttachmentBuilder
            | Discord.AttachmentPayload
            )[] = [];

        if(options.files) {
            files = files.concat(options.files);
        }
        if(options.attachments) {
            files = files.concat(options.attachments);
        }

        await this.discordInteraction.reply({
            ...options,
            ...options.extras,
            files
        });
    }
}