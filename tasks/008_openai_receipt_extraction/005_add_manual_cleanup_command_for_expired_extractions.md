## Especificacao

Add a manual cleanup command for expired temporary receipt extractions.

## Entregavel

- Backend script or package command
- Deletes expired extraction rows
- Deletes related temporary image files
- Logs cleanup result

## Definicao de pronto

- Extractions older than 24 hours can be cleaned manually
- Confirmed receipts are not deleted
- Missing temp files do not crash cleanup

## Teste

- Seed expired and non-expired extraction rows
- Run cleanup command
- Confirm only expired rows/files are removed
