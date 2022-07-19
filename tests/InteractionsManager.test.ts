import Synergy from "../src/Synergy";
import InteractionsManager from "../src/InteractionsManager";
import Discord from "discord.js";
import Module from "../src/Modules/Module";
import Access from "../src/Structures/Access";
import { createDummyBOT } from "./DummyBOT";

let bot = createDummyBOT();

let test_module = new Module(bot, "module-uuid-test");

test("InteractionsManager - Create Manager", () => {
    let manager: InteractionsManager | undefined;
    try {
        manager = new InteractionsManager(bot as unknown as Synergy);
        bot.events.emit("Stop");
    } catch (error) {
        console.log(error);
    }
    
    expect(manager).toBeTruthy();
});

test("InteractionsManager - Create interactive button", () => {
    let manager = new InteractionsManager(bot as unknown as Synergy);
    let button = manager.createButton("test-button", [ Access.PLAYER() ], test_module);
    
    bot.events.emit("Stop");
    expect(manager.getComponent(button.name)).toBe(button);
});

test("InteractionsManager - Create temporary interactive button", () => {
    let manager = new InteractionsManager(bot as unknown as Synergy);
    let button = manager.createButton([ Access.PLAYER() ], test_module, 3);
    
    bot.events.emit("Stop");
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
        expect(manager.getComponent(button.name)).toBe(button); //Must not be deleted after any amount of interactions.
        console.log("Replied to interaction: ", options);
        return;
    }) as any;
    
    for(let i = 0; i < 50; i++){
        bot.client.emit("interactionCreate", int);
    }

    bot.events.emit("Stop");
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
        expect(manager.getComponent(button.name)).toBe(button);    
        console.log("Replied to interaction: ", options);
        return;
    }) as any;
    
    for(let i = 0; i < 3; i++){
        bot.client.emit("interactionCreate", int);
    }

    int.reply = (async (options: Discord.InteractionReplyOptions) => {
        expect(manager.getComponent(button.name)).toBeFalsy(); //Must work for 3 interactions and removed on 4th 
        console.log("Replied to interaction: ", options);
        return;
    }) as any;

    bot.client.emit("interactionCreate", int);

    bot.events.emit("Stop");
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
        expect(manager.getComponent(button.name)).toBe(button);
        console.log("Replied to interaction: ", options);
        return;
    }) as any;
    bot.client.emit("interactionCreate", int);

    await new Promise((res) => { setTimeout(res, 3000) });

    int.reply = (async (options: Discord.InteractionReplyOptions) => {
        expect(manager.getComponent(button.name)).toBeFalsy(); //Must work for 2 sec and removed on 3th 
        console.log("Replied to interaction: ", options);
        return;
    }) as any;
    bot.client.emit("interactionCreate", int);

    bot.events.emit("Stop");
});



//Interactive Select Menus
test("InteractionsManager - Create interactive select menu", () => {
    let manager = new InteractionsManager(bot as unknown as Synergy);
    let menu = manager.createSelectMenu("test-menu", [ Access.PLAYER() ], test_module);
    
    bot.events.emit("Stop");
    expect(manager.getComponent(menu.name)).toBe(menu);
});

test("InteractionsManager - Create temporary interactive select menu", () => {
    let manager = new InteractionsManager(bot as unknown as Synergy);
    let menu = manager.createSelectMenu([ Access.PLAYER() ], test_module, 3);
    
    bot.events.emit("Stop");
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
        bot.client.emit("interactionCreate", int);
    }

    expect(manager.getComponent(menu.name)).toBe(menu); //Must not be deleted after any amount of interactions.
    bot.events.emit("Stop");
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
        expect(manager.getComponent(menu.name)).toBe(menu);
        console.log("Replied to interaction: ", options);
        return;
    }) as any;
    
    for(let i = 0; i < 3; i++){
        bot.client.emit("interactionCreate", int);
    }

    int.reply = (async (options: Discord.InteractionReplyOptions) => {
        expect(manager.getComponent(menu.name)).toBeFalsy(); //Must work for 3 interactions and removed on 4th 
        console.log("Replied to interaction: ", options);
        return;
    }) as any;
    bot.client.emit("interactionCreate", int);

    bot.events.emit("Stop");
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
        expect(manager.getComponent(menu.name)).toBe(menu);
        console.log("Replied to interaction: ", options);
        return;
    }) as any;
    bot.client.emit("interactionCreate", int);

    await new Promise((res) => { setTimeout(res, 3000) });

    int.reply = (async (options: Discord.InteractionReplyOptions) => {
        expect(manager.getComponent(menu.name)).toBeFalsy(); //Must work for 2 sec and removed on 3th 
        console.log("Replied to interaction: ", options);
        return;
    }) as any;
    bot.client.emit("interactionCreate", int);

    bot.events.emit("Stop");
});