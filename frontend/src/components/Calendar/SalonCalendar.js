import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, addWeeks, subWeeks } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Scissors, Palette, Sparkles, Star, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
const SalonCalendar = ({ reservations, view, currentDate, onDateChange, onReservationClick, onTimeSlotClick, businessHours, isHoliday, getHolidayType }) => {
    // コンポーネントデバッグ用（本番では削除）
    // console.log('SalonCalendar received reservations:', reservations.length, 'items');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
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
            case 'week':
                const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // 月曜日開始
                const end = endOfWeek(currentDate, { weekStartsOn: 1 });
                return eachDayOfInterval({ start, end });
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
    const getReservationsForDate = (date) => {
        return reservations.filter(reservation => {
            const reservationStart = new Date(reservation.startTime);
            return isSameDay(reservationStart, date);
        });
    };
    // 予約の開始時間スロットを取得
    const getReservationStartSlot = (reservation) => {
        const start = new Date(reservation.startTime);
        return {
            hour: start.getHours(),
            minute: Math.floor(start.getMinutes() / 10) * 10 // 10分単位に丸める
        };
    };
    // 予約の時間幅（スロット数）を計算
    const getReservationSlotSpan = (reservation) => {
        const start = new Date(reservation.startTime);
        const end = reservation.endTime ? new Date(reservation.endTime) : new Date(start.getTime() + 60 * 60 * 1000);
        const durationMinutes = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60));
        return Math.ceil(durationMinutes / 10); // 10分単位でのスロット数
    };
    // 特定のスロットに予約があるかチェック（開始スロットのみ）
    const getReservationForSlot = (date, hour, minute) => {
        const dayReservations = getReservationsForDate(date);
        return dayReservations.find(reservation => {
            const startSlot = getReservationStartSlot(reservation);
            return startSlot.hour === hour && startSlot.minute === minute;
        });
    };
    // 特定のスロットが予約の継続部分かチェック
    const isSlotOccupied = (date, hour, minute) => {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        return reservations.some(reservation => {
            const reservationStart = new Date(reservation.startTime);
            const reservationEnd = reservation.endTime ? new Date(reservation.endTime) : new Date(reservationStart.getTime() + 60 * 60 * 1000);
            return (isSameDay(reservationStart, date) &&
                reservationStart <= slotStart &&
                slotStart < reservationEnd);
        });
    };
    // メニューアイコンを取得
    const getMenuIcon = (menuContent) => {
        const menu = menuContent.toLowerCase();
        if (menu.includes('カット'))
            return _jsx(Scissors, { className: "w-3 h-3 text-blue-500" });
        if (menu.includes('カラー'))
            return _jsx(Palette, { className: "w-3 h-3 text-purple-500" });
        if (menu.includes('パーマ'))
            return _jsx(Sparkles, { className: "w-3 h-3 text-pink-500" });
        return _jsx(Star, { className: "w-3 h-3 text-yellow-500" });
    };
    // 予約ステータスの色を取得
    const getStatusColor = (status) => {
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
    const navigateWeek = (direction) => {
        const newDate = direction === 'prev'
            ? (view === 'day' ? new Date(currentDate.getTime() - 24 * 60 * 60 * 1000) :
                view === 'threeDay' ? new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000) :
                    subWeeks(currentDate, 1))
            : (view === 'day' ? new Date(currentDate.getTime() + 24 * 60 * 60 * 1000) :
                view === 'threeDay' ? new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000) :
                    addWeeks(currentDate, 1));
        onDateChange(newDate);
    };
    return (_jsxs("div", { className: "bg-white rounded-xl border border-gray-200 overflow-hidden", children: [_jsx("div", { className: "border-b border-gray-200 p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("button", { onClick: () => navigateWeek('prev'), className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(ChevronLeft, { className: "w-5 h-5 text-gray-600" }) }), _jsxs("h3", { className: "text-lg font-semibold text-gray-900", children: [view === 'week' && `${format(dateRange[0], 'M月d日', { locale: ja })} - ${format(dateRange[6], 'M月d日', { locale: ja })}`, view === 'threeDay' && `${format(dateRange[0], 'M月d日', { locale: ja })} - ${format(dateRange[2], 'M月d日', { locale: ja })}`, view === 'day' && format(dateRange[0], 'M月d日(E)', { locale: ja })] }), _jsx("button", { onClick: () => navigateWeek('next'), className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(ChevronRight, { className: "w-5 h-5 text-gray-600" }) })] }), _jsx("button", { onClick: () => onDateChange(new Date()), className: "px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium", children: "\u4ECA\u65E5" })] }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("div", { className: "min-w-full", children: [_jsxs("div", { className: "grid border-b border-gray-200 bg-gray-50", style: { gridTemplateColumns: `56px repeat(${dateRange.length}, 1fr)` }, children: [_jsx("div", { className: "p-2 text-xs font-medium text-gray-500 border-r border-gray-200", children: "\u6642\u9593" }), dateRange.map((date, index) => {
                                    const dateIsHoliday = isHoliday?.(date) || false;
                                    const holidayType = getHolidayType?.(date);
                                    return (_jsxs("div", { className: `p-2 text-center border-r border-gray-200 ${isToday(date)
                                            ? 'bg-blue-50 text-blue-700'
                                            : dateIsHoliday
                                                ? 'bg-red-50 text-red-700'
                                                : 'text-gray-700'}`, children: [_jsx("div", { className: "font-medium", children: format(date, 'E', { locale: ja }) }), _jsx("div", { className: `text-lg ${isToday(date) ? 'font-bold' : ''}`, children: format(date, 'd') }), isToday(date) && (_jsx("div", { className: "text-xs text-blue-600 font-medium", children: "\u4ECA\u65E5" })), dateIsHoliday && holidayType && (_jsx("div", { className: "text-xs text-red-600 font-medium mt-1", children: holidayType.includes('定休日') ? '定休日' : '休業日' }))] }, index));
                                })] }), _jsx("div", { className: "max-h-[600px] overflow-y-auto", children: _jsxs("div", { className: "relative", children: [dateRange.map((date, dateIndex) => {
                                        const dateIsHoliday = isHoliday?.(date) || false;
                                        const holidayType = getHolidayType?.(date);
                                        if (!dateIsHoliday)
                                            return null;
                                        const columnWidth = `calc((100% - 56px) / ${dateRange.length})`;
                                        const leftOffset = `calc(56px + ${columnWidth} * ${dateIndex})`;
                                        return (_jsx("div", { className: "absolute top-0 bottom-0 z-10 flex items-center justify-center bg-red-50/95 border-l border-r border-red-200", style: {
                                                left: leftOffset,
                                                width: columnWidth
                                            }, children: _jsx("div", { className: "text-center", children: _jsx("div", { className: "text-sm text-red-600 font-medium", children: holidayType?.includes('定休日') ? '定休日' : '休業日' }) }) }, `holiday-overlay-${dateIndex}`));
                                    }), timeSlots.map(({ hour, minute }) => {
                                        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                                        return (_jsxs("div", { className: "grid border-b border-gray-100 hover:bg-gray-50", style: { gridTemplateColumns: `56px repeat(${dateRange.length}, 1fr)` }, children: [_jsxs("div", { className: "p-1 text-xs text-gray-500 border-r border-gray-200 bg-gray-50", style: { height: '24px' }, children: [minute === 0 && (_jsxs("div", { className: "font-medium", children: [hour.toString().padStart(2, '0'), ":00"] })), minute === 30 && (_jsx("div", { className: "text-gray-400", children: ":30" }))] }), dateRange.map((date, dateIndex) => {
                                                    const reservation = getReservationForSlot(date, hour, minute);
                                                    const isOccupied = isSlotOccupied(date, hour, minute);
                                                    const slotId = `${format(date, 'yyyy-MM-dd')}-${timeStr}`;
                                                    const dateIsHoliday = isHoliday?.(date) || false;
                                                    return (_jsx("div", { className: `min-h-6 border-r border-gray-200 relative ${dateIsHoliday ? 'bg-red-50' : ''}`, style: { height: '24px' }, children: !dateIsHoliday ? (reservation ? (
                                                        // 予約の開始スロット - 結合された枠を表示
                                                        _jsxs("div", { onClick: () => onReservationClick?.(reservation), className: `absolute left-0.5 right-0.5 rounded text-xs cursor-pointer hover:opacity-80 transition-all ${getStatusColor(reservation.status)} overflow-hidden z-10 p-1`, style: {
                                                                height: `${getReservationSlotSpan(reservation) * 24 - 2}px`, // スロット数 × 高さ
                                                                top: '1px'
                                                            }, children: [_jsx("div", { className: "font-bold text-gray-900 truncate leading-tight text-xs", children: reservation.customerName }), _jsx("div", { className: "text-gray-700 truncate mt-0.5 text-xs", children: reservation.menuContent }), reservation.staff && (_jsxs("div", { className: "text-gray-600 truncate mt-0.5 text-xs", children: ["\uD83D\uDC64 ", reservation.staff.name] })), _jsxs("div", { className: "text-gray-500 text-xs mt-0.5", children: [format(new Date(reservation.startTime), 'HH:mm'), reservation.endTime && ` - ${format(new Date(reservation.endTime), 'HH:mm')}`] })] })) : !isOccupied ? (
                                                        // 空きスロット
                                                        _jsx("button", { onClick: () => onTimeSlotClick?.(date, hour, minute), className: `w-full h-full rounded hover:bg-blue-50 transition-colors group ${selectedTimeSlot === slotId ? 'bg-blue-100 border border-blue-300' : ''}`, onMouseEnter: () => setSelectedTimeSlot(slotId), onMouseLeave: () => setSelectedTimeSlot(null), children: _jsx(Plus, { className: "w-3 h-3 text-gray-400 group-hover:text-blue-500 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" }) })) : null
                                                        // 予約の継続部分は何も表示しない（上の予約枠が覆っている）
                                                        ) : null }, `${dateIndex}-${timeStr}`));
                                                })] }, timeStr));
                                    })] }) })] }) }), _jsx("div", { className: "border-t border-gray-200 p-4 bg-gray-50", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-600", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-green-100 border border-green-300 rounded" }), _jsx("span", { children: "\u78BA\u5B9A\u6E08\u307F" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-yellow-100 border border-yellow-300 rounded" }), _jsx("span", { children: "\u4EEE\u4E88\u7D04" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-blue-100 border border-blue-300 rounded" }), _jsx("span", { children: "\u5B8C\u4E86" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-red-100 border border-red-300 rounded" }), _jsx("span", { children: "\u4F11\u696D\u65E5" })] })] }), _jsxs("div", { className: "text-sm text-gray-600", children: [view === 'day' && (_jsxs(_Fragment, { children: ["\u4ECA\u65E5\u306E\u4E88\u7D04: ", _jsxs("span", { className: "font-medium text-gray-900", children: [reservations.filter(r => isSameDay(new Date(r.startTime), currentDate)).length, "\u4EF6"] })] })), view === 'week' && (_jsxs(_Fragment, { children: ["\u4ECA\u9031\u306E\u4E88\u7D04: ", _jsxs("span", { className: "font-medium text-gray-900", children: [reservations.filter(r => {
                                                    const resDate = new Date(r.startTime);
                                                    return dateRange.some(date => isSameDay(resDate, date));
                                                }).length, "\u4EF6"] })] }))] })] }) })] }));
};
export default SalonCalendar;
