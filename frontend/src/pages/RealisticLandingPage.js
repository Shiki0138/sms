import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Calendar, MessageSquare, Users, BarChart3, Settings, Shield, CheckCircle, Star, Menu, X, Eye, Scissors, FileText } from 'lucide-react';
const RealisticLandingPage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const features = [
        {
            icon: _jsx(MessageSquare, { className: "w-8 h-8 text-slate-400" }),
            title: "統合メッセージ管理",
            description: "LINE・Instagram・メールを一箇所で管理。顧客との連絡を効率化します。",
            screenshots: [
                "./image/スクリーンショット 2025-06-18 23.52.38.png",
                "./image/スクリーンショット 2025-06-18 23.53.44.png",
                "./image/スクリーンショット 2025-06-18 23.54.17.png",
                "./image/スクリーンショット 2025-06-18 23.54.34.png"
            ],
            details: [
                "複数SNS統合管理",
                "フィルタリング機能",
                "テンプレート送信",
                "一斉送信対応"
            ]
        },
        {
            icon: _jsx(Calendar, { className: "w-8 h-8 text-slate-400" }),
            title: "予約管理システム",
            description: "カレンダー形式での直感的な予約管理。新規作成から詳細設定まで。",
            screenshots: [
                "./image/スクリーンショット 2025-06-18 23.54.59.png",
                "./image/スクリーンショット 2025-06-18 23.55.09.png"
            ],
            details: [
                "週間カレンダー表示",
                "新規予約フォーム",
                "メニュー選択機能",
                "時間管理"
            ]
        },
        {
            icon: _jsx(Users, { className: "w-8 h-8 text-slate-400" }),
            title: "顧客情報・履歴管理",
            description: "詳細な顧客プロフィールと施術履歴を一元管理。",
            screenshots: [
                "./image/スクリーンショット 2025-06-18 23.55.30.png",
                "./image/スクリーンショット 2025-06-18 23.56.01.png"
            ],
            details: [
                "顧客詳細情報",
                "来店履歴管理",
                "施術記録",
                "写真管理機能"
            ]
        },
        {
            icon: _jsx(BarChart3, { className: "w-8 h-8 text-slate-400" }),
            title: "分析ダッシュボード",
            description: "顧客データと売上を視覚的に分析。経営判断をサポートします。",
            screenshots: [
                "./image/スクリーンショット 2025-06-18 23.56.23.png"
            ],
            details: [
                "顧客セグメント分析",
                "来店頻度グラフ",
                "売上データ表示",
                "リピート率計算"
            ]
        },
        {
            icon: _jsx(Scissors, { className: "w-8 h-8 text-slate-400" }),
            title: "メニュー・設定管理",
            description: "サービスメニューから各種設定まで、運営に必要な機能を集約。",
            screenshots: [
                "./image/スクリーンショット 2025-06-18 23.56.39.png",
                "./image/スクリーンショット 2025-06-18 23.56.49.png",
                "./image/スクリーンショット 2025-06-18 23.57.02.png"
            ],
            details: [
                "メニュー価格設定",
                "機能改善要望",
                "営業時間設定",
                "プラン管理"
            ]
        },
        {
            icon: _jsx(Settings, { className: "w-8 h-8 text-slate-400" }),
            title: "外部連携・データ管理",
            description: "外部サービス連携とデータインポート機能で業務を効率化。",
            screenshots: [
                "./image/スクリーンショット 2025-06-18 23.57.17.png",
                "./image/スクリーンショット 2025-06-18 23.58.02.png",
                "./image/スクリーンショット 2025-06-18 23.58.26.png",
                "./image/スクリーンショット 2025-06-18 23.58.36.png"
            ],
            details: [
                "自動リマインド設定",
                "LINE/Instagram API",
                "Google Calendar連携",
                "CSVインポート"
            ]
        }
    ];
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
    return (_jsxs("div", { className: "min-h-screen bg-white", children: [_jsx("header", { className: "bg-gray-900 shadow-sm border-b border-slate-700", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "flex justify-between items-center py-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Shield, { className: "w-8 h-8 text-slate-400 mr-2" }), _jsx("h1", { className: "text-xl font-bold text-white", children: "\u7F8E\u5BB9\u5BA4\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0" })] }), _jsxs("nav", { className: "hidden md:flex space-x-6", children: [_jsx("a", { href: "#features", className: "text-gray-300 hover:text-white", children: "\u6A5F\u80FD" }), _jsx("a", { href: "#testimonials", className: "text-gray-300 hover:text-white", children: "\u5C0E\u5165\u4E8B\u4F8B" }), _jsx("a", { href: "#contact", className: "text-gray-300 hover:text-white", children: "\u304A\u554F\u3044\u5408\u308F\u305B" })] }), _jsx("button", { className: "md:hidden", onClick: () => setShowMobileMenu(!showMobileMenu), children: showMobileMenu ? _jsx(X, { className: "w-6 h-6 text-white" }) : _jsx(Menu, { className: "w-6 h-6 text-white" }) })] }), showMobileMenu && (_jsx("div", { className: "md:hidden py-4 border-t border-slate-700", children: _jsxs("nav", { className: "flex flex-col space-y-4", children: [_jsx("a", { href: "#features", className: "text-gray-300", children: "\u6A5F\u80FD" }), _jsx("a", { href: "#testimonials", className: "text-gray-300", children: "\u5C0E\u5165\u4E8B\u4F8B" }), _jsx("a", { href: "#contact", className: "text-gray-300", children: "\u304A\u554F\u3044\u5408\u308F\u305B" })] }) }))] }) }), _jsx("section", { className: "bg-gray-900 py-12 sm:py-20", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "text-center", children: [_jsxs("h2", { className: "text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6", children: ["\u7F8E\u5BB9\u5BA4\u7D4C\u55B6\u3092", _jsx("span", { className: "text-slate-300", children: "\u30B7\u30F3\u30D7\u30EB\u306B" })] }), _jsxs("p", { className: "text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto", children: ["\u4E88\u7D04\u7BA1\u7406\u3001\u9867\u5BA2\u7BA1\u7406\u3001\u30E1\u30C3\u30BB\u30FC\u30B8\u5BFE\u5FDC\u3092\u4E00\u3064\u306E\u30B7\u30B9\u30C6\u30E0\u3067\u3002", _jsx("br", { className: "hidden sm:block" }), "\u7F8E\u5BB9\u5BA4\u306E\u65E5\u5E38\u696D\u52D9\u3092\u30B5\u30DD\u30FC\u30C8\u3059\u308B\u5B9F\u7528\u7684\u306A\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0\u3067\u3059\u3002"] }), _jsxs("div", { className: "mb-8", children: [_jsx("img", { src: "./image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.52.23.png", alt: "\u30ED\u30B0\u30A4\u30F3\u753B\u9762", className: "mx-auto rounded-lg shadow-lg max-w-full h-auto", style: { maxWidth: '500px' } }), _jsx("p", { className: "text-sm text-gray-400 mt-2", children: "\u5B9F\u969B\u306E\u30B7\u30B9\u30C6\u30E0\u753B\u9762\uFF08\u30ED\u30B0\u30A4\u30F3\uFF09" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center items-center", children: [_jsxs("button", { className: "bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center", children: [_jsx(Eye, { className: "w-5 h-5 mr-2" }), "\u30C7\u30E2\u3092\u898B\u308B"] }), _jsx("button", { className: "border border-slate-500 hover:border-slate-400 text-slate-300 font-medium py-3 px-8 rounded-lg transition-colors", children: "\u8CC7\u6599\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9" })] }), _jsxs("div", { className: "mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-slate-300", children: "\u30B7\u30F3\u30D7\u30EB" }), _jsx("div", { className: "text-sm text-gray-400", children: "\u76F4\u611F\u7684\u306A\u64CD\u4F5C" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-slate-300", children: "\u7D71\u5408\u7BA1\u7406" }), _jsx("div", { className: "text-sm text-gray-400", children: "\u4E00\u5143\u7684\u306A\u60C5\u5831\u7BA1\u7406" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-slate-300", children: "\u5B9F\u7528\u7684" }), _jsx("div", { className: "text-sm text-gray-400", children: "\u7F8E\u5BB9\u5BA4\u306E\u5B9F\u52D9\u306B\u7279\u5316" })] })] })] }) }) }), _jsx("section", { id: "features", className: "py-16 bg-slate-800", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h3", { className: "text-3xl font-bold text-white mb-4", children: "\u7F8E\u5BB9\u5BA4\u306E\u696D\u52D9\u3092\u30B5\u30DD\u30FC\u30C8\u3059\u308B\u6A5F\u80FD" }), _jsx("p", { className: "text-lg text-gray-300 max-w-2xl mx-auto", children: "\u65E5\u3005\u306E\u4E88\u7D04\u7BA1\u7406\u304B\u3089\u9867\u5BA2\u5BFE\u5FDC\u307E\u3067\u3001\u5B9F\u969B\u306B\u4F7F\u3048\u308B\u6A5F\u80FD\u3092\u642D\u8F09" })] }), _jsx("div", { className: "mb-8", children: _jsx("div", { className: "flex flex-wrap justify-center gap-2", children: features.map((feature, index) => (_jsx("button", { onClick: () => setActiveTab(index), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === index
                                        ? 'bg-slate-600 text-white'
                                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`, children: feature.title }, index))) }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 items-center", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center mb-4", children: [features[activeTab].icon, _jsx("h4", { className: "text-2xl font-bold text-white ml-3", children: features[activeTab].title })] }), _jsx("p", { className: "text-gray-300 mb-6 text-lg", children: features[activeTab].description }), _jsx("ul", { className: "space-y-3", children: features[activeTab].details.map((detail, index) => (_jsxs("li", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-500 mr-3 flex-shrink-0" }), _jsx("span", { className: "text-gray-300", children: detail })] }, index))) })] }), _jsxs("div", { className: "lg:order-last", children: [_jsx("div", { className: "space-y-4", children: features[activeTab].screenshots.map((screenshot, index) => (_jsx("div", { children: _jsx("img", { src: screenshot, alt: `${features[activeTab].title} - 画面${index + 1}`, className: "rounded-lg shadow-lg w-full h-auto" }) }, index))) }), _jsxs("p", { className: "text-sm text-gray-400 mt-4 text-center", children: ["\u5B9F\u969B\u306E\u30B7\u30B9\u30C6\u30E0\u753B\u9762\uFF08\u5168", features[activeTab].screenshots.length, "\u679A\uFF09"] })] })] })] }) }), _jsx("section", { className: "py-16 bg-gray-900", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h3", { className: "text-3xl font-bold text-white mb-4", children: "\u5B9F\u969B\u306E\u30B7\u30B9\u30C6\u30E0\u753B\u9762" }), _jsx("p", { className: "text-lg text-gray-300 max-w-2xl mx-auto", children: "\u5C0E\u5165\u524D\u306B\u3059\u3079\u3066\u306E\u6A5F\u80FD\u3092\u78BA\u8A8D\u3044\u305F\u3060\u3051\u307E\u3059\u3002\u5B9F\u969B\u306E\u64CD\u4F5C\u753B\u9762\u3092\u3054\u89A7\u304F\u3060\u3055\u3044\u3002" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-slate-800 rounded-lg p-4 border border-slate-700", children: [_jsx("img", { src: "./image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.52.23.png", alt: "\u30ED\u30B0\u30A4\u30F3\u753B\u9762", className: "w-full h-auto rounded-lg shadow-md mb-3" }), _jsx("h4", { className: "font-medium text-white mb-1", children: "\u30ED\u30B0\u30A4\u30F3\u753B\u9762" }), _jsx("p", { className: "text-sm text-gray-400", children: "\u30C7\u30E2\u30A2\u30AB\u30A6\u30F3\u30C8\u5B8C\u5099" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-4 border border-slate-700", children: [_jsx("img", { src: "./image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.52.38.png", alt: "\u30E1\u30C3\u30BB\u30FC\u30B8\u7BA1\u7406", className: "w-full h-auto rounded-lg shadow-md mb-3" }), _jsx("h4", { className: "font-medium text-white mb-1", children: "\u30E1\u30C3\u30BB\u30FC\u30B8\u7BA1\u7406" }), _jsx("p", { className: "text-sm text-gray-400", children: "LINE\u30FBInstagram\u7D71\u5408" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-4 border border-slate-700", children: [_jsx("img", { src: "./image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.53.44.png", alt: "\u9867\u5BA2\u30D5\u30A3\u30EB\u30BF\u30EA\u30F3\u30B0", className: "w-full h-auto rounded-lg shadow-md mb-3" }), _jsx("h4", { className: "font-medium text-white mb-1", children: "\u9867\u5BA2\u30D5\u30A3\u30EB\u30BF\u30EA\u30F3\u30B0" }), _jsx("p", { className: "text-sm text-gray-400", children: "\u6765\u5E97\u983B\u5EA6\u5225\u7D5E\u308A\u8FBC\u307F" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-4 border border-slate-700", children: [_jsx("img", { src: "./image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.54.17.png", alt: "\u30E1\u30C3\u30BB\u30FC\u30B8\u4F5C\u6210", className: "w-full h-auto rounded-lg shadow-md mb-3" }), _jsx("h4", { className: "font-medium text-white mb-1", children: "\u30E1\u30C3\u30BB\u30FC\u30B8\u4F5C\u6210" }), _jsx("p", { className: "text-sm text-gray-400", children: "\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u6A5F\u80FD" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-4 border border-slate-700", children: [_jsx("img", { src: "./image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.54.34.png", alt: "\u9001\u4FE1\u78BA\u8A8D", className: "w-full h-auto rounded-lg shadow-md mb-3" }), _jsx("h4", { className: "font-medium text-white mb-1", children: "\u9001\u4FE1\u78BA\u8A8D" }), _jsx("p", { className: "text-sm text-gray-400", children: "\u5BFE\u8C61\u9867\u5BA2\u30FB\u9001\u4FE1\u65B9\u6CD5\u78BA\u8A8D" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-4 border border-slate-700", children: [_jsx("img", { src: "./image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.54.59.png", alt: "\u4E88\u7D04\u7BA1\u7406", className: "w-full h-auto rounded-lg shadow-md mb-3" }), _jsx("h4", { className: "font-medium text-white mb-1", children: "\u4E88\u7D04\u7BA1\u7406" }), _jsx("p", { className: "text-sm text-gray-400", children: "\u30AB\u30EC\u30F3\u30C0\u30FC\u5F62\u5F0F" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-4 border border-slate-700", children: [_jsx("img", { src: "./image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.55.09.png", alt: "\u65B0\u898F\u4E88\u7D04\u4F5C\u6210", className: "w-full h-auto rounded-lg shadow-md mb-3" }), _jsx("h4", { className: "font-medium text-white mb-1", children: "\u65B0\u898F\u4E88\u7D04\u4F5C\u6210" }), _jsx("p", { className: "text-sm text-gray-400", children: "\u8A73\u7D30\u30D5\u30A9\u30FC\u30E0" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-4 border border-slate-700", children: [_jsx("img", { src: "./image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.55.30.png", alt: "\u9867\u5BA2\u8A73\u7D30", className: "w-full h-auto rounded-lg shadow-md mb-3" }), _jsx("h4", { className: "font-medium text-white mb-1", children: "\u9867\u5BA2\u8A73\u7D30" }), _jsx("p", { className: "text-sm text-gray-400", children: "\u57FA\u672C\u60C5\u5831\u30FB\u6765\u5E97\u5C65\u6B74" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-4 border border-slate-700", children: [_jsx("img", { src: "./image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.56.01.png", alt: "\u65BD\u8853\u5C65\u6B74", className: "w-full h-auto rounded-lg shadow-md mb-3" }), _jsx("h4", { className: "font-medium text-white mb-1", children: "\u65BD\u8853\u5C65\u6B74" }), _jsx("p", { className: "text-sm text-gray-400", children: "\u8A73\u7D30\u8A18\u9332\u30FB\u5199\u771F\u7BA1\u7406" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-4 border border-slate-700", children: [_jsx("img", { src: "./image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.56.23.png", alt: "\u5206\u6790\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9", className: "w-full h-auto rounded-lg shadow-md mb-3" }), _jsx("h4", { className: "font-medium text-white mb-1", children: "\u5206\u6790\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }), _jsx("p", { className: "text-sm text-gray-400", children: "\u9867\u5BA2\u30BB\u30B0\u30E1\u30F3\u30C8\u30FB\u58F2\u4E0A" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-4 border border-slate-700", children: [_jsx("img", { src: "./image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.56.39.png", alt: "\u30E1\u30CB\u30E5\u30FC\u7BA1\u7406", className: "w-full h-auto rounded-lg shadow-md mb-3" }), _jsx("h4", { className: "font-medium text-white mb-1", children: "\u30E1\u30CB\u30E5\u30FC\u7BA1\u7406" }), _jsx("p", { className: "text-sm text-gray-400", children: "\u4FA1\u683C\u30FB\u6642\u9593\u8A2D\u5B9A" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-4 border border-slate-700", children: [_jsx("img", { src: "./image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.56.49.png", alt: "\u6A5F\u80FD\u6539\u5584\u8981\u671B", className: "w-full h-auto rounded-lg shadow-md mb-3" }), _jsx("h4", { className: "font-medium text-white mb-1", children: "\u6A5F\u80FD\u6539\u5584\u8981\u671B" }), _jsx("p", { className: "text-sm text-gray-400", children: "\u30E6\u30FC\u30B6\u30FC\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-4 border border-slate-700", children: [_jsx("img", { src: "./image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.57.02.png", alt: "\u8A2D\u5B9A\u753B\u9762", className: "w-full h-auto rounded-lg shadow-md mb-3" }), _jsx("h4", { className: "font-medium text-white mb-1", children: "\u8A2D\u5B9A\u753B\u9762" }), _jsx("p", { className: "text-sm text-gray-400", children: "\u55B6\u696D\u6642\u9593\u30FB\u4F11\u65E5\u8A2D\u5B9A" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-4 border border-slate-700", children: [_jsx("img", { src: "./image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.57.17.png", alt: "\u81EA\u52D5\u30EA\u30DE\u30A4\u30F3\u30C9\u8A2D\u5B9A", className: "w-full h-auto rounded-lg shadow-md mb-3" }), _jsx("h4", { className: "font-medium text-white mb-1", children: "\u81EA\u52D5\u30EA\u30DE\u30A4\u30F3\u30C9\u8A2D\u5B9A" }), _jsx("p", { className: "text-sm text-gray-400", children: "\u30E1\u30FC\u30EB\u30FBLINE\u901A\u77E5" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-4 border border-slate-700", children: [_jsx("img", { src: "./image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.58.02.png", alt: "\u5916\u90E8API\u9023\u643A", className: "w-full h-auto rounded-lg shadow-md mb-3" }), _jsx("h4", { className: "font-medium text-white mb-1", children: "\u5916\u90E8API\u9023\u643A" }), _jsx("p", { className: "text-sm text-gray-400", children: "LINE\u30FBInstagram\u8A2D\u5B9A" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-4 border border-slate-700", children: [_jsx("img", { src: "./image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.58.26.png", alt: "\u30AB\u30EC\u30F3\u30C0\u30FC\u9023\u643A", className: "w-full h-auto rounded-lg shadow-md mb-3" }), _jsx("h4", { className: "font-medium text-white mb-1", children: "Google Calendar\u9023\u643A" }), _jsx("p", { className: "text-sm text-gray-400", children: "\u53CC\u65B9\u5411\u540C\u671F\u6A5F\u80FD" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-4 border border-slate-700", children: [_jsx("img", { src: "./image/\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8 2025-06-18 23.58.36.png", alt: "\u30C7\u30FC\u30BF\u30A4\u30F3\u30DD\u30FC\u30C8", className: "w-full h-auto rounded-lg shadow-md mb-3" }), _jsx("h4", { className: "font-medium text-white mb-1", children: "CSV\u30A4\u30F3\u30DD\u30FC\u30C8" }), _jsx("p", { className: "text-sm text-gray-400", children: "\u65E2\u5B58\u30C7\u30FC\u30BF\u79FB\u884C" })] })] }), _jsx("div", { className: "text-center mt-8", children: _jsx("p", { className: "text-gray-300", children: "\u516817\u753B\u9762 - \u5B9F\u969B\u306E\u30B7\u30B9\u30C6\u30E0\u3067\u3059\u3079\u3066\u306E\u6A5F\u80FD\u3092\u3054\u78BA\u8A8D\u3044\u305F\u3060\u3051\u307E\u3059" }) })] }) }), _jsx("section", { id: "testimonials", className: "py-16 bg-slate-800", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsx("div", { className: "text-center mb-12", children: _jsx("h3", { className: "text-3xl font-bold text-white mb-4", children: "\u3054\u5229\u7528\u3044\u305F\u3060\u3044\u3066\u3044\u308B\u30B5\u30ED\u30F3\u306E\u58F0" }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: testimonials.map((testimonial, index) => (_jsxs("div", { className: "bg-gray-900 rounded-lg p-6 border border-slate-700", children: [_jsx("div", { className: "flex items-center mb-4", children: [...Array(testimonial.rating)].map((_, i) => (_jsx(Star, { className: "w-5 h-5 text-yellow-400 fill-current" }, i))) }), _jsxs("p", { className: "text-gray-300 mb-4 italic", children: ["\"", testimonial.comment, "\""] }), _jsx("p", { className: "text-white font-medium", children: testimonial.name })] }, index))) })] }) }), _jsx("section", { id: "contact", className: "py-16 bg-slate-900", children: _jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center", children: [_jsx("h3", { className: "text-3xl font-bold text-white mb-4", children: "\u307E\u305A\u306F\u30C7\u30E2\u3067\u304A\u8A66\u3057\u304F\u3060\u3055\u3044" }), _jsx("p", { className: "text-gray-300 mb-8 text-lg", children: "\u5B9F\u969B\u306E\u6A5F\u80FD\u3092\u3054\u78BA\u8A8D\u3044\u305F\u3060\u3051\u307E\u3059\u3002\u304A\u6C17\u8EFD\u306B\u304A\u554F\u3044\u5408\u308F\u305B\u304F\u3060\u3055\u3044\u3002" }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsxs("button", { className: "bg-slate-700 text-white font-medium py-3 px-8 rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center", children: [_jsx(Calendar, { className: "w-5 h-5 mr-2" }), "\u30C7\u30E2\u4E88\u7D04"] }), _jsxs("button", { className: "border border-slate-500 text-slate-300 font-medium py-3 px-8 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center", children: [_jsx(FileText, { className: "w-5 h-5 mr-2" }), "\u8CC7\u6599\u8ACB\u6C42"] })] }), _jsx("div", { className: "mt-8 text-gray-400 text-sm", children: _jsx("p", { children: "\u5C0E\u5165\u76F8\u8AC7\u30FB\u64CD\u4F5C\u8AAC\u660E\u3082\u627F\u3063\u3066\u304A\u308A\u307E\u3059" }) })] }) }), _jsx("footer", { className: "bg-black text-gray-400 py-8", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "flex items-center justify-center mb-4", children: [_jsx(Shield, { className: "w-6 h-6 text-slate-500 mr-2" }), _jsx("span", { className: "font-bold text-white", children: "\u7F8E\u5BB9\u5BA4\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0" })] }), _jsx("p", { className: "text-sm", children: "\u7F8E\u5BB9\u5BA4\u306E\u696D\u52D9\u52B9\u7387\u5316\u3092\u30B5\u30DD\u30FC\u30C8\u3059\u308B\u5B9F\u7528\u7684\u306A\u30B7\u30B9\u30C6\u30E0" })] }) }) })] }));
};
export default RealisticLandingPage;
