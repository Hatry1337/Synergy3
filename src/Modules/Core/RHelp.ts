import Discord from "discord.js";

import { Colors } from "../../Utils";
import Module from "../Module";
import { Synergy, SynergyUserError } from "../..";
import Access, { AccessTarget } from "../../Structures/Access";

export default class RHelp extends Module{
    public Name:        string = "RHelp";
    public Description: string = "Using this command users can explore bot's commands, and find out how to use them.";
    public Category:    string = "Info";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER(), Access.BANNED() ]

    constructor(bot: Synergy, UUID: string) {
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

    public async Run(interaction: Discord.ChatInputCommandInteraction){
        let page = interaction.options.getInteger("page") || 1;
        let cat = interaction.options.getString("category");

        let modulesInfo = this.bot.modules.GetModuleCommonInfo();

        if(cat){
            modulesInfo = modulesInfo.filter(md => md.category === cat);
        }

        let max_page = Math.ceil(modulesInfo.length / 25);
        if(page > 0 && page <= max_page){
            let embd = new Discord.EmbedBuilder({
                title: `${this.bot.client.user?.username || "Synergy"}'s Modules \`${page}/${max_page}\``,
                description: "You can watch detailed usage of module by `!usage <module>`",
                color: Colors.Noraml
            });
            let page_start = ((page-1) * 25);
            let page_end = page_start + 25;


            if(modulesInfo.length < page_end){
                page_end = modulesInfo.length;
            }
            for(let i = page_start; i < page_end; i++){
                let md = modulesInfo[i];
                embd.addFields([
                    {
                        name: md.name,
                        value:  md.description + `\n\n` +
                                ((md.commands.length === 0) ? "" : `Commands: \`/${md.commands.join("`, `/")}\`\n`) +
                                `Category: \`${md.category}\`\n` +
                                `Access: \`${md.access.join("`, `")}\`\n` +
                                `Author: \`${md.author}\``,
                        inline: true
                    }
                ]);
            }

            await interaction.reply({ embeds: [embd] });
            return;
        }else{
            throw new SynergyUserError("This page doesen't exist.")
        }
    }
}