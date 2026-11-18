import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateVetProfilesTable1775500300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "vet_profiles",
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
            name: "registration_no",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "specialisation",
            type: "varchar",
          },
          {
            name: "district",
            type: "varchar",
          },
          {
            name: "upazila",
            type: "varchar",
          },
          {
            name: "chamber_address",
            type: "varchar",
          },
          {
            name: "fee",
            type: "numeric",
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: "work_start",
            type: "time",
            default: "'10:00'",
          },
          {
            name: "work_end",
            type: "time",
            default: "'18:00'",
          },
          {
            name: "slot_minutes",
            type: "int",
            default: 30,
          },
          {
            name: "modes",
            type: "text",
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
    await queryRunner.dropTable("vet_profiles", true);
  }
}
