import RainbowBOT, { ModuleUUIDPair } from "../src/RainbowBOT";
import Discord from "discord.js";
import CoreModules from "../src/Modules/Core";

test("RainbowBOT - login", async () => {
    
    const modules: ModuleUUIDPair[] = [
        { Module: CoreModules.Avatar,      UUID: "390cec87-b1db-52d9-8e55-de82530e380d"}, 
        { Module: CoreModules.Config,      UUID: "ee285ab6-018a-5df2-8060-2504e14112b2"}, 
        { Module: CoreModules.Profile,     UUID: "37e0a335-4c46-541b-9afc-e6dd6dde1c95"},
        { Module: CoreModules.RHelp,       UUID: "8209817a-753c-54e9-833b-bdff74fd9fa3"}
    ]
    
    const bot = new RainbowBOT({
        sequelizeURI: process.env.DATABASE_URI as string,
        masterGuildId: process.env.MASTER_GUILD_ID as string,
        moduleGlobalLoading: false,
        clientOptions: {
            intents: [
                Discord.Intents.FLAGS.DIRECT_MESSAGES,
                Discord.Intents.FLAGS.GUILDS,
                Discord.Intents.FLAGS.GUILD_MESSAGES,
                Discord.Intents.FLAGS.GUILD_MEMBERS
            ],
            presence: {
                status: "online",
                activities: [
                    {
                        type: "PLAYING",
                        name: "RainbowBOT Core Unit Testing",
                    }
                ]
            }
        }
    }, modules);
    bot.login(process.env.DISCORD_TOKEN as string);
    await new Promise<void>(resolve => bot.events.once("Initialized", resolve));
    expect(bot.isReady).toBeTruthy();
}, 60000);