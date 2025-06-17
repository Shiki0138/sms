import React, { useState } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { 
  CreditCard,
  Lock,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { SubscriptionPlan, PLAN_NAMES, PLAN_PRICING } from '../../types/subscription';

interface PaymentFormProps {
  selectedPlan: SubscriptionPlan;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  selectedPlan,
  onSuccess,
  onCancel
}) => {
  const { currentPlan, upgradePlan } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'demo' | 'stripe' | 'square'>('demo');

  // デモ用カード情報
  const [cardInfo, setCardInfo] = useState({
    number: '4242 4242 4242 4242',
    expiry: '12/25',
    cvc: '123',
    name: 'テスト ユーザー'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // デモ環境での処理
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (paymentMethod === 'demo') {
        // デモ用のプラン変更
        const success = await upgradePlan(selectedPlan);
        if (success) {
          onSuccess();
        } else {
          throw new Error('プランの変更に失敗しました');
        }
      } else {
        // 実際の決済処理（本番環境用）
        const response = await fetch('/api/v1/payments/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            planId: selectedPlan,
            paymentMethodId: 'demo-payment-method',
            metadata: {
              upgrade_from: currentPlan,
              payment_flow: 'upgrade'
            }
          })
        });

        const result = await response.json();
        
        if (result.success) {
          onSuccess();
        } else {
          throw new Error(result.error || '決済処理に失敗しました');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const monthlyDifference = PLAN_PRICING[selectedPlan].monthly - PLAN_PRICING[currentPlan].monthly;
  const setupFee = PLAN_PRICING[selectedPlan].setup;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 shadow-lg">
        {/* ヘッダー */}
        <div className="border-b border-gray-200 p-6">
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>戻る</span>
          </button>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            決済情報入力
          </h2>
          <p className="text-gray-600">
            {PLAN_NAMES[currentPlan]} → {PLAN_NAMES[selectedPlan]}
          </p>
        </div>

        {/* 料金詳細 */}
        <div className="p-6 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4">料金詳細</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">プラン差額（月額）</span>
              <span className="font-medium">¥{monthlyDifference.toLocaleString()}</span>
            </div>
            {setupFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">初期費用</span>
                <span className="font-medium">¥{setupFee.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
              <span>今月の請求額</span>
              <span>¥{(monthlyDifference + setupFee).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 決済方法選択 */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">決済方法</h3>
          
          <div className="grid grid-cols-1 gap-3 mb-4">
            <label className="flex items-center p-3 border-2 border-orange-500 bg-orange-50 rounded-lg cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="demo"
                checked={paymentMethod === 'demo'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-orange-900">デモ決済</div>
                <div className="text-sm text-orange-700">
                  実際の決済は発生しません（開発・テスト用）
                </div>
              </div>
            </label>

            <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer opacity-50">
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={paymentMethod === 'stripe'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                disabled
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">クレジットカード（Stripe）</div>
                <div className="text-sm text-gray-600">本番環境でのみ利用可能</div>
              </div>
            </label>

            <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer opacity-50">
              <input
                type="radio"
                name="paymentMethod"
                value="square"
                checked={paymentMethod === 'square'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                disabled
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Square決済</div>
                <div className="text-sm text-gray-600">本番環境でのみ利用可能</div>
              </div>
            </label>
          </div>
        </div>

        {/* カード情報入力（デモ用） */}
        {paymentMethod === 'demo' && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">
                カード情報（デモ）
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カード番号
                </label>
                <input
                  type="text"
                  value={cardInfo.number}
                  onChange={(e) => setCardInfo({...cardInfo, number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1234 5678 9012 3456"
                  readOnly
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    有効期限
                  </label>
                  <input
                    type="text"
                    value={cardInfo.expiry}
                    onChange={(e) => setCardInfo({...cardInfo, expiry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="MM/YY"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cardInfo.cvc}
                    onChange={(e) => setCardInfo({...cardInfo, cvc: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カード名義人
                </label>
                <input
                  type="text"
                  value={cardInfo.name}
                  onChange={(e) => setCardInfo({...cardInfo, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="TARO YAMADA"
                  readOnly
                />
              </div>
            </form>
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">エラーが発生しました</h4>
                <p className="text-sm text-red-800 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* セキュリティ情報 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <Lock className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">セキュアな決済</h4>
              <p className="text-sm text-green-800 mt-1">
                決済情報は256bit SSL暗号化により保護されています。
                カード情報は当システムには保存されません。
              </p>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="p-6">
          <div className="flex space-x-4">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isProcessing}
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>処理中...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>
                    ¥{(monthlyDifference + setupFee).toLocaleString()} で決済確定
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;