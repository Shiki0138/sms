import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Save, AlertCircle, X } from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, getWeekOfMonth } from 'date-fns';
import { ja } from 'date-fns/locale';
const AdvancedHolidaySettings = () => {
    const [holidaySettings, setHolidaySettings] = useState({
        weeklyClosedDays: [1], // デフォルト：月曜日
        nthWeekdayRules: [], // デフォルト：なし
        specificHolidays: []
    });
    const [previewMonth, setPreviewMonth] = useState(new Date());
    const [holidayPreviews, setHolidayPreviews] = useState([]);
    const [newHolidayDate, setNewHolidayDate] = useState('');
    const [newHolidayDescription, setNewHolidayDescription] = useState('');
    const [newNthWeekdayRule, setNewNthWeekdayRule] = useState({
        nth: [],
        weekday: 1
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    useEffect(() => {
        loadHolidaySettings();
    }, []);
    useEffect(() => {
        generateHolidayPreviews();
    }, [holidaySettings, previewMonth]);
    const loadHolidaySettings = async () => {
        setIsLoading(true);
        try {
            // デモデータで初期化
            setHolidaySettings({
                weeklyClosedDays: [1], // 月曜日
                nthWeekdayRules: [
                    { nth: [2, 4], weekday: 2 } // 毎月第2・第4火曜日（例）
                ],
                specificHolidays: [
                    '2025-01-01', // 元日
                    '2025-12-31' // 大晦日
                ]
            });
        }
        catch (error) {
            console.error('Holiday settings load error:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const toggleWeeklyClosedDay = (dayIndex) => {
        setHolidaySettings(prev => ({
            ...prev,
            weeklyClosedDays: prev.weeklyClosedDays.includes(dayIndex)
                ? prev.weeklyClosedDays.filter(day => day !== dayIndex)
                : [...prev.weeklyClosedDays, dayIndex]
        }));
    };
    const addSpecificHoliday = () => {
        if (!newHolidayDate)
            return;
        setHolidaySettings(prev => ({
            ...prev,
            specificHolidays: [...prev.specificHolidays, newHolidayDate].sort()
        }));
        setNewHolidayDate('');
        setNewHolidayDescription('');
    };
    const removeSpecificHoliday = (dateToRemove) => {
        setHolidaySettings(prev => ({
            ...prev,
            specificHolidays: prev.specificHolidays.filter(date => date !== dateToRemove)
        }));
    };
    const addNthWeekdayRule = () => {
        if (newNthWeekdayRule.nth.length === 0)
            return;
        setHolidaySettings(prev => ({
            ...prev,
            nthWeekdayRules: [...prev.nthWeekdayRules, { ...newNthWeekdayRule }]
        }));
        setNewNthWeekdayRule({ nth: [], weekday: 1 });
    };
    const removeNthWeekdayRule = (indexToRemove) => {
        setHolidaySettings(prev => ({
            ...prev,
            nthWeekdayRules: prev.nthWeekdayRules.filter((_, index) => index !== indexToRemove)
        }));
    };
    const toggleNthWeek = (week) => {
        setNewNthWeekdayRule(prev => ({
            ...prev,
            nth: prev.nth.includes(week)
                ? prev.nth.filter(n => n !== week)
                : [...prev.nth, week].sort()
        }));
    };
    const saveHolidaySettings = async () => {
        setIsSaving(true);
        try {
            // デモ用の保存処理
            console.log('休日設定を保存:', holidaySettings);
            alert('休日設定を保存しました');
        }
        catch (error) {
            console.error('Save error:', error);
            alert('保存に失敗しました');
        }
        finally {
            setIsSaving(false);
        }
    };
    const generateHolidayPreviews = () => {
        const previews = [];
        const startDate = startOfMonth(previewMonth);
        const endDate = endOfMonth(addMonths(previewMonth, 2)); // 3ヶ月分プレビュー
        const allDays = eachDayOfInterval({ start: startDate, end: endDate });
        // 定休日（毎週）
        allDays.forEach(day => {
            const dayOfWeek = getDay(day);
            if (holidaySettings.weeklyClosedDays.includes(dayOfWeek)) {
                const dayName = ['日', '月', '火', '水', '木', '金', '土'][dayOfWeek];
                previews.push({
                    date: format(day, 'yyyy-MM-dd'),
                    description: `定休日（${dayName}曜日）`,
                    type: 'weekly'
                });
            }
        });
        // 毎月第◯◯曜日
        holidaySettings.nthWeekdayRules.forEach(rule => {
            const dayName = ['日', '月', '火', '水', '木', '金', '土'][rule.weekday];
            // 各月をチェック
            for (let monthOffset = 0; monthOffset <= 2; monthOffset++) {
                const currentMonth = addMonths(previewMonth, monthOffset);
                const monthStart = startOfMonth(currentMonth);
                const monthEnd = endOfMonth(currentMonth);
                const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
                monthDays.forEach(day => {
                    const dayOfWeek = getDay(day);
                    if (dayOfWeek === rule.weekday) {
                        const weekOfMonth = getWeekOfMonth(day, { weekStartsOn: 1 });
                        if (rule.nth.includes(weekOfMonth)) {
                            const nthText = rule.nth.map(n => `第${n}`).join('・');
                            previews.push({
                                date: format(day, 'yyyy-MM-dd'),
                                description: `定休日（${nthText}${dayName}曜日）`,
                                type: 'nthWeekday'
                            });
                        }
                    }
                });
            }
        });
        // 特定の休日
        holidaySettings.specificHolidays.forEach(holidayDate => {
            const date = new Date(holidayDate);
            if (date >= startDate && date <= endDate) {
                previews.push({
                    date: holidayDate,
                    description: '特別休業日',
                    type: 'specific'
                });
            }
        });
        setHolidayPreviews(previews.sort((a, b) => a.date.localeCompare(b.date)));
    };
    // 日付が休日かどうかをチェックする関数（他のコンポーネントで使用可能）
    const isHoliday = (date) => {
        const dayOfWeek = getDay(date);
        const dateStr = format(date, 'yyyy-MM-dd');
        // 毎週の定休日チェック
        if (holidaySettings.weeklyClosedDays.includes(dayOfWeek)) {
            return true;
        }
        // 毎月第◯◯曜日チェック
        for (const rule of holidaySettings.nthWeekdayRules) {
            if (dayOfWeek === rule.weekday) {
                const weekOfMonth = getWeekOfMonth(date, { weekStartsOn: 1 });
                if (rule.nth.includes(weekOfMonth)) {
                    return true;
                }
            }
        }
        // 特定日チェック
        return holidaySettings.specificHolidays.includes(dateStr);
    };
    if (isLoading) {
        return (_jsxs("div", { className: "flex items-center justify-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("span", { className: "ml-2 text-gray-600", children: "\u8AAD\u307F\u8FBC\u307F\u4E2D..." })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "\u4F11\u65E5\u8A2D\u5B9A" }), _jsx("p", { className: "text-sm text-gray-600", children: "\u5B9A\u4F11\u65E5\u3068\u7279\u5225\u4F11\u696D\u65E5\u3092\u8A2D\u5B9A\u3067\u304D\u307E\u3059" })] }), _jsxs("button", { onClick: saveHolidaySettings, disabled: isSaving, className: "flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors", children: [isSaving ? (_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" })) : (_jsx(Save, { className: "w-4 h-4" })), _jsx("span", { children: "\u4FDD\u5B58" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsx("h4", { className: "text-md font-medium text-gray-900 mb-4", children: "\u5B9A\u4F11\u65E5\u8A2D\u5B9A" }), _jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u6BCE\u9031\u306E\u5B9A\u4F11\u65E5\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" }), _jsx("div", { className: "grid grid-cols-4 gap-3", children: ['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (_jsxs("label", { className: "flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: holidaySettings.weeklyClosedDays.includes(index), onChange: () => toggleWeeklyClosedDay(index), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsxs("span", { className: "text-sm font-medium text-gray-900", children: [day, "\u66DC\u65E5"] })] }, index))) })] }), _jsxs("div", { className: "mt-6 pt-6 border-t border-gray-200", children: [_jsx("h5", { className: "text-sm font-medium text-gray-900 mb-3", children: "\u6BCE\u6708\u7B2C\u25EF\u25EF\u66DC\u65E5\u8A2D\u5B9A" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-600 mb-2", children: "\u7B2C\u4F55\u9031\u76EE\u3092\u9078\u629E" }), _jsx("div", { className: "flex space-x-2", children: [1, 2, 3, 4, 5].map(week => (_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: newNthWeekdayRule.nth.includes(week), onChange: () => toggleNthWeek(week), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-1" }), _jsxs("span", { className: "text-xs", children: ["\u7B2C", week] })] }, week))) })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("select", { value: newNthWeekdayRule.weekday, onChange: (e) => setNewNthWeekdayRule(prev => ({ ...prev, weekday: parseInt(e.target.value) })), className: "flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'].map((day, index) => (_jsx("option", { value: index, children: day }, index))) }), _jsx("button", { onClick: addNthWeekdayRule, disabled: newNthWeekdayRule.nth.length === 0, className: "flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed", children: _jsx(Plus, { className: "w-4 h-4" }) })] })] })] }), holidaySettings.nthWeekdayRules.length > 0 && (_jsxs("div", { className: "mt-4", children: [_jsx("h5", { className: "text-sm font-medium text-gray-900 mb-2", children: "\u8A2D\u5B9A\u6E08\u307F\u5B9A\u671F\u4F11\u65E5" }), _jsx("div", { className: "space-y-2 max-h-32 overflow-y-auto", children: holidaySettings.nthWeekdayRules.map((rule, index) => {
                                            const dayName = ['日', '月', '火', '水', '木', '金', '土'][rule.weekday];
                                            const nthText = rule.nth.map(n => `第${n}`).join('・');
                                            return (_jsxs("div", { className: "flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded", children: [_jsxs("span", { className: "text-sm text-green-900", children: ["\u6BCE\u6708", nthText, dayName, "\u66DC\u65E5"] }), _jsx("button", { onClick: () => removeNthWeekdayRule(index), className: "text-green-500 hover:text-green-700", children: _jsx(X, { className: "w-4 h-4" }) })] }, index));
                                        }) })] })), _jsxs("div", { className: "mt-6 pt-6 border-t border-gray-200", children: [_jsx("h5", { className: "text-sm font-medium text-gray-900 mb-3", children: "\u7279\u5225\u4F11\u696D\u65E5\u8FFD\u52A0" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("input", { type: "date", value: newHolidayDate, onChange: (e) => setNewHolidayDate(e.target.value), className: "flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx("button", { onClick: addSpecificHoliday, disabled: !newHolidayDate, className: "flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed", children: _jsx(Plus, { className: "w-4 h-4" }) })] })] }), holidaySettings.specificHolidays.length > 0 && (_jsxs("div", { className: "mt-4", children: [_jsx("h5", { className: "text-sm font-medium text-gray-900 mb-2", children: "\u8A2D\u5B9A\u6E08\u307F\u7279\u5225\u4F11\u696D\u65E5" }), _jsx("div", { className: "space-y-2 max-h-32 overflow-y-auto", children: holidaySettings.specificHolidays.map((date) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded", children: [_jsx("span", { className: "text-sm text-red-900", children: format(new Date(date), 'yyyy年M月d日(E)', { locale: ja }) }), _jsx("button", { onClick: () => removeSpecificHoliday(date), className: "text-red-500 hover:text-red-700", children: _jsx(X, { className: "w-4 h-4" }) })] }, date))) })] }))] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h4", { className: "text-md font-medium text-gray-900", children: "\u4F11\u65E5\u30D7\u30EC\u30D3\u30E5\u30FC" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: () => setPreviewMonth(addMonths(previewMonth, -1)), className: "p-1 hover:bg-gray-100 rounded", children: _jsx(X, { className: "w-4 h-4 rotate-90" }) }), _jsx("span", { className: "text-sm font-medium", children: format(previewMonth, 'yyyy年M月', { locale: ja }) }), _jsx("button", { onClick: () => setPreviewMonth(addMonths(previewMonth, 1)), className: "p-1 hover:bg-gray-100 rounded", children: _jsx(X, { className: "w-4 h-4 -rotate-90" }) })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "text-xs text-gray-600", children: ["\u4ECA\u5F8C3\u30F6\u6708\u306E\u4F11\u65E5\u4E88\u5B9A\uFF08", holidayPreviews.length, "\u65E5\uFF09"] }), _jsxs("div", { className: "max-h-64 overflow-y-auto space-y-2", children: [holidayPreviews.slice(0, 20).map((preview, index) => (_jsxs("div", { className: `flex items-center justify-between p-2 rounded border ${preview.type === 'weekly'
                                                    ? 'bg-blue-50 border-blue-200'
                                                    : preview.type === 'nthWeekday'
                                                        ? 'bg-green-50 border-green-200'
                                                        : 'bg-red-50 border-red-200'}`, children: [_jsxs("div", { children: [_jsx("div", { className: `text-sm font-medium ${preview.type === 'weekly' ? 'text-blue-900' :
                                                                    preview.type === 'nthWeekday' ? 'text-green-900' : 'text-red-900'}`, children: format(new Date(preview.date), 'M月d日(E)', { locale: ja }) }), _jsx("div", { className: `text-xs ${preview.type === 'weekly' ? 'text-blue-700' :
                                                                    preview.type === 'nthWeekday' ? 'text-green-700' : 'text-red-700'}`, children: preview.description })] }), _jsx(CalendarIcon, { className: `w-4 h-4 ${preview.type === 'weekly' ? 'text-blue-500' :
                                                            preview.type === 'nthWeekday' ? 'text-green-500' : 'text-red-500'}` })] }, index))), holidayPreviews.length > 20 && (_jsxs("div", { className: "text-center text-xs text-gray-500 py-2", children: ["\u4ED6 ", holidayPreviews.length - 20, " \u65E5..."] })), holidayPreviews.length === 0 && (_jsx("div", { className: "text-center text-sm text-gray-500 py-4", children: "\u8A2D\u5B9A\u3055\u308C\u305F\u4F11\u65E5\u306F\u3042\u308A\u307E\u305B\u3093" }))] })] })] })] }), _jsx("div", { className: "bg-blue-50 p-4 rounded-lg border border-blue-200", children: _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-blue-600 mt-0.5" }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-blue-900 mb-1", children: "\u4F7F\u7528\u65B9\u6CD5" }), _jsxs("ul", { className: "text-xs text-blue-800 space-y-1", children: [_jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "\u5B9A\u4F11\u65E5" }), ": \u6BCE\u9031\u6C7A\u307E\u3063\u305F\u66DC\u65E5\u306E\u4F11\u696D\u65E5\u3092\u8A2D\u5B9A"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "\u6BCE\u6708\u7B2C\u25EF\u25EF\u66DC\u65E5" }), ": \u7B2C1\u30FB\u7B2C3\u6708\u66DC\u65E5\u306A\u3069\u4E0D\u5B9A\u671F\u306A\u5B9A\u4F11\u65E5\u3092\u8A2D\u5B9A"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "\u7279\u5225\u4F11\u696D\u65E5" }), ": \u5E74\u672B\u5E74\u59CB\u3001\u7814\u4FEE\u65E5\u3001\u81E8\u6642\u4F11\u696D\u306A\u3069\u306E\u500B\u5225\u65E5\u7A0B\u3092\u8A2D\u5B9A"] }), _jsx("li", { children: "\u2022 \u8A2D\u5B9A\u3057\u305F\u4F11\u65E5\u306F\u4E88\u7D04\u30AB\u30EC\u30F3\u30C0\u30FC\u306B\u81EA\u52D5\u7684\u306B\u53CD\u6620\u3055\u308C\u307E\u3059" }), _jsx("li", { children: "\u2022 \u9752\u8272\u306F\u6BCE\u9031\u5B9A\u4F11\u65E5\u3001\u7DD1\u8272\u306F\u7B2C\u25EF\u66DC\u65E5\u5B9A\u4F11\u65E5\u3001\u8D64\u8272\u306F\u7279\u5225\u4F11\u696D\u65E5\u3092\u8868\u793A" })] })] })] }) })] }));
};
export default AdvancedHolidaySettings;
