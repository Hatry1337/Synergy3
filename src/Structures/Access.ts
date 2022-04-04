import Discord from "discord.js";

export type AccessTarget = "admin" | "server_admin" | "server_mod" | "player" | "banned" | string;

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
    static PERM(perm: Discord.PermissionString){
        return "perm<" + perm + ">";
    }
    static PLAYER(): AccessTarget {
        return "player";
    }
    static BANNED(): AccessTarget {
        return "banned";
    }
    static GROUP(group: string): AccessTarget {
        return "group<" + group + ">";
    }
    static USER(user_id: number | string): AccessTarget {
        return "user<" + user_id.toString() + ">";
    }
}