/**
 * ==================================================================
 *  TEAM A  (Naeem Majumder)
 * ==================================================================
 *  VetProfile entity  ->  table: vet_profiles
 *
 *  - id (uuid PK), user_id (FK users, unique), registration_no (unique), specialisation,
 *  - district, upazila, chamber_address, fee, work_start, work_end, slot_minutes,
 *  - modes (online/chamber), status (pending/approved/rejected), created_at, updated_at
 *  - Relation: OneToOne with User; OneToMany with Consultation (Team B)
 * ==================================================================
 */
