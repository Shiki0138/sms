import React, { useState, useEffect } from 'react'
import {
  CreditCard,
  Calendar,
  MapPin,
  Search,
  Filter,
  Download,
  Eye,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  ExternalLink
} from 'lucide-react'

interface PaymentHistoryProps {
  customerId?: string
  showCustomerInfo?: boolean
  pageSize?: number
}

interface PaymentRecord {
  id: string
  amount: number
  currency: string
  status: 'succeeded' | 'pending' | 'failed' | 'refunded' | 'canceled'
  paymentMethod: {
    type: 'card' | 'konbini' | 'bank_transfer'
    details: any
  }
  created: Date
  description: string
  receiptUrl?: string
  receiptNumber: string
  refundAmount?: number
  customerInfo?: {
    id: string
    name: string
    email: string
  }
  serviceInfo?: {
    serviceName: string
    stylist: string
    date: Date
  }
  splitPayment?: {
    isDeposit: boolean
    depositAmount: number
    remainingAmount: number
    totalAmount: number
  }
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  customerId,
  showCustomerInfo = false,
  pageSize = 20
}) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null)
  
  // フィルタリング・検索
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  })
  
  // ページネーション
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    loadPaymentHistory()
  }, [customerId, currentPage, statusFilter, methodFilter, searchTerm, dateRange])

  const loadPaymentHistory = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(customerId && { customerId }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(methodFilter !== 'all' && { paymentMethod: methodFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end })
      })

      const response = await fetch(`/api/v1/payments/history?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('決済履歴の取得に失敗しました')
      }

      const data = await response.json()
      
      if (currentPage === 1) {
        setPayments(data.payments)
      } else {
        setPayments(prev => [...prev, ...data.payments])
      }
      
      setTotalCount(data.totalCount)
      setHasMore(data.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : '決済履歴の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefund = async (paymentId: string, amount?: number) => {
    try {
      const response = await fetch(`/api/v1/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: amount || undefined,
          reason: 'customer_request'
        })
      })

      if (!response.ok) {
        throw new Error('返金処理に失敗しました')
      }

      // 履歴を再読み込み
      loadPaymentHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : '返金処理に失敗しました')
    }
  }

  const handleDownloadReceipt = (receiptUrl: string) => {
    window.open(receiptUrl, '_blank')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'refunded':
        return <RotateCcw className="w-5 h-5 text-blue-500" />
      case 'canceled':
        return <XCircle className="w-5 h-5 text-gray-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'succeeded':
        return '成功'
      case 'pending':
        return '処理中'
      case 'failed':
        return '失敗'
      case 'refunded':
        return '返金済み'
      case 'canceled':
        return 'キャンセル'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'refunded':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'canceled':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="w-5 h-5" />
      case 'konbini':
        return <MapPin className="w-5 h-5" />
      case 'bank_transfer':
        return <Calendar className="w-5 h-5" />
      default:
        return <CreditCard className="w-5 h-5" />
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
        return '不明'
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchTerm === '' || 
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.customerInfo?.name.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch
  })

  const resetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setMethodFilter('all')
    setDateRange({ start: '', end: '' })
    setCurrentPage(1)
  }

  if (isLoading && currentPage === 1) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-gray-200 rounded-lg h-20 animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <DollarSign className="w-6 h-6 mr-2 text-blue-600" />
          決済履歴
        </h2>
        <div className="text-sm text-gray-500">
          全{totalCount}件の決済記録
        </div>
      </div>

      {/* 検索・フィルタ */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 検索 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              検索
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="領収書番号、説明、顧客名..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* ステータスフィルタ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ステータス
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">すべて</option>
              <option value="succeeded">成功</option>
              <option value="pending">処理中</option>
              <option value="failed">失敗</option>
              <option value="refunded">返金済み</option>
              <option value="canceled">キャンセル</option>
            </select>
          </div>

          {/* 決済方法フィルタ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              決済方法
            </label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">すべて</option>
              <option value="card">クレジットカード</option>
              <option value="konbini">コンビニ決済</option>
              <option value="bank_transfer">銀行振込</option>
            </select>
          </div>

          {/* フィルタリセット */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="flex items-center px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <Filter className="w-4 h-4 mr-1" />
              リセット
            </button>
          </div>
        </div>

        {/* 日付範囲 */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              開始日
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              終了日
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* 決済履歴リスト */}
      <div className="space-y-4">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">決済履歴がありません</h3>
            <p className="text-gray-500">条件に一致する決済記録が見つかりませんでした。</p>
          </div>
        ) : (
          filteredPayments.map((payment) => (
            <div key={payment.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* メイン情報 */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-gray-600">
                      {getPaymentMethodIcon(payment.paymentMethod.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          ¥{payment.amount.toLocaleString()}
                        </h3>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1">{getStatusLabel(payment.status)}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {getPaymentMethodLabel(payment.paymentMethod.type, payment.paymentMethod.details)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {payment.created.toLocaleString('ja-JP')} • {payment.receiptNumber}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {payment.receiptUrl && (
                      <button
                        onClick={() => handleDownloadReceipt(payment.receiptUrl!)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="領収書をダウンロード"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => setExpandedPayment(
                        expandedPayment === payment.id ? null : payment.id
                      )}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      {expandedPayment === payment.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-gray-700">{payment.description}</p>
                  {showCustomerInfo && payment.customerInfo && (
                    <p className="text-sm text-gray-500 mt-1">
                      お客様: {payment.customerInfo.name} ({payment.customerInfo.email})
                    </p>
                  )}
                </div>
              </div>

              {/* 詳細情報（展開時） */}
              {expandedPayment === payment.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 分割払い情報 */}
                    {payment.splitPayment && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">分割払い情報</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>種別: {payment.splitPayment.isDeposit ? '前払い金' : '残金'}</div>
                          <div>前払い金: ¥{payment.splitPayment.depositAmount.toLocaleString()}</div>
                          <div>残金: ¥{payment.splitPayment.remainingAmount.toLocaleString()}</div>
                          <div>総額: ¥{payment.splitPayment.totalAmount.toLocaleString()}</div>
                        </div>
                      </div>
                    )}

                    {/* サービス情報 */}
                    {payment.serviceInfo && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">サービス情報</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>サービス: {payment.serviceInfo.serviceName}</div>
                          <div>担当: {payment.serviceInfo.stylist}</div>
                          <div>予約日: {payment.serviceInfo.date.toLocaleString('ja-JP')}</div>
                        </div>
                      </div>
                    )}

                    {/* 返金情報 */}
                    {payment.refundAmount && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">返金情報</h4>
                        <div className="text-sm text-gray-600">
                          返金額: ¥{payment.refundAmount.toLocaleString()}
                        </div>
                      </div>
                    )}

                    {/* アクション */}
                    {payment.status === 'succeeded' && !payment.refundAmount && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">操作</h4>
                        <button
                          onClick={() => {
                            if (confirm('この決済を返金しますか？')) {
                              handleRefund(payment.id)
                            }
                          }}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          <RotateCcw className="w-4 h-4 inline mr-1" />
                          返金処理
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ページネーション */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '読み込み中...' : 'さらに読み込む'}
          </button>
        </div>
      )}
    </div>
  )
}

export default PaymentHistory