import { ConfigCommonDataType, TypeOfConfigDataType } from "../ConfigDataTypes";
import BaseConfigEntry, { RawBaseConfigEntry } from "./BaseConfigEntry";
import { ConfigDataStructureOf } from "../ConfigDataStructures";
import { EphemeralArrayConfigEntry } from "./EphemeralArrayConfigEntry";

interface RawEphemeralConfigEntry<T extends ConfigCommonDataType> extends RawBaseConfigEntry<T> {
    ephemeral: true;
    array: false;
    values: {
        [key: string]: ConfigDataStructureOf<T> | undefined;
    }
}

export class EphemeralConfigEntry<T extends ConfigCommonDataType> extends BaseConfigEntry<T> {
    protected data: RawEphemeralConfigEntry<T>;
    constructor(
        name: string,
        description: string,
        type: T,
        hidden: boolean
    ) {
        super(name, description, type, false, true, hidden);
        this.data = {
            type,
            description,
            hidden,
            ephemeral: this.ephemeral,
            array: this.array,
            values: {}
        } as RawEphemeralConfigEntry<T>
    }

    public setValue(ephemeralTarget: string, value: TypeOfConfigDataType<T> | undefined) {
        this.data.values[ephemeralTarget] = this.serializeData(value);
    }

    public setValueRaw(ephemeralTarget: string, value: ConfigDataStructureOf<T> | undefined) {
        this.data.values[ephemeralTarget] = value;
    }

    public getValue(ephemeralTarget: string): ConfigDataStructureOf<T> | undefined {
        return this.data.values[ephemeralTarget];
    }

    public override isArray(): this is EphemeralArrayConfigEntry<T> {
        return super.isArray();
    }

    public override isEphemeral(): this is EphemeralConfigEntry<T> {
        return super.isEphemeral();
    }

    public override serialize(): RawEphemeralConfigEntry<T> {
        return {
            name: this.name,
            description: this.description,
            type: this.type,
            ephemeral: this.ephemeral as true,
            hidden: this.hidden,
            array: this.array as false,
            values: this.data.values
        };
    }

    public loadData(data: RawEphemeralConfigEntry<T>) {
        this.data.values = data.values;
    }

    public isString(): this is EphemeralConfigEntry<"string"> {
        return this.type === "string";
    }
    public isInt(): this is EphemeralConfigEntry<"int"> {
        return this.type === "int";
    }
    public isNumber(): this is EphemeralConfigEntry<"number"> {
        return this.type === "number";
    }
    public isBoolean(): this is EphemeralConfigEntry<"bool"> {
        return this.type === "bool";
    }
    public isObject(): this is EphemeralConfigEntry<"object"> {
        return this.type === "object";
    }
    public isChannel(): this is EphemeralConfigEntry<"channel"> {
        return this.type === "channel";
    }
    public isUser(): this is EphemeralConfigEntry<"user"> {
        return this.type === "user";
    }
    public isRole(): this is EphemeralConfigEntry<"role"> {
        return this.type === "role";
    }
    public isAttachment(): this is EphemeralConfigEntry<"attachment"> {
        return this.type === "attachment";
    }
}