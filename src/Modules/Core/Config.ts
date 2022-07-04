import Discord from "discord.js";

import Module from "../Module";
import User from "../../Structures/User";
import { Colors, Utils } from "../../Utils";
import { ConfigDataType } from "../../ConfigManager";
import { Synergy, SynergyUserError } from "../..";
import Access, { AccessTarget } from "../../Structures/Access";

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
        this.createSlashCommand(this.Name.toLowerCase(), this.Access, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription(this.Description)
            .addSubcommandGroup(opt => opt
                .setName("guild")
                .setDescription("Guild-Specific settings.")
                .addSubcommand(opt => opt
                    .setName("list")
                    .setDescription("List all Guild-Specific settings.")  
                )
                .addSubcommand(opt => opt
                    .setName("set")
                    .setDescription("Set specified field to specified value")    
                    .addStringOption(opt => opt
                        .setName("field")
                        .setDescription("Field to set.")
                        .setAutocomplete(true)
                    )
                    .addBooleanOption(opt => opt
                        .setName("value_bool")
                        .setDescription("Value if parameter is type of bool.")
                    )
                    .addIntegerOption(opt => opt
                        .setName("value_int")
                        .setDescription("Value if parameter is type of int.")
                    )
                    .addStringOption(opt => opt
                        .setName("value_string")
                        .setDescription("Value if parameter is type of string.")
                    )
                    .addChannelOption(opt => opt
                        .setName("value_channel")
                        .setDescription("Value if parameter is type of channel.")
                    )
                    .addRoleOption(opt => opt
                        .setName("value_role")
                        .setDescription("Value if parameter is type of role.")
                    )
                    .addUserOption(opt => opt
                        .setName("value_user")
                        .setDescription("Value if parameter is type of user.")
                    )
                )
            )
            
            .addSubcommandGroup(opt => opt
                .setName("user")
                .setDescription("User-Specific settings.")
                .addSubcommand(opt => opt
                    .setName("list")
                    .setDescription("List all User-Specific settings.")  
                )
                .addSubcommand(opt => opt
                    .setName("set")
                    .setDescription("Set specified field to specified value")    
                    .addStringOption(opt => opt
                        .setName("field")
                        .setDescription("Field to set.")
                        .setAutocomplete(true)
                    )
                    .addBooleanOption(opt => opt
                        .setName("value_bool")
                        .setDescription("Value if parameter is type of bool.")
                    )
                    .addIntegerOption(opt => opt
                        .setName("value_int")
                        .setDescription("Value if parameter is type of int.")
                    )
                    .addStringOption(opt => opt
                        .setName("value_string")
                        .setDescription("Value if parameter is type of string.")
                    )
                    .addChannelOption(opt => opt
                        .setName("value_channel")
                        .setDescription("Value if parameter is type of channel.")
                    )
                    .addRoleOption(opt => opt
                        .setName("value_role")
                        .setDescription("Value if parameter is type of role.")
                    )
                    .addUserOption(opt => opt
                        .setName("value_user")
                        .setDescription("Value if parameter is type of user.")
                    )
                )
            )
            .addSubcommandGroup(opt => opt
                .setName("bot")
                .setDescription("BOT Settings. Only for BOT Admins.")
                .addSubcommand(opt => opt
                    .setName("list")
                    .setDescription("List all BOT-Specific settings.")  
                )
                .addSubcommand(opt => opt
                    .setName("set")
                    .setDescription("Set specified field to specified value")    
                    .addStringOption(opt => opt
                        .setName("field")
                        .setDescription("Field to set.")
                        .setAutocomplete(true)
                    )
                    .addBooleanOption(opt => opt
                        .setName("value_bool")
                        .setDescription("Value if parameter is type of bool.")
                    )
                    .addIntegerOption(opt => opt
                        .setName("value_int")
                        .setDescription("Value if parameter is type of int.")
                    )
                    .addStringOption(opt => opt
                        .setName("value_string")
                        .setDescription("Value if parameter is type of string.")
                    )
                    .addChannelOption(opt => opt
                        .setName("value_channel")
                        .setDescription("Value if parameter is type of channel.")
                    )
                    .addRoleOption(opt => opt
                        .setName("value_role")
                        .setDescription("Value if parameter is type of role.")
                    )
                    .addUserOption(opt => opt
                        .setName("value_user")
                        .setDescription("Value if parameter is type of user.")
                    )
                )
            )
        )
        .onExecute(this.Run.bind(this))
        .onAutocomplete(async (int) => {
            let target = int.options.getSubcommandGroup(true);
            let choises: {name: string, value: string}[] = [];
            switch(target){
                case "guild": {
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
            }
            await int.respond(choises);
        })
        .commit()
    }

    private makeList(fields: { name: string, value: any, type: ConfigDataType }[]){
        let text = "";
        for(let f of fields){
            text += `${f.name}: **${f.type}** = \`${f.value || "[not set]"}\`\n`;
        }
        return text;
    }

    public Run(interaction: Discord.CommandInteraction, user: User){
        return new Promise<void>(async (resolve, reject) => {
            let values = {
                bool:    interaction.options.getBoolean("value_bool"),
                int:     interaction.options.getInteger("value_int"),
                number:  interaction.options.getNumber("value_number"),
                string:  interaction.options.getString("value_string"),
                channel: interaction.options.getChannel("value_channel"),
                role:    interaction.options.getRole("value_role"),
                user:    interaction.options.getUser("value_user")
            };
            let field = interaction.options.getString("field");
            let target = interaction.options.getSubcommandGroup(true);
            let action = interaction.options.getSubcommand(true);

            if(target === "guild"){
                if(!interaction.member  || !(interaction.member instanceof Discord.GuildMember)){
                    return resolve(interaction.reply({ embeds: [ Utils.ErrMsg("This command is guild-only.") ] }));
                }
                if(!user.groups.includes("admin") && !interaction.member.permissions.has("ADMINISTRATOR")){
                    return resolve(interaction.reply({ embeds: [ Utils.ErrMsg("You don't have access to this command.") ] }));
                }
            }

            if(target === "bot"){
                if(!user.groups.includes(Access.ADMIN())){
                    throw new SynergyUserError("You can't use this command.");
                }
            }

            if(action === "list"){
                if(target === "user" || target === "guild" || target === "bot"){
                    let keys = await this.bot.config.getFields(target);
                    let fields: { name: string, value: any, type: ConfigDataType }[] = [];
                    for(let k of keys){
                        let container = (await this.bot.config.get(target, k) || {});
                        let val;
                        switch(target){
                            case "user": {
                                val = container[interaction.user.id];
                                break;
                            }
                            case "guild": {
                                val = container[interaction.guild?.id!];
                                break;
                            }
                            case "bot": {
                                val = container;
                                break;
                            }
                        }

                        fields.push({
                            name: k,
                            value: val,
                            type:  (await this.bot.config.getType(target, k))!
                        });
                    }
                    let text = this.makeList(fields);
                    var embd = new Discord.MessageEmbed({
                        title: `${target} config`,
                        description: "`<field>: <type> = <value>`\n\n" + text,
                        color: Colors.Noraml,
                    });
                    return resolve(await interaction.reply({ embeds: [ embd ] }).catch(reject));
                }else{
                    return resolve(await interaction.reply({ embeds: [ await Utils.ErrMsg("This config namespace doesen't exist.") ] }).catch(reject));
                }
            }

            if(action === "set"){
                if(target === "user" || target === "guild" || target === "bot"){
                    let keys = await this.bot.config.getFields(target);
                    if(!field || !keys.includes(field)){
                        return resolve(await interaction.reply({ embeds: [ await Utils.ErrMsg("This field doesen't exist.") ] }).catch(reject));
                    }

                    let type = await this.bot.config.getType(target, field) as ConfigDataType;
                    let value = values[type];
                    
                    if(!value){
                        return resolve(await interaction.reply({ embeds: [ await Utils.ErrMsg("Incorrect data type selected.") ] }).catch(reject));
                    }

                    if(typeof value !== "string" && typeof value !== "boolean" && typeof value !== "number"){
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

                    var embd = new Discord.MessageEmbed({
                        title: `${target} config`,
                        description: `Successfully changed "${field}" from "${old_value || "`[not set]`"}" to "${value}"`,
                        color: Colors.Noraml,
                    });
                    return resolve(await interaction.reply({ embeds: [ embd ] }).catch(reject));
                }else{
                    return resolve(await interaction.reply({ embeds: [ await Utils.ErrMsg("This config namespace doesen't exist.") ] }).catch(reject));
                }
            }
        });
    }
}