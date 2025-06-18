import React, { useState, useEffect } from 'react'
import {
  CreditCard,
  MapPin,
  Smartphone,
  Clock,
  Check,
  Plus,
  Trash2,
  Edit,
  Star,
  Shield
} from 'lucide-react'

interface SavedPaymentMethod {
  id: string
  type: 'card' | 'konbini' | 'bank_transfer'
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  nickname?: string
  createdAt: string
}

interface PaymentMethodSelectorProps {
  customerId: string
  selectedMethodId?: string
  onMethodSelect: (methodId: string | null, method: SavedPaymentMethod | null) => void
  onAddNewMethod: () => void
  showAddNew?: boolean
  allowMultiple?: boolean
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  customerId,
  selectedMethodId,
  onMethodSelect,
  onAddNewMethod,
  showAddNew = true,
  allowMultiple = false
}) => {
  const [savedMethods, setSavedMethods] = useState<SavedPaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingMethod, setEditingMethod] = useState<string | null>(null)
  const [newNickname, setNewNickname] = useState('')

  useEffect(() => {
    loadSavedMethods()
  }, [customerId])

  const loadSavedMethods = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/v1/customers/${customerId}/payment-methods`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          setSavedMethods([])
          return
        }
        throw new Error('保存済み決済方法の取得に失敗しました')
      }

      const data = await response.json()
      setSavedMethods(data.paymentMethods || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '決済方法の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMethodSelect = (method: SavedPaymentMethod | null) => {
    if (allowMultiple) {
      // 複数選択の場合の処理（将来拡張用）
      onMethodSelect(method?.id || null, method)
    } else {
      onMethodSelect(method?.id || null, method)
    }
  }

  const handleSetDefault = async (methodId: string) => {
    try {
      const response = await fetch(`/api/v1/payments/methods/${methodId}/set-default`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('デフォルト設定に失敗しました')
      }

      // ローカル状態を更新
      setSavedMethods(prev => prev.map(method => ({
        ...method,
        isDefault: method.id === methodId
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'デフォルト設定に失敗しました')
    }
  }

  const handleDeleteMethod = async (methodId: string) => {
    if (!confirm('この決済方法を削除しますか？')) return

    try {
      const response = await fetch(`/api/v1/payments/methods/${methodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('決済方法の削除に失敗しました')
      }

      setSavedMethods(prev => prev.filter(method => method.id !== methodId))
      
      // 削除したものが選択されていた場合はクリア
      if (selectedMethodId === methodId) {
        onMethodSelect(null, null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '決済方法の削除に失敗しました')
    }
  }

  const handleUpdateNickname = async (methodId: string) => {
    try {
      const response = await fetch(`/api/v1/payments/methods/${methodId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          nickname: newNickname.trim()
        })
      })

      if (!response.ok) {
        throw new Error('ニックネームの更新に失敗しました')
      }

      setSavedMethods(prev => prev.map(method => 
        method.id === methodId 
          ? { ...method, nickname: newNickname.trim() }
          : method
      ))
      
      setEditingMethod(null)
      setNewNickname('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ニックネームの更新に失敗しました')
    }
  }

  const getMethodIcon = (type: string, brand?: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="w-6 h-6" />
      case 'konbini':
        return <MapPin className="w-6 h-6" />
      case 'bank_transfer':
        return <Smartphone className="w-6 h-6" />
      default:
        return <CreditCard className="w-6 h-6" />
    }
  }

  const getMethodLabel = (method: SavedPaymentMethod) => {
    switch (method.type) {
      case 'card':
        return `${method.brand?.toUpperCase()} •••• ${method.last4}`
      case 'konbini':
        return 'コンビニ決済'
      case 'bank_transfer':
        return '銀行振込'
      default:
        return '不明な決済方法'
    }
  }

  const getMethodDescription = (method: SavedPaymentMethod) => {
    switch (method.type) {
      case 'card':
        return `有効期限: ${method.expiryMonth?.toString().padStart(2, '0')}/${method.expiryYear?.toString().slice(-2)}`
      case 'konbini':
        return 'セブンイレブン、ファミリーマート、ローソン等'
      case 'bank_transfer':
        return '銀行振込での後払い'
      default:
        return ''
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-lg font-semibold text-gray-900">決済方法を選択</div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg p-4 h-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">決済方法を選択</h3>
        <div className="flex items-center text-sm text-gray-500">
          <Shield className="w-4 h-4 mr-1" />
          SSL暗号化保護
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {/* 保存済み決済方法 */}
        {savedMethods.map((method) => (
          <div
            key={method.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedMethodId === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleMethodSelect(method)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`text-gray-600 ${selectedMethodId === method.id ? 'text-blue-600' : ''}`}>
                  {getMethodIcon(method.type, method.brand)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="font-medium text-gray-900">
                      {method.nickname || getMethodLabel(method)}
                    </div>
                    {method.isDefault && (
                      <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        デフォルト
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {method.nickname ? getMethodLabel(method) : getMethodDescription(method)}
                  </div>
                  {method.nickname && (
                    <div className="text-xs text-gray-400">
                      {getMethodDescription(method)}
                    </div>
                  )}
                </div>
                {selectedMethodId === method.id && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </div>

            {/* 編集・削除ボタン */}
            {selectedMethodId === method.id && (
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center space-x-2">
                {editingMethod === method.id ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="text"
                      value={newNickname}
                      onChange={(e) => setNewNickname(e.target.value)}
                      placeholder="ニックネームを入力"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      maxLength={20}
                    />
                    <button
                      onClick={() => handleUpdateNickname(method.id)}
                      className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditingMethod(null)
                        setNewNickname('')
                      }}
                      className="px-2 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingMethod(method.id)
                        setNewNickname(method.nickname || '')
                      }}
                      className="flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      ニックネーム編集
                    </button>
                    {!method.isDefault && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSetDefault(method.id)
                        }}
                        className="flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Star className="w-4 h-4 mr-1" />
                        デフォルトに設定
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteMethod(method.id)
                      }}
                      className="flex items-center px-2 py-1 text-sm text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      削除
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {/* 新しい決済方法を追加 */}
        {showAddNew && (
          <button
            onClick={() => {
              onMethodSelect(null, null)
              onAddNewMethod()
            }}
            className={`w-full border-2 border-dashed rounded-lg p-4 text-center transition-all ${
              selectedMethodId === null
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400 text-gray-600'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Plus className="w-5 h-5" />
              <span className="font-medium">新しい決済方法を追加</span>
            </div>
            <div className="text-sm mt-1 opacity-75">
              クレジットカード、コンビニ決済、銀行振込
            </div>
          </button>
        )}

        {/* 決済方法がない場合 */}
        {savedMethods.length === 0 && !showAddNew && (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <div className="text-lg font-medium mb-2">保存済み決済方法がありません</div>
            <div className="text-sm">
              新しい決済方法を追加してお支払いください
            </div>
          </div>
        )}
      </div>

      {/* セキュリティ情報 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <div className="font-medium text-gray-900 mb-1">セキュリティについて</div>
            <ul className="space-y-1 text-xs">
              <li>• カード情報は当社サーバーに保存されません</li>
              <li>• Stripe社の国際セキュリティ基準（PCI DSS Level 1）準拠</li>
              <li>• 全ての通信はSSL暗号化により保護されています</li>
              <li>• ニックネームのみ当社で保存され、決済時の識別に使用されます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentMethodSelector