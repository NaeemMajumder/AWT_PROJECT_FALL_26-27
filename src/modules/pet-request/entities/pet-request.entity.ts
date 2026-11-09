/**
 * ==================================================================
 *  TEAM B  (Farzana Islam Upoma)
 * ==================================================================
 *  PetRequest entity  ->  table: pet_requests
 *
 *  - id (uuid PK), pet_id (FK), requester_id (FK users), type (purchase/adoption), message,
 *  - status (pending/accepted/rejected/cancelled/expired), decided_at, created_at
 *  - Partial unique index: only one ACCEPTED request per pet
 * ==================================================================
 */
