import React, { useState, useEffect } from 'react'
import { Shield, AlertTriangle, Check, X, Settings, Eye, Lock } from 'lucide-react'

interface ExternalSendRestrictionProps {
  isTestMode?: boolean
  onModeChange?: (testMode: boolean) => void
}

interface SendRestriction {
  id: string
  name: string
  type: 'line' | 'instagram' | 'email' | 'sms' | 'api'
  enabled: boolean
  testModeOnly: boolean
  maxSendsPerDay: number
  currentSends: number
  lastSendTime?: string
  blockedSends: number
}

const ExternalSendRestriction: React.FC<ExternalSendRestrictionProps> = ({
  isTestMode = true,
  onModeChange
}) => {
  const [restrictions, setRestrictions] = useState<SendRestriction[]>([
    {
      id: 'line-send',
      name: 'LINE メッセージ送信',
      type: 'line',
      enabled: true,
      testModeOnly: true,
      maxSendsPerDay: 0, // テストモードでは実際に送信しない
      currentSends: 0,
      blockedSends: 5 // ブロックされた送信数
    },
    {
      id: 'instagram-send',
      name: 'Instagram メッセージ送信',
      type: 'instagram',
      enabled: true,
      testModeOnly: true,
      maxSendsPerDay: 0,
      currentSends: 0,
      blockedSends: 3
    },
    {
      id: 'email-send',
      name: 'メール送信',
      type: 'email',
      enabled: true,
      testModeOnly: true,
      maxSendsPerDay: 0,
      currentSends: 0,
      blockedSends: 2
    },
    {
      id: 'sms-send',
      name: 'SMS送信',
      type: 'sms',
      enabled: true,
      testModeOnly: true,
      maxSendsPerDay: 0,
      currentSends: 0,
      blockedSends: 1
    }
  ])

  const [globalTestMode, setGlobalTestMode] = useState(isTestMode)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (onModeChange) {
      onModeChange(globalTestMode)
    }
  }, [globalTestMode, onModeChange])

  const handleTestModeToggle = () => {
    const newTestMode = !globalTestMode
    setGlobalTestMode(newTestMode)
    
    // テストモードONの場合、全ての外部送信を無効化
    if (newTestMode) {
      setRestrictions(prev => prev.map(r => ({
        ...r,
        testModeOnly: true,
        maxSendsPerDay: 0
      })))
    }
  }

  const handleRestrictionToggle = (id: string) => {
    setRestrictions(prev => prev.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ))
  }

  const updateDailyLimit = (id: string, limit: number) => {
    setRestrictions(prev => prev.map(r => 
      r.id === id ? { ...r, maxSendsPerDay: limit } : r
    ))
  }

  const getStatusIcon = (restriction: SendRestriction) => {
    if (!restriction.enabled) {
      return <X className="w-4 h-4 text-gray-400" />
    }
    if (restriction.testModeOnly || globalTestMode) {
      return <Eye className="w-4 h-4 text-blue-500" />
    }
    if (restriction.currentSends >= restriction.maxSendsPerDay) {
      return <Lock className="w-4 h-4 text-red-500" />
    }
    return <Check className="w-4 h-4 text-green-500" />
  }

  const getStatusText = (restriction: SendRestriction) => {
    if (!restriction.enabled) {
      return '無効'
    }
    if (restriction.testModeOnly || globalTestMode) {
      return 'テストモード（送信なし）'
    }
    if (restriction.currentSends >= restriction.maxSendsPerDay) {
      return '制限到達'
    }
    return `送信可能 (${restriction.maxSendsPerDay - restriction.currentSends}回)`
  }

  const getStatusColor = (restriction: SendRestriction) => {
    if (!restriction.enabled) {
      return 'text-gray-500'
    }
    if (restriction.testModeOnly || globalTestMode) {
      return 'text-blue-600'
    }
    if (restriction.currentSends >= restriction.maxSendsPerDay) {
      return 'text-red-600'
    }
    return 'text-green-600'
  }

  const totalBlockedSends = restrictions.reduce((sum, r) => sum + r.blockedSends, 0)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">外部送信制限</h3>
            <p className="text-sm text-gray-500">テストユーザー保護機能</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">テストモード</span>
            <button
              onClick={handleTestModeToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                globalTestMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  globalTestMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 警告メッセージ */}
      {globalTestMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">
                テストモードが有効です
              </h4>
              <p className="text-sm text-blue-700">
                実際の外部送信は行われません。テストユーザーが安心してシステムをお試しいただけます。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ブロック済み送信</p>
              <p className="text-2xl font-bold text-red-600">{totalBlockedSends}</p>
            </div>
            <Shield className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">保護レベル</p>
              <p className="text-2xl font-bold text-blue-600">
                {globalTestMode ? '最大' : '標準'}
              </p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">有効な制限</p>
              <p className="text-2xl font-bold text-green-600">
                {restrictions.filter(r => r.enabled).length}
              </p>
            </div>
            <Check className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* 制限設定一覧 */}
      <div className="space-y-4">
        {restrictions.map((restriction) => (
          <div
            key={restriction.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(restriction)}
                  <h4 className="font-medium text-gray-900">{restriction.name}</h4>
                </div>
                
                <span className={`text-sm ${getStatusColor(restriction)}`}>
                  {getStatusText(restriction)}
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                {restriction.blockedSends > 0 && (
                  <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                    {restriction.blockedSends}回ブロック
                  </span>
                )}
                
                <button
                  onClick={() => handleRestrictionToggle(restriction.id)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    restriction.enabled ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      restriction.enabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 詳細設定（設定モード時のみ表示） */}
            {showSettings && restriction.enabled && !globalTestMode && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      1日の送信上限
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      value={restriction.maxSendsPerDay}
                      onChange={(e) => updateDailyLimit(restriction.id, parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      本日の送信数
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                      {restriction.currentSends} / {restriction.maxSendsPerDay}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 注意事項 */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <h4 className="font-medium mb-1">重要な注意事項</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>テストモードでは実際の外部送信は一切行われません</li>
              <li>本番運用時は必ずテストモードを無効にしてください</li>
              <li>1日の送信上限に達した場合、翌日0時にリセットされます</li>
              <li>制限設定の変更は即座に反映されます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExternalSendRestriction