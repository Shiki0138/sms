import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
const QRScanner = ({ onScan, onClose, isOpen }) => {
    const scannerRef = useRef(null);
    const [scanResult, setScanResult] = useState('');
    const [error, setError] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    useEffect(() => {
        if (isOpen && !scannerRef.current) {
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true,
                showZoomSliderIfSupported: true,
                defaultZoomValueIfSupported: 2,
            };
            const scanner = new Html5QrcodeScanner('qr-reader', config, false);
            scannerRef.current = scanner;
            const onScanSuccess = (decodedText) => {
                console.log('QR Code scanned:', decodedText);
                // LINE関連のQRコードかチェック
                if (decodedText.includes('line.me') || decodedText.includes('line://')) {
                    // LINE QRコードからユーザーIDを抽出
                    const lineId = extractLineIdFromQR(decodedText);
                    if (lineId) {
                        setScanResult(lineId);
                        onScan(lineId);
                        setError('');
                        // 少し待ってからモーダルを閉じる
                        setTimeout(() => {
                            onClose();
                        }, 1500);
                    }
                    else {
                        setError('LINE IDを取得できませんでした');
                    }
                }
                else {
                    // 直接LINE IDが入力されている場合
                    setScanResult(decodedText);
                    onScan(decodedText);
                    setError('');
                    setTimeout(() => {
                        onClose();
                    }, 1500);
                }
            };
            const onScanFailure = (error) => {
                // エラーログは表示しない（スキャン中は正常）
                console.debug('QR scan attempt:', error);
            };
            scanner.render(onScanSuccess, onScanFailure);
            setIsScanning(true);
        }
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
                setIsScanning(false);
            }
        };
    }, [isOpen, onScan, onClose]);
    // LINE QRコードからIDを抽出する関数
    const extractLineIdFromQR = (qrText) => {
        try {
            // LINE QRコードのパターン例:
            // https://line.me/ti/p/[LINE_ID]
            // line://ti/p/[LINE_ID]
            const patterns = [
                /line\.me\/ti\/p\/([A-Za-z0-9_-]+)/,
                /line:\/\/ti\/p\/([A-Za-z0-9_-]+)/,
                /line\.me\/R\/ti\/p\/([A-Za-z0-9_-]+)/
            ];
            for (const pattern of patterns) {
                const match = qrText.match(pattern);
                if (match && match[1]) {
                    return match[1];
                }
            }
            // 直接LINE IDが含まれている場合
            if (/^[A-Za-z0-9_-]+$/.test(qrText) && qrText.length >= 4 && qrText.length <= 20) {
                return qrText;
            }
            return null;
        }
        catch (error) {
            console.error('LINE ID extraction error:', error);
            return null;
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4", children: _jsx("div", { className: "bg-white rounded-lg max-w-md w-full", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 flex items-center", children: [_jsx(Camera, { className: "w-5 h-5 mr-2 text-blue-600" }), "LINE QR\u30B3\u30FC\u30C9\u30B9\u30AD\u30E3\u30F3"] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4", children: [_jsx("h4", { className: "font-medium text-blue-900 mb-2 flex items-center", children: "\uD83D\uDCF1 \u9867\u5BA2\u69D8\u3078\u306E\u64CD\u4F5C\u624B\u9806" }), _jsxs("ol", { className: "text-sm text-blue-800 space-y-1", children: [_jsx("li", { children: "1. LINE\u30A2\u30D7\u30EA\u3092\u958B\u3044\u3066\u3082\u3089\u3046" }), _jsx("li", { children: "2. \u53F3\u4E0A\u306E\u300C\u53CB\u3060\u3061\u8FFD\u52A0\u300D\u2192\u300CQR\u30B3\u30FC\u30C9\u300D\u3092\u9078\u629E" }), _jsx("li", { children: "3. \u300C\u30DE\u30A4QR\u30B3\u30FC\u30C9\u300D\u3092\u8868\u793A\u3057\u3066\u3082\u3089\u3046" }), _jsx("li", { children: "4. \u3053\u306E\u30AB\u30E1\u30E9\u3067\u8AAD\u307F\u53D6\u308B" })] })] }) }), _jsx("div", { className: "mb-4", children: _jsx("div", { id: "qr-reader", className: "w-full" }) }), scanResult && (_jsx("div", { className: "bg-green-50 border border-green-200 rounded-lg p-3 mb-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-600 mr-2" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-green-800", children: "\u30B9\u30AD\u30E3\u30F3\u6210\u529F\uFF01" }), _jsxs("p", { className: "text-xs text-green-600", children: ["LINE ID: ", scanResult] })] })] }) })), error && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-3 mb-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-600 mr-2" }), _jsx("p", { className: "text-sm text-red-800", children: error })] }) })), _jsx("div", { className: "pt-4 border-t border-gray-200", children: _jsx("p", { className: "text-xs text-gray-500 text-center", children: "QR\u30B3\u30FC\u30C9\u304C\u8AAD\u307F\u53D6\u308C\u306A\u3044\u5834\u5408\u306F\u3001\u30AD\u30E3\u30F3\u30BB\u30EB\u3057\u3066\u624B\u52D5\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" }) })] }) }) }));
};
export default QRScanner;
