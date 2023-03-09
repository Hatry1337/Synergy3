import { ConfigCommonDataType } from "./ConfigDataTypes";

export interface ConfigAttachment {
    id: string;
    url: string;
    proxyURL: string;
}

export interface ConfigRole {
    id: string;
    name: string;
    color: number;
    guildId: string;
}

export interface ConfigUser {
    id: string;
    tag: string;
    avatar: string;
    banner: string;
}

export interface ConfigGuildChannel {
    id: string;
    name: string;
    guildId: string;
}

export type ConfigDataStructure = string | number | boolean | object | ConfigAttachment | ConfigRole | ConfigUser | ConfigGuildChannel;
export type ConfigDataStructureOf<T extends ConfigCommonDataType> =
    T extends "string"          ? string  :
    T extends "int"             ? number  :
    T extends "number"          ? number  :
    T extends "bool"            ? boolean :
    T extends "object"          ? object  :
    T extends "channel"         ? ConfigGuildChannel :
    T extends "user"            ? ConfigUser         :
    T extends "role"            ? ConfigRole         :
    T extends "attachment"      ? ConfigAttachment   :
    unknown;