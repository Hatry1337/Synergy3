import Discord from "discord.js";

import Module from "../Module";
import User from "../../Structures/User";
import { Colors } from "../../Utils";
import { ConfigArrayDataType, ConfigCommonDataType, ConfigDataType, TypeOfConfigCommonDataType } from "../../ConfigManager";
import { GuildOnlyError, MissingPermissionsError, Synergy, SynergyUserError } from "../..";
import Access, { AccessTarget } from "../../Structures/Access";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";

export interface IGlobalConfiguration{
    [key: string]: any;
    guild_specific: {[key: string]: any}
    user_specific: {[key: string]: any}
}

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

        function typedOptions(builder: SlashCommandSubcommandBuilder){
            builder
                .addAttachmentOption(opt => opt
                    .setName("value_attach")
                    .setDescription("Value if parameter is type of Attachment.")
                )
                .addBooleanOption(opt => opt
                    .setName("value_bool")
                    .setDescription("Value if parameter is type of bool.")
                )
                .addNumberOption(opt => opt
                    .setName("value_int")
                    .setDescription("Value if parameter is type of integer.")
                )
                .addNumberOption(opt => opt
                    .setName("value_number")
                    .setDescription("Value if parameter is type of number.")
                )
                .addStringOption(opt => opt
                    .setName("value_string")
                    .setDescription("Value if parameter is type of string.")
                )
                .addChannelOption(opt => opt
                    .setName("value_channel")
                    .setDescription("Value if parameter is type of Channel.")
                )
                .addRoleOption(opt => opt
                    .setName("value_role")
                    .setDescription("Value if parameter is type of Role.")
                )
                .addUserOption(opt => opt
                    .setName("value_user")
                    .setDescription("Value if parameter is type of User.")
                )
            return builder;
        }
        
        this.createSlashCommand(this.Name.toLowerCase(), this.Access, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription(this.Description)
            
            .addSubcommand(sub => sub
                .setName("list")
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

            .addSubcommand(sub => { sub
                .setName("set")
                .setDescription("Set value of specified field in specified namespace.")    
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
                    .setDescription("Field to set.")
                    .setAutocomplete(true)
                    .setRequired(true)
                )

                return typedOptions(sub)
            })

            .addSubcommand(sub => { sub
                .setName("add")
                .setDescription("Add value to Array of specified field in specified namespace.")    
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
                    .setAutocomplete(true)
                    .setRequired(true)
                )

                return typedOptions(sub)
            })
             
            .addSubcommand(sub => sub
                .setName("remove")
                .setDescription("Remove value from Array of specified field in specified namespace.")    
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
                    .setDescription("Field to remove from.")
                    .setAutocomplete(true)
                    .setRequired(true)
                )

                .addIntegerOption(opt => opt
                    .setName("index")
                    .setDescription("Index of array item to remove. (Counting from 0)")
                    .setMinValue(0)
                    .setRequired(true)
                )
            )
        )
        .onAutocomplete(this.handleAutocomplete.bind(this))
        .onSubcommand("list", this.handleList.bind(this))
        .onSubcommand("set", this.handleSet.bind(this))
        .onSubcommand("add", this.handleAdd.bind(this))
        .onSubcommand("remove", this.handleRemove.bind(this))
        .commit()
    }

    public async handleAutocomplete(interaction: Discord.AutocompleteInteraction, user: User){
        let target = interaction.options.getString("namespace", true);
        let choises: {name: string, value: string}[] = [];
        switch(target){
            case "guild": {
                if(!interaction.guild) break;
                if(!await Access.Check(user, [ Access.SERVER_ADMIN() ], interaction.guild)) break;

                let guild_keys = await this.bot.config.getFields("guild");
                for(let f of guild_keys){
                    choises.push({name: f, value: f});
                }
                break;
            }
            case "user": {
                let user_keys = await this.bot.config.getFields("user");
                for(let f of user_keys){
                    choises.push({name: f, value: f});
                }
                break;
            }
            case "bot": {
                if(!await Access.Check(user, [ Access.ADMIN() ])) break;

                let bot_keys = await this.bot.config.getFields("bot");
                for(let f of bot_keys){
                    choises.push({name: f, value: f});
                }
                break;
            }
        }
        await interaction.respond(choises);
    }

    private makeList(fields: { name: string, value: any, type: ConfigDataType }[]){
        function formatType(value: any, type: ConfigDataType){
            if(!value){
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

    public async handleList(interaction: Discord.CommandInteraction, user: User){
        let target = interaction.options.getString("namespace", true);

        let keys = await this.bot.config.getFields(target);
        let fields: { name: string, value: any, type: ConfigDataType }[] = [];

        switch(target){
            case "guild": {
                if(!interaction.guild) throw new GuildOnlyError();
                if(!await Access.Check(user, [ Access.SERVER_ADMIN() ], interaction.guild)) throw new MissingPermissionsError();

                for(let k of keys){
                    let container = (await this.bot.config.get(target, k) || {});
                    let val = container[interaction.guild.id];

                    fields.push({
                        name: k,
                        value: val,
                        type:  (await this.bot.config.getType(target, k))!
                    });
                }
                break;
            }

            case "bot": {
                if(!await Access.Check(user, [ Access.ADMIN() ])) throw new MissingPermissionsError();

                for(let k of keys){
                    let container = (await this.bot.config.get(target, k) || {});
                    let val = container;

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
        let emb = new Discord.MessageEmbed({
            title: `${target} config`,
            description: "`<field>: <type> = <value>`\n\n" + text,
            color: Colors.Noraml,
        });
        return await interaction.reply({ embeds: [emb] });
    }

    public async handleSet(interaction: Discord.CommandInteraction, user: User){
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

        if(value instanceof Discord.MessageAttachment){
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

        let emb = new Discord.MessageEmbed({
            title: `${target} config`,
            description: `Successfully changed "${field}" from "${old_value || "`[not set]`"}" to "${value}"`,
            color: Colors.Noraml,
        });
        return await interaction.reply({ embeds: [emb] })
    }

    public async handleAdd(interaction: Discord.CommandInteraction, user: User){
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

        
        if(value instanceof Discord.MessageAttachment){
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

        let emb = new Discord.MessageEmbed({
            title: `${target} config`,
            description: `Successfully added value ${value} to array "${field}"`,
            color: Colors.Noraml,
        });
        return await interaction.reply({ embeds: [emb] })
    }

    public async handleRemove(interaction: Discord.CommandInteraction, user: User){
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

        let emb = new Discord.MessageEmbed({
            title: `${target} config`,
            description: `Successfully removed ${rm_value} from array "${field}"`,
            color: Colors.Noraml,
        });
        return await interaction.reply({ embeds: [emb] })
    }
}