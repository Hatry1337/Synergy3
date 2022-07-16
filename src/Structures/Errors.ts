import { User } from "..";
import Discord from "discord.js";
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
        super(`Error: User ${user instanceof Discord.User ? user.tag : user.nickname}(${user.id}) already exist.`);
    }
}