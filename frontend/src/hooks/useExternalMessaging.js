import { useState, useCallback } from 'react';
import { canSendExternalMessage, getRestrictionMessage, getEnvironmentConfig } from '../utils/environment';
export const useExternalMessaging = () => {
    const [isWarningOpen, setIsWarningOpen] = useState(false);
    const [currentFeature, setCurrentFeature] = useState('');
    const [isSending, setIsSending] = useState(false);
    const config = getEnvironmentConfig();
    /**
     * 外部メッセージ送信の試行
     */
    const attemptSendMessage = useCallback(async (messageData) => {
        // 環境チェック
        if (!canSendExternalMessage(messageData.type)) {
            setCurrentFeature(messageData.type);
            setIsWarningOpen(true);
            // 開発環境でのログ出力
            if (config.debugMode) {
                console.warn(`🚫 External messaging blocked: ${messageData.type}`, {
                    environment: config.isDevelopment ? 'development' : 'production',
                    feature: messageData.type,
                    message: getRestrictionMessage(messageData.type)
                });
            }
            return {
                success: false,
                error: getRestrictionMessage(messageData.type),
                restrictedByEnvironment: true
            };
        }
        setIsSending(true);
        try {
            // 本番環境での実際の送信処理
            const result = await performActualSend(messageData);
            // 成功ログ
            if (config.debugMode) {
                console.log(`✅ External message sent successfully: ${messageData.type}`, {
                    messageId: result.messageId,
                    recipients: messageData.recipients.length
                });
            }
            return result;
        }
        catch (error) {
            console.error(`❌ External messaging error: ${messageData.type}`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'メッセージ送信に失敗しました'
            };
        }
        finally {
            setIsSending(false);
        }
    }, [config]);
    /**
     * 実際の送信処理（本番環境でのみ実行）
     */
    const performActualSend = async (messageData) => {
        const { type, recipients, message, subject, templateId, scheduledAt } = messageData;
        const payload = {
            type,
            recipients,
            message,
            subject,
            templateId,
            scheduledAt: scheduledAt?.toISOString(),
            timestamp: new Date().toISOString()
        };
        switch (type) {
            case 'line':
                return await sendLineMessage(payload);
            case 'instagram':
                return await sendInstagramDM(payload);
            case 'sms':
                return await sendSMS(payload);
            case 'email':
                return await sendEmail(payload);
            default:
                throw new Error(`Unsupported message type: ${type}`);
        }
    };
    /**
     * LINE メッセージ送信
     */
    const sendLineMessage = async (payload) => {
        const response = await fetch(`${config.apiBaseURL}/api/messaging/line/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error('LINE メッセージの送信に失敗しました');
        }
        const result = await response.json();
        return {
            success: true,
            messageId: result.messageId
        };
    };
    /**
     * Instagram DM送信
     */
    const sendInstagramDM = async (payload) => {
        const response = await fetch(`${config.apiBaseURL}/api/messaging/instagram/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error('Instagram DMの送信に失敗しました');
        }
        const result = await response.json();
        return {
            success: true,
            messageId: result.messageId
        };
    };
    /**
     * SMS送信
     */
    const sendSMS = async (payload) => {
        const response = await fetch(`${config.apiBaseURL}/api/messaging/sms/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error('SMSの送信に失敗しました');
        }
        const result = await response.json();
        return {
            success: true,
            messageId: result.messageId
        };
    };
    /**
     * メール送信
     */
    const sendEmail = async (payload) => {
        const response = await fetch(`${config.apiBaseURL}/api/messaging/email/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error('メールの送信に失敗しました');
        }
        const result = await response.json();
        return {
            success: true,
            messageId: result.messageId
        };
    };
    /**
     * 特定の機能が利用可能かチェック
     */
    const checkFeatureAvailability = useCallback((feature) => {
        switch (feature) {
            case 'line':
                return canSendExternalMessage('line');
            case 'instagram':
                return canSendExternalMessage('instagram');
            case 'sms':
                return canSendExternalMessage('sms');
            case 'email':
                return canSendExternalMessage('email');
            default:
                return false;
        }
    }, []);
    /**
     * 警告表示を試行
     */
    const showRestrictionWarning = useCallback((feature) => {
        setCurrentFeature(feature);
        setIsWarningOpen(true);
    }, []);
    return {
        // 送信機能
        attemptSendMessage,
        // 状態
        isSending,
        isWarningOpen,
        currentFeature,
        // 制御
        setIsWarningOpen,
        checkFeatureAvailability,
        showRestrictionWarning,
        // 環境情報
        isDevelopment: config.isDevelopment,
        isProduction: config.isProduction
    };
};
