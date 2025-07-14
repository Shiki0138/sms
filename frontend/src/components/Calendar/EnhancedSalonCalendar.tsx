import React, { useState, useMemo, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, addWeeks, subWeeks, getDay, getWeekOfMonth } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Clock, User, Scissors, ChevronLeft, ChevronRight, AlertTriangle, Calendar, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import type { BusinessHoursSettings, HolidayInfo } from '@/types/businessHours';

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

interface EnhancedSalonCalendarProps {
  reservations: Reservation[];
  view: 'day' | 'threeDay' | 'week';
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onReservationClick?: (reservation: Reservation) => void;
  onTimeSlotClick?: (date: Date, hour: number, minute: number) => void;
  businessHoursSettings: BusinessHoursSettings;
}

const EnhancedSalonCalendar: React.FC<EnhancedSalonCalendarProps> = ({
  reservations,
  view,
  currentDate,
  onDateChange,
  onReservationClick,
  onTimeSlotClick,
  businessHoursSettings
}) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [showHolidayWarning, setShowHolidayWarning] = useState(false);
  const [selectedHolidayDate, setSelectedHolidayDate] = useState<Date | null>(null);

  // 日付が休日かどうかをチェック
  const checkIfHoliday = useCallback((date: Date): HolidayInfo | null => {
    const dayOfWeek = getDay(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // 毎週の定休日チェック
    if (businessHoursSettings.weeklyClosedDays.includes(dayOfWeek)) {
      return {
        date: dateStr,
        type: 'weekly',
        name: `定休日（毎週${['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]}曜日）`,
        allowBooking: businessHoursSettings.bookingSettings.allowHolidayBooking
      };
    }
    
    // 定期休日（第N○曜日）チェック
    for (const holiday of businessHoursSettings.regularHolidays) {
      if (holiday.isActive && dayOfWeek === holiday.dayOfWeek) {
        const weekOfMonth = getWeekOfMonth(date, { weekStartsOn: 1 });
        if (holiday.weekNumbers.includes(weekOfMonth)) {
          const nthText = holiday.weekNumbers.map(n => `第${n}`).join('・');
          return {
            date: dateStr,
            type: 'regular',
            name: `定休日（${nthText}${['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]}曜日）`,
            allowBooking: businessHoursSettings.bookingSettings.allowHolidayBooking
          };
        }
      }
    }
    
    // 特別休日チェック
    for (const holiday of businessHoursSettings.specialHolidays) {
      if (dateStr >= holiday.startDate && dateStr <= holiday.endDate) {
        return {
          date: dateStr,
          type: 'special',
          name: holiday.name || '特別休業日',
          description: holiday.description,
          allowBooking: holiday.allowBooking || businessHoursSettings.bookingSettings.allowHolidayBooking
        };
      }
    }
    
    return null;
  }, [businessHoursSettings]);

  // 営業時間を取得
  const getBusinessHoursForDate = useCallback((date: Date) => {
    const dayOfWeek = getDay(date);
    const hours = businessHoursSettings.businessHours.find(h => h.dayOfWeek === dayOfWeek);
    return hours || { isOpen: false, openTime: '10:00', closeTime: '19:00' };
  }, [businessHoursSettings.businessHours]);

  // カレンダーの日付範囲を計算
  const dateRange = useMemo(() => {
    switch (view) {
      case 'day':
        return [currentDate];
      case 'threeDay':
        return [
          currentDate,
          new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
          new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000)
        ];
      case 'week': {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
      }
      default:
        return [currentDate];
    }
  }, [currentDate, view]);

  // 時間スロットを生成
  const timeSlots = useMemo(() => {
    const slots = [];
    // 8時から21時まで表示（実際の営業時間外も薄く表示）
    for (let hour = 8; hour < 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push({ hour, minute });
      }
    }
    return slots;
  }, []);

  // 時間スロットのクリックハンドラー
  const handleTimeSlotClick = (date: Date, hour: number, minute: number) => {
    const holidayInfo = checkIfHoliday(date);
    const businessHours = getBusinessHoursForDate(date);
    const clickedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // 休日チェック
    if (holidayInfo && !holidayInfo.allowBooking) {
      toast.error('この日は休業日のため予約できません');
      return;
    }
    
    if (holidayInfo && holidayInfo.allowBooking) {
      setSelectedHolidayDate(date);
      setShowHolidayWarning(true);
      setSelectedTimeSlot(`${format(date, 'yyyy-MM-dd')}-${hour}-${minute}`);
      return;
    }
    
    // 営業時間チェック
    if (!businessHours.isOpen) {
      toast.error('この曜日は定休日です');
      return;
    }
    
    if (clickedTime < businessHours.openTime || clickedTime >= businessHours.closeTime) {
      if (!businessHoursSettings.bookingSettings.allowOutOfHoursBooking) {
        toast.error('営業時間外のため予約できません');
        return;
      }
      
      // 営業時間外の警告を表示
      if (window.confirm(businessHoursSettings.bookingSettings.outOfHoursWarningMessage + '\n\n予約を続けますか？')) {
        onTimeSlotClick?.(date, hour, minute);
      }
      return;
    }
    
    onTimeSlotClick?.(date, hour, minute);
  };

  // 休日警告の確認
  const confirmHolidayBooking = () => {
    if (selectedTimeSlot && selectedHolidayDate) {
      const [dateStr, hourStr, minuteStr] = selectedTimeSlot.split('-');
      const hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);
      onTimeSlotClick?.(selectedHolidayDate, hour, minute);
    }
    setShowHolidayWarning(false);
    setSelectedHolidayDate(null);
  };

  // 日付ごとの予約を取得
  const getReservationsForDate = (date: Date) => {
    return reservations.filter(reservation => {
      const reservationStart = new Date(reservation.startTime);
      return isSameDay(reservationStart, date);
    });
  };

  // 時間スロットが利用可能かチェック
  const isTimeSlotAvailable = (date: Date, hour: number, minute: number) => {
    const slotTime = new Date(date);
    slotTime.setHours(hour, minute, 0, 0);
    
    const dateReservations = getReservationsForDate(date);
    
    return !dateReservations.some(reservation => {
      const start = new Date(reservation.startTime);
      const end = reservation.endTime ? new Date(reservation.endTime) : new Date(start.getTime() + 60 * 60 * 1000);
      
      return slotTime >= start && slotTime < end;
    });
  };

  // 時間スロットのスタイルを決定
  const getTimeSlotStyle = (date: Date, hour: number, minute: number) => {
    const holidayInfo = checkIfHoliday(date);
    const businessHours = getBusinessHoursForDate(date);
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const isAvailable = isTimeSlotAvailable(date, hour, minute);
    
    let baseClasses = 'relative h-12 border-t border-gray-200 cursor-pointer transition-colors ';
    
    // 休日の場合
    if (holidayInfo) {
      if (holidayInfo.allowBooking) {
        baseClasses += isAvailable 
          ? 'bg-orange-50 hover:bg-orange-100 ' 
          : 'bg-orange-100 cursor-not-allowed ';
      } else {
        baseClasses += 'bg-gray-100 cursor-not-allowed ';
      }
      return baseClasses;
    }
    
    // 営業時間外
    if (!businessHours.isOpen || timeStr < businessHours.openTime || timeStr >= businessHours.closeTime) {
      if (businessHoursSettings.bookingSettings.allowOutOfHoursBooking) {
        baseClasses += isAvailable 
          ? 'bg-gray-50 hover:bg-gray-100 ' 
          : 'bg-gray-100 cursor-not-allowed ';
      } else {
        baseClasses += 'bg-gray-100 cursor-not-allowed ';
      }
      return baseClasses;
    }
    
    // 通常の営業時間内
    if (isAvailable) {
      baseClasses += 'bg-white hover:bg-blue-50 ';
    } else {
      baseClasses += 'bg-red-50 cursor-not-allowed ';
    }
    
    return baseClasses;
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onDateChange(view === 'week' ? subWeeks(currentDate, 1) : new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {format(currentDate, 'yyyy年M月d日', { locale: ja })}
            {view === 'week' && ` - ${format(dateRange[dateRange.length - 1], 'd日', { locale: ja })}`}
          </h2>
          <button
            onClick={() => onDateChange(view === 'week' ? addWeeks(currentDate, 1) : new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-100 rounded mr-1"></div>
            <span>休業日</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-100 rounded mr-1"></div>
            <span>休日（予約可）</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-50 rounded mr-1"></div>
            <span>予約済</span>
          </div>
        </div>
      </div>

      {/* カレンダー本体 */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          {/* 日付ヘッダー */}
          <div className="flex border-b sticky top-0 bg-white z-10">
            <div className="w-20 shrink-0 p-2 text-center text-sm font-medium text-gray-600">
              時間
            </div>
            {dateRange.map((date) => {
              const holidayInfo = checkIfHoliday(date);
              return (
                <div
                  key={format(date, 'yyyy-MM-dd')}
                  className={`flex-1 p-2 text-center border-l ${
                    isToday(date) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="text-sm font-medium">
                    {format(date, 'M/d(E)', { locale: ja })}
                  </div>
                  {holidayInfo && (
                    <div className={`text-xs mt-1 ${
                      holidayInfo.type === 'special' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {holidayInfo.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 時間スロット */}
          <div className="relative">
            {timeSlots.map(({ hour, minute }) => (
              <div key={`${hour}-${minute}`} className="flex">
                <div className="w-20 shrink-0 p-2 text-center text-sm text-gray-600 border-t">
                  {minute === 0 && `${hour}:00`}
                </div>
                {dateRange.map((date) => {
                  const slotKey = `${format(date, 'yyyy-MM-dd')}-${hour}-${minute}`;
                  const reservations = getReservationsForDate(date).filter(r => {
                    const start = new Date(r.startTime);
                    return start.getHours() === hour && start.getMinutes() === minute;
                  });

                  return (
                    <div
                      key={slotKey}
                      className={`flex-1 border-l ${getTimeSlotStyle(date, hour, minute)}`}
                      onClick={() => handleTimeSlotClick(date, hour, minute)}
                    >
                      {reservations.map((reservation) => (
                        <div
                          key={reservation.id}
                          className="absolute inset-x-0 bg-blue-500 text-white text-xs p-1 rounded mx-1 z-20"
                          style={{
                            top: '2px',
                            minHeight: '40px'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onReservationClick?.(reservation);
                          }}
                        >
                          <div className="font-medium">{reservation.customerName}</div>
                          <div className="opacity-90">{reservation.menuContent}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 休日予約警告モーダル */}
      {showHolidayWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start mb-4">
              <AlertTriangle className="text-orange-500 mr-3 mt-1" size={24} />
              <div>
                <h3 className="text-lg font-semibold mb-2">休業日の予約確認</h3>
                <p className="text-gray-600">
                  {businessHoursSettings.bookingSettings.holidayWarningMessage}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowHolidayWarning(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <button
                onClick={confirmHolidayBooking}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                予約を続ける
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSalonCalendar;