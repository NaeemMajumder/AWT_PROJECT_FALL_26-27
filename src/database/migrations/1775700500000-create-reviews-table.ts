import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateReviewsTable1775700500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "reviews",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "reviewer_id",
            type: "uuid",
          },
          {
            name: "seller_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "vet_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "order_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "consultation_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "rating",
            type: "int",
          },
          {
            name: "comment",
            type: "text",
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
            columnNames: ["reviewer_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
          },
          {
            columnNames: ["seller_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
          },
          {
            columnNames: ["vet_id"],
            referencedTableName: "vet_profiles",
            referencedColumnNames: ["id"],
          },
          {
            columnNames: ["order_id"],
            referencedTableName: "orders",
            referencedColumnNames: ["id"],
          },
          {
            columnNames: ["consultation_id"],
            referencedTableName: "consultations",
            referencedColumnNames: ["id"],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("reviews", true);
  }
}
