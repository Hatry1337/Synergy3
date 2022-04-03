import { Table, Model, Column, DataType, HasOne } from "sequelize-typescript";
import { StorageUserDiscordInfo } from "./StorageUserDiscordInfo";
import { StorageUserEconomyInfo } from "./StorageUserEconomyInfo";

interface StorageUserMeta{
}

@Table({
    timestamps: true,
})
export class StorageUser extends Model {
    //Main Options
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    })
    id!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    nickname!: string;

    @Column({
        type: DataType.JSONB,
        allowNull: false,
        defaultValue: [ "player" ]
    })
    groups!: string[];

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: "en"
    })
    lang!: string;

    @HasOne(() => StorageUserDiscordInfo)
    discord!: StorageUserDiscordInfo;

    @HasOne(() => StorageUserEconomyInfo)
    economy!: StorageUserEconomyInfo;

    //Other
    @Column({
        type: DataType.JSONB,
        allowNull: false,
        defaultValue: {}
    })
    meta!: StorageUserMeta;
}