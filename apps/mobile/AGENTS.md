# Mobile App Instructions

These instructions apply to `apps/mobile` and extend the repository-level `AGENTS.md`.

## Architecture Style

Use feature-based architecture.

Target structure:

```text
src/
  app/
    navigation/
  features/
    upload/
    review/
    dashboard/
    history/
    receipt-detail/
  shared/
    api/
    components/
    config/
    formatting/
    styles/
    types/
```

The current `src/App.tsx` is scaffold-era code. Do not keep growing it. Refactor it through an explicit task before adding substantial mobile features.

## Navigation

Use a root stack with tabs inside it:

```text
RootStack
  MainTabs
    Upload
    Dashboard
    History
  ReviewReceipt
  ReceiptDetail
```

Keep route types centralized:

```text
src/app/navigation/types.ts
```

Use typed route param lists such as `RootStackParamList` and `MainTabParamList`.

## API Access

Do not call `fetch` directly from screens.

Use:

```text
src/shared/api/client.ts
```

for:

- base URL handling
- JSON parsing
- multipart requests
- common headers
- error normalization

Feature-specific API modules should call the shared client:

```text
src/features/upload/api.ts
src/features/review/api.ts
src/features/dashboard/api.ts
src/features/history/api.ts
```

## Environment Config

Only this module should read `process.env`:

```text
src/shared/config/env.ts
```

Screens and feature modules must not read `process.env` directly.

The mobile API URL comes from:

```text
EXPO_PUBLIC_API_BASE_URL
```

## State Management

Use local state and feature hooks by default.

Do not add a global state library in v1.

Use React Hook Form with `Controller` for complex forms, especially the receipt review screen.

## Shared UI

Keep shared UI minimal and practical:

```text
src/shared/components/Button.tsx
src/shared/components/Card.tsx
src/shared/components/Screen.tsx
src/shared/components/EmptyState.tsx
src/shared/components/ErrorMessage.tsx
```

Feature-specific UI stays inside that feature:

```text
src/features/review/components/
src/features/dashboard/components/
```

## Styling

Use `StyleSheet.create` with shared tokens.

Put tokens here:

```text
src/shared/styles/tokens.ts
```

Tokens should cover:

- colors
- spacing
- radii
- typography

Avoid scattering repeated hex colors and spacing constants across screens.

## Lists and Layout

Use `FlatList` for real lists that can grow:

- receipt lists
- item lists
- category lists

Use `ScrollView` only for short content.

Respect safe areas in every screen. Prefer a shared `Screen` component that handles safe area, background, and common padding.

## Data and Validation

Mobile trusts backend-validated shared types from `packages/shared`.

Do not add runtime validation libraries to mobile in v1.

Keep data normalization and schema validation in the backend.

## Images

In v1, receipt images are previewed locally during upload/review only.

Do not add backend image serving to the mobile app until there is an explicit task for it.

## Offline Behavior

No offline support in v1.

The app can require internet access for extraction, saving, dashboard, and history.

## Error Handling

Use normalized API errors from the shared API client.

Display API errors with:

```text
src/shared/components/ErrorMessage.tsx
```

Do not show raw technical errors directly from screens unless no normalized message is available.

## Validation Commands

Run mobile typecheck after mobile changes:

```bash
pnpm --filter @smart-scanner/mobile typecheck
```

When changing Expo config or dependencies, also run:

```bash
pnpm --filter @smart-scanner/mobile exec expo config --type public
pnpm --filter @smart-scanner/mobile exec expo install --check
```
