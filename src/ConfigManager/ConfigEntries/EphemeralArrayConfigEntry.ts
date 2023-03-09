import { ConfigCommonDataType, TypeOfConfigDataType } from "../ConfigDataTypes";
import BaseConfigEntry from "./BaseConfigEntry";
import { ConfigDataStructureOf } from "../ConfigDataStructures";

interface RawEphemeralArrayConfigEntry<T extends ConfigCommonDataType> {
    type: T;
    hidden: boolean;
    ephemeral: true;
    array: true;
    values: {
        [key: string]: any[];
    }
}

export class EphemeralArrayConfigEntry<T extends ConfigCommonDataType> extends BaseConfigEntry<T> {
    protected data: RawEphemeralArrayConfigEntry<T>;
    constructor(
        name: string,
        type: ConfigCommonDataType,
        hidden: boolean
    ) {
        super(name, type, true, true, hidden);
        this.data = {
            type,
            hidden,
            ephemeral: this.ephemeral,
            array: this.array,
            values: {}
        } as RawEphemeralArrayConfigEntry<T>
    }

    public addValue(ephemeralTarget: string, value: TypeOfConfigDataType<T>) {
        if(!this.data.values[ephemeralTarget]) {
            this.data.values[ephemeralTarget] = [];
        }
        this.data.values[ephemeralTarget].push(this.serializeData(value));
    }

    public setValue(ephemeralTarget: string, index: number, value: TypeOfConfigDataType<T>) {
        if(!this.data.values[ephemeralTarget]) {
            this.data.values[ephemeralTarget] = [];
        }
        this.data.values[ephemeralTarget][index] = this.serializeData(value);
    }

    public getValue(ephemeralTarget: string, index: number): ConfigDataStructureOf<T> | undefined {
        if(!this.data.values[ephemeralTarget]) {
            return undefined;
        }
        return this.data.values[ephemeralTarget][index];
    }

    public getValues(ephemeralTarget: string): ConfigDataStructureOf<T>[] {
        if(!this.data.values[ephemeralTarget]) {
            return [];
        }
        return this.data.values[ephemeralTarget];
    }

    public deleteValue(ephemeralTarget: string, index: number, count: number = 1) {
        if(!this.data.values[ephemeralTarget]) {
            return;
        }
        this.data.values[ephemeralTarget].splice(index, count);
    }

    public override isArray(): this is EphemeralArrayConfigEntry<T> {
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
            values: this.data.values
        };
    }

    public isString(): this is EphemeralArrayConfigEntry<"string"> {
        return this.type === "string";
    }
    public isInt(): this is EphemeralArrayConfigEntry<"int"> {
        return this.type === "int";
    }
    public isNumber(): this is EphemeralArrayConfigEntry<"number"> {
        return this.type === "number";
    }
    public isBoolean(): this is EphemeralArrayConfigEntry<"bool"> {
        return this.type === "bool";
    }
    public isObject(): this is EphemeralArrayConfigEntry<"object"> {
        return this.type === "object";
    }
    public isChannel(): this is EphemeralArrayConfigEntry<"channel"> {
        return this.type === "channel";
    }
    public isUser(): this is EphemeralArrayConfigEntry<"user"> {
        return this.type === "user";
    }
    public isRole(): this is EphemeralArrayConfigEntry<"role"> {
        return this.type === "role";
    }
    public isAttachment(): this is EphemeralArrayConfigEntry<"attachment"> {
        return this.type === "attachment";
    }
}