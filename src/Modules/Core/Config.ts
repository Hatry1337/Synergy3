import Discord, { ChatInputCommandInteraction } from "discord.js";

import {
    Synergy,
    Module,
    User,
    Colors,
    Access,
    AccessTarget,
    ConfigCommonDataType,
    ConfigEntryMapStructure,
    GuildOnlyError,
    MissingPermissionsError,
    SynergyUserError,
    dataStructureToString,
    ConfigDataStructure
} from "../..";

export default class Config extends Module{
    public Name:        string = "Config";
    public Description: string = "Using this command Users can change User-Specific options or Admins can change Guild-Specific.";
    public Category:    string = "BOT";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER(), Access.BANNED() ]

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
    }
    
    public async Init(){
        function namespaceFieldOptions(builder: Discord.SlashCommandSubcommandBuilder) {
            builder
                .addStringOption(opt => opt
                    .setName("namespace")
                    .setDescription("Target namespace")
                    .addChoices({ name: "user", value: "user" })
                    .addChoices({ name: "guild", value: "guild" })
                    .addChoices({ name: "bot", value: "bot" })
                    .setRequired(true)
                )

                .addStringOption(opt => opt
                    .setName("field")
                    .setDescription("Field to add to.")
                    .setRequired(true)
                )
            return builder;
        }

        function typedOptions(builder: Discord.SlashCommandSubcommandGroupBuilder){
            builder
                .addSubcommand(sub =>
                    namespaceFieldOptions(sub)
                        .setName("string")
                        .setDescription("Set string value.")
                        .addStringOption(opt => opt
                            .setName("value")
                            .setDescription("String to set as value.")
                            .setRequired(true)
                        )
                )
                .addSubcommand(sub =>
                    namespaceFieldOptions(sub)
                        .setName("attachment")
                        .setDescription("Set attachment value.")
                        .addAttachmentOption(opt => opt
                            .setName("value")
                            .setDescription("Attachment to set as value.")
                            .setRequired(true)
                        )
                )
                .addSubcommand(sub =>
                    namespaceFieldOptions(sub)
                        .setName("bool")
                        .setDescription("Set bool value.")
                        .addBooleanOption(opt => opt
                            .setName("value")
                            .setDescription("Boolean to set as value.")
                            .setRequired(true)
                        )
                )
                .addSubcommand(sub =>
                    namespaceFieldOptions(sub)
                        .setName("int")
                        .setDescription("Set int value.")
                        .addIntegerOption(opt => opt
                            .setName("value")
                            .setDescription("Integer to set as value.")
                            .setRequired(true)
                        )
                )
                .addSubcommand(sub =>
                    namespaceFieldOptions(sub)
                        .setName("number")
                        .setDescription("Set number value.")
                        .addNumberOption(opt => opt
                            .setName("value")
                            .setDescription("Number to set as value.")
                            .setRequired(true)
                        )
                )
                .addSubcommand(sub =>
                    namespaceFieldOptions(sub)
                        .setName("channel")
                        .setDescription("Set channel value.")
                        .addChannelOption(opt => opt
                            .setName("value")
                            .setDescription("Channel to set as value.")
                            .setRequired(true)
                        )
                )
                .addSubcommand(sub =>
                    namespaceFieldOptions(sub)
                        .setName("role")
                        .setDescription("Set role value.")
                        .addRoleOption(opt => opt
                            .setName("value")
                            .setDescription("Role to set as value.")
                            .setRequired(true)
                        )
                )
                .addSubcommand(sub =>
                    namespaceFieldOptions(sub)
                        .setName("user")
                        .setDescription("Set user value.")
                        .addUserOption(opt => opt
                            .setName("value")
                            .setDescription("User to set as value.")
                            .setRequired(true)
                        )
                )
            return builder;
        }
        
        this.createSlashCommand(this.Name.toLowerCase(), this.Access, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription(this.Description)
            
            .addSubcommandGroup(sub =>
                sub
                    .setName("list")
                    .setDescription("List all settings for specified namespace.")
                    .addSubcommand(sub => sub
                        .setName("entries")
                        .setDescription("List all settings for specified namespace.")
                        .addStringOption(opt => opt
                            .setName("namespace")
                            .setDescription("Target namespace")
                            .addChoices({ name: "user", value: "user" })
                            .addChoices({ name: "guild", value: "guild" })
                            .addChoices({ name: "bot", value: "bot" })
                            .setRequired(true)
                        )
                    )
            )

            .addSubcommandGroup(sub =>
                typedOptions(sub)
                    .setName("set")
                    .setDescription("Set value of specified field in specified namespace.")
            )

            .addSubcommandGroup(sub =>
                sub
                    .setName("unset")
                    .setDescription("Reset field value to default [not set].")
                    .addSubcommand(subc =>
                        namespaceFieldOptions(subc)
                            .setName("entry")
                            .setDescription("Reset field value to default [not set].")
                    )
            )

            .addSubcommandGroup(sub =>
                typedOptions(sub)
                    .setName("add")
                    .setDescription("Add value to Array of specified field in specified namespace.")
            )
             
            .addSubcommandGroup(sub =>
                sub
                    .setName("remove")
                    .setDescription("Remove value from Array of specified field in specified namespace.")
                    .addSubcommand(subc =>
                        namespaceFieldOptions(subc)
                            .setName("entry")
                            .setDescription("Remove value from Array of specified field in specified namespace.")
                            .addIntegerOption(opt => opt
                                .setName("index")
                                .setDescription("Index of array item to remove. (Counting from 0)")
                                .setMinValue(0)
                                .setRequired(true)
                            )
                    )
            )
        )
        .onExecute(this.interactionRouter.bind(this))
        .commit()
    }

    public async interactionRouter(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let subcommandGroup = interaction.options.getSubcommandGroup(true);
        let namespace = interaction.options.getString("namespace", true);
        let ephemeralTarget = await this.getEphemeralTarget(interaction, user, namespace);

        if(!await this.checkPermissions(interaction, user, namespace)) {
            throw new MissingPermissionsError();
        }

        if(subcommandGroup === "list") {
            await this.handleList(interaction, namespace, ephemeralTarget);
            return;
        }

        let field = interaction.options.getString("field", true);
        let type = interaction.options.getSubcommand(true);

        let entry = this.bot.config.getConfigEntry(namespace, field);

        if(!entry || entry.entry.isHidden()) {
            throw new SynergyUserError("This field doesn't exist.");
        }

        //Perform type check only on commands with type option
        if(![ "list", "unset", "remove" ].includes(subcommandGroup)) {
            if(type !== entry.entry.type) {
                throw new SynergyUserError(
                    "Wrong value type specified",
                    `You typed \`${type}\`, field is \`${entry.entry.type}\``
                );
            }
        }

        switch (subcommandGroup) {
            case "set": {
                await this.handleSet(interaction, namespace, ephemeralTarget, entry);
                return;
            }
            case "unset": {
                await this.handleUnset(interaction, namespace, ephemeralTarget, entry);
                return;
            }
            case "add": {
                await this.handleAdd(interaction, namespace, ephemeralTarget, entry);
                return;
            }
            case "remove": {
                await this.handleRemove(interaction, namespace, ephemeralTarget, entry);
                return;
            }
            default: {
                throw new SynergyUserError("Unknown action provided.");
            }
        }
    }

    public async handleList(
        interaction: Discord.ChatInputCommandInteraction,
        namespace: string,
        ephemeralTarget: string
    ): Promise<void> {
        let entries = this.bot.config.getConfigEntries(namespace)?.filter(e => !e.entry.isHidden());
        if(!entries || entries.length === 0) {
            throw new SynergyUserError("There's no settings to show.");
        }

        let embed = new Discord.EmbedBuilder({
            title: `Settings for "${namespace}" namespace`,
            description:    "Here you can customize settings of the bot. If you are a Guild Admin you can edit guild-specific settings. " +
                            "If you are just a User, you can customize your user-specific settings.\n\n" +
                            "*Types with `[]` are arrays.*\n",
            color: Colors.Noraml,
        });
        this.makeSettingsList(entries, ephemeralTarget, embed);

        await interaction.reply({ embeds: [embed] });
        return;
    }

    public async handleSet(
        interaction: Discord.ChatInputCommandInteraction,
        namespace: string,
        ephemeralTarget: string,
        entry: ConfigEntryMapStructure
    ): Promise<void> {
        if(!entry.entry.isNotArray()) {
            throw new SynergyUserError(
                "Wrong action used. You are trying to use `set` command on Array config field",
                "Instead you must use `add` and `remove` commands."
            );
        }

        let oldValue = dataStructureToString(entry.entry.getValue(ephemeralTarget), entry.entry.type);

        let typedValue = this.getTypedValue(entry.entry.type, interaction);
        if(entry.entry.isEphemeral()) {
            entry.entry.setValue(ephemeralTarget, typedValue);
        } else {
            entry.entry.setValue(typedValue);
        }

        let newValue = dataStructureToString(entry.entry.getValue(ephemeralTarget), entry.entry.type);

        let embed = new Discord.EmbedBuilder({
            title: `Settings for "${namespace}" namespace`,
            description: `Successfully changed "${entry.entry.name}" from "${oldValue}" to "${newValue}"`,
            color: Colors.Noraml,
        });
        await interaction.reply({ embeds: [embed] });
    }

    public async handleUnset(
        interaction: Discord.ChatInputCommandInteraction,
        namespace: string,
        ephemeralTarget: string,
        entry: ConfigEntryMapStructure
    ): Promise<void> {
        if(!entry.entry.isNotArray()) {
            throw new SynergyUserError(
                "Wrong action used. You are trying to use `unset` command on Array config field",
                "Instead you must use `add` and `remove` commands."
            );
        }

        let oldValue = dataStructureToString(entry.entry.getValue(ephemeralTarget), entry.entry.type);

        if(entry.entry.isEphemeral()) {
            entry.entry.setValue(ephemeralTarget, undefined);
        } else {
            entry.entry.setValue(undefined);
        }

        let newValue = dataStructureToString(entry.entry.getValue(ephemeralTarget), entry.entry.type);

        let embed = new Discord.EmbedBuilder({
            title: `Settings for "${namespace}" namespace`,
            description: `Successfully unset "${entry.entry.name}" from "${oldValue}" to "${newValue}"`,
            color: Colors.Noraml,
        });
        await interaction.reply({ embeds: [embed] });
    }

    public async handleAdd(
        interaction: Discord.ChatInputCommandInteraction,
        namespace: string,
        ephemeralTarget: string,
        entry: ConfigEntryMapStructure
    ): Promise<void> {
        if(!entry.entry.isArray()) {
            throw new SynergyUserError(
                "Wrong action used. You are trying to use `add` command on Non-Array config field",
                "Instead you must use `set` and `unset` commands."
            );
        }

        let typedValue = this.getTypedValue(entry.entry.type, interaction);
        if(entry.entry.isEphemeral()) {
            entry.entry.addValue(ephemeralTarget, typedValue);
        } else {
            entry.entry.addValue(typedValue);
        }

        let newValues = this.formatArray(entry.entry.getValues(ephemeralTarget), entry.entry.type);

        let embed = new Discord.EmbedBuilder({
            title: `Settings for "${namespace}" namespace`,
            description: `Successfully added new value into array field "${entry.entry.name}".\nNew contents: ${newValues}`,
            color: Colors.Noraml,
        });
        await interaction.reply({ embeds: [embed] });
    }

    public async handleRemove(
        interaction: Discord.ChatInputCommandInteraction,
        namespace: string,
        ephemeralTarget: string,
        entry: ConfigEntryMapStructure
    ): Promise<void> {
        if(!entry.entry.isArray()) {
            throw new SynergyUserError(
                "Wrong action used. You are trying to use `remove` command on Non-Array config field",
                "Instead you must use `set` and `unset` commands."
            );
        }

        let index = interaction.options.getInteger("index", true);

        let oldValue;
        if(entry.entry.isEphemeral()) {
            oldValue = entry.entry.getValue(ephemeralTarget, index);
            entry.entry.deleteValue(ephemeralTarget, index);
        } else {
            oldValue = entry.entry.getValue(index);
            entry.entry.deleteValue(index);
        }

        let newValues = this.formatArray(entry.entry.getValues(ephemeralTarget), entry.entry.type);

        let embed = new Discord.EmbedBuilder({
            title: `Settings for "${namespace}" namespace`,
            description:    `Successfully removed "${dataStructureToString(oldValue, entry.entry.type)}" from array field "${entry.entry.name}".\n` +
                            `New contents: ${newValues}`,
            color: Colors.Noraml,
        });
        await interaction.reply({ embeds: [embed] });
    }

    /*
        ==============================================[SHARED CODE BELOW]==============================================
     */

    private async checkPermissions(interaction: Discord.ChatInputCommandInteraction, user: User, namespace: string) {
        switch (namespace) {
            case "user": {
                return true;
            }

            case "guild": {
                if(!interaction.guild) throw new GuildOnlyError();
                return await Access.Check(user, [Access.SERVER_ADMIN()], interaction.guild);
            }

            case "bot": {
                return await Access.Check(user, [Access.ADMIN()]);
            }

            default: {
                throw new SynergyUserError("This namespace doesn't exist.");
            }
        }
    }

    private async getEphemeralTarget(interaction: Discord.ChatInputCommandInteraction, user: User, namespace: string) {
        switch (namespace) {
            case "user": {
                return user.unifiedId;
            }

            case "guild": {
                if(!interaction.guild) throw new GuildOnlyError();
                return interaction.guild.id;
            }

            case "bot": {
                return "bot_target";
            }

            default: {
                throw new SynergyUserError("This namespace doesn't exist.");
            }
        }
    }

    private formatArray(values: ConfigDataStructure[], type: ConfigCommonDataType) {
        return "[" + values.map((v: any) => `'${dataStructureToString(v, type)}'`).join(", ") + "]";
    }

    private makeSettingsList(entries: ConfigEntryMapStructure[], ephemeralTarget: string, embed: Discord.EmbedBuilder) {
        const addField = (entry: ConfigEntryMapStructure, value: string) => {
            let arr = entry.entry.isArray() ? "[]" : "";
            embed.addFields({
                name: `🟣 ${entry.entry.name}`,
                value:  "\\~".repeat(entry.entry.name.length + 1) + "\n" +
                        `🗒️ Value: "${value}"\n` +
                        `🏷️ Type: **${entry.entry.type}${arr}**\n` +
                        `🪧 Description: ${entry.entry.description}\n` +
                        `🔧 Module: ${entry.createdBy}\n` +
                        "\\~".repeat(entry.entry.name.length + 1)
            });
        }

        let entriesAuthors: Map<string, ConfigEntryMapStructure[]> = new Map();

        for(let e of entries) {
            let author = entriesAuthors.get(e.createdBy);
            if(!author) {
                author = [ e ];
                entriesAuthors.set(e.createdBy, author);
            } else {
                author.push(e);
            }
        }

        for(let e of entriesAuthors.entries()){
            for(let ent of e[1]) {
                if(ent.entry.isEphemeral()) {
                    if(ent.entry.isArray()) {
                        addField(ent, this.formatArray(ent.entry.getValues(ephemeralTarget), ent.entry.type));
                    } else {
                        addField(ent, dataStructureToString(ent.entry.getValue(ephemeralTarget), ent.entry.type));
                    }
                } else if (ent.entry.isCommon()) {
                    if(ent.entry.isArray()) {
                        addField(ent, this.formatArray(ent.entry.getValues(), ent.entry.type));
                    } else {
                        addField(ent, dataStructureToString(ent.entry.getValue(), ent.entry.type));
                    }
                } else {
                    throw new Error("Unknown ConfigEntry type");
                }
            }
        }
        return embed;
    }

    private getTypedValue(type: string, interaction: ChatInputCommandInteraction) {
        switch (type) {
            case "attachment": {
                return interaction.options.getAttachment("value", true);
            }
            case "bool": {
                return interaction.options.getBoolean("value", true);
            }
            case "int": {
                return interaction.options.getInteger("value", true);
            }
            case "number": {
                return interaction.options.getNumber("value", true);
            }
            case "string": {
                return interaction.options.getString("value", true);
            }
            case "channel": {
                let channel = interaction.options.getChannel("value", true);
                if(!("guildId" in channel)) {
                    throw new SynergyUserError("Something went wrong... Please try again.");
                }
                if(!(channel instanceof Discord.BaseGuildVoiceChannel || channel instanceof Discord.BaseGuildTextChannel)) {
                    throw new SynergyUserError("This type of channel is not supported.");
                }
                return channel;
            }
            case "role": {
                let role = interaction.options.getRole("value", true);
                if(!(role instanceof Discord.Role)) {
                    throw new SynergyUserError("Something went wrong... Please try again.");
                }
                return role;
            }
            case "user": {
                return interaction.options.getUser("value", true);
            }
            default: {
                throw new SynergyUserError("Unknown value type specified.");
            }
        }
    }
}