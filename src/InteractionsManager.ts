import Module from "./Modules/Module";
import Synergy from "./Synergy";
import Discord from "discord.js";
import { Colors, Emojis, Utils } from "./Utils";
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord-api-types/rest/v9";
import { GlobalLogger } from "./GlobalLogger";
import { AccessTarget } from "./Structures/Access";
import { SynergyUserError } from "./Structures/Errors";
import { InteractiveCommand } from "./Interactions/InteractiveCommand";
import { InteractiveComponent } from "./Interactions/InteractiveComponent";
import { InteractiveCommandTargets, InteractiveComponentTargets, InteractiveTargets } from "./Interactions/InteractionTypes";
import crypto from "crypto";
import InteractiveBase from "./Interactions/InteractiveBase";
import { RequestData } from "@discordjs/rest";

export interface ITemporaryComponentInfo {
    id: string;
    component: InteractiveComponent<InteractiveComponentTargets>;
    isTemporary: boolean;
    interactionsLimit: number;
    interactions: number;
    lifeTime: number;
    createdTime: Date;
}

const interactiveComponentsRegistry: Map<string, InteractiveComponent<InteractiveComponentTargets>> = new Map;
const temporaryComponents: Map<string, ITemporaryComponentInfo> = new Map;

const interactiveCommandsRegistry: Map<string, InteractiveCommand<InteractiveCommandTargets>> = new Map;

export default class InteractionsManager{
    private updateTimer: NodeJS.Timeout;
    
    constructor(public bot: Synergy) {
        this.updateTimer = setInterval(async () => {
            GlobalLogger.root.info(`[TIMER] Updating slash commands...`);
            await this.updateInteractiveCommands();
        }, 600000);
        this.bot.client.on("interactionCreate", this.onInteractionCreate.bind(this));
        this.bot.events.once("Stop", () => { clearInterval(this.updateTimer); });
    }

    /**
     * @param name command name
     * @param access access targets that allowed to use this command
     * @param module module that is created this command
     * @param forGuildId guild id where to upload this command. Leave empty to global upload
     * @param type command type
     */
    public createCommand<T extends InteractiveCommandTargets>(name: string, access: AccessTarget[], module: Module, type: new() => T, forGuildId?: string){
        if(interactiveCommandsRegistry.has(name)){
            throw new Error("Command with this name already exists.");
        }
        let cmd = new InteractiveCommand<T>(name, access, module, new type(), forGuildId);
        interactiveCommandsRegistry.set(name, cmd);
        return cmd;
    }

    /**
     * @param name command name
     * @param access access targets that allowed to use this command
     * @param module module that is created this command
     * @param forGuildId guild id where to upload this command. Leave empty to global upload
     */
    public createSlashCommand(name: string, access: AccessTarget[], module: Module, forGuildId?: string){
        return this.createCommand<Discord.SlashCommandBuilder>(name, access, module, Discord.SlashCommandBuilder, forGuildId);
    }

    /**
     * @param name command name
     * @param access access targets that allowed to use this command
     * @param module module that is created this command
     * @param forGuildId guild id where to upload this command. Leave empty to global upload
     */
    public createMenuCommand(name: string, access: AccessTarget[], module: Module, forGuildId?: string){
        return this.createCommand<Discord.ContextMenuCommandBuilder>(name, access, module, Discord.ContextMenuCommandBuilder, forGuildId);
    }

    public getCommand(name: string){
        return interactiveCommandsRegistry.get(name);
    }

    public createComponent<T extends InteractiveComponentTargets>(name: string, access: AccessTarget[], module: Module, type: new() => T){
        if(interactiveComponentsRegistry.has(name)){
            throw new Error("Component with this name already exists.");
        }
        let cmp = new InteractiveComponent<T>(name, access, module, new type(), interactiveComponentsRegistry);
        interactiveComponentsRegistry.set(name, cmp);
        return cmp;
    }

    public createTempComponent<T extends InteractiveComponentTargets>(access: AccessTarget[], module: Module, type: new() => T, maxInts: number = -1, lifeTime: number = -1){
        let id = crypto.randomUUID().toLowerCase();
        while(interactiveComponentsRegistry.has(id)){
            id = crypto.randomUUID().toLowerCase();
        }

        let cmp = new InteractiveComponent<T>(id, access, module, new type(), interactiveComponentsRegistry);
        interactiveComponentsRegistry.set(id, cmp);
        temporaryComponents.set(id, {
            id,
            component: cmp,
            isTemporary: true,
            interactionsLimit: maxInts,
            interactions: 0,
            lifeTime,
            createdTime: new Date()
        });
        return cmp;
    }

    /**
     * Creates normal interactive button
     * @param name Name of the component (identifier)
     * @param access Allowed access targets to interact with this component
     * @param module Module that created this component
     */
    public createButton(name: string, access: AccessTarget[], module: Module): InteractiveComponent<Discord.ButtonBuilder>;
    /**
     * Creates temporary interactive button that will be removed by interactions limit or lifetime limit
     * @param access Allowed access targets to interact with this component
     * @param module Module that created this component
     * @param interactionsLimit After reaching this amount of interactions component will be removed (-1 for no limit)
     */
    public createButton(access: AccessTarget[], module: Module, interactionsLimit?: number): InteractiveComponent<Discord.ButtonBuilder>;
    /**
     * Creates temporary interactive button that will be removed by interactions limit or lifetime limit
     * @param access Allowed access targets to interact with this component
     * @param module Module that created this component
     * @param interactionsLimit After reaching this amount of interactions component will be removed (-1 for no limit)
     * @param lifeTime After this amount of milliseconds component will be removed (-1 for no limit)
     */
    public createButton(access: AccessTarget[], module: Module, interactionsLimit?: number, lifeTime?: number): InteractiveComponent<Discord.ButtonBuilder>;

    public createButton(arg1: string | AccessTarget[], arg2: AccessTarget[] | Module, arg3?: Module | number, arg4?: number){
        if(typeof arg1 === "string"){
            return this.createComponent<Discord.ButtonBuilder>(arg1, arg2 as AccessTarget[], arg3 as Module, Discord.ButtonBuilder);
        }else{
            return this.createTempComponent<Discord.ButtonBuilder>(arg1, arg2 as Module, Discord.ButtonBuilder, (arg3 as number) ?? -1, arg4 ?? -1);
        }
    }

    /**
     * Creates normal interactive button
     * @param name Name of the component (identifier)
     * @param access Allowed access targets to interact with this component
     * @param module Module that created this component
     */
    public createSelectMenu(name: string, access: AccessTarget[], module: Module): InteractiveComponent<Discord.SelectMenuBuilder>;
    /**
     * Creates temporary interactive select menu that will be removed by interactions limit or lifetime limit
     * @param access Allowed access targets to interact with this component
     * @param module Module that created this component
     * @param interactionsLimit After reaching this amount of interactions component will be removed (-1 for no limit)
     */
    public createSelectMenu(access: AccessTarget[], module: Module, interactionsLimit?: number): InteractiveComponent<Discord.SelectMenuBuilder>;
    /**
     * Creates temporary interactive select menu that will be removed by interactions limit or lifetime limit
     * @param access Allowed access targets to interact with this component
     * @param module Module that created this component
     * @param interactionsLimit After reaching this amount of interactions component will be removed (-1 for no limit)
     * @param lifeTime After this amount of milliseconds component will be removed (-1 for no limit)
     */
    public createSelectMenu(access: AccessTarget[], module: Module, interactionsLimit?: number, lifeTime?: number): InteractiveComponent<Discord.SelectMenuBuilder>;

    public createSelectMenu(arg1: string | AccessTarget[], arg2: AccessTarget[] | Module, arg3?: Module | number, arg4?: number){
        if(typeof arg1 === "string"){
            return this.createComponent<Discord.SelectMenuBuilder>(arg1, arg2 as AccessTarget[], arg3 as Module, Discord.SelectMenuBuilder);
        }else{
            return this.createTempComponent<Discord.SelectMenuBuilder>(arg1, arg2 as Module, Discord.SelectMenuBuilder, (arg3 as number) ?? -1, arg4 ?? -1);
        }
    }

    public getTempInfo(name: string){
        return temporaryComponents.get(name);
    }

    public getComponent(name: string){
        return interactiveComponentsRegistry.get(name);
    }

    public async overwriteInteractiveCommands(){
        if(!this.bot.client.isReady()) return;
        let cmds = Array.from(interactiveCommandsRegistry.values());
        if(cmds.length === 0) return;

        let cmd_guilds: Map<string, RESTPostAPIApplicationCommandsJSONBody[]> = new Map();
        let cmd_global: RESTPostAPIApplicationCommandsJSONBody[] = [];

        for(let c of cmds){
            try {
                if(c.forGuildId){
                    let cmds = cmd_guilds.get(c.forGuildId) || [];
                    cmds.push(c.builder.toJSON());
                    cmd_guilds.set(c.forGuildId, cmds);
                    c.isUpdated = true;
                    c.isPushed = true;
                }else{
                    cmd_global.push(c.builder.toJSON());
                    c.isUpdated = true;
                    c.isPushed = true;
                }
            } catch (error) {
                GlobalLogger.root.error("Error serializing interactive command builder:", error, c);
            }
        }

        for(let cg of cmd_guilds.entries()){
            await this.bot.rest.put(Routes.applicationGuildCommands(this.bot.client.application!.id, cg[0]), { body: cg[1] })
                .catch(err => GlobalLogger.root.error("Error Overwriting Guild Commands:", err));
        }

        if(cmd_global.length !== 0){
            await this.bot.rest.put(Routes.applicationCommands(this.bot.client.application!.id), { body: cmd_global })
                .catch(err => GlobalLogger.root.error("Error Overwriting Global Commands:", err));
        }
    }

    /**
     * Upload all commands to discord servers. Probably you can use this, but it's useless cuz manager execute this periodically by itself
     */
    public async updateInteractiveCommands(){
        if(!this.bot.client.isReady()) return;
        let cmds = Array.from(interactiveCommandsRegistry.values()).filter(c => !c.isUpdated);
        if(cmds.length === 0) return;

        for(let c of cmds){
            GlobalLogger.root.info(`Uploading ${c.name} command...`);
            let payload: RequestData;
            try {
                payload = { body: c.builder.toJSON() };
            } catch (error) {
                GlobalLogger.root.error("Error serializing interactive command builder:", error, c);
                continue;
            }

            let endpoint = c.forGuildId 
                            ? Routes.applicationGuildCommands(this.bot.client.application!.id, c.forGuildId) 
                            : Routes.applicationCommands(this.bot.client.application!.id);

            try {
                if(c.isPushed){
                    await this.bot.rest.patch(endpoint, payload);
                }else{
                    await this.bot.rest.post(endpoint, payload);
                    c.isPushed = true;
                }
                c.isUpdated = true;
            } catch (error) {
                GlobalLogger.root.error("Error Uploading Guild Command:", error, c);
            }
        }
    }

    private async onInteractionCreate(interaction: Discord.Interaction): Promise<void> {
        if(!this.bot.isReady){
            return;
        }

        let target: InteractiveBase<InteractiveTargets>;
        if(interaction.isAutocomplete()){
            let cmd = Array.from(interactiveCommandsRegistry.values()).find(c => c.name === interaction.commandName);
            if(!cmd){
                GlobalLogger.root.warn(`Fired "${interaction.commandName}" autocomplete but InteractiveCommand not found.`);
                return;
            }
            try {
                let user = await this.bot.users.get(interaction.user.id);

                if(!user){
                    user = await this.bot.users.createFromDiscord(interaction.user);
                }
                await cmd._autocomplete(interaction, user);
            } catch (error) {
                GlobalLogger.root.error(`Error autocompleteing "${interaction.commandName}":`, error);
            }
            return;
        }else if(interaction.type === Discord.InteractionType.ApplicationCommand){
            let cmd = Array.from(interactiveCommandsRegistry.values()).find(c => c.name === interaction.commandName);
            if(!cmd){
                GlobalLogger.root.warn(`Fired "${interaction.commandName}" command but InteractiveCommand not found.`);
                return;
            }
            target = cmd;
        }else if(interaction.isMessageComponent()){
            let cmp = Array.from(interactiveComponentsRegistry.values()).find(c => c.name === interaction.customId);
            if(!cmp){
                GlobalLogger.root.warn(`Activated "${interaction.customId}" component but InteractiveComponent not found.`);
                return;
            }
            target = cmp;
        }else{
            GlobalLogger.root.info(`[InteractionsManager] Interaction type "${interaction.type}" is not implemented, skipping.`);
            return;
        }

        let user = await this.bot.users.get(interaction.user.id);

        if(!user){
            user = await this.bot.users.createFromDiscord(interaction.user);
        }

        let access_flag = false;

        for(let a of target.access){
            if(user.groups.includes("banned")){
                access_flag = a.startsWith("banned");
                continue;
            }
            if(a.startsWith("player")){
                access_flag = true;
                break;
            }
            if(a.startsWith("group")){
                let res = /group<(.*)>/.exec(a);
                if(!res || !res[1]){
                    GlobalLogger.root.warn("InteractionsManager.InteractionProcessing: Passed invalid group access target \"", a + "\"");
                    continue;
                }
                if(user.groups.includes(res[1])){
                    access_flag = true;
                    break;
                }
            }
            if(a.startsWith("user")){
                let res = /user<(.*)>/.exec(a);
                if(!res || !res[1]){
                    GlobalLogger.root.warn("InteractionsManager.InteractionProcessing: Passed invalid user access target \"", a + "\"");
                    continue;
                }
                if(user.id.toString() === res[1] || user.discord.id === res[1]){
                    access_flag = true;
                    break;
                }
            }
            if(a.startsWith("role") && interaction.inGuild()){
                let res = /role<(.*)>/.exec(a);
                if(!res || !res[1]){
                    GlobalLogger.root.warn("InteractionsManager.InteractionProcessing: Passed invalid role access target \"", a + "\"");
                    continue;
                }
                if(interaction.member.roles instanceof Discord.GuildMemberRoleManager){
                    if(interaction.member.roles.cache.has(res[1])){
                        access_flag = true;
                        break;
                    }
                }else{
                    if(interaction.member.roles.includes(res[1])){
                        access_flag = true;
                        break;
                    }
                }
            }
            if(a.startsWith("perm") && interaction.inGuild()){
                let res = /perm<(.*)>/.exec(a);
                if(!res || !res[1]){
                    GlobalLogger.root.warn("InteractionsManager.InteractionProcessing: Passed invalid perm access target \"", a + "\"");
                    continue;
                }
                if(interaction.member.permissions instanceof Discord.PermissionsBitField){
                    if(interaction.member.permissions.has(res[1] as Discord.PermissionResolvable)){
                        access_flag = true;
                        break;
                    }
                }
            }
            if(a.startsWith("server_mod")){
                if(interaction.guild && interaction.member instanceof Discord.GuildMember){
                    let configEntry = user.bot.config.getConfigEntry("guild", "moderator_role");
                    if(!configEntry || !(configEntry.entry.isCommon() || configEntry.entry.isEphemeral())) {
                        GlobalLogger.root.warn("InteractionsManager", "onInteractionCreate server_mod check wrong ConfigEntry type.");
                        continue;
                    }
                    if(configEntry.entry.isArray() || !configEntry.entry.isRole()) {
                        GlobalLogger.root.warn("InteractionsManager", "onInteractionCreate server_mod check wrong ConfigEntry type.");
                        continue;
                    }

                    let mod_role = configEntry.entry.getValue(interaction.guild.id);

                    if(!mod_role){
                        await interaction.reply({ embeds: [ Utils.ErrMsg("You need Moderator Role to do this. Configure them with command `/config guild set field:moderator_role value_role:@Role`") ], ephemeral: true });
                        return;
                    }
                    if(interaction.member.roles.cache.has(mod_role.id)){
                        access_flag = true;
                        break;
                    }
                }
            }
            if(a.startsWith("server_admin")){
                if(interaction.member && interaction.member.permissions instanceof Discord.PermissionsBitField){
                    if(interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)){
                        access_flag = true;
                        break;
                    }
                }
            }
            if(a.startsWith("admin")){
                if(user.groups.includes("admin")){
                    access_flag = true;
                    break;
                }
            }
        }
        
        if(!access_flag){
            await interaction.reply({ embeds: [
                new Discord.EmbedBuilder()
                .setTitle("You don't have access to do this!")
                .setDescription("To do this you need following access targets:\n`" + target.access.join("`\n`") + "`")
                .setColor(Colors.Error)
            ], ephemeral: true });
            return;
        }else{
            try {
                if(temporaryComponents.has(target.name)){
                    let cmp = temporaryComponents.get(target.name) as ITemporaryComponentInfo;
                    cmp.interactions++;
                    if((cmp.interactionsLimit !== -1 && cmp.interactions > cmp.interactionsLimit) || 
                       (cmp.lifeTime !== -1 && new Date().getTime() - cmp.createdTime.getTime() > cmp.lifeTime)){

                        interactiveComponentsRegistry.delete(cmp.id);
                        temporaryComponents.delete(cmp.id);
                        throw new SynergyUserError("This interactive component is no longer available. Try to re-run command that created this component.");
                    }
                }
                await target._exec(interaction as any, user); //Yea this is dirty hack, but.... I waste too much time to make it work..
            } catch (err) {
                let embed = new Discord.EmbedBuilder();
                if(err instanceof SynergyUserError){
                    embed.setTitle(Emojis.RedErrorCross + err.message);
                    embed.setDescription(err.subMessage ? err.subMessage : null);
                    embed.setColor(Colors.Error);
                }else{
                    let trace = GlobalLogger.Trace(interaction, target, user, err);
                    GlobalLogger.root.error("InteractionsManager.InteractionProcessing.TargetCallbackError: ", err, `TraceID: ${trace}`);

                    embed.setTitle(Emojis.RedErrorCross + "Unexpected Error occurred.");
                    embed.setDescription(`Please contact BOT tech support with following Trace Code: \`\`\`${trace}\`\`\``);
                    embed.setColor(Colors.Error);
                }

                try{
                    if(interaction.replied || interaction.deferred){
                        await interaction.editReply({ embeds: [embed] });
                    }else{
                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                }catch{
                    GlobalLogger.root.warn("InteractionsManager.InteractionProcessing.TargetCallbackError.ErrReply: Can't reply.");
                    return;
                }
            }
        }
    }
}