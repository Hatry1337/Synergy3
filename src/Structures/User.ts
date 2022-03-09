import Discord from "discord.js";
import RainbowBOT from "../RainbowBOT";

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
    group: string;
    lang: string;
    discord: UserDiscordOptions;
    economy: UserEconomyOptions;
}

export default class User implements UserOptions{
    public id: number;
    public nickname: string;
    public group: string;
    public lang: string;
    public economy: UserEconomyOptions;
    public discord: UserDiscordOptions;

    constructor(public bot: RainbowBOT, opts: UserOptions){
        this.id = opts.id;
        this.nickname = opts.nickname;
        this.group = opts.group;
        this.lang = opts.lang;
        this.economy = opts.economy;
        this.discord = opts.discord;
    }
}