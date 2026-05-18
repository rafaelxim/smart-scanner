## Especificacao

Integrate backend OCR using `Tesseract.js` so uploaded receipts produce extracted text when possible.
If OCR fails, the backend should still save the receipt record and return a usable response.

## Entregavel

- OCR pipeline in the backend
- Extracted text mapping into the receipt record
- Graceful fallback path when OCR fails
- Response shape that tells the client whether OCR succeeded or failed

## Definicao de pronto

- The backend attempts OCR on uploaded images
- OCR results are persisted when available
- Uploads still succeed when OCR fails
- The client can distinguish success from OCR fallback

## Teste

- Upload a receipt image that OCR can parse
- Upload a receipt image that causes OCR failure
- Confirm both uploads still create receipt records

