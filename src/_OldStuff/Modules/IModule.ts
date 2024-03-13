import { ModuleLogger } from "../GlobalLogger";
import { Synergy } from "..";
import { InteractiveCommand } from "../Interactions/InteractiveCommand";
import Discord from "discord.js";
import { AccessTarget } from "../Structures/Access";


export default interface IModule{
    Name: string;
    Description: string;
    Category: string;
    Author: string;

    Access: AccessTarget[];
    Permissions: Discord.PermissionsBitField;
    
    Logger: ModuleLogger;
    SlashCommands:  InteractiveCommand<Discord.SlashCommandBuilder>[];

    InitPriority: number;
    Init?(): Promise<void>;
    UnLoad?(): Promise<void>;

    bot: Synergy;
}
