import { GlobalLogger, ModuleLogger } from "./GlobalLogger"
import IModule from "./Modules/IModule"
import Module from "./Modules/Module"
import Synergy, { ModuleUUIDPair, SynergyOptions } from "./Synergy"
import Guild, { GuildOptions } from "./Structures/Guild"
import User, { UserDiscordOptions, UserEconomyOptions, UserOptions } from "./Structures/User"
import { Colors, Emojis, Utils } from "./Utils"
import CoreModules from "./Modules/Core";
import ConfigManager from "./ConfigManager/ConfigManager"
import EventManager from "./EventManager"
import { GuildManager, UserManager } from "discord.js"
import ModuleDataManager from "./ModuleDataManager"
import ModuleManager, { ModuleCommonInfo } from "./ModuleManager"
import InteractionsManager from "./InteractionsManager";
import { GuildOnlyError, SynergyUserError, NoConfigEntryError, MissingPermissionsError } from "./Structures/Errors"
import Access, { AccessTarget } from "./Structures/Access"
import { InteractiveComponentTargets, InteractiveCommandTargets, InteractionTypeOf, InteractiveTargets, CallbackTypeOf } from "./Interactions/InteractionTypes";
import { InteractiveCommand } from "./Interactions/InteractiveCommand";
import { InteractiveComponent } from "./Interactions/InteractiveComponent";

export {
    Guild,
    GuildOptions,

    User,
    UserEconomyOptions,
    UserDiscordOptions,
    UserOptions,

    CoreModules,
    Module,
    IModule,

    Synergy,
    SynergyOptions,
    ModuleUUIDPair,

    Utils,
    Colors,
    Emojis,
    GlobalLogger,
    ModuleLogger,
    
    ConfigManager,
    //ConfigDataType,

    EventManager,

    InteractionsManager,
    InteractiveCommand,
    InteractiveCommandTargets,
    InteractiveComponent,
    InteractiveComponentTargets,
    InteractiveTargets,
    InteractionTypeOf,
    CallbackTypeOf,
    
    GuildManager,

    ModuleDataManager,
    
    ModuleManager,
    ModuleCommonInfo,

    UserManager,

    AccessTarget,
    Access,

    SynergyUserError,
    GuildOnlyError,
    NoConfigEntryError,
    MissingPermissionsError
}