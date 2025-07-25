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
  
  console.log('🔍 AdvancedHolidaySettings - Debug Info:')
  console.log('  - User:', user)
  console.log('  - TenantId:', tenantId)
  console.log('  - Email:', user?.email)
  console.log('  - Is greenroom51?', user?.email === 'greenroom51@gmail.com')
  
  // デバッグ用の状態
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [allSettings, setAllSettings] = useState<any[]>([])
  
  // デバッグ情報を取得
  useEffect(() => {
    const loadDebugInfo = async () => {
      try {
        // Supabase認証情報を取得
        const { data: { user: supabaseUser } } = await supabase.auth.getUser()
        
        // 全ての休日設定を取得
        const { data: settings, error } = await supabase
          .from('holiday_settings')
          .select('*')
          .order('tenantId')
        
        setDebugInfo({ supabaseUser })
        setAllSettings(settings || [])
      } catch (error) {
        console.error('Debug info load error:', error)
      }
    }
    
    loadDebugInfo()
  }, [])
  
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
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // tenantIdが設定されたら必ず読み込む（default-tenantも含む）
    if (tenantId) {
      console.log('🔄 TenantId changed, loading settings for:', tenantId)
      loadHolidaySettings()
    }
  }, [tenantId])

  useEffect(() => {
    generateHolidayPreviews()
  }, [holidaySettings, previewMonth])

  const loadHolidaySettings = async () => {
    setIsLoading(true)
    console.log('📥 Loading holiday settings...')
    console.log('  - tenantId:', tenantId)
    
    try {
      // Supabaseから休日設定を取得
      const { data: settings, error } = await supabase
        .from('holiday_settings')
        .select('*')
        .eq('tenantId', tenantId)
        .single()
      
      console.log('📥 Load result:', { settings, error })
      
      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          console.log('⚠️ No holiday settings found for tenant, using defaults')
          console.log(`テナントID「${tenantId}」の休日設定が見つかりません。新規作成してください。`)
          // デバッグ用アラート
          if (user?.email === 'greenroom51@gmail.com') {
            alert(`デバッグ: 休日設定が見つかりません\nテナントID: ${tenantId}\nこのIDで新規作成が必要です`)
          }
        } else {
          console.error('Error loading holiday settings:', error)
          toast.error('休日設定の読み込みに失敗しました。Supabaseの設定を確認してください。')
        }
      }
      
      if (settings) {
        console.log('✅ Holiday settings loaded successfully:', settings)
        setHolidaySettings({
          weeklyClosedDays: settings.weekly_closed_days || [],
          nthWeekdayRules: settings.nth_weekday_rules || [],
          specificHolidays: settings.specific_holidays || []
        })
        // デバッグ用アラート
        if (user?.email === 'greenroom51@gmail.com') {
          alert(`デバッグ: 休日設定を読み込みました\n定休日: ${(settings.weekly_closed_days || []).map(d => ['日','月','火','水','木','金','土'][d]).join(', ')}\n特別休日: ${(settings.specific_holidays || []).length}件`)
        }
      } else {
        // 設定が存在しない場合は空の状態を維持
        console.log('⚠️ No settings found, keeping empty state')
        setHolidaySettings({
          weeklyClosedDays: [],
          nthWeekdayRules: [],
          specificHolidays: []
        })
      }
    } catch (error) {
      console.error('Holiday settings load error:', error)
      toast.error('休日設定の読み込みに失敗しました')
      
      // エラー時も空の状態を維持
      setHolidaySettings({
        weeklyClosedDays: [],
        nthWeekdayRules: [],
        specificHolidays: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleWeeklyClosedDay = (dayIndex: number) => {
    setHolidaySettings(prev => ({
      ...prev,
      weeklyClosedDays: prev.weeklyClosedDays.includes(dayIndex)
        ? prev.weeklyClosedDays.filter(day => day !== dayIndex)
        : [...prev.weeklyClosedDays, dayIndex]
    }))
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

  const removeSpecificHoliday = (dateToRemove: string) => {
    setHolidaySettings(prev => ({
      ...prev,
      specificHolidays: prev.specificHolidays.filter(date => date !== dateToRemove)
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

  const removeNthWeekdayRule = (indexToRemove: number) => {
    setHolidaySettings(prev => ({
      ...prev,
      nthWeekdayRules: prev.nthWeekdayRules.filter((_, index) => index !== indexToRemove)
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

  const saveHolidaySettings = async () => {
    setIsSaving(true)
    console.log('🚀 Starting saveHolidaySettings...')
    console.log('  - tenantId:', tenantId)
    console.log('  - holidaySettings:', holidaySettings)
    
    try {
      // 認証状態を確認
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('📍 Current session:', session)
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError)
        toast.error('セッションエラー: ' + sessionError.message)
        return
      }
      
      if (!session) {
        console.error('❌ No active session')
        toast.error('ログインが必要です。再度ログインしてください。')
        // デモモードの場合は続行
        if (tenantId !== 'demo-user') {
          return
        }
      }
      
      // Supabase接続テスト
      const { data: testData, error: testError } = await supabase
        .from('holiday_settings')
        .select('count')
        .limit(1)
      
      if (testError) {
        console.error('❌ Supabase connection test failed:', testError)
        if (testError.message.includes('relation') && testError.message.includes('does not exist')) {
          toast.error('holiday_settingsテーブルが存在しません。まずSupabaseでテーブルを作成してください。')
          alert('❌ エラー: holiday_settingsテーブルが存在しません\n\nSupabase Dashboard > SQL Editor で以下を実行してください:\n\nCREATE TABLE holiday_settings (\n  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,\n  "tenantId" TEXT NOT NULL UNIQUE,\n  weekly_closed_days INTEGER[] DEFAULT \'{}\',\n  nth_weekday_rules JSONB DEFAULT \'[]\',\n  specific_holidays TEXT[] DEFAULT \'{}\',\n  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,\n  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n);')
          return
        } else if (testError.message.includes('No authorization token was found')) {
          console.error('❌ Authorization error - trying without auth')
          // 認証エラーの場合は、デモモードとして続行
        } else {
          toast.error('Supabase接続エラー: ' + testError.message)
          return
        }
      }
      
      console.log('✅ Supabase connection test passed')
      
      // 既存の設定を確認
      const { data: existing, error: checkError } = await supabase
        .from('holiday_settings')
        .select('id')
        .eq('tenantId', tenantId)
        .single()
      
      console.log('🔍 Existing check result:', { existing, checkError })
      
      const settingsData = {
        tenantId: tenantId,
        weekly_closed_days: holidaySettings.weeklyClosedDays,
        nth_weekday_rules: holidaySettings.nthWeekdayRules,
        specific_holidays: holidaySettings.specificHolidays,
        updatedAt: new Date().toISOString()
      }
      
      let result
      if (existing && !checkError) {
        // 更新
        result = await supabase
          .from('holiday_settings')
          .update(settingsData)
          .eq('tenantId', tenantId)
          .select()
      } else {
        // 新規作成
        result = await supabase
          .from('holiday_settings')
          .insert({
            ...settingsData,
            createdAt: new Date().toISOString()
          })
          .select()
      }
      
      console.log('💾 Save operation result:', result)
      
      if (result.error) {
        console.error('❌ Supabase save error:', result.error)
        
        // テーブルが存在しない場合の詳細なエラーメッセージ
        if (result.error.message.includes('relation') && result.error.message.includes('does not exist')) {
          toast.error('holiday_settingsテーブルが存在しません。Supabaseでテーブルを作成してください。')
          console.error('Please run the migration script in Supabase SQL Editor:', 
            '/supabase/migrations/create_holiday_settings_table.sql')
        } else {
          toast.error(`保存に失敗しました: ${result.error.message}`)
        }
        return
      }
      
      console.log('✅ Save successful! Saved data:', result.data)
      
      toast.success(`休日設定を保存しました (テナントID: ${tenantId})`)
      console.log('✅ Holiday settings saved successfully')
      console.log('  - TenantId:', tenantId)
      console.log('  - Settings:', settingsData)
      console.log('  - Response data:', result.data)
      
      // デバッグ用アラート
      if (user?.email === 'greenroom51@gmail.com') {
        alert(`デバッグ: 保存成功\nテナントID: ${tenantId}\n定休日: ${settingsData.weekly_closed_days.map(d => ['日','月','火','水','木','金','土'][d]).join(', ')}\n特別休日: ${settingsData.specific_holidays.length}件`)
      }
      
      // 保存後に再読み込みして同期（少し遅延を入れる）
      setTimeout(async () => {
        console.log('🔄 Reloading settings after save...')
        await loadHolidaySettings()
      }, 500)
    } catch (error) {
      console.error('Save error:', error)
      toast.error('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const generateHolidayPreviews = () => {
    const previews: HolidayPreview[] = []
    const startDate = startOfMonth(previewMonth)
    const endDate = endOfMonth(addMonths(previewMonth, 2)) // 3ヶ月分プレビュー
    const allDays = eachDayOfInterval({ start: startDate, end: endDate })

    // 定休日（毎週）
    allDays.forEach(day => {
      const dayOfWeek = getDay(day)
      if (holidaySettings.weeklyClosedDays.includes(dayOfWeek)) {
        const dayName = ['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]
        previews.push({
          date: format(day, 'yyyy-MM-dd'),
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

  // 日付が休日かどうかをチェックする関数（他のコンポーネントで使用可能）
  const isHoliday = (date: Date): boolean => {
    const dayOfWeek = getDay(date)
    const dateStr = format(date, 'yyyy-MM-dd')
    
    // 毎週の定休日チェック
    if (holidaySettings.weeklyClosedDays.includes(dayOfWeek)) {
      console.log(`📅 ${dateStr} is weekly holiday (day: ${dayOfWeek})`)
      return true
    }
    
    // 毎月第◯◯曜日チェック
    for (const rule of holidaySettings.nthWeekdayRules) {
      if (dayOfWeek === rule.weekday) {
        const weekOfMonth = getWeekOfMonth(date, { weekStartsOn: 1 })
        if (rule.nth.includes(weekOfMonth)) {
          console.log(`📅 ${dateStr} is nth weekday holiday (week: ${weekOfMonth}, day: ${dayOfWeek})`)
          return true
        }
      }
    }
    
    // 特定日チェック
    if (holidaySettings.specificHolidays.includes(dateStr)) {
      console.log(`📅 ${dateStr} is specific holiday`)
      return true
    }
    
    return false
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
          
          {/* 設定確認ボタン */}
          <button
            onClick={async () => {
              const currentTenantId = await getTenantId()
              
              // 全てのテナントIDのデータを確認（デバッグ用）
              const { data: allSettings } = await supabase
                .from('holiday_settings')
                .select('*')
              
              console.log('All holiday settings:', allSettings)
              
              const { data: settings } = await supabase
                .from('holiday_settings')
                .select('*')
                .eq('tenantId', currentTenantId)
                .single()
              
              if (settings) {
                alert(`現在の設定:\n\nテナントID: ${currentTenantId}\n定休日: ${(settings.weekly_closed_days || []).map(d => ['日','月','火','水','木','金','土'][d]).join(', ')}\n第〇曜日: ${(settings.nth_weekday_rules || []).length}件\n特別休日: ${(settings.specific_holidays || []).length}件\n\n保存日時: ${new Date(settings.updatedAt).toLocaleString()}`)
              } else {
                // 認証ユーザーのIDを取得して表示
                const { data: { user } } = await supabase.auth.getUser()
                alert(`設定が見つかりません\n\n現在のテナントID: ${currentTenantId}\nSupabaseユーザーID: ${user?.id}\n\nSupabaseで以下のSQLを実行してください:\n\nINSERT INTO "holiday_settings" ("tenantId", weekly_closed_days)\nVALUES ('${user?.id || currentTenantId}', ARRAY[4])\nON CONFLICT ("tenantId") DO UPDATE SET weekly_closed_days = ARRAY[4];`)
              }
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            設定確認
          </button>
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

          {/* 毎月第◯◯曜日設定 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h5 className="text-sm font-medium text-gray-900 mb-3">毎月第◯◯曜日設定</h5>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-2">第何週目を選択</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(week => (
                    <label key={week} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newNthWeekdayRule.nth.includes(week)}
                        onChange={() => toggleNthWeek(week)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-1"
                      />
                      <span className="text-xs">第{week}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <select
                  value={newNthWeekdayRule.weekday}
                  onChange={(e) => setNewNthWeekdayRule(prev => ({ ...prev, weekday: parseInt(e.target.value) }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'].map((day, index) => (
                    <option key={index} value={index}>{day}</option>
                  ))}
                </select>
                <button
                  onClick={addNthWeekdayRule}
                  disabled={newNthWeekdayRule.nth.length === 0}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 設定済み毎月第◯◯曜日一覧 */}
          {holidaySettings.nthWeekdayRules.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">設定済み定期休日</h5>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {holidaySettings.nthWeekdayRules.map((rule, index) => {
                  const dayName = ['日', '月', '火', '水', '木', '金', '土'][rule.weekday]
                  const nthText = rule.nth.map(n => `第${n}`).join('・')
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                      <span className="text-sm text-green-900">
                        毎月{nthText}{dayName}曜日
                      </span>
                      <button
                        onClick={() => removeNthWeekdayRule(index)}
                        className="text-green-500 hover:text-green-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 特別休業日追加 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h5 className="text-sm font-medium text-gray-900 mb-3">特別休業日追加</h5>
            
            <div className="flex space-x-2">
              <input
                type="date"
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addSpecificHoliday}
                disabled={!newHolidayDate}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 設定された特別休業日一覧 */}
          {holidaySettings.specificHolidays.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">設定済み特別休業日</h5>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {holidaySettings.specificHolidays.map((date) => (
                  <div key={date} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded">
                    <span className="text-sm text-red-900">
                      {format(new Date(date), 'yyyy年M月d日(E)', { locale: ja })}
                    </span>
                    <button
                      onClick={() => removeSpecificHoliday(date)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
              <li>• <strong>毎月第◯◯曜日</strong>: 第1・第3月曜日など不定期な定休日を設定</li>
              <li>• <strong>特別休業日</strong>: 年末年始、研修日、臨時休業などの個別日程を設定</li>
              <li>• 設定した休日は予約カレンダーに自動的に反映されます</li>
              <li>• 青色は毎週定休日、緑色は第◯曜日定休日、赤色は特別休業日を表示</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* デバッグ情報 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8">
        <h3 className="text-lg font-bold text-yellow-900 mb-4">🔍 デバッグ情報</h3>
        
        <div className="space-y-2 text-sm">
          <div className="bg-white p-3 rounded border border-yellow-300">
            <p className="font-semibold">現在のユーザー情報:</p>
            <p>User ID: <code className="bg-gray-100 px-1">{user?.id || 'なし'}</code></p>
            <p>Email: <code className="bg-gray-100 px-1">{user?.email || 'なし'}</code></p>
            <p>Role: <code className="bg-gray-100 px-1">{user?.role || 'なし'}</code></p>
            <p>Username: <code className="bg-gray-100 px-1">{user?.username || 'なし'}</code></p>
            {user?.email === 'greenroom51@gmail.com' && (
              <div className="mt-2 p-2 bg-green-100 rounded">
                <p className="text-green-800 font-semibold">✓ greenroom51@gmail.com として認識されています</p>
              </div>
            )}
          </div>

          {debugInfo?.supabaseUser && (
            <div className="bg-white p-3 rounded border border-yellow-300">
              <p className="font-semibold">Supabase認証情報:</p>
              <p>Supabase User ID: <code className="bg-gray-100 px-1">{debugInfo.supabaseUser.id}</code></p>
              <p>Supabase Email: <code className="bg-gray-100 px-1">{debugInfo.supabaseUser.email}</code></p>
              {debugInfo.supabaseUser.email === 'greenroom51@gmail.com' && (
                <div className="mt-2 p-2 bg-blue-100 rounded">
                  <p className="text-blue-800 text-xs">
                    <strong>重要:</strong> 上記のSupabase User IDをtenantIdとして使用してください
                  </p>
                  <p className="text-blue-800 text-xs mt-1">
                    あなたのSupabase User ID: <strong>{debugInfo.supabaseUser.id}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

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
        
        <div className="flex space-x-2 mt-4">
          <button 
            onClick={() => {
              const loadDebugInfo = async () => {
                try {
                  const { data: { user: supabaseUser } } = await supabase.auth.getUser()
                  console.log('🔍 Debug reload - Supabase user:', supabaseUser)
                  const { data: settings } = await supabase
                    .from('holiday_settings')
                    .select('*')
                    .order('tenantId')
                  
                  setDebugInfo({ supabaseUser })
                  setAllSettings(settings || [])
                } catch (error) {
                  console.error('Debug info load error:', error)
                }
              }
              loadDebugInfo()
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
          >
            再読み込み
          </button>
          
          <button 
            onClick={async () => {
              try {
                console.log('🧪 Testing direct Supabase save...')
                const testData = {
                  tenantId: tenantId,
                  weekly_closed_days: [1, 2], // 月火
                  nth_weekday_rules: [],
                  specific_holidays: ['2024-07-25'],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
                
                const { data, error } = await supabase
                  .from('holiday_settings')
                  .upsert(testData, { onConflict: 'tenantId' })
                  .select()
                
                if (error) {
                  console.error('❌ Test save failed:', error)
                  alert('テスト保存失敗: ' + error.message)
                } else {
                  console.log('✅ Test save successful:', data)
                  alert('✅ テスト保存成功!\nデータ: ' + JSON.stringify(data, null, 2))
                  // 設定を再読み込み
                  await loadHolidaySettings()
                }
              } catch (error: any) {
                console.error('Test save error:', error)
                alert('テストエラー: ' + error.message)
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            テスト保存
          </button>
          
          {debugInfo?.supabaseUser?.email === 'greenroom51@gmail.com' && (
            <button 
              onClick={async () => {
                if (confirm('既存のデータのtenantIDを修正しますか？')) {
                  try {
                    for (const setting of allSettings) {
                      if (setting.tenantId !== debugInfo.supabaseUser.id) {
                        const { error } = await supabase
                          .from('holiday_settings')
                          .update({ tenantId: debugInfo.supabaseUser.id })
                          .eq('id', setting.id)
                        
                        if (error) {
                          console.error('Update error:', error)
                        }
                      }
                    }
                    toast.success('修正しました。再読み込みしてください。')
                    // 再読み込み
                    const { data: settings } = await supabase
                      .from('holiday_settings')
                      .select('*')
                      .order('tenantId')
                    setAllSettings(settings || [])
                  } catch (error) {
                    console.error('Fix error:', error)
                    toast.error('修正に失敗しました')
                  }
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              tenantIDを修正
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdvancedHolidaySettings