import Discord from "discord.js";
import { Access, AccessTarget } from "..";
import Synergy from "../Synergy";

export interface UserEconomyOptions{
    points: number;
    lvl: number;
    xp: number;
}

export interface UserDiscordOptions {
    id: string;
    tag: string;
    avatar: string;
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
}