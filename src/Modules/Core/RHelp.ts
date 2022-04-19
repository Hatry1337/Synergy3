import Discord from "discord.js";

import { Emojis, Colors } from "../../Utils";
import Module from "../Module";
import { RainbowBOT } from "../..";
import Access from "../../Structures/Access";

export default class RHelp extends Module{
    public Name:        string = "RHelp";
    public Description: string = "Using this command users can explore bot's commands, and find out how to use them.";
    public Category:    string = "Info";
    public Author:      string = "Thomasss#9258";

    public Access: string[] = [ Access.PLAYER(), Access.BANNED() ]

    constructor(bot: RainbowBOT, UUID: string) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createSlashCommand(this.Name.toLowerCase(), this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder
                .setDescription(this.Description)
                .addIntegerOption(opt => opt
                    .setName("page")
                    .setDescription("RHelp command page.")
                    .setRequired(false)
                )
                .addStringOption(opt => opt
                    .setName("category")
                    .setDescription("RHelp commands category.")
                    .setRequired(false)
                )
            )
            .onExecute(this.Run.bind(this))
            .commit(),
        );
    }

    public Run(interaction: Discord.CommandInteraction){
        return new Promise<void>(async (resolve, reject) => {
            let page = interaction.options.getInteger("page") || 1;
            let cat = interaction.options.getString("category");

            let modulesInfo = this.bot.modules.GetModuleCommonInfo();

            if(cat){
                modulesInfo = modulesInfo.filter(md => md.category === cat);
            }

            var max_page = Math.ceil(modulesInfo.length / 25);
            if(page > 0 && page <= max_page){
                var embd = new Discord.MessageEmbed({
                    title: `RainbowBOT's Modules \`${page}/${max_page}\``,
                    description: "You can watch detailed usage of module by `!usage <module>`",
                    color: Colors.Noraml
                });
                var page_start = ((page-1) * 25);
                var page_end = page_start + 25;


                if(modulesInfo.length < page_end){
                    page_end = modulesInfo.length;
                }
                for(var i = page_start; i < page_end; i++){
                    let md = modulesInfo[i];
                    embd.addField(  `${md.name}`, md.description + `\n\n` + 
                                    `Commands: \`/${md.commands.join("`, `/")}\`\n` + 
                                    `Category: \`${md.category}\`\n` +
                                    `Access: \`${md.access.join("`, `")}\`\n` +
                                    `Author: \`${md.author}\``, true);
                }
    
                return resolve(await interaction.reply({ embeds: [embd] }).catch(reject));

            }else{
                var embd = new Discord.MessageEmbed({
                    title: `${Emojis.RedErrorCross} This page doesen't exist.`,
                    color: Colors.Error
                });
                return resolve(await interaction.reply({ embeds: [embd] }).catch(reject));
            }
        });
    }
}