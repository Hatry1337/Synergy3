import Discord from "discord.js";

import { Op } from "sequelize";
import { sequelize } from "./Database";
import { StorageUserDiscordInfo } from "./Models/StorageUserDiscordInfo";
import { StorageUserEconomyInfo } from "./Models/StorageUserEconomyInfo";
import { StorageUser } from "./Models/StorageUser";

import { GlobalLogger } from "./GlobalLogger";
import Synergy from "./Synergy";
import User, { UserDiscordOptions } from "./Structures/User";
import { Access } from ".";
import { UserAlreadyExistError } from "./Structures/Errors";
import CachedManager from "./Structures/CachedManager";

export default class UserManager extends CachedManager<User>{
    private discordIdsAssociations: Map<string, number> = new Map();
    constructor(public bot: Synergy){
        super();
        this.cacheStorage.on("del", this.onCacheEntryDeleted.bind(this));
    }

    /**
     * Get legacy underlying database User id from Discord id
     * @param id
     */
    public idFromDiscordId(id: string){
        return this.discordIdsAssociations.get(id);
    }

    /**
     * Flush whole Users cache
     */
    public flushCache() {
        this.cacheStorage.flushAll();
    }

    /**
     * Fetches User from storage
     * @param id Discord id of user to fetch
     */
    public async fetchOne(id: string) {
        let legacyId = this.idFromDiscordId(id);

        if(!legacyId) return undefined;

        let storageUser = await StorageUser.findOne({
            where: {
                id: legacyId
            },
            include: [StorageUserDiscordInfo, StorageUserEconomyInfo]
        });

        if (!storageUser) return undefined;

        let user = User.fromStorageUser(this.bot, storageUser);
        await user.fetchDiscordUser();

        this.cacheStorage.set(id, user);
        return user;
    }

    /**
     * Fetches multiple Users from storage
     * @param ids Discord ids of users to fetch
     */
    public async fetchBulk(ids: string[]) {
        let res: Map<string, User> = new Map();

        let legacyIds = ids.map(i => this.idFromDiscordId(i)).filter(i => i !== undefined);

        let storageUsers = await StorageUser.findAll({
            where: {
                id: {
                    [Op.in]: legacyIds
                }
            },
            include: [ StorageUserDiscordInfo, StorageUserEconomyInfo ]
        });

        for(let storageUser of storageUsers) {
            let user = User.fromStorageUser(this.bot, storageUser);
            await user.fetchDiscordUser();

            this.cacheStorage.set(user.id, user);
            res.set(user.discord.id, user);
        }
        return res;
    }

    public async createFromDiscord(dUser: Discord.User, groups: string[] = [ Access.PLAYER() ]){
        let userDiscordInfo = await StorageUserDiscordInfo.findOne({
            where: {
                discordId: dUser.id
            }
        });

        if(userDiscordInfo) throw new UserAlreadyExistError(dUser);

        let storageUser = await StorageUser.create({
            nickname: dUser.tag,
            groups,
            lang: "en",
        });

        let discord: UserDiscordOptions = {
            id: dUser.id,
            tag: dUser.tag,
            createdAt: dUser.createdAt,
            avatar: dUser.displayAvatarURL(),
            banner: dUser.banner ?? undefined,
            user: dUser
        }
        let user = new User(this.bot, {
            id: storageUser.id,
            nickname: storageUser.nickname,
            groups: storageUser.groups,
            lang: storageUser.lang,
            discord,
            economy: this.bot.options.userDefaultEconomy || {
                points: 0.0005,
                lvl: 1,
                xp: 0
            }
        });

        this.cacheStorage.set(user.discord.id, user);
        return user;
    }

    public async updateAssociations(){
        let infos = await StorageUserDiscordInfo.findAll();
        for(let i of infos){
            this.discordIdsAssociations.set(i.discordId, i.id);
        }
    }

    private async onCacheEntryDeleted(discordId: string, user: User) {
        let t = await sequelize().transaction();

        await StorageUser.update({
            nickname: user.nickname,
            groups: user.groups,
            lang: user.lang,
        }, {
            where: {
                id: user.id
            },
            transaction: t
        }).catch(err => GlobalLogger.root.warn("UserManager.onCacheEntryDeleted Error Updating StorageUser:", err));

        await StorageUserEconomyInfo.upsert({
            id: user.id,
            economyPoints: user.economy.points,
            economyLVL: user.economy.lvl,
            economyXP: user.economy.xp,
        }, {
            transaction: t
        }).catch(err => GlobalLogger.root.warn("UserManager.onCacheEntryDeleted Error Upserting StorageUserEconomyInfo:", err));

        await StorageUserDiscordInfo.upsert({
            id: user.id,
            discordId: user.discord.id,
            discordTag: user.discord.tag,
            discordAvatar: user.discord.avatar,
            discordBanner: user.discord.banner,
            discordCreatedAt: user.discord.createdAt,
        }, {
            transaction: t
        }).catch(err => GlobalLogger.root.warn("UserManager.onCacheEntryDeleted Error Upserting StorageUserDiscordInfo:", err));

        await t.commit();
    }
}