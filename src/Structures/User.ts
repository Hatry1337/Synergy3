import Discord from "discord.js";
import { Access, AccessTarget } from "..";
import Synergy from "../Synergy";
import { StorageUser } from "../Models/StorageUser";

export interface UserEconomyOptions{
    points: number;
    lvl: number;
    xp: number;
}

export interface UserDiscordOptions {
    id: string;
    tag: string;
    avatar?: string;
    banner?: string;
    createdAt: Date;
    user?: Discord.User;
}

export interface UserOptions{
    id: number;
    nickname: string;
    groups: string[];
    lang: string;
    discord: UserDiscordOptions;
    economy: UserEconomyOptions;
}

export default class User implements UserOptions{
    public id: number;
    public nickname: string;
    public groups: string[];
    public lang: string;
    public economy: UserEconomyOptions;
    public discord: UserDiscordOptions;

    constructor(public bot: Synergy, opts: UserOptions){
        this.id = opts.id;
        this.nickname = opts.nickname;
        this.groups = opts.groups;
        this.lang = opts.lang;
        this.economy = opts.economy;
        this.discord = opts.discord;
    }

    public async haveAccess(access: AccessTarget[], guild: Discord.Guild){
        return await Access.Check(this, access, guild);
    }

    public async fetchDiscordUser() {
        this.discord.user = await this.bot.client.users.fetch(this.discord.id);
        this.discord.tag = this.discord.user.tag;
        this.discord.avatar = this.discord.user.displayAvatarURL();
        this.discord.banner = this.discord.user.banner ?? undefined;
        return this.discord.user;
    }

    public static fromStorageUser(bot: Synergy, storageUser: StorageUser): User {
        let discordOpts: UserDiscordOptions = {
            id: storageUser.discord.discordId,
            tag: storageUser.discord.discordTag,
            createdAt: storageUser.discord.discordCreatedAt,
            avatar: storageUser.discord.discordAvatar ?? undefined,
            banner: storageUser.discord.discordBanner ?? undefined,
            user: undefined
        };

        let user = new User(bot, {
            id: storageUser.id,
            nickname: storageUser.nickname,
            groups: storageUser.groups,
            lang: storageUser.lang,
            discord: discordOpts,
            economy: {
                points: storageUser.economy.economyPoints,
                lvl: storageUser.economy.economyLVL,
                xp: storageUser.economy.economyXP
            }
        });
        return user;
    }
}