import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Bot, Loader2, RefreshCw, Check, X } from 'lucide-react';
const AIReplyGenerator = ({ threadId, customerData, messageHistory, onReplyGenerated, onClose }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedReply, setGeneratedReply] = useState(null);
    const [editedReply, setEditedReply] = useState('');
    const [error, setError] = useState(null);
    const generateAIReply = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            // API呼び出し (チームBが実装するエンドポイント)
            const response = await fetch('/api/v1/ai/generate-reply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    threadId,
                    customerData: {
                        name: customerData.name,
                        visitHistory: customerData.visitHistory || [],
                        preferences: customerData.preferences || [],
                        lastService: customerData.lastService || ''
                    },
                    messageHistory: messageHistory.slice(-5), // 最新5件のメッセージ
                    messageType: 'general'
                })
            });
            if (!response.ok) {
                throw new Error('AI返信生成に失敗しました');
            }
            const aiResponse = await response.json();
            setGeneratedReply(aiResponse);
            setEditedReply(aiResponse.reply);
        }
        catch (err) {
            console.error('AI Reply Generation Error:', err);
            setError(err instanceof Error ? err.message : 'AI返信生成中にエラーが発生しました');
            // フォールバック: デモ用の返信生成
            const demoReply = generateDemoReply();
            setGeneratedReply(demoReply);
            setEditedReply(demoReply.reply);
        }
        finally {
            setIsGenerating(false);
        }
    };
    const generateDemoReply = () => {
        const lastMessage = messageHistory[messageHistory.length - 1]?.content || '';
        let reply = '';
        if (lastMessage.includes('予約') || lastMessage.includes('空いて')) {
            reply = `${customerData.name}様、お問い合わせありがとうございます。ご希望のお日にちをお聞かせください。お客様に最適なお時間をご提案させていただきます。`;
        }
        else if (lastMessage.includes('カット') || lastMessage.includes('カラー')) {
            reply = `${customerData.name}様、いつもありがとうございます。${customerData.lastService ? `前回の${customerData.lastService}もとてもお似合いでした。` : ''}ご希望のスタイルについて詳しくお聞かせください。`;
        }
        else {
            reply = `${customerData.name}様、いつもありがとうございます。お気軽にご相談ください。スタッフ一同、心よりお待ちしております。`;
        }
        return {
            reply,
            confidence: 0.85,
            reasoning: '顧客情報とメッセージ履歴から最適な返信を生成しました',
            alternatives: [
                'ありがとうございます。詳細をお聞かせください。',
                'お問い合わせいただき、ありがとうございます。'
            ]
        };
    };
    const handleUseReply = () => {
        onReplyGenerated(editedReply);
    };
    const handleRegenerate = () => {
        generateAIReply();
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx(Bot, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: "AI\u8FD4\u4FE1\u751F\u6210" }), _jsxs("p", { className: "text-sm text-gray-600", children: [customerData.name, "\u69D8\u3078\u306E\u8FD4\u4FE1\u3092\u4F5C\u6210"] })] })] }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "mb-6 p-4 bg-gray-50 rounded-lg", children: [_jsx("h3", { className: "text-sm font-medium text-gray-700 mb-2", children: "\u9867\u5BA2\u60C5\u5831" }), _jsxs("div", { className: "space-y-1 text-sm text-gray-600", children: [_jsxs("p", { children: [_jsx("span", { className: "font-medium", children: "\u304A\u540D\u524D:" }), " ", customerData.name] }), customerData.lastService && (_jsxs("p", { children: [_jsx("span", { className: "font-medium", children: "\u524D\u56DE\u30B5\u30FC\u30D3\u30B9:" }), " ", customerData.lastService] })), customerData.preferences && customerData.preferences.length > 0 && (_jsxs("p", { children: [_jsx("span", { className: "font-medium", children: "\u597D\u307F:" }), " ", customerData.preferences.join(', ')] }))] })] }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-sm font-medium text-gray-700 mb-2", children: "\u6700\u8FD1\u306E\u30E1\u30C3\u30BB\u30FC\u30B8" }), _jsx("div", { className: "max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3", children: messageHistory.slice(-3).map((message, index) => (_jsx("div", { className: "mb-2 last:mb-0", children: _jsxs("div", { className: `text-sm ${message.senderType === 'CUSTOMER' ? 'text-blue-600' : 'text-gray-600'}`, children: [_jsxs("span", { className: "font-medium", children: [message.senderType === 'CUSTOMER' ? 'お客様' : 'スタッフ', ":"] }), _jsx("span", { className: "ml-2", children: message.content })] }) }, index))) })] }), !generatedReply ? (_jsx("div", { className: "text-center py-8", children: isGenerating ? (_jsxs("div", { className: "space-y-4", children: [_jsx(Loader2, { className: "w-12 h-12 mx-auto text-blue-600 animate-spin" }), _jsx("p", { className: "text-gray-600", children: "AI\u304C\u8FD4\u4FE1\u3092\u751F\u6210\u4E2D..." })] })) : (_jsxs("div", { className: "space-y-4", children: [_jsx(Bot, { className: "w-12 h-12 mx-auto text-gray-300" }), _jsx("p", { className: "text-gray-600", children: "AI\u304C\u6700\u9069\u306A\u8FD4\u4FE1\u3092\u751F\u6210\u3057\u307E\u3059" }), _jsx("button", { onClick: generateAIReply, className: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors", children: "\u8FD4\u4FE1\u3092\u751F\u6210" })] })) })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h3", { className: "text-sm font-medium text-gray-700", children: "\u751F\u6210\u3055\u308C\u305F\u8FD4\u4FE1" }), _jsx("div", { className: "flex items-center space-x-2 text-xs text-gray-500", children: _jsxs("span", { children: ["\u4FE1\u983C\u5EA6: ", Math.round(generatedReply.confidence * 100), "%"] }) })] }), _jsx("textarea", { value: editedReply, onChange: (e) => setEditedReply(e.target.value), className: "w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500", rows: 4, placeholder: "\u8FD4\u4FE1\u5185\u5BB9\u3092\u7DE8\u96C6\u3067\u304D\u307E\u3059" })] }), generatedReply.reasoning && (_jsx("div", { className: "p-3 bg-blue-50 rounded-lg", children: _jsxs("p", { className: "text-xs text-blue-700", children: [_jsx("span", { className: "font-medium", children: "AI\u5206\u6790:" }), " ", generatedReply.reasoning] }) })), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-gray-200", children: [_jsxs("button", { onClick: handleRegenerate, className: "flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), _jsx("span", { children: "\u518D\u751F\u6210" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsxs("button", { onClick: handleUseReply, disabled: !editedReply.trim(), className: "flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors", children: [_jsx(Check, { className: "w-4 h-4" }), _jsx("span", { children: "\u3053\u306E\u8FD4\u4FE1\u3092\u4F7F\u7528" })] })] })] })] })), error && (_jsx("div", { className: "mt-4 p-3 bg-red-50 border border-red-200 rounded-lg", children: _jsx("p", { className: "text-sm text-red-700", children: error }) }))] }) }) }));
};
export default AIReplyGenerator;
