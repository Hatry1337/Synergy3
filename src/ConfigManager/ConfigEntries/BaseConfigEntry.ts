import Discord from "discord.js";
import { ConfigCommonDataType, TypeOfConfigDataType } from "../ConfigDataTypes";
import {
    ConfigAttachment,
    ConfigDataStructure, ConfigDataStructureOf,
    ConfigGuildChannel,
    ConfigRole,
    ConfigUser
} from "../ConfigDataStructures";
import { EphemeralArrayConfigEntry } from "./EphemeralArrayConfigEntry";
import { EphemeralConfigEntry } from "./EphemeralConfigEntry";
import CommonArrayConfigEntry from "./CommonArrayConfigEntry";
import CommonConfigEntry from "./CommonConfigEntry";

export interface RawBaseConfigEntry<T extends ConfigCommonDataType> {
    name: string;
    type: T;
    array: boolean;
    ephemeral: boolean;
    hidden: boolean;
}

export default abstract class BaseConfigEntry<T extends ConfigCommonDataType> {
    protected constructor(
        readonly name: string,
        readonly type: T,
        protected readonly array: boolean,
        protected readonly ephemeral: boolean,
        protected hidden: boolean,
        protected data?: RawBaseConfigEntry<T>
    ) {
        if(!data) {
            this.data = {
                name,
                type,
                array,
                ephemeral,
                hidden
            }
        }
    }

    public setHidden(value: boolean) {
        this.hidden = value;
    }

    public isHidden() {
        return this.hidden;
    }

    public isEphemeral(): this is EphemeralConfigEntry<T> | EphemeralArrayConfigEntry<T> {
        return this.ephemeral;
    }

    public isCommon(): this is CommonConfigEntry<T> | CommonArrayConfigEntry<T> {
        return !this.ephemeral;
    }

    public isArray(): this is CommonArrayConfigEntry<T> | EphemeralArrayConfigEntry<T> {
        return this.array
    }

    protected serializeData(value: TypeOfConfigDataType<T>): ConfigDataStructureOf<T> {
        let data: ConfigDataStructure | undefined;

        if(value instanceof Discord.Attachment){
            if(this.type !== "attachment") {
                throw new Error(`Error writing "Attachment" into "${this.type}" ConfigEntry.`)
            }
            data =  {
                id: value.id,
                url: value.url,
                proxyURL: value.proxyURL
            } as ConfigAttachment;

        } else if(value instanceof Discord.Role) {
            if(this.type !== "role") {
                throw new Error(`Error writing "Role" into "${this.type}" ConfigEntry.`)
            }
            data =  {
                id: value.id,
                name: value.name,
                color: value.color,
                guildId: value.guild.id
            } as ConfigRole;

        } else if(value instanceof Discord.User) {
            if(this.type !== "user") {
                throw new Error(`Error writing "User" into "${this.type}" ConfigEntry.`)
            }
            data =  {
                id: value.id,
                tag: value.tag,
                avatar: value.avatar,
                banner: value.banner
            } as ConfigUser;

        } else if(value instanceof Discord.GuildChannel) {
            if(this.type !== "channel") {
                throw new Error(`Error writing "GuildChannel" into "${this.type}" ConfigEntry.`)
            }
            data =  {
                id: value.id,
                name: value.name,
                guildId: value.guild.id
            } as ConfigGuildChannel;

        } else if (typeof value === "number") {
            if(this.type === "number") {
                data = value;
            }else if(this.type === "int") {
                if (!Number.isInteger(value)) {
                    throw new Error(`Error writing "float" into "${this.type}" ConfigEntry.`)
                }
                data = value;
            }
        } else if(typeof value === "string" || typeof value === "boolean" || typeof value === "object") {
            data = value;
        } else {
            data = undefined;
        }

        if(data === undefined) {
            throw new Error(`Attempt to write Unexpected Type Value into "${this.type}" ConfigEntry.`)
        }

        //#FIXME figure out why *ConfigDataStructure* is incompatible with *ConfigDataStructureOf*
        return data as ConfigDataStructureOf<T>;
    }

    public serialize(): RawBaseConfigEntry<T> {
        return {
            name: this.name,
            type: this.type,
            array: this.array,
            ephemeral: this.ephemeral,
            hidden: this.hidden
        };
    }

    public abstract loadData(data: RawBaseConfigEntry<T>): void;

    public isString(): this is BaseConfigEntry<"string"> {
        return this.type === "string";
    }
    public isInt(): this is BaseConfigEntry<"int"> {
        return this.type === "int";
    }
    public isNumber(): this is BaseConfigEntry<"number"> {
        return this.type === "number";
    }
    public isBoolean(): this is BaseConfigEntry<"bool"> {
        return this.type === "bool";
    }
    public isObject(): this is BaseConfigEntry<"object"> {
        return this.type === "object";
    }
    public isChannel(): this is BaseConfigEntry<"channel"> {
        return this.type === "channel";
    }
    public isUser(): this is BaseConfigEntry<"user"> {
        return this.type === "user";
    }
    public isRole(): this is BaseConfigEntry<"role"> {
        return this.type === "role";
    }
    public isAttachment(): this is BaseConfigEntry<"attachment"> {
        return this.type === "attachment";
    }
}