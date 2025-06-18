import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { TrendingUp, Zap, Brain, Smartphone, BarChart3, Clock, Heart, Star, Award, Target, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';
const FeatureShowcase = () => {
    const [activeFeature, setActiveFeature] = useState(0);
    const [currentMetric, setCurrentMetric] = useState(0);
    const features = [
        {
            id: 'ai-analytics',
            icon: _jsx(Brain, { className: "w-12 h-12 text-purple-500" }),
            title: 'AI予測分析エンジン',
            subtitle: '業界初の機械学習システム',
            description: '3ヶ月先の売上を95%の精度で予測。顧客の来店確率、最適な施術メニュー、スタッフの配置まで全てAIが最適化します。',
            metrics: [
                { label: '売上予測精度', value: '95.2%', color: 'text-green-500' },
                { label: '顧客満足度向上', value: '+42%', color: 'text-blue-500' },
                { label: '業務効率化', value: '+78%', color: 'text-purple-500' }
            ],
            demo: {
                type: 'chart',
                data: [65, 78, 85, 92, 88, 95, 97]
            }
        },
        {
            id: 'realtime-sync',
            icon: _jsx(Zap, { className: "w-12 h-12 text-yellow-500" }),
            title: 'リアルタイム完全同期',
            subtitle: 'LINE・Instagram・予約サイト統合',
            description: '全ての顧客接点を一元管理。メッセージの見落としゼロ、予約の重複ゼロ、顧客満足度の最大化を実現します。',
            metrics: [
                { label: 'メッセージ応答時間', value: '-89%', color: 'text-green-500' },
                { label: '予約ミス削減', value: '100%', color: 'text-blue-500' },
                { label: '顧客対応品質', value: '+156%', color: 'text-yellow-500' }
            ],
            demo: {
                type: 'messages',
                data: [
                    { platform: 'LINE', count: 12, status: 'active' },
                    { platform: 'Instagram', count: 8, status: 'active' },
                    { platform: '予約サイト', count: 15, status: 'active' }
                ]
            }
        },
        {
            id: 'smart-dashboard',
            icon: _jsx(BarChart3, { className: "w-12 h-12 text-blue-500" }),
            title: 'インテリジェント・ダッシュボード',
            subtitle: '瞬時に経営状況を把握',
            description: '売上、顧客動向、スタッフパフォーマンス、予約状況を美しいビジュアルで表示。意思決定を劇的にスピードアップ。',
            metrics: [
                { label: '意思決定速度', value: '+234%', color: 'text-green-500' },
                { label: 'データ精度', value: '99.9%', color: 'text-blue-500' },
                { label: '経営効率', value: '+167%', color: 'text-purple-500' }
            ],
            demo: {
                type: 'dashboard',
                data: {
                    revenue: 2847000,
                    customers: 342,
                    satisfaction: 98.5,
                    bookings: 127
                }
            }
        },
        {
            id: 'mobile-first',
            icon: _jsx(Smartphone, { className: "w-12 h-12 text-green-500" }),
            title: 'モバイルファースト設計',
            subtitle: 'いつでもどこでも完全操作',
            description: 'スマートフォンから全機能にアクセス可能。外出先でも予約確認、顧客対応、売上チェックが瞬時に行えます。',
            metrics: [
                { label: 'モバイル応答速度', value: '0.3秒', color: 'text-green-500' },
                { label: '外出先対応率', value: '+312%', color: 'text-blue-500' },
                { label: 'スタッフ満足度', value: '96%', color: 'text-green-500' }
            ],
            demo: {
                type: 'mobile',
                data: {
                    screenSize: 'responsive',
                    features: ['予約管理', '顧客対応', '売上確認', 'メッセージ']
                }
            }
        }
    ];
    const successMetrics = [
        { label: '平均売上向上', value: '+347%', description: '導入3ヶ月後の実績', icon: _jsx(TrendingUp, { className: "w-6 h-6 text-green-500" }) },
        { label: '顧客満足度', value: '98.2%', description: '業界平均の2.3倍', icon: _jsx(Heart, { className: "w-6 h-6 text-pink-500" }) },
        { label: '業務効率化', value: '+289%', description: 'スタッフの作業時間削減', icon: _jsx(Clock, { className: "w-6 h-6 text-blue-500" }) },
        { label: '導入店舗評価', value: '★4.9', description: '500店舗の平均評価', icon: _jsx(Star, { className: "w-6 h-6 text-yellow-500" }) }
    ];
    // 自動でメトリクスを切り替え
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentMetric(prev => (prev + 1) % successMetrics.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);
    // 自動で機能を切り替え
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveFeature(prev => (prev + 1) % features.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);
    const renderDemo = (feature) => {
        switch (feature.demo.type) {
            case 'chart':
                return (_jsx("div", { className: "h-32 flex items-end justify-around px-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg", children: feature.demo.data.map((height, i) => (_jsx("div", { className: "bg-gradient-to-t from-blue-500 to-blue-400 rounded-t w-6 transition-all duration-1000 ease-out", style: {
                            height: `${height}%`,
                            animationDelay: `${i * 100}ms`
                        } }, i))) }));
            case 'messages':
                return (_jsx("div", { className: "space-y-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4", children: feature.demo.data.map((item, i) => (_jsxs("div", { className: "flex items-center justify-between bg-white rounded-lg p-3 shadow-sm", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `w-3 h-3 rounded-full mr-3 ${item.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}` }), _jsx("span", { className: "font-medium text-gray-800", children: item.platform })] }), _jsx("span", { className: "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-bold", children: item.count })] }, i))) }));
            case 'dashboard':
                return (_jsxs("div", { className: "grid grid-cols-2 gap-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4", children: [_jsxs("div", { className: "bg-white rounded-lg p-3 text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: ["\u00A5", (feature.demo.data.revenue / 10000).toFixed(0), "\u4E07"] }), _jsx("div", { className: "text-xs text-gray-600", children: "\u4ECA\u6708\u58F2\u4E0A" })] }), _jsxs("div", { className: "bg-white rounded-lg p-3 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: feature.demo.data.customers }), _jsx("div", { className: "text-xs text-gray-600", children: "\u9867\u5BA2\u6570" })] }), _jsxs("div", { className: "bg-white rounded-lg p-3 text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [feature.demo.data.satisfaction, "%"] }), _jsx("div", { className: "text-xs text-gray-600", children: "\u6E80\u8DB3\u5EA6" })] }), _jsxs("div", { className: "bg-white rounded-lg p-3 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-orange-600", children: feature.demo.data.bookings }), _jsx("div", { className: "text-xs text-gray-600", children: "\u4E88\u7D04\u6570" })] })] }));
            case 'mobile':
                return (_jsx("div", { className: "flex justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4", children: _jsxs("div", { className: "bg-white rounded-xl p-4 shadow-lg border-2 border-gray-300 w-32", children: [_jsx("div", { className: "bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg h-20 mb-2 flex items-center justify-center", children: _jsx(Smartphone, { className: "w-8 h-8 text-white" }) }), _jsx("div", { className: "space-y-1", children: feature.demo.data.features.map((f, i) => (_jsx("div", { className: "text-xs bg-gray-100 rounded px-2 py-1 text-center", children: f }, i))) })] }) }));
            default:
                return null;
        }
    };
    return (_jsx("section", { className: "py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "mb-16 bg-black bg-opacity-30 rounded-2xl p-6 backdrop-blur-sm border border-purple-500/30", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsxs("h2", { className: "text-2xl sm:text-3xl font-bold text-white mb-2", children: ["\u5B9F\u8A3C\u6E08\u307F\u306E", _jsx("span", { className: "text-yellow-400", children: "\u5727\u5012\u7684\u6210\u679C" })] }), _jsx("p", { className: "text-gray-300", children: "500\u5E97\u8217\u304C\u5B9F\u611F\u3057\u305F\u9769\u547D\u7684\u306A\u7D50\u679C" })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: successMetrics.map((metric, index) => (_jsxs("div", { className: `bg-gradient-to-br p-4 rounded-xl border-2 transition-all duration-500 ${index === currentMetric
                                    ? 'from-yellow-400/20 to-orange-500/20 border-yellow-400 scale-105'
                                    : 'from-slate-800/50 to-slate-900/50 border-slate-600'}`, children: [_jsxs("div", { className: "flex items-center mb-2", children: [metric.icon, _jsx("span", { className: "text-white font-semibold ml-2 text-sm", children: metric.label })] }), _jsx("div", { className: "text-2xl font-bold text-white mb-1", children: metric.value }), _jsx("div", { className: "text-xs text-gray-400", children: metric.description })] }, index))) })] }), _jsxs("div", { className: "text-center mb-12", children: [_jsxs("h2", { className: "text-4xl sm:text-5xl font-bold text-white mb-6", children: ["\u306A\u305C\u3053\u308C\u307B\u3069\u306E", _jsx("span", { className: "text-purple-400", children: "\u6210\u679C" }), "\u304C\u751F\u307E\u308C\u308B\u306E\u304B\uFF1F"] }), _jsx("p", { className: "text-xl text-gray-300 max-w-3xl mx-auto", children: "\u696D\u754C\u521D\u306E\u9769\u65B0\u6280\u8853\u3068\u6D17\u7DF4\u3055\u308C\u305FUX\u30C7\u30B6\u30A4\u30F3\u304C\u751F\u307F\u51FA\u3059\u3001\u5F93\u6765\u306E\u5E38\u8B58\u3092\u8986\u3059\u30BD\u30EA\u30E5\u30FC\u30B7\u30E7\u30F3" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center", children: [_jsxs("div", { children: [_jsx("div", { className: "space-y-4", children: features.map((feature, index) => (_jsx("div", { onClick: () => setActiveFeature(index), className: `p-6 rounded-2xl border-2 cursor-pointer transition-all duration-500 ${index === activeFeature
                                            ? 'bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-400 shadow-lg shadow-purple-500/25'
                                            : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'}`, children: _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: `p-3 rounded-xl transition-colors duration-300 ${index === activeFeature ? 'bg-purple-600' : 'bg-slate-700'}`, children: feature.icon }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: `text-xl font-bold mb-2 transition-colors ${index === activeFeature ? 'text-purple-300' : 'text-white'}`, children: feature.title }), _jsx("p", { className: `text-sm font-medium mb-3 ${index === activeFeature ? 'text-purple-200' : 'text-gray-400'}`, children: feature.subtitle }), index === activeFeature && (_jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-gray-300 leading-relaxed", children: feature.description }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: feature.metrics.map((metric, i) => (_jsxs("div", { className: "bg-black/30 rounded-lg p-3 text-center", children: [_jsx("div", { className: `text-lg font-bold ${metric.color}`, children: metric.value }), _jsx("div", { className: "text-xs text-gray-400", children: metric.label })] }, i))) })] }))] })] }) }, feature.id))) }), _jsxs("div", { className: "flex justify-center mt-8 space-x-2", children: [_jsx("button", { onClick: () => setActiveFeature(prev => prev > 0 ? prev - 1 : features.length - 1), className: "p-3 bg-slate-700 hover:bg-slate-600 rounded-full text-white transition-colors", children: _jsx(ChevronLeft, { className: "w-5 h-5" }) }), features.map((_, index) => (_jsx("button", { onClick: () => setActiveFeature(index), className: `w-3 h-3 rounded-full transition-colors ${index === activeFeature ? 'bg-purple-500' : 'bg-gray-600'}` }, index))), _jsx("button", { onClick: () => setActiveFeature(prev => (prev + 1) % features.length), className: "p-3 bg-slate-700 hover:bg-slate-600 rounded-full text-white transition-colors", children: _jsx(ChevronRight, { className: "w-5 h-5" }) })] })] }), _jsxs("div", { className: "relative", children: [_jsxs("div", { className: "bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-600 shadow-2xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h4", { className: "text-xl font-bold text-white", children: [features[activeFeature].title, " - \u30E9\u30A4\u30D6\u30C7\u30E2"] }), _jsxs("button", { className: "flex items-center text-green-400 hover:text-green-300 transition-colors", children: [_jsx(PlayCircle, { className: "w-5 h-5 mr-1" }), _jsx("span", { className: "text-sm", children: "\u4F53\u9A13\u958B\u59CB" })] })] }), renderDemo(features[activeFeature]), _jsx("div", { className: "mt-6 p-4 bg-green-600/20 border border-green-500/30 rounded-lg", children: _jsxs("div", { className: "flex items-center text-green-300 text-sm", children: [_jsx(Award, { className: "w-4 h-4 mr-2" }), "\u3053\u306E\u6A5F\u80FD\u306B\u3088\u308A\u5E73\u5747 ", _jsxs("span", { className: "font-bold mx-1", children: ["+", Math.floor(Math.random() * 100 + 150), "%"] }), " \u306E\u52B9\u7387\u5411\u4E0A\u3092\u5B9F\u73FE"] }) })] }), _jsx("div", { className: "absolute -top-4 -right-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-4 shadow-lg animate-bounce", children: _jsx(Target, { className: "w-6 h-6 text-white" }) }), _jsx("div", { className: "absolute -bottom-4 -left-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-4 shadow-lg animate-pulse", children: _jsx(Zap, { className: "w-6 h-6 text-white" }) })] })] })] }) }));
};
export default FeatureShowcase;
