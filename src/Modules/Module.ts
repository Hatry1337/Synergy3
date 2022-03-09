import Discord from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import IModule from "./IModule";
import { ModuleLogger } from "../GlobalLogger";
import ModuleManager from "../ModuleManager";
import User from "../Structures/User";

export default class Module implements IModule{
    public Name:           string = "Module";
    public Usage:          string = "This is base module. Don't use it as regular module.";

    public Description:    string = "This is base module. Don't use it as regular command module.";
    public Category:       string = "BOT";
    public Author:         string = "Thomasss#9258";
    public Logger:         ModuleLogger = new ModuleLogger(this);
    public SlashCommands:  SlashCommandBuilder[] = [];
    public InitPriority:   number = 1;

    constructor(public Controller: ModuleManager, protected UUID: string) {
    }
    
    public Test(interaction: Discord.CommandInteraction, user: User){
        return interaction.commandName.toLowerCase() === this.Name.toLowerCase();
    }
    
    public async Init(){
        this.Controller.bot.PushSlashCommands(this.SlashCommands, this.Controller.bot.moduleGlobalLoading ? "global" : this.Controller.bot.masterGuildId);
    }

    public UnLoad?(): Promise<void>;
    
    public async Run(interaction: Discord.CommandInteraction, user: User): Promise<Discord.Message | void>{
        return await interaction.reply("~ baka! don't use this module..");
    }
}