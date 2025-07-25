import React, { useState, useEffect } from 'react'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle,
  Check,
  X
} from 'lucide-react'
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, getWeekOfMonth } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase-client'
import toast from 'react-hot-toast'
import DebugAuthStatus from './DebugAuthStatus'

interface NthWeekdayRule {
  nth: number[] // 第何週 [1, 2, 3, 4, 5]
  weekday: number // 曜日 0=日, 1=月, 2=火...
}

interface HolidaySettings {
  weeklyClosedDays: number[] // 0=日, 1=月, 2=火...
  nthWeekdayRules: NthWeekdayRule[] // 毎月第◯◯曜日
  specificHolidays: string[] // YYYY-MM-DD format
}

interface HolidayPreview {
  date: string
  description: string
  type: 'weekly' | 'nthWeekday' | 'specific'
}

const AdvancedHolidaySettings: React.FC = () => {
  const { user } = useAuth()
  const [tenantId, setTenantId] = useState<string>('default-tenant')
  
  // 統一されたテナントID取得関数を使用
  useEffect(() => {
    const updateTenantId = async () => {
      const { getUnifiedTenantId } = await import('../../lib/tenant-utils')
      const id = await getUnifiedTenantId(user)
      setTenantId(id)
    }
    
    updateTenantId()
  }, [user])
  
  // getTenantId関数を定義（既存のコードとの互換性のため）
  const getTenantId = async () => {
    const { getUnifiedTenantId } = await import('../../lib/tenant-utils')
    return getUnifiedTenantId(user)
  }
  
  const [holidaySettings, setHolidaySettings] = useState<HolidaySettings>({
    weeklyClosedDays: [], // デフォルト：なし（Supabaseから読み込む）
    nthWeekdayRules: [],
    specificHolidays: []
  })
  const [previewMonth, setPreviewMonth] = useState(new Date())
  const [holidayPreviews, setHolidayPreviews] = useState<HolidayPreview[]>([])
  const [newHolidayDate, setNewHolidayDate] = useState('')
  const [newHolidayDescription, setNewHolidayDescription] = useState('')
  const [newNthWeekdayRule, setNewNthWeekdayRule] = useState<{nth: number[], weekday: number}>({
    nth: [],
    weekday: 1
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // 初期化時に設定を読み込み
  useEffect(() => {
    if (tenantId && tenantId !== 'default-tenant') {
      loadHolidaySettings()
    }
  }, [tenantId])
  
  // プレビュー生成
  useEffect(() => {
    generateHolidayPreviews()
  }, [holidaySettings, previewMonth])

  // ===== 統一システムを使用した読み込み・保存処理 =====
  
  const loadHolidaySettings = async () => {
    setIsLoading(true)
    console.log('📥 Loading holiday settings using UNIFIED system...')
    console.log('  - tenantId:', tenantId)
    
    try {
      // 統一された設定管理システムを使用
      const { loadHolidaySettings: loadFromManager } = await import('../../lib/settings-manager')
      const settings = await loadFromManager(user)
      
      console.log('📥 UNIFIED Load result:', settings)
      
      if (!settings) {
        console.log('⚠️ No holiday settings found, using defaults')
        if (user?.email === 'greenroom51@gmail.com') {
          alert(`デバッグ: 休日設定が見つかりません\nテナントID: ${tenantId}\n新規作成が必要です`)
        }
        setHolidaySettings({
          weeklyClosedDays: [],
          nthWeekdayRules: [],
          specificHolidays: []
        })
        return
      }
      
      // 統一システムから読み込んだ設定を適用
      console.log('✅ Holiday settings loaded via UNIFIED system:', settings)
      console.log('  🔍 weeklyClosedDays from UNIFIED system:', settings.weeklyClosedDays)
      console.log('  🔍 Converted to days:', settings.weeklyClosedDays?.map((d: number) => `${d}(${['日','月','火','水','木','金','土'][d]})`).join(', '))
      
      setHolidaySettings({
        weeklyClosedDays: settings.weeklyClosedDays || [],
        nthWeekdayRules: settings.nthWeekdayRules || [],
        specificHolidays: settings.specificHolidays || []
      })
      
      if (user?.email === 'greenroom51@gmail.com') {
        alert(`デバッグ: UNIFIEDシステムで読み込み\n定休日: ${settings.weeklyClosedDays?.map((d: number) => ['日','月','火','水','木','金','土'][d]).join(', ')}\n特別休日: ${settings.specificHolidays?.length || 0}件`)
      }
    } catch (error) {
      console.error('UNIFIED Holiday settings load error:', error)
      toast.error('休日設定の読み込みに失敗しました')
      
      setHolidaySettings({
        weeklyClosedDays: [],
        nthWeekdayRules: [],
        specificHolidays: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveHolidaySettings = async () => {
    setIsSaving(true)
    console.log('🚀 Starting UNIFIED saveHolidaySettings...')
    console.log('  - tenantId:', tenantId)
    console.log('  - holidaySettings:', holidaySettings)
    console.log('  - Using settings-manager.ts for unified save')
    
    try {
      // 統一された設定管理システムを使用
      const { saveHolidaySettings: saveToManager } = await import('../../lib/settings-manager')
      
      const result = await saveToManager(user, {
        weeklyClosedDays: holidaySettings.weeklyClosedDays,
        nthWeekdayRules: holidaySettings.nthWeekdayRules,
        specificHolidays: holidaySettings.specificHolidays
      })
      
      if (result) {
        console.log('✅ 統一設定管理システムで保存成功')
        toast.success(`休日設定を保存しました`)
        
        // デバッグ用アラート
        if (user?.email === 'greenroom51@gmail.com') {
          alert(`デバッグ: 保存成功\n定休日: ${holidaySettings.weeklyClosedDays.map(d => ['日','月','火','水','木','金','土'][d]).join(', ')}`)
        }
        
        // App.tsxのSupabase監視機能が自動的に更新します
        console.log('✅ 保存完了。App.tsxのSupabaseリアルタイム監視が自動更新します。')
      } else {
        console.error('❌ 統一設定管理システムで保存失敗')
        toast.error('保存に失敗しました')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  // ===== UI操作ハンドラー =====
  
  const toggleWeeklyClosedDay = (dayIndex: number) => {
    console.log(`🔄 Toggling weekday: ${dayIndex} (${['日','月','火','水','木','金','土'][dayIndex]}曜日)`)
    console.log('  Current weeklyClosedDays:', holidaySettings.weeklyClosedDays)
    
    setHolidaySettings(prev => {
      const newWeeklyClosedDays = prev.weeklyClosedDays.includes(dayIndex)
        ? prev.weeklyClosedDays.filter(day => day !== dayIndex)
        : [...prev.weeklyClosedDays, dayIndex]
      
      console.log('  New weeklyClosedDays:', newWeeklyClosedDays)
      console.log(`  ✅ UI状態を更新: ${newWeeklyClosedDays.map(d => ['日','月','火','水','木','金','土'][d]).join(', ')}`)
      
      return {
        ...prev,
        weeklyClosedDays: newWeeklyClosedDays
      }
    })
  }

  const addSpecificHoliday = () => {
    if (!newHolidayDate) return
    
    setHolidaySettings(prev => ({
      ...prev,
      specificHolidays: [...prev.specificHolidays, newHolidayDate].sort()
    }))
    setNewHolidayDate('')
    setNewHolidayDescription('')
  }

  const removeSpecificHoliday = (date: string) => {
    setHolidaySettings(prev => ({
      ...prev,
      specificHolidays: prev.specificHolidays.filter(d => d !== date)
    }))
  }

  const toggleNthWeek = (week: number) => {
    setNewNthWeekdayRule(prev => ({
      ...prev,
      nth: prev.nth.includes(week)
        ? prev.nth.filter(n => n !== week)
        : [...prev.nth, week].sort()
    }))
  }

  const addNthWeekdayRule = () => {
    if (newNthWeekdayRule.nth.length === 0) return
    
    setHolidaySettings(prev => ({
      ...prev,
      nthWeekdayRules: [...prev.nthWeekdayRules, { ...newNthWeekdayRule }]
    }))
    
    setNewNthWeekdayRule({ nth: [], weekday: 1 })
  }

  const removeNthWeekdayRule = (index: number) => {
    setHolidaySettings(prev => ({
      ...prev,
      nthWeekdayRules: prev.nthWeekdayRules.filter((_, i) => i !== index)
    }))
  }

  const generateHolidayPreviews = () => {
    console.log('📅 Generating holiday previews...')
    console.log('  weeklyClosedDays:', holidaySettings.weeklyClosedDays)
    
    const previews: HolidayPreview[] = []
    const startDate = startOfMonth(previewMonth)
    const endDate = endOfMonth(addMonths(previewMonth, 2)) // 3ヶ月分プレビュー
    const allDays = eachDayOfInterval({ start: startDate, end: endDate })

    // 定休日（毎週）
    allDays.forEach(day => {
      const dayOfWeek = getDay(day)
      if (holidaySettings.weeklyClosedDays.includes(dayOfWeek)) {
        const dayName = ['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]
        const dateStr = format(day, 'yyyy-MM-dd')
        console.log(`  ✅ ${dateStr} (${dayName}曜日) is holiday - dayOfWeek: ${dayOfWeek}`)
        previews.push({
          date: dateStr,
          description: `定休日（${dayName}曜日）`,
          type: 'weekly'
        })
      }
    })

    // 毎月第◯◯曜日
    holidaySettings.nthWeekdayRules.forEach(rule => {
      const dayName = ['日', '月', '火', '水', '木', '金', '土'][rule.weekday]
      
      // 各月をチェック
      for (let monthOffset = 0; monthOffset <= 2; monthOffset++) {
        const currentMonth = addMonths(previewMonth, monthOffset)
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(currentMonth)
        const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

        monthDays.forEach(day => {
          const dayOfWeek = getDay(day)
          if (dayOfWeek === rule.weekday) {
            const weekOfMonth = getWeekOfMonth(day, { weekStartsOn: 1 })
            if (rule.nth.includes(weekOfMonth)) {
              const nthText = rule.nth.map(n => `第${n}`).join('・')
              previews.push({
                date: format(day, 'yyyy-MM-dd'),
                description: `定休日（${nthText}${dayName}曜日）`,
                type: 'nthWeekday'
              })
            }
          }
        })
      }
    })

    // 特定の休日
    holidaySettings.specificHolidays.forEach(holidayDate => {
      const date = new Date(holidayDate)
      if (date >= startDate && date <= endDate) {
        previews.push({
          date: holidayDate,
          description: '特別休業日',
          type: 'specific'
        })
      }
    })

    setHolidayPreviews(previews.sort((a, b) => a.date.localeCompare(b.date)))
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
      {/* 認証状態デバッグ表示 */}
      <DebugAuthStatus />
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">休日設定</h3>
          <p className="text-sm text-gray-600">定休日と特別休業日を設定できます</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={saveHolidaySettings}
            disabled={isSaving}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>保存</span>
          </button>
          
          {/* 緊急修正ボタン */}
          <button
            onClick={async () => {
              if (!confirm('緊急修正: 定休日を月曜日（1）に変更しますか？')) return
              
              try {
                const currentTenantId = await getTenantId()
                console.log('🚑 緊急修正: 月曜日に変更中...', currentTenantId)
                
                const { data, error } = await supabase
                  .from('holiday_settings')
                  .update({
                    weekly_closed_days: [1], // 月曜日に修正
                    updatedAt: new Date().toISOString()
                  })
                  .eq('tenantId', currentTenantId)
                  .select()
                
                if (error) {
                  console.error('修正エラー:', error)
                  alert('修正に失敗しました: ' + error.message)
                } else {
                  console.log('✅ 修正成功:', data)
                  alert('✅ 定休日を月曜日に修正しました！\nページをリロードして確認してください。')
                  
                  // 設定を再読み込み
                  await loadHolidaySettings()
                }
              } catch (error) {
                console.error('修正エラー:', error)
                alert('修正中にエラーが発生しました')
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-bold"
          >
            🚑 緊急修正(月曜日に変更)
          </button>
        </div>
      </div>
      
      {/* 緊急修正アラート */}
      <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="text-red-500 text-2xl">🚑</div>
          <div>
            <h4 className="text-red-800 font-bold text-lg mb-2">緊急修正が必要です</h4>
            <p className="text-red-700 text-sm mb-3">
              現在、UIでは月曜日にチェックが入っていますが、データベースには木曜日(4)が保存されています。<br/>
              そのため予約カレンダーでは木曜日が休日として表示されています。
            </p>
            <p className="text-red-700 text-sm font-bold">
              上の「🚑 緊急修正(月曜日に変更)」ボタンをクリックして修正してください。
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 定休日設定 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4">定休日設定</h4>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600">毎週の定休日を選択してください</p>
            
            <div className="grid grid-cols-4 gap-3">
              {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                <label key={index} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={holidaySettings.weeklyClosedDays.includes(index)}
                    onChange={() => toggleWeeklyClosedDay(index)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">{day}曜日</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 休日プレビュー */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">休日プレビュー</h4>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewMonth(addMonths(previewMonth, -1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 rotate-90" />
              </button>
              <span className="text-sm font-medium">
                {format(previewMonth, 'yyyy年M月', { locale: ja })}
              </span>
              <button
                onClick={() => setPreviewMonth(addMonths(previewMonth, 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 -rotate-90" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-xs text-gray-600">
              今後3ヶ月の休日予定（{holidayPreviews.length}日）
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {holidayPreviews.slice(0, 20).map((preview, index) => (
                <div key={index} className={`flex items-center justify-between p-2 rounded border ${
                  preview.type === 'weekly' 
                    ? 'bg-blue-50 border-blue-200' 
                    : preview.type === 'nthWeekday'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                }`}>
                  <div>
                    <div className={`text-sm font-medium ${
                      preview.type === 'weekly' ? 'text-blue-900' : 
                      preview.type === 'nthWeekday' ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {format(new Date(preview.date), 'M月d日(E)', { locale: ja })}
                    </div>
                    <div className={`text-xs ${
                      preview.type === 'weekly' ? 'text-blue-700' : 
                      preview.type === 'nthWeekday' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {preview.description}
                    </div>
                  </div>
                  <CalendarIcon className={`w-4 h-4 ${
                    preview.type === 'weekly' ? 'text-blue-500' : 
                    preview.type === 'nthWeekday' ? 'text-green-500' : 'text-red-500'
                  }`} />
                </div>
              ))}
              
              {holidayPreviews.length > 20 && (
                <div className="text-center text-xs text-gray-500 py-2">
                  他 {holidayPreviews.length - 20} 日...
                </div>
              )}
              
              {holidayPreviews.length === 0 && (
                <div className="text-center text-sm text-gray-500 py-4">
                  設定された休日はありません
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 使用方法 */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="text-sm font-medium text-blue-900 mb-1">使用方法</h5>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• <strong>定休日</strong>: 毎週決まった曜日の休業日を設定</li>
              <li>• 設定した休日は予約カレンダーに自動的に反映されます</li>
              <li>• 青色は毎週定休日を表示</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedHolidaySettings