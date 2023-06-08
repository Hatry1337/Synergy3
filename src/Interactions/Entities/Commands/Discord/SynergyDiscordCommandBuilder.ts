import { SynergyCommandBuilder, SynergyCommandBuilderType } from "../SynergyCommandBuilder";
import { SynergyDiscordCommandInteraction } from "../../../Discord/SynergyDiscordCommandInteraction";
import { SynergyDiscordSlashCommandBuilder } from "./SynergyDiscordSlashCommandBuilder";

export abstract class SynergyDiscordCommandBuilder extends SynergyCommandBuilder<SynergyDiscordCommandInteraction> {
    public isSlashCommand(): this is SynergyDiscordSlashCommandBuilder {
        return this.type === SynergyCommandBuilderType.DiscordSlash;
    }

    public isMenuUserCommand(): this is SynergyDiscordSlashCommandBuilder {
        return this.type === SynergyCommandBuilderType.DiscordSlash;
    }

    public isMenuMessageCommand(): this is SynergyDiscordSlashCommandBuilder {
        return this.type === SynergyCommandBuilderType.DiscordSlash;
    }
}