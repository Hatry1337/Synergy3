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

export interface ConfigObject {
    [key: string]: ConfigDataStructure;
}

export type ConfigDataStructure = string | number | boolean | undefined | ConfigObject | ConfigAttachment | ConfigRole | ConfigUser | ConfigGuildChannel;
export type ConfigDataStructureOf<T extends ConfigCommonDataType> =
    T extends "string"
        ? string
        :
    T extends "int"
        ? number
        :
    T extends "number"
        ? number
        :
    T extends "bool"
        ? boolean
        :
    T extends "object"
        ? ConfigObject
        :
    T extends "channel"
        ? ConfigGuildChannel
        :
    T extends "user"
        ? ConfigUser
        :
    T extends "role"
        ? ConfigRole
        :
    T extends "attachment"
        ? ConfigAttachment
        :
    undefined;

/*
    Converts config data structures into string representations with discord formatting
 */
export function dataStructureToString(value: ConfigDataStructure | undefined, type: ConfigCommonDataType){
    if(value === undefined) {
        return "`[not set]`";
    }
    switch (type) {
        case "user": {
            let user = value as ConfigUser;
            return `<@${user.id}>`;
        }
        case "role": {
            let role = value as ConfigRole;
            return `<@&${role.id}>`;
        }
        case "channel": {
            let channel = value as ConfigGuildChannel;
            return `<#${channel.id}>`;
        }
        case "attachment": {
            let attachment = value as ConfigAttachment;
            return `[Attachment](${attachment.proxyURL})`;
        }
        case "bool": {
            return value ? "*true*" : "*false*";
        }
        case "object": {
            return JSON.stringify(value);
        }
        default: {
            return `${value}`;
        }
    }
}