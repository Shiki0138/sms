import React, { useState, useEffect } from 'react';
import { Crown, Zap, Settings, AlertTriangle, TrendingUp } from 'lucide-react';

interface PremiumFeature {
  key: string;
  name: string;
  description: string;
  plan: 'standard' | 'premium_ai';
  rolloutPercentage: number;
  isEnabled: boolean;
  category: string;
  dependencies?: string[];
}

interface RolloutStats {
  totalTenants: number;
  enabledTenants: number;
  successRate: number;
  issueCount: number;
}

export const PremiumFeatureController: React.FC = () => {
  const [premiumFeatures, setPremiumFeatures] = useState<PremiumFeature[]>([]);
  const [rolloutStats, setRolloutStats] = useState<Record<string, RolloutStats>>({});
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<string>('');

  const fetchPremiumFeatures = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/features/admin/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const premiumOnly = data.featureFlags.filter((f: PremiumFeature) => 
          f.dependencies?.includes('standard_plan') || f.dependencies?.includes('premium_ai_plan')
        );
        setPremiumFeatures(premiumOnly);
      }
    } catch (error) {
      console.error('Failed to fetch premium features:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRolloutPercentage = async (featureKey: string, percentage: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/features/admin/rollout/${featureKey}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ percentage })
      });
      
      if (response.ok) {
        await fetchPremiumFeatures();
      }
    } catch (error) {
      console.error('Failed to update rollout percentage:', error);
    }
  };

  const setupProductionFlags = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/features/admin/setup-production', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        alert('本番環境フィーチャーフラグの初期設定が完了しました');
        await fetchPremiumFeatures();
      }
    } catch (error) {
      console.error('Failed to setup production flags:', error);
      alert('設定に失敗しました');
    }
  };

  const emergencyDisable = async (featureKey: string) => {
    if (!confirm(`機能 "${featureKey}" を緊急無効化しますか？`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/features/admin/emergency-disable/${featureKey}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        alert('機能を緊急無効化しました');
        await fetchPremiumFeatures();
      }
    } catch (error) {
      console.error('Failed to emergency disable feature:', error);
    }
  };

  useEffect(() => {
    fetchPremiumFeatures();
  }, []);

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'standard':
        return <Zap className="w-4 h-4 text-orange-500" />;
      case 'premium_ai':
        return <Crown className="w-4 h-4 text-purple-500" />;
      default:
        return <Settings className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRolloutStatusColor = (percentage: number) => {
    if (percentage === 0) return 'bg-gray-200';
    if (percentage < 25) return 'bg-yellow-200';
    if (percentage < 75) return 'bg-blue-200';
    return 'bg-green-200';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          プレミアム機能管理ダッシュボード
        </h1>
        <p className="text-gray-600">
          スタンダード・プレミアムプラン限定機能の段階的リリース管理
        </p>
      </div>

      {/* クイックアクション */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">クイックアクション</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={setupProductionFlags}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            本番環境初期設定実行
          </button>
        </div>
      </div>

      {/* 機能一覧 */}
      <div className="grid gap-6">
        {premiumFeatures.map((feature) => (
          <div key={feature.key} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                {getPlanIcon(feature.plan)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.name}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  feature.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {feature.isEnabled ? '有効' : '無効'}
                </span>
                
                <button
                  onClick={() => emergencyDisable(feature.key)}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="緊急無効化"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ロールアウト制御 */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  ロールアウト率: {feature.rolloutPercentage}%
                </span>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className={`h-2 rounded-full ${getRolloutStatusColor(feature.rolloutPercentage)}`}>
                    <div 
                      className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${feature.rolloutPercentage}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  {[0, 25, 50, 75, 100].map((percentage) => (
                    <button
                      key={percentage}
                      onClick={() => updateRolloutPercentage(feature.key, percentage)}
                      className={`px-2 py-1 text-xs rounded ${
                        feature.rolloutPercentage === percentage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {percentage}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 依存関係表示 */}
            {feature.dependencies && feature.dependencies.length > 0 && (
              <div className="text-xs text-gray-500">
                依存: {feature.dependencies.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      {premiumFeatures.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">プレミアム機能が見つかりません</p>
        </div>
      )}
    </div>
  );
};

export default PremiumFeatureController;