import { Synergy, User } from "../src";
import Discord from "discord.js";
import EventEmitter from "events";

class DummyClient extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(100);
    }
    public isReady() { return true };
    public application = {
        id: "777777777777"
    };
    public users =  {
        fetch: (id: string) => {
            return {
                id,
                tag: "TestUser#1337",
                avatar: "https://cdn.discordapp.com/avatars/508637328349331462/ced8cce78f895423ffa0fda824697c2e.webp",
                createdAt: new Date(),
                displayAvatarURL: () => "https://cdn.discordapp.com/avatars/508637328349331462/ced8cce78f895423ffa0fda824697c2e.webp"
            }
        }
    };

}

class DummyBOT {
    public options = {
        dataSyncDelay: 10000
    };
    public isReady = true;
    public users = {
        idFromDiscordId: (id: string) => { return 1337 },
        fetchOne: (id: number) => {
            return new User(this as unknown as Synergy, {
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
    };
    public events = new EventEmitter();
    public client = new DummyClient();
    public rest = {
        put: async (...args: any[]) => { console.log("[InteractionsManagerTest]", "REST PUT request called: ", args) },
        patch: async (...args: any[]) => { console.log("[InteractionsManagerTest]", "REST PATCH request called: ", args) },
        post: async (...args: any[]) => { console.log("[InteractionsManagerTest]", "REST POST request called: ", args) },
        get: async (...args: any[]) => { console.log("[InteractionsManagerTest]", "REST GET request called: ", args) }
    };
    public config = {
        get: async (...args: any[]) => { console.log("[InteractionsManagerTest]", "config.get called: ", args); return undefined },
    }
}

export function createDummyBOT(){
    return new DummyBOT() as unknown as Synergy;
}