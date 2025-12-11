import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Card, Avatar, ProgressBar, ActivityIndicator, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getInfluencers } from '../services/api';

export default function HypeMeterScreen({ navigation }) {
    const [influencers, setInfluencers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getInfluencers();
            setInfluencers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineMedium" style={styles.title}>The Hype Meter</Text>
                <Text style={styles.subtitle}>Who can you trust?</Text>

                {influencers.map((inf) => (
                    <TouchableOpacity key={inf.id} onPress={() => navigation.navigate('InfluencerDetail', { id: inf.id })}>
                        <Card style={styles.card}>
                            <Card.Title
                                title={inf.name}
                                subtitle={inf.handle || inf.platform}
                                left={(props) => <Avatar.Image {...props} source={{ uri: inf.image_url }} />}
                                right={(props) => <View style={styles.scoreBadge}><Text style={styles.scoreText}>{inf.reliability_score}</Text></View>}
                            />
                            <Card.Content>
                                <View style={styles.statsRow}>
                                    <View>
                                        <Text variant="labelSmall">Success Rate</Text>
                                        <Text variant="bodyLarge" style={{ color: inf.success_rate >= 0.5 ? 'green' : 'red' }}>
                                            {(inf.success_rate * 100).toFixed(0)}%
                                        </Text>
                                    </View>
                                    <View>
                                        <Text variant="labelSmall">Avg Return</Text>
                                        <Text variant="bodyLarge" style={{ color: inf.average_return >= 0 ? 'green' : 'red' }}>
                                            {(inf.average_return * 100).toFixed(1)}%
                                        </Text>
                                    </View>
                                    <View>
                                        <Text variant="labelSmall">Tracked Tips</Text>
                                        <Text variant="bodyLarge">{inf.total_tips}</Text>
                                    </View>
                                </View>
                                <ProgressBar progress={inf.reliability_score / 100} color={inf.reliability_score > 70 ? 'green' : inf.reliability_score > 40 ? 'orange' : 'red'} style={styles.bar} />
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
    },
    title: {
        fontWeight: 'bold',
        color: '#6200ea',
    },
    subtitle: {
        marginBottom: 20,
        opacity: 0.7,
    },
    card: {
        marginBottom: 15,
        backgroundColor: '#fff',
        elevation: 2,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 10,
    },
    bar: {
        height: 6,
        borderRadius: 3,
        marginTop: 5,
    },
    scoreBadge: {
        marginRight: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    scoreText: {
        fontWeight: 'bold',
    }
});
