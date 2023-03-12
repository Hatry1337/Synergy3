import { Table, Model, Column, DataType, ForeignKey, BelongsTo, PrimaryKey } from "sequelize-typescript";
import { StorageUser } from "./StorageUser";

@Table({
    timestamps: true,
})
export class StorageUserEconomyInfo extends Model<StorageUserEconomyInfo> {
    @ForeignKey(() => StorageUser)
    @PrimaryKey
    @Column
    id!: number;

    @BelongsTo(() => StorageUser)
    user!: StorageUser

    //Economy Options
    @Column({
        type: DataType.REAL,
        allowNull: false,
    })
    economyPoints!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1
    })
    economyLVL!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0
    })
    economyXP!: number;
}