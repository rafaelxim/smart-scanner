# Codex Instructions

## Project Context

Market Receipt Tracker is a mobile app that helps a single user control grocery spending by scanning market receipts, reviewing extracted item data, and tracking monthly spending by category.

This product is focused only on market/grocery receipts. Do not treat it as a generic expense scanner.

## Product Goals

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

## Architecture Decisions

- Use a pnpm monorepo.
- Mobile app: Expo Managed Workflow, React Native, TypeScript.
- Backend: Fastify, TypeScript.
- Database target: MySQL through Prisma.
- Local infrastructure: Docker Compose.
- Receipt image extraction: OpenAI Vision from the backend.
- Extraction output: strict JSON schema.
- `OPENAI_API_KEY` must stay only in backend environment variables.
- Mobile must never call OpenAI directly.
- OpenAI Vision is the only planned receipt extraction strategy.
- No login in v1.
- No budget feature in v1.

## Domain Rules

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

## Data Model Direction

The target model is MySQL/Prisma with these conceptual entities:

- `receipt_extractions`: temporary extraction attempts, extracted payload, temp image path, status, and expiration timestamp
- `receipts`: confirmed market receipt, market name, purchase date, official total, final image path, timestamps
- `receipt_items`: line items from the receipt, original item name, quantity, unit, unit price, total price, item category

Temporary extractions expire after 24 hours. Cleanup is handled by a manual maintenance command.

## Review Rules

- The user must review before saving.
- The review screen must allow editing market name, purchase date, official total, item name, quantity, unit, unit price, total price, and category.
- Save item rows as they appear on the receipt.
- Do not merge repeated items on save.
- Save the original product name only in v1.
- Store the official receipt total separately from the sum of item totals.
- Show a warning when the official total and item total sum diverge.

## Mobile UI Direction

Main screens:

- upload receipt
- review extracted receipt
- current-month dashboard
- monthly history
- receipt detail with items

Use simple visuals first:

- cards
- horizontal category bars
- lists

## Task Workflow

- Tasks live under `tasks/`.
- Execute tasks in numeric order unless the user explicitly changes priority.
- Preserve old baseline tasks as history.
- New product direction starts at `006_product_reframe`.
- Keep tasks granular and independently verifiable.

## Commands

Useful commands are documented in `COMMANDS.md`.

Common commands:

```bash
pnpm typecheck
pnpm --filter @smart-scanner/backend build
pnpm --filter @smart-scanner/mobile typecheck
docker compose up --build -d
docker compose logs -f backend
```

## Implementation Guidance

- Prefer existing project patterns over new abstractions.
- Keep shared API/domain types in `packages/shared`.
- Keep OpenAI integration in the backend.
- Keep secrets out of mobile code and committed files.
- Validate changes with focused commands before finalizing.
- When changing Docker or database behavior, update `.env.example` and `COMMANDS.md` when relevant.
