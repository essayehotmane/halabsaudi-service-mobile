// screens/HomeScreen.tsx
import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
    Modal,
    TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import {consts} from "../consts";
import HeaderLogo from "../components/HeaderLogo";

type HomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Home'>;

type Props = {
    navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<any> = ({navigation}) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [discount, setDiscount] = useState<string>('');
    const [discountCode, setDiscountCode] = useState<string>('');
    const [canApplyDiscount, setCanApplyDiscount] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [serviceData, setServiceData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // getting the service details
    useEffect(() => {
        const getService = async () => {
            try {
                setLoading(true);
                const storedToken = await AsyncStorage.getItem('token');
                const storedUser = await AsyncStorage.getItem('user');

                if (!storedToken || !storedUser) {
                    setError('No token or user found');
                    return;
                }

                const parsedUser = JSON.parse(storedUser)

                const response = await axios.get(`${consts.API_URL}/service/${parsedUser.service_id}`, {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                    },
                });
                setServiceData(response.data); // Update state with service data
                setDiscount(response.data.data.discount)
                setToken(storedToken);
                setUser(parsedUser);
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
            if (response.data.isValid) {
                Alert.alert('Success', 'Discount applied successfully');
            }else{
                Alert.alert('Error', 'Failed to apply discount');
            }
        } catch (error) {
            console.log('error ? ', error)
            Alert.alert('Error', 'Failed to apply discount');
        }
    };

    const handleUpdateDiscount = async () => {
        try {
            console.log('token ? ', token);
            const response = await axios.put(
                `${consts.API_URL}/service`,
                {
                    id: serviceData?.data.id,
                    discount: discount
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsVisible(false);
            Alert.alert('Success', 'Discount updated successfully');
        } catch (error) {
            console.log('error ? ', error)
            Alert.alert('Error', 'Failed to update discount');
        }
    };

    const handleCheckCodeValidity = async () => {
        try {
            if (discountCode === "") {
                Alert.alert('Error', 'Please enter a valid discount code');
                return;
            }
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
            Alert.alert('Error', 'Failed to check discount');
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('tokenExpiration');
        await AsyncStorage.removeItem('user');
        navigation.navigate('Login');
    };

    const handleDiscountChange = (text) => {
        const numericValue = parseInt(text, 10);
        if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 100) {
            setDiscount(text);
        } else if (text === '') {
            setDiscount('');
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#00502A" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>

            <HeaderLogo />

            <Modal
                transparent={true}
                visible={isVisible}
                animationType="fade"
                onRequestClose={() => {}}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.modalTitle}>
                                Modify Discount
                            </Text>
                        </View>
                        <View style={styles.modalInputContainer}>
                            <Text style={styles.modalInputLabel}>Discount Percentage</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType={'numeric'}
                                value={String(discount)}
                                onChangeText={handleDiscountChange}
                                maxLength={3}
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateDiscount}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelButton} onPress={()=>{setIsVisible(false)}}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>

            <View style={styles.body}>
                <View style={styles.currentDiscountContainer}>
                    <View style={styles.currentDiscountRow1}>
                        <Text style={styles.currentDiscountText}>Current Discount</Text>
                        <TouchableOpacity onPress={() => {setIsVisible(true)}}>
                            <Text style={styles.editButton}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text style={styles.currentDiscount}>{discount}% OFF</Text>
                    </View>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Enter Discount Code"
                    value={discountCode}
                    onChangeText={setDiscountCode}
                />

                <TouchableOpacity disabled={loading} onPress={handleCheckCodeValidity} style={styles.buttonCheck}>
                    <Text style={styles.buttonCheckText}>Check the discount code</Text>
                </TouchableOpacity>

                <TouchableOpacity disabled={loading} onPress={handleApplyDiscount} style={styles.buttonApply}>
                    <Text style={styles.buttonApplyText}>Apply the discount</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.footer}>
                <Button color={'#ed6868'} title="Logout" onPress={handleLogout} />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 30,
        backgroundColor: '#f5f5f5',
    },
    body: {
        marginTop: 100,
        justifyContent: 'flex-start',
        flex: 5,
    },
    footer: {
        flex: 1,
        width: '100%',
    },
    currentDiscountContainer: {
        flexDirection: 'column',
        width: '100%',
        height: 100,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#cdd3da',
        marginBottom: 100
    },
    currentDiscountRow1: {
        flexDirection : 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5
    },
    currentDiscountText: {
        fontSize: 24,
        fontWeight: 'regular'
    },
    editButton: {
        color: '#447159'
    },
    currentDiscount: {
        fontSize: 20,
        fontWeight: 'regular'
    },
    input: {
        height: 56,
        width: '100%',
        marginBottom: 5,
        paddingHorizontal: 10,
        backgroundColor: '#ECF1EE',
        borderRadius: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalContainer: {
        width: "80%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    titleContainer: {
        width: "100%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 15,
        textAlign: 'left'
    },
    modalInputContainer: {
      width: '100%',
        marginTop: 20
    },
    modalInputLabel: {
        color: '#9a9a9a',
        marginBottom: 2,
    },
    modalButtons: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    saveButton: {
        marginTop: 20,
        backgroundColor: "#00502A",
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 30,
        width: "auto",
        alignItems: "center",
    },
    saveButtonText: {
        color: 'white',
    },
    cancelButton: {
        marginTop: 20,
        backgroundColor: "#efefef",
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 30,
        width: "auto",
        alignItems: "center",
    },
    cancelButtonText: {
        color: '#353535',
    },
    buttonApply: {
        marginTop: 20,
        backgroundColor: "#00502A",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 15,
        width: "100%",
        alignItems: "center",
    },
    buttonApplyText: {
        color: "white",
        fontSize: 18,
    },
    buttonCheck: {
        marginTop: 20,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderColor: '#00502A',
        borderWidth: 1,
        borderRadius: 15,
        width: "100%",
        alignItems: "center",
    },
    buttonCheckText: {
        color: "#00502A",
        fontSize: 18,
    },
});

export default HomeScreen;
