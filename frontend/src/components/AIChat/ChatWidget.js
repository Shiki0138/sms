import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ThumbsUp, ThumbsDown, Sparkles, Minimize2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [showFeedback, setShowFeedback] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const { user } = useAuth();
    // 初期メッセージ
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const isTestMode = window.location.hostname === 'localhost' || window.location.hostname.includes('test') || window.location.hostname.includes('demo');
            const welcomeText = isTestMode
                ? 'こんにちは！美容室管理システムのテスト環境へようこそ。✨\n\nこちらはデモ用のAIサポートです。システムの使い方について何でもお聞きください！\n\n※テストモードでは実際のOpenAI APIは使用せず、モック応答で動作します。'
                : 'こんにちは！美容室管理システムのサポートアシスタントです。✨\n\nシステムの使い方や機能について、何でもお気軽にご質問ください。';
            setMessages([{
                    id: 'welcome',
                    text: welcomeText,
                    sender: 'ai',
                    timestamp: new Date(),
                    suggestions: ['予約の登録方法', '顧客情報の確認', 'よくある質問']
                }]);
        }
    }, [isOpen, messages.length]);
    // スクロール制御
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    // 会話履歴の読み込み
    useEffect(() => {
        if (isOpen && sessionId && user) {
            loadChatHistory();
        }
    }, [isOpen, sessionId, user]);
    const loadChatHistory = async () => {
        try {
            const response = await axios.get(`/api/v1/ai-support/history`, {
                params: { sessionId, limit: 20 }
            });
            if (response.data.success && response.data.data.length > 0) {
                const historyMessages = response.data.data.flatMap((item) => [
                    {
                        id: `user-${item.id}`,
                        text: item.userMessage,
                        sender: 'user',
                        timestamp: new Date(item.createdAt)
                    },
                    {
                        id: `ai-${item.id}`,
                        text: item.aiResponse,
                        sender: 'ai',
                        timestamp: new Date(item.createdAt)
                    }
                ]);
                setMessages(prev => [...historyMessages, ...prev]);
            }
        }
        catch (error) {
            console.error('Failed to load chat history:', error);
        }
    };
    const sendMessage = async () => {
        if (!inputText.trim() || isLoading)
            return;
        const userMessage = {
            id: `user-${Date.now()}`,
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);
        try {
            const response = await axios.post('/api/v1/ai-support/chat', {
                message: inputText,
                sessionId: sessionId || undefined
            });
            if (response.data.success) {
                const aiMessage = {
                    id: `ai-${Date.now()}`,
                    text: response.data.data.response,
                    sender: 'ai',
                    timestamp: new Date(),
                    suggestions: response.data.data.suggestions
                };
                setMessages(prev => [...prev, aiMessage]);
                if (!sessionId) {
                    setSessionId(response.data.data.sessionId);
                }
            }
        }
        catch (error) {
            const errorMessage = {
                id: `error-${Date.now()}`,
                text: '申し訳ございません。現在接続に問題が発生しています。しばらくしてからもう一度お試しください。',
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleSuggestionClick = (suggestion) => {
        setInputText(suggestion);
        inputRef.current?.focus();
    };
    const handleFeedback = async (messageId, helpful) => {
        try {
            await axios.post('/api/v1/ai-support/feedback', {
                sessionId,
                messageId,
                helpful
            });
            setShowFeedback(messageId);
            setTimeout(() => setShowFeedback(null), 2000);
        }
        catch (error) {
            console.error('Failed to send feedback:', error);
        }
    };
    const formatTime = (date) => {
        return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    };
    if (!isOpen) {
        return (_jsx("button", { onClick: () => setIsOpen(true), className: "fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110 z-50", "aria-label": "AI\u30B5\u30DD\u30FC\u30C8\u3092\u958B\u304F", children: _jsxs("div", { className: "relative", children: [_jsx(MessageCircle, { className: "w-6 h-6" }), _jsx(Sparkles, { className: "w-3 h-3 absolute -top-1 -right-1 text-yellow-300" })] }) }));
    }
    return (_jsxs("div", { className: `fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl transition-all duration-300 z-50 ${isMinimized ? 'w-80 h-14' : 'w-96 h-[600px]'}`, children: [_jsxs("div", { className: "bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "relative", children: [_jsx(MessageCircle, { className: "w-5 h-5" }), _jsx(Sparkles, { className: "w-3 h-3 absolute -top-1 -right-1 text-yellow-300" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "font-semibold", children: "AI\u30B5\u30DD\u30FC\u30C8" }), (window.location.hostname === 'localhost' || window.location.hostname.includes('test') || window.location.hostname.includes('demo')) && (_jsx("span", { className: "text-xs text-blue-200", children: "\u30C6\u30B9\u30C8\u30E2\u30FC\u30C9" }))] }), isLoading && (_jsx("div", { className: "ml-2", children: _jsxs("div", { className: "animate-pulse flex space-x-1", children: [_jsx("div", { className: "w-1 h-1 bg-white rounded-full" }), _jsx("div", { className: "w-1 h-1 bg-white rounded-full animation-delay-200" }), _jsx("div", { className: "w-1 h-1 bg-white rounded-full animation-delay-400" })] }) }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: () => setIsMinimized(!isMinimized), className: "hover:bg-white/20 rounded p-1 transition-colors", "aria-label": "\u6700\u5C0F\u5316", children: _jsx(Minimize2, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setIsOpen(false), className: "hover:bg-white/20 rounded p-1 transition-colors", "aria-label": "\u9589\u3058\u308B", children: _jsx(X, { className: "w-4 h-4" }) })] })] }), !isMinimized && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-8rem)]", children: [messages.map((message) => (_jsx("div", { className: `flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`, children: _jsxs("div", { className: `max-w-[80%] ${message.sender === 'user' ? 'order-2' : ''}`, children: [_jsx("div", { className: `rounded-lg p-3 ${message.sender === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-800'}`, children: _jsx("p", { className: "text-sm whitespace-pre-wrap", children: message.text }) }), _jsxs("div", { className: `flex items-center mt-1 text-xs text-gray-500 ${message.sender === 'user' ? 'justify-end' : ''}`, children: [_jsx("span", { children: formatTime(message.timestamp) }), message.sender === 'ai' && !message.id.includes('welcome') && (_jsxs("div", { className: "ml-2 flex items-center space-x-1", children: [_jsx("button", { onClick: () => handleFeedback(message.id, true), className: "hover:text-green-600 transition-colors", "aria-label": "\u5F79\u306B\u7ACB\u3063\u305F", children: _jsx(ThumbsUp, { className: "w-3 h-3" }) }), _jsx("button", { onClick: () => handleFeedback(message.id, false), className: "hover:text-red-600 transition-colors", "aria-label": "\u5F79\u306B\u7ACB\u305F\u306A\u304B\u3063\u305F", children: _jsx(ThumbsDown, { className: "w-3 h-3" }) }), showFeedback === message.id && (_jsx("span", { className: "text-green-600 ml-1", children: "\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\uFF01" }))] }))] }), message.suggestions && message.suggestions.length > 0 && (_jsx("div", { className: "mt-2 space-y-1", children: message.suggestions.map((suggestion, index) => (_jsx("button", { onClick: () => handleSuggestionClick(suggestion), className: "block w-full text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded px-2 py-1 transition-colors", children: suggestion }, index))) }))] }) }, message.id))), _jsx("div", { ref: messagesEndRef })] }), _jsx("div", { className: "border-t p-4", children: _jsxs("form", { onSubmit: (e) => {
                                e.preventDefault();
                                sendMessage();
                            }, className: "flex items-center space-x-2", children: [_jsx("input", { ref: inputRef, type: "text", value: inputText, onChange: (e) => setInputText(e.target.value), placeholder: "\u8CEA\u554F\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044...", className: "flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", disabled: isLoading }), _jsx("button", { type: "submit", disabled: !inputText.trim() || isLoading, className: "bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", "aria-label": "\u9001\u4FE1", children: _jsx(Send, { className: "w-5 h-5" }) })] }) })] }))] }));
};
export default ChatWidget;
