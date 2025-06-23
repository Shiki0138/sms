import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Store, Users, Scissors, CheckCircle, ArrowRight, ArrowLeft, Download, Eye, EyeOff, Globe, Smartphone, Mail, CreditCard, Calendar, Shield, Sparkles } from 'lucide-react';
import { salonTemplates, salonOptions } from '../../data/salonTemplates';
import { menuTemplates, menuCategories } from '../../data/menuTemplates';
import { testCustomers, testStaff, initialSetupData } from '../../data/testDummyData';
import { apiTemplates, recommendedAPISetup } from '../../data/apiTemplates';
import ExternalSendRestriction from '../TestMode/ExternalSendRestriction';
const InitialSetupWizard = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [setupData, setSetupData] = useState({
        name: '',
        type: '',
        address: '',
        phone: '',
        email: '',
        prefecture: '東京都',
        capacity: 6,
        priceRange: '¥3,000 - ¥8,000',
        services: [],
        businessHours: {
            monday: { open: '10:00', close: '19:00', closed: true },
            tuesday: { open: '10:00', close: '19:00', closed: false },
            wednesday: { open: '10:00', close: '19:00', closed: false },
            thursday: { open: '10:00', close: '19:00', closed: false },
            friday: { open: '10:00', close: '20:00', closed: false },
            saturday: { open: '09:00', close: '19:00', closed: false },
            sunday: { open: '09:00', close: '18:00', closed: false }
        }
    });
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [selectedMenus, setSelectedMenus] = useState([]);
    const [selectedAPIs, setSelectedAPIs] = useState(recommendedAPISetup.essential);
    const [testMode, setTestMode] = useState(true);
    const [showPasswords, setShowPasswords] = useState({});
    const steps = [
        {
            id: 'salon-info',
            title: '店舗情報設定',
            description: '基本的な店舗情報を設定します',
            icon: _jsx(Store, { className: "w-6 h-6" }),
            completed: false
        },
        {
            id: 'menu-setup',
            title: 'メニュー設定',
            description: '提供するサービスメニューを選択します',
            icon: _jsx(Scissors, { className: "w-6 h-6" }),
            completed: false
        },
        {
            id: 'staff-setup',
            title: 'スタッフ情報',
            description: 'スタッフ情報を登録します',
            icon: _jsx(Users, { className: "w-6 h-6" }),
            completed: false
        },
        {
            id: 'api-setup',
            title: 'API連携設定',
            description: '外部サービスとの連携を設定します',
            icon: _jsx(Globe, { className: "w-6 h-6" }),
            completed: false
        },
        {
            id: 'test-data',
            title: 'テストデータ設定',
            description: 'サンプルデータで動作確認します',
            icon: _jsx(Eye, { className: "w-6 h-6" }),
            completed: false
        },
        {
            id: 'complete',
            title: '設定完了',
            description: 'セットアップが完了しました',
            icon: _jsx(CheckCircle, { className: "w-6 h-6" }),
            completed: false
        }
    ];
    // テンプレート適用
    const applyTemplate = (templateId) => {
        const template = salonTemplates.find(t => t.id === templateId);
        if (template) {
            setSetupData({
                ...setupData,
                name: template.name,
                type: salonOptions.salonTypes[0], // デフォルトタイプ
                address: template.address,
                phone: template.phone,
                email: template.email,
                capacity: template.capacity,
                priceRange: template.priceRange,
                services: template.services,
                businessHours: template.openHours
            });
        }
        setSelectedTemplate(templateId);
    };
    // メニュー選択の切り替え
    const toggleMenuSelection = (menuId) => {
        setSelectedMenus(prev => prev.includes(menuId)
            ? prev.filter(id => id !== menuId)
            : [...prev, menuId]);
    };
    // API選択の切り替え
    const toggleAPISelection = (apiId) => {
        setSelectedAPIs(prev => prev.includes(apiId)
            ? prev.filter(id => id !== apiId)
            : [...prev, apiId]);
    };
    // 次のステップに進む
    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };
    // 前のステップに戻る
    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    // テストデータの読み込み
    const loadTestData = () => {
        console.log('テストデータを読み込みました:', initialSetupData);
        alert(`テストデータを読み込みました！\n\n・顧客データ: ${initialSetupData.customers.length}名\n・予約データ: ${initialSetupData.reservations.length}件\n・メッセージ: ${initialSetupData.messages.length}件\n・スタッフ: ${initialSetupData.staff.length}名`);
    };
    // セットアップ完了
    const completeSetup = () => {
        const setupResult = {
            salonInfo: setupData,
            selectedMenus: selectedMenus,
            selectedAPIs: selectedAPIs,
            testMode: testMode,
            testData: initialSetupData,
            timestamp: new Date().toISOString()
        };
        console.log('セットアップ完了:', setupResult);
        alert('セットアップが完了しました！\n美容室管理システムをお楽しみください。');
    };
    // パスワード表示切り替え
    const togglePasswordVisibility = (apiId, fieldName) => {
        const key = `${apiId}-${fieldName}`;
        setShowPasswords(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };
    const renderStepContent = () => {
        switch (steps[currentStep].id) {
            case 'salon-info':
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "\u5E97\u8217\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u304B\u3089\u9078\u629E\uFF08\u4EFB\u610F\uFF09" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6", children: salonTemplates.map((template) => (_jsxs("div", { className: `border rounded-lg p-4 cursor-pointer transition-colors ${selectedTemplate === template.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'}`, onClick: () => applyTemplate(template.id), children: [_jsx("h4", { className: "font-medium text-gray-900", children: template.name }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: template.description }), _jsxs("p", { className: "text-sm text-gray-500 mt-2", children: [template.priceRange, " | ", template.capacity, "\u5E2D | ", template.services.slice(0, 3).join('・')] })] }, template.id))) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u5E97\u8217\u540D ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: setupData.name, onChange: (e) => setSetupData({ ...setupData, name: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Hair Studio TOKYO" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u5E97\u8217\u30BF\u30A4\u30D7" }), _jsxs("select", { value: setupData.type, onChange: (e) => setSetupData({ ...setupData, type: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" }), salonOptions.salonTypes.map((type) => (_jsx("option", { value: type, children: type }, type)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u90FD\u9053\u5E9C\u770C" }), _jsx("select", { value: setupData.prefecture, onChange: (e) => setSetupData({ ...setupData, prefecture: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: salonOptions.prefectures.map((prefecture) => (_jsx("option", { value: prefecture, children: prefecture }, prefecture))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u96FB\u8A71\u756A\u53F7" }), _jsx("input", { type: "tel", value: setupData.phone, onChange: (e) => setSetupData({ ...setupData, phone: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "03-1234-5678" })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u4F4F\u6240" }), _jsx("input", { type: "text", value: setupData.address, onChange: (e) => setSetupData({ ...setupData, address: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "\u6771\u4EAC\u90FD\u6E0B\u8C37\u533A..." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9" }), _jsx("input", { type: "email", value: setupData.email, onChange: (e) => setSetupData({ ...setupData, email: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "info@salon.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u5E2D\u6570" }), _jsx("select", { value: setupData.capacity, onChange: (e) => setSetupData({ ...setupData, capacity: parseInt(e.target.value) }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: salonOptions.capacityOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) })] })] })] }));
            case 'menu-setup':
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "\u63D0\u4F9B\u3059\u308B\u30E1\u30CB\u30E5\u30FC\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" }), _jsx("p", { className: "text-sm text-gray-600 mb-6", children: "\u5F8C\u304B\u3089\u8FFD\u52A0\u30FB\u7DE8\u96C6\u3082\u53EF\u80FD\u3067\u3059\u3002\u307E\u305A\u306F\u4E3B\u8981\u306A\u30E1\u30CB\u30E5\u30FC\u3092\u9078\u629E\u3057\u307E\u3057\u3087\u3046\u3002" })] }), menuCategories.map((category) => {
                            const categoryMenus = menuTemplates.filter(menu => menu.category === category.name);
                            return (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx("span", { className: "text-2xl mr-3", children: category.icon }), _jsx("h4", { className: "text-lg font-medium text-gray-900", children: category.name }), _jsxs("span", { className: "ml-auto text-sm text-gray-500", children: [categoryMenus.filter(menu => selectedMenus.includes(menu.id)).length, " / ", categoryMenus.length, " \u9078\u629E\u4E2D"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3", children: categoryMenus.map((menu) => (_jsxs("div", { className: `border rounded-lg p-3 cursor-pointer transition-colors ${selectedMenus.includes(menu.id)
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'}`, onClick: () => toggleMenuSelection(menu.id), children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h5", { className: "font-medium text-gray-900 text-sm", children: menu.name }), _jsxs("span", { className: "text-sm font-bold text-blue-600", children: ["\u00A5", menu.price.toLocaleString()] })] }), _jsx("p", { className: "text-xs text-gray-600 mb-2", children: menu.description }), _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [_jsxs("span", { children: [menu.duration, "\u5206"] }), _jsx("span", { className: `px-2 py-1 rounded-full ${menu.popularity === 'high' ? 'bg-red-100 text-red-600' :
                                                                menu.popularity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                                                    'bg-gray-100 text-gray-600'}`, children: menu.popularity === 'high' ? '人気' :
                                                                menu.popularity === 'medium' ? '標準' : '基本' })] })] }, menu.id))) })] }, category.id));
                        }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsxs("h4", { className: "font-medium text-blue-900 mb-2", children: ["\u9078\u629E\u3055\u308C\u305F\u30E1\u30CB\u30E5\u30FC: ", selectedMenus.length, "\u4EF6"] }), _jsxs("p", { className: "text-sm text-blue-700", children: ["\u4FA1\u683C\u5E2F: \u00A5", selectedMenus.length > 0 ? Math.min(...selectedMenus.map(id => menuTemplates.find(m => m.id === id)?.price || 0)).toLocaleString() : 0, " - \u00A5", selectedMenus.length > 0 ? Math.max(...selectedMenus.map(id => menuTemplates.find(m => m.id === id)?.price || 0)).toLocaleString() : 0] })] })] }));
            case 'staff-setup':
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "\u30B9\u30BF\u30C3\u30D5\u60C5\u5831" }), _jsx("p", { className: "text-sm text-gray-600 mb-6", children: "\u30C6\u30B9\u30C8\u30C7\u30FC\u30BF\u3068\u3057\u30663\u540D\u306E\u30B5\u30F3\u30D7\u30EB\u30B9\u30BF\u30C3\u30D5\u304C\u7528\u610F\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u5B9F\u969B\u306E\u904B\u7528\u6642\u306B\u5909\u66F4\u3067\u304D\u307E\u3059\u3002" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: testStaff.map((staff) => (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3", children: _jsx(Users, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: staff.name }), _jsx("p", { className: "text-sm text-gray-600", children: staff.position })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs text-gray-500", children: "\u5C02\u9580\u5206\u91CE:" }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: staff.specialties.map((specialty) => (_jsx("span", { className: "text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded", children: specialty }, specialty))) })] }), _jsxs("div", { className: "text-xs text-gray-600", children: [_jsxs("p", { children: ["\u5165\u793E: ", new Date(staff.joinDate).getFullYear(), "\u5E74"] }), _jsxs("p", { children: ["\u6E80\u8DB3\u5EA6: ", staff.performance.customerSatisfaction, "/5.0"] }), _jsxs("p", { children: ["\u30EA\u30D4\u30FC\u30C8\u7387: ", staff.performance.repeatCustomerRate, "%"] })] })] })] }, staff.id))) }), _jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-600 mr-2" }), _jsx("span", { className: "font-medium text-green-900", children: "\u30B9\u30BF\u30C3\u30D5\u30C7\u30FC\u30BF\u6E96\u5099\u5B8C\u4E86" })] }), _jsx("p", { className: "text-sm text-green-700 mt-1", children: "\u30C6\u30B9\u30C8\u7528\u306E\u30B9\u30BF\u30C3\u30D5\u30C7\u30FC\u30BF\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u5F8C\u304B\u3089\u30B9\u30BF\u30C3\u30D5\u306E\u8FFD\u52A0\u30FB\u7DE8\u96C6\u304C\u53EF\u80FD\u3067\u3059\u3002" })] })] }));
            case 'api-setup':
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "API\u9023\u643A\u8A2D\u5B9A" }), _jsx("p", { className: "text-sm text-gray-600 mb-6", children: "\u5916\u90E8\u30B5\u30FC\u30D3\u30B9\u3068\u306E\u9023\u643A\u8A2D\u5B9A\u3067\u3059\u3002\u30C6\u30B9\u30C8\u30E2\u30FC\u30C9\u3067\u306F\u5B9F\u969B\u306E\u9001\u4FE1\u306F\u884C\u308F\u308C\u307E\u305B\u3093\u3002" })] }), _jsx(ExternalSendRestriction, { isTestMode: testMode, onModeChange: setTestMode }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-gray-900", children: "\u5229\u7528\u3059\u308BAPI\uFF08\u63A8\u5968\u8A2D\u5B9A\u6E08\u307F\uFF09" }), apiTemplates.map((api) => (_jsxs("div", { className: `border rounded-lg p-4 ${selectedAPIs.includes(api.id)
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3", children: [api.type === 'line' && _jsx(Smartphone, { className: "w-5 h-5 text-green-600" }), api.type === 'instagram' && _jsx("div", { className: "w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded" }), api.type === 'google' && _jsx(Calendar, { className: "w-5 h-5 text-blue-600" }), api.type === 'stripe' && _jsx(CreditCard, { className: "w-5 h-5 text-purple-600" }), api.type === 'email' && _jsx(Mail, { className: "w-5 h-5 text-gray-600" }), api.type === 'sms' && _jsx(Smartphone, { className: "w-5 h-5 text-orange-600" })] }), _jsxs("div", { children: [_jsx("h5", { className: "font-medium text-gray-900", children: api.name }), _jsx("p", { className: "text-sm text-gray-600", children: api.description })] })] }), _jsx("button", { onClick: () => toggleAPISelection(api.id), className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${selectedAPIs.includes(api.id) ? 'bg-blue-600' : 'bg-gray-200'}`, children: _jsx("span", { className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${selectedAPIs.includes(api.id) ? 'translate-x-6' : 'translate-x-1'}` }) })] }), selectedAPIs.includes(api.id) && (_jsxs("div", { className: "border-t border-gray-200 pt-3 mt-3", children: [_jsx("p", { className: "text-sm text-gray-600 mb-3", children: "\u63A5\u7D9A\u8A2D\u5B9A\uFF08\u30C6\u30B9\u30C8\u30E2\u30FC\u30C9\u3067\u306F\u5B9F\u969B\u306E\u8A2D\u5B9A\u306F\u4E0D\u8981\u3067\u3059\uFF09" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: Object.entries(api.credentials).map(([key, field]) => (_jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: [field.label, field.required && _jsx("span", { className: "text-red-500 ml-1", children: "*" })] }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: field.type === 'password' && !showPasswords[`${api.id}-${key}`] ? 'password' : 'text', placeholder: field.placeholder, className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50", disabled: testMode }), field.type === 'password' && (_jsx("button", { type: "button", onClick: () => togglePasswordVisibility(api.id, key), className: "absolute right-2 top-2 text-gray-400 hover:text-gray-600", children: showPasswords[`${api.id}-${key}`] ?
                                                                            _jsx(EyeOff, { className: "w-4 h-4" }) :
                                                                            _jsx(Eye, { className: "w-4 h-4" }) }))] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: field.description })] }, key))) })] }))] }, api.id)))] }), _jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start", children: [_jsx(Shield, { className: "w-5 h-5 text-yellow-600 mt-0.5 mr-2" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-yellow-900", children: "\u30C6\u30B9\u30C8\u30E2\u30FC\u30C9\u306B\u3064\u3044\u3066" }), _jsx("p", { className: "text-sm text-yellow-800 mt-1", children: "\u30C6\u30B9\u30C8\u30E2\u30FC\u30C9\u304C\u6709\u52B9\u306A\u9593\u306F\u3001\u5B9F\u969B\u306E\u5916\u90E8\u9001\u4FE1\u306F\u884C\u308F\u308C\u307E\u305B\u3093\u3002API\u8A2D\u5B9A\u306E\u52D5\u4F5C\u78BA\u8A8D\u306E\u307F\u53EF\u80FD\u3067\u3059\u3002" })] })] }) })] }));
            case 'test-data':
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "\u30C6\u30B9\u30C8\u30C7\u30FC\u30BF\u8A2D\u5B9A" }), _jsx("p", { className: "text-sm text-gray-600 mb-6", children: "\u30B7\u30B9\u30C6\u30E0\u306E\u52D5\u4F5C\u78BA\u8A8D\u7528\u306E\u30B5\u30F3\u30D7\u30EB\u30C7\u30FC\u30BF\u3092\u8AAD\u307F\u8FBC\u307F\u307E\u3059\u3002" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 text-center", children: [_jsx(Users, { className: "w-8 h-8 text-blue-600 mx-auto mb-2" }), _jsx("h4", { className: "font-medium text-blue-900", children: "\u9867\u5BA2\u30C7\u30FC\u30BF" }), _jsxs("p", { className: "text-2xl font-bold text-blue-600", children: [testCustomers.length, "\u540D"] }), _jsx("p", { className: "text-sm text-blue-700", children: "\u30B5\u30F3\u30D7\u30EB\u9867\u5BA2" })] }), _jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4 text-center", children: [_jsx(Calendar, { className: "w-8 h-8 text-green-600 mx-auto mb-2" }), _jsx("h4", { className: "font-medium text-green-900", children: "\u4E88\u7D04\u30C7\u30FC\u30BF" }), _jsxs("p", { className: "text-2xl font-bold text-green-600", children: [initialSetupData.reservations.length, "\u4EF6"] }), _jsx("p", { className: "text-sm text-green-700", children: "\u30B5\u30F3\u30D7\u30EB\u4E88\u7D04" })] }), _jsxs("div", { className: "bg-purple-50 border border-purple-200 rounded-lg p-4 text-center", children: [_jsx(Mail, { className: "w-8 h-8 text-purple-600 mx-auto mb-2" }), _jsx("h4", { className: "font-medium text-purple-900", children: "\u30E1\u30C3\u30BB\u30FC\u30B8" }), _jsxs("p", { className: "text-2xl font-bold text-purple-600", children: [initialSetupData.messages.length, "\u4EF6"] }), _jsx("p", { className: "text-sm text-purple-700", children: "\u30B5\u30F3\u30D7\u30EB\u30E1\u30C3\u30BB\u30FC\u30B8" })] }), _jsxs("div", { className: "bg-orange-50 border border-orange-200 rounded-lg p-4 text-center", children: [_jsx(Scissors, { className: "w-8 h-8 text-orange-600 mx-auto mb-2" }), _jsx("h4", { className: "font-medium text-orange-900", children: "\u30E1\u30CB\u30E5\u30FC" }), _jsxs("p", { className: "text-2xl font-bold text-orange-600", children: [selectedMenus.length, "\u7A2E\u985E"] }), _jsx("p", { className: "text-sm text-orange-700", children: "\u9078\u629E\u6E08\u307F\u30E1\u30CB\u30E5\u30FC" })] })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: "\u30C6\u30B9\u30C8\u30C7\u30FC\u30BF\u306E\u8AAD\u307F\u8FBC\u307F" }), _jsx("p", { className: "text-sm text-gray-600", children: "\u30B7\u30B9\u30C6\u30E0\u306E\u52D5\u4F5C\u78BA\u8A8D\u7528\u30C7\u30FC\u30BF\u3092\u6E96\u5099\u3057\u307E\u3059" })] }), _jsxs("button", { onClick: loadTestData, className: "flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "\u30C7\u30FC\u30BF\u8AAD\u307F\u8FBC\u307F"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("h5", { className: "font-medium text-gray-700 mb-2", children: "\u542B\u307E\u308C\u308B\u30C7\u30FC\u30BF:" }), _jsxs("ul", { className: "space-y-1 text-gray-600", children: [_jsx("li", { children: "\u2022 \u591A\u69D8\u306A\u9867\u5BA2\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\uFF08\u5E74\u9F62\u30FB\u6027\u5225\u30FB\u6765\u5E97\u5C65\u6B74\uFF09" }), _jsx("li", { children: "\u2022 \u5B9F\u969B\u306E\u4E88\u7D04\u30D1\u30BF\u30FC\u30F3\uFF08\u904E\u53BB\u30FB\u672A\u6765\uFF09" }), _jsx("li", { children: "\u2022 LINE\u30FBInstagram\u30E1\u30C3\u30BB\u30FC\u30B8\u30B5\u30F3\u30D7\u30EB" }), _jsx("li", { children: "\u2022 \u5404\u7A2E\u30E1\u30CB\u30E5\u30FC\u3068\u6599\u91D1\u8A2D\u5B9A" })] })] }), _jsxs("div", { children: [_jsx("h5", { className: "font-medium text-gray-700 mb-2", children: "\u5B89\u5168\u6027:" }), _jsxs("ul", { className: "space-y-1 text-gray-600", children: [_jsx("li", { children: "\u2022 \u5168\u3066\u67B6\u7A7A\u306E\u30C7\u30FC\u30BF\u3067\u3059" }), _jsx("li", { children: "\u2022 \u5916\u90E8\u9001\u4FE1\u306F\u5236\u9650\u3055\u308C\u3066\u3044\u307E\u3059" }), _jsx("li", { children: "\u2022 \u3044\u3064\u3067\u3082\u30C7\u30FC\u30BF\u3092\u30EA\u30BB\u30C3\u30C8\u53EF\u80FD" }), _jsx("li", { children: "\u2022 \u500B\u4EBA\u60C5\u5831\u306F\u542B\u307E\u308C\u307E\u305B\u3093" })] })] })] })] })] }));
            case 'complete':
                return (_jsxs("div", { className: "text-center space-y-6", children: [_jsx("div", { className: "w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto", children: _jsx(CheckCircle, { className: "w-10 h-10 text-green-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-2", children: "\u30BB\u30C3\u30C8\u30A2\u30C3\u30D7\u5B8C\u4E86\uFF01" }), _jsx("p", { className: "text-gray-600", children: "\u7F8E\u5BB9\u5BA4\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0\u306E\u521D\u671F\u8A2D\u5B9A\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F\u3002" })] }), _jsxs("div", { className: "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-4", children: "\u8A2D\u5B9A\u5185\u5BB9\u30B5\u30DE\u30EA\u30FC" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-left", children: [_jsxs("div", { children: [_jsx("h5", { className: "font-medium text-gray-700 mb-2", children: "\u5E97\u8217\u60C5\u5831:" }), _jsxs("ul", { className: "space-y-1 text-gray-600", children: [_jsxs("li", { children: ["\u2022 \u5E97\u8217\u540D: ", setupData.name || '未設定'] }), _jsxs("li", { children: ["\u2022 \u30BF\u30A4\u30D7: ", setupData.type || '未設定'] }), _jsxs("li", { children: ["\u2022 \u5E2D\u6570: ", setupData.capacity, "\u5E2D"] }), _jsxs("li", { children: ["\u2022 \u96FB\u8A71: ", setupData.phone || '未設定'] })] })] }), _jsxs("div", { children: [_jsx("h5", { className: "font-medium text-gray-700 mb-2", children: "\u30B7\u30B9\u30C6\u30E0\u8A2D\u5B9A:" }), _jsxs("ul", { className: "space-y-1 text-gray-600", children: [_jsxs("li", { children: ["\u2022 \u30E1\u30CB\u30E5\u30FC\u6570: ", selectedMenus.length, "\u7A2E\u985E"] }), _jsxs("li", { children: ["\u2022 API\u9023\u643A: ", selectedAPIs.length, "\u30B5\u30FC\u30D3\u30B9"] }), _jsxs("li", { children: ["\u2022 \u30C6\u30B9\u30C8\u30E2\u30FC\u30C9: ", testMode ? '有効' : '無効'] }), _jsx("li", { children: "\u2022 \u30C6\u30B9\u30C8\u30C7\u30FC\u30BF: \u6E96\u5099\u5B8C\u4E86" })] })] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("button", { onClick: completeSetup, className: "w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center justify-center", children: [_jsx(Sparkles, { className: "w-5 h-5 mr-2" }), "\u30B7\u30B9\u30C6\u30E0\u3092\u958B\u59CB\u3059\u308B"] }), _jsx("p", { className: "text-sm text-gray-500", children: "\u5F8C\u304B\u3089\u3059\u3079\u3066\u306E\u8A2D\u5B9A\u3092\u5909\u66F4\u30FB\u8FFD\u52A0\u3059\u308B\u3053\u3068\u304C\u3067\u304D\u307E\u3059" })] })] }));
            default:
                return _jsx("div", { children: "\u30B9\u30C6\u30C3\u30D7\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-8", children: _jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "\u7F8E\u5BB9\u5BA4\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0\u521D\u671F\u8A2D\u5B9A" }), _jsxs("p", { className: "text-gray-600", children: ["\u30B9\u30C6\u30C3\u30D7 ", currentStep + 1, " / ", steps.length, ": ", steps[currentStep].title] })] }), _jsxs("div", { className: "mb-8", children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: steps.map((step, index) => (_jsxs("div", { className: `flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`, children: [_jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center ${index <= currentStep
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-400'}`, children: index < currentStep ? (_jsx(CheckCircle, { className: "w-6 h-6" })) : (step.icon) }), index < steps.length - 1 && (_jsx("div", { className: `flex-1 h-1 mx-2 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}` }))] }, step.id))) }), _jsx("div", { className: "flex items-center justify-between text-sm", children: steps.map((step, index) => (_jsx("div", { className: `text-center ${index < steps.length - 1 ? 'flex-1' : ''} ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`, children: _jsx("div", { className: "font-medium", children: step.title }) }, step.id))) })] }), _jsx("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8", children: renderStepContent() }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("button", { onClick: prevStep, disabled: currentStep === 0, className: `flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${currentStep === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`, children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "\u524D\u306E\u30B9\u30C6\u30C3\u30D7"] }), currentStep < steps.length - 1 ? (_jsxs("button", { onClick: nextStep, className: "flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors", children: ["\u6B21\u306E\u30B9\u30C6\u30C3\u30D7", _jsx(ArrowRight, { className: "w-4 h-4 ml-2" })] })) : (_jsx("div", {}))] })] }) }));
};
export default InitialSetupWizard;
