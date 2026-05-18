## Especificacao

Implement the combined backend upload endpoint that accepts `multipart/form-data`.
Store the uploaded file on disk and create a receipt record in the database.

## Entregavel

- Combined upload endpoint
- Multipart file parsing
- File write to the mounted uploads directory
- Receipt persistence tied to the upload request

## Definicao de pronto

- A mobile client can send a receipt image using multipart upload
- The backend stores the file on disk
- The backend stores a matching receipt row in SQLite

## Teste

- Send a multipart request with an image
- Confirm the file exists on disk
- Confirm the receipt row was created in SQLite

