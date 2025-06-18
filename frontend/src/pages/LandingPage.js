import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { ChevronRight, Users, Zap, Shield, PlayCircle, CheckCircle, ArrowRight, Smartphone, BarChart3, MessageCircle, Calendar, CreditCard, Sparkles } from 'lucide-react';
const LandingPage = () => {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const testimonials = [
        {
            name: "美容室オーナー A様",
            comment: "予約管理がとても楽になりました。お客様からの問い合わせも一箇所で管理できて便利です。",
            rating: 5
        },
        {
            name: "サロン経営者 B様",
            comment: "シンプルで使いやすい。スタッフもすぐに覚えられました。",
            rating: 4
        },
        {
            name: "ヘアサロン店長 C様",
            comment: "顧客情報の管理が効率的になり、接客の質が向上しました。",
            rating: 5
        }
    ];
    useEffect(() => {
        setIsVisible(true);
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [testimonials.length]);
    // 実際の機能デモ用データ
    const systemFeatures = [
        {
            title: "顧客管理システム",
            description: "顧客情報を一元管理し、過去の来店履歴や好みを記録"
        },
        {
            title: "予約管理システム",
            description: "カレンダー形式で予約状況を視覚的に管理"
        },
        {
            title: "LINE連携機能",
            description: "LINE公式アカウントと連携した予約受付システム"
        }
    ];
    const features = [
        {
            icon: _jsx(MessageCircle, { className: "w-8 h-8" }),
            title: "LINE連携機能",
            description: "LINE公式アカウントと連携した予約受付・顧客対応",
            benefit: "24時間予約受付"
        },
        {
            icon: _jsx(BarChart3, { className: "w-8 h-8" }),
            title: "売上分析機能",
            description: "日次・月次売上データの集計と視覚的な分析",
            benefit: "データ可視化"
        },
        {
            icon: _jsx(Calendar, { className: "w-8 h-8" }),
            title: "予約管理システム",
            description: "カレンダー表示での予約管理とスケジュール調整",
            benefit: "予約管理効率化"
        },
        {
            icon: _jsx(Users, { className: "w-8 h-8" }),
            title: "顧客管理機能",
            description: "顧客情報・来店履歴・施術記録の一元管理",
            benefit: "情報整理"
        },
        {
            icon: _jsx(CreditCard, { className: "w-8 h-8" }),
            title: "売上記録機能",
            description: "日々の売上データ入力と集計機能",
            benefit: "売上管理"
        },
        {
            icon: _jsx(Smartphone, { className: "w-8 h-8" }),
            title: "モバイル対応",
            description: "スマートフォン・タブレットからのアクセス対応",
            benefit: "場所を選ばない"
        }
    ];
    const pricingPlans = [
        {
            name: "ライト",
            price: "¥9,800",
            period: "/月",
            description: "小規模サロン向け",
            features: [
                "基本的な顧客管理",
                "予約管理システム",
                "LINE連携",
                "月次レポート",
                "メール・チャットサポート"
            ],
            popular: false
        },
        {
            name: "スタンダード",
            price: "¥19,800",
            period: "/月",
            description: "成長サロン向け",
            setupFee: "¥30,000（初回導入費）",
            features: [
                "全ライト機能",
                "売上分析機能",
                "顧客セグメント管理",
                "リマインダー機能",
                "優先サポート"
            ],
            popular: true
        },
        {
            name: "プレミアムAI",
            price: "¥39,800",
            period: "/月",
            description: "プロサロン向け",
            features: [
                "全スタンダード機能",
                "高度なAI予測分析",
                "個別マーケティング自動化",
                "売上最適化コンサル",
                "24/7電話サポート",
                "専用アカウントマネージャー"
            ],
            popular: false
        }
    ];
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-b from-gray-900 via-slate-800 to-gray-900 font-mono", children: [_jsxs("div", { className: "relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20" }), _jsx("div", { className: "relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32", children: _jsxs("div", { className: `text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`, children: [_jsxs("div", { className: "inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-700 to-slate-600 rounded text-gray-200 text-sm font-semibold mb-8 border border-gray-600", children: [_jsx(Sparkles, { className: "w-4 h-4 mr-2" }), "PROFESSIONAL SALON MANAGEMENT SYSTEM"] }), _jsxs("h1", { className: "text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight", children: ["\u30B5\u30ED\u30F3\u904B\u55B6\u3092", _jsx("span", { className: "bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent", children: "\u30B9\u30DE\u30FC\u30C8\u5316" }), _jsx("br", {}), "\u3059\u308B\u30D7\u30ED\u30B7\u30B9\u30C6\u30E0"] }), _jsxs("p", { className: "text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed", children: ["\u30C7\u30FC\u30BF\u30C9\u30EA\u30D6\u30F3\u306A\u30B5\u30ED\u30F3\u904B\u55B6\u3092\u5B9F\u73FE\u3002", _jsx("br", {}), _jsx("span", { className: "text-cyan-400 font-semibold", children: "\u30D7\u30ED\u30D5\u30A7\u30C3\u30B7\u30E7\u30CA\u30EB\u30B0\u30EC\u30FC\u30C9" }), "\u306E\u7D71\u5408\u7BA1\u7406\u30D7\u30E9\u30C3\u30C8\u30D5\u30A9\u30FC\u30E0"] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center mb-16", children: [_jsxs("button", { className: "group bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded text-lg font-semibold hover:scale-105 transition-all shadow-xl border border-blue-500", children: [_jsx(PlayCircle, { className: "inline w-5 h-5 mr-2" }), "LIVE DEMO", _jsx(ChevronRight, { className: "inline w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" })] }), _jsx("button", { className: "bg-gray-800/80 backdrop-blur-sm text-gray-200 px-8 py-4 rounded text-lg font-semibold border border-gray-600 hover:bg-gray-700/80 transition-all", children: "FREE TRIAL" })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-12", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl md:text-4xl font-bold text-white mb-2", children: "\uD83D\uDCCA" }), _jsx("div", { className: "text-gray-400", children: "\u58F2\u4E0A\u5206\u6790" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl md:text-4xl font-bold text-white mb-2", children: "\uD83D\uDCC5" }), _jsx("div", { className: "text-gray-400", children: "\u4E88\u7D04\u7BA1\u7406" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl md:text-4xl font-bold text-white mb-2", children: "\uD83D\uDC65" }), _jsx("div", { className: "text-gray-400", children: "\u9867\u5BA2\u7BA1\u7406" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl md:text-4xl font-bold text-white mb-2", children: "\uD83D\uDCAC" }), _jsx("div", { className: "text-gray-400", children: "LINE\u9023\u643A" })] })] }), _jsx("div", { className: "max-w-5xl mx-auto", children: _jsx("img", { src: "/image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.58.02.png", alt: "\u7F8E\u5BB9\u5BA4\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0\u306E\u30E1\u30A4\u30F3\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9", className: "w-full object-contain bg-gray-800 rounded-2xl shadow-2xl" }) })] }) })] }), _jsx("div", { className: "py-20 bg-slate-800", children: _jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h2", { className: "text-4xl font-bold text-white mb-6 tracking-tight", children: "CURRENT CHALLENGES" }), _jsx("p", { className: "text-gray-400 text-lg", children: "\u73FE\u5728\u306E\u30B5\u30ED\u30F3\u904B\u55B6\u3067\u306E\u8AB2\u984C\u3068\u30B7\u30B9\u30C6\u30E0\u5C0E\u5165\u5F8C\u306E\u6539\u5584" })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-8", children: [_jsxs("div", { className: "bg-red-900/10 border border-red-600/40 rounded-lg p-8", children: [_jsx("h3", { className: "text-2xl font-bold text-red-300 mb-4 tracking-wide", children: "CURRENT ISSUES" }), _jsxs("ul", { className: "space-y-3 text-gray-300", children: [_jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-red-300 mr-3 font-bold", children: "\u2717" }), "\u6DF1\u591C\u3084\u4F11\u65E5\u306E\u4E88\u7D04\u3092\u53D6\u308A\u9003\u3057\u3066\u3044\u308B"] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-red-300 mr-3 font-bold", children: "\u2717" }), "\u9867\u5BA2\u60C5\u5831\u306E\u7BA1\u7406\u304C\u624B\u4F5C\u696D\u3067\u5927\u5909"] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-red-300 mr-3 font-bold", children: "\u2717" }), "\u58F2\u4E0A\u5206\u6790\u306B\u6642\u9593\u304C\u304B\u304B\u308A\u3059\u304E\u308B"] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-red-300 mr-3 font-bold", children: "\u2717" }), "\u30EA\u30D4\u30FC\u30C8\u7387\u304C\u601D\u3046\u3088\u3046\u306B\u4E0A\u304C\u3089\u306A\u3044"] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-red-300 mr-3 font-bold", children: "\u2717" }), "\u4E8B\u52D9\u4F5C\u696D\u306B\u8FFD\u308F\u308C\u3066\u63A5\u5BA2\u306B\u96C6\u4E2D\u3067\u304D\u306A\u3044"] })] })] }), _jsxs("div", { className: "bg-blue-900/10 border border-blue-600/40 rounded-lg p-8", children: [_jsx("h3", { className: "text-2xl font-bold text-blue-300 mb-4 tracking-wide", children: "AFTER IMPLEMENTATION" }), _jsxs("ul", { className: "space-y-3 text-gray-300", children: [_jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-blue-400 mr-3 font-bold", children: "\u2713" }), "AI\u304C24\u6642\u9593\u81EA\u52D5\u3067\u4E88\u7D04\u5BFE\u5FDC"] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-blue-400 mr-3 font-bold", children: "\u2713" }), "\u9867\u5BA2\u30C7\u30FC\u30BF\u304C\u81EA\u52D5\u3067\u84C4\u7A4D\u30FB\u5206\u6790"] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-blue-400 mr-3 font-bold", children: "\u2713" }), "\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u3067\u58F2\u4E0A\u72B6\u6CC1\u3092\u628A\u63E1"] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-blue-400 mr-3 font-bold", children: "\u2713" }), "\u500B\u5225\u30A2\u30D7\u30ED\u30FC\u30C1\u3067\u30EA\u30D4\u30FC\u30C8\u7387\u5411\u4E0A"] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-blue-400 mr-3 font-bold", children: "\u2713" }), "\u63A5\u5BA2\u3068\u30B5\u30FC\u30D3\u30B9\u306B\u5C02\u5FF5\u3067\u304D\u308B"] })] })] })] })] }) }), _jsx("div", { className: "py-20 bg-gradient-to-b from-slate-800 to-slate-900", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h2", { className: "text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight", children: "CORE FEATURES" }), _jsx("p", { className: "text-xl text-gray-300", children: "\u30D7\u30ED\u30D5\u30A7\u30C3\u30B7\u30E7\u30CA\u30EB\u30B5\u30ED\u30F3\u306E\u305F\u3081\u306E\u7D71\u5408\u7BA1\u7406\u30BD\u30EA\u30E5\u30FC\u30B7\u30E7\u30F3" })] }), _jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-8", children: features.map((feature, index) => {
                                const imageFiles = [
                                    "/image/スクリーンショット 2025-06-18 23.54.59.png",
                                    "/image/スクリーンショット 2025-06-18 23.55.09.png",
                                    "/image/スクリーンショット 2025-06-18 23.55.30.png",
                                    "/image/スクリーンショット 2025-06-18 23.56.01.png",
                                    "/image/スクリーンショット 2025-06-18 23.56.23.png",
                                    "/image/スクリーンショット 2025-06-18 23.56.39.png"
                                ];
                                return (_jsxs("div", { className: "group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105", children: [_jsx("img", { src: imageFiles[index] || imageFiles[0], alt: `${feature.title}の画面`, className: "w-full h-32 object-contain bg-gray-800 rounded-lg mb-4" }), _jsx("div", { className: "text-cyan-400 mb-4 group-hover:scale-110 transition-transform", children: feature.icon }), _jsx("h3", { className: "text-xl font-bold text-white mb-3", children: feature.title }), _jsx("p", { className: "text-gray-300 mb-4", children: feature.description }), _jsx("div", { className: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-3", children: _jsx("span", { className: "text-cyan-300 font-semibold tracking-wide", children: feature.benefit }) })] }, index));
                            }) })] }) }), _jsx("div", { className: "py-20 bg-slate-900", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h2", { className: "text-4xl md:text-5xl font-bold text-white mb-6", children: "\u5B9F\u969B\u306E\u753B\u9762\u3092\u898B\u308B" }), _jsx("p", { className: "text-xl text-gray-300", children: "\u76F4\u611F\u7684\u3067\u7F8E\u3057\u3044\u30A4\u30F3\u30BF\u30FC\u30D5\u30A7\u30FC\u30B9" })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-12 items-center", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-3xl font-bold text-white mb-6", children: "\u58F2\u4E0A\u5206\u6790\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }), _jsxs("ul", { className: "space-y-4 text-gray-300 mb-8", children: [_jsxs("li", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-400 mr-3" }), "\u65E5\u6B21\u30FB\u6708\u6B21\u58F2\u4E0A\u30C7\u30FC\u30BF\u3092\u8868\u793A"] }), _jsxs("li", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-400 mr-3" }), "\u58F2\u4E0A\u63A8\u79FB\u3092\u30B0\u30E9\u30D5\u3067\u53EF\u8996\u5316"] }), _jsxs("li", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-400 mr-3" }), "\u30B9\u30BF\u30C3\u30D5\u5225\u5B9F\u7E3E\u306E\u7BA1\u7406"] }), _jsxs("li", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-400 mr-3" }), "\u671F\u9593\u5225\u306E\u58F2\u4E0A\u6BD4\u8F03\u6A5F\u80FD"] })] }), _jsxs("button", { className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all", children: ["\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\u3092\u898B\u308B", _jsx(ArrowRight, { className: "inline w-4 h-4 ml-2" })] })] }), _jsx("div", { className: "relative", children: _jsx("img", { src: "/image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.52.38.png", alt: "\u58F2\u4E0A\u5206\u6790\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\u306E\u5B9F\u969B\u306E\u753B\u9762", className: "w-full object-contain bg-gray-800 rounded-2xl shadow-2xl" }) })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-12 items-center mt-20", children: [_jsx("div", { className: "relative md:order-2", children: _jsx("img", { src: "/image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.54.34.png", alt: "LINE\u9023\u643A\u6A5F\u80FD\u306E\u5B9F\u969B\u306E\u753B\u9762", className: "w-full object-contain bg-gray-800 rounded-2xl shadow-2xl" }) }), _jsxs("div", { className: "md:order-1", children: [_jsx("h3", { className: "text-3xl font-bold text-white mb-6", children: "LINE\u9023\u643A\u6A5F\u80FD" }), _jsxs("ul", { className: "space-y-4 text-gray-300 mb-8", children: [_jsxs("li", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-400 mr-3" }), "LINE\u516C\u5F0F\u30A2\u30AB\u30A6\u30F3\u30C8\u3068\u9023\u643A"] }), _jsxs("li", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-400 mr-3" }), "\u4E88\u7D04\u53D7\u4ED8\u30E1\u30C3\u30BB\u30FC\u30B8\u6A5F\u80FD"] }), _jsxs("li", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-400 mr-3" }), "\u30B7\u30B9\u30C6\u30E0\u9023\u643A\u306B\u3088\u308B\u52B9\u7387\u5316"] }), _jsxs("li", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-400 mr-3" }), "48\u6642\u9593\u81EA\u52D5\u5BFE\u5FDC\u30B7\u30B9\u30C6\u30E0"] })] }), _jsxs("button", { className: "bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all", children: ["LINE\u9023\u643A\u3092\u4F53\u9A13", _jsx(ArrowRight, { className: "inline w-4 h-4 ml-2" })] })] })] })] }) }), _jsx("div", { className: "py-20 bg-gradient-to-b from-slate-800 to-slate-900", children: _jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h2", { className: "text-4xl md:text-5xl font-bold text-white mb-6", children: "\u30B7\u30B9\u30C6\u30E0\u306E\u4E3B\u8981\u6A5F\u80FD" }), _jsx("p", { className: "text-xl text-gray-300", children: "\u7F8E\u5BB9\u5BA4\u7D4C\u55B6\u306B\u5FC5\u8981\u306A\u6A5F\u80FD\u3092\u4E00\u3064\u306E\u30B7\u30B9\u30C6\u30E0\u306B\u96C6\u7D04" })] }), _jsxs("div", { className: "grid md:grid-cols-3 gap-8", children: [_jsxs("div", { className: "bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8", children: [_jsx("img", { src: "/image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.52.23.png", alt: "\u9867\u5BA2\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0\u306E\u753B\u9762", className: "w-full h-48 object-contain bg-gray-800 rounded-lg mb-4" }), _jsx("h3", { className: "text-xl font-bold text-white mb-4", children: "\u9867\u5BA2\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0" }), _jsx("p", { className: "text-gray-300", children: "\u9867\u5BA2\u60C5\u5831\u3092\u4E00\u5143\u7BA1\u7406\u3057\u3001\u904E\u53BB\u306E\u6765\u5E97\u5C65\u6B74\u3084\u597D\u307F\u3092\u8A18\u9332" })] }), _jsxs("div", { className: "bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8", children: [_jsx("img", { src: "/image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.53.44.png", alt: "\u4E88\u7D04\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0\u306E\u753B\u9762", className: "w-full h-48 object-contain bg-gray-800 rounded-lg mb-4" }), _jsx("h3", { className: "text-xl font-bold text-white mb-4", children: "\u4E88\u7D04\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0" }), _jsx("p", { className: "text-gray-300", children: "\u30AB\u30EC\u30F3\u30C0\u30FC\u5F62\u5F0F\u3067\u4E88\u7D04\u72B6\u6CC1\u3092\u8996\u899A\u7684\u306B\u7BA1\u7406" })] }), _jsxs("div", { className: "bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8", children: [_jsx("img", { src: "/image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.54.17.png", alt: "LINE\u9023\u643A\u6A5F\u80FD\u306E\u753B\u9762", className: "w-full h-48 object-contain bg-gray-800 rounded-lg mb-4" }), _jsx("h3", { className: "text-xl font-bold text-white mb-4", children: "LINE\u9023\u643A\u6A5F\u80FD" }), _jsx("p", { className: "text-gray-300", children: "LINE\u516C\u5F0F\u30A2\u30AB\u30A6\u30F3\u30C8\u3068\u9023\u643A\u3057\u305F\u4E88\u7D04\u53D7\u4ED8\u30B7\u30B9\u30C6\u30E0" })] }), _jsxs("div", { className: "bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8", children: [_jsx("img", { src: "/image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.56.49.png", alt: "\u8A2D\u5B9A\u7BA1\u7406\u6A5F\u80FD\u306E\u753B\u9762", className: "w-full h-48 object-contain bg-gray-800 rounded-lg mb-4" }), _jsx("h3", { className: "text-xl font-bold text-white mb-4", children: "\u8A2D\u5B9A\u7BA1\u7406\u6A5F\u80FD" }), _jsx("p", { className: "text-gray-300", children: "\u30B7\u30B9\u30C6\u30E0\u306E\u5404\u7A2E\u8A2D\u5B9A\u3084\u30AB\u30B9\u30BF\u30DE\u30A4\u30BA\u304C\u7C21\u5358\u306B\u53EF\u80FD" })] }), _jsxs("div", { className: "bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8", children: [_jsx("img", { src: "/image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.57.02.png", alt: "\u30E6\u30FC\u30B6\u30FC\u7BA1\u7406\u6A5F\u80FD\u306E\u753B\u9762", className: "w-full h-48 object-contain bg-gray-800 rounded-lg mb-4" }), _jsx("h3", { className: "text-xl font-bold text-white mb-4", children: "\u30E6\u30FC\u30B6\u30FC\u7BA1\u7406\u6A5F\u80FD" }), _jsx("p", { className: "text-gray-300", children: "\u30B9\u30BF\u30C3\u30D5\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u7BA1\u7406\u3084\u6A29\u9650\u8A2D\u5B9A\u306E\u7BA1\u7406" })] }), _jsxs("div", { className: "bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8", children: [_jsx("img", { src: "/image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.57.17.png", alt: "\u30E2\u30D0\u30A4\u30EB\u5BFE\u5FDC\u753B\u9762", className: "w-full h-48 object-contain bg-gray-800 rounded-lg mb-4" }), _jsx("h3", { className: "text-xl font-bold text-white mb-4", children: "\u30E2\u30D0\u30A4\u30EB\u5BFE\u5FDC" }), _jsx("p", { className: "text-gray-300", children: "\u30B9\u30DE\u30FC\u30C8\u30D5\u30A9\u30F3\u30FB\u30BF\u30D6\u30EC\u30C3\u30C8\u3067\u306E\u64CD\u4F5C\u306B\u6700\u9069\u5316" })] })] })] }) }), _jsx("div", { className: "py-20 bg-slate-900", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h2", { className: "text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight", children: "PRICING PLANS" }), _jsx("p", { className: "text-xl text-gray-300", children: "\u30B9\u30B1\u30FC\u30E9\u30D6\u30EB\u306A\u6599\u91D1\u4F53\u7CFB\u3067\u30D3\u30B8\u30CD\u30B9\u6210\u9577\u3092\u30B5\u30DD\u30FC\u30C8" })] }), _jsx("div", { className: "grid md:grid-cols-3 gap-8", children: pricingPlans.map((plan, index) => (_jsxs("div", { className: `relative bg-white/5 backdrop-blur-sm border rounded-2xl p-8 transition-all hover:scale-105 ${plan.popular
                                    ? 'border-blue-500 bg-gradient-to-b from-blue-500/10 to-cyan-500/10'
                                    : 'border-white/10'}`, children: [plan.popular && (_jsx("div", { className: "absolute -top-4 left-1/2 transform -translate-x-1/2", children: _jsx("div", { className: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded text-sm font-bold tracking-wide", children: "POPULAR" }) })), _jsxs("div", { className: "text-center mb-8", children: [_jsx("h3", { className: "text-2xl font-bold text-white mb-2", children: plan.name }), _jsx("p", { className: "text-gray-400 mb-4", children: plan.description }), _jsxs("div", { className: "text-4xl font-bold text-white", children: [plan.price, _jsx("span", { className: "text-lg text-gray-400", children: plan.period })] }), plan.setupFee && (_jsx("div", { className: "text-sm text-orange-400 mt-2", children: plan.setupFee }))] }), _jsx("ul", { className: "space-y-3 mb-8", children: plan.features.map((feature, featureIndex) => (_jsxs("li", { className: "flex items-center text-gray-300", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-400 mr-3" }), feature] }, featureIndex))) }), _jsx("button", { className: `w-full py-3 rounded-lg font-semibold transition-all ${plan.popular
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105'
                                            : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`, children: "30\u65E5\u9593\u7121\u6599\u3067\u59CB\u3081\u308B" })] }, index))) }), _jsxs("div", { className: "text-center mt-12", children: [_jsx("p", { className: "text-gray-400 mb-4", children: "\u203B \u30E9\u30A4\u30C8\u30FB\u30D7\u30EC\u30DF\u30A2\u30E0\u30D7\u30E9\u30F3\u306F\u521D\u671F\u8CBB\u7528\u7121\u6599\u3001\u3044\u3064\u3067\u3082\u89E3\u7D04\u53EF\u80FD" }), _jsx("p", { className: "text-purple-400 font-bold", children: "\uD83D\uDCA1 30\u65E5\u9593\u306E\u7121\u6599\u30C8\u30E9\u30A4\u30A2\u30EB\u3067\u30B7\u30B9\u30C6\u30E0\u3092\u304A\u8A66\u3057\u304F\u3060\u3055\u3044" }), _jsx("div", { className: "mt-8 max-w-3xl mx-auto", children: _jsx("img", { src: "/image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.58.26.png", alt: "\u6599\u91D1\u30D7\u30E9\u30F3\u306E\u8A73\u7D30\u8868\u793A", className: "w-full rounded-2xl shadow-xl" }) })] })] }) }), _jsx("div", { className: "py-20 bg-slate-800", children: _jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center", children: [_jsx("h2", { className: "text-3xl font-bold text-white mb-8", children: "\u30B7\u30B9\u30C6\u30E0\u3078\u306E\u30A2\u30AF\u30BB\u30B9\u306F\u7C21\u5358" }), _jsx("img", { src: "/image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.58.36.png", alt: "\u30B7\u30B9\u30C6\u30E0\u30ED\u30B0\u30A4\u30F3\u753B\u9762", className: "w-full max-w-2xl mx-auto rounded-2xl shadow-2xl" })] }) }), _jsx("div", { className: "py-20 bg-gradient-to-r from-blue-600 to-cyan-600 border-t border-blue-500", children: _jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center", children: [_jsx("h2", { className: "text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight", children: "START YOUR DIGITAL TRANSFORMATION" }), _jsx("p", { className: "text-xl text-blue-100 mb-8", children: "\u30D7\u30ED\u30D5\u30A7\u30C3\u30B7\u30E7\u30CA\u30EB\u30B5\u30DD\u30FC\u30C8\u4ED8\u304D\u3067\u30B9\u30E0\u30FC\u30BA\u306A\u5C0E\u5165\u3092\u5B9F\u73FE" }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center mb-8", children: [_jsxs("button", { className: "group bg-white text-blue-600 px-8 py-4 rounded text-lg font-bold hover:scale-105 transition-all shadow-2xl border border-white", children: [_jsx(Zap, { className: "inline w-5 h-5 mr-2" }), "START FREE TRIAL", _jsx(ArrowRight, { className: "inline w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" })] }), _jsxs("button", { className: "bg-blue-800/60 backdrop-blur-sm text-white px-8 py-4 rounded text-lg font-semibold border border-blue-400/50 hover:bg-blue-700/60 transition-all", children: [_jsx(PlayCircle, { className: "inline w-5 h-5 mr-2" }), "BOOK DEMO"] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row justify-center items-center gap-6 text-blue-100", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Shield, { className: "w-5 h-5 mr-2" }), "30\u65E5\u9593\u7121\u6599"] }), _jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-5 h-5 mr-2" }), "\u521D\u671F\u8CBB\u75280\u5186"] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-5 h-5 mr-2" }), "\u5C02\u4EFB\u30B5\u30DD\u30FC\u30C8\u4ED8\u304D"] })] })] }) }), _jsx("footer", { className: "bg-slate-900 border-t border-slate-800 py-12", children: _jsx("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-2xl font-bold text-white mb-4", children: "\u7F8E\u5BB9\u5BA4\u7D71\u5408\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0" }), _jsx("p", { className: "text-gray-400 mb-8", children: "\u9867\u5BA2\u7BA1\u7406\u30FB\u4E88\u7D04\u7BA1\u7406\u30FB\u58F2\u4E0A\u5206\u6790\u3092\u7D71\u5408\u3057\u305F\u7F8E\u5BB9\u5BA4\u7D4C\u55B6\u30B7\u30B9\u30C6\u30E0" }), _jsxs("div", { className: "flex justify-center space-x-8 text-gray-400", children: [_jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "\u5229\u7528\u898F\u7D04" }), _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "\u30D7\u30E9\u30A4\u30D0\u30B7\u30FC\u30DD\u30EA\u30B7\u30FC" }), _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "\u30B5\u30DD\u30FC\u30C8" }), _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "\u304A\u554F\u3044\u5408\u308F\u305B" })] }), _jsx("div", { className: "mt-8 pt-8 border-t border-slate-800", children: _jsx("p", { className: "text-gray-500", children: "\u00A9 2024 \u7F8E\u5BB9\u5BA4\u7D71\u5408\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0. All rights reserved." }) })] }) }) })] }));
};
export default LandingPage;
