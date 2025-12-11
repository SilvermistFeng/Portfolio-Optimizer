import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AssessmentScreen({ navigation }) {
    const [amount, setAmount] = useState('10000');
    const [horizon, setHorizon] = useState('5');
    const [risk, setRisk] = useState('medium');
    const [tickers, setTickers] = useState('AAPL, MSFT, GOOG, SPY, BND');

    const onContinue = () => {
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
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineMedium" style={styles.title}>Investment Assessment</Text>
                <Text style={styles.subtitle}>Help us tailor your portfolio.</Text>

                <View style={styles.section}>
                    <TextInput
                        label="Investment Amount ($)"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        mode="outlined"
                        style={styles.input}
                    />
                </View>

                <View style={styles.section}>
                    <TextInput
                        label="Time Horizon (Years)"
                        value={horizon}
                        onChangeText={setHorizon}
                        keyboardType="numeric"
                        mode="outlined"
                        style={styles.input}
                    />
                    <HelperText type="info">How long do you plan to hold?</HelperText>
                </View>

                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.label}>Risk Appetite</Text>
                    <SegmentedButtons
                        value={risk}
                        onValueChange={setRisk}
                        buttons={[
                            { value: 'low', label: 'Conservative' },
                            { value: 'medium', label: 'Balanced' },
                            { value: 'high', label: 'Aggressive' },
                        ]}
                    />
                </View>

                <View style={styles.section}>
                    <TextInput
                        label="Interested Tickers (comma separated)"
                        value={tickers}
                        onChangeText={setTickers}
                        mode="outlined"
                        style={styles.input}
                        multiline
                    />
                    <HelperText type="info">e.g., AAPL, TSLA, BTC-USD</HelperText>
                </View>

                <Button mode="contained" onPress={onContinue} style={styles.button} contentStyle={styles.btnContent}>
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
