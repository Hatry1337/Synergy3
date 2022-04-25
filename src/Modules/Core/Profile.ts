import Discord from "discord.js";

import { Colors, Utils } from "../../Utils";
import Module from "../Module";
import User from "../../Structures/User";
import { Synergy } from "../..";
import Access from "../../Structures/Access";

export default class Profile extends Module{
    public Name:        string = "Profile";
    public Description: string = "Using this command you can view your, or someone's profile.";
    public Category:    string = "Info";
    public Author:      string = "Thomasss#9258";

    public Access: string[] = [ Access.PLAYER(), Access.BANNED() ]


    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createSlashCommand(this.Name.toLowerCase(), this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder
                .setDescription(this.Description)
                .addUserOption(opt => opt
                    .setName("target_user")
                    .setDescription("User who's profile you want to view.")
                    .setRequired(false)
                )
            )
            .onExecute(this.Run.bind(this))
            .commit()
        );
    }
    
    private createMessageTemplate(user: User){
        let embd = new Discord.MessageEmbed({
            title: `${user.nickname}'s profile`,
            thumbnail: user.discord?.avatar ? { url: `https://cdn.discordapp.com/avatars/${user.discord.id}/${user.discord.avatar}.png` } : undefined,
            fields: [
                { name: "Info", value:  `ID: ${user.id}\n` +
                                        `Groups: ${user.groups.join(", ")}\n` +
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
        return new Promise<void>(async (resolve, reject) => {
            let target_user = interaction.options.getUser("target_user");
            if(!target_user){
                return resolve(await interaction.reply({ embeds: [this.createMessageTemplate(user)] }).catch(reject));
            }else{
                if(target_user.bot){
                    return resolve(await interaction.reply({ embeds: [ Utils.ErrMsg("You can't view BOT's profile.") ] }).catch(reject));
                }

                let target_id = this.bot.users.idFromDiscordId(target_user.id);
                let target: User | null = null;
                if(target_id){
                    target = await this.bot.users.fetchOne(target_id);
                }
                if(!target){
                    target = await this.bot.users.createFromDiscord(target_user);
                }
                return resolve(await interaction.reply({ embeds: [this.createMessageTemplate(target)] }).catch(reject));
            }
        });
    }
}