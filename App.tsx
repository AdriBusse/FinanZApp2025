import React from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { ApolloProvider } from '@apollo/client/react';
import Dashboard from './src/screens/Dashboard';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import GoogleSignup from './src/screens/GoogleSignup';
import SavingsList from './src/screens/SavingsList';
import SavingTransactions from './src/screens/SavingTransactions';
import Expenses from './src/screens/Expenses';
import ExpenseTransactions from './src/screens/ExpenseTransactions';
import ExpenseStats from './src/screens/ExpenseStats';
import ExpenseTemplates from './src/screens/ExpenseTemplates';
import CreateCategory from './src/screens/CreateCategory';
import Categories from './src/screens/Categories';
import Profile from './src/screens/Profile';
import Report from './src/screens/Report';
import Record from './src/screens/Record';
import { useAuthStore } from './src/store/auth';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createBottomTabNavigator,
  BottomTabBarButtonProps,
} from '@react-navigation/bottom-tabs';
import {
  Home,
  PiggyBank,
  ReceiptText,
  User,
  PieChart,
  Mic,
} from 'lucide-react-native';
import { apolloClient } from './src/apollo/client';
import { configureGoogleAuth } from './src/services/googleAuth';

configureGoogleAuth();

const AuthStack = createNativeStackNavigator();
const SavingsStack = createNativeStackNavigator();
const ExpensesStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const DARK_BACKGROUND = '#0e0f14';

const AppNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#2e7d32',
    background: DARK_BACKGROUND,
    card: '#141821',
    text: '#f8fafc',
    border: '#1f2937',
    notification: '#2e7d32',
  },
};

function SavingsStackScreen() {
  return (
    <SavingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SavingsStack.Screen
        name="SavingsList"
        component={SavingsList}
        options={{ title: 'Savings' }}
      />
      <SavingsStack.Screen
        name="SavingTransactions"
        component={SavingTransactions}
        options={{ title: 'Transactions' }}
      />
    </SavingsStack.Navigator>
  );
}

function ExpensesStackScreen() {
  return (
    <ExpensesStack.Navigator screenOptions={{ headerShown: false }}>
      <ExpensesStack.Screen
        name="ExpensesList"
        component={Expenses}
        options={{ title: 'Expenses' }}
      />
      <ExpensesStack.Screen
        name="ExpenseTransactions"
        component={ExpenseTransactions}
        options={{ title: 'Transactions' }}
      />
      <ExpensesStack.Screen
        name="Categories"
        component={Categories}
        options={{ title: 'Categories' }}
      />
      <ExpensesStack.Screen
        name="CreateCategory"
        component={CreateCategory}
        options={{ title: 'Create Category' }}
      />
      <ExpensesStack.Screen
        name="ExpenseStats"
        component={ExpenseStats}
        options={{ title: 'Statistics' }}
      />
      <ExpensesStack.Screen
        name="ExpenseTemplates"
        component={ExpenseTemplates}
        options={{ title: 'Templates' }}
      />
    </ExpensesStack.Navigator>
  );
}

function AppTabs() {
  const insets = useSafeAreaInsets();
  // Custom center tab button for Dashboard (bigger, circular active indicator)
  const CenterTabBarButton = (props: BottomTabBarButtonProps) => {
    const {
      accessibilityState,
      onPress,
      onLongPress,
      accessibilityLabel,
      accessibilityRole,
      testID,
      children,
    } = props;
    const selected = Boolean(accessibilityState?.selected);

    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityRole={accessibilityRole ?? 'tab'}
        accessibilityState={accessibilityState}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        hitSlop={12}
        style={{
          position: 'absolute',
          top: -18,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            borderRadius: 40,
            borderWidth: selected ? 6 : 2,
            borderColor: selected ? '#2e7d32' : '#1f2937',
            backgroundColor: selected ? 'rgba(46,125,50,0.16)' : '#141821',
            width: 68,
            height: 68,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 6,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
          }}
        >
          {children}
        </View>
      </Pressable>
    );
  };

  return (
    <Tab.Navigator
      initialRouteName="DashboardTab"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const isDashboard = route.name === 'DashboardTab';
          const iconSize = isDashboard ? 30 : size;
          const iconProps = { color, size: iconSize } as const;
          switch (route.name) {
            case 'DashboardTab':
              return <Home {...iconProps} />;
            case 'SavingsTab':
              return <PiggyBank {...iconProps} />;
            case 'ExpensesTab':
              return <ReceiptText {...iconProps} />;
            case 'ReportTab':
              return <PieChart {...iconProps} />;
            case 'RecordTab':
              return <Mic {...iconProps} />;
            case 'ProfileTab':
              return <User {...iconProps} />;
            default:
              return <Home {...iconProps} />;
          }
        },
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#2e7d32',
        tabBarInactiveTintColor: '#94a3b8',
        sceneContainerStyle: {
          backgroundColor: DARK_BACKGROUND,
        },
        tabBarStyle: {
          height: 64 + (insets.bottom || 0),
          paddingTop: 6,
          paddingBottom: Math.max(8, insets.bottom || 0),
          backgroundColor: '#141821',
          borderTopColor: '#1f2937',
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      {/* Left side: Savings and Expenses */}
      <Tab.Screen
        name="SavingsTab"
        component={SavingsStackScreen}
        options={{ title: 'Savings' }}
      />
      <Tab.Screen
        name="ExpensesTab"
        component={ExpensesStackScreen}
        options={{ title: 'Expenses' }}
      />
      {/* Center: Dashboard with custom button */}
      <Tab.Screen
        name="DashboardTab"
        component={Dashboard}
        options={{
          title: 'Dashboard',
          tabBarButton: props => <CenterTabBarButton {...props} />,
          tabBarLabel: () => null,
        }}
      />
      {/* Right side: Report and Profile */}
      <Tab.Screen
        name="ReportTab"
        component={Report}
        options={{ title: 'Report' }}
      />
      <Tab.Screen
        name="RecordTab"
        component={Record}
        options={{ title: 'Record' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={Profile}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function AppInner() {
  const { token, initFromStorage, isInitializing, user } = useAuthStore();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Platform.OS === 'android' ? insets.top : 0 },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={DARK_BACKGROUND} />
      <NavigationContainer
        key={token ? `auth:${user?.id ?? 'unknown'}` : 'auth:guest'}
        theme={AppNavigationTheme}
      >
        {isInitializing ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: DARK_BACKGROUND,
            }}
          >
            <ActivityIndicator size="large" color="#93c5fd" />
          </View>
        ) : token ? (
          <AppTabs />
        ) : (
          <AuthStack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: DARK_BACKGROUND },
            }}
          >
            <AuthStack.Screen name="Login" component={Login} />
            <AuthStack.Screen name="Register" component={Register} />
            <AuthStack.Screen name="GoogleSignup" component={GoogleSignup} />
          </AuthStack.Navigator>
        )}
      </NavigationContainer>
    </View>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ApolloProvider client={apolloClient}>
        <GestureHandlerRootView style={styles.container}>
          <SafeAreaProvider>
            <AppInner />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ApolloProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BACKGROUND,
  },
});

export default App;
