import { InteractiveEntityBuilder } from "../InteractiveEntityBuilder";
import { SynergyCommandInteraction } from "../../SynergyCommandInteraction";

export enum SynergyCommandBuilderType {
    SynergyChat        = 0,
    DiscordSlash       = 1,
    DiscordMessageMenu = 2,
    DiscordUserMenu    = 3,
}

export abstract class SynergyCommandBuilder<T extends SynergyCommandInteraction = SynergyCommandInteraction> extends InteractiveEntityBuilder<T> {
    public name!: string;
    public description!: string;
    protected abstract type: SynergyCommandBuilderType;

    public setName(name: string) {
        this.name = name;
        return this;
    }

    public setDescription(description: string) {
        this.description = description;
        return this;
    }
}