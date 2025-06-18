import React, { useState, useEffect } from 'react'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  PaymentElement,
  AddressElement
} from '@stripe/react-stripe-js'
import {
  CreditCard,
  DollarSign,
  Lock,
  AlertCircle,
  CheckCircle,
  Loader,
  Calendar,
  User,
  MapPin
} from 'lucide-react'
import { useAutoSave } from '../../hooks/useAutoSave'
import AutoSaveIndicator from '../Common/AutoSaveIndicator'

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '')

interface StripePaymentFormProps {
  amount: number
  currency?: string
  customerId: string
  reservationId?: string
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  metadata?: Record<string, string>
  splitPayment?: {
    enabled: boolean
    depositAmount?: number
    remainingAmount?: number
  }
}

interface PaymentFormData {
  customerInfo: {
    name: string
    email: string
    phone: string
  }
  billingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  saveCard: boolean
  receiptEmail: string
  paymentMethod: 'card' | 'konbini' | 'bank_transfer'
  splitPayment: boolean
  notes: string
}

const PaymentForm: React.FC<{
  amount: number
  customerId: string
  reservationId?: string
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  metadata?: Record<string, string>
  splitPayment?: {
    enabled: boolean
    depositAmount?: number
    remainingAmount?: number
  }
}> = ({ amount, customerId, reservationId, onSuccess, onError, metadata, splitPayment }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState<PaymentFormData>({
    customerInfo: {
      name: '',
      email: '',
      phone: ''
    },
    billingAddress: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'JP'
    },
    saveCard: false,
    receiptEmail: '',
    paymentMethod: 'card',
    splitPayment: splitPayment?.enabled || false,
    notes: ''
  })

  // 自動保存機能
  const {
    save: saveFormData,
    isAutoSaving,
    lastSaved,
    hasUnsavedChanges
  } = useAutoSave(formData, {
    onSave: async (data) => {
      // フォームデータの自動保存（個人情報は暗号化）
      const response = await fetch('/api/v1/payments/save-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          customerId,
          reservationId,
          formData: data,
          encrypted: true
        })
      })
      
      if (!response.ok) {
        throw new Error('フォームデータの保存に失敗しました')
      }
    },
    storageKey: `payment-form-${customerId}`,
    delay: 3000 // 3秒遅延
  })

  // PaymentIntent作成
  useEffect(() => {
    if (amount > 0) {
      createPaymentIntent()
    }
  }, [amount, customerId, formData.paymentMethod])

  const createPaymentIntent = async () => {
    try {
      const actualAmount = splitPayment?.enabled && formData.splitPayment
        ? splitPayment.depositAmount || amount
        : amount

      const response = await fetch('/api/v1/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: actualAmount,
          currency: 'jpy',
          customerId,
          reservationId,
          paymentMethod: formData.paymentMethod,
          metadata: {
            ...metadata,
            split_payment: formData.splitPayment.toString(),
            deposit_amount: splitPayment?.depositAmount?.toString(),
            remaining_amount: splitPayment?.remainingAmount?.toString()
          }
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || '決済の準備に失敗しました')
      }

      setClientSecret(data.clientSecret)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '決済の準備中にエラーが発生しました')
      onError(error instanceof Error ? error.message : '決済準備エラー')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      setErrorMessage('決済システムの初期化中です。しばらくお待ちください。')
      return
    }

    setIsProcessing(true)
    setPaymentStatus('processing')
    setErrorMessage(null)

    try {
      let result

      if (formData.paymentMethod === 'card') {
        // カード決済
        const confirmResult = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/payment/confirmation`,
            receipt_email: formData.receiptEmail || formData.customerInfo.email,
            payment_method_data: {
              billing_details: {
                name: formData.customerInfo.name,
                email: formData.customerInfo.email,
                phone: formData.customerInfo.phone,
                address: formData.billingAddress
              }
            }
          },
          redirect: 'if_required'
        })

        if (confirmResult.error) {
          throw new Error(getJapaneseErrorMessage(confirmResult.error.code, confirmResult.error.message))
        }

        result = confirmResult.paymentIntent ? { paymentIntent: confirmResult.paymentIntent } : { error: confirmResult.error }
      } else if (formData.paymentMethod === 'konbini') {
        // コンビニ決済
        const confirmResult = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/payment/confirmation`,
            payment_method_data: {
              billing_details: {
                name: formData.customerInfo.name,
                email: formData.customerInfo.email
              }
            }
          }
        })

        if (confirmResult.error) {
          throw new Error(getJapaneseErrorMessage(confirmResult.error.code, confirmResult.error.message))
        }

        result = confirmResult.paymentIntent ? { paymentIntent: confirmResult.paymentIntent } : { error: confirmResult.error }
      }

      if (result?.paymentIntent?.status === 'succeeded') {
        setPaymentStatus('success')
        onSuccess(result.paymentIntent)
        
        // 成功時は保存されたフォームデータを削除
        localStorage.removeItem(`payment-form-${customerId}`)
      } else if (result?.paymentIntent?.status === 'requires_action') {
        // 追加認証が必要（3D Secure等）
        setPaymentStatus('processing')
        setErrorMessage('追加認証が必要です。画面の指示に従ってください。')
      } else {
        throw new Error('決済処理が完了しませんでした。')
      }
    } catch (error) {
      setPaymentStatus('error')
      const errorMsg = error instanceof Error ? error.message : '決済処理中にエラーが発生しました'
      setErrorMessage(errorMsg)
      onError(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  const getJapaneseErrorMessage = (code?: string, message?: string): string => {
    const errorMessages: Record<string, string> = {
      'card_declined': 'カードが拒否されました。別のカードをお試しください。',
      'insufficient_funds': '残高不足です。',
      'incorrect_cvc': 'セキュリティコードが正しくありません。',
      'expired_card': 'カードの有効期限が切れています。',
      'processing_error': '決済処理中にエラーが発生しました。',
      'authentication_required': '本人認証が必要です。',
      'amount_too_large': '金額が上限を超えています。',
      'amount_too_small': '金額が最小額を下回っています。'
    }
    
    return errorMessages[code || ''] || message || '決済処理中にエラーが発生しました。'
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.')
      if (keys.length === 1) {
        return { ...prev, [field]: value }
      } else {
        return {
          ...prev,
          [keys[0]]: {
            ...(prev[keys[0] as keyof PaymentFormData] as any),
            [keys[1]]: value
          }
        }
      }
    })
  }

  const actualAmount = splitPayment?.enabled && formData.splitPayment
    ? splitPayment.depositAmount || amount
    : amount

  return (
    <div className="space-y-6">
      {/* 自動保存インジケーター */}
      <div className="flex justify-end">
        <AutoSaveIndicator
          isAutoSaving={isAutoSaving}
          lastSaved={lastSaved}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      </div>

      {/* 決済情報サマリー */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
            <div>
              <h3 className="font-semibold text-gray-900">
                お支払い金額
              </h3>
              {splitPayment?.enabled && (
                <p className="text-sm text-gray-600">
                  {formData.splitPayment ? '前払い金額' : '全額支払い'}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              ¥{actualAmount.toLocaleString()}
            </div>
            {splitPayment?.enabled && formData.splitPayment && (
              <div className="text-sm text-gray-500">
                残額: ¥{(splitPayment.remainingAmount || 0).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 顧客情報 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-gray-600" />
            お客様情報
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                お名前 *
              </label>
              <input
                type="text"
                required
                value={formData.customerInfo.name}
                onChange={(e) => updateFormData('customerInfo.name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="山田 太郎"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス *
              </label>
              <input
                type="email"
                required
                value={formData.customerInfo.email}
                onChange={(e) => updateFormData('customerInfo.email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                電話番号
              </label>
              <input
                type="tel"
                value={formData.customerInfo.phone}
                onChange={(e) => updateFormData('customerInfo.phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="090-1234-5678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                領収書送信先
              </label>
              <input
                type="email"
                value={formData.receiptEmail}
                onChange={(e) => updateFormData('receiptEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="空欄の場合は上記メールアドレスに送信"
              />
            </div>
          </div>
        </div>

        {/* 決済方法選択 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
            お支払い方法
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <button
              type="button"
              onClick={() => updateFormData('paymentMethod', 'card')}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                formData.paymentMethod === 'card'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">クレジットカード</div>
              <div className="text-xs text-gray-500">即座決済</div>
            </button>
            <button
              type="button"
              onClick={() => updateFormData('paymentMethod', 'konbini')}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                formData.paymentMethod === 'konbini'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <MapPin className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">コンビニ決済</div>
              <div className="text-xs text-gray-500">後日支払い</div>
            </button>
            <button
              type="button"
              onClick={() => updateFormData('paymentMethod', 'bank_transfer')}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                formData.paymentMethod === 'bank_transfer'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">銀行振込</div>
              <div className="text-xs text-gray-500">後日支払い</div>
            </button>
          </div>

          {/* 分割払いオプション */}
          {splitPayment?.enabled && (
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.splitPayment}
                  onChange={(e) => updateFormData('splitPayment', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  分割払い（前払い: ¥{(splitPayment.depositAmount || 0).toLocaleString()}、
                  残額: ¥{(splitPayment.remainingAmount || 0).toLocaleString()}）
                </span>
              </label>
            </div>
          )}
        </div>

        {/* 決済要素 */}
        {clientSecret && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-green-600" />
              決済情報
            </h3>
            
            {formData.paymentMethod === 'card' ? (
              <>
                <PaymentElement
                  options={{
                    layout: 'tabs',
                    defaultValues: {
                      billingDetails: {
                        name: formData.customerInfo.name,
                        email: formData.customerInfo.email,
                        phone: formData.customerInfo.phone
                      }
                    }
                  }}
                />
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.saveCard}
                      onChange={(e) => updateFormData('saveCard', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      次回以降のために決済情報を保存する
                    </span>
                  </label>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-600 mb-2">
                  {formData.paymentMethod === 'konbini' && '決済完了後、コンビニでお支払いいただけます。'}
                  {formData.paymentMethod === 'bank_transfer' && '決済完了後、振込先情報をお送りします。'}
                </div>
                <div className="text-sm text-gray-500">
                  お支払い期限: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP')}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 備考欄 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            備考・特記事項
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => updateFormData('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="ご要望やご質問がございましたらご記入ください"
          />
        </div>

        {/* エラー表示 */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
            <span className="text-red-700 text-sm">{errorMessage}</span>
          </div>
        )}

        {/* 決済ボタン */}
        <button
          type="submit"
          disabled={!stripe || !clientSecret || isProcessing}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${
            isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <Loader className="w-5 h-5 animate-spin mr-2" />
              決済処理中...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              {paymentStatus === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <Lock className="w-5 h-5 mr-2" />
              )}
              {paymentStatus === 'success' 
                ? '決済完了' 
                : `¥${actualAmount.toLocaleString()} を決済する`
              }
            </div>
          )}
        </button>

        {/* セキュリティ情報 */}
        <div className="text-center text-xs text-gray-500">
          <Lock className="w-4 h-4 inline mr-1" />
          お客様の決済情報はSSL暗号化により保護されています。
          <br />
          Stripe社の国際セキュリティ基準（PCI DSS）に準拠した安全な決済システムを使用しています。
        </div>
      </form>
    </div>
  )
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = (props) => {
  const options: StripeElementsOptions = {
    mode: 'payment',
    amount: props.amount,
    currency: props.currency || 'jpy',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '6px'
      }
    },
    paymentMethodCreation: 'manual',
    paymentMethodTypes: ['card', 'konbini', 'customer_balance']
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm {...props} />
    </Elements>
  )
}

export default StripePaymentForm