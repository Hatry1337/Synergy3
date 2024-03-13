import { SynergyPlatformAdapter } from "./SynergyPlatformAdapter";
import User from "../Entity/User";
import { SynergeticCommand } from "./SynergeticCommand";

export interface Synergent {
    adapter: SynergyPlatformAdapter;
    user: User;
}

export interface MessageSynergent extends Synergent {
    content: string;
}

export interface CommandSynergent extends Synergent {
    command: SynergeticCommand;
}

export type SynergentListener<T extends Synergent> = (event: T) => void;
