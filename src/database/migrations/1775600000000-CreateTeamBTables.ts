
import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * ==================================================================
 * TEAM B MIGRATION
 * ==================================================================
 * Creates the tables owned by Team B:
 * species, pets, pet_requests, auctions, bids,
 * bid_revisions and consultations.
 *
 * Run only after Team A's users and vet_profiles tables exist.
 */

export class CreateTeamBTables1775600000000
  implements MigrationInterface
{
  name = "CreateTeamBTables1775600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --------------------------------------------------------------
    // 1. CREATE ENUM TYPES
    // --------------------------------------------------------------

    await queryRunner.query(`
      CREATE TYPE pets_listing_type_enum
      AS ENUM ('sale', 'adoption')
    `);

    await queryRunner.query(`
      CREATE TYPE pets_gender_enum
      AS ENUM ('male', 'female', 'unknown')
    `);

    await queryRunner.query(`
      CREATE TYPE pets_status_enum
      AS ENUM (
        'pending_review',
        'available',
        'reserved',
        'in_auction',
        'sold',
        'adopted',
        'rejected',
        'withdrawn'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE pet_requests_type_enum
      AS ENUM ('purchase', 'adoption')
    `);

    await queryRunner.query(`
      CREATE TYPE pet_requests_status_enum
      AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'expired')
    `);

    await queryRunner.query(`
      CREATE TYPE auctions_status_enum
      AS ENUM (
        'requested',
        'scheduled',
        'live',
        'awaiting_seller',
        'ended',
        'unsold',
        'withdrawn',
        'rejected',
        'cancelled'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE consultations_mode_enum
      AS ENUM ('online', 'chamber')
    `);

    await queryRunner.query(`
      CREATE TYPE consultations_status_enum
      AS ENUM ('pending', 'confirmed', 'completed', 'cancelled')
    `);

    // --------------------------------------------------------------
    // 2. CREATE SPECIES TABLE
    // --------------------------------------------------------------

    await queryRunner.query(`
      CREATE TABLE species (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar UNIQUE NOT NULL,
        category varchar NOT NULL,
        min_age_weeks integer NOT NULL DEFAULT 0,
        vaccination_required boolean NOT NULL DEFAULT false,
        is_allowed boolean NOT NULL DEFAULT true,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
      )
    `);

    // --------------------------------------------------------------
    // 3. CREATE PETS TABLE
    // --------------------------------------------------------------

    await queryRunner.query(`
      CREATE TABLE pets (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        species_id uuid NOT NULL REFERENCES species(id),
        owner_id uuid NOT NULL REFERENCES users(id),
        title varchar NOT NULL,
        breed varchar,
        gender pets_gender_enum NOT NULL DEFAULT 'unknown',
        birth_date date,
        vaccinated boolean NOT NULL DEFAULT false,
        listing_type pets_listing_type_enum NOT NULL,
        is_rescue boolean NOT NULL DEFAULT false,
        district varchar NOT NULL,
        area varchar NOT NULL,
        price numeric(12,2) NOT NULL DEFAULT 0,
        photo_path varchar,
        status pets_status_enum NOT NULL DEFAULT 'pending_review',
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
      )
    `);

    // --------------------------------------------------------------
    // 4. CREATE PET REQUESTS TABLE
    // --------------------------------------------------------------

    await queryRunner.query(`
      CREATE TABLE pet_requests (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        pet_id uuid NOT NULL REFERENCES pets(id),
        requester_id uuid NOT NULL REFERENCES users(id),
        type pet_requests_type_enum NOT NULL,
        message text,
        status pet_requests_status_enum NOT NULL DEFAULT 'pending',
        decided_at timestamp,
        created_at timestamp NOT NULL DEFAULT now()
      )
    `);

    // --------------------------------------------------------------
    // 5. CREATE AUCTIONS TABLE
    // --------------------------------------------------------------

    await queryRunner.query(`
      CREATE TABLE auctions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        pet_id uuid NOT NULL REFERENCES pets(id),
        seller_id uuid NOT NULL REFERENCES users(id),
        start_price numeric(12,2) NOT NULL,
        round_no integer NOT NULL DEFAULT 1,
        duration_hours integer NOT NULL,
        start_time timestamp,
        end_time timestamp,
        extension_count integer NOT NULL DEFAULT 0,
        highest_bid numeric(12,2) NOT NULL DEFAULT 0,
        highest_bidder_id uuid REFERENCES users(id),
        status auctions_status_enum NOT NULL DEFAULT 'requested',
        offer_price numeric(12,2),
        offer_expires_at timestamp,
        winner_id uuid REFERENCES users(id),
        approved_by uuid REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT now()
      )
    `);

    // --------------------------------------------------------------
    // 6. CREATE BIDS TABLE
    // --------------------------------------------------------------

    await queryRunner.query(`
      CREATE TABLE bids (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        auction_id uuid NOT NULL REFERENCES auctions(id),
        bidder_id uuid NOT NULL REFERENCES users(id),
        amount numeric(12,2) NOT NULL,
        edit_count integer NOT NULL DEFAULT 0,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now(),
        CONSTRAINT uq_bids_auction_bidder
        UNIQUE (auction_id, bidder_id)
      )
    `);

    // --------------------------------------------------------------
    // 7. CREATE BID REVISIONS TABLE
    // --------------------------------------------------------------

    await queryRunner.query(`
      CREATE TABLE bid_revisions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        bid_id uuid NOT NULL REFERENCES bids(id),
        old_amount numeric(12,2) NOT NULL,
        new_amount numeric(12,2) NOT NULL,
        created_at timestamp NOT NULL DEFAULT now()
      )
    `);

    // --------------------------------------------------------------
    // 8. CREATE CONSULTATIONS TABLE
    // --------------------------------------------------------------

    await queryRunner.query(`
      CREATE TABLE consultations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        vet_id uuid NOT NULL REFERENCES vet_profiles(id),
        user_id uuid NOT NULL REFERENCES users(id),
        species_id uuid NOT NULL REFERENCES species(id),
        pet_name varchar NOT NULL,
        problem_note text,
        date date NOT NULL,
        start_time time NOT NULL,
        end_time time NOT NULL,
        mode consultations_mode_enum NOT NULL,
        room_code varchar,
        status consultations_status_enum NOT NULL DEFAULT 'pending',
        created_at timestamp NOT NULL DEFAULT now()
      )
    `);

    // --------------------------------------------------------------
    // 9. CREATE INDEXES
    // --------------------------------------------------------------

    await queryRunner.query(`
      CREATE INDEX idx_pets_search
      ON pets (district, listing_type, status)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_pet_requests_pet_status
      ON pet_requests (pet_id, status)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_auctions_status_end
      ON auctions (status, end_time)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_consultations_vet_date
      ON consultations (vet_id, date)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // --------------------------------------------------------------
    // DROP TABLES IN REVERSE ORDER
    // --------------------------------------------------------------

    await queryRunner.query(`DROP TABLE consultations`);
    await queryRunner.query(`DROP TABLE bid_revisions`);
    await queryRunner.query(`DROP TABLE bids`);
    await queryRunner.query(`DROP TABLE auctions`);
    await queryRunner.query(`DROP TABLE pet_requests`);
    await queryRunner.query(`DROP TABLE pets`);
    await queryRunner.query(`DROP TABLE species`);

    // --------------------------------------------------------------
    // DROP ENUM TYPES
    // --------------------------------------------------------------

    await queryRunner.query(`DROP TYPE consultations_status_enum`);
    await queryRunner.query(`DROP TYPE consultations_mode_enum`);
    await queryRunner.query(`DROP TYPE auctions_status_enum`);
    await queryRunner.query(`DROP TYPE pet_requests_status_enum`);
    await queryRunner.query(`DROP TYPE pet_requests_type_enum`);
    await queryRunner.query(`DROP TYPE pets_status_enum`);
    await queryRunner.query(`DROP TYPE pets_gender_enum`);
    await queryRunner.query(`DROP TYPE pets_listing_type_enum`);
  }
}
