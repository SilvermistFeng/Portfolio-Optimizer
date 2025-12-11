import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, TextInput, Button, DataTable, Card, Portal, Modal, ActivityIndicator, IconButton, useTheme, Chip, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { analyzePortfolio, rebalancePortfolio, validateTicker } from '../services/api';

const screenWidth = Dimensions.get('window').width;

const STRATEGIES = {
    "Balanced": { "SPY": 0.5, "BND": 0.3, "GLD": 0.2 },
    "Growth": { "SPY": 0.4, "QQQ": 0.4, "BTC-USD": 0.2 },
    "Conservative": { "SPY": 0.3, "BND": 0.5, "GLD": 0.2 }
};

export default function TrackingScreen() {
    const [holdings, setHoldings] = useState([]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [rebalanceLoading, setRebalanceLoading] = useState(false);
    const theme = useTheme();

    // Add Holding Modal State
    const [visible, setVisible] = useState(false);
    const [ticker, setTicker] = useState('');
    const [shares, setShares] = useState('');
    const [cost, setCost] = useState('');

    // Validation State
    const [isValidating, setIsValidating] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [validationMsg, setValidationMsg] = useState('');

    // Rebalance Modal State
    const [rebalanceVisible, setRebalanceVisible] = useState(false);
    const [selectedStrategy, setSelectedStrategy] = useState("Balanced");
    const [rebalanceOrders, setRebalanceOrders] = useState(null);

    const showModal = () => setVisible(true);
    const hideModal = () => {
        setVisible(false);
        clearInputs();
    };
    const clearInputs = () => {
        setTicker('');
        setShares('');
        setCost('');
        setIsValid(false);
        setValidationMsg('');
    };

    const showRebalanceModal = () => { setRebalanceVisible(true); setRebalanceOrders(null); };
    const hideRebalanceModal = () => { setRebalanceVisible(false); };

    // Debounced Validation Logic
    useEffect(() => {
        const checkTicker = async () => {
            if (!ticker || ticker.length < 2) {
                setIsValid(false);
                setValidationMsg('');
                return;
            }

            setIsValidating(true);
            setIsValid(false);
            setValidationMsg('Checking...');

            try {
                const res = await validateTicker(ticker);
                if (res.valid) {
                    setIsValid(true);
                    setValidationMsg('Valid');
                } else {
                    setIsValid(false);
                    setValidationMsg('Invalid Ticker');
                }
            } catch (e) {
                setIsValid(false);
                setValidationMsg('Error');
            } finally {
                setIsValidating(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (ticker) checkTicker();
        }, 800); // 800ms debounce

        return () => clearTimeout(timeoutId);
    }, [ticker]);


    const addHolding = () => {
        if (!ticker || !shares || !cost || !isValid) return;
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

    const handleRebalance = async () => {
        setRebalanceLoading(true);
        try {
            const target = STRATEGIES[selectedStrategy];
            const data = await rebalancePortfolio(holdings, target, 0);
            setRebalanceOrders(data.orders);
        } catch (e) {
            console.error(e);
            alert("Rebalance failed");
        } finally {
            setRebalanceLoading(false);
        }
    };

    // Chart Data Preparation (Truncated for brevity, kept essential logic)
    let chartData = {
        labels: [],
        datasets: [{ data: [] }]
    };

    if (result && result.chart_data && result.chart_data.length > 0) {
        const points = result.chart_data;
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
            datasets: [{ data: displayValues, color: () => theme.colors.primary, strokeWidth: 2 }],
            legend: ["Portfolio Value"]
        };
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.headerRow}>
                    <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>Performance</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Button mode="outlined" onPress={showRebalanceModal} style={{ marginRight: 8 }}>Rebalance</Button>
                        <Button mode="contained-tonal" icon="plus" onPress={showModal}>Add</Button>
                    </View>
                </View>

                {result && (
                    <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
                        <View>
                            <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>Total Value</Text>
                            <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                                ${result.total_value.toLocaleString()}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>Total Gain/Loss</Text>
                            <Text variant="titleMedium" style={{ color: result.total_gain_loss >= 0 ? theme.colors.profit : theme.colors.loss, fontWeight: 'bold' }}>
                                {result.total_gain_loss >= 0 ? '+' : ''}{result.total_gain_loss.toLocaleString()} ({(result.total_gain_loss_pct * 100).toFixed(2)}%)
                            </Text>
                        </View>
                    </View>
                )}

                {result && chartData.labels.length > 0 && (
                    <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
                        <LineChart
                            data={chartData}
                            width={screenWidth - 40}
                            height={220}
                            chartConfig={{
                                backgroundColor: theme.colors.surface,
                                backgroundGradientFrom: theme.colors.surface,
                                backgroundGradientTo: theme.colors.surface,
                                decimalPlaces: 0,
                                color: (opacity = 1) => theme.colors.onSurface,
                                labelColor: (opacity = 1) => theme.colors.onSurface,
                                style: { borderRadius: 16 },
                                propsForDots: { r: "4", strokeWidth: "2", stroke: theme.colors.primary }
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
                            <DataTable.Cell numeric>{result ? `$${result.holdings[i]?.market_value?.toLocaleString()}` : '-'}</DataTable.Cell>
                            <DataTable.Cell style={{ justifyContent: 'flex-end' }}>
                                <IconButton icon="delete" size={20} onPress={() => removeHolding(i)} />
                            </DataTable.Cell>
                        </DataTable.Row>
                    ))}
                    {holdings.length === 0 && <Text style={{ textAlign: 'center', padding: 20, opacity: 0.5 }}>No holdings added yet.</Text>}
                </DataTable>
            </ScrollView>

            <Portal>
                {/* Add Holding Modal */}
                <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modal}>
                    <Text variant="titleLarge" style={{ marginBottom: 15 }}>Add Holding</Text>

                    <View>
                        <TextInput
                            label="Ticker (e.g. AAPL)"
                            value={ticker}
                            onChangeText={setTicker}
                            mode="outlined"
                            style={styles.input}
                            right={
                                isValidating ? <TextInput.Icon icon={() => <ActivityIndicator size={20} />} /> :
                                    isValid ? <TextInput.Icon icon="check-circle" color="green" /> :
                                        (ticker.length > 1 && !isValid) ? <TextInput.Icon icon="alert-circle" color="red" /> : null
                            }
                        />
                        {ticker.length > 1 && (
                            <Text style={{ color: isValid ? 'green' : 'red', fontSize: 12, marginBottom: 10, alignSelf: 'flex-end' }}>
                                {isValidating ? '' : validationMsg}
                            </Text>
                        )}
                    </View>

                    <TextInput label="Shares Owned" value={shares} onChangeText={setShares} keyboardType="numeric" mode="outlined" style={styles.input} />
                    <TextInput label="Avg Cost per Share ($)" value={cost} onChangeText={setCost} keyboardType="numeric" mode="outlined" style={styles.input} />
                    <Button
                        mode="contained"
                        onPress={addHolding}
                        style={{ marginTop: 10 }}
                        disabled={!isValid || !shares || !cost}
                    >
                        Add to Portfolio
                    </Button>
                </Modal>

                {/* Rebalance Modal */}
                <Modal visible={rebalanceVisible} onDismiss={hideRebalanceModal} contentContainerStyle={styles.modal}>
                    <Text variant="titleLarge" style={{ marginBottom: 15, fontWeight: 'bold' }}>Rebalance Portfolio</Text>

                    {!rebalanceOrders ? (
                        <>
                            <Text style={{ marginBottom: 10 }}>Select a target strategy:</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }}>
                                {Object.keys(STRATEGIES).map(strat => (
                                    <Chip
                                        key={strat}
                                        selected={selectedStrategy === strat}
                                        onPress={() => setSelectedStrategy(strat)}
                                        style={{ marginRight: 5, marginBottom: 5 }}
                                    >
                                        {strat}
                                    </Chip>
                                ))}
                            </View>
                            <Button mode="contained" onPress={handleRebalance} loading={rebalanceLoading}>
                                Generate Trades
                            </Button>
                        </>
                    ) : (
                        <>
                            <Text style={{ marginBottom: 10, color: 'green' }}>Recommended Trades:</Text>
                            <ScrollView style={{ maxHeight: 300 }}>
                                {rebalanceOrders.map((order, idx) => (
                                    <List.Item
                                        key={idx}
                                        title={`${order.action} ${order.ticker}`}
                                        description={`${order.shares} shares @ $${order.price}`}
                                        right={() => <Text style={{ alignSelf: 'center', fontWeight: 'bold' }}>${order.value}</Text>}
                                        left={props => <List.Icon {...props} icon={order.action === "BUY" ? "arrow-up-circle" : "arrow-down-circle"} color={order.action === "BUY" ? "green" : "red"} />}
                                    />
                                ))}
                                {rebalanceOrders.length === 0 && <Text>Portfolio is already balanced!</Text>}
                            </ScrollView>
                            <Button mode="outlined" onPress={hideRebalanceModal} style={{ marginTop: 10 }}>Close</Button>
                        </>
                    )}
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
