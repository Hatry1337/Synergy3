import { initsequelize, sequelize } from "../src/Database";
import { StorageUserDiscordInfo } from "../src/Models/StorageUserDiscordInfo";
import { StorageUserEconomyInfo } from "../src/Models/StorageUserEconomyInfo";
import { createDummyBOT } from "./DummyBOT";
import crypto from "crypto";
import { StorageUser } from "../src/Models/StorageUser";
import UserManager from "../src/UserManager";

test("UserManager - Test ids associations", async () => {
    let bot = createDummyBOT();

    initsequelize("sqlite:database.sqlite");
    await sequelize().sync({ force: true });

    let ids: Map<string, string> = new Map();

    for(let i = 0; i < 100; i++){
        let d_id = crypto.pseudoRandomBytes(12).toString("hex");

        try {
            let user = await StorageUser.create({
                nickname: `TestUser#${i}`,
                groups: [ "player" ],
                lang: "en",
            } as StorageUser);
            let economy = await StorageUserEconomyInfo.create({
                unifiedId: user.unifiedId,
                economyPoints: 1337,
                economyLVL: 69,
                economyXP: 420,
            } as StorageUserEconomyInfo);
            let discord = await StorageUserDiscordInfo.create({
                unifiedId: user.unifiedId,
                discordId: d_id,
                discordTag: `TestUser#${i}`,
                discordCreatedAt: new Date(),
            } as StorageUserDiscordInfo);
            
            ids.set(d_id, user.unifiedId);
        } catch (error) {
            return console.log(error);
        }
    }

    let umgr = new UserManager(bot);
    await umgr.updateAssociations();

    for(let e of ids){
        let id = umgr.unifiedIdFromDiscordId(e[0]);
        expect(id).toBe(e[1]);
    }

    bot.events.emit("Stop");
});

test("UserManager - fetchOne", async () => {
    let bot = createDummyBOT();

    initsequelize("sqlite::memory:");
    await sequelize().sync({ force: true });

    let ids: Map<string, string> = new Map();

    for(let i = 0; i < 100; i++){
        let d_id = crypto.pseudoRandomBytes(12).toString("hex");

        try {
            let user = await StorageUser.create({
                nickname: `TestUser#${i}`,
                groups: [ "player" ],
                lang: "en",
            } as StorageUser);
            let economy = await StorageUserEconomyInfo.create({
                unifiedId: user.unifiedId,
                economyPoints: 1337,
                economyLVL: 69,
                economyXP: 420,
            } as StorageUserEconomyInfo);
            let discord = await StorageUserDiscordInfo.create({
                unifiedId: user.unifiedId,
                discordId: d_id,
                discordTag: `TestUser#${i}`,
                discordCreatedAt: new Date(),
            } as StorageUserDiscordInfo);
            
            ids.set(d_id, user.unifiedId);
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
        expect(user.unifiedId).toBe(e[1]);
        expect(user.discord?.id).toBe(e[0]);
    }

    bot.events.emit("Stop");
});

test("UserManager - fetchBulk", async () => {
    let bot = createDummyBOT();

    initsequelize("sqlite::memory:");
    await sequelize().sync({ force: true });

    let ids: Map<string, string> = new Map();

    for(let i = 0; i < 100; i++){
        let d_id = crypto.pseudoRandomBytes(12).toString("hex");

        try {
            let user = await StorageUser.create({
                nickname: `TestUser#${i}`,
                groups: [ "player" ],
                lang: "en",
            } as StorageUser);
            let economy = await StorageUserEconomyInfo.create({
                unifiedId: user.unifiedId,
                economyPoints: 1337,
                economyLVL: 69,
                economyXP: 420,
            } as StorageUserEconomyInfo);
            let discord = await StorageUserDiscordInfo.create({
                unifiedId: user.unifiedId,
                discordId: d_id,
                discordTag: `TestUser#${i}`,
                discordCreatedAt: new Date(),
            } as StorageUserDiscordInfo);
            
            ids.set(d_id, user.unifiedId);
        } catch (error) {
            return console.log(error);
        }
    }

    let umgr = new UserManager(bot);
    await umgr.updateAssociations();

    let users = await umgr.fetchBulk(Array.from(ids.values()));

    expect(users.size).toBe(ids.size);

    for(let u of users.values()){
        expect(u).toBeTruthy();
        expect(ids.get(u.discord!.id)).toBe(u.unifiedId);
    }

    bot.events.emit("Stop");
}, 15000);