import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { StorageUser } from "./StorageUser";

@Table({
    timestamps: true,
})
export class StorageUserDiscordInfo extends Model {
    @ForeignKey(() => StorageUser)
    @PrimaryKey
    @Column
    declare id: number;

    @BelongsTo(() => StorageUser)
    declare user: StorageUser;

    //Discord Options
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare discordId: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare discordTag: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare discordAvatar: string | null;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare discordBanner: string | null;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    declare discordCreatedAt: Date;
}