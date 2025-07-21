import React, { useState } from 'react'
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Scissors, 
  Palette, 
  Star, 
  DollarSign,
  FileText,
  Save,
  Edit3,
  Camera,
  Image,
  Plus
} from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import CustomerPhotoUpload from './Customer/CustomerPhotoUpload'

interface Reservation {
  id: string
  startTime: string
  endTime?: string
  menuContent: string
  customerName: string
  customer?: {
    id: string
    name: string
    phone?: string
  }
  staff?: {
    id: string
    name: string
  }
  source: 'HOTPEPPER' | 'GOOGLE_CALENDAR' | 'PHONE' | 'WALK_IN' | 'MANUAL'
  status: 'TENTATIVE' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  notes?: string
  price?: number
  stylistNotes?: string
  beforePhotos?: string[]
  afterPhotos?: string[]
}

interface ServiceHistoryModalProps {
  reservation: Reservation | null
  onClose: () => void
  onUpdateStylistNotes: (id: string, notes: string) => void
  onUpdateReservation?: (id: string, updates: Partial<Reservation>) => void
}

const ServiceHistoryModal: React.FC<ServiceHistoryModalProps> = ({
  reservation,
  onClose,
  onUpdateStylistNotes,
  onUpdateReservation
}) => {
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesContent, setNotesContent] = useState(reservation?.stylistNotes || '')
  const [beforePhotos, setBeforePhotos] = useState<string[]>(reservation?.beforePhotos || [])
  const [afterPhotos, setAfterPhotos] = useState<string[]>(reservation?.afterPhotos || [])
  const [showPhotoUpload, setShowPhotoUpload] = useState<'before' | 'after' | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState({
    date: reservation?.startTime ? format(new Date(reservation.startTime), 'yyyy-MM-dd') : '',
    startTime: reservation?.startTime ? format(new Date(reservation.startTime), 'HH:mm') : '',
    endTime: reservation?.endTime ? format(new Date(reservation.endTime), 'HH:mm') : '',
    staffId: reservation?.staff?.id || '',
    staffName: reservation?.staff?.name || '',
    menuContent: reservation?.menuContent || '',
    price: reservation?.price || 0,
    status: reservation?.status || 'CONFIRMED',
    notes: reservation?.notes || ''
  })

  const handleSaveNotes = () => {
    if (reservation) {
      onUpdateStylistNotes(reservation.id, notesContent)
      setEditingNotes(false)
    }
  }

  const handleSaveEdit = () => {
    if (reservation && onUpdateReservation) {
      const updates: Partial<Reservation> = {
        startTime: `${editData.date}T${editData.startTime}:00`,
        endTime: editData.endTime ? `${editData.date}T${editData.endTime}:00` : undefined,
        menuContent: editData.menuContent,
        price: editData.price,
        status: editData.status as Reservation['status'],
        notes: editData.notes,
        staff: editData.staffId ? {
          id: editData.staffId,
          name: editData.staffName
        } : undefined
      }
      onUpdateReservation(reservation.id, updates)
      setIsEditMode(false)
    }
  }

  const handleCancelEdit = () => {
    setEditData({
      date: reservation?.startTime ? format(new Date(reservation.startTime), 'yyyy-MM-dd') : '',
      startTime: reservation?.startTime ? format(new Date(reservation.startTime), 'HH:mm') : '',
      endTime: reservation?.endTime ? format(new Date(reservation.endTime), 'HH:mm') : '',
      staffId: reservation?.staff?.id || '',
      staffName: reservation?.staff?.name || '',
      menuContent: reservation?.menuContent || '',
      price: reservation?.price || 0,
      status: reservation?.status || 'CONFIRMED',
      notes: reservation?.notes || ''
    })
    setIsEditMode(false)
  }

  const handlePhotoUpdate = (photoUrl: string, type: 'before' | 'after') => {
    if (type === 'before') {
      setBeforePhotos(prev => [...prev, photoUrl])
    } else {
      setAfterPhotos(prev => [...prev, photoUrl])
    }
    setShowPhotoUpload(null)
    
    // 実際の実装では、サーバーに送信して予約データを更新
    console.log(`${type} photo added:`, photoUrl)
  }

  const removePhoto = (index: number, type: 'before' | 'after') => {
    if (type === 'before') {
      setBeforePhotos(prev => prev.filter((_, i) => i !== index))
    } else {
      setAfterPhotos(prev => prev.filter((_, i) => i !== index))
    }
  }

  const PhotoGallery = ({ photos, type, title }: { 
    photos: string[], 
    type: 'before' | 'after', 
    title: string 
  }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Camera className="w-5 h-5 mr-2 text-blue-600" />
          {title}
        </h3>
        <button
          onClick={() => setShowPhotoUpload(type)}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md"
        >
          <Plus className="w-4 h-4" />
          <span>写真追加</span>
        </button>
      </div>
      
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`${title} ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => removePhoto(index, type)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Image className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">まだ写真がありません</p>
          <p className="text-xs text-gray-400">「写真追加」ボタンから追加してください</p>
        </div>
      )}
    </div>
  )

  const getSourceLabel = (source: string) => {
    const labels = {
      'HOTPEPPER': 'ホットペッパー',
      'GOOGLE_CALENDAR': 'Googleカレンダー',
      'PHONE': '電話予約',
      'WALK_IN': '当日来店',
      'MANUAL': '手動登録'
    }
    return labels[source as keyof typeof labels] || source
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      'TENTATIVE': '仮予約',
      'CONFIRMED': '確定',
      'COMPLETED': '完了',
      'CANCELLED': 'キャンセル',
      'NO_SHOW': '無断キャンセル'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'TENTATIVE': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-gray-100 text-gray-800',
      'NO_SHOW': 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getMenuIcon = (menuContent: string) => {
    if (menuContent.includes('カット')) return <Scissors className="w-4 h-4 text-blue-600" />
    if (menuContent.includes('カラー') || menuContent.includes('ブリーチ')) return <Palette className="w-4 h-4 text-purple-600" />
    if (menuContent.includes('パーマ')) return <Star className="w-4 h-4 text-pink-600" />
    return <Scissors className="w-4 h-4 text-gray-600" />
  }

  if (!reservation) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                施術履歴詳細
              </h2>
              <div className="flex items-center space-x-2">
                {!isEditMode && onUpdateReservation && (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    編集
                  </button>
                )}
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* 基本情報 */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">基本情報</h3>
                {isEditMode ? (
                  // 編集モード
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          施術日
                        </label>
                        <input
                          type="date"
                          value={editData.date}
                          onChange={(e) => setEditData({...editData, date: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            開始時間
                          </label>
                          <input
                            type="time"
                            value={editData.startTime}
                            onChange={(e) => setEditData({...editData, startTime: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            終了時間
                          </label>
                          <input
                            type="time"
                            value={editData.endTime}
                            onChange={(e) => setEditData({...editData, endTime: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          担当スタッフ
                        </label>
                        <input
                          type="text"
                          value={editData.staffName}
                          onChange={(e) => setEditData({...editData, staffName: e.target.value})}
                          placeholder="スタッフ名を入力"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ステータス
                        </label>
                        <select
                          value={editData.status}
                          onChange={(e) => setEditData({...editData, status: e.target.value as 'TENTATIVE' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="TENTATIVE">仮予約</option>
                          <option value="CONFIRMED">確定</option>
                          <option value="COMPLETED">完了</option>
                          <option value="CANCELLED">キャンセル</option>
                          <option value="NO_SHOW">無断キャンセル</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <button
                        onClick={handleCancelEdit}
                        className="btn btn-secondary btn-sm"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="btn btn-primary btn-sm"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  // 表示モード
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-600">施術日</div>
                        <div className="font-medium">
                          {format(new Date(reservation.startTime), 'yyyy年M月d日(E)', { locale: ja })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-600">施術時間</div>
                        <div className="font-medium">
                          {format(new Date(reservation.startTime), 'HH:mm', { locale: ja })}
                          {reservation.endTime && ` - ${format(new Date(reservation.endTime), 'HH:mm', { locale: ja })}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-600">担当スタッフ</div>
                        <div className="font-medium">{reservation.staff?.name || '未設定'}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                          {getStatusLabel(reservation.status)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">予約経路</div>
                        <div className="font-medium">{getSourceLabel(reservation.source)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 施術内容 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  {getMenuIcon(reservation.menuContent)}
                  <span className="ml-2">施術内容</span>
                </h3>
                {isEditMode ? (
                  // 編集モード
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          メニュー内容
                        </label>
                        <input
                          type="text"
                          value={editData.menuContent}
                          onChange={(e) => setEditData({...editData, menuContent: e.target.value})}
                          placeholder="カット、カラー、パーマなど"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          料金
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
                          <input
                            type="number"
                            value={editData.price}
                            onChange={(e) => setEditData({...editData, price: parseInt(e.target.value) || 0})}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        お客様要望・メモ
                      </label>
                      <textarea
                        value={editData.notes}
                        onChange={(e) => setEditData({...editData, notes: e.target.value})}
                        placeholder="お客様のご要望や特記事項を入力"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  // 表示モード
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">メニュー</div>
                        <div className="font-medium text-lg">{reservation.menuContent}</div>
                      </div>
                      {reservation.price && (
                        <div>
                          <div className="text-sm text-gray-600">料金</div>
                          <div className="font-medium text-lg text-green-700">
                            ¥{reservation.price.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                    {reservation.notes && (
                      <div className="mt-3">
                        <div className="text-sm text-gray-600">お客様要望</div>
                        <div className="mt-1 text-gray-700">{reservation.notes}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 施術写真 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PhotoGallery photos={beforePhotos} type="before" title="施術前写真" />
                <PhotoGallery photos={afterPhotos} type="after" title="施術後写真" />
              </div>

              {/* 美容師メモ */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Edit3 className="w-5 h-5 mr-2 text-yellow-600" />
                    美容師メモ
                  </h3>
                  {!editingNotes && (
                    <button
                      onClick={() => {
                        setEditingNotes(true)
                        setNotesContent(reservation.stylistNotes || '')
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      編集
                    </button>
                  )}
                </div>
                
                {editingNotes ? (
                  <div className="space-y-3">
                    <textarea
                      value={notesContent}
                      onChange={(e) => setNotesContent(e.target.value)}
                      placeholder="施術時の注意点、お客様の特徴、次回への申し送り事項などを記入してください..."
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingNotes(false)
                          setNotesContent(reservation.stylistNotes || '')
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        className="btn btn-primary btn-sm"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-20">
                    {reservation.stylistNotes ? (
                      <div className="text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border">
                        {reservation.stylistNotes}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic text-center py-8">
                        美容師メモはまだ記入されていません。<br />
                        「編集」ボタンをクリックしてメモを追加してください。
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 注意事項 */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-900 mb-2">💡 美容師メモ活用のポイント</h4>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• お客様の髪質や肌質の特徴</li>
                  <li>• 施術時に注意した点や工夫したこと</li>
                  <li>• お客様の反応や満足度</li>
                  <li>• 次回の提案やアドバイス</li>
                  <li>• アレルギーや注意すべき点</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 写真アップロードモーダル */}
        {showPhotoUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">
                    {showPhotoUpload === 'before' ? '施術前写真を追加' : '施術後写真を追加'}
                  </h3>
                  <button
                    onClick={() => setShowPhotoUpload(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <CustomerPhotoUpload
                  customerId={reservation?.customer?.id || reservation?.id || ''}
                  onPhotoUpdate={(photoUrl) => handlePhotoUpdate(photoUrl, showPhotoUpload)}
                  showCropTool={true}
                  showRotateTool={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ServiceHistoryModal