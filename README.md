# Market Receipt Tracker

Mobile-first grocery receipt tracker built as a `pnpm` monorepo with an Expo app, a Fastify backend, Prisma/MySQL persistence, and OpenAI Vision-based structured extraction.

This project is intentionally scoped to market and grocery receipts. It is not a generic expense scanner.

## Product Summary

The application supports a review-before-save workflow:

1. The user captures or selects a grocery receipt image in the mobile app.
2. The mobile app uploads the image to the backend.
3. The backend stores the image temporarily and sends it to OpenAI Vision.
4. OpenAI returns structured receipt data under a strict JSON schema.
5. The user reviews and edits receipt fields and item rows in the mobile app.
6. The mobile app confirms the reviewed payload with the backend.
7. The backend persists the final receipt and its line items in MySQL and promotes the temporary image to permanent storage.

## Current Repository Status

Implemented in this repository today:

- Mobile upload flow with gallery and camera support
- Backend image upload endpoint
- OpenAI receipt extraction in the backend
- Review screen with editable receipt fields and editable item categories
- Receipt confirmation flow from mobile to backend
- MySQL persistence with Prisma
- Manual cleanup command for expired temporary extractions
- Shared TypeScript contracts between backend and mobile

Partially implemented or still placeholder:

- History tab exists in the mobile app, but it is still an empty state
- Dashboard, monthly history queries, and receipt detail views are present in `tasks/` as product direction, but are not implemented in the current app/backend code
- No authentication, multi-user support, or budgeting features

## Stack

### Monorepo

- `pnpm` workspaces
- TypeScript across all packages

### Mobile

- Expo Managed Workflow
- React Native
- React Navigation
- Expo Image Picker

### Backend

- Fastify
- `@fastify/multipart`
- OpenAI Node SDK
- Prisma Client with MariaDB adapter

### Database and Infrastructure

- MySQL 8.4
- Docker Compose for local backend + database infrastructure

## Repository Layout

```text
.
├── apps/
│   ├── backend/     # Fastify API, Prisma schema, OpenAI extraction, cleanup script
│   └── mobile/      # Expo app, upload/review screens, navigation, shared UI primitives
├── packages/
│   └── shared/      # Shared TypeScript contracts and receipt domain types
├── tasks/           # Product and implementation task history
├── COMMANDS.md      # Useful local development commands
├── docker-compose.yml
└── .env.example
```

## Domain Constraints

- The app only targets market/grocery receipts
- Review is mandatory before saving
- Receipt items are saved as individual rows exactly as reviewed
- Repeated items are not merged
- The official receipt total is stored separately from the sum of item totals
- The UI warns when those totals diverge
- Receipt categories belong to items, not to receipts

Fixed v1 item categories:

- `Hortifruti`
- `Carnes`
- `Laticínios`
- `Padaria`
- `Mercearia`
- `Bebidas`
- `Congelados`
- `Limpeza`
- `Higiene`
- `Pet`
- `Outros`

## Architecture

### Backend

The backend exposes a small HTTP surface:

- `GET /health`
- `POST /receipt-extractions`
- `POST /receipts`

Key responsibilities:

- receive multipart image uploads
- validate image field and MIME type
- store images temporarily
- call OpenAI Vision with a strict JSON schema
- persist extraction metadata and expiration data
- validate reviewed receipt input
- move confirmed images from temporary storage to final storage
- save receipts and receipt items transactionally

### Mobile

The mobile app currently has:

- `Upload` tab: choose image from gallery or camera and upload to backend
- `ReviewReceipt` screen: edit extracted data and confirm save
- `History` tab: placeholder empty state

The mobile app never calls OpenAI directly. It talks only to the backend using `EXPO_PUBLIC_API_BASE_URL`.

### Shared Contracts

`packages/shared` defines the core request and response types used by mobile and backend, including:

- extracted receipt payloads
- confirm receipt payloads
- receipt record shapes
- fixed category values

## Data Model

Prisma models are defined in [apps/backend/prisma/schema.prisma](/home/rafael/Development/smart-scanner/apps/backend/prisma/schema.prisma:1).

Main tables:

- `receipt_extractions`
  - temporary extraction attempts
  - temporary image path
  - extraction status
  - extracted JSON payload
  - error metadata
  - expiration timestamp
  - optional link to the confirmed receipt

- `receipts`
  - market name
  - purchase date
  - official total in cents
  - final stored image path
  - timestamps

- `receipt_items`
  - receipt foreign key
  - original item name
  - quantity
  - unit
  - unit price in cents
  - total price in cents
  - item category
  - row position

## Receipt Extraction Flow

The extraction pipeline lives in [apps/backend/src/features/receipt-extractions/service.ts](/home/rafael/Development/smart-scanner/apps/backend/src/features/receipt-extractions/service.ts:1).

Important implementation details:

- OpenAI Vision is called only from the backend
- the backend sends the image as a data URL
- extraction output is constrained by a strict JSON schema
- missing values must be returned as `null`
- extraction records expire after 24 hours

If extraction fails, the backend returns a structured error code such as:

- `openai_not_configured`
- `openai_receipt_extraction_failed`
- `invalid_openai_extraction_payload`
- `unsupported_media_type`

## Receipt Confirmation Flow

Receipt confirmation is handled by `POST /receipts`.

The backend validates:

- extraction id presence
- market name
- purchase date format (`YYYY-MM-DD`)
- official total in cents
- non-empty items array
- per-item fields such as name, quantity, totals, and category

When confirmation succeeds:

1. the extraction must still be `COMPLETED`
2. it must not be expired
3. it must not already be confirmed
4. the temporary image is promoted to `/uploads/receipts`
5. the receipt and its items are inserted transactionally
6. the extraction is marked as confirmed

## API Summary

### `GET /health`

Returns a basic service probe:

```json
{
  "status": "ok",
  "service": "smart-scanner-backend"
}
```

### `POST /receipt-extractions`

Multipart form upload with field name `receipt`.

Successful response:

```json
{
  "extractionId": "uuid",
  "receipt": {
    "marketName": "Example Market",
    "purchaseDate": "2026-06-01",
    "officialTotalAmountCents": 3590,
    "items": []
  }
}
```

### `POST /receipts`

JSON body:

```json
{
  "extractionId": "uuid",
  "receipt": {
    "marketName": "Example Market",
    "purchaseDate": "2026-06-01",
    "officialTotalAmountCents": 3590,
    "items": [
      {
        "originalName": "Banana prata",
        "quantity": "1.250",
        "unit": "kg",
        "unitPriceAmountCents": 799,
        "totalAmountCents": 999,
        "category": "Hortifruti"
      }
    ]
  }
}
```

Successful response:

```json
{
  "receipt": {
    "id": "uuid",
    "marketName": "Example Market",
    "purchaseDate": "2026-06-01",
    "officialTotalAmountCents": 3590,
    "items": []
  }
}
```

Common error families:

- `400` validation and malformed request payloads
- `404` extraction not found
- `409` expired, already confirmed, or otherwise non-confirmable extraction
- `503` OpenAI not configured

## Environment Variables

Use `.env.example` as the baseline.

### Backend

- `BACKEND_PORT`
- `DATABASE_URL`
- `MIGRATION_DATABASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_RECEIPT_EXTRACTION_MODEL`
- `UPLOADS_DIR`
- `NODE_ENV`

### Database

- `MYSQL_PORT`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`

### Mobile

- `EXPO_PUBLIC_API_BASE_URL`

Notes:

- `OPENAI_API_KEY` must remain server-side only
- for Android emulator, `EXPO_PUBLIC_API_BASE_URL` is usually `http://10.0.2.2:3000`
- for a physical device, use the host machine LAN IP

## Local Development

### Prerequisites

- Node.js with `corepack`
- `pnpm`
- Docker and Docker Compose
- an OpenAI API key for real extraction runs

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create local environment

```bash
cp .env.example .env
```

Fill in at least:

- `OPENAI_API_KEY`
- `EXPO_PUBLIC_API_BASE_URL` when testing from emulator or device

### 3. Start MySQL and backend

```bash
docker compose up --build -d
```

Check health:

```bash
curl http://localhost:3000/health
```

### 4. Run the mobile app

```bash
pnpm --filter @smart-scanner/mobile dev
```

Then open Expo on:

- Android emulator
- iOS simulator
- Expo Go on a physical device

### 5. Run the backend locally without Docker, if needed

```bash
pnpm --filter @smart-scanner/backend dev
```

This expects a reachable MySQL instance and a valid `DATABASE_URL`.

## Prisma and Database Operations

Generate the Prisma client:

```bash
pnpm --filter @smart-scanner/backend prisma:generate
```

Run migrations locally:

```bash
DATABASE_URL=mysql://root:smart_scanner_root_password@localhost:3306/smart_scanner pnpm --filter @smart-scanner/backend exec prisma migrate dev --config prisma.config.ts
```

Inspect migration status:

```bash
DATABASE_URL=mysql://root:smart_scanner_root_password@localhost:3306/smart_scanner pnpm --filter @smart-scanner/backend exec prisma migrate status --config prisma.config.ts
```

## Cleanup and Operations

Temporary extraction rows and temporary image files expire after 24 hours.

Run cleanup from the host:

```bash
pnpm --filter @smart-scanner/backend cleanup:expired-extractions
```

Or inside the backend container:

```bash
docker compose exec backend pnpm --filter @smart-scanner/backend cleanup:expired-extractions
```

The cleanup script deletes:

- expired extraction rows not linked to a confirmed receipt
- corresponding temporary image files when present

## Quality Checks

Type-check the full monorepo:

```bash
pnpm typecheck
```

Type-check only the mobile app:

```bash
pnpm --filter @smart-scanner/mobile typecheck
```

Build the backend:

```bash
pnpm --filter @smart-scanner/backend build
```

## Implementation Notes

- Monetary values are stored as integer cents
- Receipt item quantity is stored as an optional decimal value in MySQL
- Purchase dates are stored as `DATE`
- Confirmed receipt images are stored on the filesystem, not in the database
- There is no login flow in this version
- The repository still contains early baseline task history and later product reframe tasks under `tasks/`

## Recommended Next Steps

The current codebase is a solid base for the remaining product work:

- implement list/history endpoints and mobile history rendering
- add monthly dashboard and category summary endpoints
- add receipt detail retrieval and UI
- add automated tests around upload, extraction, and confirmation flows
- define production-grade file storage and deployment strategy
