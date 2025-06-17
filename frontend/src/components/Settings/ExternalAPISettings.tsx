import React, { useState, useEffect } from 'react'
import { 
  MessageCircle, 
  Instagram, 
  Bot, 
  Check, 
  X, 
  RefreshCw, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Settings,
  Save,
  Shield,
  Calendar,
  Link,
  Upload,
  FileText,
  HelpCircle,
  Info
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface APISettings {
  line: {
    channelAccessToken: string
    channelSecret: string
    webhookUrl: string
    isConnected: boolean
    lastSync: string | null
    lastError: string | null
  }
  instagram: {
    accessToken: string
    businessAccountId: string
    appId: string
    isConnected: boolean
    lastSync: string | null
    lastError: string | null
  }
  googleCalendar: {
    clientId: string
    clientSecret: string
    calendarId: string
    autoSync: boolean
    syncInterval: number
    isConnected: boolean
    lastSync: string | null
    lastError: string | null
  }
  openai: {
    apiKey: string
    model: string
    maxTokens: number
    isActive: boolean
    lastUsed: string | null
    usageCount: number
  }
}

interface ConnectionStatus {
  status: 'connected' | 'disconnected' | 'error' | 'testing'
  message: string
  lastTested: string | null
}

const ExternalAPISettings: React.FC = () => {
  const { hasPermission, user } = useAuth()
  const [apiSettings, setApiSettings] = useState<APISettings>({
    line: {
      channelAccessToken: '',
      channelSecret: '',
      webhookUrl: '',
      isConnected: false,
      lastSync: null,
      lastError: null
    },
    instagram: {
      accessToken: '',
      businessAccountId: '',
      appId: '',
      isConnected: false,
      lastSync: null,
      lastError: null
    },
    googleCalendar: {
      clientId: '',
      clientSecret: '',
      calendarId: '',
      autoSync: false,
      syncInterval: 15,
      isConnected: false,
      lastSync: null,
      lastError: null
    },
    openai: {
      apiKey: '',
      model: 'gpt-4',
      maxTokens: 1000,
      isActive: false,
      lastUsed: null,
      usageCount: 0
    }
  })

  const [connectionStatus, setConnectionStatus] = useState<{
    line: ConnectionStatus
    instagram: ConnectionStatus
    googleCalendar: ConnectionStatus
  }>({
    line: { status: 'disconnected', message: '未接続', lastTested: null },
    instagram: { status: 'disconnected', message: '未接続', lastTested: null },
    googleCalendar: { status: 'disconnected', message: '未接続', lastTested: null }
  })

  const [showSecrets, setShowSecrets] = useState({
    lineSecret: false,
    instagramToken: false,
    googleSecret: false
  })

  const [activeTab, setActiveTab] = useState<'messaging' | 'calendar' | 'import'>('messaging')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [importProgress, setImportProgress] = useState<{
    isImporting: boolean
    progress: number
    total: number
    results?: { imported: number; errors: string[] }
  }>({
    isImporting: false,
    progress: 0,
    total: 0
  })

  useEffect(() => {
    loadAPISettings()
  }, [])

  const loadAPISettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/integrations/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setApiSettings(data.settings || apiSettings)
        setConnectionStatus(data.status || connectionStatus)
      }
    } catch (error) {
      console.error('API settings fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveAPISettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/v1/integrations/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ settings: apiSettings })
      })

      if (response.ok) {
        alert('API設定を保存しました')
      } else {
        throw new Error('保存に失敗しました')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const testConnection = async (service: keyof APISettings) => {
    setConnectionStatus(prev => ({
      ...prev,
      [service]: { ...prev[service as keyof typeof prev], status: 'testing', message: '接続テスト中...' }
    }))

    try {
      const response = await fetch(`/api/v1/integrations/${service}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(apiSettings[service])
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setConnectionStatus(prev => ({
          ...prev,
          [service]: {
            status: 'connected',
            message: '接続成功',
            lastTested: new Date().toISOString()
          }
        }))
        
        setApiSettings(prev => ({
          ...prev,
          [service]: { ...prev[service], isConnected: true, lastError: null }
        }))
      } else {
        throw new Error(result.error || '接続テストに失敗しました')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '接続エラー'
      setConnectionStatus(prev => ({
        ...prev,
        [service]: {
          status: 'error',
          message: errorMessage,
          lastTested: new Date().toISOString()
        }
      }))

      setApiSettings(prev => ({
        ...prev,
        [service]: { ...prev[service], isConnected: false, lastError: errorMessage }
      }))
    }
  }

  const updateSettings = (service: keyof APISettings, field: string, value: any) => {
    setApiSettings(prev => ({
      ...prev,
      [service]: { ...prev[service], [field]: value }
    }))
  }

  const toggleSecretVisibility = (secret: keyof typeof showSecrets) => {
    setShowSecrets(prev => ({ ...prev, [secret]: !prev[secret] }))
  }

  const getStatusIcon = (status: ConnectionStatus['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'testing': return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      case 'error': return <X className="w-5 h-5 text-red-500" />
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: ConnectionStatus['status']) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-50 border-green-200'
      case 'testing': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  // Google Calendar connection
  const handleGoogleCalendarConnect = async () => {
    await testConnection('googleCalendar')
  }

  // CSV Import functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
    } else {
      alert('CSVファイルを選択してください')
    }
  }

  const parseCSVReservations = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim())
    
    const reservations = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      if (values.length >= 4) {
        reservations.push({
          id: `hotpepper_${Date.now()}_${i}`,
          startTime: values[0]?.trim() || '',
          customerName: values[1]?.trim() || '',
          phone: values[2]?.trim() || '',
          menuContent: values[3]?.trim() || '',
          staff: values[4]?.trim() || '',
          price: parseFloat(values[5]?.replace(/[^\d]/g, '') || '0') || 0,
          status: values[6]?.trim() || 'CONFIRMED',
          source: 'HOTPEPPER' as const,
          notes: 'ホットペッパービューティーからのインポート'
        })
      }
    }
    
    return reservations
  }

  const handleCSVImport = async () => {
    if (!csvFile) return

    setImportProgress({ isImporting: true, progress: 0, total: 0 })

    try {
      const csvText = await csvFile.text()
      const reservations = parseCSVReservations(csvText)
      
      setImportProgress(prev => ({ ...prev, total: reservations.length }))

      const results = { imported: 0, errors: [] as string[] }

      for (let i = 0; i < reservations.length; i++) {
        try {
          const response = await fetch('/api/v1/reservations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(reservations[i])
          })

          if (response.ok) {
            results.imported++
          } else {
            results.errors.push(`行${i + 2}: インポートに失敗しました`)
          }
        } catch (error) {
          results.errors.push(`行${i + 2}: ${error instanceof Error ? error.message : 'エラー'}`)
        }

        setImportProgress(prev => ({ ...prev, progress: i + 1 }))
      }

      setImportProgress(prev => ({ 
        ...prev, 
        isImporting: false, 
        results 
      }))

      alert(`インポート完了: ${results.imported}件成功、${results.errors.length}件エラー`)
      
    } catch (error) {
      setImportProgress({ isImporting: false, progress: 0, total: 0 })
      alert(`CSVファイルの読み取りエラー: ${error instanceof Error ? error.message : 'エラー'}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">設定を読み込み中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">外部API連携設定</h3>
          <p className="text-sm text-gray-600">メッセージング、カレンダー連携、データインポート機能の設定</p>
        </div>
        <button
          onClick={saveAPISettings}
          disabled={isSaving}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>設定を保存</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('messaging')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'messaging'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            メッセージング連携
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'calendar'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            カレンダー連携
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'import'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            データインポート
          </button>
        </nav>
      </div>

      {/* Messaging Tab */}
      {activeTab === 'messaging' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LINE Business API */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-900">LINE Business API</h4>
                  <p className="text-xs text-gray-600">メッセージ送受信</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs border ${getStatusColor(connectionStatus.line.status)}`}>
                {getStatusIcon(connectionStatus.line.status)}
                <span className="ml-1">{connectionStatus.line.message}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Channel Access Token</label>
                <div className="relative">
                  <input
                    type={showSecrets.lineSecret ? 'text' : 'password'}
                    value={apiSettings.line.channelAccessToken}
                    onChange={(e) => updateSettings('line', 'channelAccessToken', e.target.value)}
                    className="w-full text-sm px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Channel Access Token"
                  />
                  <button
                    onClick={() => toggleSecretVisibility('lineSecret')}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets.lineSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Channel Secret</label>
                <input
                  type="password"
                  value={apiSettings.line.channelSecret}
                  onChange={(e) => updateSettings('line', 'channelSecret', e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Channel Secret"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Webhook URL</label>
                <input
                  type="url"
                  value={apiSettings.line.webhookUrl}
                  onChange={(e) => updateSettings('line', 'webhookUrl', e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://your-domain.com/webhook/line"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => testConnection('line')}
                  disabled={!apiSettings.line.channelAccessToken || !apiSettings.line.channelSecret}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  接続テスト
                </button>
                <a
                  href="https://developers.line.biz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Instagram Graph API */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-900">Instagram Graph API</h4>
                  <p className="text-xs text-gray-600">ダイレクトメッセージ</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs border ${getStatusColor(connectionStatus.instagram.status)}`}>
                {getStatusIcon(connectionStatus.instagram.status)}
                <span className="ml-1">{connectionStatus.instagram.message}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Access Token</label>
                <div className="relative">
                  <input
                    type={showSecrets.instagramToken ? 'text' : 'password'}
                    value={apiSettings.instagram.accessToken}
                    onChange={(e) => updateSettings('instagram', 'accessToken', e.target.value)}
                    className="w-full text-sm px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Instagram Access Token"
                  />
                  <button
                    onClick={() => toggleSecretVisibility('instagramToken')}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets.instagramToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Business Account ID</label>
                <input
                  type="text"
                  value={apiSettings.instagram.businessAccountId}
                  onChange={(e) => updateSettings('instagram', 'businessAccountId', e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Instagram Business Account ID"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">App ID</label>
                <input
                  type="text"
                  value={apiSettings.instagram.appId}
                  onChange={(e) => updateSettings('instagram', 'appId', e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Meta App ID"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => testConnection('instagram')}
                  disabled={!apiSettings.instagram.accessToken || !apiSettings.instagram.businessAccountId}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  接続テスト
                </button>
                <a
                  href="https://developers.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Settings Guide */}
          <div className="lg:col-span-2 bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Settings className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h4 className="text-md font-medium text-blue-900 mb-2">API連携ガイド</h4>
                <div className="space-y-3 text-sm text-blue-800">
                  <div>
                    <p className="font-semibold mb-1">LINE Business API の設定手順：</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>LINE Developers でアカウント作成・ログイン</li>
                      <li>新しいプロバイダーを作成</li>
                      <li>Messaging API チャンネルを作成</li>
                      <li>Channel Access Token を取得（メッセージ送信用）</li>
                      <li>Channel Secret を取得（署名検証用）</li>
                      <li>Webhook URL を設定（お客様からのメッセージを受信するため）</li>
                    </ol>
                  </div>
                  
                  <div>
                    <p className="font-semibold mb-1">Instagram Graph API の設定手順：</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Meta for Developers でアプリを作成</li>
                      <li>Instagram Basic Display API を有効化</li>
                      <li>ビジネスアカウントを連携</li>
                      <li>Access Token を取得（DM機能を使用するため）</li>
                    </ol>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                    <p className="font-semibold text-yellow-800">重要：</p>
                    <p className="text-yellow-800">これらのAPIを連携することで、LINEやInstagramからの問い合わせを統合管理できます。設定後、お客様からのメッセージが自動的にシステムに表示されます。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Google Calendar 連携</h4>
                  <p className="text-sm text-gray-600">Google Calendarとの双方向同期機能</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(connectionStatus.googleCalendar.status)}`}>
                {getStatusIcon(connectionStatus.googleCalendar.status)}
                <span className="ml-1">{connectionStatus.googleCalendar.message}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Client ID
                </label>
                <input
                  type="text"
                  value={apiSettings.googleCalendar.clientId}
                  onChange={(e) => updateSettings('googleCalendar', 'clientId', e.target.value)}
                  placeholder="Google API Client ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Client Secret
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.googleSecret ? 'text' : 'password'}
                    value={apiSettings.googleCalendar.clientSecret}
                    onChange={(e) => updateSettings('googleCalendar', 'clientSecret', e.target.value)}
                    placeholder="Google API Client Secret"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => toggleSecretVisibility('googleSecret')}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets.googleSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calendar ID（オプション）
              </label>
              <input
                type="text"
                value={apiSettings.googleCalendar.calendarId}
                onChange={(e) => updateSettings('googleCalendar', 'calendarId', e.target.value)}
                placeholder="primary（プライマリカレンダーの場合）"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={apiSettings.googleCalendar.autoSync}
                    onChange={(e) => updateSettings('googleCalendar', 'autoSync', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">自動同期を有効にする</span>
                </label>
                <p className="text-xs text-gray-500 ml-6 mt-1">指定間隔でGoogle Calendarと自動同期します</p>
              </div>
              
              <div className="text-right">
                <label className="block text-sm font-medium text-gray-700 mb-1">同期間隔</label>
                <select
                  value={apiSettings.googleCalendar.syncInterval}
                  onChange={(e) => updateSettings('googleCalendar', 'syncInterval', parseInt(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5分</option>
                  <option value={15}>15分</option>
                  <option value={30}>30分</option>
                  <option value={60}>1時間</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={handleGoogleCalendarConnect}
                disabled={!apiSettings.googleCalendar.clientId || !apiSettings.googleCalendar.clientSecret}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Link className="w-4 h-4 mr-2" />
                {apiSettings.googleCalendar.isConnected ? '再接続' : 'Google Calendarに接続'}
              </button>
              
              {apiSettings.googleCalendar.isConnected && (
                <button
                  onClick={() => updateSettings('googleCalendar', 'isConnected', false)}
                  className="btn btn-secondary"
                >
                  接続解除
                </button>
              )}
              
              <button className="btn btn-secondary flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                手動同期
              </button>
            </div>
          </div>

          {/* Google Calendar Setup Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-semibold text-blue-900 mb-3">Google Calendar API設定手順</h5>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>Google Cloud Console（console.cloud.google.com）にログイン</li>
                  <li>新しいプロジェクトを作成、または既存のプロジェクトを選択</li>
                  <li>「APIs & Services」→「Library」でGoogle Calendar APIを有効化</li>
                  <li>「APIs & Services」→「Credentials」で「OAuth 2.0 Client IDs」を作成</li>
                  <li>アプリケーションタイプは「Web application」を選択</li>
                  <li>認証済みリダイレクトURIに「{window.location.origin}/auth/google/callback」を追加</li>
                  <li>作成されたClient IDとClient Secretを上記フォームに入力</li>
                </ol>
                <div className="bg-blue-100 border border-blue-300 rounded p-3 mt-4">
                  <p className="font-semibold text-blue-900">連携後の機能：</p>
                  <ul className="list-disc list-inside text-sm text-blue-800 mt-1">
                    <li>システムの予約がGoogle Calendarに自動追加</li>
                    <li>Google Calendarの予定がシステムに反映</li>
                    <li>予約変更時の双方向同期</li>
                    <li>重複予約の自動検出と警告</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900">ホットペッパービューティー予約データインポート</h4>
                <p className="text-sm text-gray-600">CSV形式で予約データを一括インポート</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSVファイルを選択
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {csvFile && (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {csvFile.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Import Progress */}
              {importProgress.isImporting && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">インポート中...</span>
                    <span className="text-sm text-blue-700">
                      {importProgress.progress} / {importProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(importProgress.progress / importProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Import Results */}
              {importProgress.results && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-medium text-green-900 mb-2">インポート結果</h5>
                  <div className="text-sm text-green-800">
                    <p>成功: {importProgress.results.imported}件</p>
                    <p>エラー: {importProgress.results.errors.length}件</p>
                    {importProgress.results.errors.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer">エラー詳細を表示</summary>
                        <ul className="mt-1 list-disc list-inside">
                          {importProgress.results.errors.map((error, i) => (
                            <li key={i} className="text-red-600">{error}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleCSVImport}
                  disabled={!csvFile || importProgress.isImporting}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {importProgress.isImporting ? 'インポート中...' : 'インポート開始'}
                </button>
                {csvFile && (
                  <button
                    onClick={() => setCsvFile(null)}
                    className="btn btn-secondary"
                  >
                    ファイルをクリア
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* CSV Format Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h5 className="font-semibold text-yellow-900 mb-3">CSVファイル形式について</h5>
                <div className="text-sm text-yellow-800 space-y-3">
                  <div>
                    <p className="font-medium mb-1">必要な列（順番通り）：</p>
                    <ol className="list-decimal list-inside ml-2">
                      <li>予約日時（例: 2024-06-15 10:00:00）</li>
                      <li>顧客名（例: 田中花子）</li>
                      <li>電話番号（例: 090-1234-5678）</li>
                      <li>メニュー（例: カット+カラー）</li>
                      <li>担当者（例: 佐藤美咲）</li>
                      <li>金額（例: 8000）</li>
                      <li>ステータス（例: CONFIRMED）</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-medium mb-1">CSVサンプル：</p>
                    <code className="block bg-yellow-100 p-2 rounded text-xs">
                      予約日時,顧客名,電話番号,メニュー,担当者,金額,ステータス<br/>
                      2024-06-15 10:00:00,田中花子,090-1234-5678,カット+カラー,佐藤美咲,8000,CONFIRMED<br/>
                      2024-06-15 14:00:00,山田太郎,080-9876-5432,カット,田中美咲,4000,CONFIRMED
                    </code>
                  </div>
                  <div className="bg-yellow-100 border border-yellow-300 rounded p-3">
                    <p className="font-semibold text-yellow-900">注意事項：</p>
                    <ul className="list-disc list-inside text-yellow-800 mt-1">
                      <li>ファイルはUTF-8エンコーディングで保存してください</li>
                      <li>日時は「YYYY-MM-DD HH:MM:SS」形式で入力してください</li>
                      <li>重複する予約は自動的にスキップされます</li>
                      <li>大量データの場合は時間がかかる場合があります</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExternalAPISettings