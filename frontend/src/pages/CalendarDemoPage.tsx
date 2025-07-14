import React, { useState } from 'react';
import EnhancedSalonCalendar from '@/components/Calendar/EnhancedSalonCalendar';
import type { BusinessHoursSettings } from '@/types/businessHours';
import { Calendar, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// デモ用の予約データ
const demoReservations = [
  {
    id: '1',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    menuContent: 'カット＆カラー',
    customerName: '田中様',
    customer: { id: '1', name: '田中様', phone: '090-1234-5678' },
    staff: { id: '1', name: '山田スタイリスト' },
    source: 'HOTPEPPER' as const,
    status: 'CONFIRMED' as const,
    price: 8000
  },
  {
    id: '2',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    menuContent: 'パーマ',
    customerName: '佐藤様',
    customer: { id: '2', name: '佐藤様' },
    source: 'PHONE' as const,
    status: 'TENTATIVE' as const,
    price: 12000
  }
];

// デモ用の営業時間設定
const demoBusinessHoursSettings: BusinessHoursSettings = {
  businessHours: [
    { dayOfWeek: 0, isOpen: false, openTime: '10:00', closeTime: '19:00' },
    { dayOfWeek: 1, isOpen: false, openTime: '10:00', closeTime: '19:00' }, // 月曜定休
    { dayOfWeek: 2, isOpen: true, openTime: '10:00', closeTime: '19:00' },
    { dayOfWeek: 3, isOpen: true, openTime: '10:00', closeTime: '19:00' },
    { dayOfWeek: 4, isOpen: true, openTime: '10:00', closeTime: '19:00' },
    { dayOfWeek: 5, isOpen: true, openTime: '10:00', closeTime: '20:00' },
    { dayOfWeek: 6, isOpen: true, openTime: '10:00', closeTime: '20:00' },
  ],
  weeklyClosedDays: [1], // 毎週月曜日
  regularHolidays: [
    {
      id: '1',
      dayOfWeek: 2, // 火曜日
      weekNumbers: [2, 4], // 第2・第4火曜日
      isActive: true
    }
  ],
  specialHolidays: [
    {
      id: '1',
      name: '年末年始休業',
      startDate: '2024-12-29',
      endDate: '2025-01-03',
      description: '年末年始のお休み',
      allowBooking: false
    },
    {
      id: '2',
      name: '夏季休業',
      startDate: '2024-08-13',
      endDate: '2024-08-15',
      description: 'お盆休み',
      allowBooking: true // 警告付きで予約可能
    }
  ],
  bookingSettings: {
    allowOutOfHoursBooking: true,
    outOfHoursWarningMessage: '営業時間外のご予約です。確認後、スタッフから連絡させていただく場合があります。',
    allowHolidayBooking: true,
    holidayWarningMessage: '休業日のご予約です。特別に対応可能か確認後、ご連絡させていただきます。'
  }
};

const CalendarDemoPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'threeDay' | 'week'>('week');
  const navigate = useNavigate();

  const handleReservationClick = (reservation: any) => {
    alert(`予約詳細: ${reservation.customerName} - ${reservation.menuContent}`);
  };

  const handleTimeSlotClick = (date: Date, hour: number, minute: number) => {
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    alert(`${date.toLocaleDateString('ja-JP')} ${timeStr} に新規予約を作成`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Calendar className="mr-3" />
              カレンダー（休日表示デモ）
            </h1>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Settings className="w-4 h-4 mr-2" />
              営業時間・休日設定
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setView('day')}
                  className={`px-4 py-2 rounded ${
                    view === 'day'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  日
                </button>
                <button
                  onClick={() => setView('threeDay')}
                  className={`px-4 py-2 rounded ${
                    view === 'threeDay'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  3日
                </button>
                <button
                  onClick={() => setView('week')}
                  className={`px-4 py-2 rounded ${
                    view === 'week'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  週
                </button>
              </div>

              <div className="text-sm text-gray-600">
                <p>• 毎週月曜日：定休日</p>
                <p>• 第2・第4火曜日：定休日</p>
                <p>• オレンジ色の日：休日（警告付きで予約可能）</p>
              </div>
            </div>

            <div className="h-[600px]">
              <EnhancedSalonCalendar
                reservations={demoReservations}
                view={view}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onReservationClick={handleReservationClick}
                onTimeSlotClick={handleTimeSlotClick}
                businessHoursSettings={demoBusinessHoursSettings}
              />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">デモ機能の説明</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• グレーの時間帯：休業日または営業時間外</li>
              <li>• オレンジの時間帯：休日だが警告付きで予約可能</li>
              <li>• 赤い時間帯：予約済み</li>
              <li>• 休日をクリックすると警告メッセージが表示されます</li>
              <li>• 営業時間外（10:00前、19:00以降）も警告が表示されます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarDemoPage;