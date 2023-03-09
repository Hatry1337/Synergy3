import Discord from "discord.js";

export type ConfigCommonDataType = "string" | "int" | "number" | "bool" | "object" | "channel" | "user" | "role" | "attachment";

export type TypeOfConfigDataType<T extends ConfigCommonDataType> =
    T extends "string"          ? string  :
    T extends "int"             ? number  :
    T extends "number"          ? number  :
    T extends "bool"            ? boolean :
    T extends "object"          ? object  :
    T extends "channel"         ? Discord.GuildChannel :
    T extends "user"            ? Discord.User         :
    T extends "role"            ? Discord.Role         :
    T extends "attachment"      ? Discord.Attachment   :
    unknown;