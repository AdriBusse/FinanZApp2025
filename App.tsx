/**
 * FinanZ - React Native App
 * Following .ai/project_description.md guidelines, this app uses Apollo Client for GraphQL.
 * Screens will be implemented per the screenshots in .ai/*.jpg.
 */

import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './src/apollo/client';
import Dashboard from './src/screens/Dashboard';
import Login from './src/screens/Login';
import SavingsList from './src/screens/SavingsList';
import SavingTransactions from './src/screens/SavingTransactions';
import Expenses from './src/screens/Expenses';
import Profile from './src/screens/Profile';
import { useAuthStore } from './src/store/auth';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const AuthStack = createNativeStackNavigator();
const SavingsStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function SavingsStackScreen() {
  return (
    <SavingsStack.Navigator>
      <SavingsStack.Screen name="SavingsList" component={SavingsList} options={{ title: 'Savings' }} />
      <SavingsStack.Screen name="SavingTransactions" component={SavingTransactions} options={{ title: 'Transactions' }} />
    </SavingsStack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="DashboardTab" component={Dashboard} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="SavingsTab" component={SavingsStackScreen} options={{ title: 'Savings' }} />
      <Tab.Screen name="ExpensesTab" component={Expenses} options={{ title: 'Expenses' }} />
      <Tab.Screen name="ProfileTab" component={Profile} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function AppInner() {
  const isDarkMode = useColorScheme() === 'dark';
  const { token, initFromStorage, isInitializing } = useAuthStore();

  React.useEffect(() => {
    // Ensure we restore token on app start
    initFromStorage();
  }, [initFromStorage]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
        {isInitializing ? (
          // Keep the navigation tree minimal while initializing
          <View style={{ flex: 1 }} />
        ) : token ? (
          <AppTabs />
        ) : (
          <AuthStack.Navigator>
            <AuthStack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          </AuthStack.Navigator>
        )}
      </NavigationContainer>
    </View>
  );
}

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AppInner />
    </ApolloProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
