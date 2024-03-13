import { UnifiedIdString } from "../UnifiedId";
import { EntityType } from "../EntityType";

export default interface UniIdentified {
    unifiedId: UnifiedIdString;
    entityType: EntityType;
}