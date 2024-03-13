import { SynergyPlatformAdapter } from "./struct/SynergyPlatformAdapter";
import { Platform } from "./Platform";

export class Synergy {
    private adapters: Map<Platform, SynergyPlatformAdapter> = new Map();

    public constructor() {
    }

    public connectAdapter(adapter: SynergyPlatformAdapter) {
        this.adapters.set(adapter.getPlatformId(), adapter);
    }

    public async start() {
        for(let a of this.adapters.values()) {
            try {
                console.log(`Initializing adapter name=${a.getPlatformName()}, platformId=${a.getPlatformId()}`)
                a.init(this);
            } catch (e) {
                console.error(`Failed to initialize adapter name=${a.getPlatformName()}, platformId=${a.getPlatformId()}:`, e);
            }
        }
    }
}