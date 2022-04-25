import { ModuleLogger } from "../GlobalLogger";
import { Synergy } from "..";
import { InteractiveCommand } from "../InteractionsManager";
import Discord from "discord.js";
import { AccessTarget } from "../Structures/Access";
import { SlashCommandBuilder } from "@discordjs/builders";


export default interface IModule{
    Name: string;
    Description: string;
    Category: string;
    Author: string;

    Access: AccessTarget[];
    Permissions: Discord.Permissions;
    
    Logger: ModuleLogger;
    SlashCommands:  InteractiveCommand<SlashCommandBuilder>[];

    InitPriority: number;
    Init?(): Promise<void>;
    UnLoad?(): Promise<void>;

    bot: Synergy;
}
