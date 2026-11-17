
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuctionUpdatedAt1794663481592 implements MigrationInterface {
  name = "AddAuctionUpdatedAt1794663481592";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add updated_at to the existing auctions table.
    // Existing auction records will receive the current timestamp.
    await queryRunner.query(`
      ALTER TABLE "auctions"
      ADD COLUMN "updated_at" TIMESTAMP NOT NULL DEFAULT now()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the column if this migration is rolled back.
    await queryRunner.query(`
      ALTER TABLE "auctions"
      DROP COLUMN "updated_at"
    `);
  }
}

