## Especificacao

Add the baseline CI verification needed for the monorepo.
The first CI workflow should install dependencies and run TypeScript checks across all packages.

## Entregavel

- GitHub Actions workflow
- Root install step
- Root typecheck step
- CI documentation in project commands or README

## Definicao de pronto

- CI runs on pull requests and pushes
- CI installs from the root lockfile
- CI runs the root typecheck command
- Failures are visible in GitHub checks

## Teste

- Run the same install/typecheck commands locally
- Confirm workflow YAML is valid
- Confirm CI uses the project package manager version
