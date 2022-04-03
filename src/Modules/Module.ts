import IModule from "./IModule";
import { ModuleLogger } from "../GlobalLogger";
import { RainbowBOT } from "..";
import { InteractiveCommand } from "../InteractionsManager";
import { Permissions } from "discord.js";
import { AccessTarget } from "../Structures/Access";

export default class Module implements IModule{
    public Name:           string = "Module";
    public Description:    string = "This is base module. Don't use it as regular module.";

    public Category:       string = "BOT";
    public Author:         string = "Thomasss#9258";
    public Logger:         ModuleLogger = new ModuleLogger(this);
    public InitPriority:   number = 1;
    public Access:         AccessTarget[] = [];
    public SlashCommands:  InteractiveCommand[] = [];
    public Permissions:    Permissions = new Permissions();

    constructor(public bot: RainbowBOT, protected UUID: string) {
    }
    
    public async Init?(): Promise<void>;
    public async UnLoad?(): Promise<void>;
}