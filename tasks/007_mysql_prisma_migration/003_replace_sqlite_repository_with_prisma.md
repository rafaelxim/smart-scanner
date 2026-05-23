## Especificacao

Replace the SQLite repository layer with Prisma-backed persistence.

## Entregavel

- Prisma client setup
- Receipt extraction repository/service
- Receipt and item persistence service
- Transactional save for confirmed receipts

## Definicao de pronto

- Backend no longer depends on `node:sqlite`
- Confirmed receipts and items are saved through Prisma
- Receipt save is transactional

## Teste

- Create a receipt with multiple items
- Confirm rows exist in MySQL
- Confirm partial writes do not occur when save fails
