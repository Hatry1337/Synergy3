require("dotenv").config("../.env");

const Discord = require("discord.js");

const { Module, Synergy, CoreModules, GuildOnlyError, NoConfigEntryError, EphemeralConfigEntry, EphemeralArrayConfigEntry } = require("..");

class TestMod extends Module{
    Name         = "TestMod";
    Description  = "test";
    Category     = "BOT";
    Author       = "Thomasss#9258";
    Access       = [ "admin", "user<508637328349331462>" ];

    constructor(bot, UUID) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createSlashCommand("testmod", this.Access, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder
                .setDescription(this.Description)
                .addSubcommand(opt => opt
                    .setName("btn")
                    .setDescription("Test the button.")    
                )
                .addSubcommand(opt => opt
                    .setName("err_uxp")
                    .setDescription("Throw unexpected error")    
                )
                .addSubcommand(opt => opt
                    .setName("err_go")
                    .setDescription("Throw GuildOnlyError")    
                )
                .addSubcommand(opt => opt
                    .setName("err_ce")
                    .setDescription("Throw NoConfigEntryError")    
                )
            )
            .onExecute(this.Run.bind(this))
            .commit()
        );

        this.bot.config.addConfigEntry("user", this.Name,
            new EphemeralConfigEntry(
                "test_config_entry",
                "Config entry just for testing purposes.",
                "string",
                false
            )
        );
        this.bot.config.addConfigEntry("user", this.Name,
            new EphemeralArrayConfigEntry(
                "test_array_entry",
                "Config entry just for testing purposes.",
                "string",
                false
            )
        );
    }

    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    async Run(interaction){
        let subcmd = interaction.options.getSubcommand();
        if(subcmd === "err_uxp"){
            throw new Error ("Testing unexpected error.");
        }
        if(subcmd === "err_go"){
            throw new GuildOnlyError();
        }
        if(subcmd === "err_ce"){
            throw new NoConfigEntryError("Cool parameter", "/config user set field:cool_param value_string:Synergy core is awesome");
        }

        let btn1 = this.bot.interactions.createButton("test", this.Access, this).build(btn => btn
            .setLabel("Test")
            .setStyle("PRIMARY")
        );
        btn1.onExecute(async (int) => {
            btn1.destroy();
            await int.reply("clicked. button removed.");
        });
        
        await interaction.reply({content: "test123", components: [ new Discord.MessageActionRow().addComponents(btn1.builder) ]});
    }
}

const modules = [
    { Module: CoreModules.Avatar,      UUID: "390cec87-b1db-52d9-8e55-de82530e380d"}, // All modules requires unique ids, 
    { Module: CoreModules.Config,      UUID: "ee285ab6-018a-5df2-8060-2504e14112b2"}, // so you can generate and read them
    { Module: CoreModules.Profile,     UUID: "37e0a335-4c46-541b-9afc-e6dd6dde1c95"}, // from external file, or just hardcode.
    { Module: CoreModules.RHelp,       UUID: "8209817a-753c-54e9-833b-bdff74fd9fa3"},
    { Module: TestMod,                 UUID: "78dc809e-532c-58fa-aa8b-c14f7029f23a"}
]

const bot = new Synergy({
    sequelizeForceSync: false,
    sequelizeURI: process.env.DATABASE_URI,                            // Sequelize initialization URI, see https://sequelize.org/master/manual/getting-started.html#connecting-to-a-database 
    masterGuildId: process.env.MASTER_GUILD_ID,                        // BOT's master guild. Slash Commands will appear on this guild in development mode.
    moduleGlobalLoading: process.env.NODE_ENV === "production",        // "Development mode", if you wanna publish your commands globally use true.
    clientOptions: {                                                   // Standard Discord.js Client options, see https://discord.js.org/#/docs/discord.js/stable/typedef/ClientOptions
        intents: [
            Discord.GatewayIntentBits.DirectMessages,
            Discord.GatewayIntentBits.Guilds,
            Discord.GatewayIntentBits.GuildMessages,
            Discord.GatewayIntentBits.GuildMembers
        ],
        presence: {
            status: "online",
            activities: [
                {
                    type: "PLAYING",
                    name: "Synergy 3",
                }
            ]
        }
    }
}, modules);

(async () => {
    await bot.login(process.env.DISCORD_TOKEN);
    bot.client.on("ready", async () => {
        //await bot.interactions.overwriteInteractiveCommands();
    })
})();