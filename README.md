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
# or
yarn
```

2) iOS native deps (first run and whenever native deps change)

```sh
cd ios
bundle install
bundle exec pod install
```

## Running the app
- Start Metro in one terminal:

```sh
npm start
# or
yarn start
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
const GRAPHQL_URL = 'https://apifinanzv2.ghettohippy.de/graphql';
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

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
