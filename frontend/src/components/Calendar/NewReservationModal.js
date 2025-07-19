import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, Clock, Scissors, Palette, Sparkles, Star, Save, Search, Calendar } from 'lucide-react';
import { defaultMenus } from '../../data/defaultMenus';
const NewReservationModal = ({ isOpen, onClose, selectedDate, selectedTime, customers, onSave }) => {
    const [formData, setFormData] = useState({
        customerName: '',
        customerId: '',
        phone: '',
        email: '',
        date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        startTime: selectedTime || '10:00',
        duration: 60,
        menuId: '',
        menuType: '',
        menuDetails: '',
        staffId: '',
        price: 0,
        notes: '',
        source: 'MANUAL',
        status: 'CONFIRMED'
    });
    const [availableMenus, setAvailableMenus] = useState(defaultMenus.filter(m => m.isActive));
    const [customerSearch, setCustomerSearch] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    // スタッフリスト（デモ用）
    const staffList = [
        { id: 'staff1', name: '田中 美咲' },
        { id: 'staff2', name: '佐藤 麗子' },
        { id: 'staff3', name: '山田 花音' },
        { id: 'staff4', name: '鈴木 あゆみ' }
    ];
    useEffect(() => {
        // グローバルメニューデータの取得
        if (typeof window !== 'undefined' && window.serviceMenus) {
            setAvailableMenus(window.serviceMenus);
        }
    }, []);
    useEffect(() => {
        if (selectedDate && selectedTime) {
            setFormData(prev => ({
                ...prev,
                date: format(selectedDate, 'yyyy-MM-dd'),
                startTime: selectedTime
            }));
        }
    }, [selectedDate, selectedTime]);
    useEffect(() => {
        if (customerSearch) {
            const filtered = customers.filter(customer => customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                (customer.phone && customer.phone.includes(customerSearch)));
            setFilteredCustomers(filtered);
            setShowCustomerDropdown(filtered.length > 0);
        }
        else {
            setFilteredCustomers([]);
            setShowCustomerDropdown(false);
        }
    }, [customerSearch, customers]);
    const handleCustomerSelect = (customer) => {
        setFormData(prev => ({
            ...prev,
            customerName: customer.name,
            customerId: customer.id,
            phone: customer.phone || '',
            email: customer.email || ''
        }));
        setCustomerSearch(customer.name);
        setShowCustomerDropdown(false);
        setIsNewCustomer(false);
    };
    const handleMenuChange = (menuId) => {
        const selectedMenu = availableMenus.find(m => m.id === menuId);
        if (selectedMenu) {
            setFormData(prev => ({
                ...prev,
                menuId: menuId,
                menuType: selectedMenu.category,
                menuDetails: selectedMenu.name,
                duration: selectedMenu.duration,
                price: selectedMenu.price
            }));
        }
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'cut': return _jsx(Scissors, { className: "w-4 h-4" });
            case 'color': return _jsx(Palette, { className: "w-4 h-4" });
            case 'perm': return _jsx(Sparkles, { className: "w-4 h-4" });
            default: return _jsx(Star, { className: "w-4 h-4" });
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        // フォームバリデーション
        if (!formData.customerName.trim()) {
            alert('顧客名を入力してください。');
            return;
        }
        if (!formData.date) {
            alert('予約日を選択してください。');
            return;
        }
        if (!formData.startTime) {
            alert('開始時間を選択してください。');
            return;
        }
        if (!formData.menuDetails) {
            alert('メニューを選択してください。');
            return;
        }
        const reservation = {
            id: `reservation_${Date.now()}`,
            startTime: `${formData.date}T${formData.startTime}:00`,
            endTime: calculateEndTime(formData.date, formData.startTime, formData.duration),
            menuContent: formData.menuDetails,
            customerName: formData.customerName,
            customer: formData.customerId ? {
                id: formData.customerId,
                name: formData.customerName,
                phone: formData.phone
            } : {
                id: `temp_${Date.now()}`,
                name: formData.customerName,
                phone: formData.phone
            },
            staff: formData.staffId ? {
                id: formData.staffId,
                name: staffList.find(s => s.id === formData.staffId)?.name || ''
            } : undefined,
            source: formData.source,
            status: formData.status,
            notes: formData.notes,
            price: formData.price
        };
        // 重複チェックはApp.tsxで行うため、ここでは削除
        onSave(reservation);
        onClose();
        resetForm();
    };
    const calculateEndTime = (date, startTime, duration) => {
        const start = new Date(`${date}T${startTime}:00`);
        const end = new Date(start.getTime() + duration * 60 * 1000);
        return end.toISOString();
    };
    const resetForm = () => {
        setFormData({
            customerName: '',
            customerId: '',
            phone: '',
            email: '',
            date: '',
            startTime: '',
            duration: 60,
            menuId: '',
            menuType: '',
            menuDetails: '',
            staffId: '',
            price: 0,
            notes: '',
            source: 'MANUAL',
            status: 'CONFIRMED'
        });
        setCustomerSearch('');
        setIsNewCustomer(false);
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4", children: _jsx("div", { className: "bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 flex items-center", children: [_jsx(Calendar, { className: "w-6 h-6 mr-2 text-blue-600" }), "\u65B0\u898F\u4E88\u7D04\u4F5C\u6210"] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2", children: "\u9867\u5BA2\u60C5\u5831" }), _jsxs("div", { className: "relative", children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u9867\u5BA2\u540D ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", value: customerSearch, onChange: (e) => {
                                                            setCustomerSearch(e.target.value);
                                                            setFormData(prev => ({ ...prev, customerName: e.target.value }));
                                                            if (e.target.value && !customers.find(c => c.name === e.target.value)) {
                                                                setIsNewCustomer(true);
                                                            }
                                                        }, placeholder: "\u9867\u5BA2\u540D\u3092\u5165\u529B\u307E\u305F\u306F\u691C\u7D22...", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", required: true }), _jsx(Search, { className: "absolute right-3 top-2.5 w-4 h-4 text-gray-400" })] }), showCustomerDropdown && (_jsx("div", { className: "absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto", children: filteredCustomers.map((customer) => (_jsxs("button", { type: "button", onClick: () => handleCustomerSelect(customer), className: "w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50", children: [_jsx("div", { className: "font-medium", children: customer.name }), customer.phone && (_jsx("div", { className: "text-sm text-gray-600", children: customer.phone }))] }, customer.id))) })), isNewCustomer && (_jsx("div", { className: "mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg", children: _jsx("div", { className: "text-sm text-blue-800", children: _jsx("strong", { children: "\u65B0\u898F\u9867\u5BA2\u3068\u3057\u3066\u767B\u9332\u3055\u308C\u307E\u3059" }) }) }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u96FB\u8A71\u756A\u53F7" }), _jsx("input", { type: "tel", value: formData.phone, onChange: (e) => setFormData(prev => ({ ...prev, phone: e.target.value })), placeholder: "090-1234-5678", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9" }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => setFormData(prev => ({ ...prev, email: e.target.value })), placeholder: "example@email.com", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2", children: "\u4E88\u7D04\u65E5\u6642" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u4E88\u7D04\u65E5 ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "date", value: formData.date, onChange: (e) => setFormData(prev => ({ ...prev, date: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", required: true })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u958B\u59CB\u6642\u9593 ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "time", value: formData.startTime, onChange: (e) => setFormData(prev => ({ ...prev, startTime: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", required: true })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2", children: "\u30E1\u30CB\u30E5\u30FC" }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u30E1\u30CB\u30E5\u30FC\u9078\u629E ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto", children: availableMenus.map((menu) => (_jsxs("button", { type: "button", onClick: () => handleMenuChange(menu.id), className: `p-3 border rounded-lg text-left transition-colors ${formData.menuId === menu.id
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-300 hover:border-gray-400'}`, children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [getCategoryIcon(menu.category), _jsx("span", { className: "font-medium text-sm", children: menu.name })] }), menu.description && (_jsx("div", { className: "text-xs text-gray-500 mb-1", children: menu.description })), _jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("div", { className: "flex items-center space-x-1", children: _jsxs("span", { children: ["\u00A5", menu.price.toLocaleString()] }) }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Clock, { className: "w-3 h-3" }), _jsxs("span", { children: [menu.duration, "\u5206"] })] })] })] }, menu.id))) }), availableMenus.length === 0 && (_jsxs("div", { className: "text-center py-8 text-gray-500", children: ["\u5229\u7528\u53EF\u80FD\u306A\u30E1\u30CB\u30E5\u30FC\u304C\u3042\u308A\u307E\u305B\u3093\u3002", _jsx("br", {}), "\u8A2D\u5B9A\u753B\u9762\u3067\u30E1\u30CB\u30E5\u30FC\u3092\u8FFD\u52A0\u3057\u3066\u304F\u3060\u3055\u3044\u3002"] }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u65BD\u8853\u6642\u9593\uFF08\u5206\uFF09" }), _jsx("input", { type: "number", value: formData.duration, onChange: (e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 })), min: "15", max: "300", step: "15", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u6599\u91D1\uFF08\u5186\uFF09" }), _jsx("input", { type: "number", value: formData.price, onChange: (e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 })), placeholder: "5000", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2", children: "\u305D\u306E\u4ED6" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u62C5\u5F53\u30B9\u30BF\u30C3\u30D5" }), _jsxs("select", { value: formData.staffId, onChange: (e) => setFormData(prev => ({ ...prev, staffId: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "", children: "\u30B9\u30BF\u30C3\u30D5\u3092\u9078\u629E..." }), staffList.map((staff) => (_jsx("option", { value: staff.id, children: staff.name }, staff.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30B9\u30C6\u30FC\u30BF\u30B9" }), _jsxs("select", { value: formData.status, onChange: (e) => setFormData(prev => ({ ...prev, status: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "CONFIRMED", children: "\u78BA\u5B9A" }), _jsx("option", { value: "TENTATIVE", children: "\u4EEE\u4E88\u7D04" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u5099\u8003" }), _jsx("textarea", { value: formData.notes, onChange: (e) => setFormData(prev => ({ ...prev, notes: e.target.value })), placeholder: "\u7279\u5225\u306A\u8981\u671B\u3084\u30A2\u30EC\u30EB\u30AE\u30FC\u60C5\u5831\u306A\u3069...", rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200", children: [_jsxs("button", { type: "submit", className: "flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors", children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "\u4E88\u7D04\u3092\u4FDD\u5B58"] }), _jsx("button", { type: "button", onClick: onClose, className: "flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" })] })] })] }) }) }));
};
export default NewReservationModal;
