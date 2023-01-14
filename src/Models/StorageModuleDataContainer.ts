import { Table, Model, Column, DataType } from "sequelize-typescript";

@Table({
    timestamps: true,
})

export class StorageModuleDataContainer extends Model<StorageModuleDataContainer> {
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        allowNull: false,
    })
    declare uuid: string;

    @Column({
        type: DataType.JSONB,
        allowNull: false,
        defaultValue: {}
    })
    declare kvData: {[key: string]: any};
}