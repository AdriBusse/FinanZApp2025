This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Project Overview

FinanZ is a React Native app for personal finance management. Track expenses and savings, organize by categories, manage recurring items and templates, and monitor progress with charts. A customizable dashboard lets you arrange widgets with drag-and-drop. Apollo Client powers GraphQL communication, and auth tokens are stored securely with Keychain and protected by biometrics.

### Tech Stack
- React Native 0.80, React 19
- Apollo Client (`@apollo/client`) for GraphQL
- State: `zustand`
- Forms & validation: `formik`, `yup`
- Navigation: `@react-navigation/*`
- UI/UX: `react-native-gesture-handler`, `react-native-reanimated`, `react-native-safe-area-context`
- Secure storage & biometrics: `react-native-keychain`
- Drag-and-drop grid: `react-native-draggable-flatlist`
- Charts: `react-native-gifted-charts`, `victory-native`

## Prerequisites
- Node.js >= 18 (see `"engines"` in `package.json`)
- npm or Yarn
- iOS: Xcode + CocoaPods (Ruby + Bundler)
- Android: Android SDK + JDK 17 (or compatible), emulator or device
- Watchman (recommended on macOS)

## Setup
1) Install JS deps

```sh
npm install
```

2) iOS native deps (first run and whenever native deps change)

```sh
cd ios
pod install
```

## Running the app
- Start Metro in one terminal:

```sh
npm start
```

- Build & run:

```sh
npm run ios    # iOS simulator / device
npm run android
```

## Environment & API
- Apollo Client is configured in `src/apollo/client.ts`.
- Update the GraphQL endpoint by editing `GRAPHQL_URL`:

```ts
// src/apollo/client.ts
const GRAPHQL_URL = 'localhost...';
```

- Auth: a bearer token is injected via `Authorization: Bearer <token>` using `getAuthToken()` and stored with `react-native-keychain`. Biometrics may be required to access it.
- Optional: If you use GraphQL Codegen, adjust the `codegen` script in `package.json` to point `GRAPHQL_ENDPOINT` at your server before running.

## Scripts
From `package.json`:

- `start` — start Metro bundler
- `ios` / `android` — run on platforms
- `lint`, `lint:fix` — ESLint
- `format`, `format:check` — Prettier
- `type-check` — TypeScript
- `test`, `test:ci` — Jest
- `codegen` — GraphQL code generation (update endpoint as needed)

## Project Structure (high level)
- `src/screens/` — app screens (e.g., `Dashboard.tsx`, `Expenses.tsx`, `SavingTransactions.tsx`)
- `src/components/` — UI building blocks
  - `atoms/` (e.g., `HorizontalBar.tsx`, `RoundedButton.tsx`)
  - `molecules/`, `organisms/` (forms, sheets, list items)
- `src/apollo/` — Apollo client setup
- `src/store/` — Zustand stores (auth, finance)
- `src/hooks/` — custom hooks

## Key Features
- Dashboard grid with drag-and-drop editing and persistent layout
- Expenses and Savings with progress bars and limits/goals
- Expense templates and recurring items
- Form validation with Formik + Yup
- Secure auth token storage with biometrics
- GraphQL integration via Apollo Client

## Troubleshooting
- iOS: ensure CocoaPods installed (`bundle install`) and pods synced (`bundle exec pod install` in `ios/`).
- Metro cache: `npx react-native start --reset-cache`
- Android build issues: ensure correct JDK/SDK and ANDROID_HOME set.

## Contributing
- Use feature branches and open PRs.
- Keep components small and typed. Run lint/format/tests before pushing.

---

## React Native Reference

The following section is the standard React Native getting-started reference kept for convenience.

