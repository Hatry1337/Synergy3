import { User } from "..";
import Discord from "discord.js";
import Guild from "./Guild";
export class SynergyUserError extends Error {
    public subMessage?: string;
    constructor(message: string, subMessage?: string){
        super();
        this.message = message;
        this.subMessage = subMessage;
    }
}

export class GuildOnlyError extends SynergyUserError {
    constructor(){
        super("This command is Guild-Only.");
    }
}

export class NoConfigEntryError extends SynergyUserError {
    constructor(public name: string, public conf_cmd: string){
        super(`${name} is not configured.`, `Configure them with command \`\`\`${conf_cmd}\`\`\``);
    }
}

export class MissingPermissionsError extends SynergyUserError {
    constructor(){
        super("You don't have permissions to use this command.");
    }
}

export class UserAlreadyExistError extends Error {
    constructor(user: User | Discord.User){
        super(`Error: User ${user instanceof Discord.User ? `${user.tag}(${user.id})` : `${user.nickname}(${user.unifiedId})`} already exist.`);
    }
}

export class GuildAlreadyExistError extends Error {
    constructor(guild: Guild | Discord.Guild){
        super(`Error: Guild ${guild.name}(${guild.id}) already exist.`);
    }
}