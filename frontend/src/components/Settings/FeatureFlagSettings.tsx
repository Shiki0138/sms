import React, { useState, useEffect } from 'react';
// UIコンポーネントの代替実装
const Card = ({ children, className = '' }: any) => <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>;
const CardHeader = ({ children }: any) => <div className="p-4 border-b">{children}</div>;
const CardTitle = ({ children, className = '' }: any) => <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
const CardContent = ({ children, className = '' }: any) => <div className={`p-4 ${className}`}>{children}</div>;
const Button = ({ children, onClick, disabled, className = '' }: any) => <button onClick={onClick} disabled={disabled} className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 ${className}`}>{children}</button>;
const Badge = ({ children, className = '', variant }: any) => <span className={`inline-block px-2 py-1 text-xs rounded ${className}`}>{children}</span>;
const Alert = ({ children, className = '' }: any) => <div className={`p-4 rounded border ${className}`}>{children}</div>;
const AlertDescription = ({ children, className = '' }: any) => <p className={className}>{children}</p>;
const Switch = ({ checked, disabled, onCheckedChange, className = '' }: any) => <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onCheckedChange(e.target.checked)} className={className} />;
import { Settings, ToggleLeft, ToggleRight, AlertTriangle, CheckCircle } from 'lucide-react';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  category: string;
  isEnabled: boolean;
  isEnabledForTenant: boolean;
  rolloutPercentage: number;
  enabledPlans?: string[];
  config?: any;
  tenantConfig?: any;
}

const FeatureFlagSettings: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // フィーチャーフラグ一覧を取得
  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    try {
      const response = await fetch('/api/v1/features/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFlags(data.flags || []);
      } else {
        throw new Error('フィーチャーフラグの取得に失敗しました');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '不明なエラー' });
    } finally {
      setLoading(false);
    }
  };

  // フィーチャーフラグの有効/無効切り替え
  const toggleFeature = async (flagKey: string, enabled: boolean) => {
    try {
      const endpoint = enabled ? `/api/v1/features/admin/tenant/${getCurrentTenantId()}/enable` : `/api/v1/features/admin/tenant/${getCurrentTenantId()}/disable`;
      const response = await fetch(endpoint.replace('/enable', '').replace('/disable', '') + `/${flagKey}/${enabled ? 'enable' : 'disable'}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `${enabled ? '有効化' : '無効化'}しました` });
        await fetchFlags(); // 再読み込み
      } else {
        throw new Error('設定の更新に失敗しました');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '不明なエラー' });
    }
  };

  const getCurrentTenantId = () => {
    // 実際の実装では認証情報からテナントIDを取得
    return localStorage.getItem('tenantId') || 'default';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'bg-blue-100 text-blue-800';
      case 'enhancement': return 'bg-green-100 text-green-800';
      case 'experimental': return 'bg-yellow-100 text-yellow-800';
      case 'beta': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'core': return 'システムの基本機能';
      case 'enhancement': return '機能拡張・改善';
      case 'experimental': return '実験的機能（注意が必要）';
      case 'beta': return 'ベータ版機能';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">設定を読み込んでいます...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">機能設定</h1>
      </div>

      {message && (
        <Alert className={message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
          {message.type === 'error' ? (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {Object.entries(
          flags.reduce((acc, flag) => {
            if (!acc[flag.category]) acc[flag.category] = [];
            acc[flag.category].push(flag);
            return acc;
          }, {} as Record<string, FeatureFlag[]>)
        ).map(([category, categoryFlags]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Badge className={getCategoryColor(category)}>
                  {category.toUpperCase()}
                </Badge>
                <span>{getCategoryDescription(category)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryFlags.map((flag) => (
                  <div key={flag.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{flag.name}</h3>
                        {!flag.isEnabled && (
                          <Badge className="bg-gray-100 text-gray-500">
                            グローバル無効
                          </Badge>
                        )}
                        {flag.rolloutPercentage < 100 && flag.isEnabled && (
                          <Badge className="bg-orange-100 text-orange-600">
                            段階リリース {flag.rolloutPercentage}%
                          </Badge>
                        )}
                      </div>
                      {flag.description && (
                        <p className="text-gray-600 mb-2">{flag.description}</p>
                      )}
                      <p className="text-sm text-gray-500">キー: {flag.key}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {flag.isEnabledForTenant ? '有効' : '無効'}
                        </div>
                        {flag.isEnabled ? (
                          <div className="text-xs text-green-600">利用可能</div>
                        ) : (
                          <div className="text-xs text-red-600">グローバル無効</div>
                        )}
                      </div>
                      <Switch
                        checked={flag.isEnabledForTenant}
                        disabled={!flag.isEnabled} // グローバルに無効な場合は操作不可
                        onCheckedChange={(checked: boolean) => toggleFeature(flag.key, checked)}
                        className=""
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">機能設定について</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ul className="space-y-2 text-sm">
            <li>• <strong>応援美容師サービス</strong>: 美容師同士が助け合えるマッチングサービス</li>
            <li>• <strong>給料見える化システム</strong>: 給与の透明性とモチベーション向上</li>
            <li>• <strong>インセンティブシステム</strong>: パフォーマンスベースの報酬制度</li>
            <li>• 機能を有効化すると、対応するメニューと機能が利用可能になります</li>
            <li>• 実験的機能は予期しない動作をする可能性があります</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureFlagSettings;