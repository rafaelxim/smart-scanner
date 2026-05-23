# Market Receipt Tracker

## Product Idea

Market Receipt Tracker is a mobile app that helps a single user control grocery spending by scanning market receipts, reviewing extracted item data, and tracking monthly spending by category.

The product is focused only on market/grocery receipts. It is not a generic expense scanner.

## Core User Goal

The user wants to understand:

- how much they spent in the current month
- which market categories consume the most money
- which receipts and items make up that spending
- how spending changes across months

## Main Flow

1. The user captures or selects a market receipt image in the mobile app.
2. The app sends the image to the backend.
3. The backend saves the image temporarily and sends it to OpenAI Vision for structured extraction.
4. The backend returns extracted receipt data for review.
5. The user reviews and edits market name, purchase date, total, and item rows.
6. The user confirms the receipt.
7. The backend saves the receipt and items in MySQL.
8. The app shows current-month totals, category breakdowns, receipt history, and receipt details.

## Extraction Strategy

- Use OpenAI Vision from the backend.
- Use a strict JSON schema for extraction output.
- Keep `OPENAI_API_KEY` only in backend environment variables.
- Do not call OpenAI directly from the mobile app.
- Remove Tesseract as a product dependency.
- If OpenAI extraction fails, fail the extraction flow and ask the user to try again.

## Categories

Categories are fixed in v1 and editable per item during review:

- Hortifruti
- Carnes
- Laticínios
- Padaria
- Mercearia
- Bebidas
- Congelados
- Limpeza
- Higiene
- Pet
- Outros

Categories belong to receipt items, not receipts. A receipt can contain items from multiple categories.

## Data Model

The backend uses MySQL through Prisma.

Conceptual entities:

- `receipt_extractions`: temporary extraction attempts, extracted payload, temp image path, status, and expiration timestamp
- `receipts`: confirmed market receipt, market name, purchase date, official total, final image path, timestamps
- `receipt_items`: line items from the receipt, original item name, quantity, unit, unit price, total price, item category

Temporary extractions expire after 24 hours. Cleanup is handled by a manual maintenance command.

SQLite is no longer the target persistence layer.

## Review Rules

- The user must review before saving.
- The review screen must allow editing:
  - market name
  - purchase date
  - official total
  - item name
  - quantity
  - unit
  - unit price
  - total price
  - category
- Save item rows as they appear on the receipt. Do not merge repeated items on save.
- Save the original product name only in v1.
- Store the official receipt total separately from the sum of item totals.
- Show a warning when the official total and item total sum diverge.

## Mobile App

- Use Expo Managed Workflow with TypeScript.
- Main screens:
  - upload receipt
  - review extracted receipt
  - current-month dashboard
  - monthly history
  - receipt detail with items
- Use simple visuals first:
  - cards
  - horizontal category bars
  - lists
- No login in v1.
- No budget feature in v1.

## Backend

- Use Fastify with TypeScript.
- Use Prisma with MySQL.
- Store uploaded images on disk through Docker-mounted storage.
- Use separate endpoints for extraction and confirmation:
  - `POST /receipt-extractions`
  - `POST /receipts`
- Keep API responses structured and typed through shared TypeScript models.

## Infrastructure

- Use a pnpm monorepo.
- Use Docker Compose for local development.
- Run backend and MySQL through Docker Compose.
- Keep the mobile app local through Expo.
- Document useful commands in `COMMANDS.md`.

## Roadmap

1. Product reframe and task reorganization
2. MySQL and Prisma migration
3. OpenAI receipt extraction
4. Receipt review and save flow
5. Dashboard and monthly history
6. Polish, README, screenshots, and demo flow
