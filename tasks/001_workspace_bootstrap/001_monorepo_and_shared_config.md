## Especificacao

Set up the repository as a `pnpm` monorepo with the root structure needed for the mobile app, backend app, and shared package.
Create the shared TypeScript and package-level configuration needed for both apps to compile consistently.

## Entregavel

- Root `pnpm-workspace.yaml`
- Root scripts for install, dev, and typecheck
- Shared TypeScript configuration at the repository root
- `apps/mobile` scaffold
- `apps/backend` scaffold
- `packages/shared` scaffold for API types and domain models

## Definicao de pronto

- The repository installs from the root with `pnpm install`
- The root can run type checking across all workspace packages
- Both app folders and the shared package exist with clear ownership
- Shared types can be imported by both the mobile app and backend app

## Teste

- Run the root install command successfully
- Run the root typecheck command successfully
- Verify imports from `packages/shared` resolve in both apps

