## Especificacao

Implement `POST /receipts` for confirmed, user-reviewed receipt data.

## Entregavel

- Confirm receipt endpoint
- Request body for extraction id and reviewed payload
- Validation of reviewed payload
- Transactional save

## Definicao de pronto

- Endpoint creates a receipt and its items from reviewed data
- Endpoint rejects expired or already confirmed extractions
- Endpoint saves nothing on validation failure

## Teste

- Confirm a valid extraction
- Attempt to confirm an expired extraction
- Attempt to confirm the same extraction twice
