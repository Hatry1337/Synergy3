import Discord from "discord.js";

import { Op, Transaction } from "sequelize";
import { sequelize } from "./Database";
import { StorageUserDiscordInfo } from "./Models/StorageUserDiscordInfo";
import { StorageUserEconomyInfo } from "./Models/StorageUserEconomyInfo";
import { StorageUser } from "./Models/StorageUser";

import { GlobalLogger } from "./GlobalLogger";
import Synergy from "./Synergy";
import User, { UserDiscordOptions } from "./Structures/User";
import { Access } from ".";
import { UserAlreadyExistError } from "./Structures/Errors";

export default class UserManager{
    public cached: Map<number, User> = new Map();
    private discordIdsAssociations: Map<string, number> = new Map();
    private timer: NodeJS.Timeout;
    constructor(public bot: Synergy){
        this.timer = setInterval(async () => {
            await this.syncStorage();
        }, (this.bot.options.dataSyncDelay || 60) * 1000);
        this.bot.events.once("Stop", () => { clearInterval(this.timer); });
    }

    public idFromDiscordId(id: string){
        return this.discordIdsAssociations.get(id);
    }

    public async createFromDiscord(dUser: Discord.User, groups: string[] = [ Access.PLAYER() ]){
        let udinfo = await StorageUserDiscordInfo.findOne({
            where: {
                discordId: dUser.id
            }
        });

        if(udinfo) throw new UserAlreadyExistError(dUser);

        let su = await StorageUser.create({
            nickname: dUser.tag,
            groups,
            lang: "en",
        });

        let discord: UserDiscordOptions = {
            id: dUser.id,
            tag: dUser.tag,
            createdAt: dUser.createdAt,
            avatar: dUser.avatar ? dUser.avatar : undefined,
            banner: dUser.banner ? dUser.banner : undefined,
            user: dUser
        }
        let user = new User(this.bot, {
            id: su.id,
            nickname: su.nickname,
            groups: su.groups,
            lang: su.lang,
            discord,
            economy: this.bot.options.userDefaultEconomy || {
                points: 0.0005,
                lvl: 1,
                xp: 0
            }
        });
        let t = await sequelize().transaction();
        await this.syncCacheEntry(user, su!, t);
        await t.commit();
        this.cached.set(user.id, user);
        return user;
    }

    public async fetchOne(userId: number, force?: boolean) {
        if(!force && this.cached.has(userId)){
            return this.cached.get(userId) ?? null;
        }
        let su = await StorageUser.findOne({
            where: {
                id: userId
            },
            include: [ StorageUserDiscordInfo, StorageUserEconomyInfo ]
        });

        if(!su) return null;

        return await this.cacheFromStorageInstance(su);
    }

    public async fetchBulk(userIds: number[], force?: boolean) {
        let toBeCached;
        let out: User[] = [];

        if(!force){
            toBeCached = userIds.filter(i => !this.cached.has(i));
        }else{
            toBeCached = userIds;
        }

        if(toBeCached.length === 0){
            for(let i of userIds){
                out.push(this.cached.get(i)!);
            }
            return out;
        }

        let storage_users = await StorageUser.findAll({
            where: {
                id: {
                    [Op.in]: toBeCached
                }
            },
            include: [ StorageUserDiscordInfo, StorageUserEconomyInfo ]
        });

        for(let u of storage_users){
            out.push(await this.cacheFromStorageInstance(u));
        }
        for(let i of userIds){
            if(out.findIndex(u => u.id === i) === -1){
                out.push(this.cached.get(i)!);
            }
        }

        return out;
    }

    private async cacheFromStorageInstance(storage_user: StorageUser){
        let duser = await this.bot.client.users.fetch(storage_user.discord.discordId);
    
        this.discordIdsAssociations.set(duser.id, storage_user.id);
        let user = this.cached.get(storage_user.id);

        let discord_opts: Partial<UserDiscordOptions>;

        if(user){
            discord_opts = user.discord;
        }else{
            discord_opts = {};
        }

        discord_opts.id = duser.id;
        discord_opts.tag = duser.tag;
        discord_opts.createdAt = duser.createdAt;
        discord_opts.avatar = duser.displayAvatarURL();
        discord_opts.banner = duser.banner ?? undefined;
        discord_opts.user = duser;

        if(user){
            user.economy.points = storage_user.economy.economyPoints;
            user.economy.lvl = storage_user.economy.economyLVL;
            user.economy.xp = storage_user.economy.economyXP;

            user.nickname = storage_user.nickname;
            user.groups = storage_user.groups;
            user.lang = storage_user.lang;
        }else{
            user = new User(this.bot, {
                id: storage_user.id,
                nickname: storage_user.nickname,
                groups: storage_user.groups,
                lang: storage_user.lang,
                discord: discord_opts as UserDiscordOptions,
                economy: {
                    points: storage_user.economy.economyPoints,
                    lvl: storage_user.economy.economyLVL,
                    xp: storage_user.economy.economyXP
                }
            });
        }

        this.cached.set(user.id, user);
        return user;
    }

    /**
     * Don't execute this function directly! It is for internal calls 
     */
    public async updateAssociations(){
        let infos = await StorageUserDiscordInfo.findAll();
        for(let i of infos){
            this.discordIdsAssociations.set(i.discordId, i.id);
        }
    }

    /**
     * Don't execute this function directly! It is for internal calls 
     */
    public async syncStorage(){
        GlobalLogger.root.info("[UserManager] Saving data to storage...");
        let storage_users = await StorageUser.findAll({
            where: {
                id: {
                    [Op.in]: Array.from(this.cached.keys())
                }
            },
            include: [ StorageUserDiscordInfo, StorageUserEconomyInfo ]
        });
        let t = await sequelize().transaction();
        for(let u of storage_users){
            let user = this.cached.get(u.id)!;
            await this.syncCacheEntry(user, u, t);
        }

        //anybody know what's that? :D
        /*
        for(let u of this.cached){
            if(storage_users.findIndex(su => su.id === u[1].id) === -1){
                let su = await StorageUser.create({
                    nickname: u[1].nickname,
                    group: u[1].group,
                    lang: u[1].lang,
                }, {
                    transaction: t
                }).catch(err => GlobalLogger.root.warn("UserManager.syncStorage Error Creating StorageUser:", err));
                if(!su) continue;
                await this.syncCacheEntry(u[1], su, t);
            }
        }
        */
        await t.commit();
    }

    private async syncCacheEntry(user: User, storageUser: StorageUser, t: Transaction){
        if(user.discord){
            this.discordIdsAssociations.set(user.discord.id, storageUser.id);
            await StorageUserDiscordInfo.upsert({
                id: storageUser.id,
                discordId: user.discord.id,
                discordTag: user.discord.tag,
                discordAvatar: user.discord.avatar,
                discordBanner: user.discord.banner,
                discordCreatedAt: user.discord.createdAt,
            }, {
                transaction: t
            }).catch(err => GlobalLogger.root.warn("UserManager.syncCacheEntry Error Upserting StorageUserDiscordInfo:", err));    
        }
        
        await StorageUserEconomyInfo.upsert({
            id: storageUser.id,
            economyPoints: user.economy.points,
            economyLVL: user.economy.lvl,
            economyXP: user.economy.xp,
        }, {
            transaction: t
        }).catch(err => GlobalLogger.root.warn("UserManager.syncCacheEntry Error Upserting StorageUserEconomyInfo:", err));

        await StorageUser.update({
            nickname: user.nickname,
            groups: user.groups,
            lang: user.lang,
        }, {
            where: {
                id: storageUser.id
            },
            transaction: t
        }).catch(err => GlobalLogger.root.warn("UserManager.syncCacheEntry Error Updating StorageUser:", err));
    }
}