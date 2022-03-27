# RainbowBOT Core

RainbowBOT Core - is a Discord BOT core with rich functionality. This core takes over many routine things like data storing, interactions and commands management, modularity and so on. When you use RainbowBOT Core all you need to do is writing `Modules` and define them in RainbowBOT constructor.
RainbowBOT Core uses Sequelize under the hood to store their and Modules' data. Tested on PostgreSQL and SQLite dialects, but must work on most supported dialects.
You can find documentation here: https://rainbowbot.xyz/docs and more practical examples in https://github.com/Hatry1337/RainbowBOT-Core/tree/master/src/Modules/Core

## Installation

```zsh
npm install rainbowbot-core
```

## Examples

This is the minimal Discord BOT built with RainbowBOT Core:
```ts
import Discord from "discord.js";
import { Module, RainbowBOT, CoreModules, ModuleUUIDPair } from "rainbowbot-core";
import MyModule from "./Modules/MyModule.ts"

const modules: ModuleUUIDPair[] = [
    { Module: CoreModules.Avatar,      UUID: "390cec87-b1db-52d9-8e55-de82530e380d"}, // All modules requires unique ids, 
    { Module: CoreModules.Config,      UUID: "ee285ab6-018a-5df2-8060-2504e14112b2"}, // so you can generate and read them
    { Module: CoreModules.Profile,     UUID: "37e0a335-4c46-541b-9afc-e6dd6dde1c95"}, // from external file, or just hardcore.
    { Module: CoreModules.RHelp,       UUID: "8209817a-753c-54e9-833b-bdff74fd9fa3"},
    { Module: MyModule,                UUID: "78dc809e-532c-58fa-aa8b-c14f7029f23a"}
]

const bot = new RainbowBOT({
    sequelizeURI: process.env.DBURI,                            // Sequelize initialization URI, see https://sequelize.org/master/manual/getting-started.html#connecting-to-a-database 
    masterGuildId: process.env.MASTER_GUILD,                    // BOT's master guild. Slash Commands will appear on this guild in development mode.
    moduleGlobalLoading: process.env.NODE_ENV === "production", // "Development mode", if you wanna publish your commands globally use true.
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
                    name: "RainbowBOT Core",
                }
            ]
        }
    }
}, modules);

(async () => {
    await bot.login(process.env.TOKEN);
})();
```

This is the example of RainbowBOT Core Module:
```ts
import Discord from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Colors, Module, RainbowBOT, Utils }  from "rainbowbot-core";

export default class MyModule extends Module{
    public Name:        string = "MyModule";
    public Usage:       string = "`Usage of MyModule`";
    public Description: string = "Using this module you can do something.";
    public Category:    string = "Info";
    public Author:      string = "Thomasss#9258";

    constructor(bot: RainbowBOT, UUID: string) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createCommand("helloworld", this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
                .setDescription(this.Description)
                .onExecute(this.Run.bind(this))
                .commit()
        );
    }
    
    public Run(interaction: Discord.CommandInteraction){
        return new Promise<void>(async (resolve, reject) => {
            return resolve(await interaction.reply("Hello and Welcome to RainbowBOT Core!").catch(reject));
        });
    }
}

```