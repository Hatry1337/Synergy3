import Discord from "discord.js";

import { Op, Transaction } from "sequelize";
import { sequelize } from "./Database";
import { StorageUserDiscordInfo } from "./Models/StorageUserDiscordInfo";
import { StorageUserEconomyInfo } from "./Models/StorageUserEconomyInfo";
import { StorageUser } from "./Models/StorageUser";

import { GlobalLogger } from "./GlobalLogger";
import RainbowBOT from "./RainbowBOT";
import User, { UserDiscordOptions } from "./Structures/User";

export default class UserManager{
    public cached: Map<number, User> = new Map();
    private discordIdsAssociations: Map<string, number> = new Map();
    private timer: NodeJS.Timeout;
    constructor(public bot: RainbowBOT){
        this.timer = setInterval(async () => {
            await this.syncStorage();
        }, 5 * 60 * 1000);
        this.bot.events.once("Stop", () => { clearInterval(this.timer); });
    }

    public idFromDiscordId(id: string){
        return this.discordIdsAssociations.get(id);
    }

    public createFromDiscord(dUser: Discord.User, groups: string[] = [ "Player" ]){
        return new Promise<User>(async (resolve, reject) => {
            let su = await StorageUser.create({
                nickname: dUser.tag,
                groups,
                lang: "en",
            }).catch(reject);
            if(!su) return;

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
                economy: {
                    points: 0.0005,
                    lvl: 1,
                    xp: 0
                }
            });
            let t = await sequelize().transaction();
            await this.syncCacheEntry(user, su!, t);
            await t.commit();
            this.cached.set(user.id, user);
            return resolve(user);
        });
    }

    public fetchOne(userId: number, force?: boolean) {
        return new Promise<User | null>(async (resolve, reject) => {
            if(!force && this.cached.has(userId)){
                return resolve(this.cached.get(userId)!);
            }
            StorageUser.findOne({
                where: {
                    id: userId
                },
                include: [ StorageUserDiscordInfo, StorageUserEconomyInfo ]
            }).then(async storage_user => {
                if(!storage_user){
                    return resolve(null);
                }
                return resolve(await this.cacheFromStorageInstance(storage_user));
            }).catch(reject);
        });
    }

    public fetchBulk(userIds: number[], force?: boolean) {
        return new Promise<User[]>(async (resolve, reject) => {
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
                return resolve(out);
            }

            StorageUser.findAll({
                where: {
                    id: {
                        [Op.in]: toBeCached
                    }
                },
                include: [ StorageUserDiscordInfo, StorageUserEconomyInfo ]
            }).then(async storage_users => {
                for(let u of storage_users){
                    out.push(await this.cacheFromStorageInstance(u));
                }
                for(let i of userIds){
                    if(out.findIndex(u => u.id === i) === -1){
                        out.push(this.cached.get(i)!);
                    }
                }
                return resolve(out);
            }).catch(reject);
        });
    }

    private async cacheFromStorageInstance(storage_user: StorageUser){
        let duser = await this.bot.client.users.fetch(storage_user.discord.discordId).catch(err => GlobalLogger.root.warn("UserManager.cacheFromStorageInstance Fetch User Error:", err));
        let discord: UserDiscordOptions = {
            id: storage_user.discord.discordId,
            tag: storage_user.discord.discordTag,
            createdAt: storage_user.discord.discordCreatedAt,
            avatar: storage_user.discord.discordAvatar ? storage_user.discord.discordAvatar : undefined,
            banner: storage_user.discord.discordBanner ? storage_user.discord.discordBanner : undefined,
            user: duser ? duser : undefined
        }
        this.discordIdsAssociations.set(discord.id, storage_user.id);

        let user = new User(this.bot, {
            id: storage_user.id,
            nickname: storage_user.nickname,
            groups: storage_user.groups,
            lang: storage_user.lang,
            discord,
            economy: {
                points: storage_user.economy.economyPoints,
                lvl: storage_user.economy.economyLVL,
                xp: storage_user.economy.economyXP
            }
        });

        this.cached.set(user.id, user);
        return user;
    }

    public updateAssociations(){
        return new Promise<void>(async (resolve, reject) => {
            StorageUserDiscordInfo.findAll().then(infos => {
                for(let i of infos){
                    this.discordIdsAssociations.set(i.discordId, i.id);
                }
                return resolve();
            }).catch(reject);
        });
    }

    public syncStorage(){
        return new Promise<void>(async (resolve, reject) => {
            StorageUser.findAll({
                where: {
                    id: {
                        [Op.in]: Array.from(this.cached.keys())
                    }
                },
                include: [ StorageUserDiscordInfo, StorageUserEconomyInfo ]
            }).then(async storage_users => {
                let t = await sequelize().transaction();
                for(let u of storage_users){
                    let user = this.cached.get(u.id)!;
                    await this.syncCacheEntry(user, u, t);
                }
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
                return resolve();
            }).catch(reject);
        });
    }

    private async syncCacheEntry(user: User, storageUser: StorageUser, t: Transaction){
        if(user.discord){
            this.discordIdsAssociations.set(user.discord.id, storageUser.id);
            await StorageUserDiscordInfo.upsert({
                id: storageUser.id,
                discordId: user.discord.id,
                discordTag: user.discord.tag,
                discordAvatar: user.discord?.avatar,
                discordBanner: user.discord?.banner,
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