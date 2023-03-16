import { sequelize } from './Database';
import { GlobalLogger } from './GlobalLogger';
import { StorageModuleDataContainer } from './Models/StorageModuleDataContainer';
import Synergy from './Synergy';

type ModuleDataType = {[key: string]: any};
const dataContainers: Map<string, ModuleDataContainer> = new Map();
const moduleDatas: Map<string, ModuleDataType> = new Map();

export type DataContainerPrimitive = string | number | boolean | null | object | undefined;

export class ModuleDataContainer{
    constructor(public bot: Synergy, private uuid: string, data: ModuleDataType){
        moduleDatas.set(uuid, data);
    }

    public get(field: string): DataContainerPrimitive {
        let data = moduleDatas.get(this.uuid);
        if(!data) {
            data = {};
            moduleDatas.set(this.uuid, data);
        }
        return data[field];
    }

    public set(field: string, value: DataContainerPrimitive) {
        let data = moduleDatas.get(this.uuid);
        if(!data){
            data = {};
            moduleDatas.set(this.uuid, data);
        }
        data[field] = value;
    }

    /*
        Returns container copy represented as JSON object
     */
    public dump() {
        let data = moduleDatas.get(this.uuid);
        if(data){
            //Hack???
            return JSON.parse(JSON.stringify(data));
        }
        return {};
    }

    /*
        Restore container contents from dump or just replace them with another data
     */
    public restore(data: any) {
        //Another hack???
        moduleDatas.set(this.uuid, JSON.parse(JSON.stringify(data)));
    }

    public wipe(){
        moduleDatas.set(this.uuid, {});
    }

    public isEmpty(): boolean {
        let data = moduleDatas.get(this.uuid);
        if(data === undefined) return true;
        return Object.keys(data).length === 0;
    }
}

export default class ModuleDataManager{
    private timer: NodeJS.Timeout;
    constructor(public bot: Synergy){
        this.timer = setInterval(async () => {
            await this._syncStorage().catch(err => GlobalLogger.root.error("ModuleDataManager AutoSync Error:", err));
        }, (this.bot.options.dataSyncDelay || 60) * 1000);
        this.bot.events.once("Stop", () => { clearInterval(this.timer); });
    }

    public getContainer(uuid: string) {
        return new Promise<ModuleDataContainer>(async (resolve, reject) => {
            let container = dataContainers.get(uuid);
            if(container){
                return resolve(container);
            }
            
            StorageModuleDataContainer.findOrCreate({
                where: {
                    uuid
                },
                defaults: {
                    uuid: uuid,
                    kvData: {}
                } as StorageModuleDataContainer
            }).then(async storage_container => {
                container = new ModuleDataContainer(this.bot, uuid, storage_container[0].kvData);
                dataContainers.set(uuid, container);
                return resolve(container);
            }).catch(reject);
        });
    }

    /**
     * Don't execute this function directly! It is for internal calls 
     */
    public _loadFromStorage() {
        return new Promise<void>(async (resolve, reject) => {
            StorageModuleDataContainer.findAll().then(async containers => {
                for(let c of containers){
                    dataContainers.set(c.uuid, new ModuleDataContainer(this.bot, c.uuid, c.kvData));
                }
                return resolve();
            }).catch(reject);
        });
    }

    /**
     * Don't execute this function directly! It is for internal calls 
     */
    public _syncStorage(){
        return new Promise<void>(async (resolve) => {
            GlobalLogger.root.info("[ModuleDataManager] Saving data to storage...");
            let t = await sequelize().transaction();
            for(let c of dataContainers){
                let mdata = moduleDatas.get(c[0]);
                if(!mdata) continue;

                await StorageModuleDataContainer.update({
                    kvData: mdata
                }, {
                    where: {
                        uuid: c[0]
                    },
                    transaction: t
                }).catch(err => GlobalLogger.root.warn("ModuleDataManager.syncStorage Error Updating StorageModuleDataContainer:", err));

            }
            await t.commit().catch(err => GlobalLogger.root.error("ModuleDataManager.syncStorage Error Committing:", err));
            return resolve();
        });
    }
}