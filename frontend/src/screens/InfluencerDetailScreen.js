import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Text, ActivityIndicator, DataTable, Avatar, IconButton } from 'react-native-paper';
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

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text variant="titleLarge" style={{ color: '#6200ea', fontWeight: 'bold' }}>{influencer.reliability_score}</Text>
                        <Text variant="labelSmall">Trust Score</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text variant="titleLarge">{influencer.total_tips}</Text>
                        <Text variant="labelSmall">Tracked Tips</Text>
                    </View>
                </View>
            </View>

            <Text variant="titleMedium" style={styles.sectionTitle}>Track Record (Last Tips)</Text>

            <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Ticker</DataTable.Title>
                    <DataTable.Title>Action</DataTable.Title>
                    <DataTable.Title numeric>Return</DataTable.Title>
                    <DataTable.Title numeric>Source</DataTable.Title>
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
                        <DataTable.Cell numeric>
                            {tip.source_url && (
                                <IconButton
                                    icon="link"
                                    size={20}
                                    onPress={() => Linking.openURL(tip.source_url)}
                                />
                            )}
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
    statsContainer: {
        flexDirection: 'row',
        marginTop: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 15,
        width: '100%',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#e0e0e0',
    },
    sectionTitle: {
        marginBottom: 10,
        fontWeight: 'bold',
    }
});
