import { GlobalLogger, ModuleLogger } from "./GlobalLogger"
import IModule from "./Modules/IModule"
import Module from "./Modules/Module"
import Synergy, { ModuleUUIDPair, SynergyOptions } from "./Synergy"
import Guild, { GuildOptions } from "./Structures/Guild"
import User, { UserDiscordOptions, UserEconomyOptions, UserOptions } from "./Structures/User"
import { Colors, Emojis, Utils } from "./Utils"
import CoreModules from "./Modules/Core";
import ConfigManager, { ConfigEntryMapStructure } from "./ConfigManager/ConfigManager"
import EventManager from "./EventManager"
import { GuildManager, UserManager } from "discord.js"
import ModuleDataManager from "./ModuleDataManager"
import ModuleManager, { ModuleCommonInfo } from "./ModuleManager"
import InteractionsManager from "./InteractionsManager";
import { GuildOnlyError, MissingPermissionsError, NoConfigEntryError, SynergyUserError } from "./Structures/Errors"
import Access, { AccessTarget } from "./Structures/Access"
import {
    CallbackTypeOf,
    InteractionTypeOf,
    InteractiveCommandTargets,
    InteractiveComponentTargets,
    InteractiveTargets
} from "./Interactions/InteractionTypes";
import { InteractiveCommand } from "./Interactions/InteractiveCommand";
import { InteractiveComponent } from "./Interactions/InteractiveComponent";
import BaseConfigEntry, { ArrayConfigEntry, NonArrayConfigEntry } from "./ConfigManager/ConfigEntries/BaseConfigEntry"
import CommonArrayConfigEntry from "./ConfigManager/ConfigEntries/CommonArrayConfigEntry"
import CommonConfigEntry from "./ConfigManager/ConfigEntries/CommonConfigEntry"
import { EphemeralArrayConfigEntry } from "./ConfigManager/ConfigEntries/EphemeralArrayConfigEntry"
import { EphemeralConfigEntry } from "./ConfigManager/ConfigEntries/EphemeralConfigEntry"
import {
    ConfigAttachment,
    ConfigDataStructure,
    ConfigDataStructureOf,
    ConfigGuildChannel,
    ConfigRole,
    ConfigUser,
    dataStructureToString
} from "./ConfigManager/ConfigDataStructures"
import { ConfigCommonDataType, TypeOfConfigDataType } from "./ConfigManager/ConfigDataTypes"
import { RainbowBOTEpoch, UnifiedId, UnifiedIdDataType, UnifiedIdString } from "./UnifiedId"

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
    ConfigEntryMapStructure,
    BaseConfigEntry,
    CommonArrayConfigEntry,
    CommonConfigEntry,
    EphemeralArrayConfigEntry,
    EphemeralConfigEntry,
    ConfigAttachment,
    ConfigRole,
    ConfigUser,
    ConfigGuildChannel,
    ConfigDataStructure,
    ConfigDataStructureOf,
    ConfigCommonDataType,
    TypeOfConfigDataType,
    dataStructureToString,
    //ConfigDataType,
    NonArrayConfigEntry,
    ArrayConfigEntry,


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
    MissingPermissionsError,

    UnifiedId,
    RainbowBOTEpoch,
    UnifiedIdDataType,
    UnifiedIdString
}