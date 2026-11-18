# Migration Plan

Run all migrations with `pnpm migration:run`. Tables are created in this order:

| # | File | Table | Owner | Depends on |
|---|------|-------|-------|------------|
| 1 | 1775500000000-enable-uuid-extension | uuid-ossp extension | Team A | - |
| 2 | 1775500022201-create-user-table | users | blueprint | - |
| 3 | 1775500100000-add-user-fields | users (phone, role, is_active, unique email) | Team A | users |
| 4 | 1775500200000-create-seller-profiles-table | seller_profiles | Team A | users |
| 5 | 1775500300000-create-vet-profiles-table | vet_profiles | Team A | users |
| 6 | 1775600000000-CreateTeamBTables | species, pets, pet_requests, auctions, bids, bid_revisions, consultations | Team B | users, vet_profiles |
| 7 | 1775700000000-create-products-table | products | Team A | users |
| 8 | 1775700100000-create-carts-table | carts, cart_items | Team A | users, products |
| 9 | 1775700200000-create-orders-table | orders, order_items | Team A | users, products, pets |
| 10 | 1775700300000-create-payments-table | payments | Team A | orders |
| 11 | 1775700400000-create-notifications-table | notifications | Team A | users |
| 12 | 1775700500000-create-reviews-table | reviews | Team A | users, vet_profiles, orders, consultations |

If you ran the old migrations before, drop the database and create it again, then run `pnpm migration:run` and `pnpm seeder:refresh:dev`.
