import Synergy from "../src/Synergy";
import InteractionsManager from "../src/InteractionsManager";
import Discord from "discord.js";
import Module from "../src/Modules/Module";
import Access from "../src/Structures/Access";
import { User } from "../src";

let stopCallback: () => any | undefined;
let interactionCallback: (interaction: Discord.Interaction) => Promise<void> | undefined;

let bot = {
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
                stopCallback = callback;
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
                interactionCallback = callback;
            }
        },
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
}

let test_module = new Module(bot as unknown as Synergy, "module-uuid-test");

test("InteractionsManager - Create Manager", () => {
    let manager: InteractionsManager | undefined;
    try {
        manager = new InteractionsManager(bot as unknown as Synergy);
        if(stopCallback){
            stopCallback();
        }
    } catch (error) {
        console.log(error);
    }
    
    expect(manager).toBeTruthy();
});

test("InteractionsManager - Create interactive button", () => {
    let manager = new InteractionsManager(bot as unknown as Synergy);
    let button = manager.createButton("test-button", [ Access.PLAYER() ], test_module);
    
    if(stopCallback){
        stopCallback();
    }
    expect(manager.getComponent(button.name)).toBe(button);
});

test("InteractionsManager - Create temporary interactive button", () => {
    let manager = new InteractionsManager(bot as unknown as Synergy);
    let button = manager.createButton([ Access.PLAYER() ], test_module, 3);
    
    if(stopCallback){
        stopCallback();
    }
    expect(manager.getComponent(button.name)).toBe(button);
});


test("InteractionsManager - Test normal interactive button deletion", async () => {
    let manager = new InteractionsManager(bot as unknown as Synergy);
    let button = manager.createButton("test-button1", [ Access.PLAYER() ], test_module);
    
    expect(manager.getComponent(button.name)).toBe(button);

    let int = Discord.ButtonInteraction.prototype;
    int.isMessageComponent = () => { return true };
    int.customId = button.name;
    int.user = { id: "888888888888" } as Discord.User;
    int.reply = (async (options: Discord.InteractionReplyOptions) => {
        console.log("Replied to interaction: ", options);
        return;
    }) as any;
    
    for(let i = 0; i < 50; i++){
        await interactionCallback(int);
    }

    expect(manager.getComponent(button.name)).toBe(button); //Must not be deleted after any amount of interactions.

    if(stopCallback){
        stopCallback();
    }
});

test("InteractionsManager - Test temporary interactive button deletion [IntLimit]", async () => {
    let manager = new InteractionsManager(bot as unknown as Synergy);
    let button = manager.createButton([ Access.PLAYER() ], test_module, 3);
    
    expect(manager.getComponent(button.name)).toBe(button);

    let int = Discord.ButtonInteraction.prototype;
    int.isMessageComponent = () => { return true };
    int.customId = button.name;
    int.user = { id: "888888888888" } as Discord.User;
    int.reply = (async (options: Discord.InteractionReplyOptions) => {
        console.log("Replied to interaction: ", options);
        return;
    }) as any;
    
    for(let i = 0; i < 3; i++){
        await interactionCallback(int);
    }

    expect(manager.getComponent(button.name)).toBe(button);

    await interactionCallback(int);

    expect(manager.getComponent(button.name)).toBeFalsy(); //Must work for 3 interactions and removed on 4th 

    if(stopCallback){
        stopCallback();
    }
});

test("InteractionsManager - Test temporary interactive button deletion [TimeLimit]", async () => {
    let manager = new InteractionsManager(bot as unknown as Synergy);
    let button = manager.createButton([ Access.PLAYER() ], test_module, -1, 2000);
    
    expect(manager.getComponent(button.name)).toBe(button);

    let int = Discord.ButtonInteraction.prototype;
    int.isMessageComponent = () => { return true };
    int.customId = button.name;
    int.user = { id: "888888888888" } as Discord.User;
    int.reply = (async (options: Discord.InteractionReplyOptions) => {
        console.log("Replied to interaction: ", options);
        return;
    }) as any;
    
    await interactionCallback(int);
    expect(manager.getComponent(button.name)).toBe(button);

    await new Promise((res) => { setTimeout(res, 3000) });

    await interactionCallback(int);
    expect(manager.getComponent(button.name)).toBeFalsy(); //Must work for 2 sec and removed on 3th 

    if(stopCallback){
        stopCallback();
    }
});



//Interactive Select Menus
test("InteractionsManager - Create interactive select menu", () => {
    let manager = new InteractionsManager(bot as unknown as Synergy);
    let menu = manager.createSelectMenu("test-menu", [ Access.PLAYER() ], test_module);
    
    if(stopCallback){
        stopCallback();
    }
    expect(manager.getComponent(menu.name)).toBe(menu);
});

test("InteractionsManager - Create temporary interactive select menu", () => {
    let manager = new InteractionsManager(bot as unknown as Synergy);
    let menu = manager.createSelectMenu([ Access.PLAYER() ], test_module, 3);
    
    if(stopCallback){
        stopCallback();
    }
    expect(manager.getComponent(menu.name)).toBe(menu);
});


test("InteractionsManager - Test normal interactive select menu deletion", async () => {
    let manager = new InteractionsManager(bot as unknown as Synergy);
    let menu = manager.createSelectMenu("test-menu1", [ Access.PLAYER() ], test_module);
    
    expect(manager.getComponent(menu.name)).toBe(menu);

    let int = Discord.SelectMenuInteraction.prototype;
    int.isMessageComponent = () => { return true };
    int.customId = menu.name;
    int.user = { id: "888888888888" } as Discord.User;
    int.reply = (async (options: Discord.InteractionReplyOptions) => {
        console.log("Replied to interaction: ", options);
        return;
    }) as any;
    
    for(let i = 0; i < 50; i++){
        await interactionCallback(int);
    }

    expect(manager.getComponent(menu.name)).toBe(menu); //Must not be deleted after any amount of interactions.

    if(stopCallback){
        stopCallback();
    }
});

test("InteractionsManager - Test temporary interactive select menu deletion [IntLimit]", async () => {
    let manager = new InteractionsManager(bot as unknown as Synergy);
    let menu = manager.createSelectMenu([ Access.PLAYER() ], test_module, 3);
    
    expect(manager.getComponent(menu.name)).toBe(menu);

    let int = Discord.SelectMenuInteraction.prototype;
    int.isMessageComponent = () => { return true };
    int.customId = menu.name;
    int.user = { id: "888888888888" } as Discord.User;
    int.reply = (async (options: Discord.InteractionReplyOptions) => {
        console.log("Replied to interaction: ", options);
        return;
    }) as any;
    
    for(let i = 0; i < 3; i++){
        await interactionCallback(int);
    }

    expect(manager.getComponent(menu.name)).toBe(menu);

    await interactionCallback(int);

    expect(manager.getComponent(menu.name)).toBeFalsy(); //Must work for 3 interactions and removed on 4th 

    if(stopCallback){
        stopCallback();
    }
});

test("InteractionsManager - Test temporary interactive select menu deletion [TimeLimit]", async () => {
    let manager = new InteractionsManager(bot as unknown as Synergy);
    let menu = manager.createSelectMenu([ Access.PLAYER() ], test_module, -1, 2000);
    
    expect(manager.getComponent(menu.name)).toBe(menu);

    let int = Discord.SelectMenuInteraction.prototype;
    int.isMessageComponent = () => { return true };
    int.customId = menu.name;
    int.user = { id: "888888888888" } as Discord.User;
    int.reply = (async (options: Discord.InteractionReplyOptions) => {
        console.log("Replied to interaction: ", options);
        return;
    }) as any;
    
    await interactionCallback(int);
    expect(manager.getComponent(menu.name)).toBe(menu);

    await new Promise((res) => { setTimeout(res, 3000) });

    await interactionCallback(int);
    expect(manager.getComponent(menu.name)).toBeFalsy(); //Must work for 2 sec and removed on 3th 

    if(stopCallback){
        stopCallback();
    }
});