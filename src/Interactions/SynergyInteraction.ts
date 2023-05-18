import Synergy from "../Synergy";
import { ModulePlatform } from "../Modules/Module";
import User from "../Structures/User";
import { Stream } from "node:stream";
import { SynergyTextCommandInteraction } from "./SynergyTextCommandInteraction";
import { UnifiedId, UnifiedIdDataType } from "../UnifiedId";
import { SynergyDiscordInteraction } from "./Discord/SynergyDiscordInteraction";
import { SynergyCommandInteraction } from "./SynergyCommandInteraction";
import { SynergyComponentInteraction } from "./SynergyComponentInteraction";

export enum SynergyInteractionType {
    Component = 0,
    Command = 1,
}

export interface ISynergyInteractionReplyOptions<E = any> {
    content?: string;
    files?: (
        | Buffer
        | string
        | Stream
        )[];
    extras?: E;
}

export interface ISynergyInteractionOptions<T extends ModulePlatform> {
    platform: T;
    user: User;
}

export abstract class SynergyInteraction<T extends ModulePlatform = ModulePlatform> {
    public readonly id: string;
    public readonly bot: Synergy;
    public readonly platform: T;
    public readonly type: SynergyInteractionType;

    protected constructor(bot: Synergy, options: ISynergyInteractionOptions<T>, type: SynergyInteractionType) {
        this.id = UnifiedId.generate(UnifiedIdDataType.Interaction).toString(16);
        this.bot = bot;
        this.platform = options.platform;
        this.type = type;
    }

    public isCommand(): this is SynergyCommandInteraction {
        return this.type === SynergyInteractionType.Command;
    }

    public isComponent(): this is SynergyComponentInteraction {
        return this.type === SynergyInteractionType.Component;
    }

    public isDiscord(): this is SynergyDiscordInteraction {
        return this.platform === ModulePlatform.Discord;
    }

    public isText(): this is SynergyTextCommandInteraction {
        return this.platform === ModulePlatform.TextBased;
    }

    public abstract reply(options: ISynergyInteractionReplyOptions): Promise<void>;
}