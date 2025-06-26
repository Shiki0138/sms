import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { MessageSquare, Calendar, Users, BarChart3, Settings, Instagram, MessageCircle, Clock, CheckCircle, AlertCircle, Phone, Mail, Send, Menu, X, ExternalLink, Save, User, Calendar as CalendarIcon, FileText, ChevronLeft, ChevronRight, Scissors, Palette, Star, Sparkles, RotateCcw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format, isToday, isTomorrow } from 'date-fns';
import { ja } from 'date-fns/locale';
const API_BASE_URL = 'http://localhost:8080/api/v1';
function App() {
    const [activeTab, setActiveTab] = useState('messages');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const [replyingToThread, setReplyingToThread] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    // Settings state
    const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
    const [calendarSettings, setCalendarSettings] = useState({
        googleClientId: '',
        googleClientSecret: '',
        autoSync: true,
        syncInterval: 15, // minutes
    });
    // Business settings state
    const [businessSettings, setBusinessSettings] = useState({
        openHour: 9,
        closeHour: 18,
        timeSlotMinutes: 30,
        closedDays: [0], // Sunday = 0, Monday = 1, etc.
        customClosedDates: [] // YYYY-MM-DD format
    });
    // Calendar view state
    const [calendarView, setCalendarView] = useState('week');
    const [calendarDate, setCalendarDate] = useState(new Date());
    // Fetch data
    const { data: threads } = useQuery({
        queryKey: ['threads'],
        queryFn: () => axios.get(`${API_BASE_URL}/messages/threads`).then(res => res.data)
    });
    const { data: customers } = useQuery({
        queryKey: ['customers'],
        queryFn: () => axios.get(`${API_BASE_URL}/customers`).then(res => res.data)
    });
    const { data: reservations } = useQuery({
        queryKey: ['reservations'],
        queryFn: () => axios.get(`${API_BASE_URL}/reservations`).then(res => res.data)
    });
    // Calculate unread count
    const unreadCount = threads?.threads.reduce((sum, t) => sum + t.unreadCount, 0) || 0;
    // Handle reply submission
    const handleSendReply = async (threadId) => {
        if (!replyMessage.trim())
            return;
        try {
            await axios.post(`${API_BASE_URL}/messages/send`, {
                threadId,
                content: replyMessage.trim(),
                mediaType: 'TEXT'
            });
            setReplyMessage('');
            setReplyingToThread(null);
            // Refetch threads to update the UI
            window.location.reload();
        }
        catch (error) {
            console.error('Failed to send message:', error);
        }
    };
    // Handle Instagram link click
    const handleInstagramClick = (instagramId) => {
        window.open(`https://www.instagram.com/${instagramId}`, '_blank');
    };
    // Handle email click
    const handleEmailClick = (email) => {
        window.location.href = `mailto:${email}`;
    };
    // Handle LINE click
    // Get menu icon based on menu content
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
    // Generate time slots for business hours
    const generateTimeSlots = () => {
        const slots = [];
        const { openHour, closeHour, timeSlotMinutes } = businessSettings;
        for (let hour = openHour; hour < closeHour; hour++) {
            for (let minute = 0; minute < 60; minute += timeSlotMinutes) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(time);
            }
        }
        return slots;
    };
    // Check if a date is a closed day
    const isClosedDay = (date) => {
        const dayOfWeek = date.getDay();
        const dateString = format(date, 'yyyy-MM-dd');
        return businessSettings.closedDays.includes(dayOfWeek) ||
            businessSettings.customClosedDates.includes(dateString);
    };
    // Get reservations for a specific date and time slot
    const getReservationsForSlot = (date, timeSlot) => {
        return reservations?.reservations.filter(r => {
            const reservationDate = new Date(r.startTime);
            const reservationTime = format(reservationDate, 'HH:mm');
            const reservationDateStr = format(reservationDate, 'yyyy-MM-dd');
            const targetDateStr = format(date, 'yyyy-MM-dd');
            return reservationDateStr === targetDateStr && reservationTime === timeSlot;
        }) || [];
    };
    // Get dates for current view
    const getViewDates = () => {
        const dates = [];
        const baseDate = new Date(calendarDate);
        if (calendarView === 'day') {
            dates.push(baseDate);
        }
        else if (calendarView === 'threeDay') {
            for (let i = 0; i < 3; i++) {
                const date = new Date(baseDate);
                date.setDate(date.getDate() + i);
                dates.push(date);
            }
        }
        else if (calendarView === 'week') {
            // Start from Monday
            const startOfWeek = new Date(baseDate);
            startOfWeek.setDate(baseDate.getDate() - baseDate.getDay() + 1);
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                dates.push(date);
            }
        }
        return dates;
    };
    // Handle LINE app launch
    const handleLineAppClick = (lineId) => {
        // Try to open LINE app with specific user if lineId is provided
        const lineUrl = lineId ? `line://ti/p/${lineId}` : 'line://';
        const lineWebUrl = 'https://line.me/';
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /iphone|ipad|android/.test(userAgent);
        if (isMobile) {
            // Try to open LINE app
            window.location.href = lineUrl;
            // Fallback to web version after a delay
            setTimeout(() => {
                window.open(lineWebUrl, '_blank');
            }, 1000);
        }
        else {
            window.open(lineWebUrl, '_blank');
        }
    };
    // Handle Google Calendar connection
    const handleGoogleCalendarConnect = async () => {
        try {
            // Demo mode - simulate connection
            setGoogleCalendarConnected(true);
            alert('Google Calendarに接続しました（デモモード）');
        }
        catch (error) {
            alert('接続に失敗しました');
        }
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isToday(date))
            return `今日 ${format(date, 'HH:mm')}`;
        if (isTomorrow(date))
            return `明日 ${format(date, 'HH:mm')}`;
        return format(date, 'M月d日 HH:mm', { locale: ja });
    };
    const getChannelIcon = (channel) => {
        return channel === 'INSTAGRAM' ? (_jsx(Instagram, { className: "w-4 h-4 text-pink-500" })) : (_jsx(MessageCircle, { className: "w-4 h-4 text-green-500" }));
    };
    const getStatusBadge = (status) => {
        const styles = {
            OPEN: 'badge-danger',
            IN_PROGRESS: 'badge-warning',
            CLOSED: 'badge-success',
            CONFIRMED: 'badge-success',
            TENTATIVE: 'badge-warning',
            CANCELLED: 'badge-danger',
            COMPLETED: 'badge-primary'
        };
        const labels = {
            OPEN: '未対応',
            IN_PROGRESS: '対応中',
            CLOSED: '完了',
            CONFIRMED: '確定',
            TENTATIVE: '仮予約',
            CANCELLED: 'キャンセル',
            COMPLETED: '完了'
        };
        return (_jsx("span", { className: `badge ${styles[status]}`, children: labels[status] || status }));
    };
    const MessagesList = () => (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-xl md:text-2xl font-bold text-gray-900", children: "\u7D71\u5408\u30A4\u30F3\u30DC\u30C3\u30AF\u30B9" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs("span", { className: "badge badge-danger text-xs", children: [threads?.threads.filter(t => t.status === 'OPEN').length || 0, " \u672A\u5BFE\u5FDC"] }), _jsxs("span", { className: "badge badge-warning text-xs", children: [threads?.threads.filter(t => t.status === 'IN_PROGRESS').length || 0, " \u5BFE\u5FDC\u4E2D"] })] })] }), _jsx("div", { className: "space-y-3", children: threads?.threads.map((thread) => (_jsx("div", { className: "card hover:shadow-md transition-shadow", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start space-x-3 flex-1 min-w-0", children: [_jsx("div", { className: "flex-shrink-0 mt-1", children: getChannelIcon(thread.channel) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1 flex-wrap", children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 truncate", children: thread.customer.name }), getStatusBadge(thread.status), thread.unreadCount > 0 && (_jsx("span", { className: "badge badge-danger", children: thread.unreadCount }))] }), _jsx("p", { className: "text-sm text-gray-600 mb-2 break-words", children: thread.lastMessage.content }), _jsxs("div", { className: "flex items-center text-xs text-gray-500 flex-wrap gap-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), formatDate(thread.lastMessage.createdAt)] }), thread.assignedStaff && (_jsx("div", { className: "flex items-center", children: _jsxs("span", { children: ["\u62C5\u5F53: ", thread.assignedStaff.name] }) }))] })] })] }), _jsx("div", { className: "flex-shrink-0 ml-2", children: _jsxs("button", { onClick: () => setReplyingToThread(replyingToThread === thread.id ? null : thread.id), className: "btn btn-primary btn-sm flex items-center text-xs px-3 py-1.5", children: [_jsx(Send, { className: "w-3 h-3 mr-1" }), "\u8FD4\u4FE1"] }) })] }), replyingToThread === thread.id && (_jsxs("div", { className: "border-t pt-3", children: [_jsxs("div", { className: "flex space-x-2", children: [_jsx("input", { type: "text", value: replyMessage, onChange: (e) => setReplyMessage(e.target.value), placeholder: "\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u5165\u529B...", className: "flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", onKeyPress: (e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleSendReply(thread.id);
                                                    }
                                                } }), _jsx("button", { onClick: () => handleSendReply(thread.id), disabled: !replyMessage.trim(), className: "btn btn-primary btn-sm px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed", children: _jsx(Send, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "flex justify-end mt-2", children: _jsx("button", { onClick: () => {
                                                setReplyingToThread(null);
                                                setReplyMessage('');
                                            }, className: "text-xs text-gray-500 hover:text-gray-700", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }) })] }))] }) }, thread.id))) })] }));
    const CustomersList = () => (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", children: [_jsx("h2", { className: "text-xl md:text-2xl font-bold text-gray-900", children: "\u9867\u5BA2\u7BA1\u7406" }), _jsx("button", { className: "btn btn-primary text-sm", children: "\u65B0\u898F\u9867\u5BA2\u767B\u9332" })] }), _jsx("div", { className: "space-y-4", children: customers?.customers.map((customer) => (_jsx("div", { className: "card hover:shadow-md transition-shadow", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start justify-between gap-3", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("button", { onClick: () => {
                                                    setSelectedCustomer(customer);
                                                    setShowCustomerModal(true);
                                                }, className: "text-lg font-medium text-gray-900 mb-2 break-words hover:text-blue-600 transition-colors text-left", children: customer.name }), _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600", children: [customer.phone && (_jsxs("div", { className: "flex items-center", children: [_jsx(Phone, { className: "w-4 h-4 mr-1 flex-shrink-0" }), _jsx("a", { href: `tel:${customer.phone}`, className: "break-all hover:text-blue-600 transition-colors", children: customer.phone })] })), customer.email && (_jsxs("div", { className: "flex items-center", children: [_jsx(Mail, { className: "w-4 h-4 mr-1 flex-shrink-0" }), _jsx("button", { onClick: () => handleEmailClick(customer.email), className: "break-all hover:text-blue-600 transition-colors text-left", children: customer.email })] }))] })] }), _jsxs("div", { className: "text-right flex-shrink-0", children: [_jsxs("div", { className: "text-sm font-medium text-gray-900", children: ["\u6765\u5E97\u56DE\u6570: ", customer.visitCount, "\u56DE"] }), customer.lastVisitDate && (_jsxs("div", { className: "text-xs text-gray-500", children: ["\u6700\u7D42\u6765\u5E97: ", format(new Date(customer.lastVisitDate), 'M月d日', { locale: ja })] }))] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100", children: [customer.instagramId && (_jsxs("button", { onClick: () => handleInstagramClick(customer.instagramId), className: "flex items-center text-xs text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-2 py-1 rounded-md transition-colors", children: [_jsx(Instagram, { className: "w-3 h-3 mr-1" }), customer.instagramId, _jsx(ExternalLink, { className: "w-3 h-3 ml-1" })] })), customer.lineId && (_jsxs("button", { onClick: () => handleLineAppClick(customer.lineId), className: "flex items-center text-xs text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-md transition-colors", children: [_jsx(MessageCircle, { className: "w-3 h-3 mr-1" }), "LINE\u9023\u643A\u6E08\u307F", _jsx(ExternalLink, { className: "w-3 h-3 ml-1" })] }))] })] }) }, customer.id))) })] }));
    const ReservationsList = () => (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", children: [_jsx("h2", { className: "text-xl md:text-2xl font-bold text-gray-900", children: "\u4E88\u7D04\u7BA1\u7406" }), _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsx("div", { className: "flex items-center space-x-1 bg-gray-100 rounded-lg p-1", children: [{ value: 'day', label: '日' }, { value: 'threeDay', label: '3日' }, { value: 'week', label: '週' }, { value: 'month', label: '月' }].map((view) => (_jsx("button", { onClick: () => setCalendarView(view.value), className: `px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${calendarView === view.value
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'}`, children: view.label }, view.value))) }), _jsx("button", { className: "btn btn-primary text-sm", children: "\u65B0\u898F\u4E88\u7D04" })] })] }), _jsx("div", { className: "flex items-center justify-between mb-4", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { onClick: () => {
                                const newDate = new Date(calendarDate);
                                if (calendarView === 'day')
                                    newDate.setDate(newDate.getDate() - 1);
                                else if (calendarView === 'threeDay')
                                    newDate.setDate(newDate.getDate() - 3);
                                else if (calendarView === 'week')
                                    newDate.setDate(newDate.getDate() - 7);
                                else
                                    newDate.setMonth(newDate.getMonth() - 1);
                                setCalendarDate(newDate);
                            }, className: "p-2 hover:bg-gray-100 rounded-md", children: _jsx(ChevronLeft, { className: "w-4 h-4" }) }), _jsx("h3", { className: "text-lg font-medium text-gray-900", children: calendarView === 'month'
                                ? format(calendarDate, 'yyyy年M月', { locale: ja })
                                : calendarView === 'week'
                                    ? `${format(calendarDate, 'M月d日', { locale: ja })} 週`
                                    : calendarView === 'threeDay'
                                        ? `${format(calendarDate, 'M月d日', { locale: ja })} (3日間)`
                                        : format(calendarDate, 'M月d日', { locale: ja }) }), _jsx("button", { onClick: () => {
                                const newDate = new Date(calendarDate);
                                if (calendarView === 'day')
                                    newDate.setDate(newDate.getDate() + 1);
                                else if (calendarView === 'threeDay')
                                    newDate.setDate(newDate.getDate() + 3);
                                else if (calendarView === 'week')
                                    newDate.setDate(newDate.getDate() + 7);
                                else
                                    newDate.setMonth(newDate.getMonth() + 1);
                                setCalendarDate(newDate);
                            }, className: "p-2 hover:bg-gray-100 rounded-md", children: _jsx(ChevronRight, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setCalendarDate(new Date()), className: "btn btn-secondary btn-sm", children: "\u4ECA\u65E5" })] }) }), calendarView === 'month' ? (
            /* Month View - Original implementation */
            _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 overflow-hidden", children: [_jsx("div", { className: "grid grid-cols-7 border-b border-gray-200", children: ['日', '月', '火', '水', '木', '金', '土'].map((day) => (_jsx("div", { className: "p-3 text-center text-sm font-medium text-gray-500 bg-gray-50", children: day }, day))) }), _jsx("div", { className: "grid grid-cols-7 h-96", children: Array.from({ length: 42 }, (_, i) => {
                            const startOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
                            const startOfCalendar = new Date(startOfMonth);
                            startOfCalendar.setDate(startOfCalendar.getDate() - startOfMonth.getDay());
                            const currentDate = new Date(startOfCalendar);
                            currentDate.setDate(currentDate.getDate() + i);
                            const dayReservations = reservations?.reservations.filter(r => format(new Date(r.startTime), 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')) || [];
                            const isClosed = isClosedDay(currentDate);
                            return (_jsxs("div", { className: `border-r border-b border-gray-200 p-1 min-h-24 ${isClosed ? 'bg-red-50' : ''}`, children: [_jsxs("div", { className: `text-sm flex items-center justify-between ${currentDate.getMonth() !== calendarDate.getMonth()
                                            ? 'text-gray-400'
                                            : isToday(currentDate)
                                                ? 'text-blue-600 font-bold'
                                                : 'text-gray-900'}`, children: [_jsx("span", { children: currentDate.getDate() }), isClosed && _jsx("span", { className: "text-xs text-red-500", children: "\u5B9A\u4F11" })] }), _jsxs("div", { className: "space-y-1 mt-1", children: [dayReservations.slice(0, 2).map((reservation) => (_jsxs("div", { className: "text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate", children: [_jsx("div", { className: "font-medium", children: reservation.customerName }), _jsxs("div", { className: "flex items-center text-xs", children: [getMenuIcon(reservation.menuContent), _jsx("span", { className: "ml-1 truncate", children: reservation.menuContent })] }), reservation.staff && (_jsx("div", { className: "text-xs text-blue-600", children: reservation.staff.name }))] }, reservation.id))), dayReservations.length > 2 && (_jsxs("div", { className: "text-xs text-gray-500", children: ["+", dayReservations.length - 2, " more"] }))] })] }, i));
                        }) })] })) : (_jsx("div", { className: "bg-white rounded-lg border border-gray-200 overflow-hidden", children: _jsxs("div", { className: "flex", children: [_jsxs("div", { className: "w-20 border-r border-gray-200", children: [_jsx("div", { className: "h-12 border-b border-gray-200 bg-gray-50 flex items-center justify-center text-sm font-medium text-gray-500", children: "\u6642\u9593" }), generateTimeSlots().map((timeSlot) => (_jsx("div", { className: "h-16 border-b border-gray-200 flex items-center justify-center text-xs text-gray-600", children: timeSlot }, timeSlot)))] }), _jsx("div", { className: "flex-1 overflow-x-auto", children: _jsx("div", { className: "flex min-w-full", children: getViewDates().map((date, dateIndex) => {
                                    const isClosed = isClosedDay(date);
                                    const isToday_ = isToday(date);
                                    return (_jsxs("div", { className: `flex-1 min-w-48 border-r border-gray-200 ${isClosed ? 'bg-red-50' : ''}`, children: [_jsxs("div", { className: `h-12 border-b border-gray-200 flex flex-col items-center justify-center text-sm ${isClosed
                                                    ? 'bg-red-100 text-red-700'
                                                    : isToday_
                                                        ? 'bg-blue-100 text-blue-700 font-medium'
                                                        : 'bg-gray-50 text-gray-700'}`, children: [_jsx("div", { className: "font-medium", children: format(date, 'M/d', { locale: ja }) }), _jsxs("div", { className: "text-xs", children: [format(date, 'E', { locale: ja }), isClosed && _jsx("span", { className: "ml-1 text-red-600", children: "(\u5B9A\u4F11)" })] })] }), generateTimeSlots().map((timeSlot) => {
                                                const slotReservations = getReservationsForSlot(date, timeSlot);
                                                return (_jsxs("div", { className: `h-16 border-b border-gray-200 p-1 ${isClosed ? 'bg-red-25' : 'hover:bg-gray-50'}`, children: [slotReservations.map((reservation) => (_jsxs("div", { className: "bg-blue-100 text-blue-800 rounded p-1 mb-1 text-xs", children: [_jsx("div", { className: "font-medium truncate", children: reservation.customerName }), _jsxs("div", { className: "flex items-center", children: [getMenuIcon(reservation.menuContent), _jsx("span", { className: "ml-1 truncate", children: reservation.menuContent })] }), reservation.staff && (_jsx("div", { className: "text-xs text-blue-600 truncate", children: reservation.staff.name }))] }, reservation.id))), !isClosed && slotReservations.length === 0 && (_jsx("button", { className: "w-full h-full text-gray-400 hover:text-gray-600 hover:bg-blue-50 rounded transition-colors text-xs", children: "+" }))] }, timeSlot));
                                            })] }, dateIndex));
                                }) }) })] }) }))] }));
    const Dashboard = () => {
        const totalThreads = threads?.threads.length || 0;
        const todayReservations = reservations?.reservations.filter(r => isToday(new Date(r.startTime))).length || 0;
        return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx("button", { onClick: () => setActiveTab('messages'), className: "card hover:shadow-lg transition-all duration-200 hover:scale-105 text-left cursor-pointer", children: _jsxs("div", { className: "flex items-center", children: [_jsx(MessageSquare, { className: "w-8 h-8 text-blue-500" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u7DCF\u30E1\u30C3\u30BB\u30FC\u30B8\u6570" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: totalThreads })] })] }) }), _jsx("button", { onClick: () => setActiveTab('messages'), className: "card hover:shadow-lg transition-all duration-200 hover:scale-105 text-left cursor-pointer", children: _jsxs("div", { className: "flex items-center", children: [_jsx(AlertCircle, { className: "w-8 h-8 text-red-500" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u672A\u8AAD\u30E1\u30C3\u30BB\u30FC\u30B8" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: unreadCount })] })] }) }), _jsx("button", { onClick: () => setActiveTab('reservations'), className: "card hover:shadow-lg transition-all duration-200 hover:scale-105 text-left cursor-pointer", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "w-8 h-8 text-green-500" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u4ECA\u65E5\u306E\u4E88\u7D04" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: todayReservations })] })] }) }), _jsx("button", { onClick: () => setActiveTab('customers'), className: "card hover:shadow-lg transition-all duration-200 hover:scale-105 text-left cursor-pointer", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-8 h-8 text-purple-500" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u7DCF\u9867\u5BA2\u6570" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: customers?.customers.length || 0 })] })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "card", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "\u6700\u8FD1\u306E\u30E1\u30C3\u30BB\u30FC\u30B8" }), _jsx("button", { onClick: () => setActiveTab('messages'), className: "text-sm text-blue-600 hover:text-blue-700 font-medium", children: "\u3059\u3079\u3066\u898B\u308B \u2192" })] }), _jsxs("div", { className: "space-y-3", children: [threads?.threads.slice(0, 3).map((thread) => (_jsxs("button", { onClick: () => setActiveTab('messages'), className: "w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left", children: [getChannelIcon(thread.channel), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: thread.customer.name }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: thread.lastMessage.content })] }), _jsx("div", { className: "text-xs text-gray-400 flex-shrink-0", children: format(new Date(thread.lastMessage.createdAt), 'HH:mm') })] }, thread.id))), (!threads?.threads || threads.threads.length === 0) && (_jsx("div", { className: "text-center py-4 text-gray-500 text-sm", children: "\u30E1\u30C3\u30BB\u30FC\u30B8\u304C\u3042\u308A\u307E\u305B\u3093" }))] })] }), _jsxs("div", { className: "card", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "\u4ECA\u65E5\u306E\u4E88\u7D04" }), _jsx("button", { onClick: () => setActiveTab('reservations'), className: "text-sm text-blue-600 hover:text-blue-700 font-medium", children: "\u3059\u3079\u3066\u898B\u308B \u2192" })] }), _jsxs("div", { className: "space-y-3", children: [reservations?.reservations
                                            .filter(r => isToday(new Date(r.startTime)))
                                            .slice(0, 3)
                                            .map((reservation) => (_jsxs("button", { onClick: () => setActiveTab('reservations'), className: "w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-500 flex-shrink-0" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: reservation.customerName }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: reservation.menuContent })] }), _jsx("div", { className: "text-xs text-gray-400 flex-shrink-0", children: format(new Date(reservation.startTime), 'HH:mm') })] }, reservation.id))), (!reservations?.reservations ||
                                            reservations.reservations.filter(r => isToday(new Date(r.startTime))).length === 0) && (_jsx("div", { className: "text-center py-4 text-gray-500 text-sm", children: "\u4ECA\u65E5\u306E\u4E88\u7D04\u306F\u3042\u308A\u307E\u305B\u3093" }))] })] })] })] }));
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40", children: _jsx("div", { className: "px-4 sm:px-6 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { onClick: () => setIsSidebarOpen(!isSidebarOpen), className: "md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100", children: isSidebarOpen ? _jsx(X, { className: "w-6 h-6" }) : _jsx(Menu, { className: "w-6 h-6" }) }), _jsx("h1", { className: "text-lg sm:text-xl font-bold text-gray-900", children: "\uD83C\uDFEA \u7F8E\u5BB9\u5BA4\u7D71\u5408\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0" })] }), _jsx("div", { className: "flex items-center space-x-2 text-sm text-gray-600", children: _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full" }), _jsx("span", { className: "hidden sm:inline", children: "\u30C7\u30E2\u30E2\u30FC\u30C9" })] }) })] }) }) }), _jsxs("div", { className: "flex relative", children: [isSidebarOpen && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden", onClick: () => setIsSidebarOpen(false) })), _jsx("nav", { className: `
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-white shadow-sm transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:h-screen md:sticky md:top-16
        `, children: _jsx("div", { className: "p-4 md:p-6 pt-20 md:pt-6", children: _jsxs("div", { className: "space-y-2", children: [_jsxs("button", { onClick: () => {
                                            setActiveTab('dashboard');
                                            setIsSidebarOpen(false);
                                        }, className: `sidebar-item w-full ${activeTab === 'dashboard' ? 'active' : ''}`, children: [_jsx(BarChart3, { className: "w-5 h-5 mr-3 flex-shrink-0" }), _jsx("span", { className: "truncate", children: "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" })] }), _jsxs("button", { onClick: () => {
                                            setActiveTab('messages');
                                            setIsSidebarOpen(false);
                                        }, className: `sidebar-item w-full ${activeTab === 'messages' ? 'active' : ''}`, children: [_jsx(MessageSquare, { className: "w-5 h-5 mr-3 flex-shrink-0" }), _jsx("span", { className: "truncate", children: "\u7D71\u5408\u30A4\u30F3\u30DC\u30C3\u30AF\u30B9" }), unreadCount > 0 && (_jsx("span", { className: "ml-auto badge badge-danger flex-shrink-0", children: unreadCount }))] }), _jsxs("button", { onClick: () => {
                                            setActiveTab('reservations');
                                            setIsSidebarOpen(false);
                                        }, className: `sidebar-item w-full ${activeTab === 'reservations' ? 'active' : ''}`, children: [_jsx(Calendar, { className: "w-5 h-5 mr-3 flex-shrink-0" }), _jsx("span", { className: "truncate", children: "\u4E88\u7D04\u7BA1\u7406" })] }), _jsxs("button", { onClick: () => {
                                            setActiveTab('customers');
                                            setIsSidebarOpen(false);
                                        }, className: `sidebar-item w-full ${activeTab === 'customers' ? 'active' : ''}`, children: [_jsx(Users, { className: "w-5 h-5 mr-3 flex-shrink-0" }), _jsx("span", { className: "truncate", children: "\u9867\u5BA2\u7BA1\u7406" })] }), _jsxs("button", { onClick: () => {
                                            setActiveTab('settings');
                                            setIsSidebarOpen(false);
                                        }, className: `sidebar-item w-full ${activeTab === 'settings' ? 'active' : ''}`, children: [_jsx(Settings, { className: "w-5 h-5 mr-3 flex-shrink-0" }), _jsx("span", { className: "truncate", children: "\u8A2D\u5B9A" })] })] }) }) }), _jsx("main", { className: "flex-1 p-4 sm:p-6 max-w-full", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [activeTab === 'dashboard' && _jsx(Dashboard, {}), activeTab === 'messages' && _jsx(MessagesList, {}), activeTab === 'customers' && _jsx(CustomersList, {}), activeTab === 'reservations' && _jsx(ReservationsList, {}), activeTab === 'settings' && (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-xl md:text-2xl font-bold text-gray-900", children: "\u8A2D\u5B9A" }), _jsxs("div", { className: "card", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Google Calendar \u9023\u643A" }), _jsxs("div", { className: `flex items-center ${googleCalendarConnected ? 'text-green-600' : 'text-gray-500'}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full mr-2 ${googleCalendarConnected ? 'bg-green-500' : 'bg-gray-400'}` }), googleCalendarConnected ? '接続済み' : '未接続'] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Google Client ID" }), _jsx("input", { type: "text", value: calendarSettings.googleClientId, onChange: (e) => setCalendarSettings(prev => ({ ...prev, googleClientId: e.target.value })), placeholder: "Google API Client ID", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Google Client Secret" }), _jsx("input", { type: "password", value: calendarSettings.googleClientSecret, onChange: (e) => setCalendarSettings(prev => ({ ...prev, googleClientSecret: e.target.value })), placeholder: "Google API Client Secret", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: calendarSettings.autoSync, onChange: (e) => setCalendarSettings(prev => ({ ...prev, autoSync: e.target.checked })), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "\u81EA\u52D5\u540C\u671F\u3092\u6709\u52B9\u306B\u3059\u308B" })] }), _jsx("p", { className: "text-xs text-gray-500 ml-6 mt-1", children: "\u6307\u5B9A\u9593\u9694\u3067Google Calendar\u3068\u81EA\u52D5\u540C\u671F\u3057\u307E\u3059" })] }), _jsxs("div", { className: "text-right", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u540C\u671F\u9593\u9694" }), _jsxs("select", { value: calendarSettings.syncInterval, onChange: (e) => setCalendarSettings(prev => ({ ...prev, syncInterval: parseInt(e.target.value) })), className: "px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: 5, children: "5\u5206" }), _jsx("option", { value: 15, children: "15\u5206" }), _jsx("option", { value: 30, children: "30\u5206" }), _jsx("option", { value: 60, children: "1\u6642\u9593" })] })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200", children: [_jsxs("button", { onClick: handleGoogleCalendarConnect, disabled: !calendarSettings.googleClientId || !calendarSettings.googleClientSecret, className: "btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(ExternalLink, { className: "w-4 h-4 mr-2" }), googleCalendarConnected ? '再接続' : 'Google Calendarに接続'] }), googleCalendarConnected && (_jsx("button", { onClick: () => setGoogleCalendarConnected(false), className: "btn btn-secondary", children: "\u63A5\u7D9A\u89E3\u9664" })), _jsxs("button", { className: "btn btn-secondary", children: [_jsx(RotateCcw, { className: "w-4 h-4 mr-2" }), "\u624B\u52D5\u540C\u671F"] })] })] })] }), _jsxs("div", { className: "card", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "\u55B6\u696D\u6642\u9593\u30FB\u5B9A\u4F11\u65E5\u8A2D\u5B9A" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u958B\u5E97\u6642\u9593" }), _jsx("select", { value: businessSettings.openHour, onChange: (e) => setBusinessSettings(prev => ({ ...prev, openHour: parseInt(e.target.value) })), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: Array.from({ length: 24 }, (_, i) => (_jsxs("option", { value: i, children: [i, ":00"] }, i))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u9589\u5E97\u6642\u9593" }), _jsx("select", { value: businessSettings.closeHour, onChange: (e) => setBusinessSettings(prev => ({ ...prev, closeHour: parseInt(e.target.value) })), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: Array.from({ length: 24 }, (_, i) => (_jsxs("option", { value: i, children: [i, ":00"] }, i))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u4E88\u7D04\u9593\u9694" }), _jsxs("select", { value: businessSettings.timeSlotMinutes, onChange: (e) => setBusinessSettings(prev => ({ ...prev, timeSlotMinutes: parseInt(e.target.value) })), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: 15, children: "15\u5206" }), _jsx("option", { value: 30, children: "30\u5206" }), _jsx("option", { value: 60, children: "60\u5206" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u5B9A\u4F11\u65E5" }), _jsx("div", { className: "flex flex-wrap gap-2", children: ['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: businessSettings.closedDays.includes(index), onChange: (e) => {
                                                                                    if (e.target.checked) {
                                                                                        setBusinessSettings(prev => ({
                                                                                            ...prev,
                                                                                            closedDays: [...prev.closedDays, index]
                                                                                        }));
                                                                                    }
                                                                                    else {
                                                                                        setBusinessSettings(prev => ({
                                                                                            ...prev,
                                                                                            closedDays: prev.closedDays.filter(d => d !== index)
                                                                                        }));
                                                                                    }
                                                                                }, className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2" }), _jsxs("span", { className: "text-sm text-gray-700", children: [day, "\u66DC\u65E5"] })] }, index))) })] }), _jsx("div", { className: "pt-4 border-t border-gray-200", children: _jsxs("button", { className: "btn btn-primary", children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "\u8A2D\u5B9A\u3092\u4FDD\u5B58"] }) })] })] }), _jsxs("div", { className: "card", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "\u30B7\u30B9\u30C6\u30E0\u8A2D\u5B9A" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "\u901A\u77E5\u8A2D\u5B9A" }), _jsx("p", { className: "text-xs text-gray-500", children: "\u65B0\u3057\u3044\u30E1\u30C3\u30BB\u30FC\u30B8\u3084\u4E88\u7D04\u306E\u901A\u77E5\u3092\u7BA1\u7406\u3057\u307E\u3059" })] }), _jsx("button", { className: "btn btn-secondary btn-sm", children: "\u8A2D\u5B9A" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "\u30C7\u30FC\u30BF\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7" }), _jsx("p", { className: "text-xs text-gray-500", children: "\u5B9A\u671F\u7684\u306A\u30C7\u30FC\u30BF\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u3092\u8A2D\u5B9A\u3057\u307E\u3059" })] }), _jsx("button", { className: "btn btn-secondary btn-sm", children: "\u8A2D\u5B9A" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "API\u8A2D\u5B9A" }), _jsx("p", { className: "text-xs text-gray-500", children: "Instagram\u30FBLINE API\u306E\u8A2D\u5B9A\u3092\u7BA1\u7406\u3057\u307E\u3059" })] }), _jsx("button", { className: "btn btn-secondary btn-sm", children: "\u8A2D\u5B9A" })] })] })] })] }))] }) })] }), showCustomerModal && selectedCustomer && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4", children: _jsx("div", { className: "bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 flex items-center", children: [_jsx(User, { className: "w-6 h-6 mr-2" }), "\u9867\u5BA2\u30AB\u30EB\u30C6 - ", selectedCustomer.name] }), _jsx("button", { onClick: () => {
                                            setShowCustomerModal(false);
                                            setSelectedCustomer(null);
                                        }, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2", children: "\u57FA\u672C\u60C5\u5831" }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "\u6C0F\u540D" }), _jsx("p", { className: "text-gray-900 font-medium", children: selectedCustomer.name })] }), selectedCustomer.phone && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "\u96FB\u8A71\u756A\u53F7" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("a", { href: `tel:${selectedCustomer.phone}`, className: "text-blue-600 hover:text-blue-700 font-medium", children: selectedCustomer.phone }), _jsx(Phone, { className: "w-4 h-4 text-gray-400" })] })] })), selectedCustomer.email && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: () => handleEmailClick(selectedCustomer.email), className: "text-blue-600 hover:text-blue-700 font-medium", children: selectedCustomer.email }), _jsx(Mail, { className: "w-4 h-4 text-gray-400" })] })] })), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "\u767B\u9332\u65E5" }), _jsx("p", { className: "text-gray-900", children: format(new Date(selectedCustomer.createdAt), 'yyyy年M月d日', { locale: ja }) })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2", children: "\u6765\u5E97\u60C5\u5831" }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "\u6765\u5E97\u56DE\u6570" }), _jsxs("p", { className: "text-2xl font-bold text-blue-600", children: [selectedCustomer.visitCount, "\u56DE"] })] }), selectedCustomer.lastVisitDate && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "\u6700\u7D42\u6765\u5E97\u65E5" }), _jsx("p", { className: "text-gray-900 font-medium", children: format(new Date(selectedCustomer.lastVisitDate), 'yyyy年M月d日', { locale: ja }) }), _jsxs("p", { className: "text-sm text-gray-500", children: ["\uFF08", Math.floor((new Date().getTime() - new Date(selectedCustomer.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24)), "\u65E5\u524D\uFF09"] })] }))] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2 mb-4", children: "SNS\u9023\u643A" }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [selectedCustomer.instagramId && (_jsxs("button", { onClick: () => handleInstagramClick(selectedCustomer.instagramId), className: "flex items-center text-sm text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-3 py-2 rounded-md transition-colors", children: [_jsx(Instagram, { className: "w-4 h-4 mr-2" }), "Instagram: ", selectedCustomer.instagramId, _jsx(ExternalLink, { className: "w-4 h-4 ml-2" })] })), selectedCustomer.lineId && (_jsxs("button", { onClick: () => handleLineAppClick(selectedCustomer.lineId), className: "flex items-center text-sm text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-md transition-colors", children: [_jsx(MessageCircle, { className: "w-4 h-4 mr-2" }), "LINE\u9023\u643A\u6E08\u307F", _jsx(ExternalLink, { className: "w-4 h-4 ml-2" })] }))] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2 mb-4", children: "\u30AB\u30EB\u30C6\u30E1\u30E2" }), _jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsx("textarea", { rows: 4, placeholder: "\u9867\u5BA2\u306E\u7279\u8A18\u4E8B\u9805\u3001\u597D\u307F\u3001\u30A2\u30EC\u30EB\u30AE\u30FC\u60C5\u5831\u306A\u3069\u3092\u8A18\u9332...", className: "w-full border-0 bg-transparent resize-none focus:outline-none text-sm", defaultValue: "\u30FB\u30D6\u30E9\u30A6\u30F3\u7CFB\u30AB\u30E9\u30FC\u5E0C\u671B\\n\u30FB\u6BDB\u91CF\u591A\u3081\\n\u30FB\u654F\u611F\u808C\u306E\u305F\u3081\u3001\u30D1\u30C3\u30C1\u30C6\u30B9\u30C8\u5FC5\u8981\\n\u30FB\u6B21\u56DE\u4E88\u7D04: \u30AB\u30C3\u30C8 + \u30AB\u30E9\u30FC\u5E0C\u671B" }) })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200", children: [_jsxs("button", { className: "btn btn-primary flex items-center", children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "\u30AB\u30EB\u30C6\u3092\u66F4\u65B0"] }), _jsxs("button", { onClick: () => setActiveTab('messages'), className: "btn btn-secondary flex items-center", children: [_jsx(MessageSquare, { className: "w-4 h-4 mr-2" }), "\u30E1\u30C3\u30BB\u30FC\u30B8\u5C65\u6B74"] }), _jsxs("button", { onClick: () => setActiveTab('reservations'), className: "btn btn-secondary flex items-center", children: [_jsx(CalendarIcon, { className: "w-4 h-4 mr-2" }), "\u4E88\u7D04\u5C65\u6B74"] })] })] })] }) }) }))] }));
}
export default App;
