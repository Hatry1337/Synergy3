import { ConfigCommonDataType, TypeOfConfigDataType } from "../ConfigDataTypes";
import BaseConfigEntry, { RawBaseConfigEntry } from "./BaseConfigEntry";
import { ConfigDataStructureOf } from "../ConfigDataStructures";
import CommonArrayConfigEntry from "./CommonArrayConfigEntry";
import { EphemeralConfigEntry } from "./EphemeralConfigEntry";

export interface RawConfigEntry<T extends ConfigCommonDataType> extends RawBaseConfigEntry<T> {
    array: false;
    ephemeral: false;
    hidden: boolean;
    value: ConfigDataStructureOf<T> | undefined;
}

export default class CommonConfigEntry<T extends ConfigCommonDataType> extends BaseConfigEntry<T>{
    protected data: RawConfigEntry<T>;
    constructor(
        name: string,
        description: string,
        type: T,
        hidden: boolean
    ) {
        super(name, description, type, false, false, hidden);
        this.data = {
            type,
            description,
            hidden,
            ephemeral: this.ephemeral,
            array: this.array,
            value: undefined
        } as RawConfigEntry<T>
    }

    public setValue(value: TypeOfConfigDataType<T> | undefined) {
        this.data.value = this.serializeData(value);
    }

    public setValueRaw(value: ConfigDataStructureOf<T> | undefined) {
        this.data.value = value;
    }

    public getValue(): ConfigDataStructureOf<T> | undefined {
        return this.data.value;
    }

    public override isArray(): this is CommonArrayConfigEntry<T> {
        return super.isArray();
    }

    public override isEphemeral(): this is EphemeralConfigEntry<T> {
        return super.isEphemeral();
    }

    public override serialize(): RawConfigEntry<T> {
        return {
            name: this.name,
            description: this.description,
            type: this.type,
            ephemeral: this.ephemeral as false,
            hidden: this.hidden,
            array: this.array as false,
            value: this.data.value
        };
    }

    public loadData(data: RawConfigEntry<T>) {
        this.data.value = data.value;
    }

    public isString(): this is CommonConfigEntry<"string"> {
        return this.type === "string";
    }
    public isInt(): this is CommonConfigEntry<"int"> {
        return this.type === "int";
    }
    public isNumber(): this is CommonConfigEntry<"number"> {
        return this.type === "number";
    }
    public isBoolean(): this is CommonConfigEntry<"bool"> {
        return this.type === "bool";
    }
    public isObject(): this is CommonConfigEntry<"object"> {
        return this.type === "object";
    }
    public isChannel(): this is CommonConfigEntry<"channel"> {
        return this.type === "channel";
    }
    public isUser(): this is CommonConfigEntry<"user"> {
        return this.type === "user";
    }
    public isRole(): this is CommonConfigEntry<"role"> {
        return this.type === "role";
    }
    public isAttachment(): this is CommonConfigEntry<"attachment"> {
        return this.type === "attachment";
    }
}