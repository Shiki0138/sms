import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase-client'
import { getUnifiedTenantId } from '../../lib/tenant-utils'
import { useAuth } from '../../contexts/AuthContext'
import { AlertCircle, RefreshCw } from 'lucide-react'

const HolidaySettingsDebug: React.FC = () => {
  const { user } = useAuth()
  const [debugData, setDebugData] = useState<any>({})
  const [loading, setLoading] = useState(true)

  const loadDebugData = async () => {
    setLoading(true)
    try {
      // 現在のテナントID
      const currentTenantId = await getUnifiedTenantId(user)
      
      // Supabase認証ユーザー
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      
      // 全ての休日設定データ
      const { data: allSettings } = await supabase
        .from('holiday_settings')
        .select('*')
        .order('updatedAt', { ascending: false })
      
      // 現在のテナントの設定
      const { data: currentSettings } = await supabase
        .from('holiday_settings')
        .select('*')
        .eq('tenantId', currentTenantId)
        .single()
      
      setDebugData({
        currentTenantId,
        supabaseUser,
        allSettings,
        currentSettings,
        authUser: user,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Debug data load error:', error)
      setDebugData({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDebugData()
  }, [user])

  if (loading) {
    return (
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
          <span className="text-yellow-800">デバッグ情報を読み込み中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-yellow-900 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>休日設定デバッグ情報</span>
        </h3>
        <button
          onClick={loadDebugData}
          className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>再読込</span>
        </button>
      </div>

      {debugData.error ? (
        <div className="bg-red-100 p-3 rounded border border-red-300">
          <p className="text-red-800 font-semibold">エラー:</p>
          <p className="text-red-700 text-sm">{debugData.error}</p>
        </div>
      ) : (
        <>
          {/* 現在のテナント情報 */}
          <div className="bg-white p-3 rounded border border-yellow-300">
            <h4 className="font-semibold text-yellow-900 mb-2">現在のテナント情報</h4>
            <div className="space-y-1 text-sm">
              <p><strong>テナントID:</strong> <code className="bg-gray-100 px-1 rounded">{debugData.currentTenantId}</code></p>
              <p><strong>認証ユーザー:</strong> {user?.email || 'なし'}</p>
              <p><strong>Supabaseユーザー:</strong> {debugData.supabaseUser?.email || 'なし'}</p>
              <p><strong>SupabaseユーザーID:</strong> <code className="bg-gray-100 px-1 rounded">{debugData.supabaseUser?.id || 'なし'}</code></p>
            </div>
          </div>

          {/* 現在の設定 */}
          <div className="bg-white p-3 rounded border border-yellow-300">
            <h4 className="font-semibold text-yellow-900 mb-2">現在の休日設定</h4>
            {debugData.currentSettings ? (
              <div className="space-y-1 text-sm">
                <p><strong>定休日:</strong> {debugData.currentSettings.weekly_closed_days?.map(d => ['日','月','火','水','木','金','土'][d]).join(', ') || 'なし'}</p>
                <p><strong>第◯曜日:</strong> {debugData.currentSettings.nth_weekday_rules?.length || 0}件</p>
                <p><strong>特別休日:</strong> {debugData.currentSettings.specific_holidays?.length || 0}件</p>
                <p><strong>更新日時:</strong> {new Date(debugData.currentSettings.updatedAt).toLocaleString()}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">設定が見つかりません</p>
            )}
          </div>

          {/* 全ての設定 */}
          <div className="bg-white p-3 rounded border border-yellow-300">
            <h4 className="font-semibold text-yellow-900 mb-2">データベース内の全ての休日設定</h4>
            {debugData.allSettings && debugData.allSettings.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {debugData.allSettings.map((setting: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-2 rounded text-xs border border-gray-200">
                    <p><strong>テナントID:</strong> {setting.tenantId}</p>
                    <p><strong>定休日:</strong> {setting.weekly_closed_days?.join(', ') || 'なし'}</p>
                    <p><strong>更新:</strong> {new Date(setting.updatedAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">データがありません</p>
            )}
          </div>

          {/* 推奨アクション */}
          <div className="bg-blue-50 p-3 rounded border border-blue-300">
            <h4 className="font-semibold text-blue-900 mb-2">推奨アクション</h4>
            <div className="text-sm text-blue-800 space-y-1">
              {!debugData.currentSettings && (
                <p>• 休日設定が見つかりません。設定ページで保存してください。</p>
              )}
              {debugData.currentTenantId !== debugData.supabaseUser?.id && (
                <p>• テナントIDとSupabaseユーザーIDが一致しません。再ログインを試してください。</p>
              )}
              {debugData.currentSettings && (
                <p>• 設定は正常に保存されています。カレンダーが更新されない場合は、ページを再読み込みしてください。</p>
              )}
            </div>
          </div>
        </>
      )}

      <div className="text-xs text-gray-500 text-right">
        最終更新: {debugData.timestamp && new Date(debugData.timestamp).toLocaleTimeString()}
      </div>
    </div>
  )
}

export default HolidaySettingsDebug