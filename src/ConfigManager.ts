import { ModuleDataContainer } from "./ModuleDataManager";
import Synergy from "./Synergy";

export type ConfigDataType = "string" | "int" | "number" | "bool" | "channel" | "user" | "role";

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