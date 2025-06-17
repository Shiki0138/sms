import React, { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react'

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
  isOpen: boolean
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, isOpen }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [scanResult, setScanResult] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2,
      }

      const scanner = new Html5QrcodeScanner('qr-reader', config, false)
      scannerRef.current = scanner

      const onScanSuccess = (decodedText: string) => {
        console.log('QR Code scanned:', decodedText)
        
        // LINE関連のQRコードかチェック
        if (decodedText.includes('line.me') || decodedText.includes('line://')) {
          // LINE QRコードからユーザーIDを抽出
          const lineId = extractLineIdFromQR(decodedText)
          if (lineId) {
            setScanResult(lineId)
            onScan(lineId)
            setError('')
            // 少し待ってからモーダルを閉じる
            setTimeout(() => {
              onClose()
            }, 1500)
          } else {
            setError('LINE IDを取得できませんでした')
          }
        } else {
          // 直接LINE IDが入力されている場合
          setScanResult(decodedText)
          onScan(decodedText)
          setError('')
          setTimeout(() => {
            onClose()
          }, 1500)
        }
      }

      const onScanFailure = (error: string) => {
        // エラーログは表示しない（スキャン中は正常）
        console.debug('QR scan attempt:', error)
      }

      scanner.render(onScanSuccess, onScanFailure)
      setIsScanning(true)
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
        scannerRef.current = null
        setIsScanning(false)
      }
    }
  }, [isOpen, onScan, onClose])

  // LINE QRコードからIDを抽出する関数
  const extractLineIdFromQR = (qrText: string): string | null => {
    try {
      // LINE QRコードのパターン例:
      // https://line.me/ti/p/[LINE_ID]
      // line://ti/p/[LINE_ID]
      
      const patterns = [
        /line\.me\/ti\/p\/([A-Za-z0-9_-]+)/,
        /line:\/\/ti\/p\/([A-Za-z0-9_-]+)/,
        /line\.me\/R\/ti\/p\/([A-Za-z0-9_-]+)/
      ]

      for (const pattern of patterns) {
        const match = qrText.match(pattern)
        if (match && match[1]) {
          return match[1]
        }
      }

      // 直接LINE IDが含まれている場合
      if (/^[A-Za-z0-9_-]+$/.test(qrText) && qrText.length >= 4 && qrText.length <= 20) {
        return qrText
      }

      return null
    } catch (error) {
      console.error('LINE ID extraction error:', error)
      return null
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Camera className="w-5 h-5 mr-2 text-blue-600" />
              LINE QRコードスキャン
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                📱 顧客様への操作手順
              </h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. LINEアプリを開いてもらう</li>
                <li>2. 右上の「友だち追加」→「QRコード」を選択</li>
                <li>3. 「マイQRコード」を表示してもらう</li>
                <li>4. このカメラで読み取る</li>
              </ol>
            </div>
          </div>

          {/* QR Scanner */}
          <div className="mb-4">
            <div id="qr-reader" className="w-full"></div>
          </div>

          {/* Result/Error Display */}
          {scanResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800">スキャン成功！</p>
                  <p className="text-xs text-green-600">LINE ID: {scanResult}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Manual Input Option */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              QRコードが読み取れない場合は、キャンセルして手動入力してください
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRScanner