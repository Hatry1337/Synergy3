import Synergy from './Synergy';
import ModuleDataManager from './ModuleDataManager';
import Module from './Modules/Module';
import { GlobalLogger } from './GlobalLogger';
import { AccessTarget } from './Structures/Access';

export interface ModuleCommonInfo{
    name: string;
    description: string;
    category: string;
    author: string;
    access: AccessTarget[];
    commands: string[];
    initPriority: number;
}

const Modules: Module[] = [];
const ModuleRegistry: Map<string, typeof Module> = new Map();

export default class ModuleManager{
    public data: ModuleDataManager = new ModuleDataManager(this.bot);

    constructor(public bot: Synergy){
    }

    public RegisterModule(mod: typeof Module, uuid: string, preLoad: boolean = false){
        GlobalLogger.root.info(`[ModuleRegistry] Registered "${mod.name}" module.${preLoad ? " Preloading..." : ""}`);
        ModuleRegistry.set(uuid, mod);
        if(preLoad){
            return this.LoadModule(uuid, true);
        }
    }

    /**
     * Don't execute this function directly! It is for internal calls 
    */
    public Init(){
        return new Promise<number>(async (resolve, reject) => {
            let cmdc = Modules.slice(0);
            cmdc.sort((a, b) => (b.InitPriority - a.InitPriority));
            let count = 0;
            for(let c of cmdc){
                if(c.Init){
                    if(await this.InitModule(c)){
                        GlobalLogger.root.info(`[ModuleInit] [${c.Name}] Init sequence completed!`);
                        count++;
                    }else{
                        GlobalLogger.root.warn(`[ModuleInit] [${c.Name}] Module not loaded.`);
                    }
                }
            }
            return resolve(count);
        });
    }

    public CountLoadedModules(){
        return Modules.length;
    }

    public CountModules(){
        return ModuleRegistry.size;
    }

    public GetModuleCommonInfo(module?: string){
        let info: ModuleCommonInfo[] = [];
        let mods = Modules;
        if(module){
            mods = Modules.filter(m => m.Name === module);
        }
        for(let m of mods){
            let commands: string[] = [];
            for(let c of m.SlashCommands){
                commands.push(c.name);
            }
            info.push({
                name: m.Name,
                description: m.Description,
                author: m.Author,
                access: m.Access,
                category: m.Category,
                initPriority: m.InitPriority,
                commands
            });
        }
        return info;
    }

    public async LoadModule(uuid: string, preLoad: boolean = false){
        let mod = ModuleRegistry.get(uuid);
        if(!mod) return;
        let cmd = new mod(this.bot, uuid);
        Modules.push(cmd);
        if(!preLoad && cmd.Init){
            await this.InitModule(cmd);
        }
        return cmd;
    }

    private async InitModule(module: Module){
        if(!module.Init) return false;
        try {
            await module.Init();
            return true;
        } catch (err) {
            GlobalLogger.root.error(`[ModuleLoader] Error loading module "${module.Name}" UUID "${Array.from(ModuleRegistry.entries()).find(md => module instanceof md[1])?.[0]}":`, err);
            if(module.UnLoad){
                await module.UnLoad().catch(() => {});
            }
            Modules.splice(Modules.indexOf(module));
            GlobalLogger.root.warn(`[ModuleLoader] Errored module unloaded.`);
            return false;
        }
    }

    public async UnloadAllModules(){
        for(let m of Modules){
            if(m.UnLoad){
                await m.UnLoad();
            }
        }
    }

    public async UnloadModule(cmd: Module){
        let i = Modules.indexOf(cmd);
        if(i !== -1){
            if(cmd.UnLoad){
                await cmd.UnLoad()
            }
            Modules.splice(i, 1);
            return true;
        }
        return false;
    }

    public async ReloadModule(cmd: Module){
        let i = Modules.indexOf(cmd);
        if(i !== -1){
            this.UnloadModule(cmd);
            this.LoadModule(cmd.Name);
            return true;
        }
        return false;
    }
}
