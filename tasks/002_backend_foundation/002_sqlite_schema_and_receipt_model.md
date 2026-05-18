## Especificacao

Define the initial SQLite persistence layer for receipts.
Model a single receipt table that stores raw image metadata, extracted text fields, and a placeholder category value.

## Entregavel

- SQLite connection setup
- Receipt table schema
- Receipt model or repository layer
- Placeholder classification field
- Extracted text fields in the schema

## Definicao de pronto

- Receipt records can be inserted and read back
- The schema supports future OCR and classification work
- The data model matches the Day 1 architecture decisions

## Teste

- Create a receipt record and read it back successfully
- Inspect the schema to confirm extracted text fields exist
- Confirm the placeholder category is persisted

