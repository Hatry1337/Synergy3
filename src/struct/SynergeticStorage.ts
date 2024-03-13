export interface SynergeticStorageNamespace<T> {
    name: string;
    getKeys(): string[];
    readObject(key: string): T;
    writeObject(key: string, obj: T): void;
}

export interface SynergeticStorage<T> {
    createNamespace(): SynergeticStorageNamespace<T>;
    getNamespace(name: string): SynergeticStorageNamespace<T> | undefined;
    getAllNamespaces(): SynergeticStorageNamespace<T>[];
    wipeNamespace(name: string): void;
    renameNamespace(name: string, newName: string): SynergeticStorageNamespace<T>;
}