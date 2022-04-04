import Discord from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GlobalLogger } from "./GlobalLogger";
import RainbowBOT from "./RainbowBOT";
import crypto from "crypto";
import { Routes } from "discord-api-types/rest/v9";
import { Colors, Emojis, Module, User, Utils } from ".";
import { AccessTarget } from "./Structures/Access";
import { RainbowBOTUserError } from "./Structures/Errors";

export type ButtonInteractionCallback = (interaction: Discord.ButtonInteraction) => Promise<void>;
export type CommandInteractionCallback = (interaction: Discord.CommandInteraction, user: User) => Promise<void>;

const interactiveButtonsRegistry: Map<string, InteractiveButton> = new Map;
const interactiveCommandsRegistry: Map<string, InteractiveCommand> = new Map;

export class InteractiveButton extends Discord.MessageButton {
    private clickCallback?: ButtonInteractionCallback;
    public lastInteraction?: Discord.ButtonInteraction;

    constructor(readonly uuid: string){
        super();
        this.setCustomId(uuid);
    }

    public onClick(callback: ButtonInteractionCallback){
        this.clickCallback = callback;
        return this;
    }

    public destroy(){
        interactiveButtonsRegistry.delete(this.uuid);
    }

    public async _clicked(interaction: Discord.ButtonInteraction){
        this.lastInteraction = interaction;
        if(this.clickCallback){
            await this.clickCallback(interaction);
        }
    }
}

export class InteractiveCommand extends SlashCommandBuilder{
    public isUpdated: boolean = true;
    public isPushed: boolean = false;
    private execCallback?: CommandInteractionCallback;
    public lastInteraction?: Discord.CommandInteraction;

    constructor(name: string, public access: AccessTarget[], public module: Module, readonly forGuildId?: string){
        super();
        this.setName(name);
    }

    public onExecute(callback: CommandInteractionCallback){
        this.execCallback = callback;
        return this;
    }

    public async _exec(interaction: Discord.CommandInteraction, user: User){
        this.lastInteraction = interaction;
        if(this.execCallback){
            await this.execCallback(interaction, user);
        }
    }

    public commit(){
        this.isUpdated = false;
        return this;
    }
}

export default class InteractionsManager{
    private updateTimer: NodeJS.Timeout;
    
    constructor(public bot: RainbowBOT) {
        this.updateTimer = setInterval(this.updateSlashCommands.bind(this), 10000);
        this.bot.client.on("interactionCreate", this.onInteractionCreate.bind(this));
        this.bot.events.once("Stop", () => { clearInterval(this.updateTimer); });
    }

    public createCommand(name: string, access: AccessTarget[], module: Module, forGuildId?: string){
        if(interactiveCommandsRegistry.has(name)){
            throw new Error("This command already exists.");
        }
        let cmd = new InteractiveCommand(name, access, module, forGuildId);
        interactiveCommandsRegistry.set(name, cmd);
        return cmd;
    }

    public getCommand(name: string){
        return interactiveCommandsRegistry.get(name);
    }

    public createButton(){
        let button = new InteractiveButton(crypto.randomUUID() + "-rbc-ibtn");
        interactiveButtonsRegistry.set(button.uuid, button);
        return button;
    }

    public removeButton(btn: InteractiveButton){
        interactiveButtonsRegistry.delete(btn.uuid);
    }

    public getButton(uuid: string){
        return interactiveButtonsRegistry.get(uuid);
    }

    public async updateSlashCommands(){
        if(!this.bot.client.isReady()) return;
        let cmds = Array.from(interactiveCommandsRegistry.values()).filter(c => !c.isUpdated);
        if(cmds.length === 0) return;

        for(let c of cmds){
            if(c.forGuildId){
                if(c.isPushed){
                    await this.bot.rest.patch(
                        Routes.applicationGuildCommands(this.bot.client.application!.id, c.forGuildId),
                        { body: c.toJSON() },
                    ).catch(err => GlobalLogger.root.error("Error Updating Guild Slash Command:", err));
                    c.isUpdated = true;
                    return;
                }else{
                    await this.bot.rest.post(
                        Routes.applicationGuildCommands(this.bot.client.application!.id, c.forGuildId),
                        { body: c.toJSON() },
                    ).catch(err => GlobalLogger.root.error("Error Pushing Guild Slash Command:", err));
                    c.isUpdated = true;
                    c.isPushed = true;
                    return;
                }
            }else{
                if(c.isPushed){
                    await this.bot.rest.patch(
                        Routes.applicationCommands(this.bot.client.application!.id),
                        { body: c.toJSON() },
                    ).catch(err => GlobalLogger.root.error("Error Updating Global Slash Command:", err));
                    c.isUpdated = true;
                    return;
                }else{
                    await this.bot.rest.post(
                        Routes.applicationCommands(this.bot.client.application!.id),
                        { body: c.toJSON() },
                    ).catch(err => GlobalLogger.root.error("Error Pushing Global Slash Command:", err));
                    c.isUpdated = true;
                    c.isPushed = true;
                    return;
                }
            }
        }
    }

    private async onInteractionCreate(interaction: Discord.Interaction){
        if(interaction.isCommand()){
            let cmd = Array.from(interactiveCommandsRegistry.values()).find(c => c.name === interaction.commandName);
            if(!cmd){
                GlobalLogger.root.warn(`Fired "${interaction.commandName}" command but InteractiveCommand not found.`);
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

            for(let a of cmd.access){
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
                        GlobalLogger.root.warn("InteractionsManager.CommandInteractionProcessing: Passed invalid group access target \"", a + "\"");
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
                        GlobalLogger.root.warn("InteractionsManager.CommandInteractionProcessing: Passed invalid user access target \"", a + "\"");
                        continue;
                    }
                    if(user.id.toString() === res[1] || user.discord.id === res[1]){
                        access_flag = true;
                        break;
                    }
                }
                if(a.startsWith("perm")){
                    let res = /perm<(.*)>/.exec(a);
                    if(!res || !res[1]){
                        GlobalLogger.root.warn("InteractionsManager.CommandInteractionProcessing: Passed invalid perm access target \"", a + "\"");
                        continue;
                    }
                    if(interaction.member && interaction.member.permissions instanceof Discord.Permissions){
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
                            return await interaction.reply({ embeds: [ Utils.ErrMsg("This command requires Moderator Role. Configure them with command `/config guild set field:moderator_role value_role:@Role`") ] });
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
                    .setTitle("You don't have access to this command!")
                    .setDescription("This command requires following access targets:\n`" + cmd.access.join("`\n`") + "`")
                    .setColor(Colors.Error)
                ] });
            }else{
                return await cmd._exec(interaction, user).catch(async err => {
                    let embed = new Discord.MessageEmbed();
                    if(err instanceof RainbowBOTUserError){
                        embed.title = Emojis.RedErrorCross + err.message;
                        embed.description = err.subMessage ? err.subMessage : null;
                        embed.color = Colors.Error;
                    }else{
                        let trace = GlobalLogger.Trace(interaction, cmd, user, err);
                        GlobalLogger.root.error("InteractionsManager.CommandInteractionProcessing.CommandCallbackError: ", err, `TraceID: ${trace}`);

                        embed.title = Emojis.RedErrorCross + "Unexpected Error occurred.";
                        embed.description = `Please contact BOT tech support with following Trace Code: \`\`\`${trace}\`\`\``;
                        embed.color = Colors.Error;
                    }

                    if(interaction.replied || interaction.deferred){
                        await interaction.editReply({ embeds: [embed] });
                    }else{
                        await interaction.reply({ embeds: [embed] });
                    }
                });
            }
        }

        if(interaction.isButton()){
            for(let btn of interactiveButtonsRegistry.entries()){
                if(interaction.customId === btn[0]){
                    return await btn[1]._clicked(interaction).catch(err => GlobalLogger.root.error("Button Callback Error:", err));
                }
            }
            if(!interaction.replied && !interaction.deferred){
                await interaction.reply({ ephemeral: true, embeds: [ Utils.ErrMsg("This button is no longer available!") ] });
            }
            return;
        }
    }
}