// screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import {consts} from "../consts";
import HeaderLogo from "../components/HeaderLogo";

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
        <ScrollView contentContainerStyle={styles.container}>
            <HeaderLogo />
            <View style={styles.form}>
                <Text style={styles.title}>Login</Text>
                {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
                <TextInput
                    style={styles.inputEmail}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <View style={styles.inputPasswordContainer}>

                    <TextInput
                        style={styles.inputPassword}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!passwordVisible}
                        textContentType="password"
                    />
                    <TouchableOpacity
                        onPress={() => setPasswordVisible(!passwordVisible)}
                        style={styles.showHideButton}
                    >
                        <Text style={styles.showHideText}>{passwordVisible ? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity disabled={loading} onPress={handleLogin} style={styles.button}>
                    {loading ?
                        <ActivityIndicator size="small" color="#fff" />
                    :
                        <Text style={styles.buttonText}>Login</Text>
                    }
                </TouchableOpacity>

            </View>
            <View style={styles.footer}>
                <Text
                    style={styles.linkText}
                    onPress={() => {}}
                >
                    Don't have an account?
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 30,
        backgroundColor: 'white',
    },
    form: {
        justifyContent: 'center',
        flex: 4
    },
    footer: {
        flex: 1,
        width: '100%',
    },
    title: {
        fontSize: 23,
        marginBottom: 80,
        textAlign: 'center',
        color: '#103B2F'
    },
    inputEmail: {
        height: 56,
        width: '100%',
        marginBottom: 5,
        paddingHorizontal: 10,
        backgroundColor: '#ECF1EE',
        borderTopStartRadius: 10,
        borderTopEndRadius: 10,
    },
    inputPasswordContainer: {
        flexDirection: 'row',
        alignItems:'center',
        height: 56,
        width: '100%',
        marginBottom: 5,
        paddingHorizontal: 10,
        backgroundColor: '#ECF1EE',
        borderBottomStartRadius: 10,
        borderBottomEndRadius: 10,
    },
    inputPassword:{
        flex: 5
    },
    showHideButton: {
        alignItems: 'flex-end',
        flex: 1,
        marginLeft: 10,
    },
    showHideText: {
        color: "#447159",
    },
    button: {
        marginTop: 20,
        backgroundColor: "#00502A",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 15,
        width: "100%",
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 18,
    },
    error: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
    linkText: {
        textAlign: 'center',
        color: "#447159",
        textDecorationLine: "underline",
    },
});

export default LoginScreen;
