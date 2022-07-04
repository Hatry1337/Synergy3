import Discord from "discord.js";
import { User } from "..";
import { GlobalLogger } from "..";

export type AccessTarget = "admin" | "server_admin" | "server_mod" | "player" | "banned" | `perm<${string}>` | `group<${string}>` | `user<${string}>` | `role<${string}>`;

export default class Access {
    static ADMIN(): AccessTarget {
        return "admin";
    }
    static SERVER_ADMIN(): AccessTarget {
        return "server_admin";
    }
    static SERVER_MOD(): AccessTarget {
        return "server_mod";
    }
    static PERM(perm: Discord.PermissionString): AccessTarget{
        return `perm<${perm}>`;
    }
    static PLAYER(): AccessTarget {
        return "player";
    }
    static BANNED(): AccessTarget {
        return "banned";
    }
    static GROUP(group: string): AccessTarget {
        return `group<${group}>`;
    }
    static USER(user_id: number | string): AccessTarget {
        return `user<${user_id.toString()}>`;
    }
    static ROLE(role_id: string): AccessTarget {
        return `role<${role_id}>`;
    }

    static async Check(user: User, targets: AccessTarget[], guild?: Discord.Guild){
        let access_flag = false;

        for(let a of targets){
            if(user.groups.includes("banned")){
                if(a.startsWith("banned")){
                    access_flag = true;
                }else{
                    access_flag = false;
                }
                continue;
            }
            if(a.startsWith("player")){
                access_flag = true;
                break;
            }
            if(a.startsWith("group")){
                let res = /group<(.*)>/.exec(a);
                if(!res || !res[1]){
                    GlobalLogger.root.warn("Access.Check: Passed invalid perm group target \"", a + "\"");
                    continue;
                }
                if(user.groups.includes(res[1])){
                    access_flag = true;
                    break;
                }
            }
            if(a.startsWith("user")){
                let res = /user<(.*)>/.exec(a);
                if(!res || !res[1]){
                    GlobalLogger.root.warn("Access.Check: Passed invalid user access target \"", a + "\"");
                    continue;
                }
                if(user.id.toString() === res[1] || user.discord.id === res[1]){
                    access_flag = true;
                    break;
                }
            }
            if(guild && a.startsWith("role")){
                let res = /role<(.*)>/.exec(a);
                if(!res || !res[1]){
                    GlobalLogger.root.warn("Access.Check: Passed invalid role access target \"", a + "\"");
                    continue;
                }
                let member = guild.members.cache.get(user.discord.id);
                if(member && member.roles.cache.has(res[1])){
                    access_flag = true;
                    break;
                }
            }
            if(guild && a.startsWith("perm")){
                let res = /perm<(.*)>/.exec(a);
                if(!res || !res[1]){
                    GlobalLogger.root.warn("Access.Check: Passed invalid perm access target \"", a + "\"");
                    continue;
                }

                let member = guild.members.cache.get(user.discord.id);
                if(member){
                    if(member.permissions.has(res[1] as Discord.PermissionResolvable)){
                        access_flag = true;
                        break;
                    }
                }
            }
            if(guild && a.startsWith("server_mod")){
                let member = guild.members.cache.get(user.discord.id);
                if(member){
                    let mod_role_id = (await user.bot.config.get("guild", "moderator_role"))[guild.id] as string | undefined;
                    if(mod_role_id && member.roles.cache.has(mod_role_id)){
                        access_flag = true;
                        break;
                    }
                }
            }
            if(guild && a.startsWith("server_admin")){
                let member = guild.members.cache.get(user.discord.id);
                if(member){
                    if(member.permissions.has("ADMINISTRATOR")){
                        access_flag = true;
                        break;
                    }
                }
            }
            if(a.startsWith("admin")){
                if(user.groups.includes("admin")){
                    access_flag = true;
                    break;
                }
            }
        }
        return access_flag;
    }
}