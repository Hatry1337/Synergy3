import { BaseCommandParameterType } from "./BaseCommandParameter";

export class InvalidCommandParameterValueError extends Error {
    constructor(public paramName: string, public value: any, public expectedValueType: BaseCommandParameterType) {
        super(`Parameter "${paramName}" have invalid value "${value}" (expected: ${expectedValueType}).`);
    }
}