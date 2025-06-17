import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Check, 
  X, 
  AlertCircle,
  Loader2,
  Settings,
  Shield
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  provider: string;
  type: 'card' | 'bank_transfer' | 'digital_wallet';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: Date;
}

interface PaymentProvider {
  id: string;
  name: string;
  available: boolean;
}

const PaymentMethodSettings: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [currentProvider, setCurrentProvider] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      
      const [methodsRes, settingsRes] = await Promise.all([
        fetch('/api/v1/payments/payment-methods'),
        fetch('/api/v1/payments/provider-settings')
      ]);

      if (methodsRes.ok) {
        const methods = await methodsRes.json();
        setPaymentMethods(methods);
      }

      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setCurrentProvider(settings.provider);
        setProviders(settings.availableProviders);
      }
    } catch (error) {
      console.error('Failed to load payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = async (newProvider: string) => {
    try {
      setIsUpdating(true);
      
      const response = await fetch('/api/v1/payments/provider-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ provider: newProvider })
      });

      if (response.ok) {
        setCurrentProvider(newProvider);
        // プロバイダー変更後は支払い方法を再読み込み
        await loadPaymentData();
      } else {
        throw new Error('Failed to update provider');
      }
    } catch (error) {
      console.error('Failed to update provider:', error);
      alert('決済プロバイダーの変更に失敗しました');
    } finally {
      setIsUpdating(false);
    }
  };

  const getCardBrandIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'jcb':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'stripe':
        return '💙';
      case 'square':
        return '🟫';
      case 'paypal':
        return '🌐';
      case 'payjp':
        return '🇯🇵';
      default:
        return '💳';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          決済設定
        </h2>
        <p className="text-gray-600">
          サブスクリプションの決済方法と決済プロバイダーを管理します
        </p>
      </div>

      {/* 決済プロバイダー設定 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            決済プロバイダー
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                currentProvider === provider.id
                  ? 'border-blue-500 bg-blue-50'
                  : provider.available
                  ? 'border-gray-200 hover:border-gray-300'
                  : 'border-gray-100 bg-gray-50'
              } ${!provider.available ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (provider.available && !isUpdating) {
                  handleProviderChange(provider.id);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getProviderIcon(provider.id)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {provider.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {provider.available ? '利用可能' : '設定が必要'}
                    </p>
                  </div>
                </div>
                {currentProvider === provider.id && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </div>
          ))}
        </div>

        {isUpdating && (
          <div className="mt-4 flex items-center space-x-2 text-sm text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>プロバイダーを変更中...</span>
          </div>
        )}
      </div>

      {/* 登録済み決済方法 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              登録済み決済方法
            </h3>
          </div>
          <button
            onClick={() => setShowAddMethod(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>追加</span>
          </button>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              登録済みの決済方法がありません
            </p>
            <button
              onClick={() => setShowAddMethod(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              最初の決済方法を追加
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCardBrandIcon(method.brand)}</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {method.brand?.toUpperCase()} •••• {method.last4}
                    </p>
                    <p className="text-sm text-gray-600">
                      有効期限: {method.expiryMonth}/{method.expiryYear}
                    </p>
                  </div>
                  {method.isDefault && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      デフォルト
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {getProviderIcon(method.provider)} {method.provider}
                  </span>
                  <button className="text-red-600 hover:text-red-700 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* セキュリティ情報 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              セキュリティについて
            </h4>
            <p className="text-sm text-blue-800">
              決済情報は業界標準のセキュリティで保護されています。
              カード情報は決済プロバイダーによって安全に管理され、
              当システムには保存されません。
            </p>
          </div>
        </div>
      </div>

      {/* 決済方法追加モーダル */}
      {showAddMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                決済方法を追加
              </h3>
              <button
                onClick={() => setShowAddMethod(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800">
                    <strong>デモ環境:</strong> 実際の決済方法の追加機能は本番環境でのみ利用可能です。
                    現在はデモデータが表示されています。
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAddMethod(false)}
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSettings;