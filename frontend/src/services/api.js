import { Platform } from 'react-native';

// For Android Emulator use 10.0.2.2, for iOS/Web use localhost
const BASE_URL = 'https://portfolio-optimizer-s1yj.onrender.com';

export const optimizePortfolio = async (data) => {
    try {
        const response = await fetch(`${BASE_URL}/optimize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`API Error: ${text}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Optimization Request Failed:", error);
        throw error;
    }
};

export const getInfluencers = async () => {
    try {
        const response = await fetch(`${BASE_URL}/hypemeter/influencers`);
        if (!response.ok) throw new Error('Failed to fetch influencers');
        return await response.json();
    } catch (error) {
        console.error("Influencer Fetch Failed:", error);
        throw error;
    }
};

export const getInfluencer = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/hypemeter/influencers/${id}`);
        if (!response.ok) throw new Error('Failed to fetch influencer');
        return await response.json();
    } catch (error) {
        console.error("Influencer Detail Failed:", error);
        throw error;
    }
};

export const analyzePortfolio = async (holdings) => {
    try {
        const response = await fetch(`${BASE_URL}/tracking/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ holdings }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`API Error: ${text}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Portfolio Analysis Failed:", error);
        throw error;
    }
};
