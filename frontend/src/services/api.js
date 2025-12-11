import { Platform } from 'react-native';

// UPDATE: Pointing to Production (Render) for Release
const BASE_URL = 'https://portfolio-optimizer-s1yj.onrender.com';
// const BASE_URL = 'http://192.168.1.11:8000'; // Local LAN IP

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

export const rebalancePortfolio = async (holdings, targetWeights, investmentAmount = 0) => {
    try {
        const response = await fetch(`${BASE_URL}/tracking/rebalance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ holdings, target_weights: targetWeights, investment_amount: investmentAmount }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`API Error: ${text}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Rebalancing Failed:", error);
        throw error;
    }
};
export const validateTicker = async (ticker) => {
    try {
        const response = await fetch(`${BASE_URL}/validate/${ticker}`);
        if (!response.ok) return { valid: false, error: "Network Error" };
        return await response.json();
    } catch (error) {
        console.error("Validation Failed:", error);
        return { valid: false, error: error.message };
    }
};
