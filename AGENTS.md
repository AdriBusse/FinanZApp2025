# Repository Guidelines

## Project Structure & Module Organization

The React Native application lives in `FinanZ/`; run project commands there. `App.tsx` and `index.js` are the entry points. Under `src/`, screens are in `screens/`, reusable UI in `components/` (atoms, molecules, organisms, and layout), hooks in `hooks/`, Zustand state in `store/`, and Apollo configuration in `apollo/`. GraphQL operations and types live in `src/queries/`. Put images in `src/assets/`. Native projects are in `android/` and `ios/`; Jest tests belong in `__tests__/`.

## Build, Test, and Development Commands

Use Node 20 (`.nvmrc`) and install exact dependencies with `npm ci`.

- `npm start` starts Metro and resets its cache.
- `npm run ios` / `npm run android` builds and launches the app.
- `npm run type-check` runs TypeScript without emitting files.
- `npm run lint` checks ESLint rules; `npm run lint:fix` applies fixes.
- `npm run format:check` verifies Prettier formatting; `npm run format` rewrites files.
- `npm test` runs Jest locally; `npm run test:ci` adds CI coverage reporting.
- `cd android && ./gradlew assembleDebug` builds a debug APK.

## Coding Style & Naming Conventions

Write typed React Native code in TypeScript with two-space indentation. Prettier enforces single quotes, trailing commas, and omitted arrow-function parentheses where possible. Use PascalCase for components and screens (`RoundedButton.tsx`), camelCase for functions and stores, and the `use...` prefix for hooks. Keep GraphQL operations grouped by domain and mutations under `src/queries/mutations/`. Prefer small components and explicit prop types.

## Testing Guidelines

Jest uses the React Native preset and `react-test-renderer`. Name tests `*.test.ts` or `*.test.tsx` and place them in `__tests__/` or near the tested module when locality helps. Add tests for new behavior and regressions. No minimum coverage threshold is configured, but CI publishes the coverage report. Before opening a PR, run formatting, lint, type-checking, and `npm run test:ci`.

## Commit & Pull Request Guidelines

Recent commits use short, imperative, lowercase summaries such as `add icon` or `show a loading indicator while transactions are loading`. Keep each commit focused. PRs should explain the user-visible change, identify affected platforms, link relevant issues, and include screenshots or recordings for UI work. Ensure all CI quality checks and the Android debug build pass.

## Security & Configuration

Do not commit API tokens, signing keystores, passwords, or production endpoints. Configure the GraphQL URL in `src/apollo/client.ts` and provide Android signing values through CI secrets. Review generated GraphQL changes before committing them.
