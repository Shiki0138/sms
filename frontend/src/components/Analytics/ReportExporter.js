import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Download, FileText, BarChart3, Users, DollarSign, TrendingUp, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
const ReportExporter = ({ customers, reservations, isOpen, onClose }) => {
    const [settings, setSettings] = useState({
        reportType: 'comprehensive',
        format: 'pdf',
        dateRange: {
            start: format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
            end: format(new Date(), 'yyyy-MM-dd')
        },
        includeCharts: true,
        includeRawData: false,
        includeInsights: true,
        customerSegments: []
    });
    const [isExporting, setIsExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState('idle');
    // レポート種類の定義
    const reportTypes = [
        {
            id: 'comprehensive',
            name: '総合分析レポート',
            description: 'すべての分析結果を含む包括的なレポート',
            icon: BarChart3
        },
        {
            id: 'rfm',
            name: 'RFM分析レポート',
            description: '顧客セグメント分析に特化したレポート',
            icon: Users
        },
        {
            id: 'cohort',
            name: 'コホート分析レポート',
            description: '顧客継続率分析レポート',
            icon: TrendingUp
        },
        {
            id: 'ltv',
            name: 'LTV分析レポート',
            description: '顧客生涯価値分析レポート',
            icon: DollarSign
        },
        {
            id: 'sales',
            name: '売上分析レポート',
            description: '売上とパフォーマンス分析レポート',
            icon: BarChart3
        },
        {
            id: 'marketing',
            name: 'マーケティング提案レポート',
            description: 'AI提案とアクションプランレポート',
            icon: Users
        }
    ];
    // PDF生成関数
    const generatePDF = async () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        // フォント設定（日本語対応）
        pdf.setFont('helvetica');
        // ヘッダー
        pdf.setFontSize(20);
        pdf.text('美容室管理システム 分析レポート', pageWidth / 2, 30, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text(`生成日時: ${format(new Date(), 'yyyy年MM月dd日 HH:mm', { locale: ja })}`, 20, 45);
        pdf.text(`対象期間: ${settings.dateRange.start} ～ ${settings.dateRange.end}`, 20, 55);
        let yPosition = 70;
        // 基本統計
        if (settings.includeInsights) {
            pdf.setFontSize(16);
            pdf.text('1. 基本統計', 20, yPosition);
            yPosition += 15;
            const completedReservations = reservations.filter(r => r.status === 'COMPLETED' && r.price);
            const totalRevenue = completedReservations.reduce((sum, r) => sum + (r.price || 0), 0);
            const avgOrderValue = completedReservations.length > 0 ? totalRevenue / completedReservations.length : 0;
            const basicStats = [
                ['総顧客数', `${customers.length}名`],
                ['完了予約数', `${completedReservations.length}件`],
                ['総売上', `¥${totalRevenue.toLocaleString()}`],
                ['平均客単価', `¥${Math.round(avgOrderValue).toLocaleString()}`]
            ];
            pdf.autoTable({
                startY: yPosition,
                head: [['項目', '値']],
                body: basicStats,
                margin: { left: 20, right: 20 },
                styles: { fontSize: 10, cellPadding: 3 }
            });
            yPosition = pdf.lastAutoTable.finalY + 20;
        }
        // RFM分析結果
        if (settings.reportType === 'comprehensive' || settings.reportType === 'rfm') {
            if (yPosition > pageHeight - 60) {
                pdf.addPage();
                yPosition = 30;
            }
            pdf.setFontSize(16);
            pdf.text('2. RFM分析結果', 20, yPosition);
            yPosition += 15;
            // RFM分析のサンプルデータ（実装では実際の分析結果を使用）
            const rfmData = [
                ['Champions', '15名', '12.5%', 'VIP特典提供、新サービス先行案内'],
                ['Loyal Customers', '28名', '23.3%', 'ポイント特典、誕生日特典'],
                ['At Risk', '8名', '6.7%', '特別オファー、満足度調査'],
                ['New Customers', '32名', '26.7%', '丁寧な接客、次回予約促進']
            ];
            pdf.autoTable({
                startY: yPosition,
                head: [['セグメント', '顧客数', '構成比', '推奨アクション']],
                body: rfmData,
                margin: { left: 20, right: 20 },
                styles: { fontSize: 9, cellPadding: 3 }
            });
            yPosition = pdf.lastAutoTable.finalY + 20;
        }
        // 顧客データ
        if (settings.includeRawData) {
            if (yPosition > pageHeight - 60) {
                pdf.addPage();
                yPosition = 30;
            }
            pdf.setFontSize(16);
            pdf.text('3. 顧客データ', 20, yPosition);
            yPosition += 15;
            const customerData = customers.slice(0, 20).map(customer => [
                customer.customerNumber,
                customer.name,
                customer.visitCount.toString(),
                customer.lastVisitDate ? format(new Date(customer.lastVisitDate), 'yyyy/MM/dd') : '未来店'
            ]);
            pdf.autoTable({
                startY: yPosition,
                head: [['顧客番号', '顧客名', '来店回数', '最終来店日']],
                body: customerData,
                margin: { left: 20, right: 20 },
                styles: { fontSize: 8, cellPadding: 2 }
            });
            yPosition = pdf.lastAutoTable.finalY + 20;
        }
        // インサイトと提案
        if (settings.includeInsights) {
            if (yPosition > pageHeight - 100) {
                pdf.addPage();
                yPosition = 30;
            }
            pdf.setFontSize(16);
            pdf.text('4. ビジネスインサイト', 20, yPosition);
            yPosition += 15;
            pdf.setFontSize(12);
            const insights = [
                '• 新規顧客の継続率向上が重要な課題となっています',
                '• VIP顧客層の拡大により収益性向上が期待できます',
                '• 季節性キャンペーンの効果測定と最適化が必要です',
                '• デジタルマーケティングの強化が推奨されます'
            ];
            insights.forEach(insight => {
                pdf.text(insight, 20, yPosition);
                yPosition += 10;
            });
        }
        // フッター
        // @ts-ignore
        const pageCount = pdf.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.text(`${i} / ${pageCount}`, pageWidth - 30, pageHeight - 10);
        }
        return pdf;
    };
    // Excel生成関数
    const generateExcel = async () => {
        const workbook = XLSX.utils.book_new();
        // 基本統計シート
        const basicStatsData = [
            ['項目', '値'],
            ['レポート生成日時', format(new Date(), 'yyyy年MM月dd日 HH:mm', { locale: ja })],
            ['対象期間', `${settings.dateRange.start} ～ ${settings.dateRange.end}`],
            ['総顧客数', customers.length],
            ['完了予約数', reservations.filter(r => r.status === 'COMPLETED').length],
            ['総売上', reservations.filter(r => r.status === 'COMPLETED' && r.price).reduce((sum, r) => sum + (r.price || 0), 0)]
        ];
        const basicStatsSheet = XLSX.utils.aoa_to_sheet(basicStatsData);
        XLSX.utils.book_append_sheet(workbook, basicStatsSheet, '基本統計');
        // 顧客データシート
        if (settings.includeRawData) {
            const customerHeaders = ['顧客番号', '顧客名', '来店回数', '最終来店日', '登録日'];
            const customerData = customers.map(customer => [
                customer.customerNumber,
                customer.name,
                customer.visitCount,
                customer.lastVisitDate ? format(new Date(customer.lastVisitDate), 'yyyy/MM/dd') : '未来店',
                format(new Date(customer.createdAt), 'yyyy/MM/dd')
            ]);
            const customerSheet = XLSX.utils.aoa_to_sheet([customerHeaders, ...customerData]);
            XLSX.utils.book_append_sheet(workbook, customerSheet, '顧客データ');
        }
        // 予約データシート
        if (settings.includeRawData) {
            const reservationHeaders = ['予約ID', '開始時間', '顧客名', 'ステータス', '料金'];
            const reservationData = reservations.map(reservation => [
                reservation.id,
                format(new Date(reservation.startTime), 'yyyy/MM/dd HH:mm'),
                reservation.customerName,
                reservation.status,
                reservation.price || 0
            ]);
            const reservationSheet = XLSX.utils.aoa_to_sheet([reservationHeaders, ...reservationData]);
            XLSX.utils.book_append_sheet(workbook, reservationSheet, '予約データ');
        }
        // RFM分析シート
        if (settings.reportType === 'comprehensive' || settings.reportType === 'rfm') {
            const rfmHeaders = ['セグメント', '顧客数', '構成比', '特徴', '推奨アクション'];
            const rfmData = [
                ['Champions', 15, '12.5%', 'ベストカスタマー', 'VIP特典提供'],
                ['Loyal Customers', 28, '23.3%', 'ロイヤルカスタマー', 'ポイント特典'],
                ['At Risk', 8, '6.7%', '離反危険客', '特別オファー'],
                ['New Customers', 32, '26.7%', '新規顧客', '関係構築']
            ];
            const rfmSheet = XLSX.utils.aoa_to_sheet([rfmHeaders, ...rfmData]);
            XLSX.utils.book_append_sheet(workbook, rfmSheet, 'RFM分析');
        }
        // インサイトシート
        if (settings.includeInsights) {
            const insightsData = [
                ['インサイト'],
                ['新規顧客の継続率向上が重要な課題となっています'],
                ['VIP顧客層の拡大により収益性向上が期待できます'],
                ['季節性キャンペーンの効果測定と最適化が必要です'],
                ['デジタルマーケティングの強化が推奨されます'],
                [''],
                ['推奨アクション'],
                ['初回来店時の顧客体験向上プログラム'],
                ['VIP特典制度の強化'],
                ['データドリブンなマーケティング戦略の実装']
            ];
            const insightsSheet = XLSX.utils.aoa_to_sheet(insightsData);
            XLSX.utils.book_append_sheet(workbook, insightsSheet, 'インサイト');
        }
        return workbook;
    };
    // エクスポート実行
    const handleExport = async () => {
        setIsExporting(true);
        setExportStatus('idle');
        try {
            const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
            const filename = `salon-analytics-${settings.reportType}-${timestamp}`;
            if (settings.format === 'pdf') {
                const pdf = await generatePDF();
                pdf.save(`${filename}.pdf`);
            }
            else {
                const workbook = await generateExcel();
                XLSX.writeFile(workbook, `${filename}.xlsx`);
            }
            setExportStatus('success');
            setTimeout(() => {
                setExportStatus('idle');
                onClose();
            }, 2000);
        }
        catch (error) {
            console.error('Export error:', error);
            setExportStatus('error');
        }
        finally {
            setIsExporting(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden", children: [_jsx("div", { className: "p-6 border-b border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 flex items-center", children: [_jsx(Download, { className: "w-6 h-6 mr-2 text-blue-600" }), "\u30EC\u30DD\u30FC\u30C8\u51FA\u529B"] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: "\u00D7" })] }) }), _jsx("div", { className: "p-6 overflow-y-auto max-h-[calc(90vh-140px)]", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-3", children: "\u30EC\u30DD\u30FC\u30C8\u7A2E\u985E" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: reportTypes.map((type) => {
                                            const Icon = type.icon;
                                            return (_jsxs("button", { onClick: () => setSettings(prev => ({ ...prev, reportType: type.id })), className: `p-3 text-left border rounded-lg transition-colors ${settings.reportType === type.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'}`, children: [_jsxs("div", { className: "flex items-center mb-2", children: [_jsx(Icon, { className: "w-5 h-5 text-blue-600 mr-2" }), _jsx("span", { className: "font-medium text-gray-900", children: type.name })] }), _jsx("p", { className: "text-sm text-gray-600", children: type.description })] }, type.id));
                                        }) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-3", children: "\u51FA\u529B\u30D5\u30A9\u30FC\u30DE\u30C3\u30C8" }), _jsxs("div", { className: "flex space-x-4", children: [_jsxs("button", { onClick: () => setSettings(prev => ({ ...prev, format: 'pdf' })), className: `flex items-center px-4 py-3 border rounded-lg transition-colors ${settings.format === 'pdf'
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 hover:border-gray-300'}`, children: [_jsx(FileText, { className: "w-5 h-5 mr-2" }), "PDF\u5F62\u5F0F"] }), _jsxs("button", { onClick: () => setSettings(prev => ({ ...prev, format: 'excel' })), className: `flex items-center px-4 py-3 border rounded-lg transition-colors ${settings.format === 'excel'
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 hover:border-gray-300'}`, children: [_jsx(BarChart3, { className: "w-5 h-5 mr-2" }), "Excel\u5F62\u5F0F"] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-3", children: "\u5BFE\u8C61\u671F\u9593" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u958B\u59CB\u65E5" }), _jsx("input", { type: "date", value: settings.dateRange.start, onChange: (e) => setSettings(prev => ({
                                                            ...prev,
                                                            dateRange: { ...prev.dateRange, start: e.target.value }
                                                        })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u7D42\u4E86\u65E5" }), _jsx("input", { type: "date", value: settings.dateRange.end, onChange: (e) => setSettings(prev => ({
                                                            ...prev,
                                                            dateRange: { ...prev.dateRange, end: e.target.value }
                                                        })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-3", children: "\u51FA\u529B\u30AA\u30D7\u30B7\u30E7\u30F3" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: settings.includeCharts, onChange: (e) => setSettings(prev => ({ ...prev, includeCharts: e.target.checked })), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3" }), _jsx("span", { className: "text-gray-700", children: "\u30C1\u30E3\u30FC\u30C8\u3068\u30B0\u30E9\u30D5\u3092\u542B\u3081\u308B" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: settings.includeRawData, onChange: (e) => setSettings(prev => ({ ...prev, includeRawData: e.target.checked })), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3" }), _jsx("span", { className: "text-gray-700", children: "\u751F\u30C7\u30FC\u30BF\u3092\u542B\u3081\u308B" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: settings.includeInsights, onChange: (e) => setSettings(prev => ({ ...prev, includeInsights: e.target.checked })), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3" }), _jsx("span", { className: "text-gray-700", children: "\u30A4\u30F3\u30B5\u30A4\u30C8\u3068\u63D0\u6848\u3092\u542B\u3081\u308B" })] })] })] }), exportStatus !== 'idle' && (_jsx("div", { className: `p-4 rounded-lg ${exportStatus === 'success' ? 'bg-green-50 border border-green-200' :
                                    exportStatus === 'error' ? 'bg-red-50 border border-red-200' : ''}`, children: _jsxs("div", { className: "flex items-center", children: [exportStatus === 'success' && _jsx(CheckCircle, { className: "w-5 h-5 text-green-600 mr-2" }), exportStatus === 'error' && _jsx(AlertCircle, { className: "w-5 h-5 text-red-600 mr-2" }), _jsxs("span", { className: exportStatus === 'success' ? 'text-green-800' :
                                                exportStatus === 'error' ? 'text-red-800' : 'text-gray-800', children: [exportStatus === 'success' && 'レポートが正常に出力されました', exportStatus === 'error' && '出力中にエラーが発生しました'] })] }) }))] }) }), _jsx("div", { className: "p-6 border-t border-gray-200", children: _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { onClick: onClose, className: "btn btn-secondary", disabled: isExporting, children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx("button", { onClick: handleExport, disabled: isExporting, className: "btn btn-primary flex items-center", children: isExporting ? (_jsxs(_Fragment, { children: [_jsx(Loader, { className: "w-4 h-4 mr-2 animate-spin" }), "\u51FA\u529B\u4E2D..."] })) : (_jsxs(_Fragment, { children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "\u30EC\u30DD\u30FC\u30C8\u51FA\u529B"] })) })] }) })] }) }));
};
export default ReportExporter;
