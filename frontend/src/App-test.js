import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
function App() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        console.log('App component mounted');
        fetch('http://localhost:4002/api/v1/customers')
            .then(response => {
            console.log('API response received:', response.status);
            return response.json();
        })
            .then(data => {
            console.log('Data received:', data);
            setData(data);
            setLoading(false);
        })
            .catch(err => {
            console.error('API error:', err);
            setError(err.message);
            setLoading(false);
        });
    }, []);
    console.log('App render - loading:', loading, 'error:', error, 'data:', data);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsx("div", { className: "text-xl", children: "\uD83D\uDD04 \u8AAD\u307F\u8FBC\u307F\u4E2D..." }) }));
    }
    if (error) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-xl text-red-500", children: ["\u274C \u30A8\u30E9\u30FC: ", error] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-8", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold mb-8 text-center", children: "\uD83C\uDFEA \u7F8E\u5BB9\u5BA4\u7D71\u5408\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0" }), _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6 mb-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "\uD83D\uDCCA \u30B7\u30B9\u30C6\u30E0\u72B6\u6CC1" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-green-500 rounded-full" }), _jsx("span", { className: "font-medium", children: "\u30D5\u30ED\u30F3\u30C8\u30A8\u30F3\u30C9" })] }), _jsx("div", { className: "text-sm text-green-700 mt-1", children: "http://localhost:4003/ \u2705 \u7A3C\u50CD\u4E2D" })] }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-blue-500 rounded-full" }), _jsx("span", { className: "font-medium", children: "\u30D0\u30C3\u30AF\u30A8\u30F3\u30C9API" })] }), _jsx("div", { className: "text-sm text-blue-700 mt-1", children: "http://localhost:4002/ \u2705 \u7A3C\u50CD\u4E2D" })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h3", { className: "font-medium mb-3", children: "\uD83D\uDCCB \u9867\u5BA2\u30C7\u30FC\u30BF\u53D6\u5F97\u7D50\u679C:" }), _jsxs("div", { className: "text-sm bg-white border rounded p-3 overflow-auto max-h-64", children: [_jsxs("div", { className: "mb-2 font-medium text-green-600", children: ["\u2705 \u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u63A5\u7D9A\u6210\u529F - ", data?.customers?.length || 0, "\u4EF6\u306E\u9867\u5BA2\u30C7\u30FC\u30BF\u3092\u53D6\u5F97"] }), _jsx("pre", { className: "whitespace-pre-wrap", children: JSON.stringify(data, null, 2) })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "\uD83E\uDDEA \u30C6\u30B9\u30C8\u64CD\u4F5C" }), _jsxs("div", { className: "space-x-4", children: [_jsx("button", { onClick: () => window.location.reload(), className: "bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors", children: "\uD83D\uDD04 \u518D\u8AAD\u307F\u8FBC\u307F" }), _jsx("button", { onClick: () => {
                                        window.location.href = './App-full.tsx';
                                    }, className: "bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors", children: "\uD83D\uDE80 \u30D5\u30EB\u6A5F\u80FD\u7248\u306B\u623B\u308B" })] })] })] }) }));
}
export default App;
