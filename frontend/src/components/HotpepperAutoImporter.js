import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Zap, Mail, Settings, CheckCircle, AlertCircle, RefreshCw, Download, Upload, FileText, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
const HotpepperAutoImporter = ({ onImport, onClose, isOpen }) => {
    const [activeMethod, setActiveMethod] = useState('email');
    const [emailSettings, setEmailSettings] = useState({
        forwardEmail: '',
        checkInterval: 15,
        autoImport: false
    });
    const [lastImportTime, setLastImportTime] = useState(null);
    const [importStatus, setImportStatus] = useState('idle');
    // 自動インポート方法の説明
    const importMethods = {
        email: {
            title: '📧 メール転送方式',
            description: 'ホットペッパーの予約通知メールを専用アドレスに転送',
            pros: ['設定が簡単', 'リアルタイム性が高い', '追加費用なし'],
            cons: ['メール設定が必要', 'メールフォーマット変更に弱い'],
            setup: [
                'ホットペッパー管理画面で通知メール設定',
                'Gmail等で自動転送ルール作成',
                '転送先メールアドレスを本システムに登録',
                'システムが定期的にメールをチェック'
            ]
        },
        gmail: {
            title: '🔗 Gmail API連携',
            description: 'Gmailと連携して予約通知メールを自動取得',
            pros: ['完全自動化', '安定性が高い', '履歴管理可能'],
            cons: ['初期設定がやや複雑', 'Googleアカウント必須'],
            setup: [
                'Google Cloud Consoleでプロジェクト作成',
                'Gmail APIを有効化',
                '認証情報を取得',
                'システムに認証情報を設定'
            ]
        },
        manual: {
            title: '📋 定期CSV取込み',
            description: 'ホットペッパーから定期的にCSVをダウンロード',
            pros: ['確実性が高い', 'データが正確', '一括処理可能'],
            cons: ['手動作業が必要', 'リアルタイム性なし'],
            setup: [
                'ホットペッパー管理画面にログイン',
                '予約データをCSVエクスポート',
                'システムにCSVをアップロード',
                '差分のみ自動インポート'
            ]
        },
        rpa: {
            title: '🤖 RPA自動化',
            description: 'RPAツールでホットペッパー操作を自動化',
            pros: ['完全自動化', '柔軟性が高い', '他システムも対応可'],
            cons: ['RPA環境が必要', '保守が必要', 'コストがかかる'],
            setup: [
                'UiPath/PowerAutomate等のRPAツール導入',
                'ホットペッパーログイン・データ取得シナリオ作成',
                'APIまたはCSVでシステムに連携',
                'スケジュール実行設定'
            ]
        }
    };
    // メール解析のサンプルパターン
    const emailPatterns = {
        customerName: /お客様名[:：]\s*(.+)/,
        reservationDate: /予約日時[:：]\s*(\d{4}年\d{1,2}月\d{1,2}日)/,
        reservationTime: /(\d{1,2}[:：]\d{2})/,
        menuContent: /メニュー[:：]\s*(.+)/,
        staffName: /担当スタッフ[:：]\s*(.+)/,
        phone: /電話番号[:：]\s*([\d-]+)/,
        notes: /備考[:：]\s*(.+)/
    };
    // メール転送設定の保存
    const handleSaveEmailSettings = () => {
        // 実際の実装では、サーバーに設定を保存
        console.log('Email settings saved:', emailSettings);
        alert('メール転送設定を保存しました');
    };
    // 手動インポートチェック
    const handleManualCheck = () => {
        setImportStatus('checking');
        // デモ用：実際はメールサーバーをチェック
        setTimeout(() => {
            setImportStatus('importing');
            setTimeout(() => {
                const demoReservations = [
                    {
                        id: `hp_${Date.now()}_1`,
                        customerName: '新規 太郎',
                        phone: '090-1234-5678',
                        reservationDate: format(new Date(), 'yyyy-MM-dd'),
                        reservationTime: '14:00',
                        menuContent: 'カット＋カラー',
                        staffName: '山田 花子',
                        source: 'HOTPEPPER',
                        status: 'CONFIRMED',
                        importedAt: new Date().toISOString()
                    },
                    {
                        id: `hp_${Date.now()}_2`,
                        customerName: '既存 花子',
                        phone: '080-9876-5432',
                        reservationDate: format(new Date(), 'yyyy-MM-dd'),
                        reservationTime: '16:00',
                        menuContent: 'パーマ',
                        staffName: '佐藤 次郎',
                        source: 'HOTPEPPER',
                        status: 'CONFIRMED',
                        importedAt: new Date().toISOString()
                    }
                ];
                setImportStatus('success');
                setLastImportTime(new Date());
                onImport(demoReservations);
                alert(`${demoReservations.length}件の新規予約をインポートしました！`);
            }, 2000);
        }, 1500);
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4", children: _jsx("div", { className: "bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col", children: _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 flex items-center", children: [_jsx(Zap, { className: "w-6 h-6 mr-2 text-yellow-500" }), "\u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC\u4E88\u7D04\u81EA\u52D5\u9023\u643A"] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "\u9023\u643A\u65B9\u6CD5\u3092\u9078\u629E" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: Object.entries(importMethods).map(([key, method]) => (_jsxs("button", { onClick: () => setActiveMethod(key), className: `p-4 text-left border rounded-lg transition-colors ${activeMethod === key
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:bg-gray-50'}`, children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: method.title }), _jsx("p", { className: "text-sm text-gray-600", children: method.description })] }, key))) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: [importMethods[activeMethod].title, " \u306E\u8A73\u7D30"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-green-800 mb-2", children: "\u2705 \u30E1\u30EA\u30C3\u30C8" }), _jsx("ul", { className: "space-y-1", children: importMethods[activeMethod].pros.map((pro, index) => (_jsxs("li", { className: "text-sm text-green-700 flex items-start", children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2 mt-0.5 flex-shrink-0" }), pro] }, index))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-orange-800 mb-2", children: "\u26A0\uFE0F \u6CE8\u610F\u70B9" }), _jsx("ul", { className: "space-y-1", children: importMethods[activeMethod].cons.map((con, index) => (_jsxs("li", { className: "text-sm text-orange-700 flex items-start", children: [_jsx(AlertCircle, { className: "w-4 h-4 mr-2 mt-0.5 flex-shrink-0" }), con] }, index))) })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "\uD83D\uDCCB \u8A2D\u5B9A\u624B\u9806" }), _jsx("ol", { className: "space-y-2", children: importMethods[activeMethod].setup.map((step, index) => (_jsxs("li", { className: "flex items-start text-sm", children: [_jsx("span", { className: "bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center font-medium mr-3 mt-0.5 flex-shrink-0", children: index + 1 }), _jsx("span", { className: "text-gray-700", children: step })] }, index))) })] })] }), activeMethod === 'email' && (_jsxs("div", { className: "border border-gray-200 rounded-lg p-6", children: [_jsxs("h4", { className: "font-medium text-gray-900 mb-4 flex items-center", children: [_jsx(Settings, { className: "w-5 h-5 mr-2" }), "\u30E1\u30FC\u30EB\u8EE2\u9001\u8A2D\u5B9A"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u8EE2\u9001\u5148\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9" }), _jsx("input", { type: "email", value: emailSettings.forwardEmail, onChange: (e) => setEmailSettings(prev => ({ ...prev, forwardEmail: e.target.value })), placeholder: "hotpepper-import@yoursalon.com", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "\u203B \u3053\u306E\u30A2\u30C9\u30EC\u30B9\u306B\u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC\u306E\u4E88\u7D04\u901A\u77E5\u30E1\u30FC\u30EB\u3092\u8EE2\u9001\u3057\u3066\u304F\u3060\u3055\u3044" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30C1\u30A7\u30C3\u30AF\u9593\u9694" }), _jsxs("select", { value: emailSettings.checkInterval, onChange: (e) => setEmailSettings(prev => ({ ...prev, checkInterval: parseInt(e.target.value) })), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: 5, children: "5\u5206\u3054\u3068" }), _jsx("option", { value: 10, children: "10\u5206\u3054\u3068" }), _jsx("option", { value: 15, children: "15\u5206\u3054\u3068" }), _jsx("option", { value: 30, children: "30\u5206\u3054\u3068" }), _jsx("option", { value: 60, children: "1\u6642\u9593\u3054\u3068" })] })] }), _jsx("div", { children: _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: emailSettings.autoImport, onChange: (e) => setEmailSettings(prev => ({ ...prev, autoImport: e.target.checked })), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2" }), _jsx("span", { className: "text-sm text-gray-700", children: "\u81EA\u52D5\u30A4\u30F3\u30DD\u30FC\u30C8\u3092\u6709\u52B9\u306B\u3059\u308B" })] }) }), _jsxs("div", { className: "flex justify-between items-center pt-4", children: [_jsx("button", { onClick: handleSaveEmailSettings, className: "btn btn-primary btn-sm", children: "\u8A2D\u5B9A\u3092\u4FDD\u5B58" }), _jsxs("button", { onClick: handleManualCheck, disabled: importStatus !== 'idle', className: "btn btn-secondary btn-sm flex items-center", children: [importStatus === 'checking' && (_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" })), importStatus === 'importing' && (_jsx(Download, { className: "w-4 h-4 mr-2 animate-pulse" })), importStatus === 'idle' && (_jsx(RefreshCw, { className: "w-4 h-4 mr-2" })), "\u4ECA\u3059\u3050\u30C1\u30A7\u30C3\u30AF"] })] })] })] })), lastImportTime && (_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Clock, { className: "w-5 h-5 text-blue-600 mr-2" }), _jsxs("span", { className: "text-sm text-blue-800", children: ["\u6700\u7D42\u30A4\u30F3\u30DD\u30FC\u30C8: ", format(lastImportTime, 'M月d日 HH:mm', { locale: ja })] })] }), importStatus === 'success' && (_jsx(CheckCircle, { className: "w-5 h-5 text-green-600" }))] }) })), activeMethod === 'email' && (_jsxs("div", { className: "border border-gray-200 rounded-lg p-6", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-4", children: "\uD83D\uDCE7 \u8A8D\u8B58\u53EF\u80FD\u306A\u30E1\u30FC\u30EB\u5F62\u5F0F\u306E\u4F8B" }), _jsx("div", { className: "bg-gray-50 p-4 rounded font-mono text-xs", children: _jsx("pre", { children: `【ホットペッパービューティー】予約通知

お客様名：山田 花子
予約日時：2024年6月15日 14:00
メニュー：カット＋カラー
担当スタッフ：佐藤 美容師
電話番号：090-1234-5678
備考：初回来店、カラーは明るめ希望

---
この予約はホットペッパービューティーから送信されました` }) }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "\u203B \u4E0A\u8A18\u306E\u3088\u3046\u306A\u5F62\u5F0F\u306E\u30E1\u30FC\u30EB\u3092\u81EA\u52D5\u7684\u306B\u89E3\u6790\u3057\u3066\u4E88\u7D04\u60C5\u5831\u3092\u53D6\u308A\u8FBC\u307F\u307E\u3059" })] })), activeMethod === 'manual' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [_jsxs("h4", { className: "font-medium text-yellow-900 mb-2 flex items-center", children: [_jsx(FileText, { className: "w-5 h-5 mr-2" }), "\u5B9A\u671FCSV\u53D6\u8FBC\u307F\u306E\u904B\u7528\u65B9\u6CD5"] }), _jsxs("ol", { className: "text-sm text-yellow-800 space-y-2", children: [_jsx("li", { children: "1. \u6BCE\u65E5\u6C7A\u307E\u3063\u305F\u6642\u9593\uFF08\u4F8B\uFF1A\u671D9\u6642\uFF09\u306B\u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC\u7BA1\u7406\u753B\u9762\u306B\u30A2\u30AF\u30BB\u30B9" }), _jsx("li", { children: "2. \u524D\u65E5\u306E\u4E88\u7D04\u30C7\u30FC\u30BF\u3092CSV\u3067\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9" }), _jsx("li", { children: "3. \u672C\u30B7\u30B9\u30C6\u30E0\u306E\u300CCSV\u30A4\u30F3\u30DD\u30FC\u30C8\u300D\u6A5F\u80FD\u3067\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9" }), _jsx("li", { children: "4. \u30B7\u30B9\u30C6\u30E0\u304C\u81EA\u52D5\u7684\u306B\u65B0\u898F\u4E88\u7D04\u306E\u307F\u3092\u8B58\u5225\u3057\u3066\u30A4\u30F3\u30DD\u30FC\u30C8" })] })] }), _jsxs("button", { onClick: () => {
                                                onClose();
                                                // CSVインポート画面を開く処理
                                            }, className: "btn btn-primary w-full", children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "CSV\u30A4\u30F3\u30DD\u30FC\u30C8\u753B\u9762\u3078"] })] })), activeMethod === 'rpa' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-purple-50 border border-purple-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-purple-900 mb-3", children: "\uD83E\uDD16 \u63A8\u5968RPA\u30C4\u30FC\u30EB" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("h5", { className: "font-medium text-purple-800 mb-1", children: "\u7121\u6599\u30FB\u4F4E\u30B3\u30B9\u30C8" }), _jsxs("ul", { className: "text-purple-700 space-y-1", children: [_jsx("li", { children: "\u2022 Power Automate Desktop (Windows)" }), _jsx("li", { children: "\u2022 Selenium (\u30D7\u30ED\u30B0\u30E9\u30DF\u30F3\u30B0\u77E5\u8B58\u5FC5\u8981)" }), _jsx("li", { children: "\u2022 AutoHotkey (Windows)" })] })] }), _jsxs("div", { children: [_jsx("h5", { className: "font-medium text-purple-800 mb-1", children: "\u6709\u6599\u30FB\u9AD8\u6A5F\u80FD" }), _jsxs("ul", { className: "text-purple-700 space-y-1", children: [_jsx("li", { children: "\u2022 UiPath" }), _jsx("li", { children: "\u2022 WinActor" }), _jsx("li", { children: "\u2022 BizRobo!" })] })] })] })] }), _jsxs("div", { className: "text-center", children: [_jsxs("p", { className: "text-sm text-gray-600 mb-4", children: ["RPA\u5C0E\u5165\u306B\u306F\u5C02\u9580\u77E5\u8B58\u304C\u5FC5\u8981\u3067\u3059\u3002", _jsx("br", {}), "\u5C0E\u5165\u652F\u63F4\u3092\u3054\u5E0C\u671B\u306E\u5834\u5408\u306F\u304A\u554F\u3044\u5408\u308F\u305B\u304F\u3060\u3055\u3044\u3002"] }), _jsxs("button", { className: "btn btn-secondary", children: [_jsx(Mail, { className: "w-4 h-4 mr-2" }), "\u5C0E\u5165\u76F8\u8AC7\u3059\u308B"] })] })] }))] })] }) }) }) }));
};
export default HotpepperAutoImporter;
