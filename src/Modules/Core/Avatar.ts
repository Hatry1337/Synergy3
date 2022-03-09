import Discord from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { Emojis, Colors } from "../../Utils";
import ModuleManager from "../../ModuleManager";
import Module from "../Module";

export default class Avatar extends Module{
    public Name:        string = "Avatar";
    public Usage:       string = "`!avatar [user]`\n\n" +
                          "**Example:**\n" +
                          "`!avatar` - show your avatar\n\n" +
                          "`!avatar @User` - show User's avatar\n\n";

    public Description: string = "Using this command you can view your, or someone's avatar as full size image.";
    public Category:    string = "Utility";
    public Author:      string = "Thomasss#9258";

    constructor(Controller: ModuleManager, UUID: string) {
        super(Controller, UUID);
        this.SlashCommands.push(
            new SlashCommandBuilder()
                .setName(this.Name.toLowerCase())
                .setDescription(this.Description)
                .addUserOption(opt => opt
                    .setName("target_user")
                    .setDescription("User who's avatar you want to view.")
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
    
    public Run(interaction: Discord.CommandInteraction){
        return new Promise<Discord.Message | void>(async (resolve, reject) => {
            let user = interaction.options.getUser("target_user");
            if(!user){
                let avatar = interaction.user.avatarURL({ size: 2048 });
                if(avatar){
                    var embd = new Discord.MessageEmbed({
                        title: `${interaction.user.username}'s avatar`,
                        image: { url: avatar },
                        color: Colors.Noraml
                    });
                    return resolve(await interaction.reply({ embeds: [embd]}).catch(reject));
                }else{
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} Cannot get your avatar!`,
                        color: Colors.Error
                    });
                    return resolve(await interaction.reply({ embeds: [embd] }).catch(reject));
                }                    
            }else{
                var avatar = user.avatarURL({ size: 2048 });

                if(!avatar){
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} Cannot get user's avatar!`,
                        color: Colors.Error
                    });
                    return resolve(await interaction.reply({ embeds: [embd] }).catch(reject));
                }

                var embd = new Discord.MessageEmbed({
                    title: `${user.username}'s avatar`,
                    image: { url: avatar },
                    color: Colors.Noraml
                });
                return resolve(await interaction.reply({ embeds: [embd]}).catch(reject));
            }
        });
    }
}