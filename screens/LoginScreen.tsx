// screens/LoginScreen.tsx
import React, { useState } from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import {consts} from "../consts";

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

type Props = {
    navigation: LoginScreenNavigationProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const handleLogin = async () => {

        if (!validateEmail(email)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }
        if (password.length < 6) {
            setErrorMessage('Password must be more than 6 characters.');
            return;
        }

        try {
            setErrorMessage('');
            setLoading(true);

            const response = await axios.post( consts.API_URL + '/login', {
                email,
                password,
            });

            const token = response.data.token;
            const expirationTime = Date.now() + 4 * 60 * 60 * 1000; // 4 hours from now
            const user = response.data.user;

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('tokenExpiration', expirationTime.toString());
            await AsyncStorage.setItem('user', JSON.stringify(user));

            navigation.navigate('Home');
        } catch (error) {
            console.error('Login failed', error);
            setErrorMessage('Login failed. Please check your credentials.');
        }finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!passwordVisible}
                />
                <TouchableOpacity
                    onPress={() => setPasswordVisible(!passwordVisible)}
                    style={styles.showHideButton}
                >
                    <Text style={styles.showHideText}>{passwordVisible ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
            </View>
            <Button
                title={loading ? 'Logging in...' : 'Login'}
                onPress={handleLogin}
                disabled={loading}
            />
            {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        width: '100%',
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    showHideButton: {
        marginLeft: 10,
    },
    showHideText: {
        color: '#007BFF',
    },
    loading: {
        marginTop: 20,
    },
    error: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
});

export default LoginScreen;
