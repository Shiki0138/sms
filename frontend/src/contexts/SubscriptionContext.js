import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { PLAN_CONFIGS } from '../types/subscription';
const SubscriptionContext = createContext(undefined);
export const SubscriptionProvider = ({ children, initialPlan = 'light' // デモ用にライトプランを初期設定（制限を確認できるよう）
 }) => {
    const [subscriptionInfo, setSubscriptionInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // 初期化処理
    useEffect(() => {
        const initializeSubscription = () => {
            try {
                // LocalStorageから設定を読み込み
                const savedPlan = localStorage.getItem('salon_subscription_plan');
                const plan = savedPlan || initialPlan;
                const config = PLAN_CONFIGS[plan];
                const subscriptionData = {
                    plan,
                    limits: config.limits,
                    features: config.features,
                    currentUsage: {
                        staffCount: plan === 'light' ? 2 : 4, // ライトプランでは制限近く
                        customerCount: plan === 'light' ? 450 : 15, // ライトプランでは90%使用
                        aiRepliesThisMonth: plan === 'light' ? 0 : plan === 'standard' ? 180 : 12, // スタンダードで90%使用
                        dataExportsThisMonth: plan === 'light' ? 2 : 2 // ライトプランでは上限近く
                    },
                    billingCycle: 'monthly',
                    nextBillingDate: '2024-07-15T00:00:00Z',
                    isActive: true,
                    isTrialPeriod: false
                };
                setSubscriptionInfo(subscriptionData);
                setIsLoading(false);
            }
            catch (error) {
                console.error('サブスクリプション情報の初期化に失敗:', error);
                setIsLoading(false);
            }
        };
        initializeSubscription();
    }, [initialPlan]);
    const hasFeature = (feature) => {
        if (!subscriptionInfo)
            return false;
        return subscriptionInfo.features[feature];
    };
    const isWithinLimit = (limitType, currentValue) => {
        if (!subscriptionInfo)
            return false;
        const limit = subscriptionInfo.limits[limitType];
        // -1は無制限を表す
        if (typeof limit === 'number' && limit === -1)
            return true;
        if (typeof limit === 'number')
            return currentValue <= limit;
        return true;
    };
    const getRemainingLimit = (limitType, currentValue) => {
        if (!subscriptionInfo)
            return null;
        const limit = subscriptionInfo.limits[limitType];
        // -1は無制限を表す
        if (typeof limit === 'number' && limit === -1)
            return null;
        if (typeof limit === 'number')
            return Math.max(0, limit - currentValue);
        return null;
    };
    const upgradePlan = async (newPlan) => {
        try {
            if (!subscriptionInfo)
                return false;
            const newConfig = PLAN_CONFIGS[newPlan];
            const updatedSubscription = {
                ...subscriptionInfo,
                plan: newPlan,
                limits: newConfig.limits,
                features: newConfig.features
            };
            setSubscriptionInfo(updatedSubscription);
            localStorage.setItem('salon_subscription_plan', newPlan);
            return true;
        }
        catch (error) {
            console.error('プランアップグレードに失敗:', error);
            return false;
        }
    };
    const contextValue = {
        subscriptionInfo,
        currentPlan: subscriptionInfo?.plan || initialPlan,
        limits: subscriptionInfo?.limits || PLAN_CONFIGS[initialPlan].limits,
        features: subscriptionInfo?.features || PLAN_CONFIGS[initialPlan].features,
        hasFeature,
        isWithinLimit,
        getRemainingLimit,
        upgradePlan,
        isLoading
    };
    return (_jsx(SubscriptionContext.Provider, { value: contextValue, children: children }));
};
export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};
export default SubscriptionContext;
