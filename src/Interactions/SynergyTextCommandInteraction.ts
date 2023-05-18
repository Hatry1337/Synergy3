import { ModulePlatform } from "../Modules/Module";
import Synergy from "../Synergy";
import { ISynergyCommandInteractionOptions, SynergyCommandInteraction } from "./SynergyCommandInteraction";

export abstract class SynergyTextCommandInteraction extends SynergyCommandInteraction<ModulePlatform.TextBased> {
    protected constructor(bot: Synergy, options: Omit<ISynergyCommandInteractionOptions<ModulePlatform.TextBased>, "platform">) {
        super(bot, {
            ...options,
            platform: ModulePlatform.TextBased
        });
    }
}