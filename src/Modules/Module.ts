import IModule from "./IModule";
import { ModuleLogger } from "../GlobalLogger";
import { Synergy } from "..";
import { InteractiveCommand } from "../InteractionsManager";
import { Permissions } from "discord.js";
import { AccessTarget } from "../Structures/Access";
import { SlashCommandBuilder } from "@discordjs/builders";

export default class Module implements IModule{
    public Name:           string = "Module";
    public Description:    string = "This is base module. Don't use it as regular module.";

    public Category:       string = "BOT";
    public Author:         string = "Thomasss#9258";
    public Logger:         ModuleLogger = new ModuleLogger(this);
    public InitPriority:   number = 1;
    public Access:         AccessTarget[] = [];
    public SlashCommands:  InteractiveCommand<SlashCommandBuilder>[] = [];
    public Permissions:    Permissions = new Permissions();

    constructor(public bot: Synergy, protected UUID: string) {
    }
    
    public async Init?(): Promise<void>;
    public async UnLoad?(): Promise<void>;

    public createSlashCommand(name: string, access?: AccessTarget[], forGuildId?: string){
        let command = this.bot.interactions.createSlashCommand(name, access || this.Access, this, forGuildId);
        this.SlashCommands.push(command);
        return command;
    }
    public createMenuCommand(name: string, access?: AccessTarget[], forGuildId?: string){
        return this.bot.interactions.createMenuCommand(name, access || this.Access, this, forGuildId);
    }
}