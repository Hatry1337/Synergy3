import { BaseCommandParameter, BaseCommandParameterType } from "./BaseCommandParameter";

export class NumberCommandParameter extends BaseCommandParameter {
    public value?: number;
    public defaultValue?: number;
    public min?: number;
    public max?: number;

    constructor() {
        super(BaseCommandParameterType.Number);
    }

    public setDefaultValue(value: number): this {
        this.defaultValue = value;
        return this;
    }

    public setMinValue(minValue: number): this {
        this.min = minValue;
        return this;
    }

    public setMaxValue(maxValue: number): this {
        this.max = maxValue;
        return this;
    }
}