import Discord from "discord.js";

import { Op, Transaction } from "sequelize";
import { sequelize } from "./Database";
import { StorageUserDiscordInfo } from "./Models/StorageUserDiscordInfo";
import { StorageUserEconomyInfo } from "./Models/StorageUserEconomyInfo";
import { StorageUser } from "./Models/StorageUser";

import { GlobalLogger } from "./GlobalLogger";
import Synergy from "./Synergy";
import User, { UserOptions } from "./Structures/User";
import { Access } from ".";
import { UserAlreadyExistError } from "./Structures/Errors";
import CachedManager from "./Structures/CachedManager";

export default class UserManager extends CachedManager<User>{
    private discordIdsAssociations: Map<string, Discord.Snowflake> = new Map();
    constructor(public bot: Synergy){
        super();
        this.cacheStorage.on("del", this.onCacheEntryDeleted.bind(this));
    }

    /**
     * Get unified User id from Discord id
     * @param unifiedId
     */
    public unifiedIdFromDiscordId(unifiedId: string): string | undefined{
        return this.discordIdsAssociations.get(unifiedId);
    }

    /**
     * Get User Discord id from unified id
     * @param discordId
     */
    public discordIdFromUnifiedId(discordId: string): string | undefined {
        let entry = Array.from(this.discordIdsAssociations.entries()).find(e => e[1] === discordId);
        if(entry) {
            return entry[0];
        }
    }

    /**
     * Fetches User from storage
     * @param id Unified id of user to fetch
     */
    public async fetchOne(id: string): Promise<User | undefined> {
        let storageUser = await StorageUser.findOne({
            where: {
                unifiedId: id
            },
            include: [StorageUserDiscordInfo, StorageUserEconomyInfo]
        });

        if (!storageUser) {
            return;
        }

        let user = User.fromStorageUser(this.bot, storageUser);
        await user.fetchDiscordUser();

        this.cacheStorage.set(id, user);
        if(user.discord) {
            this.discordIdsAssociations.set(user.unifiedId, user.discord.id);
        }
        return user;
    }

    /**
     * Fetches multiple Users from storage
     * @param ids Unified ids of users to fetch
     */
    public async fetchBulk(ids: string[]) {
        let res: Map<string, User> = new Map();

        let storageUsers = await StorageUser.findAll({
            where: {
                unifiedId: {
                    [Op.in]: ids
                }
            },
            include: [ StorageUserDiscordInfo, StorageUserEconomyInfo ]
        });

        for(let storageUser of storageUsers) {
            let user = User.fromStorageUser(this.bot, storageUser);
            await user.fetchDiscordUser();

            this.cacheStorage.set(user.unifiedId, user);
            if(user.discord) {
                this.discordIdsAssociations.set(user.unifiedId, user.discord.id);
            }
            res.set(user.unifiedId, user);
        }

        let unfetchedUsers = ids.filter(id => storageUsers.findIndex(su => su.unifiedId === id) === -1);
        for(let id of unfetchedUsers) {
            let user = await this.fetchOne(id);
            if(!user) continue;
            this.cacheStorage.set(user.unifiedId, user);
            if(user.discord) {
                this.discordIdsAssociations.set(user.unifiedId, user.discord.id);
            }
            res.set(user.unifiedId, user);
        }

        return res;
    }

    public async createUser(options: Omit<UserOptions, "unifiedId" | "economy"> & Partial<Pick<UserOptions, "economy">>, system: boolean = false) {
        let storageUser = await StorageUser.create({
            unifiedId: system ? "0" : undefined,
            nickname: options.nickname,
            groups: options.groups,
            lang: options.lang,
        } as StorageUser);

        let user = new User(this.bot, {
            ...options,
            economy: options.economy ?? this.bot.options.userDefaultEconomy ?? {
                points: 0.0005,
                lvl: 1,
                xp: 0
            },
            unifiedId: storageUser.unifiedId
        });

        this.cacheStorage.set(user.unifiedId, user);
        if(user.discord) {
            this.discordIdsAssociations.set(user.unifiedId, user.discord.id);
        }
        return user;
    }

    public async createFromDiscord(dUser: Discord.User, groups: string[] = [ Access.PLAYER() ], system: boolean = false){
        let userDiscordInfo = await StorageUserDiscordInfo.findOne({
            where: {
                discordId: dUser.id
            }
        });

        if(userDiscordInfo) throw new UserAlreadyExistError(dUser);

        let user = await this.createUser({
            nickname: dUser.tag,
            groups,
            lang: "en"
        }, system);

        user.bindDiscord(dUser);
        this.discordIdsAssociations.set(user.unifiedId, dUser.id);
        return user;
    }

    public async forceStorageUpdate(unifiedId: string, transaction?: Transaction) {
        let user = await this.get(unifiedId);
        if(!user) return;

        let t = transaction;
        if(!t) {
            t = await sequelize().transaction();
        }

        try {
            await StorageUser.update({
                nickname: user.nickname,
                groups: user.groups,
                lang: user.lang,
            }, {
                where: {
                    unifiedId: user.unifiedId
                },
                transaction: t
            });

            await StorageUserEconomyInfo.upsert({
                unifiedId: user.unifiedId,
                economyPoints: user.economy.points,
                economyLVL: user.economy.lvl,
                economyXP: user.economy.xp,
            } as StorageUserEconomyInfo, {
                transaction: t
            });

            if(user.discord) {
                await StorageUserDiscordInfo.upsert({
                    unifiedId: user.unifiedId,
                    discordId: user.discord.id,
                    discordTag: user.discord.tag,
                    discordAvatar: user.discord.avatar,
                    discordBanner: user.discord.banner,
                    discordCreatedAt: user.discord.createdAt,
                } as StorageUserDiscordInfo, {
                    transaction: t
                });
            }

            if(!transaction) {
                await t.commit();
            }
        } catch(e) {
            GlobalLogger.root.warn("UserManager.forceStorageUpdate Error:", e);
        }
    }

    public async updateAssociations(){
        let infos = await StorageUserDiscordInfo.findAll();
        for(let i of infos){
            this.discordIdsAssociations.set(i.discordId, i.unifiedId);
        }
    }

    public override async destroy() {
        for(let k of this.cacheStorage.keys()) {
            await this.onCacheEntryDeleted(k, this.cacheStorage.get(k)!);
        }
        await super.destroy();
    }

    private async onCacheEntryDeleted(unifiedId: string, user: User) {
        await this.forceStorageUpdate(unifiedId);
    }
}