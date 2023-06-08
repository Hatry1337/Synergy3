import { InteractiveEntityBuilder } from "../InteractiveEntityBuilder";
import { SynergyComponentInteraction } from "../../SynergyComponentInteraction";

export abstract class SynergyComponentBuilder<T extends SynergyComponentInteraction = SynergyComponentInteraction> extends InteractiveEntityBuilder<T> {
    public customId!: string;

    public setCustomId(customId: string): this {
        this.customId = customId;
        return this;
    }
}