import { ModuleDataContainer } from "./ModuleDataManager";
import Synergy from "./Synergy";
import Discord from "discord.js";

export type ConfigCommonDataType = "string" | "int" | "number" | "bool" | "channel" | "user" | "role" | "attachment";
export type ConfigArrayDataType = `array<${ConfigCommonDataType}>`;
export type ConfigDataType = ConfigCommonDataType | ConfigArrayDataType;

export type TypeOfConfigCommonDataType<T extends ConfigCommonDataType> =   
    T extends "string"  ? string  :
    T extends "int"     ? number  :
    T extends "number"  ? number  :
    T extends "bool"    ? boolean :
    T extends "channel" ? Discord.GuildBasedChannel :
    T extends "user"    ? Discord.User :
    T extends "role"    ? Discord.Role :
    Discord.AttachmentBuilder

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