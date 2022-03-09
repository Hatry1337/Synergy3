import { Sequelize } from "sequelize-typescript";
import log4js from "log4js";

import { StorageGuild } from './Models/StorageGuild';
import { StorageUserDiscordInfo } from "./Models/StorageUserDiscordInfo";
import { StorageUserEconomyInfo } from "./Models/StorageUserEconomyInfo";
import { StorageModuleDataContainer } from "./Models/StorageModuleDataContainer";
import { StorageUser } from "./Models/StorageUser";

const logger = log4js.getLogger("database");

let seq: Sequelize;

export function initsequelize(dburi: string){
    seq = new Sequelize(dburi, {
        models: [
            StorageGuild,
            StorageUser,
            StorageUserDiscordInfo,
            StorageUserEconomyInfo,
            StorageModuleDataContainer,
        ],
        logging: (sql) => {
            logger.info(sql);
        }
    });
}

export function sequelize(){
    return seq;
}