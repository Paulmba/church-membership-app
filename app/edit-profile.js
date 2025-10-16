import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React, { useContext, useState, useEffect } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import apiService from '../api';

const EditProfileScreen = () => {
    const { memberId } = useContext(AuthContext);
    const [memberData, setMemberData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        if (memberId) {
            fetchProfileData();
        }
    }, [memberId]);

    const fetchProfileData = async () => {
        try {
            const response = await apiService.get(`/get_member_profile.php?mid=${memberId}`);
            if (response.data.success) {
                setMemberData(response.data.data);
            } else {
                Alert.alert('Error', 'Failed to fetch profile data.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while fetching your profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await apiService.post('/update_member_profile.php', memberData);
            if (response.data.success) {
                Alert.alert('Success', 'Profile updated successfully.');
                navigation.goBack();
            } else {
                Alert.alert('Error', response.data.message || 'Failed to update profile.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while updating your profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setMemberData({ ...memberData, [field]: value });
    };

    if (loading) {
        return <ActivityIndicator style={pageStyles.loading} size="large" color="#007bff" />;
    }

    if (!memberData) {
        return <Text style={pageStyles.errorText}>No profile data found.</Text>;
    }

    return (
        <ScrollView style={pageStyles.container}>
            <View style={pageStyles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={pageStyles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={pageStyles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} style={pageStyles.saveButton} disabled={saving}>
                    {saving ? <ActivityIndicator color="#fff" /> : <Ionicons name="save-outline" size={24} color="#fff" />}
                </TouchableOpacity>
            </View>

            <View style={pageStyles.form}>
                <InputRow
                    label="First Name"
                    value={memberData.first_name}
                    onChangeText={(text) => handleInputChange('first_name', text)}
                />
                <InputRow
                    label="Last Name"
                    value={memberData.last_name}
                    onChangeText={(text) => handleInputChange('last_name', text)}
                />
                <InputRow
                    label="Address"
                    value={memberData.address}
                    onChangeText={(text) => handleInputChange('address', text)}
                    multiline
                />
            </View>
        </ScrollView>
    );
};

const InputRow = ({ label, value, onChangeText, multiline }) => (
    <View style={pageStyles.inputContainer}>
        <Text style={pageStyles.label}>{label}</Text>
        <TextInput
            style={multiline ? [pageStyles.input, pageStyles.multilineInput] : pageStyles.input}
            value={value}
            onChangeText={onChangeText}
            multiline={multiline}
        />
    </View>
);

const pageStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
    header: {
        backgroundColor: '#007bff',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    backButton: {
        padding: 5,
    },
    saveButton: {
        padding: 5,
    },
    form: {
        padding: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
    },
});

export default EditProfileScreen;
