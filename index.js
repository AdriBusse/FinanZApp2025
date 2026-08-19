import 'react-native-gesture-handler';
/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import * as Sentry from "@sentry/react-native";
Sentry.init({
    dsn: "http://40dea5c632b8412895789f0550927d02@glitchtip-owjhy2eb3n99n9wfoj6gscko.168.119.49.31.sslip.io/1",
});
AppRegistry.registerComponent(appName, () => App);
