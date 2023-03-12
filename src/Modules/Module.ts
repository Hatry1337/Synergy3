import IModule from "./IModule";
import { ModuleLogger } from "../GlobalLogger";
import { InteractiveComponent, Synergy } from "..";
import { InteractiveCommand } from "../Interactions/InteractiveCommand";
import { AccessTarget } from "../Structures/Access";
import Discord from "discord.js";

export type ModuleSharedMethods = { [key: string]: (...args: any) => any };

export default class Module implements IModule{
    /**
     * Name of the module. Recommended to be equal with class name
     */
    public Name: string = "Module";
    /**
     * Brief description of the module
     */
    public Description: string = "This is base module. Don't use it as regular module.";
    /**
     * Category of the module. Standard ones is `BOT`, `Admin`, `Info`, `Utility`, `Moderation` and so on
     */
    public Category: string = "BOT";
    /**
     * Author who created this module. Put here your name or nickname
     */
    public Author: string = "Thomasss#9258";
    /**
     * Priority relative to other modules when module should be initialized.
     */
    public InitPriority: number = 1;
    /**
     * Access targets of this module. This describes who can use it
     */
    public Access: AccessTarget[] = [];
    /**
     * Permissions of the bot your module require. **THIS FEATURE IS NOT IMPLEMENTED AT THIS MOMENT**
     */
    public Permissions: Discord.PermissionsBitField = new Discord.PermissionsBitField();

    readonly Logger: ModuleLogger = new ModuleLogger(this);
    readonly SlashCommands: InteractiveCommand<Discord.SlashCommandBuilder>[] = [];

    protected sharedMethods: ModuleSharedMethods = {};

    constructor(public bot: Synergy, protected UUID: string) {
    }
    
    /**
     * Called when Synergy initializes the module. Override to do some init stuff
     */
    public async Init?(): Promise<void>;
    /**
     * Called when Synergy unloads the module or shutting down themself. Override this to remove any timers and save the data
     */
    public async UnLoad?(): Promise<void>;

    /**
     * Creates interactive Slash Command and adds it to `this.SlashCommands`
     * @param name Name of the slash command to create (Lowercase only)
     * @param access Allowed access targets to interact with this command
     * @param forGuildId Guild id where to upload this command. **Leave empty to upload globally**
     */
    public createSlashCommand(name: string, access?: AccessTarget[], forGuildId?: string){
        let command = this.bot.interactions.createSlashCommand(name, access || this.Access, this, forGuildId);
        this.SlashCommands.push(command);
        return command;
    }
    /**
     * Creates interactive Context Menu Command
     * @param name Name of the Context Menu command to create
     * @param access Allowed access targets to interact with this command
     * @param forGuildId Guild id where to upload this command. **Leave empty to upload globally**
     */
    public createMenuCommand(name: string, access?: AccessTarget[], forGuildId?: string){
        return this.bot.interactions.createMenuCommand(name, access || this.Access, this, forGuildId);
    }

    /**
     * Creates normal interactive button
     * @param name Name of the component (identifier)
     * @param access Allowed access targets to interact with this component
     */
    public createMessageButton(name: string, access?: AccessTarget[]): InteractiveComponent<Discord.ButtonBuilder>;
    /**
     * Creates temporary interactive button that will be removed by interactions limit or lifetime limit
     * @param access Allowed access targets to interact with this component
     * @param interactionsLimit After reaching this amount of interactions component will be removed (-1 for no limit)
     * @param lifeTime After this amount of milliseconds component will be removed (-1 for no limit)
     */
    public createMessageButton(access?: AccessTarget[], interactionsLimit?: number, lifeTime?: number): InteractiveComponent<Discord.ButtonBuilder>;

    public createMessageButton(arg1?: string | AccessTarget[], arg2?: AccessTarget[] | number, arg3?: number){
        if(typeof arg1 === "string"){
            return this.bot.interactions.createButton(arg1, (arg2 as AccessTarget[]) || this.Access, this);
        }else{
            return this.bot.interactions.createButton(arg1 || this.Access, this, arg2 as number, arg3)
        }
    }

    /**
     * Creates normal interactive select menu
     * @param name Name of the component (identifier)
     * @param access Allowed access targets to interact with this component
     */
    public createMessageSelectMenu(name: string, access?: AccessTarget[]): InteractiveComponent<Discord.SelectMenuBuilder>;
    /**
     * Creates temporary interactive select menu that will be removed by interactions limit or lifetime limit
     * @param access Allowed access targets to interact with this component
     * @param interactionsLimit After reaching this amount of interactions component will be removed (-1 for no limit)
     * @param lifeTime After this amount of milliseconds component will be removed (-1 for no limit)
     */
    public createMessageSelectMenu(access?: AccessTarget[], interactionsLimit?: number, lifeTime?: number): InteractiveComponent<Discord.SelectMenuBuilder>;

    public createMessageSelectMenu(arg1?: string | AccessTarget[], arg2?: AccessTarget[] | number, arg3?: number){
        if(typeof arg1 === "string"){
            return this.bot.interactions.createSelectMenu(arg1, (arg2 as AccessTarget[]) || this.Access, this);
        }else{
            return this.bot.interactions.createSelectMenu(arg1 || this.Access, this, arg2 as number, arg3)
        }
    }

    /**
     * Set module's shared methods. These methods can call any other module.
     * @param methods Object with methods
     */
    protected setSharedMethods(methods: ModuleSharedMethods){
        this.sharedMethods = methods;
    }

    public getSharedMethods<T extends ModuleSharedMethods = ModuleSharedMethods>(){
        return this.sharedMethods as T;
    }
}