import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Switch, useTheme, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PreferencesContext } from '../context/PreferencesContext';

export default function SettingsScreen() {
    const { toggleTheme, isThemeDark } = useContext(PreferencesContext);
    const theme = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Settings</Text>
            </View>

            <List.Section>
                <List.Subheader>Appearance</List.Subheader>
                <List.Item
                    title="Dark Mode"
                    description="Switch between Light and Futuristic Dark mode"
                    left={() => <List.Icon icon="theme-light-dark" />}
                    right={() => <Switch value={isThemeDark} onValueChange={toggleTheme} />}
                />
            </List.Section>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
    }
});
