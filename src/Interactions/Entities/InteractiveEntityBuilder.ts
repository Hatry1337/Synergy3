import { AccessTarget } from "../../Structures/Access";

export class InteractiveEntityBuilder<T> {
    public name!: string;
    public description!: string;
    public access: AccessTarget[] = [];
    public execCallback?: (int: T) => Promise<void>;

    public setName(name: string) {
        this.name = name;
        return this;
    }

    public setDescription(description: string) {
        this.description = description;
        return this;
    }

    public setAccess(access: AccessTarget[]) {
        this.access = access;
        return this;
    }

    /**
     *  Set command callback function
     * @param callback function to execute when received interaction
     */
    public onExecute(callback: (int: T) => Promise<void>){
        this.execCallback = callback;
        return this;
    }
}