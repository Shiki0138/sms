import React, { useState, useEffect } from 'react'
import { 
  MessageCircle, 
  Instagram, 
  Shield,
  AlertCircle,
  Info,
  Check,
  X,
  Loader2,
  Settings
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase-client'
import axios from 'axios'
import toast from 'react-hot-toast'
import ApiCredentialsModal from './ApiCredentialsModal'
import ExternalAPITestPanel from './ExternalAPITestPanel'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

interface ExternalAPISettingsProps {
  defaultTab?: 'line' | 'instagram' | 'google';
}

const ExternalAPISettings: React.FC<ExternalAPISettingsProps> = ({ defaultTab }) => {
  const { user } = useAuth()
  const [isConnectingLine, setIsConnectingLine] = useState(false)
  const [lineConnected, setLineConnected] = useState(false)
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [selectedService, setSelectedService] = useState<'line' | 'instagram' | 'google'>('line')
  const [apiSettings, setApiSettings] = useState<any>({})
  
  // 管理者・オーナーのみアクセス可能（小文字に対応）
  const canConfigureAPIs = user?.role === 'admin'
  
  // API設定を読み込む
  useEffect(() => {
    loadApiSettings()
  }, [user?.id])
  
  const loadApiSettings = async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('api_settings')
        .select('*')
        .eq('tenantId', user.id)
      
      if (error) throw error
      
      const settings: any = {}
      data?.forEach(item => {
        settings[item.service] = item.credentials
      })
      setApiSettings(settings)
      
      // LINE接続状態を確認
      if (settings.line?.channelAccessToken) {
        setLineConnected(true)
      }
    } catch (error) {
      console.error('Failed to load API settings:', error)
    }
  }
  
  const handleLineConnect = async () => {
    if (!canConfigureAPIs) {
      toast.error('この機能は管理者とオーナーのみ利用可能です')
      return
    }
    
    setIsConnectingLine(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/external/line/connect`, {
        userId: user?.id
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.data.authUrl) {
        // LINE認証画面へリダイレクト
        window.location.href = response.data.authUrl
      } else {
        setLineConnected(true)
        toast.success('LINE連携が完了しました')
      }
    } catch (error: any) {
      console.error('LINE連携エラー:', error)
      toast.error(error.response?.data?.error || 'LINE連携に失敗しました')
    } finally {
      setIsConnectingLine(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* アクセス権限確認 */}
      {!canConfigureAPIs && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-red-800">アクセス制限</h2>
          </div>
          <p className="text-red-700 mt-2">
            外部API連携設定は管理者およびオーナーのみが利用可能です。
          </p>
        </div>
      )}
      
      {/* セキュリティ情報 */}
      {canConfigureAPIs && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-blue-800">外部API設定</h2>
          </div>
          <p className="text-blue-700 mt-2">
            管理者・オーナー権限で外部サービスとの連携設定が可能です。
          </p>
        </div>
      )}

      {/* LINE API */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold">LINE連携</h3>
            {lineConnected && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded flex items-center">
                <Check className="w-3 h-3 mr-1" />
                連携済み
              </span>
            )}
          </div>
        </div>
        
        {canConfigureAPIs ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <Info className="w-4 h-4" />
                <span className="font-medium">LINE連携機能</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                LINE公式アカウントと連携することで、顧客とのコミュニケーションを効率化できます。
              </p>
              
              {!lineConnected ? (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setSelectedService('line')
                      setShowCredentialsModal(true)
                    }}
                    className="btn btn-primary flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    LINE API設定
                  </button>
                  <p className="text-xs text-gray-500">
                    まずAPI認証情報を設定してください
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center text-green-700">
                    <Check className="w-4 h-4 mr-2" />
                    <span className="text-sm">API設定済み</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedService('line')
                      setShowCredentialsModal(true)
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    設定を変更
                  </button>
                </div>
              )}
            </div>
            
            {lineConnected && (
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-green-700 text-sm">
                  LINE連携が完了しました。メッセージ画面から顧客とのやり取りが可能です。
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm leading-relaxed">
              LINE連携機能はスタッフアカウントではご利用いただけません。
            </p>
          </div>
        )}
      </div>

      {/* Instagram API */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Instagram className="w-6 h-6 text-pink-600" />
          <h3 className="text-lg font-semibold">Instagram連携</h3>
          {!canConfigureAPIs && (
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">
              権限なし
            </span>
          )}
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <Info className="w-4 h-4" />
            <span className="font-medium">Instagram連携について</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {canConfigureAPIs ? (
              <>Instagram Graph APIとの連携機能は現在準備中です。</>
            ) : (
              <>Instagram連携機能はスタッフアカウントではご利用いただけません。</>
            )}
          </p>
        </div>
      </div>

      {/* お問い合わせ案内 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-blue-600" />
          </div>
          
          <h4 className="text-lg font-medium text-blue-900 mb-2">
            設定に関するお問い合わせ
          </h4>
          
          <p className="text-blue-700 text-sm leading-relaxed">
            外部API連携の詳細設定や個別サポートについては、
            <br />
            専用のLINEグループにてご案内いたします。
            <br /><br />
            LINEグループへのご案内は、システム管理者より別途ご連絡いたします。
          </p>
          
          <div className="mt-4 text-xs text-blue-600">
            ※ メールアドレス、電話番号等での直接のお問い合わせは受け付けておりません
          </div>
        </div>
      </div>
      
      {/* API接続テストパネル（管理者のみ） */}
      {canConfigureAPIs && (
        <ExternalAPITestPanel />
      )}
      
      {/* API認証情報モーダル */}
      {showCredentialsModal && (
        <ApiCredentialsModal
          isOpen={showCredentialsModal}
          onClose={() => {
            setShowCredentialsModal(false)
            loadApiSettings() // モーダルを閉じた時に設定を再読み込み
          }}
          service={selectedService}
          currentCredentials={apiSettings[selectedService]}
        />
      )}
    </div>
  )
}

export default ExternalAPISettings