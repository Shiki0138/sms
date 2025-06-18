import React, { useState, useEffect } from 'react'
import {
  CheckCircle,
  CreditCard,
  Calendar,
  MapPin,
  Download,
  Mail,
  Copy,
  ExternalLink,
  Clock,
  AlertCircle,
  Printer,
  Share2
} from 'lucide-react'

interface PaymentConfirmationProps {
  paymentIntentId: string
  customerId: string
  reservationId?: string
  onContinue?: () => void
  onPrintReceipt?: () => void
}

interface PaymentDetails {
  id: string
  amount: number
  currency: string
  status: string
  paymentMethod: {
    type: 'card' | 'konbini' | 'bank_transfer'
    details: any
  }
  created: Date
  receiptUrl?: string
  receiptNumber: string
  customerInfo: {
    name: string
    email: string
    phone?: string
  }
  serviceDetails?: {
    serviceName: string
    duration: number
    stylist: string
    date: Date
  }
  splitPayment?: {
    isDeposit: boolean
    depositAmount: number
    remainingAmount: number
    remainingDueDate: Date
  }
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  paymentIntentId,
  customerId,
  reservationId,
  onContinue,
  onPrintReceipt
}) => {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [receiptSent, setReceiptSent] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadPaymentDetails()
  }, [paymentIntentId])

  const loadPaymentDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/v1/payments/${paymentIntentId}/details`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('決済情報の取得に失敗しました')
      }

      const data = await response.json()
      setPaymentDetails(data.payment)
    } catch (err) {
      setError(err instanceof Error ? err.message : '決済情報の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendReceipt = async () => {
    try {
      const response = await fetch(`/api/v1/payments/${paymentIntentId}/send-receipt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('領収書の送信に失敗しました')
      }

      setReceiptSent(true)
      setTimeout(() => setReceiptSent(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '領収書の送信に失敗しました')
    }
  }

  const handleCopyPaymentId = () => {
    navigator.clipboard.writeText(paymentDetails?.id || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadReceipt = () => {
    if (paymentDetails?.receiptUrl) {
      window.open(paymentDetails.receiptUrl, '_blank')
    }
  }

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="w-6 h-6" />
      case 'konbini':
        return <MapPin className="w-6 h-6" />
      case 'bank_transfer':
        return <Calendar className="w-6 h-6" />
      default:
        return <CreditCard className="w-6 h-6" />
    }
  }

  const getPaymentMethodLabel = (type: string, details: any) => {
    switch (type) {
      case 'card':
        return `${details.brand?.toUpperCase()} •••• ${details.last4}`
      case 'konbini':
        return 'コンビニ決済'
      case 'bank_transfer':
        return '銀行振込'
      default:
        return '不明な決済方法'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'requires_payment_method':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'succeeded':
        return '決済完了'
      case 'requires_payment_method':
        return '支払い待ち'
      case 'processing':
        return '処理中'
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadPaymentDetails}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  if (!paymentDetails) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 rounded-t-lg">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">お支払い完了</h1>
          <p className="text-green-100">
            {paymentDetails.splitPayment?.isDeposit 
              ? '前払い金のお支払いが完了しました' 
              : 'お支払いが正常に完了しました'}
          </p>
        </div>
      </div>

      {/* 決済情報 */}
      <div className="p-8 space-y-6">
        {/* 金額・ステータス */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">決済詳細</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(paymentDetails.status)}`}>
              {getStatusLabel(paymentDetails.status)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">お支払い金額</label>
              <div className="text-2xl font-bold text-gray-900">
                ¥{paymentDetails.amount.toLocaleString()}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">決済方法</label>
              <div className="flex items-center">
                <div className="text-gray-600 mr-2">
                  {getPaymentMethodIcon(paymentDetails.paymentMethod.type)}
                </div>
                <span className="text-gray-900 font-medium">
                  {getPaymentMethodLabel(paymentDetails.paymentMethod.type, paymentDetails.paymentMethod.details)}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">決済ID</label>
              <div className="flex items-center">
                <span className="text-sm text-gray-700 font-mono mr-2">
                  {paymentDetails.id.slice(-12)}
                </span>
                <button
                  onClick={handleCopyPaymentId}
                  className="text-blue-600 hover:text-blue-700"
                  title="決済IDをコピー"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {copied && (
                  <span className="text-green-600 text-xs ml-2">コピーしました</span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">決済日時</label>
              <div className="text-gray-900">
                {paymentDetails.created.toLocaleString('ja-JP')}
              </div>
            </div>
          </div>
        </div>

        {/* 分割払い情報 */}
        {paymentDetails.splitPayment && (
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              分割払い情報
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">今回のお支払い</label>
                <div className="text-xl font-bold text-blue-900">
                  ¥{paymentDetails.splitPayment.depositAmount.toLocaleString()}
                </div>
                <div className="text-sm text-blue-600">（前払い金）</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">残りのお支払い</label>
                <div className="text-xl font-bold text-blue-900">
                  ¥{paymentDetails.splitPayment.remainingAmount.toLocaleString()}
                </div>
                <div className="text-sm text-blue-600">
                  期限: {paymentDetails.splitPayment.remainingDueDate.toLocaleDateString('ja-JP')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* サービス詳細 */}
        {paymentDetails.serviceDetails && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">サービス詳細</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">サービス名</label>
                <div className="text-gray-900">{paymentDetails.serviceDetails.serviceName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">担当スタイリスト</label>
                <div className="text-gray-900">{paymentDetails.serviceDetails.stylist}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">予約日時</label>
                <div className="text-gray-900">
                  {paymentDetails.serviceDetails.date.toLocaleString('ja-JP')}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">所要時間</label>
                <div className="text-gray-900">{paymentDetails.serviceDetails.duration}分</div>
              </div>
            </div>
          </div>
        )}

        {/* 顧客情報 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">お客様情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">お名前</label>
              <div className="text-gray-900">{paymentDetails.customerInfo.name}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">メールアドレス</label>
              <div className="text-gray-900">{paymentDetails.customerInfo.email}</div>
            </div>
            {paymentDetails.customerInfo.phone && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">電話番号</label>
                <div className="text-gray-900">{paymentDetails.customerInfo.phone}</div>
              </div>
            )}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleSendReceipt}
              disabled={receiptSent}
              className={`flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all ${
                receiptSent
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Mail className="w-5 h-5 mr-2" />
              {receiptSent ? '領収書を送信済み' : '領収書をメール送信'}
            </button>
            
            <button
              onClick={handleDownloadReceipt}
              disabled={!paymentDetails.receiptUrl}
              className="flex items-center justify-center px-4 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5 mr-2" />
              領収書をダウンロード
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {onPrintReceipt && (
              <button
                onClick={onPrintReceipt}
                className="flex items-center justify-center px-4 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <Printer className="w-5 h-5 mr-2" />
                領収書を印刷
              </button>
            )}
            
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: '決済完了',
                    text: `決済が完了しました。金額: ¥${paymentDetails.amount.toLocaleString()}`,
                    url: window.location.href
                  })
                }
              }}
              className="flex items-center justify-center px-4 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <Share2 className="w-5 h-5 mr-2" />
              決済情報を共有
            </button>
          </div>

          {onContinue && (
            <button
              onClick={onContinue}
              className="w-full bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              続行
            </button>
          )}
        </div>

        {/* 注意事項 */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-start">
            <Clock className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <div className="font-medium mb-1">重要なお知らせ</div>
              <ul className="space-y-1 text-xs">
                <li>• 領収書番号: {paymentDetails.receiptNumber}</li>
                <li>• この決済情報は重要書類です。印刷またはスクリーンショットで保存することをお勧めします</li>
                {paymentDetails.splitPayment && (
                  <li>• 残りのお支払いについては、別途ご案内いたします</li>
                )}
                <li>• ご不明な点がございましたら、お気軽にお問い合わせください</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentConfirmation