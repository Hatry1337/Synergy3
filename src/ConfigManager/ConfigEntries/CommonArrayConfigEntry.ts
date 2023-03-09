import { ConfigCommonDataType, TypeOfConfigDataType } from "../ConfigDataTypes";
import BaseConfigEntry from "./BaseConfigEntry";
import { ConfigDataStructureOf } from "../ConfigDataStructures";
import { EphemeralConfigEntry } from "./EphemeralConfigEntry";
import { EphemeralArrayConfigEntry } from "./EphemeralArrayConfigEntry";

interface RawArrayConfigEntry<T extends ConfigCommonDataType> {
    type: T;
    hidden: boolean;
    ephemeral: false;
    array: true;
    value: any[];
}

export default class CommonArrayConfigEntry<T extends ConfigCommonDataType> extends BaseConfigEntry<T>{
    protected data: RawArrayConfigEntry<T>;
    constructor(
        name: string,
        type: ConfigCommonDataType,
        hidden: boolean
    ) {
        super(name, type, true, false, hidden);
        this.data = {
            type,
            hidden,
            ephemeral: this.ephemeral,
            array: this.array,
            value: new Array<any>()
        } as RawArrayConfigEntry<T>
    }

    public addValue(value: TypeOfConfigDataType<T>) {
        this.data.value.push(this.serializeData(value));
    }

    public setValue(index: number, value: TypeOfConfigDataType<T>) {
        this.data.value[index] = this.serializeData(value);
    }

    public getValue(index: number): ConfigDataStructureOf<T> | undefined {
        return this.data.value[index];
    }

    public getValues(): ConfigDataStructureOf<T>[] {
        return this.data.value;
    }

    public deleteValue(index: number, count: number = 1) {
        this.data.value.splice(index, count);
    }

    public override isArray(): this is CommonArrayConfigEntry<T> {
        return super.isArray();
    }

    public override isEphemeral(): this is EphemeralArrayConfigEntry<T> {
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

    public isString(): this is CommonArrayConfigEntry<"string"> {
        return this.type === "string";
    }
    public isInt(): this is CommonArrayConfigEntry<"int"> {
        return this.type === "int";
    }
    public isNumber(): this is CommonArrayConfigEntry<"number"> {
        return this.type === "number";
    }
    public isBoolean(): this is CommonArrayConfigEntry<"bool"> {
        return this.type === "bool";
    }
    public isObject(): this is CommonArrayConfigEntry<"object"> {
        return this.type === "object";
    }
    public isChannel(): this is CommonArrayConfigEntry<"channel"> {
        return this.type === "channel";
    }
    public isUser(): this is CommonArrayConfigEntry<"user"> {
        return this.type === "user";
    }
    public isRole(): this is CommonArrayConfigEntry<"role"> {
        return this.type === "role";
    }
    public isAttachment(): this is CommonArrayConfigEntry<"attachment"> {
        return this.type === "attachment";
    }
}