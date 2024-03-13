import { CommandSynergent, MessageSynergent, SynergentListener } from "./Synergent";
import { PlatformUser } from "./PlatformUser";
import { Synergy } from "../Synergy";

export interface SynergyPlatformAdapter {
    init(synergy: Synergy): void;

    getPlatformId(): number;
    getPlatformName(): string;

    getPlatformUser(unifiedId: string): PlatformUser | undefined;

    addMessageEventListener(event: SynergentListener<MessageSynergent>): void;
    addCommandEventListener(event: SynergentListener<CommandSynergent>): void;
}