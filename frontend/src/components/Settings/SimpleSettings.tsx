import React from 'react'
import { Save } from 'lucide-react'

interface SimpleSettingsProps {
  businessSettings: {
    openHour: number
    closeHour: number
    timeSlotMinutes: number
    closedDays: number[]
    nthWeekdayRules: Array<{nth: number[], weekday: number}>
    customClosedDates: string[]
  }
  setBusinessSettings: React.Dispatch<React.SetStateAction<any>>
  setActiveTab: (tab: string) => void
  setActiveView: (view: string) => void
}

const SimpleSettings: React.FC<SimpleSettingsProps> = ({
  businessSettings,
  setBusinessSettings,
  setActiveTab,
  setActiveView
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">設定</h2>
      
      {/* 基本営業時間設定 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">基本営業時間設定</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                開店時間
              </label>
              <select
                value={businessSettings.openHour}
                onChange={(e) => setBusinessSettings((prev: any) => ({ ...prev, openHour: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{i}:00</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                閉店時間
              </label>
              <select
                value={businessSettings.closeHour}
                onChange={(e) => setBusinessSettings((prev: any) => ({ ...prev, closeHour: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{i}:00</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                予約間隔
              </label>
              <select
                value={businessSettings.timeSlotMinutes}
                onChange={(e) => setBusinessSettings((prev: any) => ({ ...prev, timeSlotMinutes: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15分</option>
                <option value={30}>30分</option>
                <option value={60}>60分</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <button className="btn btn-primary">
              <Save className="w-4 h-4 mr-2" />
              営業時間設定を保存
            </button>
          </div>
        </div>
      </div>
      
      {/* システム設定 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">システム設定</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">通知設定</h4>
              <p className="text-xs text-gray-500">新しいメッセージや予約の通知を管理します</p>
            </div>
            <button 
              onClick={() => setActiveTab('notification-settings')}
              className="btn btn-secondary btn-sm"
            >
              設定
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">データバックアップ</h4>
              <p className="text-xs text-gray-500">定期的なデータバックアップを設定します</p>
            </div>
            <button 
              onClick={() => setActiveTab('backup-settings')}
              className="btn btn-secondary btn-sm"
            >
              設定
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">外部API連携設定</h4>
              <p className="text-xs text-gray-500">LINE・Instagram APIの設定を管理します</p>
            </div>
            <button 
              onClick={() => setActiveTab('api-settings')}
              className="btn btn-secondary btn-sm"
            >
              設定
            </button>
          </div>
        </div>
      </div>

      {/* プラン管理 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">プラン管理</h3>
        <div className="space-y-4">
          <p className="text-gray-600">現在のプラン: ライトプラン</p>
          <button 
            onClick={() => setActiveView('upgrade')}
            className="btn btn-primary"
          >
            プランをアップグレード
          </button>
        </div>
      </div>
    </div>
  )
}

export default SimpleSettings