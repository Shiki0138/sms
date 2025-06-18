import React, { useState, useEffect } from 'react';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  category: 'core' | 'enhancement' | 'experimental' | 'beta';
  isEnabled: boolean;
  rolloutPercentage: number;
  enabledTenants: string[];
  enabledPlans: string[];
  config?: any;
  dependencies?: string[];
  releaseDate?: string;
  deprecationDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface TenantInfo {
  id: string;
  name: string;
  plan: string;
  isActive: boolean;
}

const CATEGORY_COLORS = {
  core: '#4caf50',
  enhancement: '#2196f3', 
  experimental: '#ff9800',
  beta: '#9c27b0'
};

const CATEGORY_LABELS = {
  core: 'コア機能',
  enhancement: '機能拡張',
  experimental: '実験的',
  beta: 'ベータ版'
};

const PLAN_COLORS = {
  light: '#90caf9',
  standard: '#ff9800',
  premium_ai: '#9c27b0'
};

const PLAN_LABELS = {
  light: 'ライトプラン',
  standard: 'スタンダードプラン',
  premium_ai: 'AIプレミアムプラン'
};

export const FeatureManagementDashboard: React.FC = () => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<FeatureFlag | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadFeatureFlags();
    loadTenants();
  }, []);

  const loadFeatureFlags = async () => {
    try {
      const response = await fetch('/api/v1/features/admin/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFeatureFlags(data.featureFlags);
      } else {
        setError('フィーチャーフラグの読み込みに失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const loadTenants = async () => {
    try {
      const response = await fetch('/api/v1/tenants', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants || []);
      }
    } catch (err) {
      console.error('Failed to load tenants:', err);
    }
  };

  const updateFeatureFlag = async (featureId: string, updates: Partial<FeatureFlag>) => {
    try {
      const response = await fetch(`/api/v1/features/admin/${featureId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        loadFeatureFlags();
        setSuccess('機能設定を更新しました');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('更新に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    }
  };

  const toggleFeature = async (feature: FeatureFlag) => {
    await updateFeatureFlag(feature.id, { isEnabled: !feature.isEnabled });
  };

  const updateRolloutPercentage = async (feature: FeatureFlag, percentage: number) => {
    await updateFeatureFlag(feature.id, { rolloutPercentage: percentage });
  };

  const setupInitialFeatures = async () => {
    try {
      const response = await fetch('/api/v1/features/admin/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        loadFeatureFlags();
        setSuccess('初期フィーチャーフラグをセットアップしました');
      }
    } catch (err) {
      setError('セットアップに失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">機能管理ダッシュボード</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <span className="block sm:inline">{error}</span>
            <button 
              className="float-right" 
              onClick={() => setError('')}
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <span className="block sm:inline">{success}</span>
            <button 
              className="float-right" 
              onClick={() => setSuccess('')}
            >
              ×
            </button>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={setupInitialFeatures}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            初期機能をセットアップ
          </button>

          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">全テナント</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name} ({tenant.plan})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureFlags.map((feature) => (
          <div key={feature.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {feature.name}
              </h3>
              <span 
                className="px-2 py-1 text-xs font-medium rounded-full text-white"
                style={{ backgroundColor: CATEGORY_COLORS[feature.category] }}
              >
                {CATEGORY_LABELS[feature.category]}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              {feature.description || 'No description'}
            </p>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={feature.isEnabled}
                  onChange={() => toggleFeature(feature)}
                  className="mr-2"
                />
                <span className="text-sm">
                  {feature.isEnabled ? "有効" : "無効"}
                </span>
              </label>
            </div>

            {feature.isEnabled && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ロールアウト率: {feature.rolloutPercentage}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={feature.rolloutPercentage}
                  onChange={(e) => updateRolloutPercentage(feature, parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${feature.rolloutPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex gap-2 mb-4">
              {feature.enabledPlans.length > 0 && (
                <span 
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                  title={`対象プラン: ${feature.enabledPlans.join(', ')}`}
                >
                  {feature.enabledPlans.length}プラン
                </span>
              )}
              {feature.enabledTenants.length > 0 && (
                <span 
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                  title={`対象テナント: ${feature.enabledTenants.length}件`}
                >
                  {feature.enabledTenants.length}店舗
                </span>
              )}
              {feature.releaseDate && (
                <span 
                  className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded"
                  title={`リリース予定: ${new Date(feature.releaseDate).toLocaleDateString()}`}
                >
                  予約済み
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedFeature(feature);
                  setEditDialogOpen(true);
                }}
                className="bg-gray-500 hover:bg-gray-700 text-white text-xs font-bold py-1 px-3 rounded"
              >
                設定
              </button>
              <button
                onClick={() => console.log('Feature details:', feature)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs font-bold py-1 px-3 rounded"
              >
                詳細
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 編集ダイアログ */}
      {editDialogOpen && selectedFeature && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                機能設定: {selectedFeature.name}
              </h3>
              
              <div className="mt-2 px-7 py-3">
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFeature.isEnabled}
                      onChange={(e) => 
                        setSelectedFeature({
                          ...selectedFeature,
                          isEnabled: e.target.checked
                        })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm">機能を有効にする</span>
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ロールアウト率: {selectedFeature.rolloutPercentage}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={selectedFeature.rolloutPercentage}
                    onChange={(e) =>
                      setSelectedFeature({
                        ...selectedFeature,
                        rolloutPercentage: parseInt(e.target.value)
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    リリース予定日
                  </label>
                  <input
                    type="date"
                    value={selectedFeature.releaseDate?.split('T')[0] || ''}
                    onChange={(e) =>
                      setSelectedFeature({
                        ...selectedFeature,
                        releaseDate: e.target.value
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setEditDialogOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 mr-2"
                >
                  キャンセル
                </button>
                <button
                  onClick={async () => {
                    if (selectedFeature) {
                      await updateFeatureFlag(selectedFeature.id, selectedFeature);
                      setEditDialogOpen(false);
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-24"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};