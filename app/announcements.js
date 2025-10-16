import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import apiService from '../api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

const AnnouncementsScreen = () => {
    const { userToken } = useContext(AuthContext);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await apiService.get('/get_announcements.php');

            if (response.data.success) {
                setAnnouncements(response.data.data);
            } else {
                Alert.alert('Error', response.data.message || 'Failed to fetch announcements.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while fetching announcements.');
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={pageStyles.announcementCard}>
            <View style={pageStyles.announcementContent}>
                <Text style={pageStyles.announcementTitle}>{item.title}</Text>
                <Text style={pageStyles.announcementText}>{item.content}</Text>
                <Text style={pageStyles.announcementDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
        </View>
    );

    if (loading) {
        return <ActivityIndicator size="large" color="#007bff" style={{ flex: 1, justifyContent: 'center' }} />;
    }

    return (
        <View style={pageStyles.container}>
            <View style={pageStyles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={pageStyles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={pageStyles.headerTitle}>Announcements</Text>
            </View>
            <FlatList
                data={announcements}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={pageStyles.listContainer}
                ListEmptyComponent={<Text style={pageStyles.emptyText}>No announcements found.</Text>}
            />
        </View>
    );
};

const pageStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    header: {
        backgroundColor: '#007bff',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 20,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    listContainer: {
        padding: 20,
    },
    announcementCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    announcementContent: {
        padding: 20,
    },
    announcementTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    announcementText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#666',
    },
    announcementDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 10,
        textAlign: 'right',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#666',
    },
});

export default AnnouncementsScreen;
