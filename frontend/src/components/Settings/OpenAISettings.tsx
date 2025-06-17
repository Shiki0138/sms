import React, { useState, useEffect } from 'react'
import { 
  Bot, 
  Eye, 
  EyeOff, 
  Save, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Settings,
  Zap,
  BarChart3
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface OpenAISettings {
  apiKey: string
  model: 'gpt-4' | 'gpt-3.5-turbo'
  maxTokens: number
  temperature: number
  isActive: boolean
  lastUsed: string | null
  usageCount: number
  monthlyLimit: number
  estimatedCosts: number
}

const OpenAISettings: React.FC = () => {
  const { hasPermission, user } = useAuth()
  const [openaiSettings, setOpenaiSettings] = useState<OpenAISettings>({
    apiKey: '',
    model: 'gpt-4',
    maxTokens: 1000,
    temperature: 0.7,
    isActive: false,
    lastUsed: null,
    usageCount: 0,
    monthlyLimit: 10000,
    estimatedCosts: 0
  })

  const [showApiKey, setShowApiKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  // 管理者権限チェック
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (isAdmin) {
      loadOpenAISettings()
    } else {
      setIsLoading(false)
    }
  }, [isAdmin])

  const loadOpenAISettings = async () => {
    setIsLoading(true)
    try {
      // 実際の本番環境ではAPIからデータを取得
      // デモ環境では初期値を使用
      console.log('OpenAI設定を読み込みました')
    } catch (error) {
      console.error('OpenAI settings load error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      // 実際の本番環境ではAPIに送信
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('OpenAI設定を保存:', openaiSettings)
      alert('OpenAI設定を保存しました')
    } catch (error) {
      console.error('Save error:', error)
      alert('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const testConnection = async () => {
    if (!openaiSettings.apiKey) {
      setTestResult({ success: false, message: 'APIキーが設定されていません' })
      return
    }

    try {
      // デモ用のテスト
      await new Promise(resolve => setTimeout(resolve, 2000))
      setTestResult({ success: true, message: 'OpenAI APIとの接続に成功しました' })
    } catch (error) {
      setTestResult({ success: false, message: 'OpenAI APIとの接続に失敗しました' })
    }
  }

  const updateSettings = (key: keyof OpenAISettings, value: any) => {
    setOpenaiSettings(prev => ({ ...prev, [key]: value }))
  }

  // 管理者以外はアクセス拒否
  if (!isAdmin) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">管理者限定機能</h3>
        <p className="text-gray-600 mb-4">
          OpenAI設定は管理者のみがアクセスできます
        </p>
        <div className="text-sm text-gray-500">
          現在のロール: <span className="font-medium">{user?.role}</span>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            OpenAI設定
          </h3>
          <p className="text-sm text-gray-600">AI返信機能のためのOpenAI API設定</p>
        </div>
        <button
          onClick={saveSettings}
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

      {/* 基本設定 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4">基本設定</h4>
        
        <div className="space-y-4">
          {/* APIキー */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI APIキー <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={openaiSettings.apiKey}
                onChange={(e) => updateSettings('apiKey', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="sk-..."
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* モデル選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AIモデル
            </label>
            <select
              value={openaiSettings.model}
              onChange={(e) => updateSettings('model', e.target.value as 'gpt-4' | 'gpt-3.5-turbo')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="gpt-4">GPT-4 (高精度・高コスト)</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (標準・低コスト)</option>
            </select>
          </div>

          {/* その他設定 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大トークン数
              </label>
              <input
                type="number"
                min="100"
                max="4000"
                value={openaiSettings.maxTokens}
                onChange={(e) => updateSettings('maxTokens', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature (創造性)
              </label>
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={openaiSettings.temperature}
                onChange={(e) => updateSettings('temperature', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 有効/無効切り替え */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="openai-active"
              checked={openaiSettings.isActive}
              onChange={(e) => updateSettings('isActive', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="openai-active" className="text-sm font-medium text-gray-700">
              AI返信機能を有効にする
            </label>
          </div>
        </div>
      </div>

      {/* 接続テスト */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4">接続テスト</h4>
        
        <div className="space-y-4">
          <button
            onClick={testConnection}
            disabled={!openaiSettings.apiKey}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span>接続テスト</span>
          </button>

          {testResult && (
            <div className={`flex items-center space-x-2 p-3 rounded-lg ${
              testResult.success 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {testResult.success ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* 使用状況 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-4 h-4 mr-2" />
          使用状況
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{openaiSettings.usageCount}</div>
            <div className="text-sm text-blue-600">今月の使用回数</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">${openaiSettings.estimatedCosts.toFixed(2)}</div>
            <div className="text-sm text-green-600">推定費用</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{openaiSettings.monthlyLimit}</div>
            <div className="text-sm text-yellow-600">月間上限</div>
          </div>
        </div>

        {openaiSettings.lastUsed && (
          <div className="mt-4 text-sm text-gray-600">
            最終使用: {new Date(openaiSettings.lastUsed).toLocaleString('ja-JP')}
          </div>
        )}
      </div>

      {/* 重要な注意事項 */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h5 className="text-sm font-medium text-yellow-900 mb-1">重要な注意事項</h5>
            <ul className="text-xs text-yellow-800 space-y-1">
              <li>• OpenAI APIキーは機密情報です。適切に管理してください</li>
              <li>• GPT-4は高精度ですが、GPT-3.5 Turboより約10倍のコストがかかります</li>
              <li>• 月間使用量を監視し、コストをコントロールしてください</li>
              <li>• AI返信は参考として生成されます。送信前に必ず内容を確認してください</li>
              <li>• この設定は管理者のみがアクセスできます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OpenAISettings