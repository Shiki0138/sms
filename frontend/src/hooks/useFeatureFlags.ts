import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';

interface FeatureFlagsContextType {
  features: string[];
  isFeatureEnabled: (featureKey: string) => boolean;
  loading: boolean;
  refreshFeatures: () => Promise<void>;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

interface FeatureFlagsProviderProps {
  children: ReactNode;
}

export const FeatureFlagsProvider: React.FC<FeatureFlagsProviderProps> = ({ children }) => {
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshFeatures = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/v1/features/enabled', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFeatures(data.features || []);
      }
    } catch (error) {
      console.error('Failed to load feature flags:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFeatures();
  }, []);

  const isFeatureEnabled = (featureKey: string): boolean => {
    return features.includes(featureKey);
  };

  return React.createElement(
    FeatureFlagsContext.Provider,
    {
      value: {
        features,
        isFeatureEnabled,
        loading,
        refreshFeatures
      }
    },
    children
  );
};

export const useFeatureFlags = (): FeatureFlagsContextType => {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
};

// 個別の機能チェック用フック
export const useFeature = (featureKey: string): boolean => {
  const { isFeatureEnabled } = useFeatureFlags();
  return isFeatureEnabled(featureKey);
};

// 複数の機能を一度にチェック
export const useFeatures = (featureKeys: string[]): Record<string, boolean> => {
  const { isFeatureEnabled } = useFeatureFlags();
  return featureKeys.reduce((acc, key) => {
    acc[key] = isFeatureEnabled(key);
    return acc;
  }, {} as Record<string, boolean>);
};

// 機能が有効な場合のみコンポーネントを表示
interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  children, 
  fallback = null 
}) => {
  const isEnabled = useFeature(feature);
  return isEnabled ? React.createElement(React.Fragment, {}, children) : React.createElement(React.Fragment, {}, fallback);
};