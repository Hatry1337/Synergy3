import { Column, DataType, HasOne, Model, Table } from "sequelize-typescript";
import { StorageUserDiscordInfo } from "./StorageUserDiscordInfo";
import { StorageUserEconomyInfo } from "./StorageUserEconomyInfo";
import { UnifiedId, UnifiedIdDataType } from "../UnifiedId";

interface StorageUserMeta{
}

@Table({
    timestamps: true,
})
export class StorageUser extends Model<StorageUser> {
    //Main Options
    @Column({
        type: DataType.STRING,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => UnifiedId.generate(UnifiedIdDataType.User).toString(16)
    })
    declare unifiedId: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare nickname: string;

    @Column({
        type: DataType.JSONB,
        allowNull: false,
        defaultValue: [ "player" ]
    })
    declare groups: string[];

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: "en"
    })
    declare lang: string;

    @HasOne(() => StorageUserDiscordInfo)
    declare discord?: StorageUserDiscordInfo;

    @HasOne(() => StorageUserEconomyInfo)
    declare economy: StorageUserEconomyInfo;

    //Other
    @Column({
        type: DataType.JSONB,
        allowNull: false,
        defaultValue: {}
    })
    declare meta: StorageUserMeta;
}