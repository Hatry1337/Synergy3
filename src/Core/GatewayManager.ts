import Synergy from "../Synergy";

export abstract class GatewayManager {
    public readonly bot: Synergy;
    public readonly platformId: string;

    protected constructor(bot: Synergy, platformId: string) {
        this.bot = bot;
        this.platformId = platformId;
    }
}