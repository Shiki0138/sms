import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Crown, Sparkles, Star, Shield, Clock, Users, ChevronRight, Zap, TrendingUp, Award, ArrowRight, Calendar, Heart, MessageSquare, BarChart3, Smartphone, Eye, Diamond } from 'lucide-react';
const PremiumLandingPage = () => {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [remainingSlots, setRemainingSlots] = useState(7); // 残り枠数
    const [timeLeft, setTimeLeft] = useState(72); // 残り時間（時間）
    // カウントダウンタイマー
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 3600000); // 1時間ごと
        return () => clearInterval(timer);
    }, []);
    // お客様の声の自動切り替え
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);
    const testimonials = [
        {
            name: "田中美容室 オーナー",
            text: "売上が3ヶ月で40%アップ！予約管理が劇的に楽になりました",
            rating: 5,
            avatar: "👩‍💼"
        },
        {
            name: "SALON TOKYO 店長",
            text: "顧客満足度が95%に向上。AIの予測機能が素晴らしい",
            rating: 5,
            avatar: "🧑‍💼"
        },
        {
            name: "Hair Studio M 代表",
            text: "スタッフの効率が2倍に。もう手放せません",
            rating: 5,
            avatar: "👨‍💼"
        }
    ];
    const features = [
        {
            icon: _jsx(Crown, { className: "w-8 h-8 text-yellow-500" }),
            title: "プレミアムAI分析",
            description: "業界最先端のAIが顧客行動を予測し、売上最適化を実現"
        },
        {
            icon: _jsx(Zap, { className: "w-8 h-8 text-blue-500" }),
            title: "リアルタイム同期",
            description: "LINE・Instagram・予約サイトを完全統合管理"
        },
        {
            icon: _jsx(Shield, { className: "w-8 h-8 text-green-500" }),
            title: "エンタープライズ級セキュリティ",
            description: "銀行レベルの暗号化で顧客情報を完全保護"
        },
        {
            icon: _jsx(TrendingUp, { className: "w-8 h-8 text-purple-500" }),
            title: "売上予測エンジン",
            description: "3ヶ月先の売上を95%の精度で予測"
        }
    ];
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900", children: [_jsxs("section", { className: "relative overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0", children: [_jsx("div", { className: "absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" }), _jsx("div", { className: "absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" }), _jsx("div", { className: "absolute bottom-20 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" })] }), _jsxs("div", { className: "relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsxs("div", { className: "inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-6 py-2 rounded-full text-sm sm:text-base animate-pulse shadow-lg", children: [_jsx(Crown, { className: "w-5 h-5 mr-2" }), "\uD83D\uDD25 \u9650\u5B9A20\u540D\u69D8 \u7279\u5225\u5148\u884C\u4F53\u9A13 \uD83D\uDD25"] }), _jsxs("div", { className: "mt-2 text-yellow-300 text-sm font-medium", children: ["\u6B8B\u308A ", remainingSlots, " \u67A0 | \u3042\u3068 ", timeLeft, " \u6642\u9593\u3067\u7DE0\u5207"] })] }), _jsxs("div", { className: "text-center mb-12", children: [_jsxs("h1", { className: "text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight", children: [_jsx("span", { className: "bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent", children: "\u9769\u547D\u7684AI\u7F8E\u5BB9\u5BA4" }), _jsx("br", {}), _jsx("span", { className: "text-white", children: "\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0" })] }), _jsxs("p", { className: "text-xl sm:text-2xl lg:text-3xl text-gray-300 mb-4 font-light", children: ["\u58F2\u4E0A ", _jsx("span", { className: "text-yellow-400 font-bold", children: "+347%" }), " \u3092\u5B9F\u73FE\u3057\u305F"] }), _jsx("p", { className: "text-lg sm:text-xl text-gray-400 mb-8", children: "\u696D\u754C\u521D\u306EAI\u4E88\u6E2C\u30A8\u30F3\u30B8\u30F3\u642D\u8F09\u30B7\u30B9\u30C6\u30E0" }), _jsx("div", { className: "bg-red-600 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-8 backdrop-blur-sm", children: _jsxs("div", { className: "flex items-center justify-center text-red-300 font-medium", children: [_jsx(Clock, { className: "w-5 h-5 mr-2 animate-pulse" }), "\u3053\u306E\u30AA\u30D5\u30A1\u30FC\u306F 72 \u6642\u9593\u9650\u5B9A\u3067\u3059"] }) }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center items-center", children: [_jsxs("button", { className: "group relative bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-4 px-8 rounded-full text-lg transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/25", children: [_jsxs("span", { className: "flex items-center", children: [_jsx(Sparkles, { className: "w-6 h-6 mr-2 group-hover:animate-spin" }), "\u4ECA\u3059\u3050\u7121\u6599\u3067\u4F53\u9A13\u958B\u59CB", _jsx(ArrowRight, { className: "w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" })] }), _jsx("div", { className: "absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce", children: "\u7121\u6599" })] }), _jsx("button", { className: "text-white border-2 border-white hover:bg-white hover:text-black font-medium py-4 px-8 rounded-full transition-all duration-300 group", children: _jsxs("span", { className: "flex items-center", children: [_jsx(Eye, { className: "w-5 h-5 mr-2" }), "\u30C7\u30E2\u3092\u898B\u308B", _jsx(ChevronRight, { className: "w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" })] }) })] }), _jsxs("div", { className: "mt-8 flex flex-wrap justify-center items-center gap-6 text-gray-400 text-sm", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Shield, { className: "w-4 h-4 mr-1 text-green-400" }), "SSL\u6697\u53F7\u5316"] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-4 h-4 mr-1 text-blue-400" }), "500\u5E97\u8217\u5C0E\u5165\u6E08\u307F"] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Award, { className: "w-4 h-4 mr-1 text-yellow-400" }), "\u696D\u754CNo.1\u8A55\u4FA1"] })] })] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-1 shadow-2xl", children: _jsxs("div", { className: "bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 h-96 sm:h-[500px] relative overflow-hidden", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 h-full", children: [_jsxs("div", { className: "sm:col-span-2 bg-white rounded-lg p-4 shadow-lg border", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("h3", { className: "font-bold text-gray-800 flex items-center", children: [_jsx(TrendingUp, { className: "w-5 h-5 mr-2 text-green-500" }), "\u58F2\u4E0A\u5206\u6790"] }), _jsx("span", { className: "text-green-500 font-bold text-xl", children: "+347%" })] }), _jsx("div", { className: "h-32 bg-gradient-to-br from-green-100 to-green-200 rounded flex items-end justify-around px-2", children: [40, 60, 80, 95, 120, 150, 180].map((height, i) => (_jsx("div", { className: "bg-gradient-to-t from-green-500 to-green-400 rounded-t w-8 animate-pulse", style: { height: `${height * 0.6}px`, animationDelay: `${i * 200}ms` } }, i))) })] }), _jsxs("div", { className: "bg-white rounded-lg p-4 shadow-lg border", children: [_jsxs("h3", { className: "font-bold text-gray-800 mb-3 flex items-center", children: [_jsx(Heart, { className: "w-5 h-5 mr-2 text-pink-500" }), "\u6E80\u8DB3\u5EA6"] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl font-bold text-pink-500 mb-2", children: "98%" }), _jsx("div", { className: "flex justify-center mb-2", children: [1, 2, 3, 4, 5].map((star) => (_jsx(Star, { className: "w-5 h-5 text-yellow-400 fill-current" }, star))) }), _jsx("div", { className: "text-sm text-gray-600", children: "\u9867\u5BA2\u6E80\u8DB3\u5EA6" })] })] }), _jsxs("div", { className: "bg-white rounded-lg p-4 shadow-lg border", children: [_jsxs("h3", { className: "font-bold text-gray-800 mb-3 flex items-center", children: [_jsx(Calendar, { className: "w-5 h-5 mr-2 text-blue-500" }), "\u672C\u65E5\u306E\u4E88\u7D04"] }), _jsx("div", { className: "space-y-2", children: ['10:00 田中様', '13:00 佐藤様', '15:30 山田様'].map((appointment, i) => (_jsxs("div", { className: "flex items-center text-sm bg-blue-50 rounded p-2", children: [_jsx("div", { className: "w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" }), appointment] }, i))) })] }), _jsxs("div", { className: "bg-white rounded-lg p-4 shadow-lg border", children: [_jsxs("h3", { className: "font-bold text-gray-800 mb-3 flex items-center", children: [_jsx(MessageSquare, { className: "w-5 h-5 mr-2 text-purple-500" }), "\u30E1\u30C3\u30BB\u30FC\u30B8"] }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "bg-green-100 rounded p-2 text-sm", children: "LINE: \u4E88\u7D04\u78BA\u8A8D \u2713" }), _jsx("div", { className: "bg-pink-100 rounded p-2 text-sm", children: "Instagram: DM 2\u4EF6" })] })] }), _jsxs("div", { className: "bg-white rounded-lg p-4 shadow-lg border", children: [_jsxs("h3", { className: "font-bold text-gray-800 mb-3 flex items-center", children: [_jsx(Zap, { className: "w-5 h-5 mr-2 text-yellow-500" }), "AI\u4E88\u6E2C"] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-yellow-500 mb-1", children: "\u6765\u6708" }), _jsx("div", { className: "text-lg font-bold text-gray-800", children: "+25%" }), _jsx("div", { className: "text-xs text-gray-600", children: "\u58F2\u4E0A\u4E88\u6E2C" })] })] })] }), _jsx("div", { className: "absolute top-4 right-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-3 shadow-lg animate-bounce", children: _jsx(Sparkles, { className: "w-6 h-6 text-white" }) })] }) }), _jsx("div", { className: "absolute -top-4 -left-4 bg-blue-500 rounded-full p-3 shadow-lg animate-pulse", children: _jsx(Smartphone, { className: "w-6 h-6 text-white" }) }), _jsx("div", { className: "absolute -bottom-4 -right-4 bg-green-500 rounded-full p-3 shadow-lg animate-pulse animation-delay-1000", children: _jsx(BarChart3, { className: "w-6 h-6 text-white" }) })] })] })] }), _jsx("section", { className: "py-16 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center", children: _jsxs("div", { className: "bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20", children: [_jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-white mb-4", children: "\uD83C\uDFAF \u5148\u774020\u540D\u69D8\u9650\u5B9A \uD83C\uDFAF" }), _jsxs("p", { className: "text-xl text-white mb-6 font-medium", children: ["\u901A\u5E38 \u6708\u984D \u00A598,000 \u2192 ", _jsx("span", { className: "line-through opacity-70", children: "\u00A598,000" })] }), _jsx("div", { className: "text-5xl sm:text-6xl font-bold text-white mb-4", children: "\u5B8C\u5168\u7121\u6599" }), _jsx("p", { className: "text-lg text-white mb-8 opacity-90", children: "3\u30F6\u6708\u9593 \u5168\u6A5F\u80FD\u4F7F\u3044\u653E\u984C + \u5C02\u5C5E\u30B5\u30DD\u30FC\u30C8\u4ED8\u304D" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8", children: [_jsxs("div", { className: "bg-white bg-opacity-20 rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-bold text-white", children: "\u00A50" }), _jsx("div", { className: "text-white opacity-90", children: "\u521D\u671F\u8CBB\u7528" })] }), _jsxs("div", { className: "bg-white bg-opacity-20 rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-bold text-white", children: "\u00A50" }), _jsx("div", { className: "text-white opacity-90", children: "\u6708\u984D\u8CBB\u7528" })] }), _jsxs("div", { className: "bg-white bg-opacity-20 rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-bold text-white", children: "24/7" }), _jsx("div", { className: "text-white opacity-90", children: "\u30B5\u30DD\u30FC\u30C8" })] })] }), _jsx("button", { className: "bg-white text-black font-bold py-4 px-12 rounded-full text-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl", children: _jsxs("span", { className: "flex items-center", children: [_jsx(Diamond, { className: "w-6 h-6 mr-2" }), "\u4ECA\u3059\u3050\u7279\u5225\u67A0\u3092\u78BA\u4FDD\u3059\u308B", _jsx(ArrowRight, { className: "w-6 h-6 ml-2" })] }) })] }) }) }), _jsx("section", { className: "py-20 bg-slate-900", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsxs("h2", { className: "text-4xl sm:text-5xl font-bold text-white mb-6", children: ["\u306A\u305C ", _jsx("span", { className: "text-yellow-400", children: "347%" }), " \u306E\u58F2\u4E0A\u30A2\u30C3\u30D7\u3092\u5B9F\u73FE\u3067\u304D\u308B\u306E\u304B\uFF1F"] }), _jsx("p", { className: "text-xl text-gray-400 max-w-3xl mx-auto", children: "\u696D\u754C\u521D\u306EAI\u6280\u8853\u3068\u9769\u65B0\u7684\u306A\u30B7\u30B9\u30C6\u30E0\u8A2D\u8A08\u306B\u3088\u308A\u3001\u5F93\u6765\u306E\u5E38\u8B58\u3092\u8986\u3059\u7D50\u679C\u3092\u5B9F\u73FE" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: features.map((feature, index) => (_jsx("div", { className: "bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-purple-500 transition-all duration-300 group hover:transform hover:scale-105", children: _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "flex-shrink-0 bg-slate-700 rounded-lg p-3 group-hover:bg-purple-600 transition-colors duration-300", children: feature.icon }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors", children: feature.title }), _jsx("p", { className: "text-gray-400 leading-relaxed", children: feature.description })] })] }) }, index))) })] }) }), _jsx("section", { className: "py-20 bg-gradient-to-br from-purple-900 to-slate-900", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsx("div", { className: "text-center mb-16", children: _jsxs("h2", { className: "text-4xl sm:text-5xl font-bold text-white mb-6", children: ["\u5B9F\u969B\u306B\u4F7F\u3063\u305F\u65B9\u3005\u306E", _jsx("span", { className: "text-purple-400", children: "\u30EA\u30A2\u30EB\u306A\u58F0" })] }) }), _jsxs("div", { className: "bg-white rounded-2xl p-8 max-w-4xl mx-auto shadow-2xl", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-6xl mb-4", children: testimonials[currentTestimonial].avatar }), _jsx("div", { className: "flex justify-center mb-4", children: [1, 2, 3, 4, 5].map((star) => (_jsx(Star, { className: "w-6 h-6 text-yellow-400 fill-current" }, star))) }), _jsxs("blockquote", { className: "text-2xl text-gray-800 font-medium mb-4 italic", children: ["\"", testimonials[currentTestimonial].text, "\""] }), _jsx("cite", { className: "text-gray-600 font-semibold", children: testimonials[currentTestimonial].name })] }), _jsx("div", { className: "flex justify-center mt-8 space-x-2", children: testimonials.map((_, index) => (_jsx("button", { onClick: () => setCurrentTestimonial(index), className: `w-3 h-3 rounded-full transition-colors ${index === currentTestimonial ? 'bg-purple-500' : 'bg-gray-300'}` }, index))) })] })] }) }), _jsx("section", { className: "py-20 bg-gradient-to-br from-slate-900 to-black", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center", children: _jsxs("div", { className: "bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-20" }), _jsxs("div", { className: "relative z-10", children: [_jsxs("h2", { className: "text-4xl sm:text-5xl font-bold text-white mb-6", children: ["\u4ECA\u3059\u3050\u59CB\u3081\u3066\u3001\u3042\u306A\u305F\u306E\u7F8E\u5BB9\u5BA4\u3092", _jsx("br", {}), _jsx("span", { className: "text-yellow-300", children: "\u6B21\u306E\u30EC\u30D9\u30EB\u3078" })] }), _jsxs("div", { className: "bg-red-500 text-white inline-block px-6 py-2 rounded-full font-bold text-lg mb-6 animate-pulse", children: ["\u26A1 \u6B8B\u308A ", remainingSlots, " \u67A0\u306E\u307F \u26A1"] }), _jsx("div", { className: "text-xl text-white mb-8 opacity-90", children: "\u30AF\u30EC\u30B8\u30C3\u30C8\u30AB\u30FC\u30C9\u4E0D\u8981 | 3\u5206\u3067\u5C0E\u5165\u5B8C\u4E86 | \u5373\u65E5\u5229\u7528\u958B\u59CB" }), _jsx("button", { className: "bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-6 px-12 rounded-full text-2xl transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50", children: _jsxs("span", { className: "flex items-center", children: [_jsx(Crown, { className: "w-8 h-8 mr-3" }), "\u7279\u5225\u67A0\u3067\u4ECA\u3059\u3050\u958B\u59CB", _jsx(Sparkles, { className: "w-8 h-8 ml-3 animate-pulse" })] }) }), _jsx("div", { className: "mt-6 text-white text-sm opacity-75", children: "30\u79D2\u3067\u767B\u9332\u5B8C\u4E86 | \u89E3\u7D04\u306F\u3044\u3064\u3067\u3082\u53EF\u80FD" })] })] }) }) }), _jsx("style", { children: `
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      ` })] }));
};
export default PremiumLandingPage;
