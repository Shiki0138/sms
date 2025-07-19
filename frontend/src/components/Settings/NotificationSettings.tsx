import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  BellOff, 
  MessageCircle, 
  Calendar, 
  Clock, 
  Mail, 
  Smartphone,
  Save,
  Volume2,
  VolumeX,
  Settings,
  Check,
  AlertTriangle
} from 'lucide-react'
import { isFeatureEnabled, getEnvironmentConfig } from '../../utils/environment'
import ProductionWarningModal from '../Common/ProductionWarningModal'

interface NotificationConfig {
  enabled: boolean
  email: boolean
  push: boolean
  sound: boolean
  vibration?: boolean
}

interface NotificationSettings {
  newMessage: NotificationConfig
  newReservation: NotificationConfig
  reservationReminder: NotificationConfig
  cancellation: NotificationConfig
  dailySummary: NotificationConfig
  weeklyReport: NotificationConfig
  systemMaintenance: NotificationConfig
}

interface GeneralSettings {
  businessHours: {
    enabled: boolean
    start: string
    end: string
  }
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  emailAddress: string
  pushEnabled: boolean
}

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    newMessage: { enabled: true, email: true, push: true, sound: true, vibration: true },
    newReservation: { enabled: true, email: true, push: true, sound: true, vibration: false },
    reservationReminder: { enabled: true, email: true, push: true, sound: false, vibration: false },
    cancellation: { enabled: true, email: true, push: true, sound: true, vibration: true },
    dailySummary: { enabled: true, email: true, push: false, sound: false, vibration: false },
    weeklyReport: { enabled: true, email: true, push: false, sound: false, vibration: false },
    systemMaintenance: { enabled: true, email: true, push: true, sound: false, vibration: false }
  })

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    businessHours: { enabled: true, start: '09:00', end: '18:00' },
    quietHours: { enabled: true, start: '22:00', end: '07:00' },
    emailAddress: 'test@test-salon.local',
    pushEnabled: true
  })

  const [isSaving, setIsSaving] = useState(false)
  const [testNotification, setTestNotification] = useState<string | null>(null)
  const [isWarningOpen, setIsWarningOpen] = useState(false)
  const [currentFeature, setCurrentFeature] = useState('')

  const config = getEnvironmentConfig()

  useEffect(() => {
    loadNotificationSettings()
  }, [])

  const loadNotificationSettings = async () => {
    try {
      // デモ用の初期設定
      console.log('通知設定を読み込みました')
    } catch (error) {
      console.error('Failed to load notification settings:', error)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      // デモ用の保存処理
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('通知設定を保存:', { settings, generalSettings })
      alert('通知設定を保存しました')
    } catch (error) {
      console.error('Save error:', error)
      alert('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const updateNotificationConfig = (key: keyof NotificationSettings, config: Partial<NotificationConfig>) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], ...config }
    }))
  }

  const sendTestNotification = async (type: string) => {
    // プッシュ通知機能の環境制限チェック
    if (!isFeatureEnabled('enablePushNotifications')) {
      setCurrentFeature('push_notifications')
      setIsWarningOpen(true)
      return
    }

    setTestNotification(type)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      alert(`${getNotificationLabel(type)}のテスト通知を送信しました`)
    } catch (error) {
      alert('テスト通知の送信に失敗しました')
    } finally {
      setTestNotification(null)
    }
  }

  const getNotificationLabel = (key: string): string => {
    const labels = {
      newMessage: '新しいメッセージ',
      newReservation: '新規予約',
      reservationReminder: '予約リマインダー',
      cancellation: 'キャンセル通知',
      dailySummary: '日次サマリー',
      weeklyReport: '週次レポート',
      systemMaintenance: 'システムメンテナンス'
    }
    return labels[key as keyof typeof labels] || key
  }

  const getNotificationIcon = (key: string) => {
    const icons = {
      newMessage: <MessageCircle className="w-5 h-5" />,
      newReservation: <Calendar className="w-5 h-5" />,
      reservationReminder: <Clock className="w-5 h-5" />,
      cancellation: <BellOff className="w-5 h-5" />,
      dailySummary: <Mail className="w-5 h-5" />,
      weeklyReport: <Mail className="w-5 h-5" />,
      systemMaintenance: <Settings className="w-5 h-5" />
    }
    return icons[key as keyof typeof icons] || <Bell className="w-5 h-5" />
  }

  const getNotificationDescription = (key: string): string => {
    const descriptions = {
      newMessage: 'LINEやInstagramから新しいメッセージが届いた時',
      newReservation: '新しい予約が入った時',
      reservationReminder: '予約の1時間前と24時間前',
      cancellation: '予約がキャンセルされた時',
      dailySummary: '毎日の営業終了後に当日の集計',
      weeklyReport: '毎週月曜日に前週の分析レポート',
      systemMaintenance: 'システムの更新やメンテナンス情報'
    }
    return descriptions[key as keyof typeof descriptions] || ''
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">通知設定</h3>
          <p className="text-sm text-gray-600">新しいメッセージや予約の通知を管理します</p>
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

      {/* 全般設定 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4">全般設定</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              通知用メールアドレス
            </label>
            <input
              type="email"
              value={generalSettings.emailAddress}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, emailAddress: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="test@test-salon.local"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={generalSettings.businessHours.enabled}
                  onChange={(e) => setGeneralSettings(prev => ({
                    ...prev,
                    businessHours: { ...prev.businessHours, enabled: e.target.checked }
                  }))}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">営業時間内のみ通知</span>
              </label>
              {generalSettings.businessHours.enabled && (
                <div className="mt-2 flex items-center space-x-2">
                  <input
                    type="time"
                    value={generalSettings.businessHours.start}
                    onChange={(e) => setGeneralSettings(prev => ({
                      ...prev,
                      businessHours: { ...prev.businessHours, start: e.target.value }
                    }))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <span className="text-sm text-gray-500">〜</span>
                  <input
                    type="time"
                    value={generalSettings.businessHours.end}
                    onChange={(e) => setGeneralSettings(prev => ({
                      ...prev,
                      businessHours: { ...prev.businessHours, end: e.target.value }
                    }))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={generalSettings.quietHours.enabled}
                  onChange={(e) => setGeneralSettings(prev => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, enabled: e.target.checked }
                  }))}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">おやすみ時間設定</span>
              </label>
              {generalSettings.quietHours.enabled && (
                <div className="mt-2 flex items-center space-x-2">
                  <input
                    type="time"
                    value={generalSettings.quietHours.start}
                    onChange={(e) => setGeneralSettings(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, start: e.target.value }
                    }))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <span className="text-sm text-gray-500">〜</span>
                  <input
                    type="time"
                    value={generalSettings.quietHours.end}
                    onChange={(e) => setGeneralSettings(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, end: e.target.value }
                    }))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 通知種別設定 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4">通知種別設定</h4>
        
        <div className="space-y-4">
          {Object.entries(settings).map(([key, config]) => (
            <div key={key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-blue-600">
                    {getNotificationIcon(key)}
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      {getNotificationLabel(key)}
                    </h5>
                    <p className="text-xs text-gray-500">
                      {getNotificationDescription(key)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => sendTestNotification(key)}
                    disabled={testNotification === key || !config.enabled}
                    className="text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 px-2 py-1 rounded transition-colors"
                  >
                    {testNotification === key ? 'テスト中...' : 'テスト'}
                  </button>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) => updateNotificationConfig(
                        key as keyof NotificationSettings, 
                        { enabled: e.target.checked }
                      )}
                      className="rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">有効</span>
                  </label>
                </div>
              </div>

              {config.enabled && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ml-8">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={config.email}
                      onChange={(e) => updateNotificationConfig(
                        key as keyof NotificationSettings, 
                        { email: e.target.checked }
                      )}
                      className="rounded mr-2"
                    />
                    <Mail className="w-4 h-4 mr-1" />
                    メール
                  </label>

                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={config.push}
                      onChange={(e) => updateNotificationConfig(
                        key as keyof NotificationSettings, 
                        { push: e.target.checked }
                      )}
                      className="rounded mr-2"
                    />
                    <Smartphone className="w-4 h-4 mr-1" />
                    プッシュ
                  </label>

                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={config.sound}
                      onChange={(e) => updateNotificationConfig(
                        key as keyof NotificationSettings, 
                        { sound: e.target.checked }
                      )}
                      className="rounded mr-2"
                    />
                    {config.sound ? <Volume2 className="w-4 h-4 mr-1" /> : <VolumeX className="w-4 h-4 mr-1" />}
                    音
                  </label>

                  {config.vibration !== undefined && (
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={config.vibration}
                        onChange={(e) => updateNotificationConfig(
                          key as keyof NotificationSettings, 
                          { vibration: e.target.checked }
                        )}
                        className="rounded mr-2"
                      />
                      <Smartphone className="w-4 h-4 mr-1" />
                      バイブ
                    </label>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 使用方法 */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="text-sm font-medium text-blue-900 mb-1">通知について</h5>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• プッシュ通知にはブラウザの許可が必要です</li>
              <li>• 営業時間外やおやすみ時間は重要な通知のみ送信されます</li>
              <li>• テストボタンで実際の通知を確認できます</li>
              <li>• メール通知は設定したアドレスに送信されます</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 環境制限警告モーダル */}
      <ProductionWarningModal
        isOpen={isWarningOpen}
        onClose={() => setIsWarningOpen(false)}
        feature={currentFeature}
        type="warning"
        showDetails={true}
      />
    </div>
  )
}

export default NotificationSettings