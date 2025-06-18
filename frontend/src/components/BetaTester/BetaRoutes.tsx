import React from 'react';
import BetaRecruitmentLanding from './BetaRecruitmentLanding';
import BetaTestDashboard from './BetaTestDashboard';
import BetaTesterOnboarding from './BetaTesterOnboarding';

interface BetaRoutesProps {
  currentView: string;
}

const BetaRoutes: React.FC<BetaRoutesProps> = ({ currentView }) => {
  switch (currentView) {
    case 'beta-landing':
      return <BetaRecruitmentLanding />;
    case 'beta-dashboard':
      return <BetaTestDashboard />;
    case 'beta-onboarding':
      return <BetaTesterOnboarding userName="ベータテスター" onComplete={() => console.log('Onboarding completed')} />;
    default:
      return <BetaRecruitmentLanding />;
  }
};

export default BetaRoutes;