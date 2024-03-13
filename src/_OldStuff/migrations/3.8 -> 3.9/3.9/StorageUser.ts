import { Column, DataType, HasOne, Model, Table } from "sequelize-typescript";
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
    declare id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare nickname: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare discordId: string;

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
    declare discord: StorageUserDiscordInfo;

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