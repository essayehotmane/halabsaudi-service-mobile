// screens/HomeScreen.tsx
import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import {consts} from "../consts";

type HomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Home'>;

type Props = {
    navigation: HomeScreenNavigationProp;
    token: string | null;
    user : any| null;
}

const HomeScreen: React.FC<any> = ({ navigation, token, user }) => {
    const [discount, setDiscount] = useState<number>(0);
    const [discountCode, setDiscountCode] = useState<string>('');
    const [canApplyDiscount, setCanApplyDiscount] = useState(false);
    const [serviceData, setServiceData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // getting the service details
    useEffect(() => {
        const getService = async () => {
            try {
                setLoading(true);
                if (!token || !user) {
                    setError('No token or user found');
                    return;
                }
                const connectedUser = JSON.parse(user);
                const response = await axios.get(`${consts.API_URL}/service/${connectedUser.service_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include token in request headers
                    },
                });
                setServiceData(response.data); // Update state with service data
                setDiscount(response.data.data.discount)
            } catch (error) {
                console.error('Error fetching service:', error);
                setError('Failed to fetch service data.');
            } finally {
                setLoading(false);
            }
        };

        getService();
    }, []);


    const handleApplyDiscount = async () => {
        try {
            console.log('token ? ', token);
            const response = await axios.put(
                 `${consts.API_URL}/discount/${discountCode}/service/${serviceData?.data.id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('res ? ', response)
            Alert.alert('Success', 'Discount applied successfully');
        } catch (error) {
            console.log('error ? ', error)
            Alert.alert('Error', 'Failed to apply discount');
        }
    };

    const handleCheckCodeValidity = async () => {
        try {

            const response = await axios.get(
                consts.API_URL + '/discount/check/' + discountCode,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if(response.data.codeIsValide){
                Alert.alert('Success', 'Discount code is valid');
                setCanApplyDiscount(true);
            }else{
                Alert.alert('Failed', 'Discount code is not valid');
                setCanApplyDiscount(false);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to apply discount');
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('tokenExpiration');
        await AsyncStorage.removeItem('user');
        navigation.navigate('Login');
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text>Home Page</Text>
            <Text>Change Discount:</Text>
            <TextInput
                style={styles.input}
                placeholder="Discount (%)"
                value={String(discount)}
                onChangeText={(value) => setDiscount(parseInt(value))}
                keyboardType="numeric"
            />
            <Text>Discount Code:</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter Discount Code"
                value={discountCode}
                onChangeText={setDiscountCode}
            />
            <Button title="Check Code" onPress={handleCheckCodeValidity} />
            <Button title="Apply Discount" onPress={handleApplyDiscount} disabled={!canApplyDiscount}/>
            <Button title="Logout" onPress={handleLogout} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white' },
    input: { borderWidth: 1, marginVertical: 10, padding: 10 },
});

export default HomeScreen;
