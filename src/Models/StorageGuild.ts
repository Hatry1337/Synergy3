import { Table, Model, Column, DataType } from "sequelize-typescript";

@Table({
    timestamps: true,
})
export class StorageGuild extends Model {
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        allowNull: false,
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    group!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    lang!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    ownerId!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    icon?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    banner?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    systemChannelId?: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    botJoinedAt!: Date;
}