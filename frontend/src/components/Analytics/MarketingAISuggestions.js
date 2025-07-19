import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Lightbulb, TrendingUp, Users, Target, Calendar, DollarSign, Star, MessageCircle, Clock, Zap, RefreshCw, Download, Eye, ArrowRight, CheckCircle } from 'lucide-react';
const MarketingAISuggestions = ({ customers, reservations }) => {
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    // AI提案の生成
    const aiProposals = useMemo(() => {
        const completedReservations = reservations.filter(r => r.status === 'COMPLETED' && r.price);
        const currentDate = new Date();
        // 顧客分析
        const recentCustomers = customers.filter(c => {
            if (!c.lastVisitDate)
                return false;
            const daysSince = Math.floor((currentDate.getTime() - new Date(c.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24));
            return daysSince <= 30;
        });
        const atRiskCustomers = customers.filter(c => {
            if (!c.lastVisitDate)
                return false;
            const daysSince = Math.floor((currentDate.getTime() - new Date(c.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24));
            return daysSince >= 60 && daysSince <= 180;
        });
        const lostCustomers = customers.filter(c => {
            if (!c.lastVisitDate)
                return false;
            const daysSince = Math.floor((currentDate.getTime() - new Date(c.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24));
            return daysSince > 180;
        });
        const highValueCustomers = customers.filter(c => c.visitCount >= 5);
        const newCustomers = customers.filter(c => c.visitCount <= 2);
        // 売上分析
        const totalRevenue = completedReservations.reduce((sum, r) => sum + (r.price || 0), 0);
        const avgOrderValue = completedReservations.length > 0 ? totalRevenue / completedReservations.length : 0;
        const proposals = [];
        // 1. 離反防止キャンペーン
        if (atRiskCustomers.length > 0) {
            proposals.push({
                id: 'retention-at-risk',
                type: 'retention',
                title: '離反防止緊急キャンペーン',
                description: '来店間隔が延びている顧客への特別オファーで関係を再構築',
                targetSegment: '60-180日未来店の顧客',
                targetCount: atRiskCustomers.length,
                estimatedRevenue: atRiskCustomers.length * avgOrderValue * 0.4,
                campaignPeriod: '2週間',
                urgency: 'high',
                confidence: 85,
                tactics: [
                    'パーソナライズされた復帰オファー（30%OFF）',
                    '担当スタイリストからの個別メッセージ',
                    '新サービス無料体験チケット',
                    'LINEでの限定クーポン配信'
                ],
                kpis: [
                    '復帰率: 25%以上',
                    '平均客単価: ¥8,000以上',
                    'キャンペーン後継続率: 60%以上'
                ],
                timeline: [
                    {
                        phase: '準備フェーズ',
                        duration: '3日',
                        actions: ['顧客リスト作成', 'メッセージ個別化', 'オファー設計']
                    },
                    {
                        phase: '実行フェーズ',
                        duration: '2週間',
                        actions: ['メッセージ配信', 'フォローアップ', '予約受付']
                    },
                    {
                        phase: '分析フェーズ',
                        duration: '1週間',
                        actions: ['効果測定', '成功要因分析', '改善点抽出']
                    }
                ],
                budget: [
                    { category: '割引原資', amount: Math.round(atRiskCustomers.length * avgOrderValue * 0.3 * 0.25) },
                    { category: '販促物制作', amount: 50000 },
                    { category: 'システム利用料', amount: 20000 }
                ],
                expectedROI: 150
            });
        }
        // 2. 新規顧客定着キャンペーン
        if (newCustomers.length > 0) {
            proposals.push({
                id: 'acquisition-new-customer',
                type: 'acquisition',
                title: '新規顧客定着プログラム',
                description: '初回来店後のフォローアップで継続来店を促進',
                targetSegment: '来店回数1-2回の新規顧客',
                targetCount: newCustomers.length,
                estimatedRevenue: newCustomers.length * avgOrderValue * 1.5,
                campaignPeriod: '1ヶ月',
                urgency: 'medium',
                confidence: 78,
                tactics: [
                    '2回目来店20%OFFクーポン',
                    '美容相談LINE Bot導入',
                    'ビューティーカレンダー配布',
                    '3ヶ月プランの提案'
                ],
                kpis: [
                    '2回目来店率: 70%以上',
                    '3ヶ月継続率: 50%以上',
                    '紹介率: 15%以上'
                ],
                timeline: [
                    {
                        phase: 'システム準備',
                        duration: '1週間',
                        actions: ['LINE Bot設定', 'クーポンシステム準備', '相談体制構築']
                    },
                    {
                        phase: 'プログラム実行',
                        duration: '1ヶ月',
                        actions: ['自動フォローアップ', 'パーソナル相談', '継続提案']
                    }
                ],
                budget: [
                    { category: 'システム開発', amount: 150000 },
                    { category: '割引原資', amount: Math.round(newCustomers.length * avgOrderValue * 0.2 * 0.7) },
                    { category: 'ノベルティ', amount: 80000 }
                ],
                expectedROI: 220
            });
        }
        // 3. VIP顧客アップセルキャンペーン
        if (highValueCustomers.length > 0) {
            proposals.push({
                id: 'upsell-vip',
                type: 'upsell',
                title: 'VIP顧客プレミアムサービス',
                description: '優良顧客向けの高単価メニューとVIP体験の提供',
                targetSegment: '来店回数5回以上の優良顧客',
                targetCount: highValueCustomers.length,
                estimatedRevenue: highValueCustomers.length * avgOrderValue * 1.8,
                campaignPeriod: '3ヶ月',
                urgency: 'medium',
                confidence: 82,
                tactics: [
                    'プレミアムトリートメント先行案内',
                    '専属スタイリスト制度',
                    'VIP専用予約枠の提供',
                    '限定イベント招待'
                ],
                kpis: [
                    '高単価メニュー利用率: 40%以上',
                    '平均客単価向上: 30%以上',
                    'VIP満足度: 95%以上'
                ],
                timeline: [
                    {
                        phase: 'VIPプログラム設計',
                        duration: '2週間',
                        actions: ['メニュー開発', 'スタッフトレーニング', 'システム整備']
                    },
                    {
                        phase: 'プログラム展開',
                        duration: '3ヶ月',
                        actions: ['VIP体験提供', '継続的フォロー', '効果測定']
                    }
                ],
                budget: [
                    { category: 'メニュー開発', amount: 200000 },
                    { category: 'スタッフ研修', amount: 100000 },
                    { category: 'VIP特典', amount: 150000 }
                ],
                expectedROI: 280
            });
        }
        // 4. 季節性キャンペーン
        const currentMonth = currentDate.getMonth();
        let seasonalCampaign = null;
        if (currentMonth >= 2 && currentMonth <= 4) { // 春
            seasonalCampaign = {
                id: 'seasonal-spring',
                type: 'seasonal',
                title: '春の新生活応援キャンペーン',
                description: '新年度の始まりに合わせたイメージチェンジ提案',
                targetSegment: '全顧客',
                targetCount: customers.length,
                estimatedRevenue: customers.length * avgOrderValue * 0.6,
                campaignPeriod: '6週間',
                urgency: 'medium',
                confidence: 75,
                tactics: [
                    'カラーチェンジ15%OFF',
                    'ビジネスヘアスタイル提案',
                    '新生活応援ヘアケアセット',
                    'SNS投稿キャンペーン'
                ],
                kpis: [
                    'キャンペーン参加率: 35%以上',
                    '新規メニュー利用率: 25%以上',
                    'SNS投稿数: 100件以上'
                ],
                timeline: [
                    {
                        phase: 'キャンペーン準備',
                        duration: '2週間',
                        actions: ['メニュー準備', '販促物制作', 'SNS設定']
                    },
                    {
                        phase: 'キャンペーン実行',
                        duration: '6週間',
                        actions: ['オファー提供', 'SNS運用', '効果測定']
                    }
                ],
                budget: [
                    { category: '販促制作', amount: 120000 },
                    { category: '割引原資', amount: Math.round(customers.length * avgOrderValue * 0.15 * 0.35) },
                    { category: 'SNS広告', amount: 80000 }
                ],
                expectedROI: 180
            };
        }
        if (seasonalCampaign)
            proposals.push(seasonalCampaign);
        // 5. 復帰キャンペーン
        if (lostCustomers.length > 0) {
            proposals.push({
                id: 'recovery-lost',
                type: 'recovery',
                title: '復帰ウェルカムキャンペーン',
                description: '長期未来店顧客への特別復帰オファー',
                targetSegment: '6ヶ月以上未来店の顧客',
                targetCount: lostCustomers.length,
                estimatedRevenue: lostCustomers.length * avgOrderValue * 0.2,
                campaignPeriod: '1ヶ月',
                urgency: 'low',
                confidence: 45,
                tactics: [
                    '復帰特別価格（50%OFF）',
                    '理由調査アンケート実施',
                    '改善されたサービス体験',
                    '復帰記念ギフト'
                ],
                kpis: [
                    '復帰率: 15%以上',
                    'アンケート回答率: 30%以上',
                    '復帰後継続率: 40%以上'
                ],
                timeline: [
                    {
                        phase: 'アプローチ設計',
                        duration: '1週間',
                        actions: ['復帰オファー設計', 'アンケート作成', 'ギフト準備']
                    },
                    {
                        phase: 'キャンペーン実行',
                        duration: '1ヶ月',
                        actions: ['オファー配信', 'アンケート実施', '復帰対応']
                    }
                ],
                budget: [
                    { category: '割引原資', amount: Math.round(lostCustomers.length * avgOrderValue * 0.5 * 0.15) },
                    { category: '復帰ギフト', amount: 60000 },
                    { category: 'アンケート運用', amount: 30000 }
                ],
                expectedROI: 120
            });
        }
        return proposals.sort((a, b) => {
            const urgencyOrder = { high: 3, medium: 2, low: 1 };
            if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
                return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
            }
            return b.confidence - a.confidence;
        });
    }, [customers, reservations]);
    // フィルタリング
    const filteredProposals = useMemo(() => {
        if (selectedCategory === 'all')
            return aiProposals;
        return aiProposals.filter(p => p.type === selectedCategory);
    }, [aiProposals, selectedCategory]);
    // 選択された提案
    const selectedProposalData = selectedProposal
        ? aiProposals.find(p => p.id === selectedProposal)
        : null;
    // 総予想売上
    const totalEstimatedRevenue = aiProposals.reduce((sum, p) => sum + p.estimatedRevenue, 0);
    const totalTargetCustomers = aiProposals.reduce((sum, p) => sum + p.targetCount, 0);
    const avgConfidence = aiProposals.reduce((sum, p) => sum + p.confidence, 0) / aiProposals.length;
    // カテゴリー情報
    const categories = [
        { key: 'all', label: 'すべて', icon: Target },
        { key: 'retention', label: '顧客維持', icon: Users },
        { key: 'acquisition', label: '新規獲得', icon: TrendingUp },
        { key: 'upsell', label: 'アップセル', icon: DollarSign },
        { key: 'seasonal', label: '季節性', icon: Calendar },
        { key: 'recovery', label: '復帰促進', icon: MessageCircle }
    ];
    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    const getTypeIcon = (type) => {
        switch (type) {
            case 'retention': return _jsx(Users, { className: "w-5 h-5" });
            case 'acquisition': return _jsx(TrendingUp, { className: "w-5 h-5" });
            case 'upsell': return _jsx(DollarSign, { className: "w-5 h-5" });
            case 'seasonal': return _jsx(Calendar, { className: "w-5 h-5" });
            case 'loyalty': return _jsx(Star, { className: "w-5 h-5" });
            case 'recovery': return _jsx(MessageCircle, { className: "w-5 h-5" });
            default: return _jsx(Target, { className: "w-5 h-5" });
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(Lightbulb, { className: "w-8 h-8 mr-3 text-yellow-600" }), "AI \u30DE\u30FC\u30B1\u30C6\u30A3\u30F3\u30B0\u65BD\u7B56\u63D0\u6848"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "\u30C7\u30FC\u30BF\u5206\u6790\u306B\u57FA\u3065\u304F\u6700\u9069\u306A\u30DE\u30FC\u30B1\u30C6\u30A3\u30F3\u30B0\u6226\u7565\u3068\u30AD\u30E3\u30F3\u30DA\u30FC\u30F3\u63D0\u6848" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("button", { className: "btn btn-secondary btn-sm", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "AI\u518D\u5206\u6790"] }), _jsxs("button", { className: "btn btn-primary btn-sm", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "\u63D0\u6848\u66F8\u51FA\u529B"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Lightbulb, { className: "w-8 h-8 text-yellow-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "AI\u63D0\u6848\u6570" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [aiProposals.length, "\u4EF6"] })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(DollarSign, { className: "w-8 h-8 text-green-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u4E88\u60F3\u58F2\u4E0A\u52B9\u679C" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: ["\u00A5", Math.round(totalEstimatedRevenue).toLocaleString()] })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-8 h-8 text-blue-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u5BFE\u8C61\u9867\u5BA2\u7DCF\u6570" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [totalTargetCustomers, "\u540D"] })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Star, { className: "w-8 h-8 text-purple-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u5E73\u5747\u6210\u529F\u78BA\u5EA6" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [Math.round(avgConfidence), "%"] })] })] }) })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: "\u65BD\u7B56\u30AB\u30C6\u30B4\u30EA\u30FC" }), _jsx("div", { className: "flex flex-wrap gap-2", children: categories.map((category) => {
                            const Icon = category.icon;
                            const count = category.key === 'all'
                                ? aiProposals.length
                                : aiProposals.filter(p => p.type === category.key).length;
                            return (_jsxs("button", { onClick: () => setSelectedCategory(category.key), className: `flex items-center px-4 py-2 rounded-md border transition-colors ${selectedCategory === category.key
                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`, children: [_jsx(Icon, { className: "w-4 h-4 mr-2" }), category.label, count > 0 && (_jsx("span", { className: "ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs", children: count }))] }, category.key));
                        }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900", children: ["\u30DE\u30FC\u30B1\u30C6\u30A3\u30F3\u30B0\u65BD\u7B56\u63D0\u6848 (", filteredProposals.length, "\u4EF6)"] }), filteredProposals.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: filteredProposals.map((proposal) => (_jsxs("button", { onClick: () => setSelectedProposal(selectedProposal === proposal.id ? null : proposal.id), className: `p-6 text-left border-2 rounded-lg transition-all hover:shadow-md ${selectedProposal === proposal.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'}`, children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "mr-3 text-blue-600", children: getTypeIcon(proposal.type) }), _jsxs("div", { children: [_jsx("h4", { className: "font-bold text-gray-900", children: proposal.title }), _jsx("p", { className: "text-sm text-gray-600", children: proposal.targetSegment })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(proposal.urgency)}`, children: proposal.urgency === 'high' ? '緊急' : proposal.urgency === 'medium' ? '通常' : '低' }), _jsx("div", { className: "text-right", children: _jsxs("div", { className: "text-sm font-medium text-gray-900", children: ["\u6210\u529F\u78BA\u5EA6: ", proposal.confidence, "%"] }) })] })] }), _jsx("p", { className: "text-sm text-gray-700 mb-4", children: proposal.description }), _jsxs("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "\u5BFE\u8C61:" }), _jsxs("div", { className: "font-medium", children: [proposal.targetCount, "\u540D"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "\u4E88\u60F3\u58F2\u4E0A:" }), _jsxs("div", { className: "font-medium", children: ["\u00A5", Math.round(proposal.estimatedRevenue).toLocaleString()] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "\u671F\u9593:" }), _jsx("div", { className: "font-medium", children: proposal.campaignPeriod })] })] }), _jsxs("div", { className: "mt-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center text-green-600", children: [_jsx(TrendingUp, { className: "w-4 h-4 mr-1" }), _jsxs("span", { className: "text-sm font-medium", children: ["ROI ", proposal.expectedROI, "%"] })] }), _jsx(ArrowRight, { className: "w-4 h-4 text-gray-400" })] })] }, proposal.id))) })) : (_jsx("div", { className: "text-center py-8 text-gray-500", children: "\u9078\u629E\u3057\u305F\u30AB\u30C6\u30B4\u30EA\u30FC\u306B\u8A72\u5F53\u3059\u308B\u63D0\u6848\u304C\u3042\u308A\u307E\u305B\u3093" }))] }), selectedProposalData && (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h3", { className: "text-xl font-bold text-gray-900 flex items-center", children: [_jsx(Eye, { className: "w-6 h-6 mr-2 text-blue-600" }), selectedProposalData.title, " - \u8A73\u7D30\u30D7\u30E9\u30F3"] }), _jsx("button", { onClick: () => setSelectedProposal(null), className: "text-gray-400 hover:text-gray-600", children: "\u00D7" })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "\u30AD\u30E3\u30F3\u30DA\u30FC\u30F3\u6982\u8981" }), _jsx("p", { className: "text-gray-700", children: selectedProposalData.description })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "\u5B9F\u65BD\u6226\u8853" }), _jsx("ul", { className: "space-y-1", children: selectedProposalData.tactics.map((tactic, index) => (_jsxs("li", { className: "text-sm text-gray-700 flex items-start", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" }), tactic] }, index))) })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "KPI\u76EE\u6A19" }), _jsx("ul", { className: "space-y-1", children: selectedProposalData.kpis.map((kpi, index) => (_jsxs("li", { className: "text-sm text-gray-700 flex items-start", children: [_jsx(Target, { className: "w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" }), kpi] }, index))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "\u4E88\u7B97\u5185\u8A33" }), _jsxs("div", { className: "space-y-2", children: [selectedProposalData.budget.map((item, index) => (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { className: "text-gray-600", children: [item.category, ":"] }), _jsxs("span", { className: "font-medium", children: ["\u00A5", item.amount.toLocaleString()] })] }, index))), _jsxs("div", { className: "border-t pt-2 flex justify-between font-medium", children: [_jsx("span", { children: "\u5408\u8A08:" }), _jsxs("span", { children: ["\u00A5", selectedProposalData.budget.reduce((sum, b) => sum + b.amount, 0).toLocaleString()] })] })] })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-4", children: "\u5B9F\u65BD\u30BF\u30A4\u30E0\u30E9\u30A4\u30F3" }), _jsx("div", { className: "space-y-4", children: selectedProposalData.timeline.map((phase, index) => (_jsxs("div", { className: "flex items-start", children: [_jsx("div", { className: "flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4", children: _jsx("span", { className: "text-sm font-medium text-blue-600", children: index + 1 }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center mb-2", children: [_jsx("h5", { className: "font-medium text-gray-900", children: phase.phase }), _jsxs("span", { className: "ml-2 text-sm text-gray-500", children: ["(", phase.duration, ")"] })] }), _jsx("ul", { className: "text-sm text-gray-700 space-y-1", children: phase.actions.map((action, actionIndex) => (_jsxs("li", { className: "flex items-center", children: [_jsx(Clock, { className: "w-3 h-3 text-gray-400 mr-2" }), action] }, actionIndex))) })] })] }, index))) })] }), _jsxs("div", { className: "flex justify-end space-x-3 pt-4 border-t", children: [_jsxs("button", { className: "btn btn-secondary", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "\u63D0\u6848\u66F8PDF\u51FA\u529B"] }), _jsxs("button", { className: "btn btn-primary", children: [_jsx(Zap, { className: "w-4 h-4 mr-2" }), "\u30AD\u30E3\u30F3\u30DA\u30FC\u30F3\u5B9F\u884C\u6E96\u5099"] })] })] })] })), _jsxs("div", { className: "bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-6", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center", children: [_jsx(Zap, { className: "w-5 h-5 mr-2 text-yellow-600" }), "AI\u63A8\u5968\u5B9F\u884C\u30D7\u30E9\u30A4\u30AA\u30EA\u30C6\u30A3"] }), _jsx("div", { className: "space-y-3", children: aiProposals.slice(0, 3).map((proposal, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-white rounded-lg", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'}`, children: index + 1 }), _jsxs("div", { className: "ml-3", children: [_jsx("div", { className: "font-medium text-gray-900", children: proposal.title }), _jsxs("div", { className: "text-sm text-gray-600", children: [proposal.targetCount, "\u540D\u5BFE\u8C61 | \u6210\u529F\u78BA\u5EA6", proposal.confidence, "% | ROI ", proposal.expectedROI, "%"] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-bold text-gray-900", children: ["\u00A5", Math.round(proposal.estimatedRevenue).toLocaleString()] }), _jsx("div", { className: "text-xs text-gray-500", children: proposal.campaignPeriod })] })] }, proposal.id))) })] })] }));
};
export default MarketingAISuggestions;
