import { ModuleLogger } from "../GlobalLogger";
import { RainbowBOT } from "..";
import { InteractiveCommand } from "../InteractionsManager";

export default interface IModule{
    Name: string;
    Usage: string;
    Description: string;
    Category: string;
    Author: string;
    
    Logger: ModuleLogger;
    SlashCommands:  InteractiveCommand[];

    InitPriority: number;
    Init?(): Promise<void>;
    UnLoad?(): Promise<void>;

    bot: RainbowBOT;
}
