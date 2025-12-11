import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, HelperText, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { validateTicker } from '../services/api';

export default function AssessmentScreen({ navigation }) {
    const [amount, setAmount] = useState('10000');
    const [horizon, setHorizon] = useState('5');
    const [risk, setRisk] = useState('medium');
    const [tickers, setTickers] = useState('AAPL, MSFT, GOOG, SPY, BND');
    const [validating, setValidating] = useState(false);
    const [tickerError, setTickerError] = useState('');
    const theme = useTheme();

    const validateList = async () => {
        setValidating(true);
        setTickerError('');
        const list = tickers.split(',').map(t => t.trim()).filter(t => t.length > 0);

        let invalid = [];
        for (const t of list) {
            try {
                const res = await validateTicker(t);
                if (!res.valid) invalid.push(t);
            } catch (e) {
                invalid.push(t);
            }
        }

        if (invalid.length > 0) {
            setTickerError(`Invalid tickers: ${invalid.join(', ')}`);
            setValidating(false);
            return false;
        }

        setValidating(false);
        return true;
    };

    const onContinue = async () => {
        const isValid = await validateList();
        if (!isValid) return;

        // Convert risk string to float (0.0 - 1.0)
        let riskScore = 0.5;
        if (risk === 'low') riskScore = 0.2;
        if (risk === 'high') riskScore = 0.8;

        const data = {
            investment_amount: parseFloat(amount),
            time_horizon_years: parseInt(horizon),
            risk_appetite: riskScore,
            tickers: tickers.split(',').map(t => t.trim()).filter(t => t.length > 0)
        };

        navigation.navigate('Results', { assessmentData: data });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>Investment Assessment</Text>
                <Text style={[styles.subtitle, { color: theme.colors.onSurface }]}>Help us tailor your portfolio.</Text>

                <View style={styles.section}>
                    <TextInput
                        label="Investment Amount ($)"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        mode="outlined"
                        style={{ backgroundColor: theme.colors.surface }}
                        textColor={theme.colors.onSurface}
                        outlineColor={theme.colors.outline}
                    />
                </View>

                <View style={styles.section}>
                    <TextInput
                        label="Time Horizon (Years)"
                        value={horizon}
                        onChangeText={setHorizon}
                        keyboardType="numeric"
                        mode="outlined"
                        style={{ backgroundColor: theme.colors.surface }}
                        textColor={theme.colors.onSurface}
                    />
                    <HelperText type="info" style={{ color: theme.colors.onSurfaceVariant }}>How long do you plan to hold?</HelperText>
                </View>

                <View style={styles.section}>
                    <Text variant="titleMedium" style={{ marginBottom: 10, color: theme.colors.onSurface }}>Risk Appetite</Text>
                    <SegmentedButtons
                        value={risk}
                        onValueChange={setRisk}
                        buttons={[
                            { value: 'low', label: 'Conservative' },
                            { value: 'medium', label: 'Balanced' },
                            { value: 'high', label: 'Aggressive' },
                        ]}
                        theme={theme}
                    />
                </View>

                <View style={styles.section}>
                    <TextInput
                        label="Interested Tickers (comma separated)"
                        value={tickers}
                        onChangeText={(t) => { setTickers(t); setTickerError(''); }}
                        onBlur={validateList}
                        mode="outlined"
                        style={{ backgroundColor: theme.colors.surface }}
                        textColor={theme.colors.onSurface}
                        multiline
                        error={!!tickerError}
                        right={validating ? <TextInput.Icon icon={() => <ActivityIndicator size={20} />} /> : null}
                    />
                    {tickerError ? (
                        <HelperText type="error" visible={!!tickerError}>
                            {tickerError}
                        </HelperText>
                    ) : (
                        <HelperText type="info" style={{ color: theme.colors.onSurfaceVariant }}>e.g., AAPL, TSLA, BTC-USD</HelperText>
                    )}
                </View>

                <Button mode="contained" onPress={onContinue} style={styles.button} contentStyle={styles.btnContent} loading={validating} disabled={validating || !!tickerError}>
                    Generate Portfolio
                </Button>
            </ScrollView>
        </SafeAreaView>
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
    title: {
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#6200ea',
    },
    subtitle: {
        marginBottom: 25,
        opacity: 0.7,
    },
    section: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#fff',
    },
    label: {
        marginBottom: 10,
    },
    button: {
        marginTop: 10,
        borderRadius: 8,
    },
    btnContent: {
        paddingVertical: 8,
    }
});
