import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface Reservation {
  id: string;
  startTime: string;
  endTime?: string;
  menuContent: string;
  customerName: string;
  customer?: {
    id: string;
    name: string;
    phone?: string;
  };
  staff?: {
    id: string;
    name: string;
  };
  source: 'HOTPEPPER' | 'GOOGLE_CALENDAR' | 'PHONE' | 'WALK_IN' | 'MANUAL';
  status: 'TENTATIVE' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  price?: number;
}

interface MonthCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  reservations: Reservation[];
  isHoliday?: (date: Date) => boolean;
  getHolidayType?: (date: Date) => string | null;
  onDayClick?: (date: Date) => void;
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({
  currentDate,
  onDateChange,
  reservations,
  isHoliday,
  getHolidayType,
  onDayClick
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // 月曜日開始
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // 特定の日の予約数を取得
  const getReservationCount = (date: Date) => {
    return reservations.filter(reservation => 
      isSameDay(new Date(reservation.startTime), date)
    ).length;
  };

  // 前月へ移動
  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    onDateChange(prevMonth);
  };

  // 次月へ移動
  const goToNextMonth = () => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    onDateChange(nextMonth);
  };

  // 今日へ移動
  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900">
              {format(currentDate, 'yyyy年M月', { locale: ja })}
            </h3>
            
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <button
            onClick={goToToday}
            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            今日
          </button>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {['月', '火', '水', '木', '金', '土', '日'].map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          const dayIsHoliday = isHoliday?.(day) || false;
          const holidayType = getHolidayType?.(day);
          const reservationCount = getReservationCount(day);

          return (
            <button
              key={index}
              onClick={() => onDayClick?.(day)}
              className={`
                min-h-24 p-2 border-r border-b border-gray-200 last:border-r-0 text-left hover:bg-gray-50 transition-colors
                ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                ${isDayToday ? 'bg-blue-50 border-blue-200' : ''}
                ${dayIsHoliday && isCurrentMonth ? 'bg-red-50' : ''}
              `}
            >
              <div className="space-y-1">
                {/* 日付 */}
                <div className={`text-sm font-medium ${
                  isDayToday ? 'text-blue-700' : 
                  dayIsHoliday && isCurrentMonth ? 'text-red-700' : 
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {format(day, 'd')}
                  {isDayToday && (
                    <span className="ml-1 text-xs bg-blue-600 text-white px-1 py-0.5 rounded">今日</span>
                  )}
                </div>

                {/* 休日表示 */}
                {dayIsHoliday && isCurrentMonth && holidayType && (
                  <div className="text-xs text-red-600 font-medium">
                    {holidayType.includes('定休日') ? '定休日' : '休業日'}
                  </div>
                )}

                {/* 予約数表示 */}
                {isCurrentMonth && reservationCount > 0 && !dayIsHoliday && (
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-blue-700 font-medium">
                      {reservationCount}件
                    </span>
                  </div>
                )}

                {/* 予約がない平日 */}
                {isCurrentMonth && reservationCount === 0 && !dayIsHoliday && (
                  <div className="text-xs text-gray-400">
                    空き
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* フッター */}
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
              <span>今日</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
              <span>休業日</span>
            </div>
            <div className="flex items-center space-x-1">
              <CalendarIcon className="w-3 h-3 text-blue-500" />
              <span>予約あり</span>
            </div>
          </div>
          
          <div className="text-gray-500">
            今月の予約: {reservations.filter(r => isSameMonth(new Date(r.startTime), currentDate)).length}件
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthCalendar;