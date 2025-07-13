import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertTriangle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface BusinessHours {
  [key: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
}

interface RegularHoliday {
  dayOfWeek: number; // 0-6 (日曜日-土曜日)
  weekNumbers: number[]; // 第何週 (1-5)
}

interface SpecialHoliday {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

const daysOfWeek = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
const weekNumbers = ['第1', '第2', '第3', '第4', '第5'];

export default function BusinessHoursSettings() {
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    sunday: { isOpen: false, openTime: '10:00', closeTime: '19:00' },
    monday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
    tuesday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
    wednesday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
    thursday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
    friday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
    saturday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
  });

  const [regularHolidays, setRegularHolidays] = useState<RegularHoliday[]>([]);
  const [specialHolidays, setSpecialHolidays] = useState<SpecialHoliday[]>([]);
  const [allowOutOfHoursBooking, setAllowOutOfHoursBooking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 新しい定休日を追加
  const addRegularHoliday = () => {
    setRegularHolidays([...regularHolidays, { dayOfWeek: 1, weekNumbers: [] }]);
  };

  const updateRegularHoliday = (index: number, field: keyof RegularHoliday, value: any) => {
    const updated = [...regularHolidays];
    updated[index] = { ...updated[index], [field]: value };
    setRegularHolidays(updated);
  };

  const removeRegularHoliday = (index: number) => {
    setRegularHolidays(regularHolidays.filter((_, i) => i !== index));
  };

  // 特別休業日を追加
  const addSpecialHoliday = () => {
    const newHoliday: SpecialHoliday = {
      id: Date.now().toString(),
      name: '',
      startDate: '',
      endDate: '',
    };
    setSpecialHolidays([...specialHolidays, newHoliday]);
  };

  const updateSpecialHoliday = (id: string, field: keyof SpecialHoliday, value: string) => {
    setSpecialHolidays(
      specialHolidays.map((holiday) =>
        holiday.id === id ? { ...holiday, [field]: value } : holiday
      )
    );
  };

  const removeSpecialHoliday = (id: string) => {
    setSpecialHolidays(specialHolidays.filter((holiday) => holiday.id !== id));
  };

  // 営業時間を更新
  const updateBusinessHours = (day: string, field: keyof BusinessHours[string], value: any) => {
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        [field]: value,
      },
    });
  };

  // 設定を保存
  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // APIに保存（実装時に追加）
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success('営業時間設定を保存しました');
    } catch (error) {
      toast.error('設定の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Clock className="mr-2" />
          営業時間・休日設定
        </h2>

        {/* 営業時間設定 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">営業時間</h3>
          <div className="space-y-3">
            {Object.entries(businessHours).map(([day, hours], index) => (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-24">
                  <span className="font-medium">{daysOfWeek[index]}</span>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hours.isOpen}
                    onChange={(e) => updateBusinessHours(day, 'isOpen', e.target.checked)}
                    className="mr-2"
                  />
                  営業
                </label>
                {hours.isOpen && (
                  <>
                    <input
                      type="time"
                      value={hours.openTime}
                      onChange={(e) => updateBusinessHours(day, 'openTime', e.target.value)}
                      className="px-3 py-1 border rounded"
                    />
                    <span>〜</span>
                    <input
                      type="time"
                      value={hours.closeTime}
                      onChange={(e) => updateBusinessHours(day, 'closeTime', e.target.value)}
                      className="px-3 py-1 border rounded"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 定休日設定 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">定休日設定</h3>
          <div className="space-y-3">
            {regularHolidays.map((holiday, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                <select
                  value={holiday.dayOfWeek}
                  onChange={(e) => updateRegularHoliday(index, 'dayOfWeek', Number(e.target.value))}
                  className="px-3 py-1 border rounded"
                >
                  {daysOfWeek.map((day, i) => (
                    <option key={i} value={i}>
                      {day}
                    </option>
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
                            : holiday.weekNumbers.filter((w) => w !== weekIndex + 1);
                          updateRegularHoliday(index, 'weekNumbers', newWeekNumbers);
                        }}
                        className="mr-1"
                      />
                      {week}
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => removeRegularHoliday(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  削除
                </button>
              </div>
            ))}
            <button
              onClick={addRegularHoliday}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              定休日を追加
            </button>
          </div>
        </div>

        {/* 特別休業日設定 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">特別休業日</h3>
          <div className="space-y-3">
            {specialHolidays.map((holiday) => (
              <div key={holiday.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                <input
                  type="text"
                  placeholder="休業日名（例：年末年始）"
                  value={holiday.name}
                  onChange={(e) => updateSpecialHoliday(holiday.id, 'name', e.target.value)}
                  className="px-3 py-1 border rounded flex-1"
                />
                <input
                  type="date"
                  value={holiday.startDate}
                  onChange={(e) => updateSpecialHoliday(holiday.id, 'startDate', e.target.value)}
                  className="px-3 py-1 border rounded"
                />
                <span>〜</span>
                <input
                  type="date"
                  value={holiday.endDate}
                  onChange={(e) => updateSpecialHoliday(holiday.id, 'endDate', e.target.value)}
                  className="px-3 py-1 border rounded"
                />
                <button
                  onClick={() => removeSpecialHoliday(holiday.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  削除
                </button>
              </div>
            ))}
            <button
              onClick={addSpecialHoliday}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              特別休業日を追加
            </button>
          </div>
        </div>

        {/* 営業時間外予約設定 */}
        <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="text-yellow-600 mr-2 mt-1" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">営業時間外の予約について</h3>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowOutOfHoursBooking}
                  onChange={(e) => setAllowOutOfHoursBooking(e.target.checked)}
                  className="mr-2"
                />
                <span>営業時間外でも予約を許可する（警告メッセージを表示）</span>
              </label>
              {allowOutOfHoursBooking && (
                <p className="text-sm text-gray-600 mt-2">
                  営業時間外の予約時には「営業時間外のため予約できません」というメッセージが表示されますが、
                  お客様が希望する場合は予約可能になります。
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={isLoading}
            className="flex items-center px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            <Save className="mr-2" size={20} />
            {isLoading ? '保存中...' : '設定を保存'}
          </button>
        </div>
      </div>
    </div>
  );
}