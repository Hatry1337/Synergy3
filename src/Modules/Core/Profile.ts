import Discord from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { Colors, Utils } from "../../Utils";
import ModuleManager from "../../ModuleManager";
import Module from "../Module";
import User from "../../Structures/User";

export default class Profile extends Module{
    public Name:        string = "Profile";
    public Usage:       string = "`!profile [user]`\n\n" +
                          "**Example:**\n" +
                          "`/profile` - show your profile\n\n" +
                          "`/profile @User` - show User's profile\n\n";

    public Description: string = "Using this command you can view your, or someone's profile.";
    public Category:    string = "Info";
    public Author:      string = "Thomasss#9258";

    constructor(Controller: ModuleManager, UUID: string) {
        super(Controller, UUID);
        this.SlashCommands.push(
            new SlashCommandBuilder()
                .setName(this.Name.toLowerCase())
                .setDescription(this.Description)
                .addUserOption(opt => opt
                    .setName("target_user")
                    .setDescription("User who's profile you want to view.")
                    .setRequired(false)
                ) as SlashCommandBuilder
        );
    }
    
    public async Init(){
        this.Controller.bot.PushSlashCommands(this.SlashCommands, this.Controller.bot.moduleGlobalLoading ? "global" : this.Controller.bot.masterGuildId);
    }
    
    public Test(interaction: Discord.CommandInteraction){
        return interaction.commandName.toLowerCase() === this.Name.toLowerCase();
    }
    
    private createMessageTemplate(user: User){
        let embd = new Discord.MessageEmbed({
            title: `${user.nickname}'s profile`,
            thumbnail: user.discord?.avatar ? { url: `https://cdn.discordapp.com/avatars/${user.discord.id}/${user.discord.avatar}.png` } : undefined,
            fields: [
                { name: "Info", value:  `ID: ${user.id}\n` +
                                        `Group: ${user.group}\n` +
                                        `Language: ${user.lang}` },

                user.discord ? { name: "Discord", value:`DiscordID: ${user.discord.id}\n` +
                                                        `Tag: ${user.discord.tag}\n` +
                                                        `Registered: ${Utils.ts(user.discord.createdAt)}` } : { name: "Discord", value: "wtf u don't have discord O_o" },
                
                { name: "Economy", value:   `Points: ${user.economy.points}\n` +
                                            `LVL: ${user.economy.lvl}\n` +
                                            `XP: ${user.economy.xp}` },
                ],
            color: Colors.Noraml
        });
        return embd;
    }

    public Run(interaction: Discord.CommandInteraction, user: User){
        return new Promise<Discord.Message | void>(async (resolve, reject) => {
            let target_user = interaction.options.getUser("target_user");
            if(!target_user){
                return resolve(await interaction.reply({ embeds: [this.createMessageTemplate(user)] }).catch(reject));
            }else{
                if(target_user.bot){
                    return resolve(await interaction.reply({ embeds: [ Utils.ErrMsg("You can't view BOT's profile.") ] }).catch(reject));
                }

                let target_id = this.Controller.bot.users.idFromDiscordId(target_user.id);
                let target: User | null = null;
                if(target_id){
                    target = await this.Controller.bot.users.fetchOne(target_id);
                }
                if(!target){
                    target = await this.Controller.bot.users.createFromDiscord(target_user);
                }
                return resolve(await interaction.reply({ embeds: [this.createMessageTemplate(target)] }).catch(reject));
            }
        });
    }
}