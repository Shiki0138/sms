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
  const [holidaySettings, setHolidaySettings] = useState<HolidaySettings>({
    weeklyClosedDays: [1], // デフォルト：月曜日
    nthWeekdayRules: [], // デフォルト：なし
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
    loadHolidaySettings()
  }, [])

  useEffect(() => {
    generateHolidayPreviews()
  }, [holidaySettings, previewMonth])

  const loadHolidaySettings = async () => {
    setIsLoading(true)
    try {
      // デモデータで初期化
      setHolidaySettings({
        weeklyClosedDays: [1], // 月曜日
        nthWeekdayRules: [
          { nth: [2, 4], weekday: 2 } // 毎月第2・第4火曜日（例）
        ],
        specificHolidays: [
          '2025-01-01', // 元日
          '2025-12-31'  // 大晦日
        ]
      })
    } catch (error) {
      console.error('Holiday settings load error:', error)
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
    try {
      // デモ用の保存処理
      console.log('休日設定を保存:', holidaySettings)
      alert('休日設定を保存しました')
    } catch (error) {
      console.error('Save error:', error)
      alert('保存に失敗しました')
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
      return true
    }
    
    // 毎月第◯◯曜日チェック
    for (const rule of holidaySettings.nthWeekdayRules) {
      if (dayOfWeek === rule.weekday) {
        const weekOfMonth = getWeekOfMonth(date, { weekStartsOn: 1 })
        if (rule.nth.includes(weekOfMonth)) {
          return true
        }
      }
    }
    
    // 特定日チェック
    return holidaySettings.specificHolidays.includes(dateStr)
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">休日設定</h3>
          <p className="text-sm text-gray-600">定休日と特別休業日を設定できます</p>
        </div>
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
    </div>
  )
}

export default AdvancedHolidaySettings