## Especificacao

Implement `POST /receipt-extractions`.
The endpoint receives a receipt image, saves it temporarily, calls OpenAI Vision with a strict schema, and returns extracted data for review.

## Entregavel

- Multipart endpoint for extraction
- Temporary image storage
- OpenAI image extraction call
- `receipt_extractions` persistence
- Structured response for mobile review

## Definicao de pronto

- Valid receipt image returns an extraction id and extracted payload
- OpenAI failure returns a clear error and does not create a confirmed receipt
- Temporary image path is stored with the extraction

## Teste

- Upload a real market receipt image
- Confirm extraction row exists in MySQL
- Confirm no receipt row is created before confirmation
- Trigger OpenAI failure and confirm temp file is cleaned
