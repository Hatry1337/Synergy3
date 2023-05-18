import Discord from "discord.js";
import { InteractiveEntityBuilder } from "../InteractiveEntityBuilder";
import { IntegerCommandParameter } from "./Parameters/IntegerCommandParameter";
import { BaseCommandParameter } from "./Parameters/BaseCommandParameter";
import { NumberCommandParameter } from "./Parameters/NumberCommandParameter";
import { StringCommandParameter } from "./Parameters/StringCommandParameter";
import { UserCommandParameter } from "./Parameters/UserCommandParameter";
import { SynergyCommandInteraction } from "../../SynergyCommandInteraction";

export class SynergyCommandBuilder<T extends SynergyCommandInteraction = SynergyCommandInteraction> extends InteractiveEntityBuilder<T> {
    public slashBuilder?: Discord.SlashCommandBuilder;
    public options: BaseCommandParameter[] = [];

    public fromSlashCommandBuilder(input: (slashBuilder: Discord.SlashCommandBuilder) => Discord.SlashCommandBuilder) {
        let builder = new Discord.SlashCommandBuilder();
        builder = input(builder);
        this.setName(builder.name);
        this.setDescription(builder.description);
        this.slashBuilder = builder;
    }

    public addNumberParameter(input: (builder: NumberCommandParameter) => NumberCommandParameter) {
        this.options.push(input(new NumberCommandParameter()));
    }

    public addIntegerParameter(input: (builder: IntegerCommandParameter) => IntegerCommandParameter) {
        this.options.push(input(new IntegerCommandParameter()));
    }

    public addStringParameter(input: (builder: StringCommandParameter) => StringCommandParameter) {
        this.options.push(input(new StringCommandParameter()));
    }

    public addUserParameter(input: (builder: UserCommandParameter) => UserCommandParameter) {
        this.options.push(input(new UserCommandParameter()));
    }
}