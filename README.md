# Pet Bazaar Backend

NestJS + TypeORM + PostgreSQL backend for Pet Bazaar, a pet marketplace for Bangladesh.

- Team A: Naeem Majumder (23-54115-3)
- Team B: Farzana Islam Upoma (23-55246-3)

## Requirements

- Node.js 22 or later
- PostgreSQL 14 or later
- pnpm

## Setup

```bash
pnpm install
cp .env.example .env
```

Open `.env` and set `DB_USER`, `DB_PASSWORD` and `DB_DATABASE`. Then create the database (for example `pet_bazaar`) in pgAdmin or DBeaver.

## Database

```bash
pnpm migration:run
pnpm seeder:refresh:dev
```

`seeder:refresh:dev` clears all tables and fills them with demo data again. Run it before every Postman test run.

## Run

```bash
pnpm start:dev
```

The API runs on `http://localhost:5000` and Swagger is at `http://localhost:5000/api`.

## Demo accounts

All passwords are `123456`.

| Email | Role |
|-------|------|
| admin@petbazaar.com | admin |
| rahim@gmail.com | customer |
| karim@gmail.com | customer |
| sabbir@gmail.com | approved seller (individual) |
| nusrat@gmail.com | approved seller (shop) |
| hasan.vet@gmail.com | approved vet, Dhaka |
| mitu.vet@gmail.com | approved vet, Rangpur |

## Postman

Import both files from the `postman/` folder:

- `Pet Bazaar API.postman_collection.json`
- `Pet Bazaar Local.postman_environment.json`

Select the "Pet Bazaar Local" environment and run the collection from top to bottom. Login requests save the tokens and ids, so the later requests work without copying anything by hand.

For the upload requests (seller document, pet photo, product image) pick a file from `postman/files/` in the Body tab if Postman asks for it.

## Background jobs

These run every minute:

- start scheduled auctions and close finished ones
- expire price drop offers that the seller did not answer
- expire unpaid pet orders after the pay window (`PET_ORDER_PAY_WINDOW_HOURS`)
