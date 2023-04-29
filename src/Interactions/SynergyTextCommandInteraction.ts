import {
    ISynergyBaseCommandInteractionOptions,
    SynergyBaseCommandInteraction
} from "./SynergyBaseCommandInteraction";
import { ModulePlatform } from "../Modules/Module";
import Synergy from "../Synergy";

export abstract class SynergyTextCommandInteraction extends SynergyBaseCommandInteraction<ModulePlatform.TextBased> {
    protected constructor(bot: Synergy, options: ISynergyBaseCommandInteractionOptions<ModulePlatform.TextBased>) {
        super(bot, {
            ...options,
            platform: ModulePlatform.TextBased
        });
    }
}