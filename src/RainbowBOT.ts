import Discord from "discord.js";
import { REST } from "@discordjs/rest";
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord-api-types/v9";
import { SlashCommandBuilder } from "@discordjs/builders";

import { GlobalLogger } from "./GlobalLogger";
import Module from "./Modules/Module";

import EventManager from "./EventManager";
import ModuleManager from "./ModuleManager";
import UserManager from "./UserManager";
import ConfigManager from "./ConfigManager";
import GuildManager from "./GuildManager";

import { initsequelize } from "./Database";

const logger = GlobalLogger.root;

export interface RainbowBOTOptions{
    clientOptions: Discord.ClientOptions;
    sequelizeURI: string;
    masterGuildId: string;
    moduleGlobalLoading: boolean;
}

export type ModuleUUIDPair = { UUID: string, Module: typeof Module };

export default class RainbowBOT{
    public events: EventManager;
    public users: UserManager;
    public guilds: GuildManager;
    public config: ConfigManager;
    public modules: ModuleManager;

    public client: Discord.Client;
    public rest: REST;
    public SlashCommands: Map<string, SlashCommandBuilder[]> = new Map();

    public masterGuildId: string;
    public moduleGlobalLoading: boolean;

    constructor(options: RainbowBOTOptions, modules: ModuleUUIDPair[]){
        this.client = new Discord.Client(options.clientOptions);
        this.rest = new REST({ version: '9' });
        this.events = new EventManager(this);
        this.users = new UserManager(this);
        this.guilds = new GuildManager(this);
        this.config = new ConfigManager(this);
        this.modules = new ModuleManager(this);
        
        this.masterGuildId = options.masterGuildId;
        this.moduleGlobalLoading = options.moduleGlobalLoading;

        initsequelize(options.sequelizeURI);
        for(let m of modules){
            this.modules.RegisterModule(m.Module, m.UUID, true);
        }
    }

    public login(token: string){
        this.rest.setToken(token);
        logger.info(`Loggining to BOT Account...`);
        return this.client.login(token);
    }

    public PushSlashCommands(commands: SlashCommandBuilder[], guildId: string | "global"){
        this.SlashCommands.set(guildId, this.SlashCommands.has(guildId) ? this.SlashCommands.get(guildId)!.concat(commands) : commands);
    }

    public UpdateSlashCommands(guildId: string = "global"){
        return new Promise<void>(async (resolve, reject) => {
            let data: RESTPostAPIApplicationCommandsJSONBody[] = [];
            for(let c of this.SlashCommands.get(guildId) || []){
                data.push(c.toJSON());
            }
            if(guildId === "global"){
                if(data.length === 0) return;
                await this.rest.put(
                    Routes.applicationCommands(this.client.application!.id),
                    { body: data },
                ).catch(reject);
                return resolve();
            }else{
                if(data.length === 0) return;
                await this.rest.put(
                    Routes.applicationGuildCommands(this.client.application!.id, guildId),
                    { body: data },
                ).catch(reject);
                return resolve();
            }
        });
    }

    public CacheGuilds(log: boolean = false){
        return new Promise<number>(async (resolve, reject) => {
            let i = 0;
            for(var g of this.client.guilds.cache){
                if(log){
                    logger.info(`[GC]`, `Caching Guild ${i}/${this.client.guilds.cache.size}`);
                }
                let gld = await this.client.guilds.fetch({ guild: g[0], force: true, cache: true }).catch(err => {
                    if(err.code === 50001){
                        logger.warn(`[GC]`, g[0], 'Guild Fetch Error: Missing Access');
                    }else{
                        logger.warn(`[GC]`, 'Guild Fetch Error:', err);
                    }
                });
                if(gld){
                    let g = await this.guilds.fetchOne(gld.id);
                    if(!g){
                        await this.guilds.createFromDiscord(gld);
                        i++;
                        continue;
                    }
                    g.name = gld.name;
                    g.lang = gld.preferredLocale;
                    g.ownerId = gld.ownerId;
                    g.icon = gld.icon ? gld.icon : undefined;
                    g.banner = gld.banner ? gld.banner : undefined;
                    g.systemChannelId = gld.systemChannelId ? gld.systemChannelId : undefined;
                    g.botJoinedAt = gld.joinedAt;
                }
                i++;
            }
            return resolve(i);
        });
    }
}