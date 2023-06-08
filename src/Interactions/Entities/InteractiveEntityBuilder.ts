import { AccessTarget } from "../../Structures/Access";

export abstract class InteractiveEntityBuilder<T> {
    public access: AccessTarget[] = [];
    public execCallback?: (int: T) => Promise<void>;

    public setAccess(access: AccessTarget[]) {
        this.access = access;
        return this;
    }

    /**
     *  Set command callback function
     * @param callback function to execute when received interaction
     */
    public setCallback(callback: (int: T) => Promise<void>) {
        this.execCallback = callback;
        return this;
    }
}