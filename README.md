# Synergy 3
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/Hatry1337/Synergy3/Run%20Tests)
![NPM](https://img.shields.io/npm/l/synergy3?color=blue)
![npm](https://img.shields.io/npm/dw/synergy3?label=npm%20downloads)

![npms.io (final)](https://img.shields.io/npms-io/quality-score/synergy3)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/Hatry1337/Synergy3.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Hatry1337/Synergy3/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/Hatry1337/Synergy3.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Hatry1337/Synergy3/context:javascript)

Synergy 3 - is rich, powerful and flexible Discord BOT framework.

Synergy is Interaction-Based framework, it takes over interactions management, processing and event delivery to your modules. Synergy have its own Data Storage based on Sequelize and PostgreSQL (also works with SQLite, but not tested well), it uses it for internal needs and also provides Universal Data Storage for Modules (UDSM data is serialized to JSONB, so keep in mind JSONB limits).

You can find API refference here: https://rainbowbot.xyz/docs

## Installation

```zsh
npm install synergy3
```

## Creating BOT

Creating of your BOT is very simple with Synergy:
```ts
//Typescript

import Discord from "discord.js";
import { Module, Synergy, ModuleUUIDPair } from "synergy3";

const modules: ModuleUUIDPair[] = [];

const bot = new RainbowBOT({
    sequelizeURI: process.env.DBURI,                            // Sequelize initialization URI, see https://sequelize.org/master/manual/getting-started.html#connecting-to-a-database 
    masterGuildId: process.env.MASTER_GUILD,                    // BOT's master guild. Slash Commands will appear on this guild in development mode.
    moduleGlobalLoading: process.env.NODE_ENV === "production", // "Development mode", if you wanna publish your commands globally use true.
    dataSyncDelay: 60,                                          // How often Synergy need to save UDSM and other data to Database Storage. (seconds)
    clientOptions: {                                            // Standard Discord.js Client options, see https://discord.js.org/#/docs/discord.js/stable/typedef/ClientOptions
        intents: [
            Discord.Intents.FLAGS.DIRECT_MESSAGES,
            Discord.Intents.FLAGS.GUILDS,
            Discord.Intents.FLAGS.GUILD_MESSAGES,
            Discord.Intents.FLAGS.GUILD_MEMBERS,
        ],
        presence: {
            status: "online",
            activities: [
                {
                    type: "PLAYING",
                    name: "Synergy 3 BOT Framework",
                }
            ]
        }
    }
}, modules);

(async () => {
    await bot.login(process.env.TOKEN); // Your Discord BOT token.
})();
```

After that you have working BOT without any functionality. So to add them you need to [create](#creating-module) and/or [connect](#connect-modules) modules.

## Creating Module

To add new functionality for Synergy you need to create module(s). Modules are extending base class `Module` and implements some required stuff:
```ts
//Typescript

import Discord from "discord.js";
import { Module, Synergy, Access } from "synergy3";

export default class UsefulModule extends Module{
    public Name:        string = "UsefulModule";        // Name of the module. Try to keep this same as your module's class name.
    public Description: string = "Very useful module."; // Describe your module. Put here what it does, what is help command and etc.
    public Category:    string = "Other";               // Module category. Basically it can be any. Usually I use `Utility, Moderation, BOT, Info, Fun and etc.`
    public Author:      string = "Thomasss#9258";       // Author of the module. Your name, nick, discord tag or anything else. 

    public Access: string[] = [ Access.PLAYER() ]       // Array of Access subjects that have access to this module.

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
    }
}
```

Yay! You are created your first Synergy Module. Next we need to add Commands to our module to interact with users.

## Creating Commands

So, we have a module. Now let's add some commands! 

`Module` class have field `SlashCommands`. This is an array with all the slash commands that your module creates. In fact, this is not necessary to add all your slash commands to this array, but this help other modules to know what commands your one creates. Help others, add your Slash Commands to `SlashCommands` array!

To create new Slash command you just need to call `Synergy.interactions.createSlashCommand()`. This gives you builder and you can configure your slash command like you do in pure Discord.js.
```ts
//Typescript

import Discord from "discord.js";
import { Module, Synergy, Access, User } from "synergy3";

export default class UsefulModule extends Module{
    public Name:        string = "UsefulModule";        // Name of the module. Try to keep this same as your module's class name.
    public Description: string = "Very useful module."; // Describe your module. Put here what it does, what is help command and etc.
    public Category:    string = "Other";               // Module category. Basically it can be any. Usually I use `Utility, Moderation, BOT, Info, Fun and etc.`
    public Author:      string = "Thomasss#9258";       // Author of the module. Your name, nick, discord tag or anything else. 

    public Access: string[] = [ Access.PLAYER() ]       // Array of Access subjects that have access to this module.

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);

        this.SlashCommands.push(
            // 1 argument is name of your command. In discord it will appears like "/usefulmodule" (only lowercase, keep in mind!)
            // 2 argumes is access subjects that can use this command. By default I recomend to put your module's access, but you can use different ones for each command.
            // 3 argument is instance of your module
            // 4 argument is guild id where to publish your command. If not provided, command will be published globally.
            this.bot.interactions.createSlashCommand(this.Name.toLowerCase(), this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder // Just normal builder of slash command from Discord.js
                .setDescription(this.Description)
                .addUserOption(opt => opt
                    .setName("my_cool_arg")
                    .setDescription("This argument can do useful stuff!")
                    .setRequired(false)
                )
            )
            .onExecute(this.Run.bind(this)) // This method binds your command to specified callback function.
            .commit() // This method marks your command as "ready to publish", later it will be published automatically.
        );
    }

    // This is your callback function that you are binded before. It will be called when user executes your command.
    public async Run(interaction: Discord.CommandInteraction, user: User){
        await interaction.reply("Hello, Synergy!");
    }
}
```

## Connect Modules
Cool! You are created your first Synergy module! Now let's connect them to BOT and see what happened. To connect your module you just need to add new entry to `modules` array:
```ts
//Typescript

import Discord from "discord.js";
import { Module, Synergy, ModuleUUIDPair } from "synergy3";
import UsefulModule from "./UsefulModule";

const modules: ModuleUUIDPair[] = [
    // Module it is your module's class, UUID is unique identifier of your module. Put here some random string, or as preferred, GUID. In future it will be automatically.
    { Module: UsefulModule, UUID: "6477771e-50ae-538b-91a2-67055e88c558"},
]

const bot = new RainbowBOT({
    sequelizeURI: process.env.DBURI,                            // Sequelize initialization URI, see https://sequelize.org/master/manual/getting-started.html#connecting-to-a-database 
    masterGuildId: process.env.MASTER_GUILD,                    // BOT's master guild. Slash Commands will appear on this guild in development mode.
    moduleGlobalLoading: process.env.NODE_ENV === "production", // "Development mode", if you wanna publish your commands globally use true.
    dataSyncDelay: 60,                                          // How often Synergy need to save UDSM and other data to Database Storage. (seconds)
    clientOptions: {                                            // Standard Discord.js Client options, see https://discord.js.org/#/docs/discord.js/stable/typedef/ClientOptions
        intents: [
            Discord.Intents.FLAGS.DIRECT_MESSAGES,
            Discord.Intents.FLAGS.GUILDS,
            Discord.Intents.FLAGS.GUILD_MESSAGES,
            Discord.Intents.FLAGS.GUILD_MEMBERS,
        ],
        presence: {
            status: "online",
            activities: [
                {
                    type: "PLAYING",
                    name: "Synergy 3 BOT Framework",
                }
            ]
        }
    }
}, modules);

(async () => {
    await bot.login(process.env.TOKEN); // Your Discord BOT token.
})();
```

Now you have working BOT with your own module! Also you can connect built-in Synergy Core modules:
```ts
//Typescript

import Discord from "discord.js";
import { Module, Synergy, ModuleUUIDPair, CoreModules } from "synergy3";
import UsefulModule from "./UsefulModule";

const modules: ModuleUUIDPair[] = [
    // Module it is your module's class, UUID is unique identifier of your module. Put here some random string, or as preferred, GUID. In future it will be automatically.
    { Module: UsefulModule,        UUID: "6477771e-50ae-538b-91a2-67055e88c558"},
    { Module: CoreModules.Avatar,  UUID: "d5cdd2e4-52dd-5fb5-a11b-2187457695bd"}, 
    { Module: CoreModules.Config,  UUID: "a73b06d4-2d5d-565d-9a03-60389bd64423"},
    { Module: CoreModules.Profile, UUID: "25258bec-2a6b-56e2-9315-8d6a7a16dff8"},
    { Module: CoreModules.RHelp,   UUID: "4b5b54e1-c904-5adc-a1b1-da1296298936"},
]

const bot = new RainbowBOT({
    sequelizeURI: process.env.DBURI,                            // Sequelize initialization URI, see https://sequelize.org/master/manual/getting-started.html#connecting-to-a-database 
    masterGuildId: process.env.MASTER_GUILD,                    // BOT's master guild. Slash Commands will appear on this guild in development mode.
    moduleGlobalLoading: process.env.NODE_ENV === "production", // "Development mode", if you wanna publish your commands globally use true.
    dataSyncDelay: 60,                                          // How often Synergy need to save UDSM and other data to Database Storage. (seconds)
    clientOptions: {                                            // Standard Discord.js Client options, see https://discord.js.org/#/docs/discord.js/stable/typedef/ClientOptions
        intents: [
            Discord.Intents.FLAGS.DIRECT_MESSAGES,
            Discord.Intents.FLAGS.GUILDS,
            Discord.Intents.FLAGS.GUILD_MESSAGES,
            Discord.Intents.FLAGS.GUILD_MEMBERS,
        ],
        presence: {
            status: "online",
            activities: [
                {
                    type: "PLAYING",
                    name: "Synergy 3 BOT Framework",
                }
            ]
        }
    }
}, modules);

(async () => {
    await bot.login(process.env.TOKEN); // Your Discord BOT token.
})();
```