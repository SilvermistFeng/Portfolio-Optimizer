import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const commonColors = {
    profit: '#00e676', // Neon Green
    loss: '#ff1744',   // Neon Red
    brand: '#6200ea',
};

export const LightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#6200ea',
        secondary: '#03dac6',
        background: '#f5f5f7',
        surface: '#ffffff',
        surfaceVariant: '#eeeeee',
        onSurface: '#000000',
        elevation: {
            level1: '#ffffff',
            level2: '#f7f9fc',
        },
        ...commonColors,
    },
};

export const DarkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#bb86fc', // Lighter purple for dark mode
        secondary: '#03dac6',
        background: '#121212',
        surface: '#1e1e1e', // Dark Grey cards
        surfaceVariant: '#2c2c2c',
        onSurface: '#ffffff',
        elevation: {
            level1: '#1e1e1e',
            level2: '#252525',
        },
        ...commonColors,
    },
    roundness: 16, // More futuristic rounded corners
};
