import { ConfigCommonDataType, TypeOfConfigDataType } from "../ConfigDataTypes";
import BaseConfigEntry from "./BaseConfigEntry";
import { ConfigDataStructureOf } from "../ConfigDataStructures";
import CommonArrayConfigEntry from "./CommonArrayConfigEntry";
import { EphemeralConfigEntry } from "./EphemeralConfigEntry";

interface RawConfigEntry<T extends ConfigCommonDataType> {
    type: T;
    hidden: boolean;
    ephemeral: false;
    array: false;
    value: any;
}

export default class CommonConfigEntry<T extends ConfigCommonDataType> extends BaseConfigEntry<T>{
    protected data: RawConfigEntry<T>;
    constructor(
        name: string,
        type: ConfigCommonDataType,
        hidden: boolean
    ) {
        super(name, type, false, false, hidden);
        this.data = {
            type,
            hidden,
            ephemeral: this.ephemeral,
            array: this.array,
            value: undefined
        } as RawConfigEntry<T>
    }

    public setValue(value: TypeOfConfigDataType<T>) {
        this.data.value = this.serializeData(value);
    }

    public getValue(): ConfigDataStructureOf<T> {
        return this.data.value;
    }

    public override isArray(): this is CommonArrayConfigEntry<T> {
        return super.isArray();
    }

    public override isEphemeral(): this is EphemeralConfigEntry<T> {
        return super.isEphemeral();
    }

    public override serialize(): object {
        return {
            name: this.name,
            type: this.type,
            ephemeral: this.ephemeral,
            hidden: this.hidden,
            array: this.data.array,
            value: this.data.value
        };
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