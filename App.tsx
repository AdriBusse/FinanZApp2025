import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Pressable } from 'react-native';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './src/apollo/client';
import Dashboard from './src/screens/Dashboard';
import Login from './src/screens/Login';
import SavingsList from './src/screens/SavingsList';
import SavingTransactions from './src/screens/SavingTransactions';
import Expenses from './src/screens/Expenses';
import Profile from './src/screens/Profile';
import Report from './src/screens/Report';
import { useAuthStore } from './src/store/auth';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Home, PiggyBank, ReceiptText, User, PieChart } from 'lucide-react-native';

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
    // Custom center tab button for Dashboard (bigger, circular active indicator)
    const CenterTabBarButton = (props: BottomTabBarButtonProps) => {
        const {
            accessibilityState,
            onPress,
            onLongPress,
            accessibilityLabel,
            accessibilityRole,
            testID,
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
                style={{ position: 'absolute', top: -18, left: 0, right: 0, alignItems: 'center' }}
            >
                <View
                    style={{
                        borderRadius: 40,
                        borderWidth: selected ? 6 : 2,
                        borderColor: selected ? '#2e7d32' : 'rgba(0,0,0,0.75)',
                        backgroundColor: selected ? 'rgba(46,125,50,0.08)' : 'white',
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
                    <Home color={selected ? '#2e7d32' : '#444'} size={30} />
                </View>
            </Pressable>
        );
    };

    return (
        <Tab.Navigator
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
                        case 'ProfileTab':
                            return <User {...iconProps} />;
                        default:
                            return <Home {...iconProps} />;
                    }
                },
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: '#2e7d32',
                tabBarStyle: {
                    height: 64,
                    paddingTop: 6,
                    paddingBottom: 8,
                },
            })}
        >
            {/* Left side: Savings and Expenses */}
            <Tab.Screen name="SavingsTab" component={SavingsStackScreen} options={{ title: 'Savings' }} />
            <Tab.Screen name="ExpensesTab" component={Expenses} options={{ title: 'Expenses' }} />
            {/* Center: Dashboard with custom button */}
            <Tab.Screen
                name="DashboardTab"
                component={Dashboard}
                options={{
                    title: 'Dashboard',
                    // Render our own button so we can show active green border
                    tabBarButton: (props) => <CenterTabBarButton {...props} />,
                    // Avoid rendering the default icon/label as children of tabBarButton
                    tabBarIcon: () => null,
                    tabBarLabel: () => null,
                }}
            />
            {/* Right side: Report and Profile */}
            <Tab.Screen name="ReportTab" component={Report} options={{ title: 'Report' }} />
            <Tab.Screen name="ProfileTab" component={Profile} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
}

function AppInner() {
    const isDarkMode = useColorScheme() === 'dark';
    const { token, initFromStorage, isInitializing } = useAuthStore();

    React.useEffect(() => {
        initFromStorage();
    }, [initFromStorage]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
                {isInitializing ? (
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