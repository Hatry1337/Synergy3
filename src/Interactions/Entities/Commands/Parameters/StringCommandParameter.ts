import { BaseCommandParameter, BaseCommandParameterType } from "./BaseCommandParameter";

export class StringCommandParameter extends BaseCommandParameter {
    public value?: string;
    public defaultValue?: string;
    public minLength?: number;
    public maxLength?: number;

    constructor() {
        super(BaseCommandParameterType.String);
    }

    public setMinLength(length: number): this {
        this.minLength = length;
        return this;
    }

    public setMaxLength(length: number): this {
        this.maxLength = length;
        return this;
    }

    public setDefaultValue(value: string): this {
        this.value = value;
        return this;
    }
}