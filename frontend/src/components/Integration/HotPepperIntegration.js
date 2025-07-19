import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, ExternalLink, Settings, Info, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
const HotPepperIntegration = ({ onDataImport }) => {
    const [importedData, setImportedData] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [importStatus, setImportStatus] = useState('idle');
    const [importStats, setImportStats] = useState(null);
    // CSVファイルの処理
    const handleFileUpload = useCallback(async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        setIsProcessing(true);
        setImportStatus('idle');
        try {
            const text = await file.text();
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const parsedData = [];
            let hotpepperCount = 0;
            let earliestDate = '';
            let latestDate = '';
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line)
                    continue;
                const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                // サロンボードからのCSVエクスポート形式に対応
                const data = {
                    id: values[0] || `import_${Date.now()}_${i}`,
                    reservationDate: values[1] || '',
                    customerName: values[2] || '',
                    customerPhone: values[3] || '',
                    customerEmail: values[4] || '',
                    serviceType: values[5] || '',
                    serviceDetails: values[6] || '',
                    price: parseInt(values[7]) || 0,
                    staffName: values[8] || '',
                    status: values[9]?.toLowerCase() || 'completed',
                    referralSource: values[10]?.includes('ホットペッパー') || values[10]?.includes('hotpepper') ? 'hotpepper' : 'repeat',
                    memo: values[11] || ''
                };
                // 日付範囲の追跡
                if (data.reservationDate) {
                    if (!earliestDate || data.reservationDate < earliestDate) {
                        earliestDate = data.reservationDate;
                    }
                    if (!latestDate || data.reservationDate > latestDate) {
                        latestDate = data.reservationDate;
                    }
                }
                if (data.referralSource === 'hotpepper') {
                    hotpepperCount++;
                }
                parsedData.push(data);
            }
            setImportedData(parsedData);
            setImportStats({
                total: parsedData.length,
                hotpepperReservations: hotpepperCount,
                dateRange: earliestDate && latestDate ? { start: earliestDate, end: latestDate } : null
            });
            setImportStatus('success');
            // 親コンポーネントにデータを送信
            onDataImport(parsedData);
        }
        catch (error) {
            console.error('CSV import error:', error);
            setImportStatus('error');
        }
        finally {
            setIsProcessing(false);
        }
    }, [onDataImport]);
    // サンプルCSVのダウンロード
    const downloadSampleCSV = useCallback(() => {
        const sampleData = [
            ['予約ID', '予約日時', '顧客名', '電話番号', 'メールアドレス', 'サービス種別', 'サービス詳細', '料金', 'スタッフ名', 'ステータス', '集客経路', 'メモ'],
            ['R001', '2024-01-15 10:00', '田中 花子', '090-1234-5678', 'tanaka@example.com', 'カット+カラー', 'ショートボブ+グレージュカラー', '8500', '佐藤 美咲', 'completed', 'ホットペッパービューティー', '初回来店'],
            ['R002', '2024-01-15 14:00', '山田 太郎', '080-9876-5432', '', 'カット', 'メンズカット', '4500', '田中 健太', 'completed', 'リピート', ''],
            ['R003', '2024-01-16 11:30', '鈴木 愛', '070-5555-1234', 'suzuki@example.com', 'トリートメント', 'ヘアケアトリートメント', '6000', '佐藤 美咲', 'completed', 'ホットペッパービューティー', 'カラー後のケア'],
        ];
        const csvContent = sampleData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'hotpepper_sample.csv';
        link.click();
    }, []);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 flex items-center", children: [_jsx(FileSpreadsheet, { className: "w-6 h-6 mr-2 text-orange-600" }), "\u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC\u30D3\u30E5\u30FC\u30C6\u30A3\u30FC\u9023\u643A"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "\u65BD\u8853\u5C65\u6B74\u30C7\u30FC\u30BF\u306ECSV\u30A4\u30F3\u30DD\u30FC\u30C8\uFF08\u6700\u59271\u5E74\u5206\u5BFE\u5FDC\uFF09" })] }), _jsxs("a", { href: "https://beauty.hotpepper.jp/", target: "_blank", rel: "noopener noreferrer", className: "btn btn-secondary btn-sm", children: [_jsx(ExternalLink, { className: "w-4 h-4 mr-2" }), "\u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC\u30D3\u30E5\u30FC\u30C6\u30A3\u30FC"] })] }), _jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6", children: _jsxs("div", { className: "flex items-start", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-yellow-600 mr-2 mt-0.5" }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-yellow-800 mb-2", children: "\u91CD\u8981\u306A\u304A\u77E5\u3089\u305B" }), _jsxs("div", { className: "text-sm text-yellow-700 space-y-1", children: [_jsx("p", { children: "\u2022 \u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC\u30D3\u30E5\u30FC\u30C6\u30A3\u30FC\u306E\u516C\u5F0FAPI\u306F2017\u5E74\u306B\u63D0\u4F9B\u7D42\u4E86\u3068\u306A\u308A\u307E\u3057\u305F" }), _jsx("p", { children: "\u2022 \u73FE\u5728\u306F\u624B\u52D5\u3067\u306ECSV\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u30FB\u30A4\u30F3\u30DD\u30FC\u30C8\u304C\u4E3B\u306A\u9023\u643A\u65B9\u6CD5\u3067\u3059" }), _jsx("p", { children: "\u2022 \u30B5\u30ED\u30F3\u30DC\u30FC\u30C9\uFF08\u7121\u6599\u4E88\u7D04\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0\uFF09\u7D4C\u7531\u3067\u306E\u30C7\u30FC\u30BF\u53D6\u5F97\u3092\u63A8\u5968\u3057\u307E\u3059" })] })] })] }) })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center", children: [_jsx(Info, { className: "w-5 h-5 mr-2 text-blue-600" }), "\u30C7\u30FC\u30BF\u53D6\u5F97\u624B\u9806"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "\uD83D\uDCCA \u30B5\u30ED\u30F3\u30DC\u30FC\u30C9\u304B\u3089\u306E\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8" }), _jsxs("div", { className: "space-y-2 text-sm text-gray-700", children: [_jsxs("div", { className: "flex items-start", children: [_jsx("span", { className: "font-medium text-blue-600 mr-2", children: "1." }), _jsx("span", { children: "\u30B5\u30ED\u30F3\u30DC\u30FC\u30C9\u306B\u30ED\u30B0\u30A4\u30F3" })] }), _jsxs("div", { className: "flex items-start", children: [_jsx("span", { className: "font-medium text-blue-600 mr-2", children: "2." }), _jsx("span", { children: "\u300C\u5206\u6790\uFF08\u30AA\u30FC\u30CA\u30FC\uFF09\u300D\u2192\u300C\u9867\u5BA2\u5206\u6790\u300D\u2192\u300C\u9867\u5BA2\u691C\u7D22\u300D" })] }), _jsxs("div", { className: "flex items-start", children: [_jsx("span", { className: "font-medium text-blue-600 mr-2", children: "3." }), _jsx("span", { children: "\u671F\u9593\u3092\u6307\u5B9A\uFF08\u6700\u59271\u5E74\u5206\uFF09" })] }), _jsxs("div", { className: "flex items-start", children: [_jsx("span", { className: "font-medium text-blue-600 mr-2", children: "4." }), _jsx("span", { children: "\u300CCSV\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u300D\u3092\u30AF\u30EA\u30C3\u30AF" })] }), _jsxs("div", { className: "flex items-start", children: [_jsx("span", { className: "font-medium text-blue-600 mr-2", children: "5." }), _jsx("span", { children: "\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u305FCSV\u30D5\u30A1\u30A4\u30EB\u3092\u3053\u3053\u306B\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9" })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "\u26A0\uFE0F \u6CE8\u610F\u4E8B\u9805" }), _jsxs("div", { className: "space-y-2 text-sm text-gray-700", children: [_jsx("div", { children: "\u2022 CSV\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u306B\u306F\u9069\u5207\u306A\u6A29\u9650\u8A2D\u5B9A\u304C\u5FC5\u8981\u3067\u3059" }), _jsx("div", { children: "\u2022 \u6700\u59271\u5E74\u5206\u306E\u30C7\u30FC\u30BF\u3092\u53D6\u5F97\u53EF\u80FD\u3067\u3059" }), _jsx("div", { children: "\u2022 \u624B\u52D5\u4E88\u7D04\u5206\u306F\u4ED6\u30B7\u30B9\u30C6\u30E0\u3068\u306E\u540C\u671F\u304C\u3067\u304D\u307E\u305B\u3093" }), _jsx("div", { children: "\u2022 \u30C7\u30FC\u30BF\u5F62\u5F0F\u306F\u30B5\u30ED\u30F3\u30DC\u30FC\u30C9\u306E\u6A19\u6E96\u30D5\u30A9\u30FC\u30DE\u30C3\u30C8\u306B\u6E96\u62E0\u3057\u3066\u304F\u3060\u3055\u3044" })] })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: "CSV\u30D5\u30A1\u30A4\u30EB\u306E\u30A4\u30F3\u30DD\u30FC\u30C8" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: "\u30B5\u30F3\u30D7\u30EBCSV\u30D5\u30A1\u30A4\u30EB" }), _jsx("p", { className: "text-sm text-gray-600", children: "\u6B63\u3057\u3044\u30C7\u30FC\u30BF\u5F62\u5F0F\u306E\u53C2\u8003\u7528\u30B5\u30F3\u30D7\u30EB\u30D5\u30A1\u30A4\u30EB" })] }), _jsxs("button", { onClick: downloadSampleCSV, className: "btn btn-secondary btn-sm", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "\u30B5\u30F3\u30D7\u30EBDL"] })] }), _jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-8 text-center", children: [_jsx("input", { type: "file", accept: ".csv", onChange: handleFileUpload, className: "hidden", id: "csv-upload", disabled: isProcessing }), _jsx("label", { htmlFor: "csv-upload", className: "cursor-pointer", children: isProcessing ? (_jsxs("div", { className: "flex items-center justify-center", children: [_jsx(RefreshCw, { className: "w-8 h-8 text-blue-600 animate-spin mr-3" }), _jsx("span", { className: "text-lg text-gray-600", children: "\u51E6\u7406\u4E2D..." })] })) : (_jsxs("div", { children: [_jsx(Upload, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-lg text-gray-600 mb-2", children: "CSV\u30D5\u30A1\u30A4\u30EB\u3092\u30C9\u30E9\u30C3\u30B0&\u30C9\u30ED\u30C3\u30D7" }), _jsx("p", { className: "text-sm text-gray-500", children: "\u307E\u305F\u306F\u3001\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u30D5\u30A1\u30A4\u30EB\u3092\u9078\u629E" })] })) })] }), importStatus === 'success' && importStats && (_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-600 mr-2" }), _jsx("h4", { className: "font-medium text-green-800", children: "\u30A4\u30F3\u30DD\u30FC\u30C8\u5B8C\u4E86" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-green-700", children: "\u7DCF\u30C7\u30FC\u30BF\u6570:" }), _jsxs("span", { className: "font-medium ml-2", children: [importStats.total, "\u4EF6"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-green-700", children: "\u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC\u7D4C\u7531:" }), _jsxs("span", { className: "font-medium ml-2", children: [importStats.hotpepperReservations, "\u4EF6"] })] }), importStats.dateRange && (_jsxs("div", { children: [_jsx("span", { className: "text-green-700", children: "\u671F\u9593:" }), _jsxs("span", { className: "font-medium ml-2", children: [format(new Date(importStats.dateRange.start), 'M/d', { locale: ja }), " -", format(new Date(importStats.dateRange.end), 'M/d', { locale: ja })] })] }))] })] })), importStatus === 'error' && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-600 mr-2" }), _jsx("span", { className: "font-medium text-red-800", children: "\u30A4\u30F3\u30DD\u30FC\u30C8\u30A8\u30E9\u30FC" })] }), _jsx("p", { className: "text-sm text-red-700 mt-1", children: "CSV\u30D5\u30A1\u30A4\u30EB\u306E\u5F62\u5F0F\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u30B5\u30F3\u30D7\u30EB\u30D5\u30A1\u30A4\u30EB\u3092\u53C2\u8003\u306B\u3057\u3066\u304F\u3060\u3055\u3044\u3002" })] }))] })] }), importedData.length > 0 && (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: "\u30A4\u30F3\u30DD\u30FC\u30C8\u30C7\u30FC\u30BF\u30D7\u30EC\u30D3\u30E5\u30FC" }), _jsxs("div", { className: "overflow-x-auto", children: [_jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left text-xs font-medium text-gray-500", children: "\u4E88\u7D04\u65E5" }), _jsx("th", { className: "px-4 py-2 text-left text-xs font-medium text-gray-500", children: "\u9867\u5BA2\u540D" }), _jsx("th", { className: "px-4 py-2 text-left text-xs font-medium text-gray-500", children: "\u30B5\u30FC\u30D3\u30B9" }), _jsx("th", { className: "px-4 py-2 text-left text-xs font-medium text-gray-500", children: "\u6599\u91D1" }), _jsx("th", { className: "px-4 py-2 text-left text-xs font-medium text-gray-500", children: "\u96C6\u5BA2\u7D4C\u8DEF" }), _jsx("th", { className: "px-4 py-2 text-left text-xs font-medium text-gray-500", children: "\u30B9\u30C6\u30FC\u30BF\u30B9" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: importedData.slice(0, 10).map((item, index) => (_jsxs("tr", { children: [_jsx("td", { className: "px-4 py-2 text-sm text-gray-900", children: item.reservationDate ? format(new Date(item.reservationDate), 'M/d HH:mm', { locale: ja }) : '-' }), _jsx("td", { className: "px-4 py-2 text-sm text-gray-900", children: item.customerName }), _jsx("td", { className: "px-4 py-2 text-sm text-gray-900", children: item.serviceType }), _jsxs("td", { className: "px-4 py-2 text-sm text-gray-900", children: ["\u00A5", item.price.toLocaleString()] }), _jsx("td", { className: "px-4 py-2 text-sm", children: _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${item.referralSource === 'hotpepper'
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-blue-100 text-blue-800'}`, children: item.referralSource === 'hotpepper' ? 'ホットペッパー' : 'リピート' }) }), _jsx("td", { className: "px-4 py-2 text-sm", children: _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${item.status === 'completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : item.status === 'cancelled'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-gray-100 text-gray-800'}`, children: item.status === 'completed' ? '完了' : item.status === 'cancelled' ? 'キャンセル' : '未来店' }) })] }, index))) })] }), importedData.length > 10 && (_jsxs("div", { className: "text-center py-3 text-sm text-gray-500", children: ["\u4ED6 ", importedData.length - 10, "\u4EF6\u306E\u30C7\u30FC\u30BF"] }))] })] })), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-6", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center", children: [_jsx(Settings, { className: "w-5 h-5 mr-2 text-blue-600" }), "\u4EE3\u66FF\u9023\u643A\u30AA\u30D7\u30B7\u30E7\u30F3"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-white p-4 rounded-lg", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "\uD83D\uDCF1 \u30B5\u30ED\u30F3\u30DC\u30FC\u30C9\u9023\u643A" }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: "\u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC\u30D3\u30E5\u30FC\u30C6\u30A3\u30FC\u306E\u516C\u5F0F\u4E88\u7D04\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0" }), _jsxs("ul", { className: "text-sm text-gray-700 space-y-1", children: [_jsx("li", { children: "\u2022 \u7121\u6599\u3067\u5229\u7528\u53EF\u80FD" }), _jsx("li", { children: "\u2022 \u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u4E88\u7D04\u7BA1\u7406" }), _jsx("li", { children: "\u2022 CSV\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u6A5F\u80FD" })] })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "\uD83D\uDD04 \u5B9A\u671F\u30A4\u30F3\u30DD\u30FC\u30C8" }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: "\u6708\u6B21\u30FB\u9031\u6B21\u3067\u306E\u624B\u52D5\u30C7\u30FC\u30BF\u540C\u671F" }), _jsxs("ul", { className: "text-sm text-gray-700 space-y-1", children: [_jsx("li", { children: "\u2022 \u67081\u56DE\u306E\u30C7\u30FC\u30BF\u540C\u671F" }), _jsx("li", { children: "\u2022 \u5206\u6790\u7CBE\u5EA6\u306E\u5411\u4E0A" }), _jsx("li", { children: "\u2022 \u5C65\u6B74\u30C7\u30FC\u30BF\u306E\u84C4\u7A4D" })] })] })] })] })] }));
};
export default HotPepperIntegration;
