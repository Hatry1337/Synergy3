import { SynergeticStorage, SynergeticStorageNamespace } from "../struct/SynergeticStorage";
import User from "../Entity/User";

export class SynergeticUserStorage implements SynergeticStorage<User> {
    createNamespace(): SynergeticStorageNamespace<User> {
        throw new Error("Method not implemented.");
    }
    getNamespace(name: string): SynergeticStorageNamespace<User> | undefined {
        throw new Error("Method not implemented.");
    }
    getAllNamespaces(): SynergeticStorageNamespace<User>[] {
        throw new Error("Method not implemented.");
    }
    wipeNamespace(name: string): void {
        throw new Error("Method not implemented.");
    }
    renameNamespace(name: string, newName: string): SynergeticStorageNamespace<User> {
        throw new Error("Method not implemented.");
    }

}