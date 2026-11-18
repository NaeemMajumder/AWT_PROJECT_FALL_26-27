import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePaymentsTable1775700300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "payments",
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
            isUnique: true,
          },
          {
            name: "method",
            type: "enum",
            enum: ["cash_on_delivery", "online_simulated"],
            default: "'online_simulated'",
          },
          {
            name: "status",
            type: "enum",
            enum: ["pending", "paid", "failed"],
            default: "'pending'",
          },
          {
            name: "amount",
            type: "numeric",
            precision: 12,
            scale: 2,
          },
          {
            name: "transaction_ref",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "paid_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
        ],
        foreignKeys: [
          {
            columnNames: ["order_id"],
            referencedTableName: "orders",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("payments", true);
  }
}
