import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateNotificationsTable1775700400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "notifications",
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
          },
          {
            name: "type",
            type: "enum",
            enum: ["outbid", "auction_won", "no_bid_offer", "request_accepted", "request_rejected", "order_expired", "application_reviewed"],
          },
          {
            name: "message",
            type: "varchar",
          },
          {
            name: "auction_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "is_read",
            type: "boolean",
            default: false,
          },
          {
            name: "created_at",
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
    await queryRunner.dropTable("notifications", true);
  }
}
