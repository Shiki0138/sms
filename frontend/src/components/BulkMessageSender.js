import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Users, Filter, MessageCircle, Instagram, Mail, X, CheckCircle, AlertCircle, Eye, MessageSquare } from 'lucide-react';
import { format, differenceInMonths, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useExternalMessaging } from '../hooks/useExternalMessaging';
import ProductionWarningModal from './Common/ProductionWarningModal';
import FeatureGate from './Common/FeatureGate';
import LimitWarning from './Common/LimitWarning';
import { useSubscription } from '../contexts/SubscriptionContext';
const BulkMessageSenderCore = ({ customers, onSend, onClose, isOpen }) => {
    const [step, setStep] = useState('filter');
    const [message, setMessage] = useState('');
    const [messageTemplate, setMessageTemplate] = useState('');
    const [filterSettings, setFilterSettings] = useState({
        lastVisitMonths: 3,
        excludeRecentDays: 7,
        minVisitCount: 1,
        maxVisitCount: 999,
        includeNoVisit: true,
        requiredChannels: []
    });
    // 環境制限フック
    const { attemptSendMessage, isSending, isWarningOpen, currentFeature, setIsWarningOpen, checkFeatureAvailability, isDevelopment } = useExternalMessaging();
    // メッセージテンプレート
    const messageTemplates = {
        campaign: {
            title: '🎉 キャンペーン情報',
            content: '【限定キャンペーンのお知らせ】\n\n{name}様、いつもご利用ありがとうございます！\n\n✨ 期間限定特別キャンペーン ✨\nカット+カラー 20%OFF\n期間：{date}まで\n\nこの機会にぜひご利用ください♪\nご予約お待ちしております！\n\n{salonName}'
        },
        holiday: {
            title: '🏮 年末年始休業案内',
            content: '【年末年始休業のお知らせ】\n\n{name}様、いつもありがとうございます。\n\n年末年始の営業について\n🎍 12/30(土) 通常営業\n🎍 12/31(日)〜1/3(水) 休業\n🎍 1/4(木) 通常営業開始\n\n新年も皆様のご来店を心よりお待ちしております✨\n\n{salonName}'
        },
        newStore: {
            title: '🎊 新店舗オープン',
            content: '【新店舗オープンのお知らせ】\n\n{name}様、いつもありがとうございます！\n\n🎉 新店舗がオープンしました！\n📍 {address}\n📞 {phone}\n\nオープン記念として初回30%OFFキャンペーン実施中✨\nぜひ新しい店舗もご利用ください♪\n\n{salonName}'
        },
        followUp: {
            title: '💌 フォローアップメッセージ',
            content: '{name}様\n\nご無沙汰しております。\nお元気でお過ごしでしょうか？\n\n最後のご来店から少しお時間が経ちましたので、\nご連絡させていただきました💕\n\nまたお会いできる日を楽しみにしております✨\nいつでもお気軽にご連絡ください♪\n\n{salonName}'
        }
    };
    // 顧客フィルタリング
    const filteredCustomers = useMemo(() => {
        const now = new Date();
        return customers.filter(customer => {
            // 来店回数フィルター
            if (customer.visitCount < filterSettings.minVisitCount ||
                customer.visitCount > filterSettings.maxVisitCount) {
                return false;
            }
            // 来店履歴がない顧客の処理
            if (!customer.lastVisitDate) {
                return filterSettings.includeNoVisit;
            }
            const lastVisit = new Date(customer.lastVisitDate);
            // 最終来店日フィルター（X ヶ月以上前）
            const monthsSinceLastVisit = differenceInMonths(now, lastVisit);
            if (monthsSinceLastVisit < filterSettings.lastVisitMonths) {
                return false;
            }
            // 直近来店者除外フィルター
            const daysSinceLastVisit = differenceInDays(now, lastVisit);
            if (daysSinceLastVisit <= filterSettings.excludeRecentDays) {
                return false;
            }
            // 連絡手段フィルター
            if (filterSettings.requiredChannels.length > 0) {
                const hasRequiredChannel = filterSettings.requiredChannels.some(channel => {
                    switch (channel) {
                        case 'LINE': return !!customer.lineId;
                        case 'INSTAGRAM': return !!customer.instagramId;
                        case 'EMAIL': return !!customer.email;
                        default: return false;
                    }
                });
                if (!hasRequiredChannel) {
                    return false;
                }
            }
            return true;
        });
    }, [customers, filterSettings]);
    // 各顧客の送信チャンネル決定
    const getCustomerChannel = (customer) => {
        if (customer.lineId) {
            return {
                channel: 'LINE',
                address: customer.lineId,
                icon: _jsx(MessageCircle, { className: "w-4 h-4 text-green-500" })
            };
        }
        if (customer.instagramId) {
            return {
                channel: 'Instagram',
                address: customer.instagramId,
                icon: _jsx(Instagram, { className: "w-4 h-4 text-pink-500" })
            };
        }
        if (customer.email) {
            return {
                channel: 'Email',
                address: customer.email,
                icon: _jsx(Mail, { className: "w-4 h-4 text-blue-500" })
            };
        }
        return {
            channel: '連絡手段なし',
            address: '',
            icon: _jsx(X, { className: "w-4 h-4 text-gray-400" })
        };
    };
    // メッセージの個人化
    const personalizeMessage = (template, customer) => {
        return template
            .replace(/{name}/g, customer.name)
            .replace(/{date}/g, format(new Date(), 'M月d日', { locale: ja }))
            .replace(/{salonName}/g, '美容室サンプル')
            .replace(/{address}/g, '東京都新宿区1-2-3')
            .replace(/{phone}/g, '03-1234-5678');
    };
    const handleTemplateSelect = (templateKey) => {
        const template = messageTemplates[templateKey];
        setMessageTemplate(templateKey);
        setMessage(template.content);
    };
    const handleSend = async () => {
        setStep('sending');
        try {
            // 各顧客に対して送信試行
            const sendResults = await Promise.all(filteredCustomers.map(async (customer) => {
                const channelInfo = getCustomerChannel(customer);
                let messageType;
                // チャンネルタイプをマッピング
                switch (channelInfo.channel) {
                    case 'LINE':
                        messageType = 'line';
                        break;
                    case 'Instagram':
                        messageType = 'instagram';
                        break;
                    case 'Email':
                        messageType = 'email';
                        break;
                    default:
                        messageType = 'email'; // フォールバック
                }
                // 個人化されたメッセージを作成
                const personalizedMessage = personalizeMessage(message, customer);
                // 外部送信試行
                const result = await attemptSendMessage({
                    type: messageType,
                    recipients: [channelInfo.address],
                    message: personalizedMessage,
                    subject: messageTemplate ? messageTemplates[messageTemplate].title : '美容室からのお知らせ'
                });
                return { customer, result };
            }));
            // 送信結果の確認
            const failedSends = sendResults.filter(({ result }) => !result.success);
            const restrictedSends = sendResults.filter(({ result }) => result.restrictedByEnvironment);
            if (restrictedSends.length > 0) {
                // 環境制限がある場合は警告を表示して処理を停止
                return;
            }
            // 従来のコールバック実行（後方互換性）
            const channels = filteredCustomers.map(customer => getCustomerChannel(customer).channel);
            onSend(filteredCustomers, message, channels);
            setStep('complete');
        }
        catch (error) {
            console.error('Bulk message sending error:', error);
            setStep('preview'); // エラー時は前の画面に戻る
        }
    };
    const resetAndClose = () => {
        setStep('filter');
        setMessage('');
        setMessageTemplate('');
        setFilterSettings({
            lastVisitMonths: 3,
            excludeRecentDays: 7,
            minVisitCount: 1,
            maxVisitCount: 999,
            includeNoVisit: true,
            requiredChannels: []
        });
        onClose();
    };
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col", children: _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 flex items-center", children: [_jsx(Send, { className: "w-6 h-6 mr-2 text-blue-600" }), "\u30E1\u30C3\u30BB\u30FC\u30B8\u4E00\u6589\u9001\u4FE1"] }), _jsx("button", { onClick: resetAndClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsx("div", { className: "flex items-center justify-center mb-8", children: _jsx("div", { className: "flex items-center space-x-4", children: [
                                        { key: 'filter', label: '対象選択', icon: Filter },
                                        { key: 'compose', label: 'メッセージ作成', icon: MessageSquare },
                                        { key: 'preview', label: '送信確認', icon: Eye },
                                        { key: 'complete', label: '送信完了', icon: CheckCircle }
                                    ].map((stepItem, index) => {
                                        const StepIcon = stepItem.icon;
                                        const isActive = step === stepItem.key;
                                        const isCompleted = ['filter', 'compose', 'preview'].indexOf(step) > ['filter', 'compose', 'preview'].indexOf(stepItem.key);
                                        return (_jsxs(React.Fragment, { children: [_jsxs("div", { className: `flex items-center space-x-2 ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`, children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-100' : isCompleted ? 'bg-green-100' : 'bg-gray-100'}`, children: _jsx(StepIcon, { className: "w-4 h-4" }) }), _jsx("span", { className: "text-sm font-medium hidden sm:inline", children: stepItem.label })] }), index < 3 && (_jsx("div", { className: `w-8 h-0.5 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}` }))] }, stepItem.key));
                                    }) }) }), step === 'filter' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2", children: "\u6765\u5E97\u65E5\u30D5\u30A3\u30EB\u30BF\u30FC" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u6700\u7D42\u6765\u5E97\u304B\u3089\u4F55\u30F6\u6708\u4EE5\u4E0A\u7D4C\u904E\u3057\u305F\u9867\u5BA2" }), _jsxs("select", { value: filterSettings.lastVisitMonths, onChange: (e) => setFilterSettings(prev => ({ ...prev, lastVisitMonths: parseInt(e.target.value) })), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: 1, children: "1\u30F6\u6708\u4EE5\u4E0A" }), _jsx("option", { value: 2, children: "2\u30F6\u6708\u4EE5\u4E0A" }), _jsx("option", { value: 3, children: "3\u30F6\u6708\u4EE5\u4E0A" }), _jsx("option", { value: 6, children: "6\u30F6\u6708\u4EE5\u4E0A" }), _jsx("option", { value: 12, children: "1\u5E74\u4EE5\u4E0A" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u76F4\u8FD1\u6765\u5E97\u8005\u3092\u9664\u5916\uFF08\u4F55\u65E5\u4EE5\u5185\uFF09" }), _jsxs("select", { value: filterSettings.excludeRecentDays, onChange: (e) => setFilterSettings(prev => ({ ...prev, excludeRecentDays: parseInt(e.target.value) })), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: 0, children: "\u9664\u5916\u3057\u306A\u3044" }), _jsx("option", { value: 3, children: "3\u65E5\u4EE5\u5185" }), _jsx("option", { value: 7, children: "7\u65E5\u4EE5\u5185" }), _jsx("option", { value: 14, children: "14\u65E5\u4EE5\u5185" }), _jsx("option", { value: 30, children: "30\u65E5\u4EE5\u5185" })] })] }), _jsx("div", { children: _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: filterSettings.includeNoVisit, onChange: (e) => setFilterSettings(prev => ({ ...prev, includeNoVisit: e.target.checked })), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2" }), _jsx("span", { className: "text-sm text-gray-700", children: "\u6765\u5E97\u5C65\u6B74\u306E\u306A\u3044\u9867\u5BA2\u3092\u542B\u3081\u308B" })] }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2", children: "\u305D\u306E\u4ED6\u30D5\u30A3\u30EB\u30BF\u30FC" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u6700\u5C0F\u6765\u5E97\u56DE\u6570" }), _jsx("input", { type: "number", min: "0", value: filterSettings.minVisitCount, onChange: (e) => setFilterSettings(prev => ({ ...prev, minVisitCount: parseInt(e.target.value) || 0 })), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u6700\u5927\u6765\u5E97\u56DE\u6570" }), _jsx("input", { type: "number", min: "1", value: filterSettings.maxVisitCount, onChange: (e) => setFilterSettings(prev => ({ ...prev, maxVisitCount: parseInt(e.target.value) || 999 })), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u5FC5\u8981\u306A\u9023\u7D61\u624B\u6BB5" }), _jsx("div", { className: "space-y-2", children: [
                                                                    { key: 'LINE', label: 'LINE', icon: MessageCircle, color: 'text-green-600' },
                                                                    { key: 'INSTAGRAM', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
                                                                    { key: 'EMAIL', label: 'メール', icon: Mail, color: 'text-blue-600' }
                                                                ].map((channel) => {
                                                                    const Icon = channel.icon;
                                                                    return (_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: filterSettings.requiredChannels.includes(channel.key), onChange: (e) => {
                                                                                    if (e.target.checked) {
                                                                                        setFilterSettings(prev => ({
                                                                                            ...prev,
                                                                                            requiredChannels: [...prev.requiredChannels, channel.key]
                                                                                        }));
                                                                                    }
                                                                                    else {
                                                                                        setFilterSettings(prev => ({
                                                                                            ...prev,
                                                                                            requiredChannels: prev.requiredChannels.filter(c => c !== channel.key)
                                                                                        }));
                                                                                    }
                                                                                }, className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2" }), _jsx(Icon, { className: `w-4 h-4 mr-1 ${channel.color}` }), _jsx("span", { className: "text-sm text-gray-700", children: channel.label })] }, channel.key));
                                                                }) }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "\u203B \u9078\u629E\u3057\u305F\u9023\u7D61\u624B\u6BB5\u306E\u3044\u305A\u308C\u304B\u3092\u6301\u3064\u9867\u5BA2\u306E\u307F\u5BFE\u8C61\u306B\u306A\u308A\u307E\u3059" })] })] })] }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-5 h-5 text-blue-600 mr-2" }), _jsxs("span", { className: "font-medium text-blue-900", children: ["\u5BFE\u8C61\u9867\u5BA2: ", filteredCustomers.length, "\u540D"] })] }), _jsxs("div", { className: "text-sm text-blue-700", children: ["\u5168\u9867\u5BA2 ", customers.length, "\u540D\u4E2D"] })] }) }), _jsx("div", { className: "flex justify-end", children: _jsx("button", { onClick: () => setStep('compose'), disabled: filteredCustomers.length === 0, className: "btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed", children: "\u6B21\u3078 (\u30E1\u30C3\u30BB\u30FC\u30B8\u4F5C\u6210)" }) })] })), step === 'compose' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900", children: ["\u9001\u4FE1\u30E1\u30C3\u30BB\u30FC\u30B8\u4F5C\u6210 (\u5BFE\u8C61: ", filteredCustomers.length, "\u540D)"] }), _jsx("button", { onClick: () => setStep('filter'), className: "btn btn-secondary btn-sm", children: "\u6761\u4EF6\u3092\u5909\u66F4" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u9078\u629E" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: Object.entries(messageTemplates).map(([key, template]) => (_jsxs("button", { onClick: () => handleTemplateSelect(key), className: `p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors ${messageTemplate === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`, children: [_jsx("div", { className: "font-medium text-gray-900 text-sm", children: template.title }), _jsxs("div", { className: "text-xs text-gray-600 mt-1 line-clamp-2", children: [template.content.split('\n')[0], "..."] })] }, key))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30E1\u30C3\u30BB\u30FC\u30B8\u5185\u5BB9" }), _jsx("textarea", { rows: 8, value: message, onChange: (e) => setMessage(e.target.value), placeholder: "\u9001\u4FE1\u3059\u308B\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044...", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["\u203B ", '{name}', " \u306F\u9867\u5BA2\u540D\u306B\u81EA\u52D5\u7F6E\u63DB\u3055\u308C\u307E\u3059"] })] }), message && filteredCustomers.length > 0 && (_jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-4", children: [_jsxs("h4", { className: "font-medium text-gray-900 mb-2", children: ["\u30D7\u30EC\u30D3\u30E5\u30FC (", filteredCustomers[0].name, "\u69D8\u306E\u5834\u5408)"] }), _jsx("div", { className: "bg-white p-3 rounded border text-sm whitespace-pre-line", children: personalizeMessage(message, filteredCustomers[0]) })] })), _jsxs("div", { className: "flex justify-between", children: [_jsx("button", { onClick: () => setStep('filter'), className: "btn btn-secondary", children: "\u623B\u308B" }), _jsx("button", { onClick: () => setStep('preview'), disabled: !message.trim(), className: "btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed", children: "\u6B21\u3078 (\u9001\u4FE1\u78BA\u8A8D)" })] })] })), step === 'preview' && (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "\u9001\u4FE1\u78BA\u8A8D" }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-blue-900 mb-3", children: "\u9001\u4FE1\u6982\u8981" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-4 h-4 text-blue-600 mr-2" }), _jsxs("span", { children: ["\u5BFE\u8C61\u9867\u5BA2: ", _jsxs("strong", { children: [filteredCustomers.length, "\u540D"] })] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(MessageCircle, { className: "w-4 h-4 text-green-600 mr-2" }), _jsxs("span", { children: ["LINE: ", filteredCustomers.filter(c => c.lineId).length, "\u540D"] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Instagram, { className: "w-4 h-4 text-pink-600 mr-2" }), _jsxs("span", { children: ["Instagram: ", filteredCustomers.filter(c => !c.lineId && c.instagramId).length, "\u540D"] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Mail, { className: "w-4 h-4 text-blue-600 mr-2" }), _jsxs("span", { children: ["Email: ", filteredCustomers.filter(c => !c.lineId && !c.instagramId && c.email).length, "\u540D"] })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "\u9001\u4FE1\u5BFE\u8C61\u9867\u5BA2\u4E00\u89A7" }), _jsx("div", { className: "border border-gray-200 rounded-lg max-h-64 overflow-y-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "bg-gray-50 sticky top-0", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left text-xs font-medium text-gray-500", children: "\u9867\u5BA2\u540D" }), _jsx("th", { className: "px-4 py-2 text-left text-xs font-medium text-gray-500", children: "\u9001\u4FE1\u65B9\u6CD5" }), _jsx("th", { className: "px-4 py-2 text-left text-xs font-medium text-gray-500", children: "\u6700\u7D42\u6765\u5E97" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: filteredCustomers.map((customer) => {
                                                                const channelInfo = getCustomerChannel(customer);
                                                                return (_jsxs("tr", { children: [_jsxs("td", { className: "px-4 py-2 text-sm font-medium text-gray-900", children: [customer.customerNumber, " ", customer.name] }), _jsx("td", { className: "px-4 py-2 text-sm", children: _jsxs("div", { className: "flex items-center", children: [channelInfo.icon, _jsx("span", { className: "ml-1", children: channelInfo.channel })] }) }), _jsx("td", { className: "px-4 py-2 text-sm text-gray-600", children: customer.lastVisitDate
                                                                                ? format(new Date(customer.lastVisitDate), 'M/d', { locale: ja })
                                                                                : '来店なし' })] }, customer.id));
                                                            }) })] }) })] }), isDevelopment && (_jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-yellow-600 mr-2" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-yellow-800", children: "\u958B\u767A\u74B0\u5883\u3067\u306E\u5236\u9650" }), _jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "\u5B9F\u969B\u306E\u5916\u90E8\u9001\u4FE1\u306F\u672C\u756A\u74B0\u5883\u3067\u306E\u307F\u5B9F\u884C\u3055\u308C\u307E\u3059\u3002\u958B\u767A\u74B0\u5883\u3067\u306F\u9001\u4FE1\u51E6\u7406\u304C\u30B7\u30DF\u30E5\u30EC\u30FC\u30B7\u30E7\u30F3\u3055\u308C\u307E\u3059\u3002" })] })] }) })), _jsxs("div", { className: "flex justify-between", children: [_jsx("button", { onClick: () => setStep('compose'), className: "btn btn-secondary", children: "\u623B\u308B" }), _jsxs("button", { onClick: handleSend, className: "btn btn-primary", disabled: isSending, children: [_jsx(Send, { className: "w-4 h-4 mr-2" }), isSending ? '送信中...' : `${filteredCustomers.length}名に一斉送信`] })] })] })), step === 'sending' && (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "\u9001\u4FE1\u4E2D..." }), _jsxs("p", { className: "text-gray-600", children: [filteredCustomers.length, "\u540D\u306E\u9867\u5BA2\u306B\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u9001\u4FE1\u3057\u3066\u3044\u307E\u3059"] })] })), step === 'complete' && (_jsxs("div", { className: "text-center py-8", children: [_jsx(CheckCircle, { className: "w-16 h-16 text-green-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "\u9001\u4FE1\u5B8C\u4E86\uFF01" }), _jsxs("p", { className: "text-gray-600 mb-6", children: [filteredCustomers.length, "\u540D\u306E\u9867\u5BA2\u306B\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u9001\u4FE1\u3057\u307E\u3057\u305F"] }), _jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto", children: [_jsx("h4", { className: "font-medium text-green-900 mb-2", children: "\u9001\u4FE1\u7D50\u679C" }), _jsxs("div", { className: "text-sm text-green-800 space-y-1", children: [_jsxs("div", { children: ["\u2705 LINE: ", filteredCustomers.filter(c => c.lineId).length, "\u540D"] }), _jsxs("div", { children: ["\u2705 Instagram: ", filteredCustomers.filter(c => !c.lineId && c.instagramId).length, "\u540D"] }), _jsxs("div", { children: ["\u2705 Email: ", filteredCustomers.filter(c => !c.lineId && !c.instagramId && c.email).length, "\u540D"] })] })] }), _jsx("button", { onClick: resetAndClose, className: "btn btn-primary mt-6", children: "\u5B8C\u4E86" })] }))] }) }) }), _jsx(ProductionWarningModal, { isOpen: isWarningOpen, onClose: () => setIsWarningOpen(false), feature: currentFeature, type: "warning", showDetails: true })] }));
};
// プラン制限を適用したBulkMessageSender
const BulkMessageSender = (props) => {
    const { subscriptionInfo } = useSubscription();
    const navigate = useNavigate();
    if (!props.isOpen)
        return null;
    return (_jsx(FeatureGate, { feature: "aiReplyGeneration", fallback: _jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-lg max-w-md w-full p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "\u6A5F\u80FD\u5236\u9650" }), _jsx("button", { onClick: props.onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsx(LimitWarning, { limitType: "maxAIRepliesPerMonth", currentValue: subscriptionInfo?.currentUsage.aiRepliesThisMonth || 0, className: "mb-4" }), _jsx("p", { className: "text-gray-600 text-sm mb-4", children: "\u4E00\u62EC\u30E1\u30C3\u30BB\u30FC\u30B8\u9001\u4FE1\u6A5F\u80FD\u306F\u3001\u30B9\u30BF\u30F3\u30C0\u30FC\u30C9\u30D7\u30E9\u30F3\u4EE5\u4E0A\u3067\u3054\u5229\u7528\u3044\u305F\u3060\u3051\u307E\u3059\u3002" }), _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: props.onClose, className: "flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200", children: "\u9589\u3058\u308B" }), _jsx("button", { onClick: () => {
                                    props.onClose();
                                    navigate('/settings/upgrade');
                                }, className: "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9" })] })] }) }), children: _jsx(BulkMessageSenderCore, { ...props }) }));
};
export default BulkMessageSender;
