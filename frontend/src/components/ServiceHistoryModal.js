import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, Calendar, Clock, User, Scissors, Palette, Star, DollarSign, FileText, Save, Edit3, Camera, Image, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import CustomerPhotoUpload from './Customer/CustomerPhotoUpload';
const ServiceHistoryModal = ({ reservation, onClose, onUpdateStylistNotes }) => {
    const [editingNotes, setEditingNotes] = useState(false);
    const [notesContent, setNotesContent] = useState(reservation?.stylistNotes || '');
    const [beforePhotos, setBeforePhotos] = useState(reservation?.beforePhotos || []);
    const [afterPhotos, setAfterPhotos] = useState(reservation?.afterPhotos || []);
    const [showPhotoUpload, setShowPhotoUpload] = useState(null);
    const handleSaveNotes = () => {
        if (reservation) {
            onUpdateStylistNotes(reservation.id, notesContent);
            setEditingNotes(false);
        }
    };
    const handlePhotoUpdate = (photoUrl, type) => {
        if (type === 'before') {
            setBeforePhotos(prev => [...prev, photoUrl]);
        }
        else {
            setAfterPhotos(prev => [...prev, photoUrl]);
        }
        setShowPhotoUpload(null);
        // 実際の実装では、サーバーに送信して予約データを更新
        console.log(`${type} photo added:`, photoUrl);
    };
    const removePhoto = (index, type) => {
        if (type === 'before') {
            setBeforePhotos(prev => prev.filter((_, i) => i !== index));
        }
        else {
            setAfterPhotos(prev => prev.filter((_, i) => i !== index));
        }
    };
    const PhotoGallery = ({ photos, type, title }) => (_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 flex items-center", children: [_jsx(Camera, { className: "w-5 h-5 mr-2 text-blue-600" }), title] }), _jsxs("button", { onClick: () => setShowPhotoUpload(type), className: "flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "\u5199\u771F\u8FFD\u52A0" })] })] }), photos.length > 0 ? (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: photos.map((photo, index) => (_jsxs("div", { className: "relative group", children: [_jsx("img", { src: photo, alt: `${title} ${index + 1}`, className: "w-full h-24 object-cover rounded-lg border border-gray-200" }), _jsx("button", { onClick: () => removePhoto(index, type), className: "absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx(X, { className: "w-3 h-3" }) })] }, index))) })) : (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(Image, { className: "w-12 h-12 mx-auto mb-2 text-gray-400" }), _jsx("p", { className: "text-sm", children: "\u307E\u3060\u5199\u771F\u304C\u3042\u308A\u307E\u305B\u3093" }), _jsx("p", { className: "text-xs text-gray-400", children: "\u300C\u5199\u771F\u8FFD\u52A0\u300D\u30DC\u30BF\u30F3\u304B\u3089\u8FFD\u52A0\u3057\u3066\u304F\u3060\u3055\u3044" })] }))] }));
    const getSourceLabel = (source) => {
        const labels = {
            'HOTPEPPER': 'ホットペッパー',
            'GOOGLE_CALENDAR': 'Googleカレンダー',
            'PHONE': '電話予約',
            'WALK_IN': '当日来店',
            'MANUAL': '手動登録'
        };
        return labels[source] || source;
    };
    const getStatusLabel = (status) => {
        const labels = {
            'TENTATIVE': '仮予約',
            'CONFIRMED': '確定',
            'COMPLETED': '完了',
            'CANCELLED': 'キャンセル',
            'NO_SHOW': '無断キャンセル'
        };
        return labels[status] || status;
    };
    const getStatusColor = (status) => {
        const colors = {
            'TENTATIVE': 'bg-yellow-100 text-yellow-800',
            'CONFIRMED': 'bg-blue-100 text-blue-800',
            'COMPLETED': 'bg-green-100 text-green-800',
            'CANCELLED': 'bg-gray-100 text-gray-800',
            'NO_SHOW': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };
    const getMenuIcon = (menuContent) => {
        if (menuContent.includes('カット'))
            return _jsx(Scissors, { className: "w-4 h-4 text-blue-600" });
        if (menuContent.includes('カラー') || menuContent.includes('ブリーチ'))
            return _jsx(Palette, { className: "w-4 h-4 text-purple-600" });
        if (menuContent.includes('パーマ'))
            return _jsx(Star, { className: "w-4 h-4 text-pink-600" });
        return _jsx(Scissors, { className: "w-4 h-4 text-gray-600" });
    };
    if (!reservation)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col", children: [_jsx("div", { className: "flex-1 overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 flex items-center", children: [_jsx(FileText, { className: "w-6 h-6 mr-2 text-blue-600" }), "\u65BD\u8853\u5C65\u6B74\u8A73\u7D30"] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "\u57FA\u672C\u60C5\u5831" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Calendar, { className: "w-5 h-5 text-gray-500" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "\u65BD\u8853\u65E5" }), _jsx("div", { className: "font-medium", children: format(new Date(reservation.startTime), 'yyyy年M月d日(E)', { locale: ja }) })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Clock, { className: "w-5 h-5 text-gray-500" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "\u65BD\u8853\u6642\u9593" }), _jsxs("div", { className: "font-medium", children: [format(new Date(reservation.startTime), 'HH:mm', { locale: ja }), reservation.endTime && ` - ${format(new Date(reservation.endTime), 'HH:mm', { locale: ja })}`] })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(User, { className: "w-5 h-5 text-gray-500" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "\u62C5\u5F53\u30B9\u30BF\u30C3\u30D5" }), _jsx("div", { className: "font-medium", children: reservation.staff?.name || '未設定' })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-5 h-5 flex items-center justify-center", children: _jsx("div", { className: `px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`, children: getStatusLabel(reservation.status) }) }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "\u4E88\u7D04\u7D4C\u8DEF" }), _jsx("div", { className: "font-medium", children: getSourceLabel(reservation.source) })] })] })] })] }), _jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-3 flex items-center", children: [getMenuIcon(reservation.menuContent), _jsx("span", { className: "ml-2", children: "\u65BD\u8853\u5185\u5BB9" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "\u30E1\u30CB\u30E5\u30FC" }), _jsx("div", { className: "font-medium text-lg", children: reservation.menuContent })] }), reservation.price && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(DollarSign, { className: "w-5 h-5 text-green-600" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "\u6599\u91D1" }), _jsxs("div", { className: "font-medium text-lg text-green-700", children: ["\u00A5", reservation.price.toLocaleString()] })] })] }))] }), reservation.notes && (_jsxs("div", { className: "mt-3", children: [_jsx("div", { className: "text-sm text-gray-600", children: "\u304A\u5BA2\u69D8\u8981\u671B" }), _jsx("div", { className: "mt-1 text-gray-700", children: reservation.notes })] }))] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(PhotoGallery, { photos: beforePhotos, type: "before", title: "\u65BD\u8853\u524D\u5199\u771F" }), _jsx(PhotoGallery, { photos: afterPhotos, type: "after", title: "\u65BD\u8853\u5F8C\u5199\u771F" })] }), _jsxs("div", { className: "bg-yellow-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 flex items-center", children: [_jsx(Edit3, { className: "w-5 h-5 mr-2 text-yellow-600" }), "\u7F8E\u5BB9\u5E2B\u30E1\u30E2"] }), !editingNotes && (_jsxs("button", { onClick: () => {
                                                            setEditingNotes(true);
                                                            setNotesContent(reservation.stylistNotes || '');
                                                        }, className: "btn btn-secondary btn-sm", children: [_jsx(Edit3, { className: "w-4 h-4 mr-1" }), "\u7DE8\u96C6"] }))] }), editingNotes ? (_jsxs("div", { className: "space-y-3", children: [_jsx("textarea", { value: notesContent, onChange: (e) => setNotesContent(e.target.value), placeholder: "\u65BD\u8853\u6642\u306E\u6CE8\u610F\u70B9\u3001\u304A\u5BA2\u69D8\u306E\u7279\u5FB4\u3001\u6B21\u56DE\u3078\u306E\u7533\u3057\u9001\u308A\u4E8B\u9805\u306A\u3069\u3092\u8A18\u5165\u3057\u3066\u304F\u3060\u3055\u3044...", className: "w-full h-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx("button", { onClick: () => {
                                                                    setEditingNotes(false);
                                                                    setNotesContent(reservation.stylistNotes || '');
                                                                }, className: "btn btn-secondary btn-sm", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsxs("button", { onClick: handleSaveNotes, className: "btn btn-primary btn-sm", children: [_jsx(Save, { className: "w-4 h-4 mr-1" }), "\u4FDD\u5B58"] })] })] })) : (_jsx("div", { className: "min-h-20", children: reservation.stylistNotes ? (_jsx("div", { className: "text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border", children: reservation.stylistNotes })) : (_jsxs("div", { className: "text-gray-500 italic text-center py-8", children: ["\u7F8E\u5BB9\u5E2B\u30E1\u30E2\u306F\u307E\u3060\u8A18\u5165\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002", _jsx("br", {}), "\u300C\u7DE8\u96C6\u300D\u30DC\u30BF\u30F3\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u30E1\u30E2\u3092\u8FFD\u52A0\u3057\u3066\u304F\u3060\u3055\u3044\u3002"] })) }))] }), _jsxs("div", { className: "bg-orange-50 border border-orange-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-orange-900 mb-2", children: "\uD83D\uDCA1 \u7F8E\u5BB9\u5E2B\u30E1\u30E2\u6D3B\u7528\u306E\u30DD\u30A4\u30F3\u30C8" }), _jsxs("ul", { className: "text-sm text-orange-800 space-y-1", children: [_jsx("li", { children: "\u2022 \u304A\u5BA2\u69D8\u306E\u9AEA\u8CEA\u3084\u808C\u8CEA\u306E\u7279\u5FB4" }), _jsx("li", { children: "\u2022 \u65BD\u8853\u6642\u306B\u6CE8\u610F\u3057\u305F\u70B9\u3084\u5DE5\u592B\u3057\u305F\u3053\u3068" }), _jsx("li", { children: "\u2022 \u304A\u5BA2\u69D8\u306E\u53CD\u5FDC\u3084\u6E80\u8DB3\u5EA6" }), _jsx("li", { children: "\u2022 \u6B21\u56DE\u306E\u63D0\u6848\u3084\u30A2\u30C9\u30D0\u30A4\u30B9" }), _jsx("li", { children: "\u2022 \u30A2\u30EC\u30EB\u30AE\u30FC\u3084\u6CE8\u610F\u3059\u3079\u304D\u70B9" })] })] })] })] }) }), showPhotoUpload && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4", children: _jsx("div", { className: "bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-medium", children: showPhotoUpload === 'before' ? '施術前写真を追加' : '施術後写真を追加' }), _jsx("button", { onClick: () => setShowPhotoUpload(null), className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx(CustomerPhotoUpload, { customerId: reservation?.customer?.id || reservation?.id || '', onPhotoUpdate: (photoUrl) => handlePhotoUpdate(photoUrl, showPhotoUpload), showCropTool: true, showRotateTool: true })] }) }) }))] }) }));
};
export default ServiceHistoryModal;
