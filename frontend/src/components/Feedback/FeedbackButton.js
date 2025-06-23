import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
const FeedbackButton = ({ userId, userEmail, userName, isBetaUser = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    if (!isBetaUser) {
        return null;
    }
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed bottom-6 right-6 z-40", children: _jsx("button", { onClick: () => setIsOpen(true), className: "bg-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200", title: "\u304A\u554F\u3044\u5408\u308F\u305B", children: _jsx(MessageSquare, { className: "w-6 h-6" }) }) }), _jsx(FeedbackModal, { isOpen: isOpen, onClose: () => setIsOpen(false), userId: userId, userEmail: userEmail, userName: userName })] }));
};
export default FeedbackButton;
