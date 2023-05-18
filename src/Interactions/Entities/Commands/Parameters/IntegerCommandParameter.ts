import { BaseCommandParameter, BaseCommandParameterType } from "./BaseCommandParameter";
import { InvalidCommandParameterValueError } from "./InvalidCommandParameterValueError";

export class IntegerCommandParameter extends BaseCommandParameter {
    public value?: number;
    public defaultValue?: number;
    public min?: number;
    public max?: number;

    constructor() {
        super(BaseCommandParameterType.Integer);
    }

    public setDefaultValue(value: number): this {
        if(!Number.isInteger(value)) {
            throw new InvalidCommandParameterValueError(this.name, value, this.type);
        }
        this.defaultValue = value;
        return this;
    }

    public setMinValue(minValue: number): this {
        if(!Number.isInteger(minValue)) {
            throw new InvalidCommandParameterValueError(this.name, minValue, this.type);
        }
        this.min = minValue;
        return this;
    }

    public setMaxValue(maxValue: number): this {
        if(!Number.isInteger(maxValue)) {
            throw new InvalidCommandParameterValueError(this.name, maxValue, this.type);
        }
        this.max = maxValue;
        return this;
    }
}