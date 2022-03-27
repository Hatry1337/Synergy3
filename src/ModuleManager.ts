import Discord from 'discord.js';
import RainbowBOT from './RainbowBOT';
import ModuleDataManager from './ModuleDataManager';
import Module from './Modules/Module';
import User from './Structures/User';
import { GlobalLogger } from './GlobalLogger';

export interface ModuleCommonInfo{
    name: string;
    usage: string;
    description: string;
    category: string;
    author: string;
    commands: string[];
    initPriority: number;
}

const Modules: Module[] = [];
const ModuleRegistry: Map<string, typeof Module> = new Map();

export default class ModuleManager{
    public data: ModuleDataManager = new ModuleDataManager(this.bot);

    constructor(public bot: RainbowBOT){
    }

    public RegisterModule(mod: typeof Module, uuid: string, load: boolean = false){
        ModuleRegistry.set(uuid, mod);
        if(load){
            let inst = new mod(this.bot, uuid);
            Modules.push(inst);
        }
    }

    public Init(){
        return new Promise<number>(async (resolve, reject) => {
            var cmdc = Modules.slice(0);
            cmdc.sort((a, b) => (b.InitPriority - a.InitPriority));
            var count = 0;
            for(var c of cmdc){
                if(c.Init){
                    GlobalLogger.root.info(`[ModuleInit] Loading "${c.Name}" module`);
                    await c.Init().catch(async err => {
                        GlobalLogger.root.error(`[ModuleInit] Error loading module "${c.Name}" UUID "${Array.from(ModuleRegistry.entries()).find(md => c instanceof md[1])?.[0]}":`, err);
                        if(c.UnLoad){
                            await c.UnLoad().catch(() => {});
                        }
                        Modules.splice(Modules.indexOf(c));
                        GlobalLogger.root.warn(`[ModuleInit] Errored module unloaded.`);
                    });
                    count++;
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

    public GetModuleCommonInfo(){
        let info: ModuleCommonInfo[] = [];
        for(let m of Modules){
            let commands: string[] = [];
            for(let c of m.SlashCommands){
                commands.push(c.name);
            }
            info.push({
                name: m.Name,
                usage: m.Usage,
                description: m.Description,
                author: m.Author,
                category: m.Category,
                initPriority: m.InitPriority,
                commands
            });
        }
        return info;
    }

    public async LoadModule(uuid: string){
        let mod = ModuleRegistry.get(uuid);
        if(!mod) return;
        let cmd = new mod(this.bot, uuid);
        Modules.push(cmd);
        if(cmd.Init){
            await cmd.Init()
        }
        return cmd;
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
        }
    }

    public async ReloadModule(cmd: Module){
        let i = Modules.indexOf(cmd);
        if(i !== -1){
            this.UnloadModule(cmd);
            this.LoadModule(cmd.Name);
        }
    }
}
