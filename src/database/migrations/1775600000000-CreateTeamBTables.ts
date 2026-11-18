import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateTeamBTables1775600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "species",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "name",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "category",
            type: "varchar",
          },
          {
            name: "min_age_weeks",
            type: "int",
            default: 0,
          },
          {
            name: "vaccination_required",
            type: "boolean",
            default: false,
          },
          {
            name: "is_allowed",
            type: "boolean",
            default: true,
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
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "pets",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "owner_id",
            type: "uuid",
          },
          {
            name: "species_id",
            type: "uuid",
          },
          {
            name: "title",
            type: "varchar",
          },
          {
            name: "breed",
            type: "varchar",
          },
          {
            name: "gender",
            type: "enum",
            enum: ["male", "female", "unknown"],
            default: "'unknown'",
          },
          {
            name: "birth_date",
            type: "date",
          },
          {
            name: "vaccinated",
            type: "boolean",
            default: false,
          },
          {
            name: "listing_type",
            type: "enum",
            enum: ["sale", "adoption"],
          },
          {
            name: "is_rescue",
            type: "boolean",
            default: false,
          },
          {
            name: "district",
            type: "varchar",
          },
          {
            name: "area",
            type: "varchar",
          },
          {
            name: "price",
            type: "numeric",
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: "status",
            type: "enum",
            enum: ["pending_review", "available", "reserved", "in_auction", "sold", "adopted", "rejected", "withdrawn"],
            default: "'pending_review'",
          },
          {
            name: "photo_path",
            type: "varchar",
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
            columnNames: ["owner_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
          },
          {
            columnNames: ["species_id"],
            referencedTableName: "species",
            referencedColumnNames: ["id"],
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "pet_requests",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "pet_id",
            type: "uuid",
          },
          {
            name: "requester_id",
            type: "uuid",
          },
          {
            name: "type",
            type: "enum",
            enum: ["purchase", "adoption"],
          },
          {
            name: "message",
            type: "text",
          },
          {
            name: "status",
            type: "enum",
            enum: ["pending", "accepted", "rejected", "cancelled", "expired"],
            default: "'pending'",
          },
          {
            name: "decided_at",
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
            columnNames: ["pet_id"],
            referencedTableName: "pets",
            referencedColumnNames: ["id"],
          },
          {
            columnNames: ["requester_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "auctions",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "pet_id",
            type: "uuid",
          },
          {
            name: "seller_id",
            type: "uuid",
          },
          {
            name: "start_price",
            type: "numeric",
            precision: 12,
            scale: 2,
          },
          {
            name: "round_no",
            type: "int",
            default: 1,
          },
          {
            name: "duration_hours",
            type: "numeric",
            precision: 6,
            scale: 2,
          },
          {
            name: "start_time",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "end_time",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "extension_count",
            type: "int",
            default: 0,
          },
          {
            name: "highest_bid",
            type: "numeric",
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          {
            name: "highest_bidder_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "status",
            type: "enum",
            enum: ["requested", "scheduled", "live", "awaiting_seller", "ended", "unsold", "withdrawn", "rejected", "cancelled"],
            default: "'requested'",
          },
          {
            name: "offer_price",
            type: "numeric",
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          {
            name: "offer_expires_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "winner_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "approved_by",
            type: "uuid",
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
            columnNames: ["pet_id"],
            referencedTableName: "pets",
            referencedColumnNames: ["id"],
          },
          {
            columnNames: ["seller_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
          },
          {
            columnNames: ["highest_bidder_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
          },
          {
            columnNames: ["winner_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "bids",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "auction_id",
            type: "uuid",
          },
          {
            name: "bidder_id",
            type: "uuid",
          },
          {
            name: "amount",
            type: "numeric",
            precision: 12,
            scale: 2,
          },
          {
            name: "edit_count",
            type: "int",
            default: 0,
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
        uniques: [
          {
            name: "UQ_bids_auction_bidder",
            columnNames: ["auction_id", "bidder_id"],
          },
        ],
        foreignKeys: [
          {
            columnNames: ["auction_id"],
            referencedTableName: "auctions",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            columnNames: ["bidder_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "bid_revisions",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "bid_id",
            type: "uuid",
          },
          {
            name: "old_amount",
            type: "numeric",
            precision: 12,
            scale: 2,
          },
          {
            name: "new_amount",
            type: "numeric",
            precision: 12,
            scale: 2,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
        ],
        foreignKeys: [
          {
            columnNames: ["bid_id"],
            referencedTableName: "bids",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "consultations",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "vet_id",
            type: "uuid",
          },
          {
            name: "user_id",
            type: "uuid",
          },
          {
            name: "species_id",
            type: "uuid",
          },
          {
            name: "pet_name",
            type: "varchar",
          },
          {
            name: "problem_note",
            type: "text",
          },
          {
            name: "date",
            type: "date",
          },
          {
            name: "start_time",
            type: "time",
          },
          {
            name: "end_time",
            type: "time",
          },
          {
            name: "mode",
            type: "enum",
            enum: ["online", "chamber"],
          },
          {
            name: "room_code",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "status",
            type: "enum",
            enum: ["pending", "confirmed", "completed", "cancelled"],
            default: "'pending'",
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
            columnNames: ["vet_id"],
            referencedTableName: "vet_profiles",
            referencedColumnNames: ["id"],
          },
          {
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
          },
          {
            columnNames: ["species_id"],
            referencedTableName: "species",
            referencedColumnNames: ["id"],
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      "pet_requests",
      new TableIndex({
        name: "UQ_pet_requests_one_accepted",
        columnNames: ["pet_id"],
        isUnique: true,
        where: "status = 'accepted'",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("consultations", true);
    await queryRunner.dropTable("bid_revisions", true);
    await queryRunner.dropTable("bids", true);
    await queryRunner.dropTable("auctions", true);
    await queryRunner.dropTable("pet_requests", true);
    await queryRunner.dropTable("pets", true);
    await queryRunner.dropTable("species", true);
  }
}
