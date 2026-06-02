## Especificacao

Add the mobile action that confirms reviewed receipt data by calling `POST /receipts`.

## Entregavel

- Confirm button on the review screen
- API client function for `POST /receipts`
- Request payload built from reviewed receipt fields and item rows
- Loading state while confirmation is in progress
- Error state for validation, expired extraction, already confirmed extraction, and network failures
- Success navigation after the receipt is saved

## Definicao de pronto

- User can review extracted data and confirm the receipt from the mobile app
- Mobile sends `extractionId` and the reviewed receipt payload to the backend
- Confirm button is disabled while saving to avoid duplicate submissions
- Backend errors are shown clearly without losing the reviewed edits
- Successful confirmation creates the receipt, receipt items, promotes the image, and leaves the review screen

## Teste

- Upload a receipt image and navigate to review
- Edit receipt fields and item rows
- Confirm the receipt from the review screen
- Confirm the receipt exists in MySQL with item rows
- Confirm retry/error behavior when the backend returns validation or conflict errors
