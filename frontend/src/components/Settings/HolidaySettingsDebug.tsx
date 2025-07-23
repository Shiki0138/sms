import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-client'
import { useAuth } from '../../contexts/AuthContext'

const HolidaySettingsDebug: React.FC = () => {
  const { user } = useAuth()
  const [allSettings, setAllSettings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllSettings()
  }, [])

  const loadAllSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('holiday_settings')
        .select('*')
        .order('tenantId')
      
      if (error) {
        console.error('Error loading all settings:', error)
      } else {
        setAllSettings(data || [])
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>読み込み中...</div>
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8">
      <h3 className="text-lg font-bold text-yellow-900 mb-4">🔍 デバッグ情報</h3>
      
      <div className="space-y-2 text-sm">
        <div className="bg-white p-3 rounded border border-yellow-300">
          <p className="font-semibold">現在のユーザー情報:</p>
          <p>User ID: <code className="bg-gray-100 px-1">{user?.id || 'なし'}</code></p>
          <p>Email: <code className="bg-gray-100 px-1">{user?.email || 'なし'}</code></p>
          <p>Role: <code className="bg-gray-100 px-1">{user?.role || 'なし'}</code></p>
        </div>

        <div className="bg-white p-3 rounded border border-yellow-300">
          <p className="font-semibold mb-2">Supabaseに保存されている全ての休日設定:</p>
          {allSettings.length === 0 ? (
            <p className="text-gray-500">データがありません</p>
          ) : (
            <div className="space-y-2">
              {allSettings.map((setting, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                  <p><strong>Tenant ID:</strong> {setting.tenantId}</p>
                  <p><strong>定休日:</strong> {JSON.stringify(setting.weekly_closed_days)}</p>
                  <p><strong>第◯曜日:</strong> {JSON.stringify(setting.nth_weekday_rules)}</p>
                  <p><strong>特別休日:</strong> {JSON.stringify(setting.specific_holidays)}</p>
                  <p><strong>更新日時:</strong> {new Date(setting.updatedAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-3 rounded border border-yellow-300">
          <p className="font-semibold">トラブルシューティング:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>上記の「User ID」が設定で使用されるテナントIDになります</li>
            <li>保存した設定のTenant IDと現在のUser IDが一致しているか確認してください</li>
            <li>ログイン状態によってUser IDが変わる場合があります（demo-user vs 実際のID）</li>
            <li>本番環境では必ずログインして使用してください</li>
          </ol>
        </div>
      </div>
      
      <button 
        onClick={loadAllSettings}
        className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
      >
        再読み込み
      </button>
    </div>
  )
}

export default HolidaySettingsDebug