import Discord from "discord.js";
import { IntegerCommandParameter } from "./Parameters/IntegerCommandParameter";
import { BaseCommandParameter } from "./Parameters/BaseCommandParameter";
import { NumberCommandParameter } from "./Parameters/NumberCommandParameter";
import { StringCommandParameter } from "./Parameters/StringCommandParameter";
import { UserCommandParameter } from "./Parameters/UserCommandParameter";
import { SynergyCommandInteraction } from "../../SynergyCommandInteraction";
import { SynergyCommandBuilder, SynergyCommandBuilderType } from "./SynergyCommandBuilder";

export class SynergyChatCommandBuilder<T extends SynergyCommandInteraction = SynergyCommandInteraction> extends SynergyCommandBuilder<T> {
    public options: BaseCommandParameter[] = [];
    public subcommands: SynergyChatCommandBuilder[] = [];
    protected type: SynergyCommandBuilderType = SynergyCommandBuilderType.SynergyChat;

    public fromSlashCommandBuilder(builder: Discord.SlashCommandBuilder) {
        this.setName(builder.name);
        this.setDescription(builder.description);
        // #TODO proper conversion
    }

    public setName(name: string) {
        this.name = name;
        return this;
    }

    public setDescription(description: string) {
        this.description = description;
        return this;
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

    public addSubcommand(input: (builder: SynergyChatCommandBuilder) => SynergyChatCommandBuilder) {
        this.subcommands.push(input(new SynergyChatCommandBuilder()));
    }
}