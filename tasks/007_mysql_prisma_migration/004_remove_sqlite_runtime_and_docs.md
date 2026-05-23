## Especificacao

Remove SQLite-specific runtime code and documentation after Prisma/MySQL is active.

## Entregavel

- Removed SQLite connection code
- Removed SQLite env vars from examples
- Updated useful commands
- Updated Docker documentation

## Definicao de pronto

- No backend runtime code imports `node:sqlite`
- Docs no longer instruct users to inspect SQLite snapshots
- MySQL is the documented persistence layer

## Teste

- Search the repo for SQLite-specific runtime references
- Run typecheck
