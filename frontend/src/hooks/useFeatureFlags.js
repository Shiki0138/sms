import React, { useState, useEffect, useContext, createContext } from 'react';
const FeatureFlagsContext = createContext(undefined);
export const FeatureFlagsProvider = ({ children }) => {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const refreshFeatures = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token)
                return;
            const response = await fetch('/api/v1/features/enabled', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setFeatures(data.features || []);
            }
        }
        catch (error) {
            console.error('Failed to load feature flags:', error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        refreshFeatures();
    }, []);
    const isFeatureEnabled = (featureKey) => {
        return features.includes(featureKey);
    };
    return React.createElement(FeatureFlagsContext.Provider, {
        value: {
            features,
            isFeatureEnabled,
            loading,
            refreshFeatures
        }
    }, children);
};
export const useFeatureFlags = () => {
    const context = useContext(FeatureFlagsContext);
    if (!context) {
        throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
    }
    return context;
};
// 個別の機能チェック用フック
export const useFeature = (featureKey) => {
    const { isFeatureEnabled } = useFeatureFlags();
    return isFeatureEnabled(featureKey);
};
// 複数の機能を一度にチェック
export const useFeatures = (featureKeys) => {
    const { isFeatureEnabled } = useFeatureFlags();
    return featureKeys.reduce((acc, key) => {
        acc[key] = isFeatureEnabled(key);
        return acc;
    }, {});
};
export const FeatureGate = ({ feature, children, fallback = null }) => {
    const isEnabled = useFeature(feature);
    return isEnabled ? React.createElement(React.Fragment, {}, children) : React.createElement(React.Fragment, {}, fallback);
};
