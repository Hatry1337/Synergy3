import { ModuleDataContainer } from "./ModuleDataManager";
import Synergy from "./Synergy";
import Discord from "discord.js";

export type ConfigCommonDataType = "string" | "int" | "number" | "bool" | "object" | "channel" | "user" | "role" | "attachment";
export type ConfigArrayDataType = `array<${ConfigCommonDataType}>`;
export type ConfigDataType = ConfigCommonDataType | ConfigArrayDataType;

export type TypeOfConfigCommonDataType<T extends ConfigDataType> =
    T extends "string"          ? string  :
    T extends "int"             ? number  :
    T extends "number"          ? number  :
    T extends "bool"            ? boolean :
    T extends "object"          ? object  :
    T extends "channel"         ? Discord.GuildChannel :
    T extends "user"            ? Discord.User         :
    T extends "role"            ? Discord.Role         :
    T extends "attachment"      ? Discord.Attachment   :
    T extends `array<${any}>`   ? Array<any> :
                                  unknown;

interface RawConfigEntry<T extends ConfigCommonDataType> {
    type: T;
    hidden: boolean;
    ephemeral: false;
    array: boolean;
    value: any;
}

interface RawEphemeralConfigEntry<T extends ConfigCommonDataType> {
    type: T;
    hidden: boolean;
    ephemeral: true;
    array: boolean;
    values: {
        [key: string]: any;
    }
}


interface ConfigAttachment {
    id: string;
    url: string;
    proxyURL: string;
}

interface ConfigRole {
    id: string;
    name: string;
    color: number;
    guildId: string;
}

interface ConfigUser {
    id: string;
    tag: string;
    avatar: string;
    banner: string;
}

interface ConfigGuildChannel {
    id: string;
    name: string;
    guildId: string;
}

type ConfigValues = string | number | boolean | object | ConfigAttachment | ConfigRole | ConfigUser | ConfigGuildChannel;
type ConfigValueOf<T extends ConfigDataType> =
    T extends "string"          ? string  :
    T extends "int"             ? number  :
    T extends "number"          ? number  :
    T extends "bool"            ? boolean :
    T extends "object"          ? object  :
    T extends "channel"         ? ConfigGuildChannel :
    T extends "user"            ? ConfigUser         :
    T extends "role"            ? ConfigRole         :
    T extends "attachment"      ? ConfigAttachment   :
    T extends `array<${any}>`   ? Array<any>         :
                                  unknown;


export class BaseConfigEntry<T extends ConfigCommonDataType> {
    constructor(
        readonly name: string,
        readonly type: ConfigCommonDataType,
        readonly ephemeral: boolean,
        public hidden: boolean
    ) { }

    protected serializeData(value: TypeOfConfigCommonDataType<T>) {
        let data: ConfigValues | undefined;

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

        return data;
    }

    public serialize(): object {
        return {
            name: this.name,
            type: this.type,
            ephemeral: this.ephemeral,
            hidden: this.hidden
        };
    }
}

export class ConfigEntry<T extends ConfigCommonDataType> extends BaseConfigEntry<T>{
    protected data: RawConfigEntry<T>;
    constructor(
        name: string,
        type: ConfigCommonDataType,
        ephemeral: false,
        hidden: boolean
    ) {
        super(name, type, ephemeral, hidden);
        this.data = {
            type,
            hidden,
            ephemeral,
            array: false,
            value: {}
        } as RawConfigEntry<T>
    }

    public setValue(value: TypeOfConfigCommonDataType<T>) {
        this.data.value = this.serializeData(value);
    }

    public getValue(): ConfigValueOf<T> {
        return this.data.value;
    }

    public override serialize(): object {
        return {
            name: this.name,
            type: this.type,
            ephemeral: this.ephemeral,
            hidden: this.hidden,
            array: this.data.array,
            value: this.data.value
        };
    }

    public isString(): this is ConfigEntry<"string"> {
        return this.type === "string";
    }
    public isInt(): this is ConfigEntry<"int"> {
        return this.type === "int";
    }
    public isNumber(): this is ConfigEntry<"number"> {
        return this.type === "number";
    }
    public isBoolean(): this is ConfigEntry<"bool"> {
        return this.type === "bool";
    }
    public isObject(): this is ConfigEntry<"object"> {
        return this.type === "object";
    }
    public isChannel(): this is ConfigEntry<"channel"> {
        return this.type === "channel";
    }
    public isUser(): this is ConfigEntry<"user"> {
        return this.type === "user";
    }
    public isRole(): this is ConfigEntry<"role"> {
        return this.type === "role";
    }
    public isAttachment(): this is ConfigEntry<"attachment"> {
        return this.type === "attachment";
    }
}

export class EphemeralConfigEntry<T extends ConfigCommonDataType> extends BaseConfigEntry<T> {
    protected data: RawEphemeralConfigEntry<T>;
    constructor(
        name: string,
        type: ConfigCommonDataType,
        ephemeral: true,
        hidden: boolean
    ) {
        super(name, type, ephemeral, hidden);
        this.data = {
            type,
            hidden,
            ephemeral,
            array: false,
            values: {}
        } as RawEphemeralConfigEntry<T>
    }

    public setValue(ephemeralTarget: string, value: TypeOfConfigCommonDataType<T>) {
        this.data.values[ephemeralTarget] = this.serializeData(value);
    }

    public getValue(ephemeralTarget: string): ConfigValueOf<T> | undefined {
        return this.data.values[ephemeralTarget];
    }

    public override serialize(): object {
        return {
            name: this.name,
            type: this.type,
            ephemeral: this.ephemeral,
            hidden: this.hidden,
            array: this.data.array,
            values: this.data.values
        };
    }

    public isString(): this is EphemeralConfigEntry<"string"> {
        return this.type === "string";
    }
    public isInt(): this is EphemeralConfigEntry<"int"> {
        return this.type === "int";
    }
    public isNumber(): this is EphemeralConfigEntry<"number"> {
        return this.type === "number";
    }
    public isBoolean(): this is EphemeralConfigEntry<"bool"> {
        return this.type === "bool";
    }
    public isObject(): this is EphemeralConfigEntry<"object"> {
        return this.type === "object";
    }
    public isChannel(): this is EphemeralConfigEntry<"channel"> {
        return this.type === "channel";
    }
    public isUser(): this is EphemeralConfigEntry<"user"> {
        return this.type === "user";
    }
    public isRole(): this is EphemeralConfigEntry<"role"> {
        return this.type === "role";
    }
    public isAttachment(): this is EphemeralConfigEntry<"attachment"> {
        return this.type === "attachment";
    }
}

export default class ConfigManager{
    private dataContainer?: ModuleDataContainer;
    constructor(public bot: Synergy){

    }

    public async set(namespace: string, field: string, value: any, type: ConfigDataType){
        if(!this.dataContainer){
            this.dataContainer = await this.bot.modules.data.getContainer("global-config");
        }
        let ns = this.dataContainer.get(namespace) || {};
        ns[field] = { value, type };
        this.dataContainer.set(namespace, ns);
    }

    public async setIfNotExist(namespace: string, field: string, value: any, type: ConfigDataType){
        if(!this.dataContainer){
            this.dataContainer = await this.bot.modules.data.getContainer("global-config");
        }
        let ns = this.dataContainer.get(namespace) || {};
        if(!ns[field]){
            ns[field] = { value, type };
            this.dataContainer.set(namespace, ns);
        }
    }

    public async get(namespace: string, field: string){
        if(!this.dataContainer){
            this.dataContainer = await this.bot.modules.data.getContainer("global-config");
        }
        return (this.dataContainer.get(namespace) || {})[field]?.value;
    }

    public async getFields(namespace: string){
        if(!this.dataContainer){
            this.dataContainer = await this.bot.modules.data.getContainer("global-config");
        }
        return Object.keys(this.dataContainer.get(namespace) || {});
    }

    public async getType(namespace: string, field: string){
        if(!this.dataContainer){
            this.dataContainer = await this.bot.modules.data.getContainer("global-config");
        }
        return (this.dataContainer.get(namespace) || {})[field]?.type as ConfigDataType | undefined;
    }
}