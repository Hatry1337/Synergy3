import Discord from "discord.js";
import { Emojis, Colors } from "../../Utils";
import Module from "../Module";
import { Synergy, SynergyUserError } from "../..";
import Access, { AccessTarget } from "../../Structures/Access";

export default class Avatar extends Module{
    public Name:        string = "Avatar";
    public Description: string = "Using this command you can view your, or someone's avatar as full size image.";
    public Category:    string = "Utility";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER(), Access.BANNED() ]

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createSlashCommand(this.Name.toLowerCase(), this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder
                .setDescription(this.Description)
                .addUserOption(opt => opt
                    .setName("target_user")
                    .setDescription("User who's avatar you want to view.")
                    .setRequired(false)
                )
            )
            .onExecute(this.Run.bind(this))
            .commit()
        );
    }

    public async Run(interaction: Discord.CommandInteraction){
        let user = interaction.options.getUser("target_user");
        if(!user){
            user = interaction.user;
        }

        let avatar = user.avatarURL({ size: 2048 });

        if(!avatar){
            throw new SynergyUserError("Cannot get user's avatar!")
        }

        await interaction.reply({
            content: `${user.username}'s avatar`,
            files: [ avatar ]
        });
    }
}