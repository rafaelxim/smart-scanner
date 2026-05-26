# Backend Architecture Instructions

These instructions apply to `apps/backend` and extend the repository-level `AGENTS.md`.

## Architecture Direction

Use feature-based architecture with a small shared infrastructure layer.

Target structure:

```text
src/
  app/
    buildApp.ts
    config.ts
    server.ts
  features/
    receipt-extractions/
      routes.ts
      service.ts
      repository.ts
      schemas.ts
      types.ts
    receipts/
      routes.ts
      service.ts
      repository.ts
      schemas.ts
      types.ts
    dashboard/
      routes.ts
      service.ts
      repository.ts
      schemas.ts
      types.ts
  shared/
    database/
      prisma.ts
    errors/
      AppError.ts
      errorHandler.ts
    http/
    openai/
      client.ts
    storage/
      receiptImages.ts
```

Do not organize new backend work primarily by technical layer such as global `routes/`, `services/`, and `repositories/`. Product behavior should live near the feature it belongs to.

## Feature Structure

Each feature should use a light, predictable structure:

```text
features/<feature-name>/
  routes.ts
  service.ts
  repository.ts
  types.ts
```

Add extra files only when useful:

```text
schemas.ts
mappers.ts
errors.ts
```

Routes stay thin. Services own use cases. Repositories own persistence.

## Routes And Services

Route handlers should:

- read params, body, query, or uploaded files
- call a feature service
- set the HTTP status
- return a DTO

Services should:

- validate business rules
- coordinate repositories, storage, OpenAI, and transactions
- decide domain states such as `pending`, `completed`, `failed`, `expired`, and `confirmed`

Repositories should:

- encapsulate database queries
- avoid business decisions
- avoid opening transactions by themselves

## Schemas And DTOs

Keep HTTP request and response schemas inside the feature that owns the endpoint.

Use explicit DTOs for API responses. Do not return raw Prisma models directly from routes.

DTO rules:

- public response shape is controlled by the feature
- mappers live near the feature when DB/domain shape differs from API shape
- trivial responses can be mapped inline in `routes.ts`
- money values must use integer cents, for example `totalAmountCents`

Use `packages/shared` only for contracts that are genuinely shared between backend and mobile, such as API DTOs and fixed item categories. Do not put Prisma types, backend service types, repository types, or OpenAI-internal schemas in `packages/shared`.

## Database

The target database is MySQL through Prisma.

Use:

```text
shared/database/prisma.ts
```

for Prisma Client creation and export.

Rules:

- routes must not call Prisma directly
- services should usually call repositories, not Prisma directly
- repositories may use Prisma
- transactions are coordinated by services when one use case changes multiple related records

SQLite is legacy baseline code and should not be expanded.

## Transactions

A service should open a transaction when a use case changes multiple records that must remain consistent.

Example: confirming a receipt should coordinate:

- creating the receipt
- creating receipt items
- marking the receipt extraction as `confirmed`
- promoting the image from temporary to permanent storage

Routes do not open transactions. Repositories do not decide transaction boundaries.

File operations cannot be rolled back by the database. When combining storage and database writes, design the order carefully and leave enough state for manual cleanup if a later step fails.

## OpenAI Receipt Extraction

OpenAI is backend-only infrastructure. Mobile must never call OpenAI directly.

Use:

```text
shared/openai/client.ts
```

for OpenAI SDK setup and low-level API calls.

The `receipt-extractions` feature owns:

- receipt extraction prompts
- strict extraction schema expectations
- parsing and normalization
- fallback behavior
- persistence of extraction status and payload

No route should call OpenAI directly.

## Receipt Extraction Flow

For v1, extraction is synchronous from the mobile perspective but modeled with persisted extraction records.

Flow:

1. Mobile uploads a receipt image.
2. Backend stores the image temporarily.
3. Backend calls OpenAI Vision during the request.
4. Backend stores a `receipt_extractions` record.
5. Backend returns the extraction result or a structured error.
6. Mobile sends reviewed data to confirm the receipt.
7. Backend saves the final receipt and receipt items in MySQL.

Do not add a queue in v1 unless a task explicitly requires it. Keep the design easy to move to async jobs later.

## Extraction Statuses

Use explicit persisted statuses for `receipt_extractions`:

```text
pending
completed
failed
expired
confirmed
```

Rules:

- `pending`: image received and extraction is running or about to run
- `completed`: extraction succeeded and is ready for review
- `failed`: OpenAI, parsing, or validation failed
- `expired`: temporary extraction passed the expiration window
- `confirmed`: extraction became a saved receipt
- confirm endpoint only accepts `completed` extractions

Temporary extractions expire after 24 hours. Cleanup is a manual maintenance command in v1.

## Receipt Image Storage

Use shared storage helpers for receipt images:

```text
shared/storage/receiptImages.ts
```

Rules:

- extraction upload saves a temporary image
- `receipt_extractions` stores the temporary image path internally
- confirm promotes or moves the image to permanent storage
- `receipts` stores the final image path internally
- public DTOs must not expose local filesystem paths
- expired extraction cleanup may remove temporary images
- do not trust the original filename for filesystem paths

Do not serve receipt images from the backend until there is an explicit task for it.

## Upload Limits

Upload limits belong in central config.

Initial values:

- max receipt image size: 8 MB
- allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

The HTTP route validates:

- required file field
- expected field name
- allowed MIME type
- max file size

The service should receive an already validated uploaded file object.

## Configuration

Only the backend config module should read `process.env`:

```text
app/config.ts
```

Use typed, validated config.

Rules:

- validate required values such as `DATABASE_URL` and `OPENAI_API_KEY`
- define local defaults for `BACKEND_HOST`, `BACKEND_PORT`, upload directories, and upload limits
- keep `OPENAI_API_KEY` only in backend environment variables
- do not read `process.env` directly from routes, services, repositories, or shared clients

## Errors

Use typed application errors and a global Fastify error handler.

Target structure:

```text
shared/errors/
  AppError.ts
  errorHandler.ts
```

Rules:

- services throw `AppError` with `code`, `statusCode`, and `message`
- Fastify `setErrorHandler` converts errors into consistent JSON
- routes should avoid manual `reply.code(...).send(...)` for business errors
- logs may include internal cause or stack
- public responses should not expose sensitive internals

Public error response shape:

```json
{
  "error": {
    "code": "receipt_extraction_not_found",
    "message": "Receipt extraction not found."
  }
}
```

## Dates And Money

Money:

- store and return money values as integer cents
- normalize OpenAI decimal/string output into cents before persistence or public API response
- dashboard and category calculations happen in the backend
- mobile displays backend-calculated totals

Dates:

- technical timestamps use full DateTime values, such as `createdAt`, `updatedAt`, and `expiresAt`
- receipt purchase date is a civil date string: `YYYY-MM-DD`
- monthly filters are based on `purchaseDate`
- timezone conversion must not change the receipt purchase day

## Dashboard And History

Dashboard and history calculations belong in the backend.

Rules:

- current-month total is calculated by backend
- category summaries are calculated by backend
- historical monthly totals are calculated by backend
- mobile should not recalculate official totals or category totals from raw item lists

## Logging

Use the Fastify logger. Do not use `console.log` in backend runtime code.

Log useful events with minimal sensitive data:

- extraction start and end
- extraction failure with summarized cause
- confirm receipt success or failure
- cleanup command results

Do not log:

- `OPENAI_API_KEY`
- image base64
- full receipt payloads by default
- local file paths in public responses

## Security Surface

There is no authentication in v1.

Keep the backend surface small:

- expose only endpoints required by current tasks
- accept receipt images only through multipart upload
- do not accept remote image URLs in v1
- do not expose filesystem paths in DTOs
- do not serve uploaded images unless an explicit task requires it
- add CORS only when there is a concrete need
- do not leak OpenAI credentials in responses or logs

## Naming And Language

Use English for backend code:

- files
- functions
- classes
- DTO fields
- database columns
- error codes

Use Portuguese for fixed user-visible category values:

```text
Hortifruti
Carnes
Laticínios
Padaria
Mercearia
Bebidas
Congelados
Limpeza
Higiene
Pet
Outros
```

Categories belong to receipt items, not receipts.

## Testing And Validation

For now, the minimum required validation is typecheck/build unless a task explicitly requires tests.

Run focused backend validation after backend changes:

```bash
pnpm --filter @smart-scanner/backend typecheck
pnpm --filter @smart-scanner/backend build
```

When tests are introduced later:

- service tests should cover business rules
- route tests should cover critical HTTP flows with `buildApp`
- OpenAI calls should be mocked or fake
- repository tests are only required for complex queries

## Legacy And Migration Notes

The current backend still contains legacy baseline code:

- SQLite via `node:sqlite`
- a simple `ReceiptRepository`
- `POST /receipts` upload flow
- old OCR-oriented receipt columns

Do not expand that architecture.

Planned direction:

- replace SQLite with MySQL and Prisma
- replace direct upload-to-receipt flow with:
  - `POST /receipt-extractions`
  - `POST /receipts/confirm`
- remove OCR/Tesseract direction
- keep OpenAI Vision extraction in backend
- keep review-before-save as the main product flow

Source files in `src/` are the reference. Compiled files in `dist/` should not guide architecture decisions.
