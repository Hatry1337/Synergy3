import { Table, Model, Column, DataType, ForeignKey, BelongsTo, PrimaryKey } from "sequelize-typescript";
import { StorageUser } from "./StorageUser";

@Table({
    timestamps: true,
})
export class StorageUserDiscordInfo extends Model {
    @ForeignKey(() => StorageUser)
    @PrimaryKey
    @Column
    id!: number;

    @BelongsTo(() => StorageUser)
    user!: StorageUser

    //Discord Options
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    discordId!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    discordTag!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    discordAvatar!: string | null;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    discordBanner!: string | null;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    discordCreatedAt!: Date;
}