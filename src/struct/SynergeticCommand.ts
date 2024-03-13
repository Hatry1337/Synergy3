interface SynergeticCommandArgument {
    name: string;
    index: number;
    value: string;
}

export class SynergeticCommand {
    public readonly id: number;
    public readonly name: string;
    private arguments: SynergeticCommandArgument[] = [];

    public constructor(id: number, name: string, args: SynergeticCommandArgument[]) {
        this.id = id;
        this.name = name;
        this.arguments = args;
    }

    public getArgument(nameOrIndex: string | number): SynergeticCommandArgument | undefined {
        if(typeof nameOrIndex === "string") {
            return this.arguments.find(a => a.name === nameOrIndex);
        } else {
            return this.arguments.find(a => a.index === nameOrIndex)
        }
    }
}