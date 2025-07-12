import React, { useState } from 'react'
// Individual imports for better tree shaking and deployment compatibility
import Crown from 'lucide-react/dist/esm/icons/crown'
import Settings from 'lucide-react/dist/esm/icons/settings'
import Save from 'lucide-react/dist/esm/icons/save'
import Shield from 'lucide-react/dist/esm/icons/shield'
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle'
import ErrorBoundary from '../Common/ErrorBoundary'
import PlanBadge from '../Common/PlanBadge'
import ProtectedRoute from '../Auth/ProtectedRoute'
import AdvancedHolidaySettings from './AdvancedHolidaySettings'
import { ReminderSettings } from './ReminderSettings'

interface SettingsMainProps {
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

const SettingsMain: React.FC<SettingsMainProps> = ({
  businessSettings,
  setBusinessSettings,
  setActiveTab,
  setActiveView
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">設定</h2>
      
      {/* プラン管理セクション */}
      <ErrorBoundary componentName="プラン管理">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Crown className="w-5 h-5 mr-2 text-purple-600" />
            プラン管理
          </h3>
          <PlanBadge 
            variant="full" 
            onUpgradeClick={() => setActiveView('upgrade')}
          />
        </div>
      </ErrorBoundary>
      
      {/* Advanced Holiday Settings */}
      <ErrorBoundary componentName="高度な休日設定">
        <div className="card">
          <AdvancedHolidaySettings />
        </div>
      </ErrorBoundary>

      {/* Reminder Settings */}
      <ErrorBoundary componentName="リマインダー設定">
        <div className="card">
          <ReminderSettings />
        </div>
      </ErrorBoundary>

      {/* Business Hours Settings */}
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
      
      {/* Other Settings */}
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

      {/* Admin Only Settings */}
      <ProtectedRoute requiredResource="*" requiredAction="admin" requireAuth={false}>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-red-600" />
            管理者限定設定
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">OpenAI設定</h4>
                <p className="text-xs text-gray-500">AI返信機能のためのOpenAI API設定</p>
              </div>
              <button 
                onClick={() => setActiveTab('openai-settings')}
                className="btn btn-secondary btn-sm"
              >
                設定
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </div>
  )
}

export default SettingsMain