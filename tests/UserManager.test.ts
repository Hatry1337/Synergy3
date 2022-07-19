import { initsequelize, sequelize } from "../src/Database";
import { StorageUserDiscordInfo } from "../src/Models/StorageUserDiscordInfo";
import { StorageUserEconomyInfo } from "../src/Models/StorageUserEconomyInfo";
import { createDummyBOT } from "./DummyBOT";
import crypto from "crypto";
import { StorageUser } from "../src/Models/StorageUser";
import UserManager from "../src/UserManager";


test("UserManager - Test ids associations", async () => {
    let bot = createDummyBOT();

    initsequelize("sqlite::memory:");
    await sequelize().sync({ force: true });

    let ids: Map<string, number> = new Map();

    for(let i = 0; i < 100; i++){
        let d_id = crypto.pseudoRandomBytes(12).toString("hex");

        try {
            let user = await StorageUser.create({
                nickname: `TestUser#${i}`,
                groups: [ "player" ],
                lang: "en",
            });
            let economy = await StorageUserEconomyInfo.create({
                id: user.id,
                economyPoints: 1337,
                economyLVL: 69,
                economyXP: 420,
            });
            let discord = await StorageUserDiscordInfo.create({
                id: user.id,
                discordId: d_id,
                discordTag: `TestUser#${i}`,
                discordAvatar: `https://cdn.discordapp.com/avatars/508637328349331462/ced8cce78f895423ffa0fda824697c2e.webp`,
                discordCreatedAt: new Date(),
            });
            
            ids.set(d_id, user.id);
        } catch (error) {
            return console.log(error);
        }
    }

    let umgr = new UserManager(bot);
    await umgr.updateAssociations();

    for(let e of ids){
        let id = umgr.idFromDiscordId(e[0]);
        expect(id).toBe(e[1]);
    }
});

test("UserManager - fetchOne", async () => {
    let bot = createDummyBOT();

    initsequelize("sqlite::memory:");
    await sequelize().sync({ force: true });

    let ids: Map<string, number> = new Map();

    for(let i = 0; i < 100; i++){
        let d_id = crypto.pseudoRandomBytes(12).toString("hex");

        try {
            let user = await StorageUser.create({
                nickname: `TestUser#${i}`,
                groups: [ "player" ],
                lang: "en",
            });
            let economy = await StorageUserEconomyInfo.create({
                id: user.id,
                economyPoints: 1337,
                economyLVL: 69,
                economyXP: 420,
            });
            let discord = await StorageUserDiscordInfo.create({
                id: user.id,
                discordId: d_id,
                discordTag: `TestUser#${i}`,
                discordAvatar: `https://cdn.discordapp.com/avatars/508637328349331462/ced8cce78f895423ffa0fda824697c2e.webp`,
                discordCreatedAt: new Date(),
            });
            
            ids.set(d_id, user.id);
        } catch (error) {
            return console.log(error);
        }
    }

    let umgr = new UserManager(bot);
    await umgr.updateAssociations();

    for(let e of ids){
        let user = await umgr.fetchOne(e[1]);
        if(!user) return fail(`User ${e} failed to fetch.`);

        expect(user).toBeTruthy();
        expect(user.id).toBe(e[1]);
        expect(user.discord.id).toBe(e[0]);
    }
});

test("UserManager - fetchBulk", async () => {
    let bot = createDummyBOT();

    initsequelize("sqlite::memory:");
    await sequelize().sync({ force: true });

    let ids: Map<string, number> = new Map();

    for(let i = 0; i < 100; i++){
        let d_id = crypto.pseudoRandomBytes(12).toString("hex");

        try {
            let user = await StorageUser.create({
                nickname: `TestUser#${i}`,
                groups: [ "player" ],
                lang: "en",
            });
            let economy = await StorageUserEconomyInfo.create({
                id: user.id,
                economyPoints: 1337,
                economyLVL: 69,
                economyXP: 420,
            });
            let discord = await StorageUserDiscordInfo.create({
                id: user.id,
                discordId: d_id,
                discordTag: `TestUser#${i}`,
                discordAvatar: `https://cdn.discordapp.com/avatars/508637328349331462/ced8cce78f895423ffa0fda824697c2e.webp`,
                discordCreatedAt: new Date(),
            });
            
            ids.set(d_id, user.id);
        } catch (error) {
            return console.log(error);
        }
    }

    let umgr = new UserManager(bot);
    await umgr.updateAssociations();

    let users = await umgr.fetchBulk(Array.from(ids.values()));

    expect(users.length).toBe(ids.size);

    for(let u of users){
        expect(u).toBeTruthy();
        expect(ids.get(u.discord.id)).toBe(u.id);
    }
});