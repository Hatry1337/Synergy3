import { Table, Model, Column, DataType } from "sequelize-typescript";

@Table({
    timestamps: true,
})

export class StorageModuleDataContainer extends Model {
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        allowNull: false,
    })
    uuid!: string;

    @Column({
        type: DataType.JSONB,
        allowNull: false,
        defaultValue: {}
    })
    kvData!: {[key: string]: any};
}