import Discord from "discord.js";

import { Op, Transaction } from "sequelize";
import { sequelize } from "./Database";

import { GlobalLogger } from "./GlobalLogger";
import RainbowBOT from "./RainbowBOT";
import Guild, { GuildOptions } from "./Structures/Guild";
import { StorageGuild } from "./Models/StorageGuild";

export default class GuildManager{
    public cached: Map<string, Guild> = new Map();
    private timer: NodeJS.Timeout;
    constructor(public bot: RainbowBOT){
        this.timer = setInterval(async () => {
            await this.syncStorage();
        }, (this.bot.options.dataSyncDelay || 60) * 1000);
        this.bot.events.once("Stop", () => { clearInterval(this.timer); });
    }

    public createFromDiscord(dGuild: Discord.Guild, group: string = "default"){
        return new Promise<Guild>(async (resolve, reject) => {
            let gfetched = await this.fetchOne(dGuild.id);
            if(gfetched){
                return resolve(gfetched);
            }

            let sg = await StorageGuild.create({
                id: dGuild.id,
                group,
                name: dGuild.name,
                lang: dGuild.preferredLocale,
                ownerId: dGuild.ownerId,
                icon: dGuild.icon,
                banner: dGuild.banner,
                systemChannelId: dGuild.systemChannelId,
                botJoinedAt: dGuild.joinedAt
            }).catch(reject);
            if(!sg) return;

            let gopts: GuildOptions = {
                id: dGuild.id,
                group,
                name: dGuild.name,
                lang: dGuild.preferredLocale,
                ownerId: dGuild.ownerId,
                icon: dGuild.icon ? dGuild.icon : undefined,
                banner: dGuild.banner ? dGuild.banner : undefined,
                systemChannelId: dGuild.systemChannelId ? dGuild.systemChannelId : undefined,
                botJoinedAt: dGuild.joinedAt,
                guild: dGuild
            };
            let guild = new Guild(this.bot, gopts);
            let t = await sequelize().transaction();
            await this.syncCacheEntry(guild, sg!, t);
            await t.commit();
            this.cached.set(guild.id, guild);
            return resolve(guild);
        });
    }

    public fetchOne(guildId: string, force?: boolean) {
        return new Promise<Guild | null>(async (resolve, reject) => {
            if(!force && this.cached.has(guildId)){
                return resolve(this.cached.get(guildId)!);
            }
            StorageGuild.findOne({
                where: {
                    id: guildId
                }
            }).then(async storage_guild => {
                if(!storage_guild){
                    return resolve(null);
                }
                return resolve(await this.cacheFromStorageInstance(storage_guild));
            }).catch(reject);
        });
    }

    public fetchBulk(guildIds: string[], force?: boolean) {
        return new Promise<Guild[]>(async (resolve, reject) => {
            let toBeCached;
            let out: Guild[] = [];

            if(!force){
                toBeCached = guildIds.filter(i => !this.cached.has(i));
            }else{
                toBeCached = guildIds;
            }

            if(toBeCached.length === 0){
                for(let i of guildIds){
                    out.push(this.cached.get(i)!);
                }
                return resolve(out);
            }

            StorageGuild.findAll({
                where: {
                    id: {
                        [Op.in]: toBeCached
                    }
                }
            }).then(async storage_guilds => {
                for(let g of storage_guilds){
                    out.push(await this.cacheFromStorageInstance(g));
                }
                for(let i of guildIds){
                    if(out.findIndex(u => u.id === i) === -1){
                        out.push(this.cached.get(i)!);
                    }
                }
                return resolve(out);
            }).catch(reject);
        });
    }

    private async cacheFromStorageInstance(storage_guild: StorageGuild){
        let dguild = await this.bot.client.guilds.fetch(storage_guild.id).catch(err => GlobalLogger.root.warn("GuildManager.cacheFromStorageInstance Fetch Guild Error:", err));
        let guild = new Guild(this.bot, {
            id: storage_guild.id,
            group: storage_guild.group,
            name: storage_guild.name,
            lang: storage_guild.lang,
            ownerId: storage_guild.ownerId,
            icon: storage_guild.icon,
            banner: storage_guild.banner,
            systemChannelId: storage_guild.systemChannelId,
            botJoinedAt: storage_guild.botJoinedAt,
            guild: dguild ? dguild : undefined
        });

        this.cached.set(guild.id, guild);
        return guild;
    }

    public syncStorage(){
        return new Promise<void>(async (resolve, reject) => {
            GlobalLogger.root.info("[GuildManager] Saving data to storage...");
            StorageGuild.findAll({
                where: {
                    id: {
                        [Op.in]: Array.from(this.cached.keys())
                    }
                }
            }).then(async storage_guilds => {
                let t = await sequelize().transaction();
                for(let g of storage_guilds){
                    let user = this.cached.get(g.id)!;
                    await this.syncCacheEntry(user, g, t);
                }
                await t.commit();
                return resolve();
            }).catch(reject);
        });
    }

    private async syncCacheEntry(guild: Guild, storageGuild: StorageGuild, t: Transaction){
        await StorageGuild.update({
            id: guild.id,
            group: guild.group,
            name: guild.name,
            lang: guild.lang,
            ownerId: guild.ownerId,
            icon: guild.icon,
            banner: guild.banner,
            systemChannelId: guild.systemChannelId,
            botJoinedAt: guild.botJoinedAt
        }, {
            where: {
                id: storageGuild.id
            },
            transaction: t
        }).catch(err => GlobalLogger.root.error("GuildManager.syncCacheEntry Error Updating StorageGuild:", err));
    }
}