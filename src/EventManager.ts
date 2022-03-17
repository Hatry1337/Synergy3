import Discord from "discord.js";
import { GlobalLogger } from "./GlobalLogger";
import RainbowBOT from "./RainbowBOT";
import User from "./Structures/User";
import { sequelize } from "./Database";
import EventEmitter from "events";
import Guild from "./Structures/Guild";

const logger = GlobalLogger.root;

export type ButtonInteractionCallback = (interaction: Discord.ButtonInteraction) => Promise<void>;

declare interface EventManager {
    on(event: 'VoiceChannelJoin',   listener: (channel: Discord.VoiceBasedChannel, member: Discord.GuildMember) => void): this;
    on(event: 'VoiceChannelQuit',   listener: (channel: Discord.VoiceBasedChannel, member: Discord.GuildMember) => void): this;
    on(event: 'VoiceChannelChange', listener: (channel_old: Discord.VoiceBasedChannel, channel_new: Discord.VoiceBasedChannel, member: Discord.GuildMember) => void): this;
    on(event: 'GuildMemberAdd',     listener: (guild: Guild, user: User, member: Discord.GuildMember) => void): this;
    on(event: 'GuildMemberAdd',     listener: (guild: Guild, user: User, member: Discord.GuildMember | Discord.PartialGuildMember) => void): this;
    once(event: 'Initialized',      listener: () => void): this;
    once(event: 'Exit',             listener: () => void): this;
}

class EventManager extends EventEmitter{
    private buttonSubscriptions: Map<string, ButtonInteractionCallback> = new Map;

    constructor(public bot: RainbowBOT) {
        super();
        this.bot.client.once(   "ready",                this.onceReady.bind(this));
        this.bot.client.on(     "guildCreate",          this.onGuildCreate.bind(this));
        this.bot.client.on(     "guildUpdate",          this.onGuildUpdate.bind(this));
        this.bot.client.on(     "voiceStateUpdate",     this.onVoiceStateUpdate.bind(this));
        this.bot.client.on(     "guildMemberAdd",       this.onGuildMemberAdd.bind(this));
        this.bot.client.on(     "guildMemberRemove",    this.onGuildMemberRemove.bind(this));
        this.bot.client.on(     "interactionCreate",    this.onInteractionCreate.bind(this));
        
        process.on(             "SIGINT",               this.onExit.bind(this));
        process.on(             "SIGTERM",              this.onExit.bind(this));
    }
    
    public ButtonEventSubscribe(cus_id: string, callback: ButtonInteractionCallback){
        this.buttonSubscriptions.set(cus_id, callback);
    }

    public ButtonEventUnSubscribe(cus_id: string){
        this.buttonSubscriptions.delete(cus_id);
    }

    private async onInteractionCreate(interaction: Discord.Interaction){
        if(interaction.isCommand()){
            await this.bot.modules.FindAndRun(interaction).catch(err => GlobalLogger.root.error("Error Running Module:", err));
            return;
        }
        if(interaction.isButton()){
            for(let e of this.buttonSubscriptions.entries()){
                if(interaction.customId === e[0]){
                    await e[1](interaction).catch(err => GlobalLogger.root.error("Error Executing Button Callback:", err));
                }
            }
            return;
        }
    }

    private async onceReady(){
        logger.info(`Loggined In! (${this.bot.client.user?.tag})`);

        await sequelize().sync({force: false});
        logger.info(`Fetching system user..`);
        await this.bot.users.updateAssociations();

        let sys = await this.bot.users.fetchOne(this.bot.users.idFromDiscordId(this.bot.client.user!.id) || -1, true);
        if(!sys){
            logger.info(`No system user. Creating new one..`);
            sys = await this.bot.users.createFromDiscord(this.bot.client.user!, "Admin");
            logger.info(`Created system user. ID: ${sys.id}`);
        }
        logger.info(`Database Synchronized.`);
        
        logger.info("Running guilds caching...");
        let cachec = await this.bot.CacheGuilds(true);
        logger.info(`Cached ${cachec} guilds.`);

        logger.info(`Running Modules Initialization...`);
        await this.bot.modules.data.loadFromStorage();
        await this.bot.config.get("amogus", "sus"); // This is for underlying data container fetching (container is sus lmfao)

        let inic = await this.bot.modules.Init().catch(err => GlobalLogger.root.error("[Ready Event] Error intializing modules:", err));
        if(!inic && inic !== 0){
            logger.fatal("Fatal error occured. Can't load modules.");
        }else{
            logger.info(`Initialized ${inic} Module Initializers.`);
            logger.info(`BOT Fully ready! Enjoy =)`);
            this.bot.isReady = true;
            this.emit("Initialized");
        }
    }

    private async onExit(){
        this.emit("Exit");
        logger.info(`Accepted exit signal. Running graceful exit task.`);
        await this.bot.modules.UnloadAllModules();
        logger.info(`Commands unloaded. Stopping Database Updates.`);
        this.bot.users.stopUpdating();
        await this.bot.users.syncStorage();
        logger.info(`Database Updates stopped. Destroying client.`);
        this.bot.client.destroy();
        logger.info(`Clinet destroyed. Disconnecting Database.`);
        await sequelize().close();
        logger.info(`Graceful exit task successfully finished.`);
        process.exit(0);
    }

    private async onGuildCreate(guild: Discord.Guild){
        GlobalLogger.userlog.info(`BOT added to guild ${guild} (${guild.name}).`);

        let g = await this.bot.guilds.fetchOne(guild.id);
        if(!g){
            await this.bot.guilds.createFromDiscord(guild);
            return;
        }
        g.name = guild.name;
        g.lang = guild.preferredLocale;
        g.ownerId = guild.ownerId;
        g.icon = guild.icon ? guild.icon : undefined;
        g.banner = guild.banner ? guild.banner : undefined;
        g.systemChannelId = guild.systemChannelId ? guild.systemChannelId : undefined;
        g.botJoinedAt = guild.joinedAt;
    }

    private async onGuildUpdate(old_guild: Discord.Guild, new_guild: Discord.Guild){
        let g = await this.bot.guilds.fetchOne(old_guild.id);
        if(!g){
            await this.bot.guilds.createFromDiscord(new_guild);
            return;
        }
        g.name = new_guild.name;
        g.lang = new_guild.preferredLocale;
        g.ownerId = new_guild.ownerId;
        g.icon = new_guild.icon ? new_guild.icon : undefined;
        g.banner = new_guild.banner ? new_guild.banner : undefined;
        g.systemChannelId = new_guild.systemChannelId ? new_guild.systemChannelId : undefined;
        g.botJoinedAt = new_guild.joinedAt;
    }

    private onVoiceStateUpdate(vs1: Discord.VoiceState, vs2: Discord.VoiceState){
        if(!vs1.channel && vs2.channel && vs2.member){
            this.emit("VoiceChannelJoin", vs2.channel, vs2.member);

            GlobalLogger.userlog.info(`${vs1.member} (${vs1.member?.user.tag}) joined ${vs2.channel} (${vs2.channel.name}) voice channel.`);
        }else if(vs1.channel && !vs2.channel && vs2.member){
            this.bot.client.emit("VoiceChannelQuit", vs1.channel, vs2.member);
    
            GlobalLogger.userlog.info(`${vs1.member} (${vs1.member?.user.tag}) leaved from ${vs1.channel} (${vs1.channel.name}) voice channel.`);
        }else if(vs1.channel && vs2.channel && vs2.member){
            this.bot.client.emit("VoiceChannelChange", vs1.channel, vs2.channel, vs2.member);
            if(vs1.channel.id !== vs2.channel.id){
                this.bot.client.emit("VoiceChannelQuit", vs1.channel, vs2.member);
                this.bot.client.emit("VoiceChannelJoin", vs2.channel, vs2.member);
            }
            GlobalLogger.userlog.info(`${vs1.member} (${vs1.member?.user.tag}) changed voice channel from ${vs1.channel} (${vs1.channel.name}) to ${vs2.channel} (${vs2.channel.name}).`);
        }
    }

    private async onGuildMemberAdd(member: Discord.GuildMember){
        GlobalLogger.userlog.info(`${member} (${member.user.tag}) joined guild ${member.guild} (${member.guild.name}).`);

        let user = await this.bot.users.fetchOne(this.bot.users.idFromDiscordId(member.id) || -1);
        if(!user){
            this.bot.users.createFromDiscord(member.user);
            return;
        }
        user.discord.tag = member.user.tag;
        user.discord.avatar = member.user.avatar ? member.user.avatar : undefined;
        user.discord.banner = member.user.banner ? member.user.banner : undefined;
        user.discord.user = member.user;
    }

    private onGuildMemberRemove(member: Discord.GuildMember | Discord.PartialGuildMember){
        GlobalLogger.userlog.info(`${member} (${member.user?.tag}) leaved guild ${member.guild} (${member.guild.name}).`);
    }
}

export default EventManager;