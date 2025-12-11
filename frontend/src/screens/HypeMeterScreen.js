import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text, Card, Avatar, Chip, useTheme, IconButton, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getInfluencers } from '../services/api';

const CATEGORIES = ["Top Rated", "Crypto", "Stocks", "Short Sellers"];

export default function HypeMeterScreen({ navigation }) {
    const [influencers, setInfluencers] = useState([]);
    const [filteredInfluencers, setFilteredInfluencers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Top Rated');
    const theme = useTheme();

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterData();
    }, [searchQuery, selectedCategory, influencers]);

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

    const filterData = () => {
        let result = influencers;

        // Search Filter
        if (searchQuery) {
            result = result.filter(inf =>
                inf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inf.handle.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category Filter
        if (selectedCategory !== 'Top Rated') {
            if (selectedCategory === "Short Sellers") {
                result = result.filter(inf => inf.category === "Shorts");
            } else {
                result = result.filter(inf => inf.category === selectedCategory);
            }
        } else {
            // Top Rated implies sorting, which is already done by backend rank, 
            // but we ensure we show all categories for "Top Rated" view
        }

        setFilteredInfluencers(result);
    };

    const getRiskColor = (risk) => {
        switch (risk) {
            case 'Low': return theme.colors.primary; // Blue/Purple
            case 'Medium': return '#FFC107'; // Amber
            case 'High': return '#FF9800'; // Orange
            case 'Extreme': return '#F44336'; // Red
            default: return theme.colors.onSurface;
        }
    };

    const getRankBadgeColor = (rank) => {
        if (rank === 1) return '#FFD700'; // Gold
        if (rank === 2) return '#C0C0C0'; // Silver
        if (rank === 3) return '#CD7F32'; // Bronze
        return theme.colors.surfaceVariant;
    };

    if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator /></SafeAreaView>;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.headerContainer}>
                <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>Analyst Intel</Text>

                <View style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <IconButton icon="magnify" size={20} iconColor={theme.colors.onSurfaceVariant} />
                    <TextInput
                        placeholder="Find an influencer..."
                        placeholderTextColor={theme.colors.onSurfaceVariant}
                        style={[styles.searchInput, { color: theme.colors.onSurface }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            style={[
                                styles.filterChip,
                                { backgroundColor: selectedCategory === cat ? theme.colors.primary : theme.colors.surfaceVariant }
                            ]}
                        >
                            <Text style={{ color: selectedCategory === cat ? '#fff' : theme.colors.onSurfaceVariant, fontWeight: 'bold' }}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {filteredInfluencers.map((inf) => (
                    <TouchableOpacity key={inf.id} onPress={() => navigation.navigate('InfluencerDetail', { id: inf.id })}>
                        <Card style={[styles.card, { backgroundColor: '#1e1e1e' }]}>
                            <Card.Content>
                                {/* Header Row: Avatar, Rank, Name, Score */}
                                <View style={styles.cardHeader}>
                                    <View style={styles.avatarContainer}>
                                        <Avatar.Image size={48} source={{ uri: inf.image_url }} />
                                        {inf.rank <= 3 && (
                                            <View style={[styles.rankBadge, { backgroundColor: getRankBadgeColor(inf.rank) }]}>
                                                <Text style={styles.rankText}>#{inf.rank}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.nameContainer}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text variant="titleMedium" style={{ color: '#fff', fontWeight: 'bold' }}>{inf.name}</Text>
                                            <IconButton icon="check-decagram" iconColor={theme.colors.primary} size={16} style={{ margin: 0 }} />
                                        </View>
                                        <Text variant="bodySmall" style={{ color: '#aaa' }}>{inf.handle}</Text>
                                    </View>
                                    <View style={styles.scoreContainer}>
                                        <Text variant="displaySmall" style={{ color: inf.reliability_score > 70 ? theme.colors.profit : inf.reliability_score > 40 ? '#FFC107' : theme.colors.loss, fontWeight: 'bold' }}>
                                            {inf.reliability_score}
                                        </Text>
                                        <Text variant="labelSmall" style={{ color: '#aaa' }}>TRUST SCORE</Text>
                                    </View>
                                </View>

                                {/* Divider */}
                                <View style={[styles.divider, { backgroundColor: '#333' }]} />

                                {/* Stats Row */}
                                <View style={styles.statsRow}>
                                    <View style={styles.statBox}>
                                        <Text style={styles.statLabel}>Win Rate</Text>
                                        <Text style={styles.statValue}>{(inf.success_rate * 100).toFixed(0)}%</Text>
                                    </View>
                                    <View style={[styles.statDivider, { backgroundColor: '#333' }]} />
                                    <View style={styles.statBox}>
                                        <Text style={styles.statLabel}>Avg Return</Text>
                                        <Text style={[styles.statValue, { color: inf.average_return >= 0 ? theme.colors.profit : theme.colors.loss }]}>
                                            {(inf.average_return * 100).toFixed(1)}%
                                        </Text>
                                    </View>
                                    <View style={[styles.statDivider, { backgroundColor: '#333' }]} />
                                    <View style={styles.statBox}>
                                        <Text style={styles.statLabel}>Risk</Text>
                                        <View style={[styles.riskBadge, { backgroundColor: getRiskColor(inf.risk_level) + '44', borderColor: getRiskColor(inf.risk_level) }]}>
                                            <Text style={{ color: getRiskColor(inf.risk_level), fontSize: 12, fontWeight: 'bold' }}>{inf.risk_level}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Tags Row */}
                                <View style={styles.tagsRow}>
                                    {inf.tags && inf.tags.map((tag, idx) => (
                                        <View key={idx} style={[styles.tag, { backgroundColor: '#333' }]}>
                                            <Text style={{ color: '#ccc', fontSize: 10 }}>{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                ))}

                {filteredInfluencers.length === 0 && (
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>No results found.</Text>
                        <Chip icon="plus" style={{ marginTop: 20 }} onPress={() => alert('Search feature coming soon!')}>Add "{searchQuery}"</Chip>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        padding: 20,
        paddingBottom: 10,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 15,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        marginBottom: 15,
        height: 45,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        marginRight: 10,
    },
    filterScroll: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    content: {
        padding: 20,
        paddingTop: 0,
    },
    card: {
        marginBottom: 16,
        borderRadius: 16,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
    },
    rankBadge: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1e1e1e',
    },
    rankText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000',
    },
    nameContainer: {
        flex: 1,
        marginLeft: 15,
    },
    scoreContainer: {
        alignItems: 'flex-end',
    },
    divider: {
        height: 1,
        marginVertical: 15,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        color: '#888',
        fontSize: 11,
        marginBottom: 4,
    },
    statValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    statDivider: {
        width: 1,
        height: 30,
    },
    riskBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
    },
    tagsRow: {
        flexDirection: 'row',
        marginTop: 15,
        flexWrap: 'wrap',
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 8,
        marginBottom: 4,
    },
});
