import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, ActivityIndicator, DataTable, Avatar } from 'react-native-paper';
import { getInfluencer } from '../services/api';

export default function InfluencerDetailScreen({ route }) {
    const { id } = route.params || {};
    const [influencer, setInfluencer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const data = await getInfluencer(id);
            setInfluencer(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <ActivityIndicator style={styles.center} />;
    if (!influencer) return <Text style={styles.center}>Influencer not found.</Text>;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Avatar.Image size={80} source={{ uri: influencer.image_url }} />
                <Text variant="headlineSmall" style={styles.name}>{influencer.name}</Text>
                <Text style={styles.handle}>{influencer.handle}</Text>
            </View>

            <View style={styles.scoreCard}>
                <Text variant="displaySmall" style={{ color: '#6200ea', fontWeight: 'bold' }}>{influencer.reliability_score}</Text>
                <Text>Reliability Score</Text>
            </View>

            <Text variant="titleMedium" style={styles.sectionTitle}>Track Record (Last Tips)</Text>

            <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Ticker</DataTable.Title>
                    <DataTable.Title>Action</DataTable.Title>
                    <DataTable.Title numeric>Return</DataTable.Title>
                </DataTable.Header>

                {influencer.tips.map((tip, index) => (
                    <DataTable.Row key={index}>
                        <DataTable.Cell>{tip.ticker}</DataTable.Cell>
                        <DataTable.Cell>
                            <Text style={{ color: tip.action === 'BUY' ? 'green' : 'red', fontWeight: 'bold' }}>
                                {tip.action}
                            </Text>
                        </DataTable.Cell>
                        <DataTable.Cell numeric>
                            <Text style={{ color: tip.return_pct >= 0 ? 'green' : 'red' }}>
                                {(tip.return_pct * 100).toFixed(1)}%
                            </Text>
                        </DataTable.Cell>
                    </DataTable.Row>
                ))}
            </DataTable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    name: {
        marginTop: 10,
        fontWeight: 'bold',
    },
    handle: {
        opacity: 0.6,
    },
    scoreCard: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        marginBottom: 20,
    },
    sectionTitle: {
        marginBottom: 10,
        fontWeight: 'bold',
    }
});
