import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, ActivityIndicator, Card, Button, DataTable, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';
import { optimizePortfolio } from '../services/api';

const screenWidth = Dimensions.get('window').width;

// Define a palette of colors for the chart
const CHART_COLORS = [
    '#6200ea', '#03dac6', '#bb86fc', '#3700b3', '#018786',
    '#cf6679', '#ff0266', '#ff9800', '#ffeb3b', '#8bc34a'
];

export default function ResultScreen({ route, navigation }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const theme = useTheme();

    // Get params or use defaults for testing if navigated directly via Tab
    const { assessmentData } = route.params || {};

    useEffect(() => {
        if (assessmentData) {
            fetchOptimization();
        }
    }, [assessmentData]);

    const fetchOptimization = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await optimizePortfolio(assessmentData);
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!assessmentData && !loading && !result) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.center}>
                    <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>No Assessment Data</Text>
                    <Text style={{ textAlign: 'center', marginTop: 10, marginBottom: 20, color: theme.colors.onSurface }}>Please go to the "Start" tab to complete your assessment first.</Text>
                    <Button mode="contained" onPress={() => navigation.navigate('Assessment')}>Go to Assessment</Button>
                </View>
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.center}>
                    <ActivityIndicator animating={true} size="large" />
                    <Text style={{ marginTop: 20, color: theme.colors.onSurface }}>Optimizing Portfolio...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.center}>
                    <Text variant="titleLarge" style={{ color: theme.colors.error }}>Error</Text>
                    <Text style={{ color: theme.colors.onSurface }}>{error}</Text>
                    <Button onPress={fetchOptimization} style={{ marginTop: 20 }}>Retry</Button>
                </View>
            </SafeAreaView>
        );
    }

    // Prepare Chart Data
    let chartData = [];
    if (result && result.weights) {
        chartData = Object.keys(result.weights).map((ticker, index) => ({
            name: ticker,
            population: result.weights[ticker] * 100, // percentage
            color: CHART_COLORS[index % CHART_COLORS.length],
            legendFontColor: theme.colors.onSurface,
            legendFontSize: 15
        })).filter(item => item.population > 0);
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>Your "Sweet Spot"</Text>

                {result && (
                    <>
                        <View style={styles.chartContainer}>
                            <PieChart
                                data={chartData}
                                width={screenWidth - 40}
                                height={220}
                                chartConfig={{
                                    backgroundColor: theme.colors.surface,
                                    backgroundGradientFrom: theme.colors.surface,
                                    backgroundGradientTo: theme.colors.surface,
                                    color: (opacity = 1) => theme.colors.primary,
                                }}
                                accessor={"population"}
                                backgroundColor={"transparent"}
                                paddingLeft={"15"}
                                absolute
                            />
                        </View>

                        <View style={styles.statsRow}>
                            <Card style={[styles.statCard, { backgroundColor: theme.dark ? theme.colors.surfaceVariant : '#e8f5e9' }]}>
                                <Card.Content>
                                    <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>Exp. Return</Text>
                                    <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{(result.expected_return * 100).toFixed(1)}%</Text>
                                </Card.Content>
                            </Card>
                            <Card style={[styles.statCard, { backgroundColor: theme.dark ? theme.colors.surfaceVariant : '#fff3e0' }]}>
                                <Card.Content>
                                    <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>Risk (Vol)</Text>
                                    <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{(result.volatility * 100).toFixed(1)}%</Text>
                                </Card.Content>
                            </Card>
                            <Card style={[styles.statCard, { backgroundColor: theme.dark ? theme.colors.surfaceVariant : '#e3f2fd' }]}>
                                <Card.Content>
                                    <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>Sharpe</Text>
                                    <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{result.sharpe_ratio}</Text>
                                </Card.Content>
                            </Card>
                        </View>

                        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Action Plan</Text>
                        <Card style={{ backgroundColor: theme.colors.surface }}>
                            <DataTable>
                                <DataTable.Header>
                                    <DataTable.Title textStyle={{ color: theme.colors.onSurface }}>Ticker</DataTable.Title>
                                    <DataTable.Title numeric textStyle={{ color: theme.colors.onSurface }}>Split</DataTable.Title>
                                    <DataTable.Title numeric textStyle={{ color: theme.colors.onSurface }}>Shares</DataTable.Title>
                                </DataTable.Header>

                                {Object.keys(result.allocation).map((ticker) => (
                                    result.allocation[ticker] > 0 &&
                                    <DataTable.Row key={ticker}>
                                        <DataTable.Cell textStyle={{ color: theme.colors.onSurface }}>{ticker}</DataTable.Cell>
                                        <DataTable.Cell numeric textStyle={{ color: theme.colors.onSurface }}>{(result.weights[ticker] * 100).toFixed(1)}%</DataTable.Cell>
                                        <DataTable.Cell numeric textStyle={{ color: theme.colors.onSurface }}>{result.allocation[ticker]}</DataTable.Cell>
                                    </DataTable.Row>
                                ))}
                            </DataTable>
                        </Card>

                        <View style={{ marginTop: 20 }}>
                            <Text style={{ color: theme.colors.onSurface }}>Leftover Cash: ${result.leftover_cash}</Text>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 20,
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        width: '30%',
    },
    sectionTitle: {
        marginTop: 10,
        marginBottom: 10,
        fontWeight: 'bold',
    }
});
