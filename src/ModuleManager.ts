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
            let inst = new mod(this, uuid);
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
                    await c.Init().catch(err => GlobalLogger.root.error(`[ModuleInit] Error loading module "${c.Name}":`, err));
                    count++;
                }
            }
            await this.bot.UpdateSlashCommands(this.bot.masterGuildId).catch(reject);
            await this.bot.UpdateSlashCommands("global").catch(reject);
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
        let cmd = new mod(this, uuid);
        Modules.push(cmd);
        if(cmd.Init){
            await cmd.Init();
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

    public FindAndRun(interaction: Discord.CommandInteraction): Promise<Discord.Message | void | undefined>{
        return new Promise(async (resolve, reject) => {
            let user_id = this.bot.users.idFromDiscordId(interaction.user.id);
            let user: User | null = null;
            if(user_id){
                user = await this.bot.users.fetchOne(user_id);
            }
            if(!user){
                user = await this.bot.users.createFromDiscord(interaction.user);
            }
            let module = Modules.find(m => m.Test(interaction, user!));
            if(!module){
                return resolve(undefined);
            }
            return module.Run(interaction, user!).then(resolve).catch(reject);
            /*
            User.findOrCreate({
                

            }).then(async ures => {
                if(interaction.guild){
                    let gres = await Guild.findOrCreate({
                        where: {
                            ID: interaction.guild.id
                        },
                        defaults: {
                            ID: interaction.guild.id,
                            Name: interaction.guild.name,
                            OwnerID: interaction.guild.ownerId,
                            Region: interaction.guild.preferredLocale,
                            SystemChannelID: interaction.guild.systemChannelId,
                            JoinRolesIDs: [],
                        }
                    });
                }

                

                
            }).catch(err => { GlobalLogger.root.error("ModuleManager.FindAndRun Error: ", err, "trace:", GlobalLogger.Trace(err)); return reject(err) });
            Guild.findOrCreate({
                where: {
                    ID: message.guild?.id
                },
                defaults: {
                    ID: message.guild?.id,
                    Name: message.guild?.name,
                    OwnerID: message.guild?.ownerId,
                    Region: message.guild?.preferredLocale,
                    SystemChannelID: message.guild?.systemChannelId,
                    JoinRolesIDs: [],
                }
            }).then(async res => {
                var guild = res[0];
                var user = (await User.findOrCreate({ 
                    defaults: {
                        ID: message.author.id,
                        Tag: message.author.tag,
                        Avatar: message.author.avatarURL({ format: "png" }) || "No Avatar"
                    },
                    where: { 
                        ID: message.author.id
                    }
                }))[0];

                user.Tag = message.author.tag;
                user.Avatar = message.author.avatarURL({ format: "png" }) || "No Avatar";
                                
                await user.save();
                return command!.Run(message, guild, user).then(resolve).catch(reject);
            }).catch(reject);
            */
        });
    }
}
