import { sequelize } from './Database';
import { GlobalLogger } from './GlobalLogger';
import { StorageModuleDataContainer } from './Models/StorageModuleDataContainer';
import RainbowBOT from './RainbowBOT';

type ModuleDataType = {[key: string]: any};
const dataContainers: Map<string, ModuleDataContainer> = new Map();
const moduleDatas: Map<string, ModuleDataType> = new Map();

export class ModuleDataContainer{
    constructor(public bot: RainbowBOT, private uuid: string, data: ModuleDataType){
        moduleDatas.set(uuid, data);
    }

    public get(field: string): any | null {
        let data = moduleDatas.get(this.uuid);
        return data ? data[field] : null;
    }

    public set(field: string, value: any) {
        let data = moduleDatas.get(this.uuid);
        data ? data[field] = value : 0;
    }

    public wipe(){
        moduleDatas.set(this.uuid, {});
    }
}

export default class ModuleDataManager{
    private timer: NodeJS.Timeout;
    constructor(public bot: RainbowBOT){
        this.timer = setInterval(async () => {
            await this.syncStorage().catch(err => GlobalLogger.root.error("PrivateDataContainerManager AutoSync Error:", err));
        }, 5 * 60 * 1000);
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
                }
            }).then(async storage_container => {
                container = new ModuleDataContainer(this.bot, uuid, storage_container[0].kvData);
                dataContainers.set(uuid, container);
                return resolve(container);
            }).catch(reject);
        });
    }

    public loadFromStorage() {
        return new Promise<void>(async (resolve, reject) => {
            StorageModuleDataContainer.findAll().then(async containers => {
                for(let c of containers){
                    dataContainers.set(c.uuid, new ModuleDataContainer(this.bot, c.uuid, c.kvData));
                }
                return resolve();
            }).catch(reject);
        });
    }

    public syncStorage(){
        return new Promise<void>(async (resolve, reject) => {
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
            await t.commit().catch(err => GlobalLogger.root.error("ModuleDataManager.syncStorage Error Commiting:", err));
            return resolve();
        });
    }
}