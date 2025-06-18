import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, XCircle, Mail, Phone, Building, BarChart3, Search, Filter, Download } from 'lucide-react';
const BetaApplicationDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [showReviewModal, setShowReviewModal] = useState(false);
    useEffect(() => {
        fetchApplications();
        fetchStats();
    }, []);
    const fetchApplications = async () => {
        try {
            const response = await fetch('/api/v1/beta-applications');
            const data = await response.json();
            if (data.success) {
                setApplications(data.data);
            }
        }
        catch (error) {
            console.error('Error fetching applications:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchStats = async () => {
        try {
            const response = await fetch('/api/v1/beta-applications/stats');
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        }
        catch (error) {
            console.error('Error fetching stats:', error);
        }
    };
    const updateApplicationStatus = async (applicationId, status) => {
        try {
            const response = await fetch(`/api/v1/beta-applications/${applicationId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status,
                    reviewNotes
                }),
            });
            if (response.ok) {
                await fetchApplications();
                await fetchStats();
                setShowReviewModal(false);
                setSelectedApplication(null);
                setReviewNotes('');
            }
        }
        catch (error) {
            console.error('Error updating application status:', error);
        }
    };
    const openReviewModal = (application) => {
        setSelectedApplication(application);
        setReviewNotes(application.reviewNotes || '');
        setShowReviewModal(true);
    };
    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.salonName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'in_review': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return _jsx(Clock, { className: "w-4 h-4" });
            case 'approved': return _jsx(CheckCircle, { className: "w-4 h-4" });
            case 'rejected': return _jsx(XCircle, { className: "w-4 h-4" });
            case 'in_review': return _jsx(BarChart3, { className: "w-4 h-4" });
            default: return _jsx(Clock, { className: "w-4 h-4" });
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "\u30D9\u30FC\u30BF\u30C6\u30B9\u30C8\u7533\u3057\u8FBC\u307F\u7BA1\u7406" }), _jsxs("button", { className: "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "CSV\u51FA\u529B"] })] }), stats && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [_jsx("div", { className: "bg-white p-6 rounded-xl shadow-sm border", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-8 h-8 text-blue-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u7DCF\u7533\u3057\u8FBC\u307F\u6570" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: stats.totalApplications })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-xl shadow-sm border", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Clock, { className: "w-8 h-8 text-yellow-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u5BE9\u67FB\u5F85\u3061" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: stats.pendingApplications })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-xl shadow-sm border", children: _jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-8 h-8 text-green-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u627F\u8A8D\u6E08\u307F" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: stats.approvedApplications })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-xl shadow-sm border", children: _jsxs("div", { className: "flex items-center", children: [_jsx(BarChart3, { className: "w-8 h-8 text-purple-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u627F\u8A8D\u7387" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [stats.approvalRate, "%"] })] })] }) })] })), _jsx("div", { className: "bg-white p-4 rounded-xl shadow-sm border", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" }), _jsx("input", { type: "text", placeholder: "\u540D\u524D\u3001\u30E1\u30FC\u30EB\u3001\u30B5\u30ED\u30F3\u540D\u3067\u691C\u7D22...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Filter, { className: "w-4 h-4 text-gray-400" }), _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "all", children: "\u5168\u30B9\u30C6\u30FC\u30BF\u30B9" }), _jsx("option", { value: "pending", children: "\u5BE9\u67FB\u5F85\u3061" }), _jsx("option", { value: "approved", children: "\u627F\u8A8D\u6E08\u307F" }), _jsx("option", { value: "rejected", children: "\u5374\u4E0B" }), _jsx("option", { value: "in_review", children: "\u5BE9\u67FB\u4E2D" })] })] })] }) }), _jsx("div", { className: "bg-white rounded-xl shadow-sm border overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u7533\u8ACB\u8005\u60C5\u5831" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u30B5\u30ED\u30F3\u60C5\u5831" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u30B9\u30C6\u30FC\u30BF\u30B9" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u7533\u8ACB\u65E5" }), _jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u30A2\u30AF\u30B7\u30E7\u30F3" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: filteredApplications.map((application) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: application.name }), _jsxs("div", { className: "text-sm text-gray-500 flex items-center", children: [_jsx(Mail, { className: "w-3 h-3 mr-1" }), application.email] }), _jsxs("div", { className: "text-sm text-gray-500 flex items-center", children: [_jsx(Phone, { className: "w-3 h-3 mr-1" }), application.phone] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { children: [_jsxs("div", { className: "text-sm font-medium text-gray-900 flex items-center", children: [_jsx(Building, { className: "w-3 h-3 mr-1" }), application.salonName] }), _jsxs("div", { className: "text-sm text-gray-500", children: [application.salonType, " \u2022 ", application.numberOfStylists, "\u540D"] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`, children: [getStatusIcon(application.status), _jsxs("span", { className: "ml-1", children: [application.status === 'pending' && '審査待ち', application.status === 'approved' && '承認済み', application.status === 'rejected' && '却下', application.status === 'in_review' && '審査中'] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: new Date(application.submittedAt).toLocaleDateString('ja-JP') }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: _jsx("button", { onClick: () => openReviewModal(application), className: "text-blue-600 hover:text-blue-900", children: "\u5BE9\u67FB" }) })] }, application.id))) })] }) }) }), showReviewModal && selectedApplication && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: ["\u7533\u8ACB\u5BE9\u67FB: ", selectedApplication.name] }), _jsxs("div", { className: "space-y-4 mb-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: "\u73FE\u5728\u306E\u8AB2\u984C" }), _jsx("p", { className: "text-gray-600", children: selectedApplication.painPoints })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: "\u671F\u5F85\u3059\u308B\u3053\u3068" }), _jsx("p", { className: "text-gray-600", children: selectedApplication.expectations })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: "\u30C6\u30B9\u30C8\u53EF\u80FD\u6642\u9593" }), _jsxs("p", { className: "text-gray-600", children: ["\u9031", selectedApplication.availableHours, "\u6642\u9593"] })] }), selectedApplication.referralSource && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: "\u53C2\u7167\u5143" }), _jsx("p", { className: "text-gray-600", children: selectedApplication.referralSource })] }))] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u5BE9\u67FB\u30E1\u30E2" }), _jsx("textarea", { value: reviewNotes, onChange: (e) => setReviewNotes(e.target.value), rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "\u5BE9\u67FB\u7D50\u679C\u3084\u6B21\u306E\u30B9\u30C6\u30C3\u30D7\u306B\u3064\u3044\u3066\u30E1\u30E2\u3092\u5165\u529B..." })] }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { onClick: () => setShowReviewModal(false), className: "px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx("button", { onClick: () => updateApplicationStatus(selectedApplication.id, 'rejected'), className: "px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors", children: "\u5374\u4E0B" }), _jsx("button", { onClick: () => updateApplicationStatus(selectedApplication.id, 'in_review'), className: "px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors", children: "\u5BE9\u67FB\u4E2D" }), _jsx("button", { onClick: () => updateApplicationStatus(selectedApplication.id, 'approved'), className: "px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors", children: "\u627F\u8A8D" })] })] }) }) }))] }));
};
export default BetaApplicationDashboard;
