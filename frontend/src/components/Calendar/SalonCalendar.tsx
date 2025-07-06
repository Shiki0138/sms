import React, { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, addWeeks, subWeeks, startOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Clock, User, Scissors, Palette, Sparkles, Star, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface SalonCalendarProps {
  reservations: Reservation[];
  view: 'day' | 'threeDay' | 'week';
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onReservationClick?: (reservation: Reservation) => void;
  onTimeSlotClick?: (date: Date, hour: number, minute: number) => void;
  businessHours: {
    openHour: number;
    closeHour: number;
    timeSlotMinutes: number;
  };
  isHoliday?: (date: Date) => boolean;
  getHolidayType?: (date: Date) => string | null;
}

const SalonCalendar: React.FC<SalonCalendarProps> = ({
  reservations,
  view,
  currentDate,
  onDateChange,
  onReservationClick,
  onTimeSlotClick,
  businessHours,
  isHoliday,
  getHolidayType
}) => {
  // コンポーネントデバッグ用（本番では削除）
  // console.log('SalonCalendar received reservations:', reservations.length, 'items');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

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
        const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // 月曜日開始
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
      }
      default:
        return [currentDate];
    }
  }, [currentDate, view]);

  // 時間スロットを生成（10分単位で細かく）
  const timeSlots = useMemo(() => {
    const slots = [];
    const { openHour, closeHour } = businessHours;
    
    for (let hour = openHour; hour < closeHour; hour++) {
      for (let minute = 0; minute < 60; minute += 10) { // 10分単位で生成
        slots.push({ hour, minute });
      }
    }
    return slots;
  }, [businessHours]);

  // 日付ごとの予約を取得し、時間帯別に整理
  const getReservationsForDate = (date: Date) => {
    return reservations.filter(reservation => {
      const reservationStart = new Date(reservation.startTime);
      return isSameDay(reservationStart, date);
    });
  };

  // 予約の開始時間スロットを取得
  const getReservationStartSlot = (reservation: Reservation) => {
    const start = new Date(reservation.startTime);
    return {
      hour: start.getHours(),
      minute: Math.floor(start.getMinutes() / 10) * 10 // 10分単位に丸める
    };
  };

  // 予約の時間幅（スロット数）を計算
  const getReservationSlotSpan = (reservation: Reservation) => {
    const start = new Date(reservation.startTime);
    const end = reservation.endTime ? new Date(reservation.endTime) : new Date(start.getTime() + 60 * 60 * 1000);
    const durationMinutes = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60));
    return Math.ceil(durationMinutes / 10); // 10分単位でのスロット数
  };

  // 特定のスロットに予約があるかチェック（開始スロットのみ）
  const getReservationForSlot = (date: Date, hour: number, minute: number) => {
    const dayReservations = getReservationsForDate(date);
    return dayReservations.find(reservation => {
      const startSlot = getReservationStartSlot(reservation);
      return startSlot.hour === hour && startSlot.minute === minute;
    });
  };

  // 特定のスロットが予約の継続部分かチェック
  const isSlotOccupied = (date: Date, hour: number, minute: number) => {
    const slotStart = new Date(date);
    slotStart.setHours(hour, minute, 0, 0);
    
    return reservations.some(reservation => {
      const reservationStart = new Date(reservation.startTime);
      const reservationEnd = reservation.endTime ? new Date(reservation.endTime) : new Date(reservationStart.getTime() + 60 * 60 * 1000);
      
      return (
        isSameDay(reservationStart, date) &&
        reservationStart <= slotStart &&
        slotStart < reservationEnd
      );
    });
  };

  // メニューアイコンを取得
  const getMenuIcon = (menuContent: string) => {
    const menu = menuContent.toLowerCase();
    if (menu.includes('カット')) return <Scissors className="w-3 h-3 text-blue-500" />;
    if (menu.includes('カラー')) return <Palette className="w-3 h-3 text-purple-500" />;
    if (menu.includes('パーマ')) return <Sparkles className="w-3 h-3 text-pink-500" />;
    return <Star className="w-3 h-3 text-yellow-500" />;
  };

  // 予約ステータスの色を取得
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 border-green-300 text-green-800';
      case 'TENTATIVE': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'COMPLETED': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 border-red-300 text-red-800';
      case 'NO_SHOW': return 'bg-gray-100 border-gray-300 text-gray-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  // ナビゲーション
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' 
      ? (view === 'day' ? new Date(currentDate.getTime() - 24 * 60 * 60 * 1000) : 
         view === 'threeDay' ? new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000) :
         subWeeks(currentDate, 1))
      : (view === 'day' ? new Date(currentDate.getTime() + 24 * 60 * 60 * 1000) :
         view === 'threeDay' ? new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000) :
         addWeeks(currentDate, 1));
    onDateChange(newDate);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* カレンダーヘッダー */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900">
              {view === 'week' && `${format(dateRange[0], 'M月d日', { locale: ja })} - ${format(dateRange[6], 'M月d日', { locale: ja })}`}
              {view === 'threeDay' && `${format(dateRange[0], 'M月d日', { locale: ja })} - ${format(dateRange[2], 'M月d日', { locale: ja })}`}
              {view === 'day' && format(dateRange[0], 'M月d日(E)', { locale: ja })}
            </h3>
            
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <button
            onClick={() => onDateChange(new Date())}
            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            今日
          </button>
        </div>
      </div>

      {/* カレンダーグリッド */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* 日付ヘッダー */}
          <div className="grid border-b border-gray-200 bg-gray-50" style={{gridTemplateColumns: `56px repeat(${dateRange.length}, 1fr)`}}>
            <div className="p-2 text-xs font-medium text-gray-500 border-r border-gray-200">
              時間
            </div>
            {dateRange.map((date, index) => {
              const dateIsHoliday = isHoliday?.(date) || false
              const holidayType = getHolidayType?.(date)
              
              return (
                <div 
                  key={index} 
                  className={`p-2 text-center border-r border-gray-200 ${
                    isToday(date) 
                      ? 'bg-blue-50 text-blue-700' 
                      : dateIsHoliday 
                        ? 'bg-red-50 text-red-700' 
                        : 'text-gray-700'
                  }`}
                >
                  <div className="font-medium">
                    {format(date, 'E', { locale: ja })}
                  </div>
                  <div className={`text-lg ${isToday(date) ? 'font-bold' : ''}`}>
                    {format(date, 'd')}
                  </div>
                  {isToday(date) && (
                    <div className="text-xs text-blue-600 font-medium">今日</div>
                  )}
                  {dateIsHoliday && holidayType && (
                    <div className="text-xs text-red-600 font-medium mt-1">
                      {holidayType.includes('定休日') ? '定休日' : '休業日'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 時間スロット */}
          <div className="max-h-[400px] sm:max-h-[600px] overflow-y-auto -webkit-overflow-scrolling-touch">
            <div className="relative">
              {/* 休日オーバーレイ（各日ごと） */}
              {dateRange.map((date, dateIndex) => {
                const dateIsHoliday = isHoliday?.(date) || false;
                const holidayType = getHolidayType?.(date);
                
                if (!dateIsHoliday) return null;
                
                const columnWidth = `calc((100% - 40px) / ${dateRange.length})`;
                const leftOffset = `calc(40px + ${columnWidth} * ${dateIndex})`;
                
                return (
                  <div 
                    key={`holiday-overlay-${dateIndex}`}
                    className="absolute top-0 bottom-0 z-10 flex items-center justify-center bg-red-50/95 border-l border-r border-red-200"
                    style={{
                      left: leftOffset,
                      width: columnWidth
                    }}
                  >
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-red-600 font-medium">
                        {holidayType?.includes('定休日') ? '定休日' : '休業日'}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* 通常の時間スロット */}
              {timeSlots.map(({ hour, minute }) => {
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                
                return (
                  <div key={timeStr} className="grid border-b border-gray-100 hover:bg-gray-50" style={{gridTemplateColumns: `40px repeat(${dateRange.length}, 1fr)`}}>
                    {/* 時間ラベル */}
                    <div className="p-0.5 sm:p-1 text-xs text-gray-500 border-r border-gray-200 bg-gray-50" style={{ height: '24px' }}>
                      {minute === 0 && (
                        <div className="font-medium text-xs">{hour.toString().padStart(2, '0')}:00</div>
                      )}
                      {minute === 30 && (
                        <div className="text-gray-400 text-xs">:30</div>
                      )}
                    </div>
                    
                    {/* 各日のタイムスロット */}
                    {dateRange.map((date, dateIndex) => {
                      const reservation = getReservationForSlot(date, hour, minute);
                      const isOccupied = isSlotOccupied(date, hour, minute);
                      const slotId = `${format(date, 'yyyy-MM-dd')}-${timeStr}`;
                      const dateIsHoliday = isHoliday?.(date) || false;
                      
                      return (
                        <div 
                          key={`${dateIndex}-${timeStr}`}
                          className={`min-h-6 border-r border-gray-200 relative ${
                            dateIsHoliday ? 'bg-red-50' : ''
                          }`}
                          style={{ height: '24px' }} // 10分単位の高さ
                        >
                          {!dateIsHoliday ? (
                            reservation ? (
                              // 予約の開始スロット - 結合された枠を表示
                              <div
                                onClick={() => onReservationClick?.(reservation)}
                                className={`absolute left-0.5 right-0.5 rounded text-xs cursor-pointer hover:opacity-80 transition-all ${getStatusColor(reservation.status)} overflow-hidden z-10 p-1`}
                                style={{ 
                                  height: `${getReservationSlotSpan(reservation) * 24 - 2}px`, // スロット数 × 高さ
                                  top: '1px'
                                }}
                              >
                                {/* 顧客名 */}
                                <div className="font-bold text-gray-900 truncate leading-tight text-xs">
                                  {reservation.customerName}
                                </div>
                                
                                {/* メニュー */}
                                <div className="text-gray-700 truncate mt-0.5 text-xs">
                                  {reservation.menuContent}
                                </div>
                                
                                {/* 担当者 */}
                                {reservation.staff && (
                                  <div className="text-gray-600 truncate mt-0.5 text-xs">
                                    👤 {reservation.staff.name}
                                  </div>
                                )}
                                
                                {/* 時間表示 */}
                                <div className="text-gray-500 text-xs mt-0.5">
                                  {format(new Date(reservation.startTime), 'HH:mm')}
                                  {reservation.endTime && ` - ${format(new Date(reservation.endTime), 'HH:mm')}`}
                                </div>
                              </div>
                            ) : !isOccupied ? (
                              // 空きスロット
                              <button
                                onClick={() => onTimeSlotClick?.(date, hour, minute)}
                                className={`w-full h-full rounded hover:bg-blue-50 transition-colors group ${
                                  selectedTimeSlot === slotId ? 'bg-blue-100 border border-blue-300' : ''
                                }`}
                                onMouseEnter={() => setSelectedTimeSlot(slotId)}
                                onMouseLeave={() => setSelectedTimeSlot(null)}
                              >
                                <Plus className="w-3 h-3 text-gray-400 group-hover:text-blue-500 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ) : null
                            // 予約の継続部分は何も表示しない（上の予約枠が覆っている）
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 今日の予約サマリー */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span>確定済み</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span>仮予約</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
              <span>完了</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
              <span>休業日</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            {view === 'day' && (
              <>
                今日の予約: <span className="font-medium text-gray-900">
                  {reservations.filter(r => isSameDay(new Date(r.startTime), currentDate)).length}件
                </span>
              </>
            )}
            {view === 'week' && (
              <>
                今週の予約: <span className="font-medium text-gray-900">
                  {reservations.filter(r => {
                    const resDate = new Date(r.startTime);
                    return dateRange.some(date => isSameDay(resDate, date));
                  }).length}件
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonCalendar;