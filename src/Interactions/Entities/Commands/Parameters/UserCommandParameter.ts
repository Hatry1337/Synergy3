import { BaseCommandParameter, BaseCommandParameterType } from "./BaseCommandParameter";

export class UserCommandParameter extends BaseCommandParameter {
    public value?: string;
    public defaultValue?: string;

    constructor() {
        super(BaseCommandParameterType.String);
    }

    public setDefaultValue(value: string): this {
        this.value = value;
        return this;
    }
}