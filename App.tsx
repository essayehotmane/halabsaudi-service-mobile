// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthStack from './navigation/AuthStack';
import HomeScreen from './screens/HomeScreen';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            const storedToken = await AsyncStorage.getItem('token');
            const expirationTime = await AsyncStorage.getItem('tokenExpiration');
            const storedUser = await AsyncStorage.getItem('user');

            if (storedUser && storedToken && expirationTime) {
                const currentTime = Date.now();
                if (currentTime < parseInt(expirationTime, 10)) {
                    setIsAuthenticated(true);
                } else {
                    await AsyncStorage.removeItem('token');
                    await AsyncStorage.removeItem('tokenExpiration');
                    await AsyncStorage.removeItem('user');
                    Alert.alert('Session expired', 'Please log in again.');
                }
            }
            setIsLoading(false);
        };

        checkToken();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <HomeScreen /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default App;
