import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Crown, TrendingUp, Target, Users, DollarSign, BarChart3, CheckCircle, AlertTriangle, Lightbulb, Zap } from 'lucide-react';
const PremiumMarketingDashboard = () => {
    const [userPlan, setUserPlan] = useState(null);
    const [businessAnalysis, setBusinessAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
    useEffect(() => {
        checkUserSubscription();
        if (userPlan?.planType === 'premium' || userPlan?.planType === 'enterprise') {
            loadBusinessAnalysis();
        }
    }, [userPlan, selectedTimeframe]);
    const checkUserSubscription = async () => {
        try {
            // デモ用：実際はAPIで認証されたユーザーの課金状況を確認
            const demoUser = {
                id: 'user123',
                planType: 'premium', // 'basic' | 'premium' | 'enterprise'
                subscriptionStart: '2024-01-01',
                subscriptionEnd: '2025-01-01',
                features: [
                    'advanced_analytics',
                    'marketing_recommendations',
                    'competitor_analysis',
                    'churn_prediction',
                    'roi_optimization'
                ]
            };
            setUserPlan(demoUser);
        }
        catch (error) {
            console.error('Subscription check error:', error);
        }
    };
    const loadBusinessAnalysis = async () => {
        setIsLoading(true);
        try {
            // 実際の顧客データと施術履歴を基に高度な分析を実行
            const customers = window.dummyCustomers || [];
            const serviceHistory = window.serviceHistory || [];
            const analysis = await generateAdvancedBusinessAnalysis(customers, serviceHistory);
            setBusinessAnalysis(analysis);
        }
        catch (error) {
            console.error('Business analysis error:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const generateAdvancedBusinessAnalysis = async (customers, serviceHistory) => {
        // AI風の高度な分析を模擬
        const totalRevenue = serviceHistory.reduce((sum, service) => sum + service.price, 0);
        const previousRevenue = totalRevenue * 0.85; // 仮の前期比較
        const revenueGrowth = ((totalRevenue - previousRevenue) / previousRevenue) * 100;
        // 顧客リテンション分析
        const activeCustomers = customers.filter(c => {
            if (!c.lastVisitDate)
                return false;
            const lastVisit = new Date(c.lastVisitDate);
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            return lastVisit > threeMonthsAgo;
        });
        const customerRetention = (activeCustomers.length / customers.length) * 100;
        // CLV計算
        const averageOrderValue = totalRevenue / serviceHistory.length;
        const averageFrequency = customers.reduce((sum, c) => sum + c.visitCount, 0) / customers.length;
        const customerLifetimeValue = averageOrderValue * averageFrequency * 2.5; // 平均ライフサイクル
        // チャーンリスク分析
        const churnRisk = customers
            .filter(c => c.lastVisitDate)
            .map(customer => {
            const daysSinceLastVisit = Math.floor((new Date().getTime() - new Date(customer.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24));
            const riskScore = Math.min(100, (daysSinceLastVisit / 90) * 100);
            return {
                customerId: customer.id,
                customerName: customer.name,
                riskScore: Math.round(riskScore),
                lastVisit: customer.lastVisitDate,
                recommendedAction: riskScore > 70 ? 'ウィンバックキャンペーン' :
                    riskScore > 40 ? 'リテンション施策' : '継続フォロー'
            };
        })
            .filter(risk => risk.riskScore > 40)
            .sort((a, b) => b.riskScore - a.riskScore)
            .slice(0, 10);
        // マーケティング推奨施策
        const recommendations = [
            {
                id: 'rec1',
                type: 'retention',
                priority: 'high',
                title: 'VIP顧客向けロイヤルティプログラム',
                description: '来店回数15回以上の顧客に特別割引と優先予約権を提供',
                expectedImpact: '顧客単価15%向上、リテンション率12%改善',
                implementationCost: '月額5万円',
                timeframe: '2週間',
                roi: 340
            },
            {
                id: 'rec2',
                type: 'acquisition',
                priority: 'high',
                title: '既存顧客紹介キャンペーン',
                description: '紹介者・被紹介者双方に3,000円割引クーポンを提供',
                expectedImpact: '新規獲得30%増加、紹介率25%向上',
                implementationCost: '月額8万円',
                timeframe: '1週間',
                roi: 280
            },
            {
                id: 'rec3',
                type: 'pricing',
                priority: 'medium',
                title: 'ダイナミックプライシング導入',
                description: '平日・時間帯別の動的価格設定で稼働率を最適化',
                expectedImpact: '売上20%向上、稼働率15%改善',
                implementationCost: '初期15万円',
                timeframe: '1ヶ月',
                roi: 220
            },
            {
                id: 'rec4',
                type: 'service',
                priority: 'medium',
                title: 'サブスクリプション型メンバーシップ',
                description: '月額定額でサービス利用し放題プランを導入',
                expectedImpact: '予約安定化、月間売上予測精度90%向上',
                implementationCost: '月額3万円',
                timeframe: '3週間',
                roi: 190
            },
            {
                id: 'rec5',
                type: 'promotion',
                priority: 'low',
                title: 'SNSインフルエンサー連携',
                description: 'ローカルインフルエンサーとのコラボレーション企画',
                expectedImpact: 'ブランド認知度40%向上、新規流入25%増',
                implementationCost: '月額12万円',
                timeframe: '2ヶ月',
                roi: 150
            }
        ];
        // 競合分析（デモデータ）
        const competitorAnalysis = [
            {
                name: 'A美容室',
                priceRange: '6,000円〜15,000円',
                strengths: ['立地が良い', 'SNS発信力', '最新設備'],
                weaknesses: ['価格が高い', '予約が取りにくい'],
                marketShare: 25
            },
            {
                name: 'Bサロン',
                priceRange: '4,000円〜12,000円',
                strengths: ['価格競争力', '営業時間が長い'],
                weaknesses: ['技術レベルにばらつき', 'リピート率低い'],
                marketShare: 20
            },
            {
                name: 'C美容院',
                priceRange: '5,000円〜18,000円',
                strengths: ['技術力が高い', '個室対応'],
                weaknesses: ['マーケティング弱い', '客層が限定的'],
                marketShare: 15
            }
        ];
        return {
            revenueGrowth: Math.round(revenueGrowth),
            customerRetention: Math.round(customerRetention),
            averageOrderValue: Math.round(averageOrderValue),
            marketingROI: 265,
            recommendations,
            competitorAnalysis,
            customerLifetimeValue: Math.round(customerLifetimeValue),
            churnRisk
        };
    };
    const upgradeToPremium = () => {
        alert('プレミアムプランにアップグレードしました！（デモ）');
        setUserPlan(prev => prev ? { ...prev, planType: 'premium' } : null);
    };
    if (!userPlan || userPlan.planType === 'basic') {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "max-w-4xl w-full", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx(Crown, { className: "w-20 h-20 text-yellow-500 mx-auto mb-6" }), _jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-4", children: "\u30D7\u30EC\u30DF\u30A2\u30E0\u7D4C\u55B6\u6226\u7565\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }), _jsx("p", { className: "text-xl text-gray-600 mb-8", children: "AI powered \u30DE\u30FC\u30B1\u30C6\u30A3\u30F3\u30B0\u65BD\u7B56\u3067\u58F2\u4E0A\u3092\u6700\u5927\u5316" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12", children: [_jsxs("div", { className: "bg-white rounded-xl shadow-lg p-8", children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 mb-6 flex items-center", children: [_jsx(Zap, { className: "w-8 h-8 text-yellow-500 mr-3" }), "\u30D7\u30EC\u30DF\u30A2\u30E0\u9650\u5B9A\u6A5F\u80FD"] }), _jsx("div", { className: "space-y-4", children: [
                                            { icon: Target, title: 'AI経営戦略提案', desc: '売上最大化のための具体的施策を提案' },
                                            { icon: TrendingUp, title: '高度な競合分析', desc: '市場動向と競合他社の詳細分析' },
                                            { icon: Users, title: 'チャーン予測', desc: '離脱リスク顧客の特定と対策提案' },
                                            { icon: BarChart3, title: 'ROI最適化', desc: 'マーケティング投資効果の最大化' },
                                            { icon: Lightbulb, title: '個別コンサルティング', desc: '経営状況に応じたカスタム戦略' }
                                        ].map((feature, index) => (_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(feature.icon, { className: "w-6 h-6 text-blue-600 mt-1" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900", children: feature.title }), _jsx("p", { className: "text-gray-600 text-sm", children: feature.desc })] })] }, index))) })] }), _jsxs("div", { className: "bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl shadow-lg p-8 text-white", children: [_jsx("h2", { className: "text-2xl font-bold mb-6", children: "\u30D7\u30EC\u30DF\u30A2\u30E0\u30D7\u30E9\u30F3" }), _jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "text-5xl font-bold mb-2", children: "\u00A529,800" }), _jsx("div", { className: "text-blue-200", children: "\u6708\u984D\uFF08\u7A0E\u629C\uFF09" })] }), _jsx("div", { className: "space-y-3 mb-8", children: [
                                            'AI経営戦略コンサルティング',
                                            '高度な顧客分析・競合分析',
                                            'ROI最適化レポート',
                                            'チャーン予測・離脱防止施策',
                                            '24時間チャットサポート',
                                            'カスタムレポート作成'
                                        ].map((feature, index) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-300" }), _jsx("span", { className: "text-sm", children: feature })] }, index))) }), _jsx("button", { onClick: upgradeToPremium, className: "w-full bg-white text-blue-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors", children: "\u4ECA\u3059\u3050\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9" })] })] }), _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-8", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6 text-center", children: "\u5C0E\u5165\u5B9F\u7E3E" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
                                    { metric: '売上向上', value: '平均35%', desc: '導入後6ヶ月での売上増加率' },
                                    { metric: '顧客満足度', value: '95%', desc: 'プレミアムユーザーの満足度' },
                                    { metric: 'ROI改善', value: '280%', desc: 'マーケティング投資効果の向上' }
                                ].map((stat, index) => (_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-blue-600 mb-2", children: stat.value }), _jsx("div", { className: "font-semibold text-gray-900 mb-1", children: stat.metric }), _jsx("div", { className: "text-sm text-gray-600", children: stat.desc })] }, index))) })] })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold mb-2 flex items-center", children: [_jsx(Crown, { className: "w-8 h-8 mr-3 text-yellow-300" }), "\u30D7\u30EC\u30DF\u30A2\u30E0\u7D4C\u55B6\u6226\u7565\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9"] }), _jsx("p", { className: "text-purple-100", children: "AI powered \u30DE\u30FC\u30B1\u30C6\u30A3\u30F3\u30B0\u65BD\u7B56\u3067\u58F2\u4E0A\u3092\u6700\u5927\u5316\u3057\u307E\u3057\u3087\u3046" })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-lg font-semibold", children: "\u30D7\u30EC\u30DF\u30A2\u30E0\u30D7\u30E9\u30F3" }), _jsxs("div", { className: "text-purple-200 text-sm", children: [userPlan.subscriptionEnd, "\u307E\u3067\u6709\u52B9"] })] })] }) }), isLoading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" }), _jsx("p", { className: "mt-4 text-gray-600", children: "\u7D4C\u55B6\u30C7\u30FC\u30BF\u3092\u5206\u6790\u4E2D..." })] })) : businessAnalysis && (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [
                            {
                                title: '売上成長率',
                                value: `${businessAnalysis.revenueGrowth}%`,
                                icon: TrendingUp,
                                color: businessAnalysis.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600',
                                bgColor: businessAnalysis.revenueGrowth > 0 ? 'bg-green-50' : 'bg-red-50'
                            },
                            {
                                title: '顧客リテンション率',
                                value: `${businessAnalysis.customerRetention}%`,
                                icon: Users,
                                color: 'text-blue-600',
                                bgColor: 'bg-blue-50'
                            },
                            {
                                title: '顧客生涯価値',
                                value: `¥${businessAnalysis.customerLifetimeValue.toLocaleString()}`,
                                icon: DollarSign,
                                color: 'text-purple-600',
                                bgColor: 'bg-purple-50'
                            },
                            {
                                title: 'マーケティングROI',
                                value: `${businessAnalysis.marketingROI}%`,
                                icon: Target,
                                color: 'text-orange-600',
                                bgColor: 'bg-orange-50'
                            }
                        ].map((kpi, index) => (_jsxs("div", { className: `${kpi.bgColor} rounded-xl p-6`, children: [_jsx("div", { className: "flex items-center justify-between mb-3", children: _jsx(kpi.icon, { className: `w-8 h-8 ${kpi.color}` }) }), _jsx("div", { className: `text-2xl font-bold ${kpi.color} mb-1`, children: kpi.value }), _jsx("div", { className: "text-gray-600 text-sm", children: kpi.title })] }, index))) }), _jsxs("div", { className: "bg-white rounded-xl p-6 shadow-lg", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 mb-6 flex items-center", children: [_jsx(Zap, { className: "w-6 h-6 text-blue-500 mr-2" }), "AI\u30DE\u30FC\u30B1\u30C6\u30A3\u30F3\u30B0\u63D0\u6848"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8", children: [_jsxs("div", { className: "p-4 bg-blue-50 rounded-lg border border-blue-200", children: [_jsx("h4", { className: "font-medium text-blue-900 mb-2", children: "\u65B0\u898F\u9867\u5BA2\u7372\u5F97" }), _jsx("p", { className: "text-sm text-blue-800", children: "SNS\u30AD\u30E3\u30F3\u30DA\u30FC\u30F3\u3067\u65B0\u898F\u9867\u5BA2\u309225%\u5897\u52A0\u3055\u305B\u308B\u65BD\u7B56\u3092\u63D0\u6848\u3057\u307E\u3059\u3002" })] }), _jsxs("div", { className: "p-4 bg-green-50 rounded-lg border border-green-200", children: [_jsx("h4", { className: "font-medium text-green-900 mb-2", children: "\u30EA\u30D4\u30FC\u30C8\u7387\u5411\u4E0A" }), _jsx("p", { className: "text-sm text-green-800", children: "\u96E2\u8131\u30EA\u30B9\u30AF\u9867\u5BA2\u3078\u306E\u30D5\u30A9\u30ED\u30FC\u30A2\u30C3\u30D7\u30E1\u30C3\u30BB\u30FC\u30B8\u3067\u518D\u6765\u5E97\u3092\u4FC3\u9032\u3002" })] }), _jsxs("div", { className: "p-4 bg-purple-50 rounded-lg border border-purple-200", children: [_jsx("h4", { className: "font-medium text-purple-900 mb-2", children: "\u5358\u4FA1\u30A2\u30C3\u30D7" }), _jsx("p", { className: "text-sm text-purple-800", children: "VIP\u9867\u5BA2\u5411\u3051\u7279\u5225\u30E1\u30CB\u30E5\u30FC\u3067\u5E73\u5747\u5358\u4FA1\u309215%\u5411\u4E0A\u3055\u305B\u308B\u63D0\u6848\u3002" })] })] })] }), _jsxs("div", { className: "bg-white rounded-xl p-6 shadow-lg", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 mb-6 flex items-center", children: [_jsx(Lightbulb, { className: "w-6 h-6 text-yellow-500 mr-2" }), "AI\u63A8\u5968\u30DE\u30FC\u30B1\u30C6\u30A3\u30F3\u30B0\u65BD\u7B56"] }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: businessAnalysis.recommendations.slice(0, 4).map((rec) => (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: `inline-block w-3 h-3 rounded-full ${rec.priority === 'high' ? 'bg-red-500' :
                                                                rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}` }), _jsx("span", { className: "text-xs font-medium text-gray-500 uppercase", children: rec.type })] }), _jsx("div", { className: "text-right", children: _jsxs("div", { className: "text-lg font-bold text-green-600", children: ["ROI ", rec.roi, "%"] }) })] }), _jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: rec.title }), _jsx("p", { className: "text-gray-600 text-sm mb-3", children: rec.description }), _jsxs("div", { className: "space-y-1 text-xs text-gray-500", children: [_jsxs("div", { children: [_jsx("strong", { children: "\u4E88\u60F3\u52B9\u679C:" }), " ", rec.expectedImpact] }), _jsxs("div", { children: [_jsx("strong", { children: "\u30B3\u30B9\u30C8:" }), " ", rec.implementationCost] }), _jsxs("div", { children: [_jsx("strong", { children: "\u671F\u9593:" }), " ", rec.timeframe] })] }), _jsx("button", { className: "w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 transition-colors", children: "\u65BD\u7B56\u3092\u5B9F\u884C" })] }, rec.id))) })] }), _jsxs("div", { className: "bg-white rounded-xl p-6 shadow-lg", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 mb-6 flex items-center", children: [_jsx(AlertTriangle, { className: "w-6 h-6 text-red-500 mr-2" }), "\u96E2\u8131\u30EA\u30B9\u30AF\u9867\u5BA2\uFF08\u8981\u6CE8\u610F\uFF09"] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u9867\u5BA2\u540D" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u30EA\u30B9\u30AF\u30B9\u30B3\u30A2" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u6700\u7D42\u6765\u5E97" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u63A8\u5968\u30A2\u30AF\u30B7\u30E7\u30F3" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: businessAnalysis.churnRisk.slice(0, 5).map((risk) => (_jsxs("tr", { children: [_jsx("td", { className: "px-4 py-3 text-sm font-medium text-gray-900", children: risk.customerName }), _jsx("td", { className: "px-4 py-3 text-sm", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `w-3 h-3 rounded-full mr-2 ${risk.riskScore > 70 ? 'bg-red-500' :
                                                                        risk.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'}` }), risk.riskScore, "%"] }) }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600", children: risk.lastVisit }), _jsx("td", { className: "px-4 py-3 text-sm", children: _jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: risk.recommendedAction }) })] }, risk.customerId))) })] }) })] }), _jsxs("div", { className: "bg-white rounded-xl p-6 shadow-lg", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 mb-6 flex items-center", children: [_jsx(BarChart3, { className: "w-6 h-6 text-purple-500 mr-2" }), "\u7AF6\u5408\u5206\u6790\u30EC\u30DD\u30FC\u30C8"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: businessAnalysis.competitorAnalysis.map((competitor, index) => (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: competitor.name }), _jsxs("div", { className: "text-sm text-gray-600 mb-3", children: ["\u4FA1\u683C\u5E2F: ", competitor.priceRange] }), _jsxs("div", { className: "mb-3", children: [_jsx("div", { className: "text-xs font-medium text-green-700 mb-1", children: "\u5F37\u307F" }), competitor.strengths.map((strength, i) => (_jsxs("div", { className: "text-xs text-gray-600", children: ["\u2022 ", strength] }, i)))] }), _jsxs("div", { className: "mb-3", children: [_jsx("div", { className: "text-xs font-medium text-red-700 mb-1", children: "\u5F31\u307F" }), competitor.weaknesses.map((weakness, i) => (_jsxs("div", { className: "text-xs text-gray-600", children: ["\u2022 ", weakness] }, i)))] }), _jsxs("div", { className: "text-xs", children: ["\u5E02\u5834\u30B7\u30A7\u30A2: ", _jsxs("span", { className: "font-semibold", children: [competitor.marketShare, "%"] })] })] }, index))) })] })] }))] }));
};
export default PremiumMarketingDashboard;
