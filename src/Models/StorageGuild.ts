import { Table, Model, Column, DataType } from "sequelize-typescript";

@Table({
    timestamps: true,
})
export class StorageGuild extends Model<StorageGuild> {
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        allowNull: false,
    })
    declare id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare group: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare name: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare lang: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare ownerId: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare icon?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare banner?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare systemChannelId?: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    declare botJoinedAt: Date;
}