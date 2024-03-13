import { Table, Model, Column, DataType, ForeignKey, BelongsTo, PrimaryKey } from "sequelize-typescript";
import { StorageUser } from "./StorageUser";

@Table({
    timestamps: true,
})
export class StorageUserEconomyInfo extends Model<StorageUserEconomyInfo> {
    @ForeignKey(() => StorageUser)
    @PrimaryKey
    @Column
    declare unifiedId: string;

    @BelongsTo(() => StorageUser)
    declare user: StorageUser

    //Economy Options
    @Column({
        type: DataType.REAL,
        allowNull: false,
    })
    declare economyPoints: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1
    })
    declare economyLVL: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0
    })
    declare economyXP: number;
}