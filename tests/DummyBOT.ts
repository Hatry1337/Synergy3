import { Synergy, User } from "../src";
import Discord from "discord.js";

interface CustomCallbacks {
    stopCallback: () => any | undefined;
    interactionCallback: (interaction: Discord.Interaction) => Promise<void> | undefined;
}

export function createDummyBOT(){
    let bot = {
        callbacks: {},

        options: {
            dataSyncDelay: 10000
        },
        isReady: true,
        users: {
            idFromDiscordId: (id: string) => { return 1337 },
            fetchOne: (id: number) => {
                return new User(bot as Synergy, {
                    id,
                    nickname: "TestUser#1337",
                    groups: [ "palayer" ],
                    lang: "en",
                    economy: {
                        points: 2,
                        xp: 0,
                        lvl: 1
                    },
                    discord: {
                        id: "888888888888",
                        tag: "TestUser#1337",
                        avatar: "https://cdn.discordapp.com/avatars/508637328349331462/ced8cce78f895423ffa0fda824697c2e.webp",
                        createdAt: new Date()
                    }
                })
            }
        },
        events: {
            once: (event: string, callback: () => any) => {
                console.log("[InteractionsManagerTest]", "events.once called: ", event, callback);
                if(event === "Stop"){
                    bot.callbacks.stopCallback = callback;
                }
            },
        },
        client: {
            isReady: () => { return true },
            application: {
                id: "777777777777"
            },
            on: (event: string, callback: () => any) => { 
                console.log("[InteractionsManagerTest]", "client.on called: ", event, callback);
                if(event === "interactionCreate"){
                    bot.callbacks.interactionCallback = callback;
                }
            },
            users: {
                fetch: (id: string) => {
                    return {
                        id,
                        tag: "TestUser#1337",
                        avatar: "https://cdn.discordapp.com/avatars/508637328349331462/ced8cce78f895423ffa0fda824697c2e.webp",
                        createdAt: new Date(),
                        displayAvatarURL: () => "https://cdn.discordapp.com/avatars/508637328349331462/ced8cce78f895423ffa0fda824697c2e.webp"
                    }
                }
            }
        },
        rest: {
            put: async (...args: any[]) => { console.log("[InteractionsManagerTest]", "REST PUT request called: ", args) },
            patch: async (...args: any[]) => { console.log("[InteractionsManagerTest]", "REST PATCH request called: ", args) },
            post: async (...args: any[]) => { console.log("[InteractionsManagerTest]", "REST POST request called: ", args) },
            get: async (...args: any[]) => { console.log("[InteractionsManagerTest]", "REST GET request called: ", args) }
        },
        config: {
            get: async (...args: any[]) => { console.log("[InteractionsManagerTest]", "config.get called: ", args); return undefined },
        }
    } as unknown as (Synergy & { callbacks: CustomCallbacks });

    return bot;
}