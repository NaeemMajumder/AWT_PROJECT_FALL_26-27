<!-- TEAM A + TEAM B (shared): migration order and ownership. Each team writes migrations ONLY for its own tables. -->
# Migration Plan

Create migrations with `pnpm migration:create src/database/migrations/<name>` and run with `pnpm migration:run`.
Never edit another team's migration. Pull `main` before creating a new one. IDs are `uuid` (same as the blueprint).

| # | Table | Owner | Depends on |
|---|-------|-------|------------|
| 1 | users (update existing: phone, role, is_active) | Team A | - |
| 2 | seller_profiles | Team A | users |
| 3 | vet_profiles | Team A | users |
| 4 | species | Team B | - |
| 5 | pets | Team B | users, species |
| 6 | pet_requests | Team B | pets, users |
| 7 | auctions | Team B | pets, users |
| 8 | bids | Team B | auctions, users |
| 9 | bid_revisions | Team B | bids |
| 10 | consultations | Team B | vet_profiles, users, species |
| 11 | products | Team A | users |
| 12 | carts, cart_items | Team A | users, products |
| 13 | orders, order_items | Team A | users, products, pets |
| 14 | payments | Team A | orders |
| 15 | notifications | Team A | users, auctions |
| 16 | reviews | Team A | users, vet_profiles, orders, consultations |
