import Synergy from "../Synergy";
import { ModulePlatform } from "../Modules/Module";
import User from "../Structures/User";
import { Stream } from "node:stream";
import { SynergyDiscordCommandInteraction } from "./SynergyDiscordCommandInteraction";
import { SynergyTextCommandInteraction } from "./SynergyTextCommandInteraction";

export interface ISynergyInteractionReplyOptions {
    content?: string;
    files?: (
        | Buffer
        | string
        | Stream
        )[];
}

export interface ISynergyBaseCommandInteractionOptions<T extends ModulePlatform> {
    platform: T;
    user: User;
}

export abstract class SynergyBaseCommandInteraction<T extends ModulePlatform = ModulePlatform> {
    public readonly bot: Synergy;
    public readonly platform: T;

    protected constructor(bot: Synergy, options: ISynergyBaseCommandInteractionOptions<T>) {
        this.bot = bot;
        this.platform = options.platform;
    }

    public isDiscord(): this is SynergyDiscordCommandInteraction {
        return this.platform === ModulePlatform.Discord;
    }

    public isText(): this is SynergyTextCommandInteraction {
        return this.platform === ModulePlatform.TextBased;
    }

    public abstract reply(options: ISynergyInteractionReplyOptions): Promise<void>;
}