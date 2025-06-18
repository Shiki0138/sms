import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { MessageSquare, X, Bug, Lightbulb, Star } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
const FeedbackButton = ({ userId, userEmail, userName, isBetaUser = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showQuickRating, setShowQuickRating] = useState(false);
    const [quickRating, setQuickRating] = useState(0);
    const handleQuickRating = async (rating) => {
        setQuickRating(rating);
        // Send quick rating to backend
        try {
            await fetch('/api/v1/feedback/quick-rating', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    rating,
                    userId,
                    userEmail,
                    timestamp: new Date().toISOString()
                })
            });
            // Show thank you message
            setTimeout(() => {
                setShowQuickRating(false);
                setQuickRating(0);
            }, 2000);
        }
        catch (error) {
            console.error('Failed to send quick rating:', error);
        }
    };
    if (!isBetaUser) {
        return null;
    }
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "fixed bottom-6 right-6 z-40", children: [showQuickRating && (_jsxs("div", { className: "absolute bottom-16 right-0 bg-white rounded-lg shadow-xl p-4 w-64 mb-2 border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "\u4ECA\u65E5\u306E\u4F7F\u3044\u5FC3\u5730\u306F\uFF1F" }), _jsx("button", { onClick: () => setShowQuickRating(false), className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "flex justify-center space-x-2", children: [1, 2, 3, 4, 5].map((star) => (_jsx("button", { onClick: () => handleQuickRating(star), className: "p-1 hover:scale-110 transition-transform", children: _jsx(Star, { className: `w-6 h-6 ${star <= quickRating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'}` }) }, star))) }), quickRating > 0 && (_jsx("p", { className: "text-center text-sm text-green-600 mt-2", children: "\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\uFF01" }))] })), _jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setIsOpen(true), className: "group bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200", children: [_jsx(MessageSquare, { className: "w-6 h-6" }), _jsx("span", { className: "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse", children: "\u03B2" })] }), _jsx("div", { className: "absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity", children: _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-2 space-y-1", children: [_jsxs("button", { onClick: () => {
                                                setIsOpen(true);
                                                // Set feedback type to bug
                                            }, className: "flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md w-full", children: [_jsx(Bug, { className: "w-4 h-4 text-red-500" }), _jsx("span", { children: "\u30D0\u30B0\u5831\u544A" })] }), _jsxs("button", { onClick: () => {
                                                setIsOpen(true);
                                                // Set feedback type to feature
                                            }, className: "flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md w-full", children: [_jsx(Lightbulb, { className: "w-4 h-4 text-yellow-500" }), _jsx("span", { children: "\u6A5F\u80FD\u8981\u671B" })] }), _jsxs("button", { onClick: () => setShowQuickRating(true), className: "flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md w-full", children: [_jsx(Star, { className: "w-4 h-4 text-blue-500" }), _jsx("span", { children: "\u8A55\u4FA1\u3059\u308B" })] })] }) })] })] }), _jsx(FeedbackModal, { isOpen: isOpen, onClose: () => setIsOpen(false), userId: userId, userEmail: userEmail, userName: userName })] }));
};
export default FeedbackButton;
