import Module from "./Modules/Module";
import Synergy from "./Synergy";
import Discord from "discord.js";
import { Colors, Emojis, Utils } from "./Utils";
import { GlobalLogger } from "./GlobalLogger";
import { SynergyUserError } from "./Structures/Errors";
import crypto from "crypto";
import { RequestData } from "@discordjs/rest";
import { SynergyDiscordComponentInteraction } from "./Interactions/Discord/SynergyDiscordComponentInteraction";
import { SynergyComponentBuilder } from "./Interactions/Entities/Components/SynergyComponentBuilder";
import { SynergySlashCommandBuilder } from "./Interactions/Entities/Commands/SynergyCommandBuilder";
import { SynergyDiscordCommandInteraction } from "./Interactions/Discord/SynergyDiscordCommandInteraction";
import { SynergyInteraction } from "./Interactions/SynergyInteraction";
import { SynergyComponentInteraction } from "./Interactions/SynergyComponentInteraction";

export interface ITemporaryComponentInfo {
    id: string;
    component: SynergyComponentBuilder;
    isTemporary: boolean;
    interactionsLimit: number;
    interactions: number;
    lifeTime: number;
    createdTime: Date;
}

export interface IRegistryEntry {
    module: Module;
}

export interface ICommandRegistryEntry extends IRegistryEntry {
    name: string;
    builder: SynergySlashCommandBuilder;
}

export interface IComponentRegistryEntry extends IRegistryEntry {
    customId: string;
    builder: SynergyComponentBuilder;
}

const temporaryComponents: Map<string, ITemporaryComponentInfo> = new Map;

const interactiveCommandsRegistry: Map<string, ICommandRegistryEntry> = new Map;
const interactiveComponentsRegistry: Map<string, IComponentRegistryEntry> = new Map;

export default class InteractionsManager{
    private readonly updateTimer: NodeJS.Timeout;
    
    constructor(public bot: Synergy) {
        this.updateTimer = setInterval(async () => {
            GlobalLogger.root.info(`[TIMER] Updating slash commands...`);
            await this.updateInteractiveCommands();
        }, 600000);
        this.bot.client.on("interactionCreate", this.onDiscordInteractionCreate.bind(this));
        this.bot.events.once("Stop", () => { clearInterval(this.updateTimer); });
    }

    /**
     * @param builder command builder to register
     * @param module module that created this command
     */
    public registerCommand(builder: SynergySlashCommandBuilder<any>, module: Module){
        if(interactiveCommandsRegistry.has(builder.name)){
            throw new Error("Command with this name already exists.");
        }
        interactiveCommandsRegistry.set(builder.name, {
            name: builder.name,
            module,
            builder
        });
    }

    public getCommandEntry(name: string){
        return interactiveCommandsRegistry.get(name);
    }

    /**
     * @param builder component builder to register
     * @param module module that created this component
     */
    public registerComponent(builder: SynergyComponentBuilder, module: Module){
        if(interactiveComponentsRegistry.has(builder.customId)){
            throw new Error("Component with this name already exists.");
        }
        interactiveComponentsRegistry.set(builder.customId, {
            customId: builder.customId,
            module,
            builder
        });
    }

    public registerTempComponent(builder: SynergyComponentBuilder, module: Module, maxInteracts: number = -1, lifeTime: number = -1){
        let id = crypto.randomUUID().toLowerCase();
        while(interactiveComponentsRegistry.has(id)){
            id = crypto.randomUUID().toLowerCase();
        }

        builder.setCustomId(id);
        interactiveComponentsRegistry.set(builder.customId, {
            customId: id,
            module,
            builder
        });
        temporaryComponents.set(id, {
            id,
            component: builder,
            isTemporary: true,
            interactionsLimit: maxInteracts,
            interactions: 0,
            lifeTime,
            createdTime: new Date()
        });
    }

    public getTempInfo(id: string){
        return temporaryComponents.get(id);
    }

    public getComponent(customId: string){
        return interactiveComponentsRegistry.get(customId);
    }

    public async overwriteDiscordCommands(){
        if(!this.bot.client.isReady()) return;
        let commands = Array.from(interactiveCommandsRegistry.values());
        if(commands.length === 0) return;

        let cmd_guilds: Map<string, Discord.RESTPostAPIApplicationCommandsJSONBody[]> = new Map();
        let cmd_global: Discord.RESTPostAPIApplicationCommandsJSONBody[] = [];

        for(let c of commands){
            let slashBuilder: Discord.SlashCommandBuilder;

            if(c.builder.isDiscordSlash()) {
                slashBuilder = c.builder.slashBuilder!;
            } else {
                slashBuilder = new Discord.SlashCommandBuilder()
                    .setName(c.builder.name)
                    .setDescription(c.builder.description);

                for(let p of c.builder.options) {
                    if(p.isInteger()) {
                        let int_param = p;
                        slashBuilder.addIntegerOption(opt => {
                            opt
                                .setName(int_param.name)
                                .setDescription(int_param.description)
                                .setRequired(int_param.required);

                            if(int_param.min) {
                                opt.setMinValue(int_param.min);
                            }
                            if(int_param.max) {
                                opt.setMaxValue(int_param.max);
                            }

                            return opt;
                        });
                    }
                    if(p.isNumber()) {
                        let num_param = p;
                        slashBuilder.addNumberOption(opt => {
                            opt
                                .setName(num_param.name)
                                .setDescription(num_param.description)
                                .setRequired(num_param.required);

                            if(num_param.min) {
                                opt.setMinValue(num_param.min);
                            }
                            if(num_param.max) {
                                opt.setMaxValue(num_param.max);
                            }

                            return opt;
                        });
                    }
                    if(p.isString()) {
                        let str_param = p;
                        slashBuilder.addStringOption(opt => {
                            opt
                                .setName(str_param.name)
                                .setDescription(str_param.description)
                                .setRequired(str_param.required);

                            if(str_param.minLength) {
                                opt.setMinLength(str_param.minLength);
                            }
                            if(str_param.maxLength) {
                                opt.setMaxLength(str_param.maxLength);
                            }

                            return opt;
                        });
                    }
                    if(p.isUser()) {
                        let usr_param = p;
                        slashBuilder.addUserOption(opt => {
                            opt
                                .setName(usr_param.name)
                                .setDescription(usr_param.description)
                                .setRequired(usr_param.required);
                            return opt;
                        });
                    }
                }
            }
            try {
                if(c.forGuild){
                    let cmds = cmd_guilds.get(c.forGuild) || [];
                    cmds.push(slashBuilder.toJSON());
                    cmd_guilds.set(c.forGuild, cmds);
                }else{
                    cmd_global.push(slashBuilder.toJSON());
                }
                if(c.builder.isDiscordSlash()) {
                    c.builder.isUpdated = true;
                    c.builder.isPushed = true;
                }
            } catch (error) {
                GlobalLogger.root.error("Error serializing interactive command builder:", error, c);
            }
        }

        for(let cg of cmd_guilds.entries()){
            await this.bot.rest.put(Discord.Routes.applicationGuildCommands(this.bot.client.application!.id, cg[0]), { body: cg[1] })
                .catch(err => GlobalLogger.root.error("Error Overwriting Guild Commands:", err));
        }

        if(cmd_global.length !== 0){
            await this.bot.rest.put(Discord.Routes.applicationCommands(this.bot.client.application!.id), { body: cmd_global })
                .catch(err => GlobalLogger.root.error("Error Overwriting Global Commands:", err));
        }
    }

    /**
     * Upload all commands to discord servers. Probably you can use this, but it's useless cuz manager execute this periodically by itself
     */
    public async updateInteractiveCommands(){
        if(!this.bot.client.isReady()) return;
        let cmds = Array.from(interactiveCommandsRegistry.values()).filter(c => c.builder.isDiscordSlash() && !c.builder.isUpdated);
        if(cmds.length === 0) return;

        for(let c of cmds){
            GlobalLogger.root.info(`Uploading ${c.name} command...`);
            let payload: RequestData;
            try {
                payload = { body: c.builder.slashBuilder!.toJSON() };
            } catch (error) {
                GlobalLogger.root.error("Error serializing interactive command builder:", error, c);
                continue;
            }

            let endpoint = c.forGuild
                            ? Discord.Routes.applicationGuildCommands(this.bot.client.application!.id, c.forGuild)
                            : Discord.Routes.applicationCommands(this.bot.client.application!.id);

            try {
                if(c.builder.isDiscordSlash()) {
                    if(c.builder.isPushed){
                        await this.bot.rest.patch(endpoint, payload);
                    }else{
                        await this.bot.rest.post(endpoint, payload);
                        c.builder.isPushed = true;
                    }
                    c.builder.isUpdated = true;
                }
            } catch (error) {
                GlobalLogger.root.error("Error Uploading Guild Command:", error, c);
            }
        }
    }

    private async onDiscordInteractionCreate(interaction: Discord.Interaction): Promise<void> {
        let userId = this.bot.users.unifiedIdFromDiscordId(interaction.user.id);
        let user;
        if (userId) {
            user = await this.bot.users.get(userId);
        }
        if (!user) {
            user = await this.bot.users.createFromDiscord(interaction.user);
        }

        if(interaction.isAutocomplete()) {
            let cmd = Array.from(interactiveCommandsRegistry.values()).find(c => c.name === interaction.commandName);
            if (!cmd) {
                GlobalLogger.root.warn(`Received "${interaction.commandName}" autocomplete command but InteractiveCommand not found.`);
                return;
            }
            try {
                if(cmd.builder.isDiscordSlash()) {
                    await cmd.builder._autocomplete(interaction, user);
                }
            } catch (error) {
                GlobalLogger.root.error(`Error autocompleting "${interaction.commandName}":`, error);
            }
            return;
        }

        if(interaction.isMessageComponent()){
            let synergyInteraction = new SynergyDiscordComponentInteraction(this.bot, {
                discordInteraction: interaction,
                user,
                customId: interaction.customId
            });

            await this.interactionProcessingPipeline(synergyInteraction);
            return;
        }

        if(interaction.isCommand()) {
            let synergyInteraction = new SynergyDiscordCommandInteraction(this.bot, {
                discordInteraction: interaction,
                user,
                name: interaction.commandName
            });

            await this.interactionProcessingPipeline(synergyInteraction);
            return;
        }

        GlobalLogger.root.info(`[InteractionsManager] Interaction type "${interaction.type}" is not implemented, skipping.`);
        return;
    }

    private async interactionProcessingPipeline(interaction: SynergyInteraction): Promise<void> {
        if(!this.bot.isReady){
            GlobalLogger.root.warn(`Interaction received (id=${interaction.id}) but BOT is not ready yet. Interaction will not be processed.`);
            return;
        }

        let executionTarget: SynergySlashCommandBuilder | SynergyComponentBuilder | undefined = undefined;

        if(interaction.isCommand()) {
            let cmd = Array.from(interactiveCommandsRegistry.values()).find(c => c.name === interaction.name);
            if(!cmd){
                GlobalLogger.root.warn(`Fired "${interaction.name}" command but InteractiveCommand not found.`);
                return;
            }
            executionTarget = cmd.builder;
        }

        if(interaction.isComponent()) {
            let cmp = Array.from(interactiveComponentsRegistry.values()).find(c => c.customId === interaction.customId);
            if(!cmp){
                return;
            }
            executionTarget = cmp.builder;
        }

        if(!executionTarget) {
            GlobalLogger.root.warn(`Interaction with id="${interaction.id}" has no available execution target.`);
            return;
        }

        let access_flag = false;

        for(let a of executionTarget.access){
            if(interaction.user.groups.includes("banned")){
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
                if(interaction.user.groups.includes(res[1])){
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
                if(interaction.user.unifiedId === res[1] || interaction.user.discord?.id === res[1]){
                    access_flag = true;
                    break;
                }
            }
            if(a.startsWith("role")){
                if(interaction.isDiscord() && interaction.discordInteraction.inGuild()) {
                    let res = /role<(.*)>/.exec(a);
                    if(!res || !res[1]){
                        GlobalLogger.root.warn("InteractionsManager.InteractionProcessing: Passed invalid role access target \"", a + "\"");
                        continue;
                    }
                    if(interaction.discordInteraction.member.roles instanceof Discord.GuildMemberRoleManager){
                        if(interaction.discordInteraction.member.roles.cache.has(res[1])){
                            access_flag = true;
                            break;
                        }
                    }else{
                        if(interaction.discordInteraction.member.roles.includes(res[1])){
                            access_flag = true;
                            break;
                        }
                    }
                }
            }
            if(a.startsWith("perm")){
                if(interaction.isDiscord() && interaction.discordInteraction.inGuild()) {
                    let res = /perm<(.*)>/.exec(a);
                    if (!res || !res[1]) {
                        GlobalLogger.root.warn("InteractionsManager.InteractionProcessing: Passed invalid perm access target \"", a + "\"");
                        continue;
                    }
                    if (interaction.discordInteraction.member.permissions instanceof Discord.PermissionsBitField) {
                        if (interaction.discordInteraction.member.permissions.has(res[1] as Discord.PermissionResolvable)) {
                            access_flag = true;
                            break;
                        }
                    }
                }
            }
            if(a.startsWith("server_mod")){
                if(interaction.isDiscord() && interaction.discordInteraction.inGuild()) {
                    if (interaction.discordInteraction.guild && interaction.discordInteraction.member instanceof Discord.GuildMember) {
                        let configEntry = this.bot.config.getConfigEntry("guild", "moderator_role");
                        if (!configEntry || !(configEntry.entry.isCommon() || configEntry.entry.isEphemeral())) {
                            GlobalLogger.root.warn("InteractionsManager", "onInteractionCreate server_mod check wrong ConfigEntry type.");
                            continue;
                        }
                        if (configEntry.entry.isArray() || !configEntry.entry.isRole()) {
                            GlobalLogger.root.warn("InteractionsManager", "onInteractionCreate server_mod check wrong ConfigEntry type.");
                            continue;
                        }

                        let mod_role = configEntry.entry.getValue(interaction.discordInteraction.guild.id);

                        if (!mod_role) {
                            await interaction.reply({
                                embeds: [Utils.ErrMsg("You need Moderator Role to do this. Configure them with command `/config guild set field:moderator_role value_role:@Role`")],
                                ephemeral: true
                            });
                            return;
                        }
                        if (interaction.discordInteraction.member.roles.cache.has(mod_role.id)) {
                            access_flag = true;
                            break;
                        }
                    }
                }
            }
            if(a.startsWith("server_admin")){
                if(interaction.isDiscord() && interaction.discordInteraction.inGuild()) {
                    if (interaction.discordInteraction.member && interaction.discordInteraction.member.permissions instanceof Discord.PermissionsBitField) {
                        if (interaction.discordInteraction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
                            access_flag = true;
                            break;
                        }
                    }
                }
            }
            if(a.startsWith("admin")){
                if(interaction.user.groups.includes("admin")){
                    access_flag = true;
                    break;
                }
            }
        }
        
        if(!access_flag){
            await interaction.reply({ embeds: [
                new Discord.EmbedBuilder()
                .setTitle("You don't have access to do this!")
                .setDescription("To do this you need following access targets:\n`" + executionTarget.access.join("`\n`") + "`")
                .setColor(Colors.Error)
            ], extras: { ephemeral: true } });
            return;
        }else{
            try {
                if(executionTarget instanceof SynergyComponentBuilder) {
                    if(temporaryComponents.has(executionTarget.customId)){
                        let cmp = temporaryComponents.get(executionTarget.customId) as ITemporaryComponentInfo;
                        cmp.interactions++;
                        if((cmp.interactionsLimit !== -1 && cmp.interactions > cmp.interactionsLimit) ||
                            (cmp.lifeTime !== -1 && new Date().getTime() - cmp.createdTime.getTime() > cmp.lifeTime)){

                            interactiveComponentsRegistry.delete(cmp.id);
                            temporaryComponents.delete(cmp.id);
                            throw new SynergyUserError("This interactive component is no longer available. Try to re-run command that created this component.");
                        }
                    }
                    await executionTarget._exec(interaction as SynergyComponentInteraction); //Yea this is dirty hack, but.... I waste too much time to make it work..
                }
            } catch (err) {
                let embed = new Discord.EmbedBuilder();
                if(err instanceof SynergyUserError){
                    embed.setTitle(Emojis.RedErrorCross + err.message);
                    embed.setDescription(err.subMessage ? err.subMessage : null);
                    embed.setColor(Colors.Error);
                }else{
                    let trace = GlobalLogger.Trace(interaction, executionTarget, err);
                    GlobalLogger.root.error("InteractionsManager.InteractionProcessing.TargetCallbackError: ", err, `TraceID: ${trace}`);

                    embed.setTitle(Emojis.RedErrorCross + "Unexpected Error occurred.");
                    embed.setDescription(`Please contact BOT tech support with following Trace Code: \`\`\`${trace}\`\`\``);
                    embed.setColor(Colors.Error);
                }

                try{
                    if(interaction.isDiscord()) {
                        if(interaction.discordInteraction.replied || interaction.discordInteraction.deferred){
                            await interaction.discordInteraction.editReply({ embeds: [embed] });
                            return;
                        }
                    }
                    await interaction.reply({ embeds: [embed], extras: { ephemeral: true } });
                }catch{
                    GlobalLogger.root.warn("InteractionsManager.InteractionProcessing.TargetCallbackError.ErrReply: Can't reply.");
                    return;
                }
            }
        }
    }
}