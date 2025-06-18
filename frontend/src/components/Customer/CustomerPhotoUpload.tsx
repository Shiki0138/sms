import React, { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, Edit3, RotateCw, Crop, ZoomIn, ZoomOut } from 'lucide-react'

interface CustomerPhotoUploadProps {
  customerId: string
  currentPhoto?: string
  onPhotoUpdate: (photoUrl: string) => void
  maxFileSize?: number // in bytes, default 5MB
  allowedTypes?: string[]
  showCropTool?: boolean
  showRotateTool?: boolean
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

const CustomerPhotoUpload: React.FC<CustomerPhotoUploadProps> = ({
  customerId,
  currentPhoto,
  onPhotoUpdate,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  showCropTool = true,
  showRotateTool = true,
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 })
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // ファイルバリデーション
  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `サポートされていないファイル形式です。${allowedTypes.join(', ')} のみ対応しています。`
    }
    if (file.size > maxFileSize) {
      return `ファイルサイズが大きすぎます。最大 ${Math.round(maxFileSize / 1024 / 1024)}MB まで対応しています。`
    }
    return null
  }

  // ファイル選択処理
  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setSelectedFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
      if (showCropTool || showRotateTool) {
        setShowEditor(true)
      } else {
        uploadPhoto(file)
      }
    }
    reader.readAsDataURL(file)
  }, [maxFileSize, allowedTypes, showCropTool, showRotateTool])

  // ドラッグ&ドロップ処理
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [handleFileSelect])

  // ファイル入力変更処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  // 画像編集関数
  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5))
  }

  // Canvas で画像を処理
  const processImage = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!
      const img = imageRef.current!
      
      // キャンバスサイズを設定（正方形で統一）
      const size = 400
      canvas.width = size
      canvas.height = size
      
      // 背景を白で塗りつぶし
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)
      
      // 変換の中心を設定
      ctx.translate(size / 2, size / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(zoom, zoom)
      
      // 画像を描画（中央揃え）
      const scaledWidth = img.naturalWidth
      const scaledHeight = img.naturalHeight
      ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight)
      
      canvas.toBlob((blob) => {
        resolve(blob!)
      }, 'image/jpeg', 0.9)
    })
  }, [rotation, zoom])

  // 写真アップロード処理
  const uploadPhoto = async (file?: File) => {
    try {
      setIsUploading(true)
      setError(null)
      
      let processedFile: File | Blob = file || selectedFile!
      
      // 編集が適用されている場合は、処理済み画像を使用
      if (showEditor && (rotation !== 0 || zoom !== 1)) {
        processedFile = await processImage()
      }
      
      const formData = new FormData()
      formData.append('photo', processedFile)
      formData.append('customerId', customerId)
      
      const response = await fetch('/api/v1/customers/upload-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '写真のアップロードに失敗しました')
      }
      
      const result = await response.json()
      onPhotoUpdate(result.photoUrl)
      
      // 状態をリセット
      setPreview(null)
      setSelectedFile(null)
      setShowEditor(false)
      setRotation(0)
      setZoom(1)
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '写真のアップロードに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }

  // 編集をキャンセル
  const cancelEdit = () => {
    setShowEditor(false)
    setPreview(null)
    setSelectedFile(null)
    setRotation(0)
    setZoom(1)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* 現在の写真表示 */}
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {currentPhoto ? (
            <img
              src={currentPhoto}
              alt="顧客写真"
              className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
              <Camera className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">顧客写真</h3>
          <p className="text-xs text-gray-500">
            {currentPhoto ? '写真を変更するには新しい画像をアップロードしてください' : '写真をアップロードしてください'}
          </p>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 画像編集モーダル */}
      {showEditor && preview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">写真を編集</h3>
              <button
                onClick={cancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* プレビュー画像 */}
            <div className="mb-4 flex justify-center">
              <div className="relative w-48 h-48 border border-gray-200 rounded-lg overflow-hidden">
                <img
                  ref={imageRef}
                  src={preview}
                  alt="プレビュー"
                  className="w-full h-full object-cover"
                  style={{
                    transform: `rotate(${rotation}deg) scale(${zoom})`,
                    transformOrigin: 'center center',
                  }}
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>
            
            {/* 編集ツール */}
            <div className="space-y-3">
              {showRotateTool && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">回転</span>
                  <button
                    onClick={rotateImage}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    <RotateCw className="h-4 w-4" />
                    <span>90°回転</span>
                  </button>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">ズーム</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-gray-500 w-8 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* アクションボタン */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={cancelEdit}
                className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                キャンセル
              </button>
              <button
                onClick={() => uploadPhoto()}
                disabled={isUploading}
                className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md"
              >
                {isUploading ? 'アップロード中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* アップロードエリア */}
      {!showEditor && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedTypes.join(',')}
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              ファイルをドラッグ&ドロップ または クリックして選択
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG, WebP (最大 {Math.round(maxFileSize / 1024 / 1024)}MB)
            </p>
          </div>
          
          {isUploading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">アップロード中...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CustomerPhotoUpload