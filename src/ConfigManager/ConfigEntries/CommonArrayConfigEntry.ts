import { ConfigCommonDataType, TypeOfConfigDataType } from "../ConfigDataTypes";
import BaseConfigEntry, { RawBaseConfigEntry } from "./BaseConfigEntry";
import { ConfigDataStructureOf } from "../ConfigDataStructures";
import { EphemeralArrayConfigEntry } from "./EphemeralArrayConfigEntry";

interface RawArrayConfigEntry<T extends ConfigCommonDataType> extends RawBaseConfigEntry<T> {
    ephemeral: false;
    array: true;
    value: ConfigDataStructureOf<T>[];
}

export default class CommonArrayConfigEntry<T extends ConfigCommonDataType> extends BaseConfigEntry<T>{
    protected data: RawArrayConfigEntry<T>;
    constructor(
        name: string,
        description: string,
        type: T,
        hidden: boolean
    ) {
        super(name, description, type, true, false, hidden);
        this.data = {
            type,
            description,
            hidden,
            ephemeral: this.ephemeral,
            array: this.array,
            value: new Array<ConfigDataStructureOf<T>>()
        } as RawArrayConfigEntry<T>
    }

    public addValue(value: TypeOfConfigDataType<T>) {
        //If provided value is not undefined then output data will be not undefined
        this.data.value.push(this.serializeData(value)!);
    }

    public addValueRaw(value: ConfigDataStructureOf<T>) {
        this.data.value.push(value);
    }

    public setValue(index: number, value: TypeOfConfigDataType<T>) {
        //If provided value is not undefined then output data will be not undefined
        this.data.value[index] = this.serializeData(value)!;
    }

    public setValueRaw(index: number, value: ConfigDataStructureOf<T>) {
        this.data.value[index] = value;
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

    public override serialize(): RawArrayConfigEntry<T> {
        return {
            name: this.name,
            description: this.description,
            type: this.type,
            ephemeral: this.ephemeral as false, //it is false and readonly.. Whyyy typescript.. just why.....
            hidden: this.hidden,
            array: this.array as true,
            value: this.data.value
        };
    }

    public loadData(data: RawArrayConfigEntry<T>) {
        this.data.value = data.value;
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