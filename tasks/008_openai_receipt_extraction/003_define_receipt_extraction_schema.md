## Especificacao

Define the strict JSON schema used for OpenAI receipt extraction.

## Entregavel

- Shared TypeScript types for extraction payload
- Backend validation schema
- Fixed item category enum
- Response type for extracted receipts

## Definicao de pronto

- Extracted payload includes market name, purchase date, official total, and items
- Items include name, quantity, unit, unit price, total price, and category
- Schema rejects malformed model output

## Teste

- Validate a correct extraction payload
- Validate rejection of malformed payloads
- Confirm shared types compile in backend and mobile
