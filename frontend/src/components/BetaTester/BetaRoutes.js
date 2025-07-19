import { jsx as _jsx } from "react/jsx-runtime";
import BetaRecruitmentLanding from './BetaRecruitmentLanding';
import BetaTestDashboard from './BetaTestDashboard';
import BetaTesterOnboarding from './BetaTesterOnboarding';
const BetaRoutes = ({ currentView }) => {
    switch (currentView) {
        case 'beta-landing':
            return _jsx(BetaRecruitmentLanding, {});
        case 'beta-dashboard':
            return _jsx(BetaTestDashboard, {});
        case 'beta-onboarding':
            return _jsx(BetaTesterOnboarding, { userName: "\u30D9\u30FC\u30BF\u30C6\u30B9\u30BF\u30FC", onComplete: () => console.log('Onboarding completed') });
        default:
            return _jsx(BetaRecruitmentLanding, {});
    }
};
export default BetaRoutes;
