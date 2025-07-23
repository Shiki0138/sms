import React, { useState } from 'react'
import { X, AlertCircle, Eye, EyeOff, Save, TestTube } from 'lucide-react'
import { supabase } from '../../lib/supabase-client'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

interface ApiCredentialsModalProps {
  isOpen: boolean
  onClose: () => void
  service: 'line' | 'instagram' | 'google'
  currentCredentials?: any
}

const ApiCredentialsModal: React.FC<ApiCredentialsModalProps> = ({
  isOpen,
  onClose,
  service,
  currentCredentials
}) => {
  const { user } = useAuth()
  const [showSecrets, setShowSecrets] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  
  // Service specific credentials
  const [lineCredentials, setLineCredentials] = useState({
    channelAccessToken: currentCredentials?.channelAccessToken || '',
    channelSecret: currentCredentials?.channelSecret || '',
    channelId: currentCredentials?.channelId || '',
  })
  
  const [instagramCredentials, setInstagramCredentials] = useState({
    accessToken: currentCredentials?.accessToken || '',
    pageId: currentCredentials?.pageId || '',
    appId: currentCredentials?.appId || '',
    appSecret: currentCredentials?.appSecret || '',
  })
  
  const [googleCredentials, setGoogleCredentials] = useState({
    clientId: currentCredentials?.clientId || '',
    clientSecret: currentCredentials?.clientSecret || '',
    redirectUri: currentCredentials?.redirectUri || window.location.origin + '/api/auth/google/callback',
  })

  if (!isOpen) return null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const tenantId = user?.id
      if (!tenantId) {
        toast.error('ユーザー認証エラー')
        return
      }

      let credentials = {}
      if (service === 'line') {
        credentials = lineCredentials
      } else if (service === 'instagram') {
        credentials = instagramCredentials
      } else if (service === 'google') {
        credentials = googleCredentials
      }

      // Supabaseのapi_settingsテーブルに保存
      const { data: existing } = await supabase
        .from('api_settings')
        .select('id')
        .eq('tenantId', tenantId)
        .eq('service', service)
        .single()

      if (existing) {
        // 更新
        const { error } = await supabase
          .from('api_settings')
          .update({
            credentials,
            updatedAt: new Date().toISOString(),
          })
          .eq('id', existing.id)

        if (error) throw error
      } else {
        // 新規作成
        const { error } = await supabase
          .from('api_settings')
          .insert({
            tenantId,
            service,
            credentials,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })

        if (error) throw error
      }

      toast.success(`${getServiceName(service)}のAPI設定を保存しました`)
      onClose()
    } catch (error: any) {
      console.error('API credentials save error:', error)
      toast.error('保存に失敗しました: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    setIsTesting(true)
    try {
      // API接続テスト
      const response = await fetch(`/api/v1/external/${service}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify({
          credentials: service === 'line' ? lineCredentials :
                      service === 'instagram' ? instagramCredentials :
                      googleCredentials
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(`${getServiceName(service)}への接続テストが成功しました`)
      } else {
        toast.error(`接続テスト失敗: ${result.error || '不明なエラー'}`)
      }
    } catch (error: any) {
      toast.error('接続テストエラー: ' + error.message)
    } finally {
      setIsTesting(false)
    }
  }

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }

  const getServiceName = (service: string) => {
    switch (service) {
      case 'line': return 'LINE'
      case 'instagram': return 'Instagram'
      case 'google': return 'Google Calendar'
      default: return service
    }
  }

  const renderCredentialsForm = () => {
    switch (service) {
      case 'line':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Channel Access Token
              </label>
              <div className="relative">
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={lineCredentials.channelAccessToken}
                  onChange={(e) => setLineCredentials(prev => ({ ...prev, channelAccessToken: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="チャンネルアクセストークンを入力"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Channel Secret
              </label>
              <input
                type={showSecrets ? 'text' : 'password'}
                value={lineCredentials.channelSecret}
                onChange={(e) => setLineCredentials(prev => ({ ...prev, channelSecret: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="チャンネルシークレットを入力"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Channel ID（オプション）
              </label>
              <input
                type="text"
                value={lineCredentials.channelId}
                onChange={(e) => setLineCredentials(prev => ({ ...prev, channelId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="チャンネルIDを入力"
              />
            </div>
          </div>
        )
        
      case 'instagram':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Token
              </label>
              <input
                type={showSecrets ? 'text' : 'password'}
                value={instagramCredentials.accessToken}
                onChange={(e) => setInstagramCredentials(prev => ({ ...prev, accessToken: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="アクセストークンを入力"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page ID
              </label>
              <input
                type="text"
                value={instagramCredentials.pageId}
                onChange={(e) => setInstagramCredentials(prev => ({ ...prev, pageId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ページIDを入力"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                App ID
              </label>
              <input
                type="text"
                value={instagramCredentials.appId}
                onChange={(e) => setInstagramCredentials(prev => ({ ...prev, appId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="アプリIDを入力"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                App Secret
              </label>
              <input
                type={showSecrets ? 'text' : 'password'}
                value={instagramCredentials.appSecret}
                onChange={(e) => setInstagramCredentials(prev => ({ ...prev, appSecret: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="アプリシークレットを入力"
              />
            </div>
          </div>
        )
        
      case 'google':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client ID
              </label>
              <input
                type="text"
                value={googleCredentials.clientId}
                onChange={(e) => setGoogleCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="クライアントIDを入力"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Secret
              </label>
              <input
                type={showSecrets ? 'text' : 'password'}
                value={googleCredentials.clientSecret}
                onChange={(e) => setGoogleCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="クライアントシークレットを入力"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Redirect URI
              </label>
              <input
                type="text"
                value={googleCredentials.redirectUri}
                onChange={(e) => setGoogleCredentials(prev => ({ ...prev, redirectUri: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="リダイレクトURIを入力"
              />
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {getServiceName(service)} API設定
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">重要：API認証情報の取得方法</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {service === 'line' && (
                    <>
                      <li>LINE Developersコンソールにアクセス</li>
                      <li>Messaging APIチャンネルを作成</li>
                      <li>チャンネル基本設定から認証情報を取得</li>
                    </>
                  )}
                  {service === 'instagram' && (
                    <>
                      <li>Facebook Developersにアクセス</li>
                      <li>Instagram Basic Display APIを設定</li>
                      <li>アクセストークンを生成</li>
                    </>
                  )}
                  {service === 'google' && (
                    <>
                      <li>Google Cloud Consoleにアクセス</li>
                      <li>OAuth 2.0クライアントIDを作成</li>
                      <li>リダイレクトURIを設定</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">API認証情報</span>
            <button
              onClick={() => setShowSecrets(!showSecrets)}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
            >
              {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showSecrets ? '非表示' : '表示'}</span>
            </button>
          </div>
          
          {renderCredentialsForm()}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {isTesting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700" />
            ) : (
              <TestTube className="w-4 h-4" />
            )}
            <span>接続テスト</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>保存</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApiCredentialsModal