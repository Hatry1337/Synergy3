require("dotenv").config("../.env");
const Discord = require("discord.js");
const { Module, RainbowBOT, CoreModules } = require("..");

class TestMod extends Module{
    Name         = "TestMod";
    Usage        = "test";
    Description  = "test";
    Category     = "BOT";
    Author       = "Thomasss#9258";

    constructor(bot, UUID) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createCommand("testbtn", this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
                .setDescription(this.Description)
                .onExecute(this.Run.bind(this))
                .commit()
        );
    }
    
    Run(interaction){
        return new Promise(async (resolve, reject) => {
            let btn = this.bot.interactions.createButton().setLabel("test").setStyle("PRIMARY");
            btn.onClick(async (int) => {
                btn.destroy();
                await int.reply("clicked. button removed.");
            });
            return resolve(await interaction.reply({content: "test123", components: [ 
                new Discord.MessageActionRow().addComponents(btn) ]}).catch(reject));
        });
    }
}

const modules = [
    { Module: CoreModules.Avatar,      UUID: "390cec87-b1db-52d9-8e55-de82530e380d"}, // All modules requires unique ids, 
    { Module: CoreModules.Config,      UUID: "ee285ab6-018a-5df2-8060-2504e14112b2"}, // so you can generate and read them
    { Module: CoreModules.Profile,     UUID: "37e0a335-4c46-541b-9afc-e6dd6dde1c95"}, // from external file, or just hardcode.
    { Module: CoreModules.RHelp,       UUID: "8209817a-753c-54e9-833b-bdff74fd9fa3"},
    { Module: TestMod,                 UUID: "78dc809e-532c-58fa-aa8b-c14f7029f23a"}
]

const bot = new RainbowBOT({
    sequelizeURI: process.env.DATABASE_URI,                            // Sequelize initialization URI, see https://sequelize.org/master/manual/getting-started.html#connecting-to-a-database 
    masterGuildId: process.env.MASTER_GUILD_ID,                        // BOT's master guild. Slash Commands will appear on this guild in development mode.
    moduleGlobalLoading: process.env.NODE_ENV === "production",        // "Development mode", if you wanna publish your commands globally use true.
    clientOptions: {                                                   // Standard Discord.js Client options, see https://discord.js.org/#/docs/discord.js/stable/typedef/ClientOptions
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
    await bot.login(process.env.DISCORD_TOKEN);
})();