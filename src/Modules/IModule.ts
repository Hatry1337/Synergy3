import Discord from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { ModuleLogger } from "../GlobalLogger";
import ModuleManager from "../ModuleManager";
import User from "../Structures/User";

export default interface IModule{
    Name: string;
    Usage: string;
    Description: string;
    Category: string;
    Author: string;
    
    SlashCommands: SlashCommandBuilder[];
    Logger: ModuleLogger;

    InitPriority: number;
    Init?(): Promise<void>;
    UnLoad?(): Promise<void>;

    Test(interaction: Discord.CommandInteraction, user: User): boolean;
    Run(interaction: Discord.CommandInteraction, user: User): Promise<Discord.Message | void>;

    Controller: ModuleManager;
}
