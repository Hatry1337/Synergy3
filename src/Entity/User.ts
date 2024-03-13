import UniIdentified from "../struct/UniIdentified";
import { UnifiedIdString } from "../UnifiedId";
import { UserPlatform } from "../struct/UserPlatform";
import { EntityType } from "../EntityType";

interface UserOptions {
    unifiedId: UnifiedIdString;
    name: string;
    platforms: UserPlatform[];
}

export default class User implements UniIdentified {
    public readonly entityType: EntityType = EntityType.USER;
    public readonly unifiedId: UnifiedIdString;
    public name: string;
    public platforms: UserPlatform[];

    public constructor(options: UserOptions) {
        this.unifiedId = options.unifiedId;
        this.name = options.name;
        this.platforms = options.platforms;
    }
}