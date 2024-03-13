import { Sequelize } from "sequelize-typescript";

import { StorageUserDiscordInfo as StorageUserDiscordInfo38 } from "./3.8/StorageUserDiscordInfo";
import { StorageUserEconomyInfo as StorageUserEconomyInfo38 } from "./3.8/StorageUserEconomyInfo";
import { StorageUser as StorageUser38 } from "./3.8/StorageUser";

import { StorageUserDiscordInfo as StorageUserDiscordInfo39 } from "./3.9/StorageUserDiscordInfo";
import { StorageUserEconomyInfo as StorageUserEconomyInfo39 } from "./3.9/StorageUserEconomyInfo";
import { StorageUser as StorageUser39 } from "./3.9/StorageUser";

const args = process.argv.slice(2);

(async () => {
    if(args.length < 2){
        console.log("Usage: node migration.js <input3.8> <output3.9>\n" +
                    "----------------------------------------------------------------\n" +
                    "<input3.8> - Sequelize database URI for Synergy 3.8 input database.\n" +
                    "<output3.9> - Sequelize database URI for Synergy 3.9 output database.\n" +
                    "----------------------------------------------------------------\n" +
                    "Options: --force - use force syncing (overwrites all tables in output database!)"
        );
        return process.exit(0);
    }

    const force = args.indexOf("--force") !== -1;

    let seq38 = new Sequelize(args[0], {
        models: [
            StorageUser38,
            StorageUserDiscordInfo38,
            StorageUserEconomyInfo38
        ],
        logging: false
    });

    let seq39 = new Sequelize(args[1], {
        models: [
            StorageUser39,
            StorageUserDiscordInfo39,
            StorageUserEconomyInfo39
        ],
        logging: false
    });

    await  seq38.sync();
    await  seq39.sync({ force });

    let offset = 0;
    let limit = 1000;

    let res = await StorageUser38.findAndCountAll({
        limit,
        offset,
        include: [StorageUserDiscordInfo38, StorageUserEconomyInfo38]
    });

    let i = 0;
    while (offset <= res.count) {
        let transaction = await seq39.transaction();
        for(let u of res.rows) {
            await StorageUser39.create({
                id: u.id,
                nickname: u.nickname,
                discordId: u.discord.discordId,
                groups: u.groups,
                lang: u.lang,
                meta: u.meta
            }, { transaction });

            let di39 = await StorageUserDiscordInfo39.create({
                id: u.discord.id,
                discordId: u.discord.discordId,
                discordTag: u.discord.discordTag,
                discordAvatar: u.discord.discordAvatar,
                discordBanner: u.discord.discordBanner,
                discordCreatedAt: u.discord.discordCreatedAt
            }, { transaction });

            let ei39 = await StorageUserEconomyInfo39.create({
                id: u.economy.id,
                economyPoints: u.economy.economyPoints,
                economyLVL: u.economy.economyLVL,
                economyXP: u.economy.economyXP
            }, { transaction });

            console.log(`${i}/${res.count}`);
            i++;
        }
        offset += res.count;

        res = await StorageUser38.findAndCountAll({
            limit,
            offset,
            include: [StorageUserDiscordInfo38, StorageUserEconomyInfo38]
        });
        await transaction.commit();
    }

    console.log("Migration complete!");
})();
