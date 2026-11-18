import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateSellerProfilesTable1775500200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "seller_profiles",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
            type: "uuid",
            isUnique: true,
          },
          {
            name: "shop_name",
            type: "varchar",
          },
          {
            name: "seller_type",
            type: "enum",
            enum: ["individual", "shop"],
            default: "'individual'",
          },
          {
            name: "document_path",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "status",
            type: "enum",
            enum: ["pending", "approved", "rejected"],
            default: "'pending'",
          },
          {
            name: "reject_reason",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "reviewed_at",
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
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("seller_profiles", true);
  }
}
