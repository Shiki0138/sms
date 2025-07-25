import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Check, 
  X, 
  AlertCircle,
  Loader2,
  Settings,
  Shield,
  DollarSign,
  Smartphone,
  Building,
  Save,
  CheckCircle,
  Trash2,
  Edit
} from 'lucide-react';
import { loadPaymentMethods, savePaymentMethod } from '../../lib/settings-manager';
import { useAuth } from '../../contexts/AuthContext';

interface PaymentMethod {
  id: string;
  tenantId?: string;
  name: string;
  type: 'cash' | 'credit_card' | 'debit_card' | 'qr_payment' | 'bank_transfer' | 'other';
  isActive: boolean;
  displayOrder?: number;
  settings?: any;
}

const PaymentMethodSettingsDB: React.FC = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    name: '',
    type: 'cash',
    isActive: true,
    settings: {}
  });

  // デフォルトの支払い方法
  const defaultPaymentMethods: Partial<PaymentMethod>[] = [
    { name: '現金', type: 'cash', isActive: true },
    { name: 'クレジットカード', type: 'credit_card', isActive: true },
    { name: 'デビットカード', type: 'debit_card', isActive: false },
    { name: 'PayPay', type: 'qr_payment', isActive: false },
    { name: 'LINE Pay', type: 'qr_payment', isActive: false },
    { name: '銀行振込', type: 'bank_transfer', isActive: false }
  ];

  useEffect(() => {
    loadMethods();
  }, [user]);

  const loadMethods = async () => {
    try {
      setLoading(true);
      const methods = await loadPaymentMethods(user);
      
      // 初回の場合はデフォルトを設定
      if (methods.length === 0) {
        console.log('初回設定: デフォルト支払い方法を保存します');
        for (let i = 0; i < defaultPaymentMethods.length; i++) {
          await savePaymentMethod(user, {
            ...defaultPaymentMethods[i],
            displayOrder: i
          });
        }
        // 再度読み込み
        const savedMethods = await loadPaymentMethods(user);
        setPaymentMethods(savedMethods);
      } else {
        setPaymentMethods(methods);
      }
    } catch (error) {
      console.error('支払い方法の読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'qr_payment':
        return <Smartphone className="w-5 h-5 text-purple-600" />;
      case 'bank_transfer':
        return <Building className="w-5 h-5 text-gray-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPaymentTypeName = (type: string) => {
    switch (type) {
      case 'cash': return '現金';
      case 'credit_card': return 'クレジットカード';
      case 'debit_card': return 'デビットカード';
      case 'qr_payment': return 'QR決済';
      case 'bank_transfer': return '銀行振込';
      case 'other': return 'その他';
      default: return type;
    }
  };

  const handleSaveMethod = async () => {
    try {
      setSaveStatus('saving');
      const methodData = {
        ...formData,
        displayOrder: editingMethod ? editingMethod.displayOrder : paymentMethods.length
      };
      
      const success = await savePaymentMethod(user, methodData);
      
      if (success) {
        await loadMethods();
        setSaveStatus('success');
        setShowAddMethod(false);
        setEditingMethod(null);
        resetForm();
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('支払い方法の保存に失敗しました:', error);
      setSaveStatus('error');
    }
  };

  const handleToggleActive = async (method: PaymentMethod) => {
    try {
      await savePaymentMethod(user, {
        ...method,
        isActive: !method.isActive
      });
      await loadMethods();
    } catch (error) {
      console.error('支払い方法の更新に失敗しました:', error);
    }
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      id: method.id,
      name: method.name,
      type: method.type,
      isActive: method.isActive,
      settings: method.settings || {}
    });
    setShowAddMethod(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'cash',
      isActive: true,
      settings: {}
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">決済方法設定</h3>
          <p className="text-sm text-gray-600">利用可能な決済方法を管理します</p>
        </div>
        <div className="flex items-center space-x-2">
          {saveStatus === 'success' && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">保存しました</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">エラーが発生しました</span>
            </div>
          )}
          <button
            onClick={() => {
              setEditingMethod(null);
              resetForm();
              setShowAddMethod(true);
            }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>決済方法を追加</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-blue-600 text-sm font-medium">登録済み決済方法</div>
          <div className="text-2xl font-bold text-blue-900">{paymentMethods.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-600 text-sm font-medium">有効な決済方法</div>
          <div className="text-2xl font-bold text-green-900">
            {paymentMethods.filter(m => m.isActive).length}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-purple-600 text-sm font-medium">キャッシュレス対応</div>
          <div className="text-2xl font-bold text-purple-900">
            {paymentMethods.filter(m => m.isActive && m.type !== 'cash').length}
          </div>
        </div>
      </div>

      {/* Payment Methods List */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6">
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  method.isActive ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {getPaymentTypeIcon(method.type)}
                  <div>
                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                    <p className="text-sm text-gray-500">{getPaymentTypeName(method.type)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={method.isActive}
                      onChange={() => handleToggleActive(method)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {method.isActive ? '有効' : '無効'}
                    </span>
                  </label>
                  <button
                    onClick={() => handleEditMethod(method)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Method Modal */}
      {showAddMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingMethod ? '決済方法を編集' : '決済方法を追加'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddMethod(false);
                    setEditingMethod(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleSaveMethod();
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    決済方法名 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: PayPay"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    決済タイプ *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      type: e.target.value as PaymentMethod['type']
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">現金</option>
                    <option value="credit_card">クレジットカード</option>
                    <option value="debit_card">デビットカード</option>
                    <option value="qr_payment">QR決済</option>
                    <option value="bank_transfer">銀行振込</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      この決済方法を有効にする
                    </span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMethod(false);
                      setEditingMethod(null);
                      resetForm();
                    }}
                    className="btn btn-secondary"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={saveStatus === 'saving'}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saveStatus === 'saving' ? '保存中...' : '保存'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">セキュリティについて</h4>
            <p className="mt-1 text-sm text-blue-700">
              決済情報は暗号化されて安全に保存されます。カード情報などの機密データは当システムには保存されません。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSettingsDB;