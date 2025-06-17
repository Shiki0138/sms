import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { MessageSquare, Calendar, User, Clock, ArrowLeft, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
const FilteredCustomerView = ({ viewType, customerId, customerName, allMessages, allReservations, onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    // 顧客特定のデータをフィルタリング
    const filteredData = useMemo(() => {
        if (viewType === 'messages') {
            return allMessages.filter(message => message.customer.id === customerId);
        }
        else {
            return allReservations.filter(reservation => reservation.customer?.id === customerId);
        }
    }, [viewType, customerId, allMessages, allReservations]);
    // さらに検索・フィルターを適用
    const finalFilteredData = useMemo(() => {
        let data = [...filteredData];
        // 検索フィルター
        if (searchTerm) {
            if (viewType === 'messages') {
                data = data.filter(message => message.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    message.assignedStaff?.name.toLowerCase().includes(searchTerm.toLowerCase()));
            }
            else {
                data = data.filter(reservation => reservation.menuContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    reservation.staff?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    reservation.notes?.toLowerCase().includes(searchTerm.toLowerCase()));
            }
        }
        // ステータスフィルター
        if (statusFilter !== 'all') {
            if (viewType === 'messages') {
                data = data.filter(message => message.status === statusFilter);
            }
            else {
                data = data.filter(reservation => reservation.status === statusFilter);
            }
        }
        // 日付フィルター
        if (dateFilter !== 'all') {
            const now = new Date();
            const filterDate = new Date();
            switch (dateFilter) {
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
                case 'quarter':
                    filterDate.setMonth(now.getMonth() - 3);
                    break;
            }
            if (viewType === 'messages') {
                data = data.filter(message => new Date(message.updatedAt) >= filterDate);
            }
            else {
                data = data.filter(reservation => new Date(reservation.startTime) >= filterDate);
            }
        }
        return data;
    }, [filteredData, searchTerm, statusFilter, dateFilter, viewType]);
    const getStatusColor = (status) => {
        const statusColors = {
            // Message statuses
            'OPEN': 'bg-green-100 text-green-800',
            'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
            'CLOSED': 'bg-gray-100 text-gray-800',
            // Reservation statuses
            'CONFIRMED': 'bg-green-100 text-green-800',
            'TENTATIVE': 'bg-yellow-100 text-yellow-800',
            'COMPLETED': 'bg-blue-100 text-blue-800',
            'CANCELLED': 'bg-red-100 text-red-800',
            'NO_SHOW': 'bg-gray-100 text-gray-800'
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };
    const getStatusLabel = (status) => {
        const statusLabels = {
            // Message statuses
            'OPEN': '未対応',
            'IN_PROGRESS': '対応中',
            'CLOSED': '完了',
            // Reservation statuses
            'CONFIRMED': '確定',
            'TENTATIVE': '仮予約',
            'COMPLETED': '完了',
            'CANCELLED': 'キャンセル',
            'NO_SHOW': '未来店'
        };
        return statusLabels[status] || status;
    };
    const renderMessageItem = (message) => (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center ${message.channel === 'INSTAGRAM' ? 'bg-pink-100' : 'bg-green-100'}`, children: _jsx(MessageSquare, { className: `w-4 h-4 ${message.channel === 'INSTAGRAM' ? 'text-pink-600' : 'text-green-600'}` }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: message.channel }), _jsx("div", { className: "text-sm text-gray-500", children: format(new Date(message.updatedAt), 'M/d HH:mm', { locale: ja }) })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`, children: getStatusLabel(message.status) }), message.unreadCount > 0 && (_jsx("span", { className: "bg-red-500 text-white text-xs px-2 py-1 rounded-full", children: message.unreadCount }))] })] }), _jsx("div", { className: "mb-3", children: _jsx("p", { className: "text-sm text-gray-700 line-clamp-2", children: message.lastMessage.content }) }), message.assignedStaff && (_jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(User, { className: "w-4 h-4 mr-1" }), "\u62C5\u5F53: ", message.assignedStaff.name] }))] }, message.id));
    const renderReservationItem = (reservation) => (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center", children: _jsx(Calendar, { className: "w-4 h-4 text-blue-600" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: reservation.menuContent }), _jsx("div", { className: "text-sm text-gray-500", children: format(new Date(reservation.startTime), 'M/d(E) HH:mm', { locale: ja }) })] })] }), _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`, children: getStatusLabel(reservation.status) })] }), _jsxs("div", { className: "space-y-2", children: [reservation.staff && (_jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(User, { className: "w-4 h-4 mr-1" }), "\u62C5\u5F53: ", reservation.staff.name] })), reservation.price && (_jsx("div", { className: "flex items-center text-sm text-gray-600", children: _jsxs("span", { className: "font-medium text-green-600", children: ["\u00A5", reservation.price.toLocaleString()] }) })), _jsxs("div", { className: "flex items-center text-sm text-gray-500", children: [_jsx(Clock, { className: "w-4 h-4 mr-1" }), reservation.source === 'HOTPEPPER' ? 'ホットペッパー' :
                                reservation.source === 'PHONE' ? '電話予約' :
                                    reservation.source === 'MANUAL' ? '店頭予約' : reservation.source] }), reservation.notes && (_jsx("div", { className: "text-sm text-gray-600 bg-gray-50 p-2 rounded", children: reservation.notes }))] })] }, reservation.id));
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsxs("button", { onClick: onBack, className: "flex items-center text-blue-600 hover:text-blue-700 transition-colors", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "\u623B\u308B"] }) }), _jsxs("div", { className: "flex items-center space-x-3 mb-4", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center", children: _jsx(User, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900", children: [customerName, "\u69D8"] }), _jsx("p", { className: "text-gray-600", children: viewType === 'messages' ? 'メッセージ履歴' : '予約履歴' })] })] }), _jsx("div", { className: "text-sm text-gray-500", children: viewType === 'messages' ?
                            `${filteredData.length}件のメッセージ履歴` :
                            `${filteredData.length}件の予約履歴` })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u691C\u7D22" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: viewType === 'messages' ? 'メッセージ内容で検索...' : 'メニューや備考で検索...', className: "w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx(Search, { className: "absolute left-3 top-2.5 w-4 h-4 text-gray-400" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30B9\u30C6\u30FC\u30BF\u30B9" }), _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "all", children: "\u3059\u3079\u3066" }), viewType === 'messages' ? (_jsxs(_Fragment, { children: [_jsx("option", { value: "OPEN", children: "\u672A\u5BFE\u5FDC" }), _jsx("option", { value: "IN_PROGRESS", children: "\u5BFE\u5FDC\u4E2D" }), _jsx("option", { value: "CLOSED", children: "\u5B8C\u4E86" })] })) : (_jsxs(_Fragment, { children: [_jsx("option", { value: "CONFIRMED", children: "\u78BA\u5B9A" }), _jsx("option", { value: "TENTATIVE", children: "\u4EEE\u4E88\u7D04" }), _jsx("option", { value: "COMPLETED", children: "\u5B8C\u4E86" }), _jsx("option", { value: "CANCELLED", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx("option", { value: "NO_SHOW", children: "\u672A\u6765\u5E97" })] }))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u671F\u9593" }), _jsxs("select", { value: dateFilter, onChange: (e) => setDateFilter(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "all", children: "\u3059\u3079\u3066" }), _jsx("option", { value: "week", children: "1\u9031\u9593\u4EE5\u5185" }), _jsx("option", { value: "month", children: "1\u30F6\u6708\u4EE5\u5185" }), _jsx("option", { value: "quarter", children: "3\u30F6\u6708\u4EE5\u5185" })] })] })] }), (searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (_jsxs("div", { className: "flex items-center justify-between mt-4 pt-4 border-t border-gray-200", children: [_jsxs("div", { className: "text-sm text-gray-600", children: [finalFilteredData.length, "\u4EF6\u306E\u7D50\u679C"] }), _jsxs("button", { onClick: () => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setDateFilter('all');
                                }, className: "flex items-center text-sm text-blue-600 hover:text-blue-700", children: [_jsx(X, { className: "w-4 h-4 mr-1" }), "\u30D5\u30A3\u30EB\u30BF\u30FC\u3092\u30AF\u30EA\u30A2"] })] }))] }), _jsx("div", { className: "space-y-4", children: finalFilteredData.length > 0 ? (finalFilteredData.map((item) => viewType === 'messages'
                    ? renderMessageItem(item)
                    : renderReservationItem(item))) : (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-8 text-center", children: [_jsx("div", { className: "text-gray-400 mb-4", children: viewType === 'messages' ? (_jsx(MessageSquare, { className: "w-12 h-12 mx-auto" })) : (_jsx(Calendar, { className: "w-12 h-12 mx-auto" })) }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                                ? 'フィルター条件に一致するデータがありません'
                                : viewType === 'messages'
                                    ? 'メッセージ履歴がありません'
                                    : '予約履歴がありません' }), _jsx("p", { className: "text-gray-500", children: viewType === 'messages'
                                ? 'この顧客からのメッセージはまだありません。'
                                : 'この顧客の予約履歴はまだありません。' })] })) })] }));
};
export default FilteredCustomerView;
