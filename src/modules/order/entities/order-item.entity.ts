/**
 * ==================================================================
 *  TEAM A  (Naeem Majumder)
 * ==================================================================
 *  OrderItem entity  ->  table: order_items
 *
 *  - id (uuid PK), order_id (FK), seller_id (FK users), product_id (FK, nullable),
 *  - pet_id (FK pets -> Team B table, nullable), quantity, unit_price
 *  - Exactly one of product_id / pet_id must be set
 * ==================================================================
 */
