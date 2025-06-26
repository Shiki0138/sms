import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Sparkles, Heart, Camera, Plus, Check } from 'lucide-react';
const BeauticianRegistration = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // 基本情報
        name: '',
        email: '',
        phone: '',
        profilePhoto: '',
        // プロフェッショナル情報
        experience: '',
        licenses: [],
        skills: [],
        specialties: '',
        portfolioImages: [],
        // 勤務条件
        workAreas: [],
        maxDistance: 20,
        workDays: [],
        workHours: {
            morning: false,
            afternoon: false,
            evening: false,
            flexible: false
        },
        minHourlyRate: '',
        preferredSalons: [],
        // アピールポイント
        strongPoints: '',
        workStyle: '',
        customerService: '',
        achievements: '',
        whyMe: '',
        // その他
        availableFrom: '',
        urgentAvailable: false,
        shortNotice: false,
        holidayWork: false,
        introduction: ''
    });
    const [errors, setErrors] = useState({});
    const skillOptions = [
        'カット', 'カラー', 'パーマ', 'ストレート', 'トリートメント',
        'ヘッドスパ', 'アップスタイル', 'メイク', 'ネイル', 'まつエク',
        'エステ', '着付け', 'ブライダル', 'メンズカット', 'キッズカット'
    ];
    const workAreaOptions = [
        '渋谷・原宿', '新宿・代々木', '池袋', '銀座・有楽町', '六本木・赤坂',
        '表参道・青山', '恵比寿・代官山', '品川・目黒', '上野・浅草', '吉祥寺・三鷹',
        '立川・八王子', '横浜', '川崎', '大宮', '千葉', 'その他'
    ];
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // エラーをクリア
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    const handleArrayToggle = (field, value) => {
        const array = formData[field];
        if (array.includes(value)) {
            handleInputChange(field, array.filter(item => item !== value));
        }
        else {
            handleInputChange(field, [...array, value]);
        }
    };
    const validateStep = (stepNumber) => {
        const newErrors = {};
        switch (stepNumber) {
            case 1:
                if (!formData.name)
                    newErrors.name = '名前を入力してください';
                if (!formData.email)
                    newErrors.email = 'メールアドレスを入力してください';
                if (!formData.phone)
                    newErrors.phone = '電話番号を入力してください';
                break;
            case 2:
                if (!formData.experience)
                    newErrors.experience = '経験年数を選択してください';
                if (formData.skills.length === 0)
                    newErrors.skills = 'スキルを1つ以上選択してください';
                break;
            case 3:
                if (formData.workAreas.length === 0)
                    newErrors.workAreas = '勤務可能エリアを選択してください';
                if (!formData.minHourlyRate)
                    newErrors.minHourlyRate = '希望時給を入力してください';
                break;
            case 4:
                if (!formData.strongPoints)
                    newErrors.strongPoints = '強みを入力してください';
                break;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };
    const handlePrevious = () => {
        setStep(step - 1);
    };
    const handleSubmit = () => {
        if (validateStep(4)) {
            console.log('登録データ:', formData);
            // ここで実際の登録処理を行う
            if (onComplete) {
                onComplete();
            }
        }
    };
    const renderStep = () => {
        switch (step) {
            case 1:
                return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "\u57FA\u672C\u60C5\u5831" }), _jsxs("div", { className: "flex flex-col items-center space-y-4", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center", children: formData.profilePhoto ? (_jsx("img", { src: formData.profilePhoto, alt: "Profile", className: "w-full h-full rounded-full object-cover" })) : (_jsx(Camera, { className: "w-12 h-12 text-gray-400" })) }), _jsx("button", { className: "absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700", children: _jsx(Camera, { className: "w-4 h-4" }) })] }), _jsx("p", { className: "text-sm text-gray-600", children: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u5199\u771F\u3092\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["\u304A\u540D\u524D ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => handleInputChange('name', e.target.value), className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`, placeholder: "\u5C71\u7530 \u82B1\u5B50" }), errors.name && _jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.name })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9 ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => handleInputChange('email', e.target.value), className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`, placeholder: "example@email.com" }), errors.email && _jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.email })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["\u96FB\u8A71\u756A\u53F7 ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "tel", value: formData.phone, onChange: (e) => handleInputChange('phone', e.target.value), className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`, placeholder: "090-1234-5678" }), errors.phone && _jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.phone })] })] }));
            case 2:
                return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "\u30B9\u30AD\u30EB\u30FB\u7D4C\u9A13" }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["\u7F8E\u5BB9\u5E2B\u7D4C\u9A13\u5E74\u6570 ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("select", { value: formData.experience, onChange: (e) => handleInputChange('experience', e.target.value), className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.experience ? 'border-red-500' : 'border-gray-300'}`, children: [_jsx("option", { value: "", children: "\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" }), _jsx("option", { value: "1", children: "1\u5E74\u672A\u6E80" }), _jsx("option", { value: "1-3", children: "1\u301C3\u5E74" }), _jsx("option", { value: "3-5", children: "3\u301C5\u5E74" }), _jsx("option", { value: "5-10", children: "5\u301C10\u5E74" }), _jsx("option", { value: "10+", children: "10\u5E74\u4EE5\u4E0A" })] }), errors.experience && _jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.experience })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u5BFE\u5FDC\u53EF\u80FD\u306A\u65BD\u8853 ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: skillOptions.map(skill => (_jsx("button", { onClick: () => handleArrayToggle('skills', skill), className: `px-3 py-2 text-sm rounded-lg border transition-colors ${formData.skills.includes(skill)
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`, children: skill }, skill))) }), errors.skills && _jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.skills })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u4FDD\u6709\u8CC7\u683C" }), _jsx("textarea", { value: formData.licenses.join('\n'), onChange: (e) => handleInputChange('licenses', e.target.value.split('\n').filter(l => l)), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500", rows: 3, placeholder: "\u7F8E\u5BB9\u5E2B\u514D\u8A31\n\u7BA1\u7406\u7F8E\u5BB9\u5E2B\n\u8272\u5F69\u691C\u5B9A1\u7D1A" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u5F97\u610F\u5206\u91CE\u30FB\u5C02\u9580\u6280\u8853" }), _jsx("textarea", { value: formData.specialties, onChange: (e) => handleInputChange('specialties', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500", rows: 3, placeholder: "\u30D6\u30EA\u30FC\u30C1\u30EF\u30FC\u30AF\u3001\u5916\u56FD\u4EBA\u98A8\u30AB\u30E9\u30FC\u3001\u30B7\u30E7\u30FC\u30C8\u30AB\u30C3\u30C8\u304C\u5F97\u610F\u3067\u3059" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u4F5C\u54C1\u5199\u771F\uFF08\u4EFB\u610F\uFF09" }), _jsx("div", { className: "grid grid-cols-4 gap-2", children: [...Array(4)].map((_, index) => (_jsx("div", { className: "aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer", children: _jsx(Plus, { className: "w-6 h-6 text-gray-400" }) }, index))) }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "\u3042\u306A\u305F\u306E\u6280\u8853\u3092\u30A2\u30D4\u30FC\u30EB\u3067\u304D\u308B\u5199\u771F\u3092\u8FFD\u52A0" })] })] }));
            case 3:
                return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "\u52E4\u52D9\u6761\u4EF6" }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u52E4\u52D9\u53EF\u80FD\u30A8\u30EA\u30A2 ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("div", { className: "grid grid-cols-2 gap-2 max-h-48 overflow-y-auto", children: workAreaOptions.map(area => (_jsx("button", { onClick: () => handleArrayToggle('workAreas', area), className: `px-3 py-2 text-sm rounded-lg border transition-colors ${formData.workAreas.includes(area)
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`, children: area }, area))) }), errors.workAreas && _jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.workAreas })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u6700\u5927\u79FB\u52D5\u8DDD\u96E2" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "range", min: "5", max: "50", value: formData.maxDistance, onChange: (e) => handleInputChange('maxDistance', parseInt(e.target.value)), className: "flex-1" }), _jsxs("span", { className: "text-sm font-medium w-16 text-right", children: [formData.maxDistance, "km"] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u52E4\u52D9\u53EF\u80FD\u6642\u9593\u5E2F" }), _jsx("div", { className: "space-y-2", children: [
                                        { key: 'morning', label: '午前（9:00-12:00）' },
                                        { key: 'afternoon', label: '午後（12:00-18:00）' },
                                        { key: 'evening', label: '夜間（18:00-21:00）' },
                                        { key: 'flexible', label: '時間は相談可能' }
                                    ].map(time => (_jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: formData.workHours[time.key], onChange: (e) => handleInputChange('workHours', {
                                                    ...formData.workHours,
                                                    [time.key]: e.target.checked
                                                }), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "text-sm text-gray-700", children: time.label })] }, time.key))) })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["\u6700\u4F4E\u5E0C\u671B\u6642\u7D66 ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500", children: "\u00A5" }), _jsx("input", { type: "number", value: formData.minHourlyRate, onChange: (e) => handleInputChange('minHourlyRate', e.target.value), className: `w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.minHourlyRate ? 'border-red-500' : 'border-gray-300'}`, placeholder: "2,500" })] }), errors.minHourlyRate && _jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.minHourlyRate })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u7279\u5225\u5BFE\u5FDC\u53EF\u80FD" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: formData.urgentAvailable, onChange: (e) => handleInputChange('urgentAvailable', e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "text-sm text-gray-700", children: "\u7DCA\u6025\u5BFE\u5FDC\u53EF\u80FD\uFF08\u5F53\u65E5\u4F9D\u983COK\uFF09" })] }), _jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: formData.shortNotice, onChange: (e) => handleInputChange('shortNotice', e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "text-sm text-gray-700", children: "\u524D\u65E5\u9023\u7D61\u3067\u3082\u5BFE\u5FDC\u53EF\u80FD" })] }), _jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: formData.holidayWork, onChange: (e) => handleInputChange('holidayWork', e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "text-sm text-gray-700", children: "\u571F\u65E5\u795D\u65E5\u3082\u52E4\u52D9\u53EF\u80FD" })] })] })] })] }));
            case 4:
                return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "\u30A2\u30D4\u30FC\u30EB\u30DD\u30A4\u30F3\u30C8" }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-blue-800", children: [_jsx("strong", { children: "\uD83D\uDCA1 \u30D2\u30F3\u30C8\uFF1A" }), "\u3042\u306A\u305F\u306E\u500B\u6027\u3084\u5F37\u307F\u3092\u81EA\u7531\u306B\u30A2\u30D4\u30FC\u30EB\u3057\u3066\u304F\u3060\u3055\u3044\u3002 \u7D4C\u55B6\u8005\u69D8\u304C\u3042\u306A\u305F\u3092\u9078\u3073\u305F\u304F\u306A\u308B\u7406\u7531\u3092\u5177\u4F53\u7684\u306B\u66F8\u304D\u307E\u3057\u3087\u3046\uFF01"] }) }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["\u3042\u306A\u305F\u306E\u5F37\u307F\u30FB\u7279\u5FB4 ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("textarea", { value: formData.strongPoints, onChange: (e) => handleInputChange('strongPoints', e.target.value), className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.strongPoints ? 'border-red-500' : 'border-gray-300'}`, rows: 4, placeholder: "\u4F8B\uFF1A10\u5E74\u4EE5\u4E0A\u306E\u7D4C\u9A13\u3067\u3001\u3069\u3093\u306A\u9AEA\u8CEA\u306E\u304A\u5BA2\u69D8\u306B\u3082\u5BFE\u5FDC\u3067\u304D\u307E\u3059\u3002\u7279\u306B\u30C0\u30E1\u30FC\u30B8\u30D8\u30A2\u306E\u6539\u5584\u304C\u5F97\u610F\u3067\u3001\u591A\u304F\u306E\u304A\u5BA2\u69D8\u304B\u3089\u559C\u3073\u306E\u58F0\u3092\u3044\u305F\u3060\u3044\u3066\u3044\u307E\u3059\u3002" }), errors.strongPoints && _jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.strongPoints })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u4ED5\u4E8B\u3078\u306E\u59FF\u52E2\u30FB\u3053\u3060\u308F\u308A" }), _jsx("textarea", { value: formData.workStyle, onChange: (e) => handleInputChange('workStyle', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500", rows: 3, placeholder: "\u4F8B\uFF1A\u304A\u5BA2\u69D8\u4E00\u4EBA\u3072\u3068\u308A\u3068\u3057\u3063\u304B\u308A\u5411\u304D\u5408\u3044\u3001\u305D\u306E\u65B9\u306B\u6700\u9069\u306A\u65BD\u8853\u3092\u63D0\u4F9B\u3059\u308B\u3053\u3068\u3092\u5FC3\u304C\u3051\u3066\u3044\u307E\u3059\u3002" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u63A5\u5BA2\u30B9\u30BF\u30A4\u30EB" }), _jsx("textarea", { value: formData.customerService, onChange: (e) => handleInputChange('customerService', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500", rows: 3, placeholder: "\u4F8B\uFF1A\u660E\u308B\u304F\u89AA\u3057\u307F\u3084\u3059\u3044\u63A5\u5BA2\u3092\u5FC3\u304C\u3051\u3066\u304A\u308A\u3001\u521D\u3081\u3066\u306E\u304A\u5BA2\u69D8\u3067\u3082\u30EA\u30E9\u30C3\u30AF\u30B9\u3057\u3066\u3044\u305F\u3060\u3051\u307E\u3059\u3002" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u3053\u308C\u307E\u3067\u306E\u5B9F\u7E3E\u30FB\u6210\u679C" }), _jsx("textarea", { value: formData.achievements, onChange: (e) => handleInputChange('achievements', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500", rows: 3, placeholder: "\u4F8B\uFF1A\u524D\u8077\u3067\u306F\u6307\u540D\u738780%\u4EE5\u4E0A\u3092\u7DAD\u6301\u3002SNS\u3067\u306E\u4F5C\u54C1\u6295\u7A3F\u306B\u3088\u308A\u65B0\u898F\u9867\u5BA2\u7372\u5F97\u306B\u3082\u8CA2\u732E\u3057\u307E\u3057\u305F\u3002" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u79C1\u3092\u9078\u3076\u30E1\u30EA\u30C3\u30C8" }), _jsx("textarea", { value: formData.whyMe, onChange: (e) => handleInputChange('whyMe', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500", rows: 4, placeholder: "\u4F8B\uFF1A\u5373\u6226\u529B\u3068\u3057\u3066\u8CA2\u732E\u3067\u304D\u307E\u3059\u3002\u5E45\u5E83\u3044\u6280\u8853\u3068\u7D4C\u9A13\u306B\u3088\u308A\u3001\u3069\u3093\u306A\u30AA\u30FC\u30C0\u30FC\u306B\u3082\u5BFE\u5FDC\u53EF\u80FD\u3067\u3059\u3002\u307E\u305F\u3001\u660E\u308B\u3044\u6027\u683C\u3067\u30B5\u30ED\u30F3\u306E\u96F0\u56F2\u6C17\u4F5C\u308A\u306B\u3082\u8CA2\u732E\u3057\u307E\u3059\u3002" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u81EA\u7531\u306B\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u3069\u3046\u305E" }), _jsx("textarea", { value: formData.introduction, onChange: (e) => handleInputChange('introduction', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500", rows: 4, placeholder: "\u30B5\u30ED\u30F3\u7D4C\u55B6\u8005\u69D8\u3078\u306E\u30E1\u30C3\u30BB\u30FC\u30B8\u3084\u3001\u8FFD\u52A0\u306E\u30A2\u30D4\u30FC\u30EB\u30DD\u30A4\u30F3\u30C8\u306A\u3069\u3001\u81EA\u7531\u306B\u304A\u66F8\u304D\u304F\u3060\u3055\u3044\u3002" })] })] }));
            default:
                return null;
        }
    };
    return (_jsxs("div", { className: "max-w-3xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("div", { className: "flex items-center justify-between mb-2", children: [1, 2, 3, 4].map((num) => (_jsxs("div", { className: `flex items-center ${num < 4 ? 'flex-1' : ''}`, children: [_jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center font-medium ${step >= num
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-500'}`, children: step > num ? _jsx(Check, { className: "w-5 h-5" }) : num }), num < 4 && (_jsx("div", { className: `flex-1 h-1 mx-2 ${step > num ? 'bg-blue-600' : 'bg-gray-200'}` }))] }, num))) }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500', children: "\u57FA\u672C\u60C5\u5831" }), _jsx("span", { className: step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500', children: "\u30B9\u30AD\u30EB\u30FB\u7D4C\u9A13" }), _jsx("span", { className: step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500', children: "\u52E4\u52D9\u6761\u4EF6" }), _jsx("span", { className: step >= 4 ? 'text-blue-600 font-medium' : 'text-gray-500', children: "\u30A2\u30D4\u30FC\u30EB" })] })] }), _jsx("div", { className: "bg-white rounded-lg border border-gray-200 p-6 mb-6", children: renderStep() }), _jsxs("div", { className: "flex justify-between", children: [_jsx("button", { onClick: handlePrevious, disabled: step === 1, className: `px-6 py-2 rounded-lg font-medium ${step === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`, children: "\u524D\u3078" }), step < 4 ? (_jsxs("button", { onClick: handleNext, className: "px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2", children: [_jsx("span", { children: "\u6B21\u3078" }), _jsx(Sparkles, { className: "w-4 h-4" })] })) : (_jsxs("button", { onClick: handleSubmit, className: "px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center space-x-2", children: [_jsx("span", { children: "\u767B\u9332\u3092\u5B8C\u4E86\u3059\u308B" }), _jsx(Heart, { className: "w-4 h-4" })] }))] })] }));
};
export default BeauticianRegistration;
