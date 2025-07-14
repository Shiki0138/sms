import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  Shield, 
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  XCircle,
  RefreshCw,
  MessageSquare,
  Instagram,
  Smartphone,
  Database
} from 'lucide-react'

interface ApiSettings {
  line_api_enabled: string
  line_channel_id: string
  line_channel_secret: string
  instagram_api_enabled: string
  instagram_app_id: string
  instagram_app_secret: string
  external_api_safety_mode: string
  api_log_enabled: string
}

interface ApiLog {
  id: string
  timestamp: string
  data: {
    apiType: string
    action: string
    status: string
    message: string
    requestData: any
    responseData: any
  }
}

interface TestApiSettingsProps {
  tenantId: string
}

const TestApiSettings: React.FC<TestApiSettingsProps> = ({ tenantId }) => {
  const [settings, setSettings] = useState<ApiSettings | null>(null)
  const [logs, setLogs] = useState<ApiLog[]>([])
  const [loading, setLoading] = useState(false)
  const [showSecrets, setShowSecrets] = useState(false)
  const [simulationData, setSimulationData] = useState({
    apiType: 'line',
    action: 'send_message',
    data: { message: 'テストメッセージ', recipient: 'test_user' }
  })

  // API設定取得
  const loadApiSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/test/api-settings/${tenantId}`)
      const result = await response.json()
      
      if (result.success) {
        setSettings(result.data.settings)
      }
    } catch (error) {
      console.error('API設定取得エラー:', error)
    }
    setLoading(false)
  }

  // API設定更新
  const updateApiSettings = async (newSettings: Partial<ApiSettings>) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/test/api-settings/${tenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          settings: { ...settings, ...newSettings }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setSettings(result.data.settings)
        alert('API設定を更新しました（セーフティモード有効）')
      } else {
        alert(`エラー: ${result.message}`)
      }
    } catch (error) {
      console.error('API設定更新エラー:', error)
      alert('API設定の更新に失敗しました')
    }
    setLoading(false)
  }

  // APIシミュレーション実行
  const simulateApiCall = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test/api-simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tenantId: tenantId,
          ...simulationData
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert(`APIシミュレーション成功!\n\nタイプ: ${result.data.apiType}\nアクション: ${result.data.action}\nステータス: ${result.data.status}`)
        await loadApiLogs()
      } else {
        alert(`エラー: ${result.message}`)
      }
    } catch (error) {
      console.error('APIシミュレーションエラー:', error)
      alert('APIシミュレーションに失敗しました')
    }
    setLoading(false)
  }

  // APIログ取得
  const loadApiLogs = async () => {
    try {
      const response = await fetch(`/api/test/api-logs/${tenantId}?limit=20`)
      const result = await response.json()
      
      if (result.success) {
        setLogs(result.data.logs)
      }
    } catch (error) {
      console.error('APIログ取得エラー:', error)
    }
  }

  useEffect(() => {
    if (tenantId) {
      loadApiSettings()
      loadApiLogs()
    }
  }, [tenantId])

  if (!settings) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2">設定を読み込み中...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* セーフティ警告 */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Lock className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-red-800">セーフティモード有効</h2>
        </div>
        <p className="text-red-700 mt-2">
          テスト環境では外部API送信は完全に無効化されています。設定変更やシミュレーションは内部ログのみに記録されます。
        </p>
      </div>

      {/* LINE API設定 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MessageSquare className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold">LINE Business API設定</h3>
          <div className="flex items-center space-x-1">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600">無効化</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Channel ID</label>
            <input
              type="text"
              value={settings.line_channel_id}
              onChange={(e) => updateApiSettings({ line_channel_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="LINE Channel ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Channel Secret</label>
            <div className="relative">
              <input
                type={showSecrets ? "text" : "password"}
                value={settings.line_channel_secret}
                onChange={(e) => updateApiSettings({ line_channel_secret: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                placeholder="LINE Channel Secret"
              />
              <button
                onClick={() => setShowSecrets(!showSecrets)}
                className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
              >
                {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instagram API設定 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Instagram className="w-6 h-6 text-pink-600" />
          <h3 className="text-lg font-semibold">Instagram Graph API設定</h3>
          <div className="flex items-center space-x-1">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600">無効化</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">App ID</label>
            <input
              type="text"
              value={settings.instagram_app_id}
              onChange={(e) => updateApiSettings({ instagram_app_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Instagram App ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">App Secret</label>
            <div className="relative">
              <input
                type={showSecrets ? "text" : "password"}
                value={settings.instagram_app_secret}
                onChange={(e) => updateApiSettings({ instagram_app_secret: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                placeholder="Instagram App Secret"
              />
              <button
                onClick={() => setShowSecrets(!showSecrets)}
                className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
              >
                {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* APIシミュレーション */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Smartphone className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold">APIシミュレーション</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API種類</label>
            <select
              value={simulationData.apiType}
              onChange={(e) => setSimulationData({...simulationData, apiType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="line">LINE API</option>
              <option value="instagram">Instagram API</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">アクション</label>
            <select
              value={simulationData.action}
              onChange={(e) => setSimulationData({...simulationData, action: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="send_message">メッセージ送信</option>
              <option value="get_profile">プロフィール取得</option>
              <option value="upload_media">メディアアップロード</option>
            </select>
          </div>
          <div>
            <button
              onClick={simulateApiCall}
              disabled={loading}
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              シミュレーション実行
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">テストデータ (JSON)</label>
          <textarea
            value={JSON.stringify(simulationData.data, null, 2)}
            onChange={(e) => {
              try {
                const data = JSON.parse(e.target.value)
                setSimulationData({...simulationData, data})
              } catch (error) {
                // JSONパースエラーは無視
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
            placeholder="シミュレーション用のテストデータ"
          />
        </div>
      </div>

      {/* APIログ */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Database className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold">APIログ履歴</h3>
          </div>
          <button
            onClick={loadApiLogs}
            disabled={loading}
            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
          >
            更新
          </button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">ログがありません</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-gray-50 rounded p-3 text-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{log.data.apiType}</span>
                    <span className="text-gray-500">→</span>
                    <span>{log.data.action}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${log.data.status === 'simulated' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {log.data.status}
                    </span>
                    <span className="text-gray-500 text-xs">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-gray-600">{log.data.message}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span>処理中...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestApiSettings