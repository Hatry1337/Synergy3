import Discord from "discord.js";
import Synergy from "../Synergy";
import { StorageGuild } from "../Models/StorageGuild";

export interface GuildOptions{
    id: string;
    group: string;
    name: string;
    lang: string;
    ownerId: string;
    icon?: string;
    banner?: string;
    systemChannelId?: string;
    botJoinedAt: Date;

    guild?: Discord.Guild;
}

export default class Guild implements GuildOptions{
    public id: string;
    public name: string;
    public group: string;
    public lang: string;
    public ownerId: string;
    public icon?: string | undefined;
    public banner?: string | undefined;
    public systemChannelId?: string | undefined;
    public botJoinedAt: Date;

    public guild?: Discord.Guild | undefined;

    constructor(public bot: Synergy, opts: GuildOptions){
        this.id = opts.id;
        this.name = opts.name;
        this.group = opts.group;
        this.lang = opts.lang;
        this.ownerId = opts.ownerId;
        this.icon = opts.icon;
        this.banner = opts.banner;
        this.systemChannelId = opts.systemChannelId;
        this.botJoinedAt = opts.botJoinedAt;
    }

    public async fetchDiscordGuild() {
        this.guild = await this.bot.client.guilds.fetch(this.id);
        this.name = this.guild.name;
        this.ownerId = this.guild.ownerId;
        this.lang = this.guild.preferredLocale;
        this.icon = this.guild.icon ?? undefined;
        this.banner = this.guild.banner ?? undefined;
        this.systemChannelId = this.guild.systemChannelId ?? undefined;
        this.botJoinedAt = this.guild.joinedAt;

        return this.guild;
    }

    public static fromStorageGuild(bot: Synergy, storageGuild: StorageGuild): Guild {
        return new Guild(bot, {
            id: storageGuild.id,
            group: storageGuild.group,
            name: storageGuild.name,
            lang: storageGuild.lang,
            ownerId: storageGuild.ownerId,
            icon: storageGuild.icon,
            banner: storageGuild.banner,
            systemChannelId: storageGuild.systemChannelId,
            botJoinedAt: storageGuild.botJoinedAt,
            guild: undefined
        });
    }
}