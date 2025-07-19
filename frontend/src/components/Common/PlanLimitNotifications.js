import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSubscription } from '../../contexts/SubscriptionContext';
import LimitWarning from './LimitWarning';
const PlanLimitNotifications = () => {
    const { subscriptionInfo } = useSubscription();
    if (!subscriptionInfo)
        return null;
    const { currentUsage } = subscriptionInfo;
    return (_jsxs("div", { className: "space-y-3", children: [_jsx(LimitWarning, { limitType: "maxCustomers", currentValue: currentUsage.customerCount, warningThreshold: 0.8 }), _jsx(LimitWarning, { limitType: "maxStaff", currentValue: currentUsage.staffCount, warningThreshold: 0.8 }), _jsx(LimitWarning, { limitType: "maxAIRepliesPerMonth", currentValue: currentUsage.aiRepliesThisMonth, warningThreshold: 0.8 }), _jsx(LimitWarning, { limitType: "maxDataExport", currentValue: currentUsage.dataExportsThisMonth, warningThreshold: 0.8 })] }));
};
export default PlanLimitNotifications;
