import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, Clock, Search, Scissors, Palette, Sparkles, Star } from 'lucide-react';
import { MENU_CATEGORIES } from '../../types/menu';
import { defaultMenus } from '../../data/defaultMenus';
const MenuManagement = ({ onMenusChange }) => {
    const [menus, setMenus] = useState(defaultMenus);
    const [filteredMenus, setFilteredMenus] = useState(defaultMenus);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showActiveOnly, setShowActiveOnly] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        duration: 30,
        category: 'cut'
    });
    useEffect(() => {
        // メニューが変更された時の処理
        if (onMenusChange) {
            onMenusChange(menus);
        }
        // グローバルに登録（予約画面で使用）
        if (typeof window !== 'undefined') {
            window.serviceMenus = menus.filter(m => m.isActive);
        }
    }, [menus, onMenusChange]);
    useEffect(() => {
        // フィルタリング処理
        let filtered = [...menus];
        if (searchTerm) {
            filtered = filtered.filter(menu => menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                menu.description?.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(menu => menu.category === selectedCategory);
        }
        if (showActiveOnly) {
            filtered = filtered.filter(menu => menu.isActive);
        }
        setFilteredMenus(filtered);
    }, [menus, searchTerm, selectedCategory, showActiveOnly]);
    const getCategoryInfo = (category) => {
        return MENU_CATEGORIES.find(cat => cat.key === category) || MENU_CATEGORIES[MENU_CATEGORIES.length - 1];
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'cut': return _jsx(Scissors, { className: "w-4 h-4" });
            case 'color': return _jsx(Palette, { className: "w-4 h-4" });
            case 'perm': return _jsx(Sparkles, { className: "w-4 h-4" });
            default: return _jsx(Star, { className: "w-4 h-4" });
        }
    };
    const handleCreateMenu = () => {
        const newMenu = {
            id: `menu_${Date.now()}`,
            name: formData.name,
            description: formData.description,
            price: formData.price,
            duration: formData.duration,
            category: formData.category,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setMenus(prev => [...prev, newMenu]);
        resetForm();
        setShowCreateModal(false);
    };
    const handleEditMenu = (menu) => {
        setEditingMenu(menu);
        setFormData({
            name: menu.name,
            description: menu.description || '',
            price: menu.price,
            duration: menu.duration,
            category: menu.category
        });
        setIsEditing(true);
    };
    const handleUpdateMenu = () => {
        if (!editingMenu)
            return;
        const updatedMenu = {
            ...editingMenu,
            name: formData.name,
            description: formData.description,
            price: formData.price,
            duration: formData.duration,
            category: formData.category,
            updatedAt: new Date().toISOString()
        };
        setMenus(prev => prev.map(menu => menu.id === editingMenu.id ? updatedMenu : menu));
        resetForm();
        setIsEditing(false);
        setEditingMenu(null);
    };
    const handleToggleActive = (menuId) => {
        setMenus(prev => prev.map(menu => menu.id === menuId
            ? { ...menu, isActive: !menu.isActive, updatedAt: new Date().toISOString() }
            : menu));
    };
    const handleDeleteMenu = (menuId) => {
        if (window.confirm('このメニューを削除しますか？')) {
            setMenus(prev => prev.filter(menu => menu.id !== menuId));
        }
    };
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: 0,
            duration: 30,
            category: 'cut'
        });
    };
    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`;
        }
        return `${mins}分`;
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "\u30E1\u30CB\u30E5\u30FC\u7BA1\u7406" }), _jsx("p", { className: "text-sm text-gray-600", children: "\u30B5\u30FC\u30D3\u30B9\u30E1\u30CB\u30E5\u30FC\u306E\u8FFD\u52A0\u30FB\u7DE8\u96C6\u30FB\u524A\u9664\u304C\u3067\u304D\u307E\u3059" })] }), _jsxs("button", { onClick: () => setShowCreateModal(true), className: "btn btn-primary flex items-center space-x-2", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "\u65B0\u898F\u30E1\u30CB\u30E5\u30FC\u8FFD\u52A0" })] })] }), _jsx("div", { className: "bg-white p-4 rounded-lg border border-gray-200", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "\u30E1\u30CB\u30E5\u30FC\u540D\u3067\u691C\u7D22...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("select", { value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "all", children: "\u5168\u30AB\u30C6\u30B4\u30EA" }), MENU_CATEGORIES.map(category => (_jsxs("option", { value: category.key, children: [category.icon, " ", category.label] }, category.key)))] }), _jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: showActiveOnly, onChange: (e) => setShowActiveOnly(e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "text-sm text-gray-700", children: "\u6709\u52B9\u306A\u30E1\u30CB\u30E5\u30FC\u306E\u307F\u8868\u793A" })] })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("div", { className: "text-blue-600 text-sm font-medium", children: "\u7DCF\u30E1\u30CB\u30E5\u30FC\u6570" }), _jsx("div", { className: "text-2xl font-bold text-blue-900", children: menus.length })] }), _jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsx("div", { className: "text-green-600 text-sm font-medium", children: "\u6709\u52B9\u30E1\u30CB\u30E5\u30FC" }), _jsx("div", { className: "text-2xl font-bold text-green-900", children: menus.filter(m => m.isActive).length })] }), _jsxs("div", { className: "bg-purple-50 border border-purple-200 rounded-lg p-4", children: [_jsx("div", { className: "text-purple-600 text-sm font-medium", children: "\u5E73\u5747\u4FA1\u683C" }), _jsxs("div", { className: "text-2xl font-bold text-purple-900", children: ["\u00A5", Math.round(menus.filter(m => m.isActive).reduce((sum, m) => sum + m.price, 0) / menus.filter(m => m.isActive).length || 0).toLocaleString()] })] }), _jsxs("div", { className: "bg-orange-50 border border-orange-200 rounded-lg p-4", children: [_jsx("div", { className: "text-orange-600 text-sm font-medium", children: "\u5E73\u5747\u6642\u9593" }), _jsxs("div", { className: "text-2xl font-bold text-orange-900", children: [Math.round(menus.filter(m => m.isActive).reduce((sum, m) => sum + m.duration, 0) / menus.filter(m => m.isActive).length || 0), "\u5206"] })] })] }), _jsx("div", { className: "bg-white rounded-lg border border-gray-200", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u30E1\u30CB\u30E5\u30FC\u540D" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u30AB\u30C6\u30B4\u30EA" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u4FA1\u683C" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u6642\u9593" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u72B6\u614B" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u64CD\u4F5C" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: filteredMenus.map((menu) => {
                                    const categoryInfo = getCategoryInfo(menu.category);
                                    return (_jsxs("tr", { className: !menu.isActive ? 'opacity-60' : '', children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: menu.name }), menu.description && (_jsx("div", { className: "text-sm text-gray-500", children: menu.description }))] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center space-x-2", children: [getCategoryIcon(menu.category), _jsx("span", { className: `text-sm font-medium text-${categoryInfo.color}-700`, children: categoryInfo.label })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("div", { className: "flex items-center space-x-1", children: _jsxs("span", { className: "text-sm font-medium text-gray-900", children: ["\u00A5", menu.price.toLocaleString()] }) }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Clock, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-sm text-gray-600", children: formatDuration(menu.duration) })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("button", { onClick: () => handleToggleActive(menu.id), className: `inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${menu.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-600'}`, children: [menu.isActive ? _jsx(Eye, { className: "w-3 h-3" }) : _jsx(EyeOff, { className: "w-3 h-3" }), _jsx("span", { children: menu.isActive ? '有効' : '無効' })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: () => handleEditMenu(menu), className: "text-blue-600 hover:text-blue-800", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleDeleteMenu(menu.id), className: "text-red-600 hover:text-red-800", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, menu.id));
                                }) })] }) }) }), (showCreateModal || isEditing) && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4", children: _jsx("div", { className: "bg-white rounded-lg max-w-md w-full", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: isEditing ? 'メニュー編集' : '新規メニュー追加' }), _jsx("button", { onClick: () => {
                                            setShowCreateModal(false);
                                            setIsEditing(false);
                                            setEditingMenu(null);
                                            resetForm();
                                        }, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsxs("form", { onSubmit: (e) => {
                                    e.preventDefault();
                                    isEditing ? handleUpdateMenu() : handleCreateMenu();
                                }, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u30E1\u30CB\u30E5\u30FC\u540D *" }), _jsx("input", { type: "text", required: true, value: formData.name, onChange: (e) => setFormData(prev => ({ ...prev, name: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "\u30AB\u30C3\u30C8\u3001\u30AB\u30E9\u30FC\u306A\u3069" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u8AAC\u660E" }), _jsx("textarea", { rows: 2, value: formData.description, onChange: (e) => setFormData(prev => ({ ...prev, description: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none", placeholder: "\u30E1\u30CB\u30E5\u30FC\u306E\u8A73\u7D30\u8AAC\u660E" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u4FA1\u683C (\u5186) *" }), _jsx("input", { type: "number", required: true, min: "0", step: "100", value: formData.price, onChange: (e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u6240\u8981\u6642\u9593 (\u5206) *" }), _jsx("select", { value: formData.duration, onChange: (e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", children: [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180].map(duration => (_jsx("option", { value: duration, children: formatDuration(duration) }, duration))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u30AB\u30C6\u30B4\u30EA *" }), _jsx("select", { value: formData.category, onChange: (e) => setFormData(prev => ({ ...prev, category: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", children: MENU_CATEGORIES.map(category => (_jsxs("option", { value: category.key, children: [category.icon, " ", category.label] }, category.key))) })] }), _jsxs("div", { className: "flex justify-end space-x-3 pt-4", children: [_jsx("button", { type: "button", onClick: () => {
                                                    setShowCreateModal(false);
                                                    setIsEditing(false);
                                                    setEditingMenu(null);
                                                    resetForm();
                                                }, className: "btn btn-secondary", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsxs("button", { type: "submit", className: "btn btn-primary flex items-center space-x-2", children: [_jsx(Save, { className: "w-4 h-4" }), _jsx("span", { children: isEditing ? '更新' : '追加' })] })] })] })] }) }) }))] }));
};
export default MenuManagement;
