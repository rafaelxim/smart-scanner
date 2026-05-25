## Especificacao

Refactor the current mobile scaffold into the feature-based architecture described in `apps/mobile/AGENTS.md`.
This task should preserve the existing upload behavior while moving code out of the single `src/App.tsx` file.

## Entregavel

- `src/app/navigation` with root navigation setup
- Centralized navigation route types
- Shared environment config module
- Shared API client module
- Minimal shared UI components
- Upload feature folder containing the existing upload screen behavior
- `App.tsx` reduced to app-level providers and navigator

## Definicao de pronto

- Screens no longer call `fetch` directly
- Screens no longer read `process.env` directly
- Upload behavior still supports camera, gallery, preview, loading, success, and error states
- Navigation still renders the app successfully in Expo Go
- Safe area behavior remains correct on Android

## Teste

- Run mobile typecheck
- Start Expo and verify upload tab renders
- Choose image from gallery
- Capture image with camera
- Trigger upload success and failure states
