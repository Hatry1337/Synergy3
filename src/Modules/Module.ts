import IModule from "./IModule";
import { ModuleLogger } from "../GlobalLogger";
import { RainbowBOT } from "..";
import { InteractiveCommand } from "../InteractionsManager";

export default class Module implements IModule{
    public Name:           string = "Module";
    public Usage:          string = "This is base module. Don't use it as regular module.";

    public Description:    string = "This is base module. Don't use it as regular module.";
    public Category:       string = "BOT";
    public Author:         string = "Thomasss#9258";
    public Logger:         ModuleLogger = new ModuleLogger(this);
    public InitPriority:   number = 1;
    public SlashCommands:  InteractiveCommand[] = [];

    constructor(public bot: RainbowBOT, protected UUID: string) {
    }
    
    public async Init?(): Promise<void>;
    public async UnLoad?(): Promise<void>;
}