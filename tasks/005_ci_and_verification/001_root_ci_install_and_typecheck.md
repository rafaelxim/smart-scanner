## Especificacao

Add a minimal CI workflow that verifies the monorepo can be installed and typechecked.
Keep the pipeline intentionally small for Day 1.

## Entregavel

- CI workflow file
- Install step
- Typecheck step
- Workspace-wide verification

## Definicao de pronto

- CI runs on the repository without manual intervention
- CI fails when dependency installation fails
- CI fails when TypeScript errors are introduced

## Teste

- Trigger the CI workflow on a branch
- Confirm the install step and typecheck step both pass

