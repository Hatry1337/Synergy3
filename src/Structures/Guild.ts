import Discord from "discord.js";
import Synergy from "../Synergy";

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
}