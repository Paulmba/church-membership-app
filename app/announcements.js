import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, Image, StyleSheet } from 'react-native';
import { AuthContext } from './AuthContext';
import apiService from '../api';
import styles from '../styles/styles';

const AnnouncementsScreen = () => {
    const { userToken } = useContext(AuthContext);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

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
            {item.image_url && (
                <Image source={{ uri: item.image_url }} style={pageStyles.announcementImage} />
            )}
            <View style={pageStyles.announcementContent}>
                <Text style={pageStyles.announcementTitle}>{item.title}</Text>
                <Text style={pageStyles.announcementText}>{item.content}</Text>
                <Text style={pageStyles.announcementDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
        </View>
    );

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <FlatList
            data={announcements}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.container}
            ListEmptyComponent={<Text>No announcements found.</Text>}
        />
    );
};

const pageStyles = StyleSheet.create({
    announcementCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    announcementImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 12,
    },
    announcementContent: {
        flex: 1,
    },
    announcementTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    announcementText: {
        fontSize: 16,
        marginBottom: 8,
    },
    announcementDate: {
        fontSize: 12,
        color: '#888',
    },
});

export default AnnouncementsScreen;
