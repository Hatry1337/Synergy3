import {Synergy, User} from "../src";
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
        fetchOne: (id: string) => {
            return new User(this as unknown as Synergy, {
                id: this.users.idFromDiscordId(id),
                nickname: "TestUser#1337",
                groups: [ "palayer" ],
                lang: "en",
                discordId: id,
                economy: {
                    points: 2,
                    xp: 0,
                    lvl: 1
                },
                discord: {
                    id,
                    tag: "TestUser#1337",
                    avatar: "https://cdn.discordapp.com/avatars/508637328349331462/ced8cce78f895423ffa0fda824697c2e.webp",
                    createdAt: new Date()
                }
            })
        },
        fetchBulk: (ids: string[]) => {
            return ids.map(id =>
                new User(this as unknown as Synergy, {
                    id: this.users.idFromDiscordId(id),
                    nickname: "TestUser#1337",
                    groups: [ "palayer" ],
                    lang: "en",
                    discordId: id,
                    economy: {
                        points: 2,
                        xp: 0,
                        lvl: 1
                    },
                    discord: {
                        id,
                        tag: "TestUser#1337",
                        avatar: "https://cdn.discordapp.com/avatars/508637328349331462/ced8cce78f895423ffa0fda824697c2e.webp",
                        createdAt: new Date()
                    }
                })
            );
        },
        get(id: string | string[]) {
            if(typeof id === "string"){
                return this.fetchOne(id);
            }else {
                return this.fetchBulk(id);
            }
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