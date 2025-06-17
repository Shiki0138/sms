import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import PlanBadge from './components/Common/PlanBadge';
import PlanLimitNotifications from './components/Common/PlanLimitNotifications';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import UserProfile from './components/Auth/UserProfile';
import CustomerAnalyticsDashboard from './components/Analytics/CustomerAnalyticsDashboard';
import PremiumMarketingDashboard from './components/Analytics/PremiumMarketingDashboard';
import { getEnvironmentConfig, logEnvironmentInfo } from './utils/environment';
import AdvancedHolidaySettings from './components/Settings/AdvancedHolidaySettings';
import ExternalAPISettings from './components/Settings/ExternalAPISettings';
import OpenAISettings from './components/Settings/OpenAISettings';
import NotificationSettings from './components/Settings/NotificationSettings';
import { ReminderSettings } from './components/Settings/ReminderSettings';
import DataBackupSettings from './components/Settings/DataBackupSettings';
import MenuManagement from './components/Settings/MenuManagement';
import UpgradePlan from './components/Settings/UpgradePlan';
import SalonCalendar from './components/Calendar/SalonCalendar';
import MonthCalendar from './components/Calendar/MonthCalendar';
import NewReservationModal from './components/Calendar/NewReservationModal';
import CSVImporter from './components/CSVImporter';
import BulkMessageSender from './components/BulkMessageSender';
import ServiceHistoryModal from './components/ServiceHistoryModal';
import FeatureRequestForm from './components/FeatureRequestForm';
import FilteredCustomerView from './components/FilteredCustomerView';
import { MessageSquare, Calendar, Users, BarChart3, Settings, Instagram, MessageCircle, Clock, CheckCircle, AlertCircle, Phone, Mail, Send, Menu, X, ExternalLink, Save, User, UserCheck, Calendar as CalendarIcon, FileText, ChevronLeft, ChevronRight, Scissors, Palette, Star, Sparkles, Bot, Loader2, Shield, Lightbulb } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format, isToday, isTomorrow, getDay, getWeekOfMonth } from 'date-fns';
import { ja } from 'date-fns/locale';
import { dummyCustomers, serviceHistory, pastReservations, futureReservations, messageThreads } from './data/dummyData';
// ダミーデータをグローバルに登録（分析画面で使用）
if (typeof window !== 'undefined') {
    window.dummyCustomers = dummyCustomers;
    window.serviceHistory = serviceHistory;
}
const API_BASE_URL = 'http://localhost:8080/api/v1';
const USE_DUMMY_DATA = true; // ダミーデータ使用フラグ
function App() {
    // 環境設定の初期化
    const config = getEnvironmentConfig();
    useEffect(() => {
        // 環境情報をログ出力
        logEnvironmentInfo();
        // 開発環境での警告表示
        if (config.isDevelopment && config.showProductionWarnings) {
            console.warn('🚧 Development Environment - Some features are restricted');
        }
    }, []);
    const [activeTab, setActiveTab] = useState('messages');
    const [activeView, setActiveView] = useState('main');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const [replyingToThread, setReplyingToThread] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [isGeneratingAIReply, setIsGeneratingAIReply] = useState(null);
    const [customerNotes, setCustomerNotes] = useState('');
    const [showCustomerMessages, setShowCustomerMessages] = useState(false);
    const [showCustomerReservations, setShowCustomerReservations] = useState(false);
    // Filtered customer view states
    const [showFilteredCustomerView, setShowFilteredCustomerView] = useState(false);
    const [filteredCustomerViewType, setFilteredCustomerViewType] = useState('messages');
    const [filteredCustomerId, setFilteredCustomerId] = useState('');
    const [filteredCustomerName, setFilteredCustomerName] = useState('');
    // Feature requests state for admin notifications
    const [featureRequests, setFeatureRequests] = useState([]);
    const [unreadFeatureRequests, setUnreadFeatureRequests] = useState(0);
    // New customer registration modal state
    const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState({
        name: '',
        phone: '',
        email: '',
        instagramId: '',
        lineId: '',
        notes: ''
    });
    // CSV Import modal state
    const [showCSVImporter, setShowCSVImporter] = useState(false);
    // Bulk Message Sender state
    const [showBulkMessageSender, setShowBulkMessageSender] = useState(false);
    // Service History Modal state
    const [showServiceHistoryModal, setShowServiceHistoryModal] = useState(false);
    const [selectedServiceHistory, setSelectedServiceHistory] = useState(null);
    // New reservation modal state
    const [showNewReservationModal, setShowNewReservationModal] = useState(false);
    const [selectedReservationDate, setSelectedReservationDate] = useState();
    const [selectedReservationTime, setSelectedReservationTime] = useState();
    // Reservations state for live updates
    const [liveReservations, setLiveReservations] = useState([]);
    // Initialize live reservations from dummy data
    useEffect(() => {
        const allReservations = [...pastReservations, ...futureReservations];
        setLiveReservations(allReservations);
    }, []);
    // Settings state
    // Business settings state
    const [businessSettings, setBusinessSettings] = useState({
        openHour: 9,
        closeHour: 18,
        timeSlotMinutes: 30,
        closedDays: [1], // Sunday = 0, Monday = 1, etc. (月曜日定休)
        nthWeekdayRules: [{ nth: [2, 4], weekday: 2 }], // 毎月第2・第4火曜日
        customClosedDates: ['2025-01-01', '2025-12-31'] // YYYY-MM-DD format
    });
    // Calendar view state
    const [calendarView, setCalendarView] = useState('week');
    const [calendarDate, setCalendarDate] = useState(new Date());
    // Fetch data
    const { data: threads } = useQuery({
        queryKey: ['threads'],
        queryFn: () => {
            if (USE_DUMMY_DATA) {
                // メッセージスレッドを新しい順にソート
                const sortedThreads = [...messageThreads].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                return Promise.resolve({ threads: sortedThreads });
            }
            return axios.get(`${API_BASE_URL}/messages/threads`).then(res => res.data);
        }
    });
    const { data: customers } = useQuery({
        queryKey: ['customers'],
        queryFn: () => {
            if (USE_DUMMY_DATA) {
                return Promise.resolve({ customers: dummyCustomers });
            }
            return axios.get(`${API_BASE_URL}/customers`).then(res => res.data);
        }
    });
    const { data: reservations } = useQuery({
        queryKey: ['reservations'],
        queryFn: () => {
            if (USE_DUMMY_DATA) {
                // 過去の予約と未来の予約を結合
                return Promise.resolve({
                    reservations: [...pastReservations, ...futureReservations]
                });
            }
            return axios.get(`${API_BASE_URL}/reservations`).then(res => res.data);
        }
    });
    // Staff list (demo data)
    const staffList = [
        { id: 'staff1', name: '田中 美咲' },
        { id: 'staff2', name: '佐藤 麗子' },
        { id: 'staff3', name: '山田 花音' },
        { id: 'staff4', name: '鈴木 あゆみ' }
    ];
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
    const handleLineClick = () => {
        // Try to open LINE app on mobile, fallback to web
        const lineUrl = 'line://';
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
        const dayOfWeek = getDay(date);
        const dateString = format(date, 'yyyy-MM-dd');
        // 毎週の定休日チェック
        if (businessSettings.closedDays.includes(dayOfWeek)) {
            return true;
        }
        // 毎月第◯◯曜日チェック
        for (const rule of businessSettings.nthWeekdayRules) {
            if (dayOfWeek === rule.weekday) {
                const weekOfMonth = getWeekOfMonth(date, { weekStartsOn: 1 });
                if (rule.nth.includes(weekOfMonth)) {
                    return true;
                }
            }
        }
        // 特定日チェック
        return businessSettings.customClosedDates.includes(dateString);
    };
    // Get holiday type for display
    const getHolidayType = (date) => {
        const dayOfWeek = getDay(date);
        const dateString = format(date, 'yyyy-MM-dd');
        const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
        // 毎週の定休日チェック
        if (businessSettings.closedDays.includes(dayOfWeek)) {
            return `定休日（${dayNames[dayOfWeek]}曜日）`;
        }
        // 毎月第◯◯曜日チェック
        for (const rule of businessSettings.nthWeekdayRules) {
            if (dayOfWeek === rule.weekday) {
                const weekOfMonth = getWeekOfMonth(date, { weekStartsOn: 1 });
                if (rule.nth.includes(weekOfMonth)) {
                    const nthText = rule.nth.map(n => `第${n}`).join('・');
                    return `定休日（${nthText}${dayNames[dayOfWeek]}曜日）`;
                }
            }
        }
        // 特定日チェック
        if (businessSettings.customClosedDates.includes(dateString)) {
            return '特別休業日';
        }
        return null;
    };
    // Get reservations for a specific date and time slot
    const getReservationsForSlot = (date, timeSlot) => {
        return liveReservations.filter(r => {
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
    // Handle stylist notes update
    const handleUpdateStylistNotes = (reservationId, notes) => {
        // In a real app, this would make an API call to update the notes
        console.log('Updating stylist notes for reservation:', reservationId, notes);
        // For demo purposes, we'll just update the selected service history
        if (selectedServiceHistory && selectedServiceHistory.id === reservationId) {
            setSelectedServiceHistory({
                ...selectedServiceHistory,
                stylistNotes: notes
            });
        }
        // Show success message
        alert('美容師メモが更新されました！');
    };
    // Handle service history click
    const handleServiceHistoryClick = (reservation) => {
        setSelectedServiceHistory(reservation);
        setShowServiceHistoryModal(true);
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
    // Handle AI reply generation
    const handleAIReplyClick = async (threadId) => {
        setIsGeneratingAIReply(threadId);
        try {
            // AI返信生成（デモ用）
            const thread = threads?.threads.find(t => t.id === threadId);
            if (!thread)
                return;
            const lastMessage = thread.lastMessage.content;
            const customerName = thread.customer.name;
            // デモ用の返信生成ロジック
            await new Promise(resolve => setTimeout(resolve, 1500)); // 生成中の演出
            let generatedReply = '';
            if (lastMessage.includes('予約') || lastMessage.includes('空いて')) {
                generatedReply = `${customerName}様、お問い合わせありがとうございます。ご希望のお日にちをお聞かせください。お客様に最適なお時間をご提案させていただきます。`;
            }
            else if (lastMessage.includes('カット') || lastMessage.includes('カラー')) {
                generatedReply = `${customerName}様、いつもありがとうございます。ご希望のスタイルについて詳しくお聞かせください。`;
            }
            else if (lastMessage.includes('料金') || lastMessage.includes('値段')) {
                generatedReply = `${customerName}様、お問い合わせありがとうございます。当店のメニュー料金についてご案内いたします。詳細はお気軽にお尋ねください。`;
            }
            else {
                generatedReply = `${customerName}様、いつもありがとうございます。お気軽にご相談ください。スタッフ一同、心よりお待ちしております。`;
            }
            setReplyMessage(generatedReply);
        }
        catch (error) {
            console.error('AI reply generation error:', error);
            alert('AI返信の生成に失敗しました');
        }
        finally {
            setIsGeneratingAIReply(null);
        }
    };
    // Handle new reservation creation
    const handleNewReservation = () => {
        setSelectedReservationDate(undefined);
        setSelectedReservationTime(undefined);
        setShowNewReservationModal(true);
    };
    const handleTimeSlotClick = (date, hour, minute) => {
        setSelectedReservationDate(date);
        setSelectedReservationTime(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        setShowNewReservationModal(true);
    };
    const handleSaveReservation = (newReservation) => {
        // デモ用：実際の実装では、サーバーに保存する
        console.log('新規予約作成:', newReservation);
        alert('予約が正常に作成されました！');
        // 予約データを更新（デモ用）
        // 実際の実装では、React Queryのinvalidateを使用
    };
    // Handle customer notes update
    const handleUpdateCustomerNotes = () => {
        if (!selectedCustomer)
            return;
        // デモ用：実際の実装では、サーバーに保存する
        console.log('カルテ更新:', { customerId: selectedCustomer.id, notes: customerNotes });
        alert(`${selectedCustomer.name}様のカルテを更新しました！`);
        // 実際の実装では、React Queryのinvalidateを使用してデータを更新
    };
    // Handle showing customer messages
    const handleShowCustomerMessages = () => {
        if (!selectedCustomer)
            return;
        // モーダルを閉じて、フィルタービューに切り替え
        setShowCustomerModal(false);
        setFilteredCustomerId(selectedCustomer.id);
        setFilteredCustomerName(selectedCustomer.name);
        setFilteredCustomerViewType('messages');
        setShowFilteredCustomerView(true);
        setSelectedCustomer(null);
    };
    // Handle showing customer reservations
    const handleShowCustomerReservations = () => {
        if (!selectedCustomer)
            return;
        // モーダルを閉じて、フィルタービューに切り替え
        setShowCustomerModal(false);
        setFilteredCustomerId(selectedCustomer.id);
        setFilteredCustomerName(selectedCustomer.name);
        setFilteredCustomerViewType('reservations');
        setShowFilteredCustomerView(true);
        setSelectedCustomer(null);
    };
    // Handle going back from filtered customer view
    const handleBackFromFilteredView = () => {
        setShowFilteredCustomerView(false);
        setFilteredCustomerId('');
        setFilteredCustomerName('');
        setActiveTab('customers');
    };
    // Handle new feature request submission
    const handleNewFeatureRequest = (request) => {
        setFeatureRequests(prev => [request, ...prev]);
        setUnreadFeatureRequests(prev => prev + 1);
    };
    // Handle new customer registration
    const handleNewCustomerRegistration = () => {
        setShowNewCustomerModal(true);
    };
    // Handle save new customer
    const handleSaveNewCustomer = () => {
        if (!newCustomerData.name.trim()) {
            alert('顧客名を入力してください');
            return;
        }
        // デモ用：実際の実装では、サーバーに保存する
        const nextCustomerNumber = `C${String(customers?.customers.length + 1 || 1).padStart(3, '0')}`;
        console.log('新規顧客登録:', {
            customerNumber: nextCustomerNumber,
            ...newCustomerData,
            id: `cust${String(Date.now()).slice(-6)}`,
            visitCount: 0,
            createdAt: new Date().toISOString()
        });
        alert(`${newCustomerData.name}様（${nextCustomerNumber}）を新規登録しました！`);
        // フォームをリセット
        setNewCustomerData({
            name: '',
            phone: '',
            email: '',
            instagramId: '',
            lineId: '',
            notes: ''
        });
        setShowNewCustomerModal(false);
        // 実際の実装では、React Queryのinvalidateを使用してデータを更新
    };
    // Handle cancel new customer registration
    const handleCancelNewCustomer = () => {
        setNewCustomerData({
            name: '',
            phone: '',
            email: '',
            instagramId: '',
            lineId: '',
            notes: ''
        });
        setShowNewCustomerModal(false);
    };
    // Handle CSV import
    const handleCSVImport = (importedCustomers) => {
        console.log('CSV Import:', importedCustomers);
        // デモ用：実際の実装では、サーバーに送信して一括登録
        const successCount = importedCustomers.length;
        alert(`${successCount}件の顧客データをインポートしました！\n\n内訳:\n・ホットペッパービューティー: ${importedCustomers.filter(c => c.source === 'HOTPEPPER').length}件\n・手動追加: ${importedCustomers.filter(c => c.source === 'MANUAL').length}件`);
        setShowCSVImporter(false);
        // 実際の実装では、React Queryのinvalidateを使用してデータを更新
    };
    // Handle new reservation save
    const handleSaveNewReservation = (reservationData) => {
        // 重複チェック
        const isDuplicate = liveReservations.some(existing => existing.startTime === reservationData.startTime &&
            existing.customerName === reservationData.customerName &&
            existing.menuContent === reservationData.menuContent);
        if (isDuplicate) {
            alert('同じ予約が既に存在します。');
            return;
        }
        // 新しい予約オブジェクトを作成
        const newReservation = {
            id: reservationData.id || `res_${Date.now()}`,
            startTime: reservationData.startTime,
            endTime: reservationData.endTime,
            menuContent: reservationData.menuContent,
            customerName: reservationData.customerName,
            customer: reservationData.customer,
            staff: reservationData.staff,
            source: reservationData.source,
            status: reservationData.status,
            notes: reservationData.notes,
            price: reservationData.price,
            stylistNotes: ''
        };
        // ライブ予約データに追加
        setLiveReservations(prev => [...prev, newReservation]);
        // モーダルを閉じる
        setShowNewReservationModal(false);
        setSelectedReservationDate(undefined);
        setSelectedReservationTime(undefined);
        alert(`${reservationData.customerName}様の予約を登録しました！\n日時: ${format(new Date(newReservation.startTime), 'M月d日 HH:mm', { locale: ja })}\nメニュー: ${reservationData.menuContent}`);
    };
    // Handle bulk message send
    const handleBulkMessageSend = (selectedCustomers, message, channels) => {
        console.log('Bulk Message Send:', {
            recipients: selectedCustomers.length,
            message,
            channels: channels.reduce((acc, channel) => {
                acc[channel] = (acc[channel] || 0) + 1;
                return acc;
            }, {})
        });
        // デモ用：実際の実装では、各チャンネルのAPIに送信
        const channelCounts = channels.reduce((acc, channel) => {
            acc[channel] = (acc[channel] || 0) + 1;
            return acc;
        }, {});
        let resultMessage = `${selectedCustomers.length}名にメッセージを送信しました！\n\n送信内訳:\n`;
        if (channelCounts['LINE'])
            resultMessage += `・LINE: ${channelCounts['LINE']}名\n`;
        if (channelCounts['Instagram'])
            resultMessage += `・Instagram: ${channelCounts['Instagram']}名\n`;
        if (channelCounts['Email'])
            resultMessage += `・Email: ${channelCounts['Email']}名\n`;
        // 実際の実装では、LINEメッセージAPI、Instagram Graph API、SMTPなどを使用
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
    const MessagesList = () => (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-xl md:text-2xl font-bold text-gray-900", children: "\u30E1\u30C3\u30BB\u30FC\u30B8\u7BA1\u7406" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800", children: [threads?.threads.filter(t => t.status === 'OPEN').length || 0, " \u672A\u5BFE\u5FDC"] }), _jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800", children: [threads?.threads.filter(t => t.status === 'IN_PROGRESS').length || 0, " \u5BFE\u5FDC\u4E2D"] }), _jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800", children: [threads?.threads.filter(t => t.status === 'CLOSED').length || 0, " \u5B8C\u4E86"] })] })] }), _jsxs("div", { className: "space-y-3", children: [threads?.threads.map((thread) => (_jsx("div", { className: "bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow", children: _jsxs("div", { className: "p-4 space-y-3", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start space-x-3 flex-1 min-w-0", children: [_jsx("div", { className: "flex-shrink-0 mt-1", children: getChannelIcon(thread.channel) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1 flex-wrap", children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 truncate", children: thread.customer.name }), getStatusBadge(thread.status), thread.unreadCount > 0 && (_jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800", children: thread.unreadCount }))] }), _jsx("p", { className: "text-sm text-gray-600 mb-2 break-words", children: thread.lastMessage.content }), _jsxs("div", { className: "flex items-center text-xs text-gray-500 flex-wrap gap-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), formatDate(thread.lastMessage.createdAt)] }), thread.assignedStaff && thread.customer.id && (_jsxs("div", { className: "flex items-center", children: [_jsx(UserCheck, { className: "w-3 h-3 mr-1" }), _jsxs("span", { className: "text-xs", children: ["\u62C5\u5F53: ", thread.assignedStaff.name] })] })), !thread.customer.id && (_jsxs("div", { className: "flex items-center text-yellow-600", children: [_jsx(AlertCircle, { className: "w-3 h-3 mr-1" }), _jsx("span", { className: "text-xs", children: "\u65B0\u898F\u554F\u3044\u5408\u308F\u305B" })] }))] })] })] }), _jsx("div", { className: "flex-shrink-0 ml-2", children: _jsxs("button", { onClick: () => setReplyingToThread(replyingToThread === thread.id ? null : thread.id), className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors", children: [_jsx(Send, { className: "w-4 h-4 mr-1 inline" }), "\u8FD4\u4FE1"] }) })] }), replyingToThread === thread.id && (_jsxs("div", { className: "border-t pt-3", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start space-x-2", children: [_jsx("textarea", { value: replyMessage, onChange: (e) => setReplyMessage(e.target.value), placeholder: "\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u5165\u529B...", className: "flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none", rows: 3, onKeyPress: (e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    handleSendReply(thread.id);
                                                                }
                                                            } }), _jsx("button", { onClick: () => handleAIReplyClick(thread.id), disabled: isGeneratingAIReply === thread.id, className: "bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-md transition-colors flex-shrink-0 flex items-center space-x-1 text-sm", title: "AI\u8FD4\u4FE1\u751F\u6210", children: isGeneratingAIReply === thread.id ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), _jsx("span", { children: "\u751F\u6210\u4E2D..." })] })) : (_jsxs(_Fragment, { children: [_jsx(Bot, { className: "w-4 h-4" }), _jsx("span", { children: "AI\u8FD4\u4FE1" })] })) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs text-gray-500", children: "Enter \u3067\u9001\u4FE1\u3001Shift+Enter \u3067\u6539\u884C" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: () => {
                                                                        setReplyingToThread(null);
                                                                        setReplyMessage('');
                                                                    }, className: "px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx("button", { onClick: () => handleSendReply(thread.id), disabled: !replyMessage.trim(), className: "bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1 rounded-md text-sm font-medium transition-colors", children: "\u9001\u4FE1" })] })] })] }), _jsxs("div", { className: "mt-3 pt-3 border-t border-gray-200", children: [_jsx("p", { className: "text-xs text-gray-600 mb-2", children: "\u3088\u304F\u4F7F\u3046\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8:" }), _jsx("div", { className: "flex flex-wrap gap-2", children: [
                                                        'いつもありがとうございます',
                                                        'お疲れ様でした',
                                                        'ご来店ありがとうございました',
                                                        'お気軽にご連絡ください'
                                                    ].map((template, idx) => (_jsx("button", { onClick: () => setReplyMessage(template), className: "text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors", children: template }, idx))) })] })] }))] }) }, thread.id))), (!threads?.threads || threads.threads.length === 0) && (_jsxs("div", { className: "text-center py-8 bg-white rounded-lg border border-gray-200", children: [_jsx(MessageSquare, { className: "w-12 h-12 mx-auto mb-3 text-gray-300" }), _jsx("h3", { className: "text-lg font-medium text-gray-700 mb-2", children: "\u30E1\u30C3\u30BB\u30FC\u30B8\u304C\u3042\u308A\u307E\u305B\u3093" }), _jsx("p", { className: "text-gray-500", children: "\u65B0\u3057\u3044\u30E1\u30C3\u30BB\u30FC\u30B8\u304C\u5C4A\u304F\u3068\u3053\u3053\u306B\u8868\u793A\u3055\u308C\u307E\u3059" })] }))] })] }));
    const CustomersList = () => (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", children: [_jsx("h2", { className: "text-xl md:text-2xl font-bold text-gray-900", children: "\u9867\u5BA2\u7BA1\u7406" }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsxs("button", { onClick: () => setShowCSVImporter(true), className: "btn btn-secondary text-sm flex items-center", children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "CSV\u30A4\u30F3\u30DD\u30FC\u30C8"] }), _jsx("button", { onClick: handleNewCustomerRegistration, className: "btn btn-primary text-sm", children: "\u65B0\u898F\u9867\u5BA2\u767B\u9332" })] })] }), _jsx("div", { className: "bg-white rounded-lg border border-gray-200 p-4 mb-4", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsx("div", { className: "flex-1", children: _jsx("input", { type: "text", placeholder: "\u9867\u5BA2\u540D\u3001\u9867\u5BA2\u756A\u53F7\u3001\u96FB\u8A71\u756A\u53F7\u3067\u691C\u7D22...", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" }) }), _jsxs("button", { className: "btn btn-secondary text-sm", children: [_jsx(Users, { className: "w-4 h-4 mr-1" }), "\u691C\u7D22"] })] }) }), _jsx("div", { className: "space-y-4", children: customers?.customers.map((customer) => (_jsx("div", { className: "card hover:shadow-md transition-shadow", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start justify-between gap-3", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("button", { onClick: () => {
                                                    setSelectedCustomer(customer);
                                                    setShowCustomerModal(true);
                                                    // Load existing customer notes (demo implementation)
                                                    setCustomerNotes(`${customer.name}様の過去のカルテ情報がここに表示されます。\n\n例：\n- アレルギー: なし\n- 好みのスタイル: ショートカット\n- 注意事項: カラー剤に敏感`);
                                                }, className: "text-lg font-medium text-gray-900 mb-2 break-words hover:text-blue-600 transition-colors text-left", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded", children: customer.customerNumber }), _jsx("span", { children: customer.name })] }) }), _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600", children: [customer.phone && (_jsxs("div", { className: "flex items-center", children: [_jsx(Phone, { className: "w-4 h-4 mr-1 flex-shrink-0" }), _jsx("a", { href: `tel:${customer.phone}`, className: "break-all hover:text-blue-600 transition-colors", children: customer.phone })] })), customer.email && (_jsxs("div", { className: "flex items-center", children: [_jsx(Mail, { className: "w-4 h-4 mr-1 flex-shrink-0" }), _jsx("button", { onClick: () => handleEmailClick(customer.email), className: "break-all hover:text-blue-600 transition-colors text-left", children: customer.email })] }))] })] }), _jsxs("div", { className: "text-right flex-shrink-0", children: [_jsxs("div", { className: "text-sm font-medium text-gray-900", children: ["\u6765\u5E97\u56DE\u6570: ", customer.visitCount, "\u56DE"] }), customer.lastVisitDate && (_jsxs("div", { className: "text-xs text-gray-500", children: ["\u6700\u7D42\u6765\u5E97: ", format(new Date(customer.lastVisitDate), 'M月d日', { locale: ja })] }))] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100", children: [customer.source === 'HOTPEPPER' && (_jsxs("span", { className: "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800", children: [_jsx(FileText, { className: "w-3 h-3 mr-1" }), "\u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC"] })), customer.source === 'MANUAL' && (_jsxs("span", { className: "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800", children: [_jsx(Users, { className: "w-3 h-3 mr-1" }), "\u624B\u52D5\u767B\u9332"] })), customer.instagramId && (_jsxs("button", { onClick: () => handleInstagramClick(customer.instagramId), className: "flex items-center text-xs text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-2 py-1 rounded-md transition-colors", children: [_jsx(Instagram, { className: "w-3 h-3 mr-1" }), customer.instagramId, _jsx(ExternalLink, { className: "w-3 h-3 ml-1" })] })), customer.lineId && (_jsxs("button", { onClick: () => handleLineAppClick(customer.lineId), className: "flex items-center text-xs text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-md transition-colors", children: [_jsx(MessageCircle, { className: "w-3 h-3 mr-1" }), "LINE\u9023\u643A\u6E08\u307F", _jsx(ExternalLink, { className: "w-3 h-3 ml-1" })] })), customer.memberNumber && (_jsxs("span", { className: "text-xs text-gray-500 font-mono", children: ["\u4F1A\u54E1: ", customer.memberNumber] }))] })] }) }, customer.id))) })] }));
    const ReservationsList = () => (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg p-6 border border-gray-200", children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "\u4E88\u7D04\u7BA1\u7406" }), _jsx("p", { className: "text-gray-600", children: "\u4E88\u7D04\u306E\u78BA\u8A8D\u3068\u7BA1\u7406\u3092\u884C\u3044\u307E\u3059" })] }) }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsxs("div", { className: "flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200", children: [_jsx(Calendar, { className: "w-4 h-4 mr-2" }), _jsxs("span", { className: "font-medium", children: ["\u4ECA\u65E5: ", reservations?.reservations.filter(r => isToday(new Date(r.startTime))).length || 0, "\u4EF6"] })] }), _jsxs("div", { className: "flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200", children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), _jsx("span", { className: "font-medium", children: "\u78BA\u5B9A\u6E08\u307F" })] }), _jsxs("div", { className: "flex items-center bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg border border-yellow-200", children: [_jsx(Clock, { className: "w-4 h-4 mr-2" }), _jsx("span", { className: "font-medium", children: "\u4EEE\u4E88\u7D04" })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg p-6 border border-gray-200", children: [_jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "\u30AB\u30EC\u30F3\u30C0\u30FC\u8868\u793A" }), _jsx("div", { className: "flex items-center space-x-1 bg-gray-100 rounded-lg p-1", children: [
                                            { value: 'day', label: '日' },
                                            { value: 'threeDay', label: '3日' },
                                            { value: 'week', label: '週' },
                                            { value: 'month', label: '月' }
                                        ].map((view) => (_jsx("button", { onClick: () => setCalendarView(view.value), className: `px-3 py-1 text-sm font-medium rounded-md transition-colors ${calendarView === view.value
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'}`, children: view.label }, view.value))) })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("button", { onClick: handleNewReservation, className: "flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors", children: [_jsx(Calendar, { className: "w-4 h-4 mr-2" }), "\u65B0\u898F\u4E88\u7D04"] }), _jsxs("button", { onClick: () => {
                                            setLiveReservations([...pastReservations, ...futureReservations]);
                                            alert('予約データをリセットしました');
                                        }, className: "flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors", children: [_jsx(X, { className: "w-4 h-4 mr-2" }), "\u30EA\u30BB\u30C3\u30C8"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("button", { onClick: () => {
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
                                        }, className: "p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200", children: _jsx(ChevronLeft, { className: "w-5 h-5 text-gray-600" }) }), _jsx("div", { className: "text-center", children: _jsx("h3", { className: "text-lg font-medium text-gray-900", children: calendarView === 'month'
                                                ? format(calendarDate, 'yyyy年M月', { locale: ja })
                                                : calendarView === 'week'
                                                    ? `${format(calendarDate, 'M月d日', { locale: ja })} 週`
                                                    : calendarView === 'threeDay'
                                                        ? `${format(calendarDate, 'M月d日', { locale: ja })} (3日間)`
                                                        : format(calendarDate, 'M月d日', { locale: ja }) }) }), _jsx("button", { onClick: () => {
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
                                        }, className: "p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200", children: _jsx(ChevronRight, { className: "w-5 h-5 text-gray-600" }) })] }), _jsx("button", { onClick: () => setCalendarDate(new Date()), className: "flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors", children: "\u4ECA\u65E5" })] })] }), calendarView === 'month' ? (_jsx(MonthCalendar, { currentDate: calendarDate, onDateChange: setCalendarDate, reservations: liveReservations, isHoliday: isClosedDay, getHolidayType: getHolidayType, onDayClick: (date) => {
                    setCalendarDate(date);
                    setCalendarView('day');
                } })) : (_jsx(SalonCalendar, { reservations: liveReservations, view: calendarView, currentDate: calendarDate, onDateChange: setCalendarDate, onReservationClick: handleServiceHistoryClick, onTimeSlotClick: handleTimeSlotClick, businessHours: businessSettings, isHoliday: isClosedDay, getHolidayType: getHolidayType }))] }));
    const Dashboard = () => {
        const totalThreads = threads?.threads.length || 0;
        const todayReservations = liveReservations.filter(r => isToday(new Date(r.startTime))).length || 0;
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }), _jsx(PlanBadge, { onUpgradeClick: () => setActiveView('upgrade') })] }), _jsx(PlanLimitNotifications, {}), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx("button", { onClick: () => setActiveTab('messages'), className: "bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left cursor-pointer", children: _jsxs("div", { className: "flex items-center", children: [_jsx(MessageSquare, { className: "w-8 h-8 text-blue-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u7DCF\u30E1\u30C3\u30BB\u30FC\u30B8\u6570" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: totalThreads })] })] }) }), _jsx("button", { onClick: () => setActiveTab('messages'), className: "bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left cursor-pointer", children: _jsxs("div", { className: "flex items-center", children: [_jsx(AlertCircle, { className: "w-8 h-8 text-red-500" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u672A\u8AAD\u30E1\u30C3\u30BB\u30FC\u30B8" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: unreadCount })] })] }) }), _jsx("button", { onClick: () => setActiveTab('reservations'), className: "bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left cursor-pointer", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "w-8 h-8 text-green-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u4ECA\u65E5\u306E\u4E88\u7D04" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: todayReservations })] })] }) }), _jsx("button", { onClick: () => setActiveTab('customers'), className: "bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left cursor-pointer", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-8 h-8 text-purple-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u7DCF\u9867\u5BA2\u6570" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: customers?.customers.length || 0 })] })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "\u6700\u8FD1\u306E\u30E1\u30C3\u30BB\u30FC\u30B8" }), _jsx("button", { onClick: () => setActiveTab('messages'), className: "text-sm text-blue-600 hover:text-blue-700 font-medium", children: "\u3059\u3079\u3066\u898B\u308B \u2192" })] }), _jsxs("div", { className: "space-y-3", children: [threads?.threads.slice(0, 3).map((thread) => (_jsxs("button", { onClick: () => setActiveTab('messages'), className: "w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left", children: [getChannelIcon(thread.channel), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: thread.customer.name }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: thread.lastMessage.content })] }), _jsx("div", { className: "text-xs text-gray-400 flex-shrink-0", children: format(new Date(thread.lastMessage.createdAt), 'HH:mm') })] }, thread.id))), (!threads?.threads || threads.threads.length === 0) && (_jsx("div", { className: "text-center py-4 text-gray-500 text-sm", children: "\u30E1\u30C3\u30BB\u30FC\u30B8\u304C\u3042\u308A\u307E\u305B\u3093" }))] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "\u4ECA\u65E5\u306E\u4E88\u7D04" }), _jsx("button", { onClick: () => setActiveTab('reservations'), className: "text-sm text-blue-600 hover:text-blue-700 font-medium", children: "\u3059\u3079\u3066\u898B\u308B \u2192" })] }), _jsxs("div", { className: "space-y-3", children: [liveReservations
                                            .filter(r => isToday(new Date(r.startTime)))
                                            .slice(0, 3)
                                            .map((reservation) => (_jsxs("button", { onClick: () => setActiveTab('reservations'), className: "w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-500 flex-shrink-0" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: reservation.customerName }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: reservation.menuContent })] }), _jsx("div", { className: "text-xs text-gray-400 flex-shrink-0", children: format(new Date(reservation.startTime), 'HH:mm') })] }, reservation.id))), liveReservations.filter(r => isToday(new Date(r.startTime))).length === 0 && (_jsx("div", { className: "text-center py-4 text-gray-500 text-sm", children: "\u4ECA\u65E5\u306E\u4E88\u7D04\u306F\u3042\u308A\u307E\u305B\u3093" }))] })] })] })] }));
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40", children: _jsx("div", { className: "px-4 sm:px-6 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { onClick: () => setIsSidebarOpen(!isSidebarOpen), className: "md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors", children: isSidebarOpen ? _jsx(X, { className: "w-6 h-6" }) : _jsx(Menu, { className: "w-6 h-6" }) }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center", children: _jsx(Scissors, { className: "w-6 h-6" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-lg sm:text-xl font-bold text-gray-900", children: "\u7F8E\u5BB9\u5BA4\u7D71\u5408\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0" }), _jsx("p", { className: "text-xs text-gray-600 hidden sm:block", children: "\u7D71\u5408\u7BA1\u7406\u30D7\u30E9\u30C3\u30C8\u30D5\u30A9\u30FC\u30E0" })] })] })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx(PlanBadge, { variant: "compact", onUpgradeClick: () => setActiveView('upgrade') }), unreadCount > 0 && (_jsxs("div", { className: "flex items-center space-x-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm border border-red-200", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), _jsxs("span", { className: "font-medium", children: [unreadCount, "\u4EF6\u306E\u672A\u8AAD"] })] })), _jsxs("div", { className: "flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm border border-green-200", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full" }), _jsx("span", { className: "hidden sm:inline font-medium", children: "\u30AA\u30F3\u30E9\u30A4\u30F3" })] })] })] }) }) }), _jsxs("div", { className: "flex relative", children: [isSidebarOpen && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden", onClick: () => setIsSidebarOpen(false) })), _jsx("nav", { className: `
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:h-screen md:sticky md:top-16
        `, children: _jsxs("div", { className: "p-4 md:p-6 pt-20 md:pt-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("button", { onClick: () => {
                                                setActiveTab('dashboard');
                                                setIsSidebarOpen(false);
                                            }, className: `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'dashboard'
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'text-gray-700 hover:bg-gray-50'}`, children: [_jsx(BarChart3, { className: "w-5 h-5 flex-shrink-0" }), _jsx("span", { className: "font-medium", children: "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" })] }), _jsxs("button", { onClick: () => {
                                                setActiveTab('messages');
                                                setIsSidebarOpen(false);
                                            }, className: `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'messages'
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'text-gray-700 hover:bg-gray-50'}`, children: [_jsx(MessageSquare, { className: "w-5 h-5 flex-shrink-0" }), _jsx("span", { className: "font-medium", children: "\u30E1\u30C3\u30BB\u30FC\u30B8" }), unreadCount > 0 && (_jsx("span", { className: "ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium", children: unreadCount }))] }), _jsxs("button", { onClick: () => {
                                                setShowBulkMessageSender(true);
                                                setIsSidebarOpen(false);
                                            }, className: "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-50 ml-6", children: [_jsx(Send, { className: "w-4 h-4 flex-shrink-0" }), _jsx("span", { className: "font-medium text-sm", children: "\u30E1\u30C3\u30BB\u30FC\u30B8\u4E00\u6589\u9001\u4FE1" })] }), _jsxs("button", { onClick: () => {
                                                setActiveTab('reservations');
                                                setIsSidebarOpen(false);
                                            }, className: `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'reservations'
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'text-gray-700 hover:bg-gray-50'}`, children: [_jsx(Calendar, { className: "w-5 h-5 flex-shrink-0" }), _jsx("span", { className: "font-medium", children: "\u4E88\u7D04\u7BA1\u7406" })] }), _jsxs("button", { onClick: () => {
                                                setActiveTab('customers');
                                                setIsSidebarOpen(false);
                                            }, className: `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'customers'
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'text-gray-700 hover:bg-gray-50'}`, children: [_jsx(Users, { className: "w-5 h-5 flex-shrink-0" }), _jsx("span", { className: "font-medium", children: "\u9867\u5BA2\u7BA1\u7406" })] }), _jsxs("button", { onClick: () => {
                                                setActiveTab('analytics');
                                                setIsSidebarOpen(false);
                                            }, className: `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'analytics'
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'text-gray-700 hover:bg-gray-50'}`, children: [_jsx(BarChart3, { className: "w-5 h-5 flex-shrink-0" }), _jsx("span", { className: "font-medium", children: "\u5206\u6790" })] }), _jsxs("button", { onClick: () => {
                                                setActiveTab('premium-marketing');
                                                setIsSidebarOpen(false);
                                            }, className: `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'premium-marketing'
                                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                                : 'text-gray-700 hover:bg-gray-50'}`, children: [_jsx(Star, { className: "w-5 h-5 flex-shrink-0 text-yellow-500" }), _jsx("span", { className: "font-medium", children: "\u7D4C\u55B6\u6226\u7565 (Premium)" })] }), _jsxs("button", { onClick: () => {
                                                setActiveTab('menu-management');
                                                setIsSidebarOpen(false);
                                            }, className: `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'menu-management'
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'text-gray-700 hover:bg-gray-50'}`, children: [_jsx(Scissors, { className: "w-5 h-5 flex-shrink-0" }), _jsx("span", { className: "font-medium", children: "\u30E1\u30CB\u30E5\u30FC\u7BA1\u7406" })] }), _jsxs("button", { onClick: () => {
                                                setActiveTab('feature-request');
                                                setIsSidebarOpen(false);
                                                setUnreadFeatureRequests(0); // Clear notification count when visiting page
                                            }, className: `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'feature-request'
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'text-gray-700 hover:bg-gray-50'}`, children: [_jsx(Lightbulb, { className: "w-5 h-5 flex-shrink-0 text-yellow-500" }), _jsx("span", { className: "font-medium", children: "\u6A5F\u80FD\u6539\u5584\u8981\u671B" }), unreadFeatureRequests > 0 && (_jsx("span", { className: "ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center", children: unreadFeatureRequests }))] }), _jsxs("button", { onClick: () => {
                                                setActiveView('upgrade');
                                                setIsSidebarOpen(false);
                                            }, className: "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700", children: [_jsx(Sparkles, { className: "w-5 h-5 flex-shrink-0" }), _jsx("span", { className: "font-medium", children: "\u30D7\u30E9\u30F3\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9" })] }), _jsxs("button", { onClick: () => {
                                                setActiveTab('settings');
                                                setIsSidebarOpen(false);
                                            }, className: `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'settings'
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'text-gray-700 hover:bg-gray-50'}`, children: [_jsx(Settings, { className: "w-5 h-5 flex-shrink-0" }), _jsx("span", { className: "font-medium", children: "\u8A2D\u5B9A" })] })] }), _jsx("div", { className: "mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200", children: _jsx("div", { className: "text-center", children: _jsxs("p", { className: "text-xs text-gray-600 font-medium", children: ["\u672C\u65E5\u306E\u4E88\u7D04\u6570", _jsx("br", {}), reservations?.reservations.filter(r => isToday(new Date(r.startTime))).length || 0, "\u4EF6"] }) }) }), _jsx("div", { className: "mt-6", children: _jsx(UserProfile, {}) })] }) }), _jsx("main", { className: "flex-1 p-4 sm:p-6 max-w-full", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [activeView === 'upgrade' && (_jsxs("div", { children: [_jsx("div", { className: "mb-4", children: _jsxs("button", { onClick: () => setActiveView('main'), className: "flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors", children: [_jsx(ChevronLeft, { className: "w-4 h-4" }), _jsx("span", { children: "\u623B\u308B" })] }) }), _jsx(UpgradePlan, {})] })), activeView === 'main' && showFilteredCustomerView && (_jsx(FilteredCustomerView, { viewType: filteredCustomerViewType, customerId: filteredCustomerId, customerName: filteredCustomerName, allMessages: messageThreads || [], allReservations: [...(pastReservations || []), ...(futureReservations || []), ...(liveReservations || [])], onBack: handleBackFromFilteredView })), activeView === 'main' && !showFilteredCustomerView && activeTab === 'dashboard' && _jsx(Dashboard, {}), activeView === 'main' && !showFilteredCustomerView && activeTab === 'messages' && _jsx(MessagesList, {}), activeView === 'main' && !showFilteredCustomerView && activeTab === 'customers' && _jsx(CustomersList, {}), activeView === 'main' && !showFilteredCustomerView && activeTab === 'reservations' && _jsx(ReservationsList, {}), activeView === 'main' && !showFilteredCustomerView && activeTab === 'analytics' && _jsx(CustomerAnalyticsDashboard, {}), activeView === 'main' && !showFilteredCustomerView && activeTab === 'premium-marketing' && _jsx(PremiumMarketingDashboard, {}), activeView === 'main' && !showFilteredCustomerView && activeTab === 'feature-request' && _jsx(FeatureRequestForm, { onNewRequest: handleNewFeatureRequest }), activeView === 'main' && !showFilteredCustomerView && activeTab === 'api-settings' && (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-xl md:text-2xl font-bold text-gray-900", children: "\u5916\u90E8API\u9023\u643A\u8A2D\u5B9A" }), _jsx(ExternalAPISettings, {})] })), activeView === 'main' && !showFilteredCustomerView && activeTab === 'notification-settings' && (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-xl md:text-2xl font-bold text-gray-900", children: "\u901A\u77E5\u8A2D\u5B9A" }), _jsx(NotificationSettings, {})] })), activeView === 'main' && !showFilteredCustomerView && activeTab === 'backup-settings' && (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-xl md:text-2xl font-bold text-gray-900", children: "\u30C7\u30FC\u30BF\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u8A2D\u5B9A" }), _jsx(DataBackupSettings, {})] })), activeView === 'main' && !showFilteredCustomerView && activeTab === 'openai-settings' && (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-xl md:text-2xl font-bold text-gray-900", children: "OpenAI\u8A2D\u5B9A" }), _jsx(OpenAISettings, {})] })), activeView === 'main' && !showFilteredCustomerView && activeTab === 'menu-management' && (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-xl md:text-2xl font-bold text-gray-900", children: "\u30E1\u30CB\u30E5\u30FC\u7BA1\u7406" }), _jsx(MenuManagement, {})] })), activeView === 'main' && !showFilteredCustomerView && activeTab === 'settings' && (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-xl md:text-2xl font-bold text-gray-900", children: "\u8A2D\u5B9A" }), _jsxs("div", { className: "card", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx(Crown, { className: "w-5 h-5 mr-2 text-purple-600" }), "\u30D7\u30E9\u30F3\u7BA1\u7406"] }), _jsx(PlanBadge, { variant: "full", onUpgradeClick: () => setActiveView('upgrade') })] }), _jsx("div", { className: "card", children: _jsx(AdvancedHolidaySettings, {}) }), _jsx("div", { className: "card", children: _jsx(ReminderSettings, {}) }), _jsxs("div", { className: "card", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "\u57FA\u672C\u55B6\u696D\u6642\u9593\u8A2D\u5B9A" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u958B\u5E97\u6642\u9593" }), _jsx("select", { value: businessSettings.openHour, onChange: (e) => setBusinessSettings(prev => ({ ...prev, openHour: parseInt(e.target.value) })), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: Array.from({ length: 24 }, (_, i) => (_jsxs("option", { value: i, children: [i, ":00"] }, i))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u9589\u5E97\u6642\u9593" }), _jsx("select", { value: businessSettings.closeHour, onChange: (e) => setBusinessSettings(prev => ({ ...prev, closeHour: parseInt(e.target.value) })), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: Array.from({ length: 24 }, (_, i) => (_jsxs("option", { value: i, children: [i, ":00"] }, i))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u4E88\u7D04\u9593\u9694" }), _jsxs("select", { value: businessSettings.timeSlotMinutes, onChange: (e) => setBusinessSettings(prev => ({ ...prev, timeSlotMinutes: parseInt(e.target.value) })), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: 15, children: "15\u5206" }), _jsx("option", { value: 30, children: "30\u5206" }), _jsx("option", { value: 60, children: "60\u5206" })] })] })] }), _jsx("div", { className: "pt-4 border-t border-gray-200", children: _jsxs("button", { className: "btn btn-primary", children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "\u55B6\u696D\u6642\u9593\u8A2D\u5B9A\u3092\u4FDD\u5B58"] }) })] })] }), _jsxs("div", { className: "card", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "\u30B7\u30B9\u30C6\u30E0\u8A2D\u5B9A" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "\u901A\u77E5\u8A2D\u5B9A" }), _jsx("p", { className: "text-xs text-gray-500", children: "\u65B0\u3057\u3044\u30E1\u30C3\u30BB\u30FC\u30B8\u3084\u4E88\u7D04\u306E\u901A\u77E5\u3092\u7BA1\u7406\u3057\u307E\u3059" })] }), _jsx("button", { onClick: () => setActiveTab('notification-settings'), className: "btn btn-secondary btn-sm", children: "\u8A2D\u5B9A" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "\u30C7\u30FC\u30BF\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7" }), _jsx("p", { className: "text-xs text-gray-500", children: "\u5B9A\u671F\u7684\u306A\u30C7\u30FC\u30BF\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u3092\u8A2D\u5B9A\u3057\u307E\u3059" })] }), _jsx("button", { onClick: () => setActiveTab('backup-settings'), className: "btn btn-secondary btn-sm", children: "\u8A2D\u5B9A" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "\u5916\u90E8API\u9023\u643A\u8A2D\u5B9A" }), _jsx("p", { className: "text-xs text-gray-500", children: "LINE\u30FBInstagram API\u306E\u8A2D\u5B9A\u3092\u7BA1\u7406\u3057\u307E\u3059" })] }), _jsx("button", { onClick: () => setActiveTab('api-settings'), className: "btn btn-secondary btn-sm", children: "\u8A2D\u5B9A" })] })] })] }), _jsx(ProtectedRoute, { requiredResource: "*", requiredAction: "admin", requireAuth: false, children: _jsxs("div", { className: "card", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx(Shield, { className: "w-5 h-5 mr-2 text-red-600" }), "\u7BA1\u7406\u8005\u9650\u5B9A\u8A2D\u5B9A"] }), _jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "OpenAI\u8A2D\u5B9A" }), _jsx("p", { className: "text-xs text-gray-500", children: "AI\u8FD4\u4FE1\u6A5F\u80FD\u306E\u305F\u3081\u306EOpenAI API\u8A2D\u5B9A" })] }), _jsx("button", { onClick: () => setActiveTab('openai-settings'), className: "btn btn-secondary btn-sm", children: "\u8A2D\u5B9A" })] }) })] }) })] }))] }) })] }), showCustomerModal && selectedCustomer && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4", children: _jsx("div", { className: "bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col", children: _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 flex items-center", children: [_jsx(User, { className: "w-6 h-6 mr-2" }), "\u9867\u5BA2\u30AB\u30EB\u30C6 - ", selectedCustomer.customerNumber, " ", selectedCustomer.name] }), _jsx("button", { onClick: () => {
                                                setShowCustomerModal(false);
                                                setSelectedCustomer(null);
                                                setCustomerNotes('');
                                            }, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [selectedCustomer.source === 'HOTPEPPER' && (_jsxs("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800", children: [_jsx(FileText, { className: "w-3 h-3 mr-1" }), "\u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC\u30D3\u30E5\u30FC\u30C6\u30A3\u30FC"] })), selectedCustomer.source === 'MANUAL' && (_jsxs("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: [_jsx(Users, { className: "w-3 h-3 mr-1" }), "\u624B\u52D5\u767B\u9332"] })), selectedCustomer.source === 'LINE' && (_jsxs("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800", children: [_jsx(MessageCircle, { className: "w-3 h-3 mr-1" }), "LINE"] })), selectedCustomer.source === 'INSTAGRAM' && (_jsxs("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800", children: [_jsx(Instagram, { className: "w-3 h-3 mr-1" }), "Instagram"] }))] }), selectedCustomer.memberNumber && (_jsxs("span", { className: "text-sm text-gray-600", children: ["\u4F1A\u54E1\u756A\u53F7: ", _jsx("span", { className: "font-mono font-medium", children: selectedCustomer.memberNumber })] }))] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full border border-gray-200 rounded-lg", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u9805\u76EE" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u8A73\u7D30" })] }) }), _jsxs("tbody", { className: "bg-white divide-y divide-gray-200", children: [_jsxs("tr", { children: [_jsx("td", { className: "px-4 py-3 text-sm font-medium text-gray-900", children: "\u9867\u5BA2\u756A\u53F7" }), _jsx("td", { className: "px-4 py-3 text-sm text-blue-600 font-mono font-medium", children: selectedCustomer.customerNumber })] }), _jsxs("tr", { className: "bg-gray-50", children: [_jsx("td", { className: "px-4 py-3 text-sm font-medium text-gray-900", children: "\u6C0F\u540D" }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-900 font-medium", children: selectedCustomer.name })] }), selectedCustomer.furigana && (_jsxs("tr", { children: [_jsx("td", { className: "px-4 py-3 text-sm font-medium text-gray-900", children: "\u30D5\u30EA\u30AC\u30CA" }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600", children: selectedCustomer.furigana })] })), selectedCustomer.phone && (_jsxs("tr", { className: "bg-gray-50", children: [_jsx("td", { className: "px-4 py-3 text-sm font-medium text-gray-900", children: "\u96FB\u8A71\u756A\u53F7" }), _jsx("td", { className: "px-4 py-3 text-sm", children: _jsxs("a", { href: `tel:${selectedCustomer.phone}`, className: "text-blue-600 hover:text-blue-700 font-medium flex items-center", children: [selectedCustomer.phone, _jsx(Phone, { className: "w-3 h-3 ml-1" })] }) })] })), selectedCustomer.email && (_jsxs("tr", { children: [_jsx("td", { className: "px-4 py-3 text-sm font-medium text-gray-900", children: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9" }), _jsx("td", { className: "px-4 py-3 text-sm", children: _jsxs("button", { onClick: () => handleEmailClick(selectedCustomer.email), className: "text-blue-600 hover:text-blue-700 font-medium flex items-center", children: [selectedCustomer.email, _jsx(Mail, { className: "w-3 h-3 ml-1" })] }) })] })), selectedCustomer.birthDate && (_jsxs("tr", { className: "bg-gray-50", children: [_jsx("td", { className: "px-4 py-3 text-sm font-medium text-gray-900", children: "\u751F\u5E74\u6708\u65E5" }), _jsxs("td", { className: "px-4 py-3 text-sm text-gray-900", children: [format(new Date(selectedCustomer.birthDate), 'yyyy年M月d日', { locale: ja }), _jsxs("span", { className: "text-gray-500 ml-2", children: ["(", Math.floor((new Date().getTime() - new Date(selectedCustomer.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365)), "\u6B73)"] })] })] })), selectedCustomer.gender && (_jsxs("tr", { children: [_jsx("td", { className: "px-4 py-3 text-sm font-medium text-gray-900", children: "\u6027\u5225" }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-900", children: selectedCustomer.gender })] })), (selectedCustomer.zipCode || selectedCustomer.address) && (_jsxs("tr", { className: "bg-gray-50", children: [_jsx("td", { className: "px-4 py-3 text-sm font-medium text-gray-900", children: "\u4F4F\u6240" }), _jsxs("td", { className: "px-4 py-3 text-sm text-gray-900", children: [selectedCustomer.zipCode && (_jsxs("div", { className: "text-gray-600 text-xs", children: ["\u3012", selectedCustomer.zipCode] })), selectedCustomer.address] })] })), _jsxs("tr", { children: [_jsx("td", { className: "px-4 py-3 text-sm font-medium text-gray-900", children: "\u6765\u5E97\u56DE\u6570" }), _jsxs("td", { className: "px-4 py-3 text-sm", children: [_jsx("span", { className: "text-2xl font-bold text-blue-600", children: selectedCustomer.visitCount }), _jsx("span", { className: "text-gray-600 ml-1", children: "\u56DE" })] })] }), selectedCustomer.lastVisitDate && (_jsxs("tr", { className: "bg-gray-50", children: [_jsx("td", { className: "px-4 py-3 text-sm font-medium text-gray-900", children: "\u6700\u7D42\u6765\u5E97\u65E5" }), _jsxs("td", { className: "px-4 py-3 text-sm", children: [_jsx("div", { className: "text-gray-900 font-medium", children: format(new Date(selectedCustomer.lastVisitDate), 'yyyy年M月d日', { locale: ja }) }), _jsxs("div", { className: "text-gray-500 text-xs", children: [Math.floor((new Date().getTime() - new Date(selectedCustomer.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24)), "\u65E5\u524D"] })] })] })), _jsxs("tr", { children: [_jsx("td", { className: "px-4 py-3 text-sm font-medium text-gray-900", children: "\u767B\u9332\u65E5" }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-900", children: format(new Date(selectedCustomer.createdAt), 'yyyy年M月d日', { locale: ja }) })] }), selectedCustomer.registrationDate && selectedCustomer.registrationDate !== selectedCustomer.createdAt && (_jsxs("tr", { className: "bg-gray-50", children: [_jsx("td", { className: "px-4 py-3 text-sm font-medium text-gray-900", children: "\u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC\u767B\u9332\u65E5" }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-900", children: format(new Date(selectedCustomer.registrationDate), 'yyyy年M月d日', { locale: ja }) })] }))] })] }) }), selectedCustomer.source === 'HOTPEPPER' && (selectedCustomer.couponHistory || selectedCustomer.menuHistory) && (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2", children: "\u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC\u30D3\u30E5\u30FC\u30C6\u30A3\u30FC\u5229\u7528\u5C65\u6B74" }), selectedCustomer.couponHistory && (_jsxs("div", { className: "bg-orange-50 border border-orange-200 rounded-lg p-4", children: [_jsxs("h4", { className: "font-medium text-orange-900 mb-2 flex items-center", children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "\u30AF\u30FC\u30DD\u30F3\u5229\u7528\u5C65\u6B74"] }), _jsx("p", { className: "text-sm text-orange-800 whitespace-pre-line", children: selectedCustomer.couponHistory })] })), selectedCustomer.menuHistory && (_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsxs("h4", { className: "font-medium text-blue-900 mb-2 flex items-center", children: [_jsx(Scissors, { className: "w-4 h-4 mr-2" }), "\u30E1\u30CB\u30E5\u30FC\u5229\u7528\u5C65\u6B74"] }), _jsx("p", { className: "text-sm text-blue-800 whitespace-pre-line", children: selectedCustomer.menuHistory })] }))] })), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2 mb-4", children: "SNS\u9023\u643A" }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [selectedCustomer.instagramId && (_jsxs("button", { onClick: () => handleInstagramClick(selectedCustomer.instagramId), className: "flex items-center text-sm text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-3 py-2 rounded-md transition-colors", children: [_jsx(Instagram, { className: "w-4 h-4 mr-2" }), "Instagram: ", selectedCustomer.instagramId, _jsx(ExternalLink, { className: "w-4 h-4 ml-2" })] })), selectedCustomer.lineId && (_jsxs("button", { onClick: () => handleLineAppClick(selectedCustomer.lineId), className: "flex items-center text-sm text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-md transition-colors", children: [_jsx(MessageCircle, { className: "w-4 h-4 mr-2" }), "LINE\u9023\u643A\u6E08\u307F", _jsx(ExternalLink, { className: "w-4 h-4 ml-2" })] }))] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2 mb-4", children: "\u65BD\u8853\u5C65\u6B74" }), _jsxs("div", { className: "max-h-64 overflow-y-auto space-y-2 pr-2", children: [liveReservations
                                                            .filter(reservation => reservation.customer?.id === selectedCustomer.id &&
                                                            reservation.status === 'COMPLETED')
                                                            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                                                            .map((reservation, index) => (_jsxs("button", { onClick: () => handleServiceHistoryClick(reservation), className: "w-full bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors text-left cursor-pointer group", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: reservation.menuContent }), _jsxs("span", { className: "text-xs text-gray-500", children: ["\u62C5\u5F53: ", reservation.staff?.name] })] }), _jsxs("div", { className: "text-right", children: [reservation.price && (_jsxs("div", { className: "text-sm font-medium text-gray-900", children: ["\u00A5", reservation.price.toLocaleString()] })), _jsx("div", { className: "text-xs text-gray-500", children: format(new Date(reservation.startTime), 'M月d日', { locale: ja }) })] })] }), _jsx("p", { className: "text-xs text-gray-600", children: reservation.notes }), reservation.stylistNotes && (_jsx("div", { className: "mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded", children: "\uD83D\uDCA1 \u7F8E\u5BB9\u5E2B\u30E1\u30E2\u3042\u308A" })), _jsx("div", { className: "text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity", children: "\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u8A73\u7D30\u3092\u8868\u793A" })] }, index))), liveReservations.filter(r => r.customer?.id === selectedCustomer.id && r.status === 'COMPLETED').length === 0 && (_jsx("div", { className: "text-center py-4 text-gray-500 text-sm", children: "\u65BD\u8853\u5C65\u6B74\u304C\u3042\u308A\u307E\u305B\u3093" }))] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2 mb-4", children: "\u30AB\u30EB\u30C6\u30E1\u30E2" }), _jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsx("textarea", { rows: 4, placeholder: "\u9867\u5BA2\u306E\u7279\u8A18\u4E8B\u9805\u3001\u597D\u307F\u3001\u30A2\u30EC\u30EB\u30AE\u30FC\u60C5\u5831\u306A\u3069\u3092\u8A18\u9332...", className: "w-full border-0 bg-transparent resize-none focus:outline-none text-sm", value: customerNotes, onChange: (e) => setCustomerNotes(e.target.value) }) })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200", children: [_jsxs("button", { onClick: handleUpdateCustomerNotes, className: "btn btn-primary flex items-center", children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "\u30AB\u30EB\u30C6\u3092\u66F4\u65B0"] }), _jsxs("button", { onClick: handleShowCustomerMessages, className: "btn btn-secondary flex items-center", children: [_jsx(MessageSquare, { className: "w-4 h-4 mr-2" }), "\u30E1\u30C3\u30BB\u30FC\u30B8\u5C65\u6B74"] }), _jsxs("button", { onClick: handleShowCustomerReservations, className: "btn btn-secondary flex items-center", children: [_jsx(CalendarIcon, { className: "w-4 h-4 mr-2" }), "\u4E88\u7D04\u5C65\u6B74"] })] })] })] }) }) }) })), showNewCustomerModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4", children: _jsx("div", { className: "bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col", children: _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 flex items-center", children: [_jsx(Users, { className: "w-6 h-6 mr-2" }), "\u65B0\u898F\u9867\u5BA2\u767B\u9332"] }), _jsx("button", { onClick: handleCancelNewCustomer, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2", children: "\u57FA\u672C\u60C5\u5831" }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u6C0F\u540D ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: newCustomerData.name, onChange: (e) => setNewCustomerData(prev => ({ ...prev, name: e.target.value })), placeholder: "\u4F8B: \u5C71\u7530 \u82B1\u5B50", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u96FB\u8A71\u756A\u53F7" }), _jsx("input", { type: "tel", value: newCustomerData.phone, onChange: (e) => setNewCustomerData(prev => ({ ...prev, phone: e.target.value })), placeholder: "\u4F8B: 090-1234-5678", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9" }), _jsx("input", { type: "email", value: newCustomerData.email, onChange: (e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value })), placeholder: "\u4F8B: hanako@email.com", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2", children: "SNS\u60C5\u5831" }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2 flex items-center", children: [_jsx(Instagram, { className: "w-4 h-4 mr-1 text-pink-500" }), "Instagram ID"] }), _jsx("input", { type: "text", value: newCustomerData.instagramId, onChange: (e) => setNewCustomerData(prev => ({ ...prev, instagramId: e.target.value })), placeholder: "\u4F8B: hanako_beauty", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2 flex items-center", children: [_jsx(MessageCircle, { className: "w-4 h-4 mr-1 text-green-500" }), "LINE ID"] }), _jsx("input", { type: "text", value: newCustomerData.lineId, onChange: (e) => setNewCustomerData(prev => ({ ...prev, lineId: e.target.value })), placeholder: "\u4F8B: hanako123", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] }), _jsx("div", { className: "bg-blue-50 p-3 rounded-lg", children: _jsxs("p", { className: "text-xs text-blue-700", children: [_jsx("span", { className: "font-medium", children: "\uD83D\uDCA1 SNS\u9023\u643A\u306E\u30E1\u30EA\u30C3\u30C8" }), _jsx("br", {}), "Instagram\u30FBLINE\u306EID\u3092\u767B\u9332\u3059\u308B\u3053\u3068\u3067\u3001\u7D71\u5408\u30E1\u30C3\u30BB\u30FC\u30B8\u7BA1\u7406\u3067\u4E00\u5143\u7684\u306B\u3084\u308A\u53D6\u308A\u3067\u304D\u307E\u3059\u3002"] }) })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2 mb-4", children: "\u521D\u56DE\u30AB\u30EB\u30C6\u30E1\u30E2" }), _jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsx("textarea", { rows: 4, value: newCustomerData.notes, onChange: (e) => setNewCustomerData(prev => ({ ...prev, notes: e.target.value })), placeholder: "\u9867\u5BA2\u306E\u7279\u8A18\u4E8B\u9805\u3001\u5E0C\u671B\u3001\u30A2\u30EC\u30EB\u30AE\u30FC\u60C5\u5831\u306A\u3069\u3092\u8A18\u9332...", className: "w-full border-0 bg-transparent resize-none focus:outline-none text-sm" }) })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200", children: [_jsxs("button", { onClick: handleSaveNewCustomer, className: "btn btn-primary flex items-center justify-center", children: [_jsx(Users, { className: "w-4 h-4 mr-2" }), "\u9867\u5BA2\u3092\u767B\u9332"] }), _jsxs("button", { onClick: handleCancelNewCustomer, className: "btn btn-secondary flex items-center justify-center", children: [_jsx(X, { className: "w-4 h-4 mr-2" }), "\u30AD\u30E3\u30F3\u30BB\u30EB"] })] })] })] }) }) }) })), _jsx(CSVImporter, { isOpen: showCSVImporter, onImport: handleCSVImport, onClose: () => setShowCSVImporter(false), existingCustomers: customers?.customers || [] }), _jsx(BulkMessageSender, { isOpen: showBulkMessageSender, customers: customers?.customers || [], onSend: handleBulkMessageSend, onClose: () => setShowBulkMessageSender(false) }), _jsx(NewReservationModal, { isOpen: showNewReservationModal, onClose: () => {
                    setShowNewReservationModal(false);
                    setSelectedReservationDate(undefined);
                    setSelectedReservationTime(undefined);
                }, selectedDate: selectedReservationDate, selectedTime: selectedReservationTime, customers: customers?.customers || [], onSave: handleSaveNewReservation }), _jsx(ServiceHistoryModal, { reservation: selectedServiceHistory, onClose: () => {
                    setShowServiceHistoryModal(false);
                    setSelectedServiceHistory(null);
                }, onUpdateStylistNotes: handleUpdateStylistNotes })] }));
}
// 認証で保護されたメインアプリケーション
const AuthenticatedApp = () => {
    return (_jsx(ProtectedRoute, { requireAuth: true, children: _jsx(App, {}) }));
};
// 認証プロバイダーでラップされたルートコンポーネント
const RootApp = () => {
    return (_jsx(AuthProvider, { children: _jsx(SubscriptionProvider, { children: _jsx(AuthenticatedApp, {}) }) }));
};
export default RootApp;
