import Discord from "discord.js";
import { REST } from "@discordjs/rest";
import { GlobalLogger } from "./GlobalLogger";
import Module from "./Modules/Module";

import EventManager from "./EventManager";
import ModuleManager from "./ModuleManager";
import UserManager from "./UserManager";
import ConfigManager from "./ConfigManager";
import GuildManager from "./GuildManager";

import { initsequelize, sequelize } from "./Database";
import InteractionsManager from "./InteractionsManager";
import { UserEconomyOptions } from ".";

const logger = GlobalLogger.root;

export interface SynergyOptions{
    /**
     * Discord.js ClientOptions (https://discord.js.org/#/docs/discord.js/stable/typedef/ClientOptions)
     */
    clientOptions: Discord.ClientOptions;
    /**
     * Sequelize URI (https://sequelize.org/master/manual/getting-started.html#connecting-to-a-database)
     * Supported sqlite or postgresql dialect
     */
    sequelizeURI: string;
    /**
     * Discord Guild ID where slash commands appear in development mode
     */
    masterGuildId: string;
    /**
     * Load modules' slash commands globally or only on Master Guild
     */
    moduleGlobalLoading: boolean;
    /**
     * Specify true if you need to force sync your database (Drop all tables and recreate structure)
     */
    sequelizeForceSync?: boolean;
    /**
     *  Delay between data savings to storage in managers like GuildManager, ModuleDataManager, UserManager, etc. (60 sec default.)
     */
    dataSyncDelay?: number;

    /**
     *  Default values of user's economy data
     */
    userDefaultEconomy?: UserEconomyOptions;
}

export type ModuleUUIDPair = { UUID: string, Module: typeof Module };

export default class Synergy{
    public events: EventManager;
    public users: UserManager;
    public guilds: GuildManager;
    public config: ConfigManager;
    public modules: ModuleManager;
    public interactions: InteractionsManager;

    public client: Discord.Client;
    public rest: REST;
    public isReady: boolean = false;

    public masterGuildId: string;
    public moduleGlobalLoading: boolean;

    constructor(public options: SynergyOptions, modules: ModuleUUIDPair[]){
        logger.info(`Starting Synergy 3 - Rich and Flexible Discord BOT framework...`);

        this.client = new Discord.Client(options.clientOptions);
        this.rest = new REST({ version: '9' });
        this.events = new EventManager(this);
        this.users = new UserManager(this);
        this.guilds = new GuildManager(this);
        this.config = new ConfigManager(this);
        this.interactions = new InteractionsManager(this);
        this.modules = new ModuleManager(this);
        
        this.masterGuildId = options.masterGuildId;
        this.moduleGlobalLoading = options.moduleGlobalLoading;

        if(!this.options.dataSyncDelay) this.options.dataSyncDelay = 60;

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

    public async stop(){
        this.isReady = false;
        this.events.emit("Stop");
        logger.info(`Stopping the BOT...`);
        await this.modules.UnloadAllModules().catch(logger.error);
        logger.info(`# Modules unloaded.`);
        await this.users.syncStorage().catch(logger.error);
        await this.modules.data.syncStorage().catch(logger.error);
        await this.guilds.syncStorage().catch(logger.error);
        logger.info(`# Data locked and saved.`);
        this.client.destroy();
        logger.info(`# Client destroyed.`);
        await sequelize().close().catch(logger.error);
        logger.info(`# Database disconnected.`);
        logger.info(`BOT Stopped.`);
    }

    /**
     * Don't execute this function directly! It is for internal calls 
     */
    public CacheGuilds(log: boolean = false){
        return new Promise<number>(async (resolve, reject) => {
            let i = 0;
            for(var g of this.client.guilds.cache){
                if(log){
                    logger.info(`[GC]`, `Caching Guild ${i+1}/${this.client.guilds.cache.size}`);
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