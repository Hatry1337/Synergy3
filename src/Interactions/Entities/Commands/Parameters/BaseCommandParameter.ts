import { AccessTarget } from "../../../../Structures/Access";
import { StringCommandParameter } from "./StringCommandParameter";
import { NumberCommandParameter } from "./NumberCommandParameter";
import { IntegerCommandParameter } from "./IntegerCommandParameter";
import { UserCommandParameter } from "./UserCommandParameter";

export enum BaseCommandParameterType {
    String = "string",
    Number = "number",
    Integer = "integer",
    User = "user",

}

export abstract class BaseCommandParameter {
    public name!: string;
    public description!: string;
    public access: AccessTarget[] = [];
    public required: boolean = true;

    protected constructor(public readonly type: BaseCommandParameterType) { }

    public setName(name: string): this {
        this.name = name;
        return this;
    }

    public setDescription(description: string): this {
        this.description = description;
        return this;
    }

    public setRequired(required: boolean): this {
        this.required = required;
        return this;
    }

    public setAccess(access: AccessTarget[]): this {
        this.access = access;
        return this;
    }

    public isString(): this is StringCommandParameter {
        return this.type === BaseCommandParameterType.String;
    }
    public isNumber(): this is NumberCommandParameter {
        return this.type === BaseCommandParameterType.Number;
    }
    public isInteger(): this is IntegerCommandParameter {
        return this.type === BaseCommandParameterType.Integer;
    }
    public isUser(): this is UserCommandParameter {
        return this.type === BaseCommandParameterType.User;
    }
}