import Synergy from "../Synergy";
import { ModulePlatform } from "../Modules/Module";
import { ISynergyInteractionOptions, SynergyInteraction, SynergyInteractionType } from "./SynergyInteraction";

export interface ISynergyCommandInteractionOptions<T extends ModulePlatform> extends ISynergyInteractionOptions<T>{
    name: string;
}

export abstract class SynergyCommandInteraction<T extends ModulePlatform = ModulePlatform> extends SynergyInteraction {
    public readonly name: string;

    protected constructor(bot: Synergy, options: ISynergyCommandInteractionOptions<T>) {
        super(bot, options, SynergyInteractionType.Command);
        this.name = options.name;
    }
}