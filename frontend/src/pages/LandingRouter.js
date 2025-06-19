import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import RealisticLandingPage from './RealisticLandingPage';
import PremiumLandingPage from './PremiumLandingPage';
const LandingRouter = () => {
    return (_jsx(Router, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/lp/default", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/lp/realistic", element: _jsx(RealisticLandingPage, {}) }), _jsx(Route, { path: "/lp/premium", element: _jsx(PremiumLandingPage, {}) }), _jsx(Route, { path: "/lp", element: _jsx(Navigate, { to: "/lp/realistic", replace: true }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/lp/realistic", replace: true }) })] }) }));
};
export default LandingRouter;
