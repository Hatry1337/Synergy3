import { ModuleLogger } from "../GlobalLogger";
import { Synergy } from "..";
import { InteractiveDiscordCommand } from "../Interactions/InteractiveCommand";
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
    SlashCommands:  InteractiveDiscordCommand<Discord.SlashCommandBuilder>[];

    InitPriority: number;
    Init?(): Promise<void>;
    UnLoad?(): Promise<void>;

    bot: Synergy;
}
