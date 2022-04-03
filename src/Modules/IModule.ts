import { ModuleLogger } from "../GlobalLogger";
import { RainbowBOT } from "..";
import { InteractiveCommand } from "../InteractionsManager";
import Discord from "discord.js";
import { AccessTarget } from "../Structures/Access";


export default interface IModule{
    Name: string;
    Description: string;
    Category: string;
    Author: string;

    Access: AccessTarget[];
    Permissions: Discord.Permissions;
    
    Logger: ModuleLogger;
    SlashCommands:  InteractiveCommand[];

    InitPriority: number;
    Init?(): Promise<void>;
    UnLoad?(): Promise<void>;

    bot: RainbowBOT;
}
