/**
 * ==================================================================
 *  TEAM B  (Farzana Islam Upoma)
 * ==================================================================
 *  Bid entity  ->  table: bids
 *
 *  - id (uuid PK), auction_id (FK), bidder_id (FK users), amount, edit_count (0-3), created_at, updated_at
 *  - Unique (auction_id, bidder_id): one bid per buyer per auction
 * ==================================================================
 */
