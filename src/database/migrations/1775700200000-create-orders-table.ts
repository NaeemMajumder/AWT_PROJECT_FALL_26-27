import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateOrdersTable1775700200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "orders",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "buyer_id",
            type: "uuid",
          },
          {
            name: "order_type",
            type: "enum",
            enum: ["product", "pet"],
          },
          {
            name: "source",
            type: "enum",
            enum: ["cart", "request", "auction"],
          },
          {
            name: "source_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "total_amount",
            type: "numeric",
            precision: 12,
            scale: 2,
          },
          {
            name: "status",
            type: "enum",
            enum: ["pending", "paid", "completed", "cancelled", "expired"],
            default: "'pending'",
          },
          {
            name: "pay_by",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
        ],
        foreignKeys: [
          {
            columnNames: ["buyer_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "order_items",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "order_id",
            type: "uuid",
          },
          {
            name: "seller_id",
            type: "uuid",
          },
          {
            name: "product_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "pet_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "quantity",
            type: "int",
            default: 1,
          },
          {
            name: "unit_price",
            type: "numeric",
            precision: 12,
            scale: 2,
          },
        ],
        foreignKeys: [
          {
            columnNames: ["order_id"],
            referencedTableName: "orders",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            columnNames: ["seller_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
          },
          {
            columnNames: ["product_id"],
            referencedTableName: "products",
            referencedColumnNames: ["id"],
          },
          {
            columnNames: ["pet_id"],
            referencedTableName: "pets",
            referencedColumnNames: ["id"],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("order_items", true);
    await queryRunner.dropTable("orders", true);
  }
}
