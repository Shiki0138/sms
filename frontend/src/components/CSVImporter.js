import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { Upload, FileText, Download, CheckCircle, AlertCircle, Users, X, Shield } from 'lucide-react';
import { getEnvironmentConfig } from '../utils/environment';
const CSVImporter = ({ onImport, onClose, isOpen, existingCustomers = [] }) => {
    const [csvData, setCsvData] = useState('');
    const [previewData, setPreviewData] = useState([]);
    const [duplicateData, setDuplicateData] = useState([]);
    const [errors, setErrors] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState('upload');
    const fileInputRef = useRef(null);
    const config = getEnvironmentConfig();
    // ホットペッパービューティーのCSVフォーマット例
    const hotpepperColumns = [
        '会員番号', '氏名', '氏名（フリガナ）', '電話番号', 'メールアドレス',
        '生年月日', '性別', '郵便番号', '住所', '来店回数', '最終来店日',
        '登録日', '備考', 'クーポン利用履歴', 'メニュー履歴'
    ];
    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            setErrors(['CSVファイルを選択してください']);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            setCsvData(text);
            processCSV(text);
        };
        reader.readAsText(file, 'Shift_JIS'); // ホットペッパーはShift_JISが一般的
    };
    const processCSV = (csvText) => {
        setIsProcessing(true);
        setErrors([]);
        try {
            const lines = csvText.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
                throw new Error('CSVファイルにデータが含まれていません');
            }
            const headers = parseCSVLine(lines[0]);
            const customers = [];
            const duplicates = [];
            const newErrors = [];
            // ヘッダーの検証
            const requiredColumns = ['氏名', '電話番号'];
            const missingColumns = requiredColumns.filter(col => !headers.includes(col));
            if (missingColumns.length > 0) {
                throw new Error(`必須列が見つかりません: ${missingColumns.join(', ')}`);
            }
            // 重複チェック用の関数
            const isDuplicate = (customer) => {
                // 電話番号での重複チェック
                if (customer.phone) {
                    const normalizedPhone = customer.phone.replace(/[-\s]/g, '');
                    const phoneExists = existingCustomers.some(existing => {
                        const existingPhone = existing.phone?.replace(/[-\s]/g, '') || '';
                        return existingPhone === normalizedPhone;
                    });
                    if (phoneExists)
                        return true;
                }
                // メールアドレスでの重複チェック
                if (customer.email) {
                    const emailExists = existingCustomers.some(existing => existing.email?.toLowerCase() === customer.email.toLowerCase());
                    if (emailExists)
                        return true;
                }
                // ホットペッパー会員番号での重複チェック
                if (customer.hotpepperData?.memberNumber) {
                    const memberExists = existingCustomers.some(existing => existing.memberNumber === customer.hotpepperData?.memberNumber);
                    if (memberExists)
                        return true;
                }
                return false;
            };
            // データ行の処理
            for (let i = 1; i < lines.length; i++) {
                try {
                    const values = parseCSVLine(lines[i]);
                    if (values.length < headers.length)
                        continue;
                    const customer = parseCustomerRow(headers, values, i + 1);
                    if (customer) {
                        if (isDuplicate(customer)) {
                            duplicates.push(customer);
                            newErrors.push(`${i + 1}行目: 既存顧客と重複しています (${customer.name})`);
                        }
                        else {
                            customers.push(customer);
                        }
                    }
                }
                catch (error) {
                    newErrors.push(`${i + 1}行目: ${error instanceof Error ? error.message : 'データエラー'}`);
                }
            }
            if (customers.length === 0 && duplicates.length === 0) {
                throw new Error('有効な顧客データが見つかりませんでした');
            }
            setPreviewData(customers);
            setDuplicateData(duplicates);
            setErrors(newErrors);
            setStep('preview');
        }
        catch (error) {
            setErrors([error instanceof Error ? error.message : 'CSVの処理中にエラーが発生しました']);
        }
        finally {
            setIsProcessing(false);
        }
    };
    const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            }
            else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            }
            else {
                current += char;
            }
        }
        result.push(current.trim());
        return result.map(val => val.replace(/^"|"$/g, ''));
    };
    const parseCustomerRow = (headers, values, rowNumber) => {
        const getColumnValue = (columnName) => {
            const index = headers.indexOf(columnName);
            return index >= 0 ? values[index]?.trim() || '' : '';
        };
        const name = getColumnValue('氏名');
        if (!name) {
            throw new Error('氏名が入力されていません');
        }
        const phone = getColumnValue('電話番号').replace(/[-\s]/g, '');
        const email = getColumnValue('メールアドレス');
        const visitCountStr = getColumnValue('来店回数');
        const lastVisitDate = getColumnValue('最終来店日');
        const birthDate = getColumnValue('生年月日');
        const gender = getColumnValue('性別');
        const address = getColumnValue('住所');
        const registrationDate = getColumnValue('登録日');
        const memberNumber = getColumnValue('会員番号');
        const notes = getColumnValue('備考');
        // 来店回数の処理
        let visitCount = 0;
        if (visitCountStr) {
            const parsed = parseInt(visitCountStr);
            if (!isNaN(parsed)) {
                visitCount = Math.max(0, parsed);
            }
        }
        // 日付の正規化
        const normalizeDate = (dateStr) => {
            if (!dateStr)
                return '';
            // 様々な日付フォーマットに対応
            const dateFormats = [
                /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/, // YYYY/MM/DD, YYYY-MM-DD
                /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/, // MM/DD/YYYY
                /(\d{4})(\d{2})(\d{2})/, // YYYYMMDD
            ];
            for (const format of dateFormats) {
                const match = dateStr.match(format);
                if (match) {
                    if (match[1].length === 4) {
                        // YYYY-MM-DD形式
                        return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
                    }
                    else {
                        // MM/DD/YYYY形式
                        return `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`;
                    }
                }
            }
            return dateStr;
        };
        return {
            name,
            phone,
            email,
            visitCount,
            lastVisitDate: normalizeDate(lastVisitDate),
            notes: notes || `ホットペッパービューティーからのインポート顧客`,
            source: 'HOTPEPPER',
            hotpepperData: {
                memberNumber,
                birthDate: normalizeDate(birthDate),
                gender,
                address,
                registrationDate: normalizeDate(registrationDate)
            }
        };
    };
    const handleImport = () => {
        onImport(previewData);
        setStep('complete');
        setTimeout(() => {
            onClose();
            resetState();
        }, 2000);
    };
    const resetState = () => {
        setCsvData('');
        setPreviewData([]);
        setDuplicateData([]);
        setErrors([]);
        setStep('upload');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    const downloadTemplate = () => {
        const template = `会員番号,氏名,氏名（フリガナ）,電話番号,メールアドレス,生年月日,性別,郵便番号,住所,来店回数,最終来店日,登録日,備考
HP001,山田 花子,ヤマダ ハナコ,090-1234-5678,hanako@example.com,1985/04/15,女性,123-4567,東京都新宿区1-2-3,5,2024/06/01,2023/08/15,カラー希望
HP002,佐藤 太郎,サトウ タロウ,080-9876-5432,taro@example.com,1990/07/20,男性,567-8901,東京都渋谷区4-5-6,3,2024/05/20,2024/01/10,短髪希望`;
        const blob = new Blob([template], { type: 'text/csv;charset=shift_jis' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hotpepper_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4", children: _jsx("div", { className: "bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col", children: _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 flex items-center", children: [_jsx(FileText, { className: "w-6 h-6 mr-2 text-blue-600" }), "\u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC\u30D3\u30E5\u30FC\u30C6\u30A3\u30FC\u9867\u5BA2\u30C7\u30FC\u30BF\u30A4\u30F3\u30DD\u30FC\u30C8"] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-6 h-6" }) })] }), step === 'upload' && (_jsxs("div", { className: "space-y-6", children: [config.isTestingPhase && (_jsxs("div", { className: "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-blue-700 font-medium mb-2", children: [_jsx(Shield, { className: "w-5 h-5" }), "\uD83E\uDDEA \u30C6\u30B9\u30C8\u671F\u9593\u4E2D - CSV\u53D6\u308A\u8FBC\u307F\u6A5F\u80FD"] }), _jsx("p", { className: "text-blue-600 text-sm", children: "CSV\u53D6\u308A\u8FBC\u307F\u6A5F\u80FD\u306F\u5236\u9650\u306A\u304F\u3054\u5229\u7528\u3044\u305F\u3060\u3051\u307E\u3059\u3002 \u5B9F\u969B\u306E\u9867\u5BA2\u30C7\u30FC\u30BF\u3092\u53D6\u308A\u8FBC\u3093\u3067\u30B7\u30B9\u30C6\u30E0\u3092\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" })] })), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-medium text-blue-900 mb-3", children: "\uD83D\uDCCB \u30A4\u30F3\u30DD\u30FC\u30C8\u624B\u9806" }), _jsxs("ol", { className: "text-sm text-blue-800 space-y-2", children: [_jsx("li", { children: "1. \u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC\u30D3\u30E5\u30FC\u30C6\u30A3\u30FC\u7BA1\u7406\u753B\u9762\u304B\u3089\u9867\u5BA2\u30C7\u30FC\u30BF\u3092CSV\u3067\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9" }), _jsx("li", { children: "2. \u4E0B\u8A18\u306E\u300CCSV\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u300D\u3067\u5F62\u5F0F\u3092\u78BA\u8A8D" }), _jsx("li", { children: "3. CSV\u30D5\u30A1\u30A4\u30EB\u3092\u9078\u629E\u3057\u3066\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9" }), _jsx("li", { children: "4. \u30D7\u30EC\u30D3\u30E5\u30FC\u3092\u78BA\u8A8D\u3057\u3066\u30A4\u30F3\u30DD\u30FC\u30C8\u5B9F\u884C" })] })] }), _jsx("div", { className: "flex justify-center", children: _jsxs("button", { onClick: downloadTemplate, className: "btn btn-secondary flex items-center", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "CSV\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9"] }) }), _jsx("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-8", children: _jsxs("div", { className: "text-center", children: [_jsx(Upload, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "CSV\u30D5\u30A1\u30A4\u30EB\u3092\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9" }), _jsx("p", { className: "text-gray-600 mb-4", children: "\u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC\u30D3\u30E5\u30FC\u30C6\u30A3\u30FC\u304B\u3089\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u305FCSV\u30D5\u30A1\u30A4\u30EB\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" }), _jsx("input", { ref: fileInputRef, type: "file", accept: ".csv", onChange: handleFileUpload, className: "hidden" }), _jsx("button", { onClick: () => fileInputRef.current?.click(), className: "btn btn-primary", disabled: isProcessing, children: isProcessing ? 'Processing...' : 'ファイルを選択' })] }) }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "\u5BFE\u5FDC\u53EF\u80FD\u306A\u5217\u9805\u76EE" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2 text-sm", children: hotpepperColumns.map((col) => (_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: `w-2 h-2 rounded-full mr-2 ${['氏名', '電話番号'].includes(col) ? 'bg-red-500' : 'bg-green-500'}` }), _jsxs("span", { className: ['氏名', '電話番号'].includes(col) ? 'font-medium' : '', children: [col, ['氏名', '電話番号'].includes(col) && ' (必須)'] })] }, col))) })] }), errors.length > 0 && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-600 mr-2 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-red-800 mb-2", children: "\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F" }), _jsx("ul", { className: "text-sm text-red-700 space-y-1", children: errors.map((error, index) => (_jsxs("li", { children: ["\u2022 ", error] }, index))) })] })] }) }))] })), step === 'preview' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-600 mr-2" }), _jsxs("div", { children: [_jsxs("h4", { className: "font-medium text-green-800", children: [previewData.length, "\u4EF6\u306E\u65B0\u898F\u9867\u5BA2\u30C7\u30FC\u30BF\u3092\u691C\u51FA\u3057\u307E\u3057\u305F"] }), _jsx("p", { className: "text-sm text-green-700 mt-1", children: "\u3053\u308C\u3089\u306E\u30C7\u30FC\u30BF\u304C\u30A4\u30F3\u30DD\u30FC\u30C8\u3055\u308C\u307E\u3059" })] })] }) }), duplicateData.length > 0 && (_jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-yellow-600 mr-2" }), _jsxs("div", { children: [_jsxs("h4", { className: "font-medium text-yellow-800", children: [duplicateData.length, "\u4EF6\u306E\u91CD\u8907\u30C7\u30FC\u30BF\u3092\u691C\u51FA\u3057\u307E\u3057\u305F"] }), _jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "\u65E2\u5B58\u9867\u5BA2\u3068\u91CD\u8907\u3059\u308B\u305F\u3081\u3001\u3053\u308C\u3089\u306E\u30C7\u30FC\u30BF\u306F\u30B9\u30AD\u30C3\u30D7\u3055\u308C\u307E\u3059" })] })] }) })), errors.length > duplicateData.length && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-600 mr-2" }), _jsxs("div", { children: [_jsxs("h4", { className: "font-medium text-red-800", children: [errors.length - duplicateData.length, "\u4EF6\u306E\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F"] }), _jsx("p", { className: "text-sm text-red-700 mt-1", children: "\u30C7\u30FC\u30BF\u5F62\u5F0F\u306E\u554F\u984C\u306B\u3088\u308A\u3053\u308C\u3089\u306E\u884C\u306F\u30B9\u30AD\u30C3\u30D7\u3055\u308C\u307E\u3059" })] })] }) }))] }), previewData.length > 0 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900", children: ["\u30A4\u30F3\u30DD\u30FC\u30C8\u5BFE\u8C61\u30C7\u30FC\u30BF (", previewData.length, "\u4EF6)"] }), _jsxs("div", { className: "overflow-x-auto", children: [_jsxs("table", { className: "min-w-full border border-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u6C0F\u540D" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u96FB\u8A71\u756A\u53F7" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u30E1\u30FC\u30EB" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u6765\u5E97\u56DE\u6570" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u6700\u7D42\u6765\u5E97\u65E5" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u4F1A\u54E1\u756A\u53F7" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: previewData.slice(0, 10).map((customer, index) => (_jsxs("tr", { children: [_jsx("td", { className: "px-4 py-3 text-sm font-medium text-gray-900", children: customer.name }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600", children: customer.phone }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600", children: customer.email }), _jsxs("td", { className: "px-4 py-3 text-sm text-gray-600", children: [customer.visitCount, "\u56DE"] }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600", children: customer.lastVisitDate }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600", children: customer.hotpepperData?.memberNumber })] }, index))) })] }), previewData.length > 10 && (_jsxs("p", { className: "text-sm text-gray-600 mt-2 text-center", children: ["...\u4ED6 ", previewData.length - 10, "\u4EF6"] }))] })] })), duplicateData.length > 0 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900", children: ["\u91CD\u8907\u30C7\u30FC\u30BF (", duplicateData.length, "\u4EF6)"] }), _jsxs("div", { className: "overflow-x-auto", children: [_jsxs("table", { className: "min-w-full border border-gray-200 bg-yellow-50", children: [_jsx("thead", { className: "bg-yellow-100", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-yellow-800 uppercase", children: "\u6C0F\u540D" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-yellow-800 uppercase", children: "\u96FB\u8A71\u756A\u53F7" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-yellow-800 uppercase", children: "\u30E1\u30FC\u30EB" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-yellow-800 uppercase", children: "\u4F1A\u54E1\u756A\u53F7" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-yellow-800 uppercase", children: "\u91CD\u8907\u7406\u7531" })] }) }), _jsx("tbody", { className: "bg-yellow-50 divide-y divide-yellow-200", children: duplicateData.slice(0, 5).map((customer, index) => (_jsxs("tr", { children: [_jsx("td", { className: "px-4 py-3 text-sm font-medium text-yellow-900", children: customer.name }), _jsx("td", { className: "px-4 py-3 text-sm text-yellow-800", children: customer.phone }), _jsx("td", { className: "px-4 py-3 text-sm text-yellow-800", children: customer.email }), _jsx("td", { className: "px-4 py-3 text-sm text-yellow-800", children: customer.hotpepperData?.memberNumber }), _jsxs("td", { className: "px-4 py-3 text-sm text-yellow-800", children: [customer.phone && existingCustomers.some(e => e.phone?.replace(/[-\s]/g, '') === customer.phone.replace(/[-\s]/g, '')) && '電話番号', customer.email && existingCustomers.some(e => e.email?.toLowerCase() === customer.email.toLowerCase()) && 'メール', customer.hotpepperData?.memberNumber && existingCustomers.some(e => e.memberNumber === customer.hotpepperData?.memberNumber) && '会員番号'] })] }, index))) })] }), duplicateData.length > 5 && (_jsxs("p", { className: "text-sm text-yellow-600 mt-2 text-center", children: ["...\u4ED6 ", duplicateData.length - 5, "\u4EF6"] }))] })] })), errors.length > 0 && (_jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-yellow-600 mr-2 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-yellow-800 mb-2", children: "\u30B9\u30AD\u30C3\u30D7\u3055\u308C\u305F\u884C" }), _jsxs("div", { className: "text-sm text-yellow-700 max-h-32 overflow-y-auto", children: [errors.slice(0, 5).map((error, index) => (_jsxs("div", { children: ["\u2022 ", error] }, index))), errors.length > 5 && (_jsxs("div", { children: ["...\u4ED6 ", errors.length - 5, "\u4EF6"] }))] })] })] }) })), _jsxs("div", { className: "flex justify-between", children: [_jsx("button", { onClick: () => setStep('upload'), className: "btn btn-secondary", children: "\u623B\u308B" }), _jsxs("button", { onClick: handleImport, className: "btn btn-primary flex items-center", children: [_jsx(Users, { className: "w-4 h-4 mr-2" }), previewData.length, "\u4EF6\u3092\u30A4\u30F3\u30DD\u30FC\u30C8"] })] })] })), step === 'complete' && (_jsxs("div", { className: "text-center py-8", children: [_jsx(CheckCircle, { className: "w-16 h-16 text-green-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "\u30A4\u30F3\u30DD\u30FC\u30C8\u5B8C\u4E86\uFF01" }), _jsxs("p", { className: "text-gray-600", children: [previewData.length, "\u4EF6\u306E\u9867\u5BA2\u30C7\u30FC\u30BF\u304C\u6B63\u5E38\u306B\u30A4\u30F3\u30DD\u30FC\u30C8\u3055\u308C\u307E\u3057\u305F"] })] }))] }) }) }) }));
};
export default CSVImporter;
