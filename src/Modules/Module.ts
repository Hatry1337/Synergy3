import { ModuleLogger } from "../GlobalLogger";
import { InteractiveComponent, Synergy } from "..";
import { AccessTarget } from "../Structures/Access";
import Discord from "discord.js";
import { SynergySlashCommandBuilder } from "../Interactions/Entities/Commands/SynergyCommandBuilder";

export type ModuleSharedMethods = { [key: string]: (...args: any) => any };
export enum ModulePlatform {
    Discord = "discord",
    Telegram = "telegram",
    TextBased = "text"
}

export default abstract class Module {
    /**
     * Name of the module. Recommended to be equal with class name
     */
    public abstract Name: string;
    /**
     * Brief description of the module
     */
    public abstract Description: string;
    /**
     * Category of the module. Standard ones is `BOT`, `Admin`, `Info`, `Utility`, `Moderation` and so on
     */
    public abstract Category: string;
    /**
     * Author who created this module. Put here your name or nickname
     */
    public abstract Author: string;
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

    public readonly Logger: ModuleLogger = new ModuleLogger(this);

    /**
     * Supported platforms which module can correctly process
     */
    public Platforms: ModulePlatform[] = [ ModulePlatform.Discord ];

    protected sharedMethods: ModuleSharedMethods = {};

    protected constructor(public bot: Synergy, protected UUID: string) {

    }
    
    /**
     * Called when Synergy initializes the module. Override to do some init stuff
     */
    public async Init?(): Promise<void>;
    /**
     * Called when Synergy unloads the module or shutting down itself. Override this to remove any timers and save the data
     */
    public async UnLoad?(): Promise<void>;

    /**
     * Shortcut for `Synergy.interactions.registerCommand`
     * @param builder Builder of the command
     */
    public registerCommand(builder: SynergySlashCommandBuilder){
        this.bot.interactions.registerCommand(builder, this);
        return builder;
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