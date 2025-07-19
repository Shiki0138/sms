import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
const CustomerPhotoUpload = ({ customerId, currentPhoto, onPhotoUpdate, maxFileSize = 5 * 1024 * 1024, // 5MB
allowedTypes = ['image/jpeg', 'image/png', 'image/webp'], showCropTool = true, showRotateTool = true, }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);
    const imageRef = useRef(null);
    // ファイルバリデーション
    const validateFile = (file) => {
        if (!allowedTypes.includes(file.type)) {
            return `サポートされていないファイル形式です。${allowedTypes.join(', ')} のみ対応しています。`;
        }
        if (file.size > maxFileSize) {
            return `ファイルサイズが大きすぎます。最大 ${Math.round(maxFileSize / 1024 / 1024)}MB まで対応しています。`;
        }
        return null;
    };
    // ファイル選択処理
    const handleFileSelect = useCallback((file) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            setPreview(result);
            if (showCropTool || showRotateTool) {
                setShowEditor(true);
            }
            else {
                uploadPhoto(file);
            }
        };
        reader.readAsDataURL(file);
    }, [maxFileSize, allowedTypes, showCropTool, showRotateTool]);
    // ドラッグ&ドロップ処理
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        }
        else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    }, [handleFileSelect]);
    // ファイル入力変更処理
    const handleInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };
    // 画像編集関数
    const rotateImage = () => {
        setRotation((prev) => (prev + 90) % 360);
    };
    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 0.1, 3));
    };
    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 0.1, 0.5));
    };
    // Canvas で画像を処理
    const processImage = useCallback(() => {
        return new Promise((resolve) => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = imageRef.current;
            // キャンバスサイズを設定（正方形で統一）
            const size = 400;
            canvas.width = size;
            canvas.height = size;
            // 背景を白で塗りつぶし
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);
            // 変換の中心を設定
            ctx.translate(size / 2, size / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.scale(zoom, zoom);
            // 画像を描画（中央揃え）
            const scaledWidth = img.naturalWidth;
            const scaledHeight = img.naturalHeight;
            ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.9);
        });
    }, [rotation, zoom]);
    // 写真アップロード処理
    const uploadPhoto = async (file) => {
        try {
            setIsUploading(true);
            setError(null);
            let processedFile = file || selectedFile;
            // 編集が適用されている場合は、処理済み画像を使用
            if (showEditor && (rotation !== 0 || zoom !== 1)) {
                processedFile = await processImage();
            }
            const formData = new FormData();
            formData.append('photo', processedFile);
            formData.append('customerId', customerId);
            const response = await fetch('/api/v1/customers/upload-photo', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '写真のアップロードに失敗しました');
            }
            const result = await response.json();
            onPhotoUpdate(result.photoUrl);
            // 状態をリセット
            setPreview(null);
            setSelectedFile(null);
            setShowEditor(false);
            setRotation(0);
            setZoom(1);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : '写真のアップロードに失敗しました');
        }
        finally {
            setIsUploading(false);
        }
    };
    // 編集をキャンセル
    const cancelEdit = () => {
        setShowEditor(false);
        setPreview(null);
        setSelectedFile(null);
        setRotation(0);
        setZoom(1);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "flex-shrink-0", children: currentPhoto ? (_jsx("img", { src: currentPhoto, alt: "\u9867\u5BA2\u5199\u771F", className: "h-20 w-20 rounded-full object-cover border-2 border-gray-200" })) : (_jsx("div", { className: "h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center", children: _jsx(Camera, { className: "h-8 w-8 text-gray-400" }) })) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-sm font-medium text-gray-900", children: "\u9867\u5BA2\u5199\u771F" }), _jsx("p", { className: "text-xs text-gray-500", children: currentPhoto ? '写真を変更するには新しい画像をアップロードしてください' : '写真をアップロードしてください' })] })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-md p-3", children: _jsx("p", { className: "text-sm text-red-600", children: error }) })), showEditor && preview && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 max-w-md w-full mx-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-lg font-medium", children: "\u5199\u771F\u3092\u7DE8\u96C6" }), _jsx("button", { onClick: cancelEdit, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsx("div", { className: "mb-4 flex justify-center", children: _jsxs("div", { className: "relative w-48 h-48 border border-gray-200 rounded-lg overflow-hidden", children: [_jsx("img", { ref: imageRef, src: preview, alt: "\u30D7\u30EC\u30D3\u30E5\u30FC", className: "w-full h-full object-cover", style: {
                                            transform: `rotate(${rotation}deg) scale(${zoom})`,
                                            transformOrigin: 'center center',
                                        } }), _jsx("canvas", { ref: canvasRef, className: "hidden" })] }) }), _jsxs("div", { className: "space-y-3", children: [showRotateTool && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-700", children: "\u56DE\u8EE2" }), _jsxs("button", { onClick: rotateImage, className: "flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md", children: [_jsx(RotateCw, { className: "h-4 w-4" }), _jsx("span", { children: "90\u00B0\u56DE\u8EE2" })] })] })), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-700", children: "\u30BA\u30FC\u30E0" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: handleZoomOut, className: "p-1 text-gray-500 hover:text-gray-700", children: _jsx(ZoomOut, { className: "h-4 w-4" }) }), _jsxs("span", { className: "text-xs text-gray-500 w-8 text-center", children: [Math.round(zoom * 100), "%"] }), _jsx("button", { onClick: handleZoomIn, className: "p-1 text-gray-500 hover:text-gray-700", children: _jsx(ZoomIn, { className: "h-4 w-4" }) })] })] })] }), _jsxs("div", { className: "flex space-x-3 mt-6", children: [_jsx("button", { onClick: cancelEdit, className: "flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx("button", { onClick: () => uploadPhoto(), disabled: isUploading, className: "flex-1 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md", children: isUploading ? 'アップロード中...' : '保存' })] })] }) })), !showEditor && (_jsxs("div", { className: `relative border-2 border-dashed rounded-lg p-6 transition-colors ${dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'}`, onDragEnter: handleDrag, onDragLeave: handleDrag, onDragOver: handleDrag, onDrop: handleDrop, children: [_jsx("input", { ref: fileInputRef, type: "file", accept: allowedTypes.join(','), onChange: handleInputChange, className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer", disabled: isUploading }), _jsxs("div", { className: "text-center", children: [_jsx(Upload, { className: "mx-auto h-8 w-8 text-gray-400 mb-2" }), _jsx("p", { className: "text-sm text-gray-600 mb-1", children: "\u30D5\u30A1\u30A4\u30EB\u3092\u30C9\u30E9\u30C3\u30B0&\u30C9\u30ED\u30C3\u30D7 \u307E\u305F\u306F \u30AF\u30EA\u30C3\u30AF\u3057\u3066\u9078\u629E" }), _jsxs("p", { className: "text-xs text-gray-500", children: ["JPG, PNG, WebP (\u6700\u5927 ", Math.round(maxFileSize / 1024 / 1024), "MB)"] })] }), isUploading && (_jsx("div", { className: "absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" }), _jsx("span", { className: "text-sm text-gray-600", children: "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u4E2D..." })] }) }))] }))] }));
};
export default CustomerPhotoUpload;
