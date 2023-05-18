import Synergy from "../Synergy";
import { ModulePlatform } from "../Modules/Module";
import { ISynergyInteractionOptions, SynergyInteraction, SynergyInteractionType } from "./SynergyInteraction";

export interface ISynergyComponentInteractionOptions<T extends ModulePlatform> extends ISynergyInteractionOptions<T>{
    customId: string;
}

export abstract class SynergyComponentInteraction<T extends ModulePlatform = ModulePlatform> extends SynergyInteraction {
    public readonly customId: string;

    protected constructor(bot: Synergy, options: ISynergyComponentInteractionOptions<T>) {
        super(bot, options, SynergyInteractionType.Component);
        this.customId = options.customId;
    }
}