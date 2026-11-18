import { MigrationInterface, QueryRunner, TableColumn, TableUnique } from "typeorm";

export class AddUserFields1775500100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("users", [
      new TableColumn({
        name: "phone",
        type: "varchar",
        isNullable: true,
      }),
      new TableColumn({
        name: "role",
        type: "enum",
        enum: ["admin", "customer", "vet"],
        default: "'customer'",
      }),
      new TableColumn({
        name: "is_active",
        type: "boolean",
        default: true,
      }),
    ]);

    await queryRunner.createUniqueConstraint(
      "users",
      new TableUnique({
        name: "UQ_users_email",
        columnNames: ["email"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint("users", "UQ_users_email");
    await queryRunner.dropColumn("users", "is_active");
    await queryRunner.dropColumn("users", "role");
    await queryRunner.dropColumn("users", "phone");
  }
}
