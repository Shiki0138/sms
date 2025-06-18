import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import LandingPage from './pages/LandingPage';
import RealisticLandingPage from './pages/RealisticLandingPage';
import './styles/landing.css';
// アプリケーションのメインコンポーネント
function App() {
    return (_jsx(AuthProvider, { children: _jsx(SubscriptionProvider, { children: _jsx(Router, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/landing", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/realistic", element: _jsx(RealisticLandingPage, {}) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/realistic", replace: true }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/realistic", replace: true }) })] }) }) }) }));
}
export default App;
