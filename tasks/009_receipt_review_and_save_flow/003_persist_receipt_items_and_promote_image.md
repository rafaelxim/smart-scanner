## Especificacao

Promote temporary receipt images and persist item rows when a receipt is confirmed.

## Entregavel

- Move image from temporary uploads path to final receipt uploads path
- Save receipt items as individual rows
- Mark extraction as confirmed
- Store final image path on receipt

## Definicao de pronto

- Final receipt references the promoted image
- Item rows are faithful to the reviewed receipt lines
- Temporary path is no longer used after confirmation

## Teste

- Confirm receipt and inspect final image location
- Confirm item rows exist in MySQL
- Confirm extraction status changed
