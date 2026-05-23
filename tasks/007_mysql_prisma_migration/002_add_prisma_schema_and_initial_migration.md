## Especificacao

Add Prisma to the backend and define the initial MySQL schema for market receipts.

## Entregavel

- Prisma dependency and CLI setup
- `schema.prisma`
- Initial migration
- Models for receipt extractions, receipts, and receipt items
- Fixed market item category enum

## Definicao de pronto

- Prisma can generate the client
- Migration creates the MySQL schema
- Schema supports review-before-save and item-level categories

## Teste

- Run Prisma generate
- Run migration against local MySQL
- Inspect tables in MySQL
