import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './LandingPage'
import RealisticLandingPage from './RealisticLandingPage'
import PremiumLandingPage from './PremiumLandingPage'

const LandingRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* ランディングページ */}
        <Route path="/lp/default" element={<LandingPage />} />
        <Route path="/lp/realistic" element={<RealisticLandingPage />} />
        <Route path="/lp/premium" element={<PremiumLandingPage />} />
        
        {/* デフォルトランディングページ */}
        <Route path="/lp" element={<Navigate to="/lp/realistic" replace />} />
        
        {/* 404リダイレクト */}
        <Route path="*" element={<Navigate to="/lp/realistic" replace />} />
      </Routes>
    </Router>
  )
}

export default LandingRouter