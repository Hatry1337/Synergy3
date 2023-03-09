import Discord from "discord.js";

import Module from "../Module";
import User from "../../Structures/User";
import { Colors } from "../../Utils";
import { GuildOnlyError, MissingPermissionsError, Synergy, SynergyUserError } from "../..";
import Access, { AccessTarget } from "../../Structures/Access";
import { ConfigCommonDataType } from "../../ConfigManager/ConfigDataTypes";
import { ConfigEntryMapStructure } from "../../ConfigManager/ConfigManager";
import {
    ConfigAttachment,
    ConfigDataStructure,
    ConfigGuildChannel,
    ConfigRole,
    ConfigUser
} from "../../ConfigManager/ConfigDataStructures";

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
                        .addNumberOption(opt => opt
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
            
            .addSubcommandGroup(sub => sub
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

            .addSubcommandGroup(sub => { sub
                .setName("set")
                .setDescription("Set value of specified field in specified namespace.")
                return typedOptions(sub)
            })

            .addSubcommandGroup(sub => { sub
                .setName("add")
                .setDescription("Add value to Array of specified field in specified namespace.")
                return typedOptions(sub)
            })
             
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

        switch (subcommandGroup) {
            case "list": {
                await this.handleList(interaction, user);
                return;
            }
            case "set": {
                //await this.handleSet(interaction, user);
                return;
            }
            case "add": {
                //await this.handleAdd(interaction, user);
                return;
            }
            case "remove": {
                //await this.handleRemove(interaction, user);
                return;
            }
        }
    }

    /*
    private makeList(fields: { name: string, value: any, type: ConfigDataType }[]){
        function formatType(value: any, type: ConfigDataType){
            if(type !== "bool" && !value){
                return "[not set]"
            }
            if(type === "user"){
                return `<@${value}>`;
            }
            if(type === "role"){
                return `<@&${value}>`;
            }
            if(type === "channel"){
                return `<#${value}>`;
            }
            if(type === "bool"){
                return value ? "*true*" : "*false*";
            }
            if(type.startsWith("array")){
                let atype = (/array<(.*)>/.exec(type) || [])[1] as ConfigDataType;
                return "[" + value.map((v: any) => formatType(v, atype)).join(", ") as string + "]";
            }
            return `${value}`;
        }

        let text = "";
        for(let f of fields){
            text += `${f.name}: **${f.type}** = ${formatType(f.value, f.type)}\n`;
        }
        return text;
    }
    */
    public async handleList(interaction: Discord.ChatInputCommandInteraction, user: User): Promise<void> {
        let namespace = interaction.options.getString("namespace", true);

        let ephemeralTarget: string;
        //Check permissions for intended namespace
        switch (namespace) {
            case "user": {
                ephemeralTarget = interaction.user.id;
                break;
            }

            case "guild": {
                if(!interaction.guild) throw new GuildOnlyError();
                if(!await Access.Check(user, [ Access.SERVER_ADMIN() ], interaction.guild)) {
                    throw new MissingPermissionsError();
                }
                ephemeralTarget = interaction.guild.id;
                break;
            }

            case "bot": {
                if(!await Access.Check(user, [ Access.ADMIN() ])) {
                    throw new MissingPermissionsError();
                }
                ephemeralTarget = "bot_target";
                break;
            }

            default: {
                throw new SynergyUserError("This namespace doesn't exist.");
            }
        }

        let entries = this.bot.config.getConfigEntries(namespace)?.filter(e => !e.entry.isHidden());
        if(!entries || entries.length === 0) {
            throw new SynergyUserError("There's no settings to show.");
        }

        let settingsList = this.makeSettingsList(entries, ephemeralTarget);

        let embed = new Discord.EmbedBuilder({
            title: `Settings for "${namespace}" namespace`,
            description:    "<ModuleName>:\n" +
                            "`<field>: <type> = <value>`\n\n" +
                            settingsList,
            color: Colors.Noraml,
        });
        await interaction.reply({ embeds: [embed] });
        return;
    }

    private makeSettingsList(entries: ConfigEntryMapStructure[], ephemeralTarget: string) {
        function formatType(value: ConfigDataStructure | undefined, type: ConfigCommonDataType){
            if(value === undefined) {
                return "[not set]";
            }
            switch (type) {
                case "user": {
                    let user = value as ConfigUser;
                    return `<@${user.id}>`;
                }
                case "role": {
                    let role = value as ConfigRole;
                    return `<@&${role.id}>`;
                }
                case "channel": {
                    let channel = value as ConfigGuildChannel;
                    return `<#${channel.id}>`;
                }
                case "attachment": {
                    let attachment = value as ConfigAttachment;
                    return `[Attachment](${attachment.proxyURL})`;
                }
                case "bool": {
                    return value ? "*true*" : "*false*";
                }
                default: {
                    return `${value}`;
                }
            }
        }

        function formatArray(values: any[], type: ConfigCommonDataType) {
            return "[" + values.map((v: any) => formatType(v, type)).join(", ") + "]";
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

        let text = "";
        for(let e of entriesAuthors.entries()){
            text += `\n${e[0]}:\n`;
            for(let ent of e[1]) {
                text += `${ent.entry.name}: **${ent.entry.type}** = `;
                if(ent.entry.isEphemeral()) {
                    if(ent.entry.isArray()) {
                        text += `${formatArray(ent.entry.getValues(ephemeralTarget), ent.entry.type)}\n`;
                    } else {
                        text += `${formatType(ent.entry.getValue(ephemeralTarget), ent.entry.type)}\n`;
                    }
                } else if (ent.entry.isCommon()) {
                    if(ent.entry.isArray()) {
                        text += `${formatArray(ent.entry.getValues(), ent.entry.type)}\n`;
                    } else {
                        text += `${formatType(ent.entry.getValue(), ent.entry.type)}\n`;
                    }
                } else {
                    throw new Error("Unknown ConfigEntry type");
                }
            }
        }
        return text;
    }
        /*
        public async handleList(interaction: Discord.ChatInputCommandInteraction, user: User): Promise<void> {
            let target = interaction.options.getString("namespace", true);

            let keys = this.bot.config.getConfigEntriesNames(target);
            let fields: { name: string, value: any, type: ConfigDataType }[] = [];

            switch(target){
                case "guild": {
                    if(!interaction.guild) throw new GuildOnlyError();
                    if(!await Access.Check(user, [ Access.SERVER_ADMIN() ], interaction.guild)) throw new MissingPermissionsError();

                    for(let k of keys){
                        let entry = this.bot.config.getConfigEntry(target, k);

                        if(!entry || !entry.entry.isEphemeral()) {
                            throw new Error("Config entry does not exist, or of insufficient type.");
                        }

                        let val;
                        if(entry.entry.isArray()) {
                            val = entry.entry.getValues(interaction.guild.id);
                        } else {
                            val = entry.entry.getValue(interaction.guild.id);
                        }

                        fields.push({
                            name: k,
                            value: val,
                            type: entry.entry.type
                        });
                    }
                    break;
                }

                case "bot": {
                    if(!await Access.Check(user, [ Access.ADMIN() ])) throw new MissingPermissionsError();

                    for(let k of keys){
                        let entry = this.bot.config.getConfigEntry(target, k);

                        if(!entry || !entry.entry.isEphemeral()) {
                            throw new Error("Config entry does not exist, or of insufficient type.");
                        }

                        let val;
                        if(entry.entry.isArray()) {
                            val = entry.entry.getValues(interaction.guild.id);
                        } else {
                            val = entry.entry.getValue(interaction.guild.id);
                        }

                        fields.push({
                            name: k,
                            value: val,
                            type: entry.entry.type
                        });

                        let val = (await this.bot.config.get(target, k) || {});

                        fields.push({
                            name: k,
                            value: val,
                            type:  (await this.bot.config.getType(target, k))!
                        });
                    }
                    break;
                }

                case "user": {
                    for(let k of keys){
                        let container = (await this.bot.config.get(target, k) || {});
                        let val = container[interaction.user.id];

                        fields.push({
                            name: k,
                            value: val,
                            type:  (await this.bot.config.getType(target, k))!
                        });
                    }
                    break;
                }

                default: {
                    throw new SynergyUserError("This namespace doesen't exist.");
                }
            }

            let text = this.makeList(fields);
            let emb = new Discord.EmbedBuilder({
                title: `${target} config`,
                description: "`<field>: <type> = <value>`\n\n" + text,
                color: Colors.Noraml,
            });
            await interaction.reply({ embeds: [emb] });
            return;
        }

         */
    /*
    public async handleSet(interaction: Discord.ChatInputCommandInteraction, user: User): Promise<void> {
        let values = {
            attachment: interaction.options.getAttachment("value_attach"),
            bool:       interaction.options.getBoolean("value_bool"),
            int:        interaction.options.getInteger("value_int"),
            number:     interaction.options.getNumber("value_number"),
            string:     interaction.options.getString("value_string"),
            channel:    interaction.options.getChannel("value_channel"),
            role:       interaction.options.getRole("value_role"),
            user:       interaction.options.getUser("value_user")
        };
        let field = interaction.options.getString("field", true);
        let target = interaction.options.getString("namespace", true);

        let keys = await this.bot.config.getFields(target);
        
        if(!keys.includes(field)) throw new SynergyUserError("This field doesen't exist.");

        let type = await this.bot.config.getType(target, field) as ConfigDataType;

        if(type.startsWith("array")) throw new SynergyUserError("This subcommand is doesn't support Array types.", "Use `add` and `remove` instead.");
        type = type as ConfigCommonDataType;

        let value = values[type];
        if(!value) throw new SynergyUserError("Incorrect data type selected.", "Required type: " + type);

        if(value instanceof Discord.Attachment){
            value = value.proxyURL;
        }else if(typeof value !== "string" && typeof value !== "boolean" && typeof value !== "number"){
            value = value.id;
        }

        let container = (await this.bot.config.get(target, field) || {});

        let old_value: any;
        
        switch(target){
            case "user": {
                old_value = container[interaction.user.id];
                container[interaction.user.id] = value;
                break;
            }
            case "guild": {
                old_value = container[interaction.guild?.id!];
                container[interaction.guild?.id!] = value;
                break;
            }
            case "bot": {
                old_value = container;
                container = value;
                break;
            }
        }

        await this.bot.config.set(target, field, container, type);

        let emb = new Discord.EmbedBuilder({
            title: `${target} config`,
            description: `Successfully changed "${field}" from "${old_value || "`[not set]`"}" to "${value}"`,
            color: Colors.Noraml,
        });
        await interaction.reply({ embeds: [emb] });
        return;
    }

    public async handleAdd(interaction: Discord.ChatInputCommandInteraction, user: User): Promise<void> {
        let values = {
            attachment: interaction.options.getAttachment("value_attach"),
            bool:       interaction.options.getBoolean("value_bool"),
            int:        interaction.options.getInteger("value_int"),
            number:     interaction.options.getNumber("value_number"),
            string:     interaction.options.getString("value_string"),
            channel:    interaction.options.getChannel("value_channel"),
            role:       interaction.options.getRole("value_role"),
            user:       interaction.options.getUser("value_user")
        };
        let field = interaction.options.getString("field", true);
        let target = interaction.options.getString("namespace", true);

        if(target === "guild" && !interaction.guild) throw new GuildOnlyError();

        let keys = await this.bot.config.getFields(target);
        
        if(!keys.includes(field)) throw new SynergyUserError("This field doesen't exist.");

        let type = await this.bot.config.getType(target, field) as ConfigDataType;

        if(!type.startsWith("array")) throw new SynergyUserError("This subcommand is only for Array types.", "Use `set` instead.");
        type = type as ConfigArrayDataType;

        let subtype = (/array<(.*)>/.exec(type) || [])[1] as ConfigCommonDataType | undefined;
        if(!subtype || !values[subtype]) throw new SynergyUserError("Incorrect data type selected.", "Required type: " + subtype || type);

        let value = values[subtype]!;

        
        if(value instanceof Discord.Attachment){
            value = value.proxyURL;
        }else if(typeof value !== "string" && typeof value !== "boolean" && typeof value !== "number"){
            value = value.id;
        }

        let container = (await this.bot.config.get(target, field) || {});

        switch(target){
            case "user": {
                if(container[interaction.user.id] && container[interaction.user.id].push){
                    container[interaction.user.id].push(value);
                }else{
                    container[interaction.user.id] = [ value ];
                }
                break;
            }
            case "guild": {
                if(container[interaction.guild!.id] && container[interaction.guild!.id].push){
                    container[interaction.guild!.id].push(value);
                }else{
                    container[interaction.guild!.id] = [ value ];
                }
                break;
            }
            case "bot": {
                if(container && container.push){
                    container.push(value);
                }else{
                    container = [ value ];
                }
                break;
            }
        }

        await this.bot.config.set(target, field, container, type);

        let emb = new Discord.EmbedBuilder({
            title: `${target} config`,
            description: `Successfully added value ${value} to array "${field}"`,
            color: Colors.Noraml,
        });
        await interaction.reply({ embeds: [emb] });
        return;
    }

    public async handleRemove(interaction: Discord.ChatInputCommandInteraction, user: User): Promise<void> {
        let index = interaction.options.getInteger("index", true);
        let field = interaction.options.getString("field", true);
        let target = interaction.options.getString("namespace", true);

        if(target === "guild" && !interaction.guild) throw new GuildOnlyError();

        let keys = await this.bot.config.getFields(target);
        
        if(!keys.includes(field)) throw new SynergyUserError("This field doesen't exist.");

        let type = await this.bot.config.getType(target, field) as ConfigDataType;

        if(!type.startsWith("array")) throw new SynergyUserError("This subcommand is only for Array types.", "Use `set` instead.");
        type = type as ConfigArrayDataType;

        let container = (await this.bot.config.get(target, field) || {});

        let rm_value: any;

        switch(target){
            case "user": {
                if(container[interaction.user.id] && container[interaction.user.id].splice){
                    rm_value = container[interaction.user.id].splice(index, 1);
                }else{
                    container[interaction.user.id] = [];
                }
                break;
            }
            case "guild": {
                if(container[interaction.guild!.id] && container[interaction.guild!.id].splice){
                    rm_value = container[interaction.guild!.id].splice(index, 1);
                }else{
                    container[interaction.guild!.id] = [];
                }
                break;
            }
            case "bot": {
                if(container && container.splice){
                    rm_value = container.splice(index, 1);
                }else{
                    container = [];
                }
                break;
            }
        }

        await this.bot.config.set(target, field, container, type);

        let emb = new Discord.EmbedBuilder({
            title: `${target} config`,
            description: `Successfully removed ${rm_value} from array "${field}"`,
            color: Colors.Noraml,
        });
        await interaction.reply({ embeds: [emb] });
        return;
    }
    */
}