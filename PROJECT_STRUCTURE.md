<!-- TEAM A + TEAM B (shared): folder map and ownership for Pet Bazaar backend. Follows the course blueprint; nothing from the blueprint was removed. -->
# Pet Bazaar — Backend Structure

NestJS + TypeORM + PostgreSQL. Backend and database only (frontend later).

- **Team A — Naeem Majumder (23-54115-3):** setup, database connection, auth, users, sellers, vets, admin, products, cart, orders, payments, notifications, reviews, storage.
- **Team B — Farzana Islam Upoma (23-55246-3):** species, pets, pet requests, auctions and bids, consultations, meeting link, auction jobs.

Every new file starts with a header comment that says which team owns it and what code goes there.
Files marked *(blueprint)* came from the course blueprint and are kept as they are.

```
src/
├── @types/                         (blueprint)
├── common/
│   ├── constants/
│   │   ├── auction.constants.ts        B  50,000 / +5,000 / 48h / 3 edits / anti-sniping
│   │   ├── districts.constant.ts       A  64 districts
│   │   ├── events.constants.ts         A  order.paid / order.expired
│   │   ├── order.constants.ts          A  24h pay window
│   │   └── upload.constants.ts         A
│   ├── decorators/                 (blueprint) current-user, roles
│   ├── enums/
│   │   ├── role.enum.ts            (blueprint) Team A replaces roles with CUSTOMER, VET, ADMIN
│   │   ├── profile-status / order / payment / notification-type .enum.ts   A
│   │   └── pet / pet-request / auction / consultation .enum.ts            B
│   ├── guard/
│   │   ├── auth / jwt / refresh-jwt / roles .guard.ts   (blueprint)
│   │   ├── approved-seller.guard.ts    A
│   │   └── approved-vet.guard.ts       A
│   ├── interfaces/
│   │   ├── create-pet-order.interface.ts   A  (handshake 3)
│   │   └── order-event.interface.ts        A  (handshake 4)
│   ├── validations/district.validator.ts   A
│   └── errors, helpers, infrastructure, middlewares, pipes, schema, utilities   (blueprint)
├── config/                         (blueprint) database.config.ts = DB connection (Team A)
├── database/
│   ├── migrations/                 MIGRATION_PLAN.md = order + owner of every table
│   └── seeders/                    user, product, order (A) · species, pet, auction, consultation (B)
├── jobs/
│   ├── jobs.module.ts              A+B
│   ├── order-expiry.job.ts         A
│   ├── auction-lifecycle.job.ts    B
│   └── auction-price-drop.job.ts   B
├── mails/                          (blueprint, not used in MVP)
├── modules/
│   ├── auth/ · user/               A  (blueprint, extend)
│   ├── test/                       (blueprint sample, reference only)
│   ├── seller/ · vet/ · admin/     A
│   ├── product/ · cart/ · order/ · payment/   A
│   ├── notification/ · review/     A
│   ├── species/ · pet/ · pet-request/         B
│   ├── auction/  (+ bid.service.ts)           B
│   └── consultation/               B
├── providers/
│   ├── cache/ · queue/             (blueprint, not used in MVP)
│   ├── database/postgres/          (blueprint)
│   ├── storage/local/              A  (handshake 7)
│   └── meeting/jitsi/              B  demo call link
├── script/                         (blueprint) migration run / rollback / truncate
├── app.module.ts                   register every new module here (announce changes)
└── seeder.ts                       register seeders in run([...])
```

Each module folder follows the blueprint pattern: `dto/`, `entities/`, `<name>.controller.ts`, `<name>.service.ts`, `<name>.module.ts`.

## Handshakes (where Team A and Team B code meet)

| # | Direction | What |
|---|-----------|------|
| 1 | A → B | JWT guard, roles guard, ApprovedSellerGuard, ApprovedVetGuard, @CurrentUser |
| 2 | A → B | `VetService.getApprovedVet(vetId)` |
| 3 | B → A | `OrderService.createPetOrder(input)` |
| 4 | A → B | events `order.paid`, `order.expired` |
| 5 | A → B | `NotificationService.notify(...)` |
| 6 | B → A | `ConsultationService.isCompleted(id, userId)` |
| 7 | A → B | `StorageService.save(file)` |

## Working rules

- Branches: `a/<feature>` and `b/<feature>`; no direct push to `main`; the other member reviews each PR.
- Migrations only for your own tables (see `src/database/migrations/MIGRATION_PLAN.md`).
- Announce changes to shared files: `common/`, `app.module.ts`, `.env.example`.
- Copy `.env.example` to `.env`; never commit `.env`.
