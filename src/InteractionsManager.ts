import User from "./Structures/User";
import Module from "./Modules/Module";
import Synergy from "./Synergy";
import Discord from "discord.js";
import { Colors, Emojis, Utils } from "./Utils";
import { Routes } from "discord-api-types/rest/v9";
import { GlobalLogger } from "./GlobalLogger";
import { AccessTarget } from "./Structures/Access";
import { SynergyUserError } from "./Structures/Errors";
import { InteractiveCommand } from "./Interactions/InteractiveCommand";
import { InteractiveComponent } from "./Interactions/InteractiveComponent";
import { ContextMenuCommandBuilder, SlashCommandBuilder } from "@discordjs/builders";
import { InteractiveCommandTargets, InteractiveComponentTargets } from "./Interactions/InteractionTypes";

const interactiveComponentsRegistry: Map<string, InteractiveComponent<InteractiveComponentTargets>> = new Map;
const interactiveCommandsRegistry: Map<string, InteractiveCommand<InteractiveCommandTargets>> = new Map;

export default class InteractionsManager{
    private updateTimer: NodeJS.Timeout;
    
    constructor(public bot: Synergy) {
        this.updateTimer = setInterval(this.updateInteractiveCommands.bind(this), 10000);
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
        return this.createCommand<SlashCommandBuilder>(name, access, module, SlashCommandBuilder, forGuildId);
    }

    /**
     * @param name command name
     * @param access access targets that allowed to use this command
     * @param module module that is created this command
     * @param forGuildId guild id where to upload this command. Leave empty to global upload
     */
    public createMenuCommand(name: string, access: AccessTarget[], module: Module, forGuildId?: string){
        return this.createCommand<ContextMenuCommandBuilder>(name, access, module, ContextMenuCommandBuilder, forGuildId);
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

    public createButton(name: string, access: AccessTarget[], module: Module){
        return this.createComponent<Discord.MessageButton>(name, access, module, Discord.MessageButton);
    }

    public createSelectMenu(name: string, access: AccessTarget[], module: Module){
        return this.createComponent<Discord.MessageSelectMenu>(name, access, module, Discord.MessageSelectMenu);
    }

    public getComponent(name: string){
        return interactiveComponentsRegistry.get(name);
    }

    public async overwriteInteractiveCommands(){
        if(!this.bot.client.isReady()) return;
        let cmds = Array.from(interactiveCommandsRegistry.values()).filter(c => !c.isUpdated);
        if(cmds.length === 0) return;

        let cmd_guilds: Map<string, any[]> = new Map();
        let cmd_global: any[] = [];

        for(let c of cmds){
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
            if(c.forGuildId){
                if(c.isPushed){
                    await this.bot.rest.patch(
                        Routes.applicationGuildCommands(this.bot.client.application!.id, c.forGuildId),
                        { body: c.builder.toJSON() },
                    ).catch(err => GlobalLogger.root.error("Error Updating Guild Command:", err));
                    c.isUpdated = true;
                    return;
                }else{
                    await this.bot.rest.post(
                        Routes.applicationGuildCommands(this.bot.client.application!.id, c.forGuildId),
                        { body: c.builder.toJSON() },
                    ).catch(err => GlobalLogger.root.error("Error Pushing Guild Command:", err));
                    c.isUpdated = true;
                    c.isPushed = true;
                    return;
                }
            }else{
                if(c.isPushed){
                    await this.bot.rest.patch(
                        Routes.applicationCommands(this.bot.client.application!.id),
                        { body: c.builder.toJSON() },
                    ).catch(err => GlobalLogger.root.error("Error Updating Global Command:", err));
                    c.isUpdated = true;
                    return;
                }else{
                    await this.bot.rest.post(
                        Routes.applicationCommands(this.bot.client.application!.id),
                        { body: c.builder.toJSON() },
                    ).catch(err => GlobalLogger.root.error("Error Pushing Global Command:", err));
                    c.isUpdated = true;
                    c.isPushed = true;
                    return;
                }
            }
        }
    }

    private async onInteractionCreate(interaction: Discord.Interaction){
        let target;
        if(interaction.isAutocomplete()){
            let cmd = Array.from(interactiveCommandsRegistry.values()).find(c => c.name === interaction.commandName);
            if(!cmd){
                GlobalLogger.root.warn(`Fired "${interaction.commandName}" autocomplete but InteractiveCommand not found.`);
                return;
            }
            try {
                await cmd._autocomplete(interaction);
            } catch (error) {
                GlobalLogger.root.error(`Error autocompleteing "${interaction.commandName}":`, error);
            }
            return;
        }else if(interaction.isApplicationCommand()){
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

        let user_id = this.bot.users.idFromDiscordId(interaction.user.id);
        let user: User | null = null;
        if(user_id){
            user = await this.bot.users.fetchOne(user_id);
        }
        if(!user){
            user = await this.bot.users.createFromDiscord(interaction.user);
        }

        let access_flag = false;

        for(let a of target.access){
            if(user.groups.includes("banned")){
                if(a.startsWith("banned")){
                    access_flag = true;
                }else{
                    access_flag = false;
                }
                break;
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
                if(interaction.member.permissions instanceof Discord.Permissions){
                    if(interaction.member.permissions.has(res[1] as Discord.PermissionResolvable)){
                        access_flag = true;
                        break;
                    }
                }
            }
            if(a.startsWith("server_mod")){
                if(interaction.guild && interaction.member instanceof Discord.GuildMember){
                    let mod_role_id = (await this.bot.config.get("guild", "moderator_role"))[interaction.guild.id] as string | undefined;
                    if(!mod_role_id){
                        return await interaction.reply({ embeds: [ Utils.ErrMsg("You need Moderator Role to do this. Configure them with command `/config guild set field:moderator_role value_role:@Role`") ], ephemeral: true });
                    }
                    if(interaction.member.roles.cache.has(mod_role_id)){
                        access_flag = true;
                        break;
                    }
                }
            }
            if(a.startsWith("server_admin")){
                if(interaction.member && interaction.member.permissions instanceof Discord.Permissions){
                    if(interaction.member.permissions.has("ADMINISTRATOR")){
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
            return await interaction.reply({ embeds: [ 
                new Discord.MessageEmbed()
                .setTitle("You don't have access to do this!")
                .setDescription("To do this you need following access targets:\n`" + target.access.join("`\n`") + "`")
                .setColor(Colors.Error)
            ], ephemeral: true });
        }else{
            try {
                await target._exec(interaction as any, user); //Yea this is dirty hack, but.... I waste too much time to make it work..
            } catch (err) {
                let embed = new Discord.MessageEmbed();
                if(err instanceof SynergyUserError){
                    embed.title = Emojis.RedErrorCross + err.message;
                    embed.description = err.subMessage ? err.subMessage : null;
                    embed.color = Colors.Error;
                }else{
                    let trace = GlobalLogger.Trace(interaction, target, user, err);
                    GlobalLogger.root.error("InteractionsManager.InteractionProcessing.TargetCallbackError: ", err, `TraceID: ${trace}`);

                    embed.title = Emojis.RedErrorCross + "Unexpected Error occurred.";
                    embed.description = `Please contact BOT tech support with following Trace Code: \`\`\`${trace}\`\`\``;
                    embed.color = Colors.Error;
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