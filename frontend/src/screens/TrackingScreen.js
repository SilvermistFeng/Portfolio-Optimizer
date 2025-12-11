import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, TextInput, Button, DataTable, Card, Portal, Modal, ActivityIndicator, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { analyzePortfolio } from '../services/api';

const screenWidth = Dimensions.get('window').width;

export default function TrackingScreen() {
    const [holdings, setHoldings] = useState([]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [visible, setVisible] = useState(false);
    const [ticker, setTicker] = useState('');
    const [shares, setShares] = useState('');
    const [cost, setCost] = useState('');

    const showModal = () => setVisible(true);
    const hideModal = () => { setVisible(false); clearInputs(); };
    const clearInputs = () => { setTicker(''); setShares(''); setCost(''); };

    const addHolding = () => {
        if (!ticker || !shares || !cost) return;
        const newHolding = {
            ticker: ticker.toUpperCase(),
            shares: parseFloat(shares),
            avg_cost: parseFloat(cost)
        };
        const updated = [...holdings, newHolding];
        setHoldings(updated);
        hideModal();
        refreshAnalysis(updated);
    };

    const removeHolding = (index) => {
        const updated = holdings.filter((_, i) => i !== index);
        setHoldings(updated);
        if (updated.length > 0) refreshAnalysis(updated);
        else setResult(null);
    };

    const refreshAnalysis = async (currentHoldings) => {
        setLoading(true);
        try {
            const data = await analyzePortfolio(currentHoldings);
            setResult(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Chart Data Preparation
    let chartData = {
        labels: [],
        datasets: [{ data: [] }]
    };

    if (result && result.chart_data && result.chart_data.length > 0) {
        // Take every 4th point to avoid crowding
        const points = result.chart_data;
        const labels = points.map(p => {
            const d = new Date(p.date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
        });
        const values = points.map(p => p.portfolio_value);

        // Simple optimization for label display
        const displayLabels = [];
        const displayValues = [];
        points.forEach((p, i) => {
            if (i % 4 === 0 || i === points.length - 1) {
                const d = new Date(p.date);
                displayLabels.push(`${d.getMonth() + 1}/${d.getDate()}`);
                displayValues.push(p.portfolio_value);
            }
        });

        chartData = {
            labels: displayLabels,
            datasets: [
                {
                    data: displayValues,
                    color: (opacity = 1) => `rgba(98, 0, 234, ${opacity})`, // Portfolio
                    strokeWidth: 2
                }
            ],
            legend: ["Portfolio Value"]
        };
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.headerRow}>
                    <Text variant="headlineMedium" style={styles.title}>Performance</Text>
                    <Button mode="contained-tonal" icon="plus" onPress={showModal}>Add Stock</Button>
                </View>

                {result && (
                    <View style={styles.summaryCard}>
                        <View>
                            <Text variant="labelMedium">Total Value</Text>
                            <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
                                ${result.total_value.toLocaleString()}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text variant="labelMedium">Total Gain/Loss</Text>
                            <Text variant="titleMedium" style={{ color: result.total_gain_loss >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                                {result.total_gain_loss >= 0 ? '+' : ''}{result.total_gain_loss.toLocaleString()} ({(result.total_gain_loss_pct * 100).toFixed(2)}%)
                            </Text>
                        </View>
                    </View>
                )}

                {result && chartData.labels.length > 0 && (
                    <View style={styles.chartContainer}>
                        <LineChart
                            data={chartData}
                            width={screenWidth - 40}
                            height={220}
                            chartConfig={{
                                backgroundColor: "#ffffff",
                                backgroundGradientFrom: "#ffffff",
                                backgroundGradientTo: "#ffffff",
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                style: { borderRadius: 16 },
                                propsForDots: { r: "4", strokeWidth: "2", stroke: "#6200ea" }
                            }}
                            bezier
                            style={{ borderRadius: 16 }}
                        />
                    </View>
                )}

                {loading && <ActivityIndicator style={{ margin: 20 }} />}

                <Text variant="titleMedium" style={styles.sectionTitle}>Current Holdings</Text>
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title>Ticker</DataTable.Title>
                        <DataTable.Title numeric>Shares</DataTable.Title>
                        <DataTable.Title numeric>Avg Cost</DataTable.Title>
                        <DataTable.Title numeric>Value</DataTable.Title>
                        <DataTable.Title></DataTable.Title>
                    </DataTable.Header>

                    {holdings.map((h, i) => (
                        <DataTable.Row key={i}>
                            <DataTable.Cell>{h.ticker}</DataTable.Cell>
                            <DataTable.Cell numeric>{h.shares}</DataTable.Cell>
                            <DataTable.Cell numeric>${h.avg_cost}</DataTable.Cell>
                            <DataTable.Cell numeric>
                                {result ? `$${result.holdings[i]?.market_value?.toLocaleString()}` : '-'}
                            </DataTable.Cell>
                            <DataTable.Cell style={{ justifyContent: 'flex-end' }}>
                                <IconButton icon="delete" size={20} onPress={() => removeHolding(i)} />
                            </DataTable.Cell>
                        </DataTable.Row>
                    ))}
                    {holdings.length === 0 && <Text style={{ textAlign: 'center', padding: 20, opacity: 0.5 }}>No holdings added yet.</Text>}
                </DataTable>

            </ScrollView>

            <Portal>
                <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modal}>
                    <Text variant="titleLarge" style={{ marginBottom: 15 }}>Add Holding</Text>
                    <TextInput label="Ticker (e.g. AAPL)" value={ticker} onChangeText={setTicker} mode="outlined" style={styles.input} />
                    <TextInput label="Shares Owned" value={shares} onChangeText={setShares} keyboardType="numeric" mode="outlined" style={styles.input} />
                    <TextInput label="Avg Cost per Share ($)" value={cost} onChangeText={setCost} keyboardType="numeric" mode="outlined" style={styles.input} />
                    <Button mode="contained" onPress={addHolding} style={{ marginTop: 10 }}>Add to Portfolio</Button>
                </Modal>
            </Portal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f6f6',
    },
    content: {
        padding: 20,
        paddingBottom: 50,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontWeight: 'bold',
        color: '#6200ea',
    },
    summaryCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        elevation: 2,
    },
    chartContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 10,
        marginBottom: 20,
        elevation: 2,
        alignItems: 'center'
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modal: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 10,
    },
    input: {
        marginBottom: 10,
        backgroundColor: '#fff'
    }
});
