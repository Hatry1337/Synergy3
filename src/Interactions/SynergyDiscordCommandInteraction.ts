import {
    ISynergyBaseCommandInteractionOptions,
    ISynergyInteractionReplyOptions,
    SynergyBaseCommandInteraction
} from "./SynergyBaseCommandInteraction";
import { ModulePlatform } from "../Modules/Module";
import Discord from "discord.js";
import Synergy from "../Synergy";
import { Stream } from "node:stream";

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

export interface ISynergyDiscordCommandInteractionOptions extends ISynergyBaseCommandInteractionOptions<ModulePlatform.Discord>{
    platform: ModulePlatform.Discord;
    discordInteraction: Discord.CommandInteraction;
}

export class SynergyDiscordCommandInteraction extends SynergyBaseCommandInteraction<ModulePlatform.Discord> {
    public readonly discordInteraction: Discord.CommandInteraction;

    constructor(bot: Synergy, options: ISynergyDiscordCommandInteractionOptions) {
        super(bot, {
            ...options,
            platform: ModulePlatform.Discord
        });
        this.discordInteraction = options.discordInteraction;
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
            files
        });
    }
}