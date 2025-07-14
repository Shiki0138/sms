import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Save, 
  Plus, 
  Trash2,
  Info,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, getWeekOfMonth } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { 
  BusinessHours, 
  RegularHoliday, 
  SpecialHoliday, 
  BookingSettings,
  BusinessHoursSettings
} from '@/types/businessHours';

const daysOfWeek = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
const weekNumbers = ['第1', '第2', '第3', '第4', '第5'];

// 年末年始・GWなどのテンプレート
const holidayTemplates = [
  { name: '年末年始', startDate: '12-29', endDate: '01-03', description: '年末年始休業' },
  { name: 'ゴールデンウィーク', startDate: '05-03', endDate: '05-05', description: 'GW休業' },
  { name: 'お盆休み', startDate: '08-13', endDate: '08-15', description: 'お盆休業' },
  { name: '夏季休業', startDate: '08-11', endDate: '08-16', description: '夏季休業' },
];

export default function EnhancedBusinessHoursSettings() {
  const [settings, setSettings] = useState<BusinessHoursSettings>({
    businessHours: [
      { dayOfWeek: 0, isOpen: false, openTime: '10:00', closeTime: '19:00' },
      { dayOfWeek: 1, isOpen: true, openTime: '10:00', closeTime: '19:00' },
      { dayOfWeek: 2, isOpen: true, openTime: '10:00', closeTime: '19:00' },
      { dayOfWeek: 3, isOpen: true, openTime: '10:00', closeTime: '19:00' },
      { dayOfWeek: 4, isOpen: true, openTime: '10:00', closeTime: '19:00' },
      { dayOfWeek: 5, isOpen: true, openTime: '10:00', closeTime: '19:00' },
      { dayOfWeek: 6, isOpen: true, openTime: '10:00', closeTime: '19:00' },
    ],
    weeklyClosedDays: [0], // デフォルト：日曜日
    regularHolidays: [],
    specialHolidays: [],
    bookingSettings: {
      allowOutOfHoursBooking: false,
      outOfHoursWarningMessage: '営業時間外のご予約です。確認後、スタッフから連絡させていただく場合があります。',
      allowHolidayBooking: false,
      holidayWarningMessage: '休業日のご予約です。特別に対応可能か確認後、ご連絡させていただきます。',
    }
  });

  const [activeTab, setActiveTab] = useState<'hours' | 'holidays' | 'special' | 'settings'>('hours');
  const [isLoading, setIsLoading] = useState(false);
  const [previewMonth, setPreviewMonth] = useState(new Date());

  // 営業時間を更新
  const updateBusinessHours = (dayOfWeek: number, field: keyof BusinessHours, value: any) => {
    setSettings(prev => ({
      ...prev,
      businessHours: prev.businessHours.map(hours =>
        hours.dayOfWeek === dayOfWeek ? { ...hours, [field]: value } : hours
      )
    }));
  };

  // 定休日をトグル
  const toggleWeeklyClosedDay = (dayOfWeek: number) => {
    setSettings(prev => ({
      ...prev,
      weeklyClosedDays: prev.weeklyClosedDays.includes(dayOfWeek)
        ? prev.weeklyClosedDays.filter(d => d !== dayOfWeek)
        : [...prev.weeklyClosedDays, dayOfWeek].sort()
    }));
  };

  // 定期休日を追加
  const addRegularHoliday = () => {
    const newHoliday: RegularHoliday = {
      id: Date.now().toString(),
      dayOfWeek: 1,
      weekNumbers: [],
      isActive: true
    };
    setSettings(prev => ({
      ...prev,
      regularHolidays: [...prev.regularHolidays, newHoliday]
    }));
  };

  // 定期休日を更新
  const updateRegularHoliday = (id: string, field: keyof RegularHoliday, value: any) => {
    setSettings(prev => ({
      ...prev,
      regularHolidays: prev.regularHolidays.map(holiday =>
        holiday.id === id ? { ...holiday, [field]: value } : holiday
      )
    }));
  };

  // 定期休日を削除
  const removeRegularHoliday = (id: string) => {
    setSettings(prev => ({
      ...prev,
      regularHolidays: prev.regularHolidays.filter(h => h.id !== id)
    }));
  };

  // 特別休日を追加
  const addSpecialHoliday = (template?: typeof holidayTemplates[0]) => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    
    const newHoliday: SpecialHoliday = {
      id: Date.now().toString(),
      name: template?.name || '',
      startDate: template ? `${template.startDate.includes('01-') ? nextYear : currentYear}-${template.startDate}` : '',
      endDate: template ? `${template.endDate.includes('01-') ? nextYear : currentYear}-${template.endDate}` : '',
      description: template?.description || '',
      allowBooking: false
    };
    
    setSettings(prev => ({
      ...prev,
      specialHolidays: [...prev.specialHolidays, newHoliday]
    }));
  };

  // 特別休日を更新
  const updateSpecialHoliday = (id: string, field: keyof SpecialHoliday, value: any) => {
    setSettings(prev => ({
      ...prev,
      specialHolidays: prev.specialHolidays.map(holiday =>
        holiday.id === id ? { ...holiday, [field]: value } : holiday
      )
    }));
  };

  // 特別休日を削除
  const removeSpecialHoliday = (id: string) => {
    setSettings(prev => ({
      ...prev,
      specialHolidays: prev.specialHolidays.filter(h => h.id !== id)
    }));
  };

  // 予約設定を更新
  const updateBookingSettings = (field: keyof BookingSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      bookingSettings: {
        ...prev.bookingSettings,
        [field]: value
      }
    }));
  };

  // 設定を保存
  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // APIに保存（実装時に追加）
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('営業時間・休日設定を保存しました');
    } catch (error) {
      toast.error('設定の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 休日プレビューを生成
  const generateHolidayPreviews = () => {
    const previews: Array<{ date: string; description: string; type: string }> = [];
    const startDate = startOfMonth(previewMonth);
    const endDate = endOfMonth(addMonths(previewMonth, 2));
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    allDays.forEach(day => {
      const dayOfWeek = getDay(day);
      const dateStr = format(day, 'yyyy-MM-dd');

      // 毎週の定休日
      if (settings.weeklyClosedDays.includes(dayOfWeek)) {
        previews.push({
          date: dateStr,
          description: `定休日（毎週${daysOfWeek[dayOfWeek].replace('曜日', '')}曜）`,
          type: 'weekly'
        });
      }

      // 定期休日（第N○曜日）
      settings.regularHolidays.forEach(holiday => {
        if (holiday.isActive && dayOfWeek === holiday.dayOfWeek) {
          const weekOfMonth = getWeekOfMonth(day, { weekStartsOn: 1 });
          if (holiday.weekNumbers.includes(weekOfMonth)) {
            const nthText = holiday.weekNumbers.map(n => `第${n}`).join('・');
            previews.push({
              date: dateStr,
              description: `定休日（${nthText}${daysOfWeek[holiday.dayOfWeek].replace('曜日', '')}曜）`,
              type: 'regular'
            });
          }
        }
      });

      // 特別休日
      settings.specialHolidays.forEach(holiday => {
        if (dateStr >= holiday.startDate && dateStr <= holiday.endDate) {
          previews.push({
            date: dateStr,
            description: holiday.name || '特別休業日',
            type: 'special'
          });
        }
      });
    });

    return previews.filter((preview, index, self) =>
      index === self.findIndex(p => p.date === preview.date)
    ).sort((a, b) => a.date.localeCompare(b.date));
  };

  const holidayPreviews = generateHolidayPreviews();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center">
            <Clock className="mr-2" />
            営業時間・休日設定
          </h2>
          <p className="text-gray-600 mt-1">美容室の営業時間と休日を詳細に設定できます</p>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('hours')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'hours'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              営業時間
            </button>
            <button
              onClick={() => setActiveTab('holidays')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'holidays'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              定期休日
            </button>
            <button
              onClick={() => setActiveTab('special')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'special'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              特別休日
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              予約設定
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* 営業時間タブ */}
          {activeTab === 'hours' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">曜日別営業時間</h3>
                <div className="space-y-3">
                  {settings.businessHours.map((hours) => (
                    <div key={hours.dayOfWeek} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                      <div className="w-24">
                        <span className="font-medium">{daysOfWeek[hours.dayOfWeek]}</span>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={hours.isOpen}
                          onChange={(e) => updateBusinessHours(hours.dayOfWeek, 'isOpen', e.target.checked)}
                          className="mr-2 rounded border-gray-300"
                        />
                        営業
                      </label>
                      {hours.isOpen && (
                        <>
                          <input
                            type="time"
                            value={hours.openTime}
                            onChange={(e) => updateBusinessHours(hours.dayOfWeek, 'openTime', e.target.value)}
                            className="px-3 py-1 border rounded-md"
                          />
                          <span>〜</span>
                          <input
                            type="time"
                            value={hours.closeTime}
                            onChange={(e) => updateBusinessHours(hours.dayOfWeek, 'closeTime', e.target.value)}
                            className="px-3 py-1 border rounded-md"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <Info className="text-blue-600 mr-2 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm text-blue-800">
                      営業時間外の予約受付については「予約設定」タブで設定できます。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 定期休日タブ */}
          {activeTab === 'holidays' && (
            <div className="space-y-6">
              {/* 毎週の定休日 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">毎週の定休日</h3>
                <div className="grid grid-cols-7 gap-3">
                  {daysOfWeek.map((day, index) => (
                    <label
                      key={index}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        settings.weeklyClosedDays.includes(index)
                          ? 'bg-red-50 border-red-300 text-red-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={settings.weeklyClosedDays.includes(index)}
                        onChange={() => toggleWeeklyClosedDay(index)}
                        className="sr-only"
                      />
                      <span className="font-medium">{day.replace('曜日', '')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 隔週・第N週の定休日 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">隔週・第N週の定休日</h3>
                <div className="space-y-3">
                  {settings.regularHolidays.map((holiday) => (
                    <div key={holiday.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <select
                        value={holiday.dayOfWeek}
                        onChange={(e) => updateRegularHoliday(holiday.id, 'dayOfWeek', Number(e.target.value))}
                        className="px-3 py-2 border rounded-md"
                      >
                        {daysOfWeek.map((day, i) => (
                          <option key={i} value={i}>{day}</option>
                        ))}
                      </select>

                      <div className="flex space-x-2">
                        {weekNumbers.map((week, weekIndex) => (
                          <label key={weekIndex} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={holiday.weekNumbers.includes(weekIndex + 1)}
                              onChange={(e) => {
                                const newWeekNumbers = e.target.checked
                                  ? [...holiday.weekNumbers, weekIndex + 1]
                                  : holiday.weekNumbers.filter(w => w !== weekIndex + 1);
                                updateRegularHoliday(holiday.id, 'weekNumbers', newWeekNumbers);
                              }}
                              className="mr-1 rounded border-gray-300"
                            />
                            {week}
                          </label>
                        ))}
                      </div>

                      <label className="flex items-center ml-auto">
                        <input
                          type="checkbox"
                          checked={holiday.isActive}
                          onChange={(e) => updateRegularHoliday(holiday.id, 'isActive', e.target.checked)}
                          className="mr-2 rounded border-gray-300"
                        />
                        有効
                      </label>

                      <button
                        onClick={() => removeRegularHoliday(holiday.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={addRegularHoliday}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    <Plus className="mr-2" size={18} />
                    定期休日を追加
                  </button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="text-amber-600 mr-2 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm text-amber-800">
                      例：「第2・第4火曜日」を設定すると、毎月の第2火曜日と第4火曜日が定休日になります。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 特別休日タブ */}
          {activeTab === 'special' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">特別休業日</h3>

                {/* テンプレートから追加 */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-3">よく使う休業日から選択：</p>
                  <div className="flex flex-wrap gap-2">
                    {holidayTemplates.map((template) => (
                      <button
                        key={template.name}
                        onClick={() => addSpecialHoliday(template)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {settings.specialHolidays.map((holiday) => (
                    <div key={holiday.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-start space-x-4">
                        <input
                          type="text"
                          placeholder="休業日名（例：年末年始）"
                          value={holiday.name}
                          onChange={(e) => updateSpecialHoliday(holiday.id, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-md"
                        />
                        <button
                          onClick={() => removeSpecialHoliday(holiday.id)}
                          className="text-red-500 hover:text-red-700 mt-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex items-center space-x-4">
                        <input
                          type="date"
                          value={holiday.startDate}
                          onChange={(e) => updateSpecialHoliday(holiday.id, 'startDate', e.target.value)}
                          className="px-3 py-2 border rounded-md"
                        />
                        <span>〜</span>
                        <input
                          type="date"
                          value={holiday.endDate}
                          onChange={(e) => updateSpecialHoliday(holiday.id, 'endDate', e.target.value)}
                          className="px-3 py-2 border rounded-md"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="説明（オプション）"
                        value={holiday.description || ''}
                        onChange={(e) => updateSpecialHoliday(holiday.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      />

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={holiday.allowBooking}
                          onChange={(e) => updateSpecialHoliday(holiday.id, 'allowBooking', e.target.checked)}
                          className="mr-2 rounded border-gray-300"
                        />
                        <span className="text-sm">この期間中も予約を受け付ける（警告表示あり）</span>
                      </label>
                    </div>
                  ))}

                  <button
                    onClick={() => addSpecialHoliday()}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    <Plus className="mr-2" size={18} />
                    特別休業日を追加
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 予約設定タブ */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* 営業時間外予約設定 */}
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="flex items-start mb-4">
                  <Clock className="text-gray-600 mr-2 mt-1" size={20} />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">営業時間外の予約</h3>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.bookingSettings.allowOutOfHoursBooking}
                        onChange={(e) => updateBookingSettings('allowOutOfHoursBooking', e.target.checked)}
                        className="mr-2 rounded border-gray-300"
                      />
                      <span>営業時間外でも予約を許可する</span>
                    </label>
                    {settings.bookingSettings.allowOutOfHoursBooking && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          警告メッセージ
                        </label>
                        <textarea
                          value={settings.bookingSettings.outOfHoursWarningMessage}
                          onChange={(e) => updateBookingSettings('outOfHoursWarningMessage', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 休日予約設定 */}
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="flex items-start mb-4">
                  <Calendar className="text-gray-600 mr-2 mt-1" size={20} />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">休日の予約</h3>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.bookingSettings.allowHolidayBooking}
                        onChange={(e) => updateBookingSettings('allowHolidayBooking', e.target.checked)}
                        className="mr-2 rounded border-gray-300"
                      />
                      <span>休日でも予約を許可する</span>
                    </label>
                    {settings.bookingSettings.allowHolidayBooking && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          警告メッセージ
                        </label>
                        <textarea
                          value={settings.bookingSettings.holidayWarningMessage}
                          onChange={(e) => updateBookingSettings('holidayWarningMessage', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <Info className="text-blue-600 mr-2 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm text-blue-800">
                      予約許可を有効にすると、お客様が休日や営業時間外に予約する際に警告メッセージが表示されますが、
                      予約自体は可能になります。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 休日プレビュー */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">休日プレビュー</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewMonth(addMonths(previewMonth, -1))}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <span className="text-sm font-medium">
                {format(previewMonth, 'yyyy年M月', { locale: ja })}
              </span>
              <button
                onClick={() => setPreviewMonth(addMonths(previewMonth, 1))}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {holidayPreviews.slice(0, 15).map((preview, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-sm ${
                    preview.type === 'weekly'
                      ? 'bg-blue-100 text-blue-800'
                      : preview.type === 'regular'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  <div className="font-medium">
                    {format(new Date(preview.date), 'M/d(E)', { locale: ja })}
                  </div>
                  <div className="text-xs">{preview.description}</div>
                </div>
              ))}
            </div>
            {holidayPreviews.length > 15 && (
              <p className="text-center text-sm text-gray-500 mt-2">
                他 {holidayPreviews.length - 15} 日...
              </p>
            )}
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="p-6 border-t flex justify-end">
          <button
            onClick={saveSettings}
            disabled={isLoading}
            className="flex items-center px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            <Save className="mr-2" size={20} />
            {isLoading ? '保存中...' : '設定を保存'}
          </button>
        </div>
      </div>
    </div>
  );
}