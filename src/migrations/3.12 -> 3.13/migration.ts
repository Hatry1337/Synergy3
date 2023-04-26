import { Sequelize } from "sequelize-typescript";

import { StorageUserDiscordInfo as StorageUserDiscordInfo312 } from "./3.12/StorageUserDiscordInfo";
import { StorageUserEconomyInfo as StorageUserEconomyInfo312 } from "./3.12/StorageUserEconomyInfo";
import { StorageUser as StorageUser312 } from "./3.12/StorageUser";

import { StorageUserDiscordInfo as StorageUserDiscordInfo313 } from "./3.13/StorageUserDiscordInfo";
import { StorageUserEconomyInfo as StorageUserEconomyInfo313 } from "./3.13/StorageUserEconomyInfo";
import { StorageUser as StorageUser313 } from "./3.13/StorageUser";
import { RainbowBOTEpoch, UnifiedId, UnifiedIdDataType } from "../../UnifiedId";

const args = process.argv.slice(2);

(async () => {
    if(args.length < 2){
        console.log("Usage: node migration.js <input3.12> <output3.13>\n" +
                    "----------------------------------------------------------------\n" +
                    "<input3.12> - Sequelize database URI for Synergy 3.12 input database.\n" +
                    "<output3.13> - Sequelize database URI for Synergy 3.13 output database.\n" +
                    "----------------------------------------------------------------\n" +
                    "Options: --force - use force syncing (overwrites all tables in output database!)"
        );
        return process.exit(0);
    }

    const force = args.indexOf("--force") !== -1;

    let seq312 = new Sequelize(args[0], {
        models: [
            StorageUser312,
            StorageUserDiscordInfo312,
            StorageUserEconomyInfo312
        ],
        logging: false
    });

    let seq313 = new Sequelize(args[1], {
        models: [
            StorageUser313,
            StorageUserDiscordInfo313,
            StorageUserEconomyInfo313
        ],
        logging: false
    });

    await  seq312.sync();
    await  seq313.sync({ force });

    let offset = 0;
    let limit = 4000;

    let res = await StorageUser312.findAndCountAll({
        limit,
        offset,
        include: [StorageUserDiscordInfo312, StorageUserEconomyInfo312]
    });

    let i = 0;
    while (offset < res.count) {
        let transaction = await seq313.transaction();

        let usersOptions = [];
        let discordOptions = [];
        let economyOptions = [];

        for (let u of res.rows) {
            let unifiedId = UnifiedId.generate(UnifiedIdDataType.User, u.createdAt?.getTime() - RainbowBOTEpoch).toString(16);
            usersOptions.push({
                unifiedId,
                nickname: u.nickname,
                groups: u.groups,
                lang: u.lang,
                meta: u.meta,
                createdAt: u.createdAt,
            } as StorageUser313);

            if(u.discord) {
                discordOptions.push({
                    unifiedId,
                    discordId: u.discord.discordId,
                    discordTag: u.discord.discordTag,
                    discordAvatar: u.discord.discordAvatar,
                    discordBanner: u.discord.discordBanner,
                    discordCreatedAt: u.discord.discordCreatedAt,
                    createdAt: u.createdAt
                } as StorageUserDiscordInfo313);
            }

            if(u.economy) {
                economyOptions.push({
                    unifiedId,
                    economyPoints: u.economy.economyPoints,
                    economyLVL: u.economy.economyLVL,
                    economyXP: u.economy.economyXP,
                    createdAt: u.createdAt
                } as StorageUserEconomyInfo313);
            } else {
                economyOptions.push({
                    unifiedId,
                    economyPoints: 0.0005,
                    economyLVL: 1,
                    economyXP: 0,
                } as StorageUserEconomyInfo313);
            }
        }

        await StorageUser313.bulkCreate(usersOptions, { transaction });
        await StorageUserDiscordInfo313.bulkCreate(discordOptions, { transaction });
        await StorageUserEconomyInfo313.bulkCreate(economyOptions, { transaction });

        console.log(`${i}/${res.count}`);

        i += res.rows.length;
        offset += res.rows.length;

        res = await StorageUser312.findAndCountAll({
            limit,
            offset,
            include: [StorageUserDiscordInfo312, StorageUserEconomyInfo312]
        });
        await transaction.commit();
    }

    console.log(`${i}/${res.count}`);
    console.log("Migration complete!");
})();
