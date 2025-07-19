import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
const MonthCalendar = ({ currentDate, onDateChange, reservations, isHoliday, getHolidayType, onDayClick }) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // 月曜日開始
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    // 特定の日の予約数を取得
    const getReservationCount = (date) => {
        return reservations.filter(reservation => isSameDay(new Date(reservation.startTime), date)).length;
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
    return (_jsxs("div", { className: "bg-white rounded-xl border border-gray-200 overflow-hidden", children: [_jsx("div", { className: "border-b border-gray-200 p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("button", { onClick: goToPreviousMonth, className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(ChevronLeft, { className: "w-5 h-5 text-gray-600" }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: format(currentDate, 'yyyy年M月', { locale: ja }) }), _jsx("button", { onClick: goToNextMonth, className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(ChevronRight, { className: "w-5 h-5 text-gray-600" }) })] }), _jsx("button", { onClick: goToToday, className: "px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium", children: "\u4ECA\u65E5" })] }) }), _jsx("div", { className: "grid grid-cols-7 border-b border-gray-200 bg-gray-50", children: ['月', '火', '水', '木', '金', '土', '日'].map((day) => (_jsx("div", { className: "p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0", children: day }, day))) }), _jsx("div", { className: "grid grid-cols-7", children: days.map((day, index) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isDayToday = isToday(day);
                    const dayIsHoliday = isHoliday?.(day) || false;
                    const holidayType = getHolidayType?.(day);
                    const reservationCount = getReservationCount(day);
                    return (_jsx("button", { onClick: () => onDayClick?.(day), className: `
                min-h-24 p-2 border-r border-b border-gray-200 last:border-r-0 text-left hover:bg-gray-50 transition-colors
                ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                ${isDayToday ? 'bg-blue-50 border-blue-200' : ''}
                ${dayIsHoliday && isCurrentMonth ? 'bg-red-50' : ''}
              `, children: _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: `text-sm font-medium ${isDayToday ? 'text-blue-700' :
                                        dayIsHoliday && isCurrentMonth ? 'text-red-700' :
                                            isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`, children: [format(day, 'd'), isDayToday && (_jsx("span", { className: "ml-1 text-xs bg-blue-600 text-white px-1 py-0.5 rounded", children: "\u4ECA\u65E5" }))] }), dayIsHoliday && isCurrentMonth && holidayType && (_jsx("div", { className: "text-xs text-red-600 font-medium", children: holidayType.includes('定休日') ? '定休日' : '休業日' })), isCurrentMonth && reservationCount > 0 && !dayIsHoliday && (_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(CalendarIcon, { className: "w-3 h-3 text-blue-500" }), _jsxs("span", { className: "text-xs text-blue-700 font-medium", children: [reservationCount, "\u4EF6"] })] })), isCurrentMonth && reservationCount === 0 && !dayIsHoliday && (_jsx("div", { className: "text-xs text-gray-400", children: "\u7A7A\u304D" }))] }) }, index));
                }) }), _jsx("div", { className: "border-t border-gray-200 p-3 bg-gray-50", children: _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-600", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("div", { className: "w-3 h-3 bg-blue-50 border border-blue-200 rounded" }), _jsx("span", { children: "\u4ECA\u65E5" })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("div", { className: "w-3 h-3 bg-red-50 border border-red-200 rounded" }), _jsx("span", { children: "\u4F11\u696D\u65E5" })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(CalendarIcon, { className: "w-3 h-3 text-blue-500" }), _jsx("span", { children: "\u4E88\u7D04\u3042\u308A" })] })] }), _jsxs("div", { className: "text-gray-500", children: ["\u4ECA\u6708\u306E\u4E88\u7D04: ", reservations.filter(r => isSameMonth(new Date(r.startTime), currentDate)).length, "\u4EF6"] })] }) })] }));
};
export default MonthCalendar;
