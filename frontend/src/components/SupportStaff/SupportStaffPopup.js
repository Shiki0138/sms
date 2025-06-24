import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import axios from 'axios';
import './SupportStaffPopup.css';
const SupportStaffPopup = ({ isOpen, onClose, workDate, requiredSkills, location }) => {
    const [availableStaff, setAvailableStaff] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [requestDetails, setRequestDetails] = useState({
        title: '',
        description: '',
        startTime: '09:00',
        endTime: '18:00',
        hourlyRate: 0,
        transportationFee: 0,
        urgencyLevel: 'NORMAL'
    });
    useEffect(() => {
        if (isOpen) {
            searchAvailableStaff();
        }
    }, [isOpen, workDate, requiredSkills, location]);
    const searchAvailableStaff = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/v1/support-staff/search', {
                params: {
                    lat: location.lat,
                    lng: location.lng,
                    date: workDate,
                    skills: JSON.stringify(requiredSkills),
                    maxDistance: 30
                }
            });
            setAvailableStaff(response.data);
        }
        catch (error) {
            console.error('Error searching available staff:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleStaffSelect = (staff) => {
        setSelectedStaff(staff);
        setRequestDetails(prev => ({
            ...prev,
            hourlyRate: staff.availability.hourlyRate
        }));
    };
    const handleSubmitRequest = async () => {
        if (!selectedStaff)
            return;
        try {
            await axios.post('/api/v1/support-staff/requests', {
                ...requestDetails,
                requiredSkills,
                workDate,
                location: `${location.lat},${location.lng}`,
                latitude: location.lat,
                longitude: location.lng
            });
            alert('応援依頼を送信しました！');
            onClose();
        }
        catch (error) {
            console.error('Error submitting request:', error);
            alert('エラーが発生しました');
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "support-staff-popup-overlay", children: _jsxs("div", { className: "support-staff-popup", children: [_jsxs("div", { className: "popup-header", children: [_jsx("h2", { children: "\u5FDC\u63F4\u30B9\u30BF\u30C3\u30D5\u3092\u63A2\u3059" }), _jsx("button", { className: "close-button", onClick: onClose, children: "\u00D7" })] }), loading ? (_jsx("div", { className: "loading", children: "\u691C\u7D22\u4E2D..." })) : (_jsx(_Fragment, { children: !selectedStaff ? (_jsxs("div", { className: "staff-list", children: [_jsxs("h3", { children: ["\u5229\u7528\u53EF\u80FD\u306A\u30B9\u30BF\u30C3\u30D5\uFF08", availableStaff.length, "\u540D\uFF09"] }), availableStaff.map(staff => (_jsx("div", { className: "staff-card", onClick: () => handleStaffSelect(staff), children: _jsxs("div", { className: "staff-info", children: [_jsx("div", { className: "staff-photo", children: staff.profilePhoto ? (_jsx("img", { src: staff.profilePhoto, alt: staff.name })) : (_jsx("div", { className: "photo-placeholder", children: staff.name.charAt(0) })) }), _jsxs("div", { className: "staff-details", children: [_jsx("h4", { children: staff.name }), _jsxs("p", { className: "experience", children: ["\u7D4C\u9A13: ", staff.experience, "\u5E74"] }), _jsxs("p", { className: "skills", children: ["\u30B9\u30AD\u30EB: ", staff.skills.join(', ')] }), _jsxs("div", { className: "staff-meta", children: [_jsxs("span", { className: "rating", children: ["\u2605 ", staff.rating] }), _jsxs("span", { className: "completed", children: ["\u5B8C\u4E86: ", staff.completedCount, "\u4EF6"] }), staff.distance && (_jsxs("span", { className: "distance", children: [staff.distance.toFixed(1), "km"] }))] }), _jsxs("p", { className: "hourly-rate", children: ["\u6642\u7D66: \u00A5", staff.availability.hourlyRate.toLocaleString()] })] })] }) }, staff.id)))] })) : (_jsxs("div", { className: "request-form", children: [_jsxs("div", { className: "selected-staff", children: [_jsx("h3", { children: "\u9078\u629E\u3057\u305F\u30B9\u30BF\u30C3\u30D5" }), _jsxs("div", { className: "staff-summary", children: [_jsx("strong", { children: selectedStaff.name }), _jsx("button", { className: "change-staff", onClick: () => setSelectedStaff(null), children: "\u5909\u66F4" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u4F9D\u983C\u30BF\u30A4\u30C8\u30EB" }), _jsx("input", { type: "text", value: requestDetails.title, onChange: (e) => setRequestDetails(prev => ({
                                            ...prev,
                                            title: e.target.value
                                        })), placeholder: "\u4F8B: \u571F\u66DC\u65E5\u306E\u5FDC\u63F4\u30B9\u30BF\u30C3\u30D5\u52DF\u96C6" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u8A73\u7D30\u8AAC\u660E" }), _jsx("textarea", { value: requestDetails.description, onChange: (e) => setRequestDetails(prev => ({
                                            ...prev,
                                            description: e.target.value
                                        })), placeholder: "\u696D\u52D9\u5185\u5BB9\u306E\u8A73\u7D30\u3092\u8A18\u5165\u3057\u3066\u304F\u3060\u3055\u3044", rows: 4 })] }), _jsxs("div", { className: "time-group", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u958B\u59CB\u6642\u9593" }), _jsx("input", { type: "time", value: requestDetails.startTime, onChange: (e) => setRequestDetails(prev => ({
                                                    ...prev,
                                                    startTime: e.target.value
                                                })) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u7D42\u4E86\u6642\u9593" }), _jsx("input", { type: "time", value: requestDetails.endTime, onChange: (e) => setRequestDetails(prev => ({
                                                    ...prev,
                                                    endTime: e.target.value
                                                })) })] })] }), _jsxs("div", { className: "payment-group", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u6642\u7D66" }), _jsx("input", { type: "number", value: requestDetails.hourlyRate, onChange: (e) => setRequestDetails(prev => ({
                                                    ...prev,
                                                    hourlyRate: Number(e.target.value)
                                                })) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u4EA4\u901A\u8CBB" }), _jsx("input", { type: "number", value: requestDetails.transportationFee, onChange: (e) => setRequestDetails(prev => ({
                                                    ...prev,
                                                    transportationFee: Number(e.target.value)
                                                })) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u7DCA\u6025\u5EA6" }), _jsxs("select", { value: requestDetails.urgencyLevel, onChange: (e) => setRequestDetails(prev => ({
                                            ...prev,
                                            urgencyLevel: e.target.value
                                        })), children: [_jsx("option", { value: "LOW", children: "\u4F4E" }), _jsx("option", { value: "NORMAL", children: "\u901A\u5E38" }), _jsx("option", { value: "HIGH", children: "\u9AD8" }), _jsx("option", { value: "URGENT", children: "\u7DCA\u6025" })] })] }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { className: "cancel-button", onClick: () => setSelectedStaff(null), children: "\u623B\u308B" }), _jsx("button", { className: "submit-button", onClick: handleSubmitRequest, disabled: !requestDetails.title || !requestDetails.description, children: "\u4F9D\u983C\u3092\u9001\u4FE1" })] })] })) }))] }) }));
};
export default SupportStaffPopup;
