import React, { useState, useMemo } from 'react'
import { 
  MessageSquare, 
  Calendar, 
  User, 
  Phone, 
  Mail,
  Clock,
  ArrowLeft,
  Filter,
  Search,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Customer {
  id: string
  customerNumber: string
  name: string
  phone?: string
  email?: string
  visitCount: number
  lastVisitDate?: string
  createdAt: string
}

interface MessageThread {
  id: string
  customer: {
    id: string
    name: string
    instagramId?: string
    lineId?: string
  }
  channel: 'INSTAGRAM' | 'LINE'
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
  assignedStaff?: {
    id: string
    name: string
  }
  lastMessage: {
    content: string
    createdAt: string
    senderType: 'CUSTOMER' | 'STAFF'
  }
  unreadCount: number
  updatedAt: string
}

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
}

interface FilteredCustomerViewProps {
  viewType: 'messages' | 'reservations'
  customerId: string
  customerName: string
  allMessages: MessageThread[]
  allReservations: Reservation[]
  onBack: () => void
}

const FilteredCustomerView: React.FC<FilteredCustomerViewProps> = ({
  viewType,
  customerId,
  customerName,
  allMessages,
  allReservations,
  onBack
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  // 顧客特定のデータをフィルタリング
  const filteredData = useMemo(() => {
    if (viewType === 'messages') {
      return allMessages.filter(message => message.customer.id === customerId)
    } else {
      return allReservations.filter(reservation => 
        reservation.customer?.id === customerId
      )
    }
  }, [viewType, customerId, allMessages, allReservations])

  // さらに検索・フィルターを適用
  const finalFilteredData = useMemo(() => {
    let data = [...filteredData]

    // 検索フィルター
    if (searchTerm) {
      if (viewType === 'messages') {
        data = (data as MessageThread[]).filter(message =>
          message.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.assignedStaff?.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      } else {
        data = (data as Reservation[]).filter(reservation =>
          reservation.menuContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reservation.staff?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reservation.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
    }

    // ステータスフィルター
    if (statusFilter !== 'all') {
      if (viewType === 'messages') {
        data = (data as MessageThread[]).filter(message => message.status === statusFilter)
      } else {
        data = (data as Reservation[]).filter(reservation => reservation.status === statusFilter)
      }
    }

    // 日付フィルター
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3)
          break
      }

      if (viewType === 'messages') {
        data = (data as MessageThread[]).filter(message => 
          new Date(message.updatedAt) >= filterDate
        )
      } else {
        data = (data as Reservation[]).filter(reservation => 
          new Date(reservation.startTime) >= filterDate
        )
      }
    }

    return data
  }, [filteredData, searchTerm, statusFilter, dateFilter, viewType])

  const getStatusColor = (status: string) => {
    const statusColors = {
      // Message statuses
      'OPEN': 'bg-green-100 text-green-800',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
      'CLOSED': 'bg-gray-100 text-gray-800',
      // Reservation statuses
      'CONFIRMED': 'bg-green-100 text-green-800',
      'TENTATIVE': 'bg-yellow-100 text-yellow-800',
      'COMPLETED': 'bg-blue-100 text-blue-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'NO_SHOW': 'bg-gray-100 text-gray-800'
    }
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      // Message statuses
      'OPEN': '未対応',
      'IN_PROGRESS': '対応中',
      'CLOSED': '完了',
      // Reservation statuses
      'CONFIRMED': '確定',
      'TENTATIVE': '仮予約',
      'COMPLETED': '完了',
      'CANCELLED': 'キャンセル',
      'NO_SHOW': '未来店'
    }
    return statusLabels[status as keyof typeof statusLabels] || status
  }

  const renderMessageItem = (message: MessageThread) => (
    <div key={message.id} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-2">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            message.channel === 'INSTAGRAM' ? 'bg-pink-100' : 'bg-green-100'
          }`}>
            <MessageSquare className={`w-4 h-4 ${
              message.channel === 'INSTAGRAM' ? 'text-pink-600' : 'text-green-600'
            }`} />
          </div>
          <div>
            <div className="font-medium text-gray-900">{message.channel}</div>
            <div className="text-sm text-gray-500">
              {format(new Date(message.updatedAt), 'M/d HH:mm', { locale: ja })}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
            {getStatusLabel(message.status)}
          </span>
          {message.unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {message.unreadCount}
            </span>
          )}
        </div>
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-gray-700 line-clamp-2">
          {message.lastMessage.content}
        </p>
      </div>
      
      {message.assignedStaff && (
        <div className="flex items-center text-sm text-gray-600">
          <User className="w-4 h-4 mr-1" />
          担当: {message.assignedStaff.name}
        </div>
      )}
    </div>
  )

  const renderReservationItem = (reservation: Reservation) => (
    <div key={reservation.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{reservation.menuContent}</div>
            <div className="text-sm text-gray-500">
              {format(new Date(reservation.startTime), 'M/d(E) HH:mm', { locale: ja })}
            </div>
          </div>
        </div>
        
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
          {getStatusLabel(reservation.status)}
        </span>
      </div>
      
      <div className="space-y-2">
        {reservation.staff && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-1" />
            担当: {reservation.staff.name}
          </div>
        )}
        
        {reservation.price && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium text-green-600">
              ¥{reservation.price.toLocaleString()}
            </span>
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          {reservation.source === 'HOTPEPPER' ? 'ホットペッパー' :
           reservation.source === 'PHONE' ? '電話予約' :
           reservation.source === 'MANUAL' ? '店頭予約' : reservation.source}
        </div>
        
        {reservation.notes && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {reservation.notes}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </button>
        </div>
        
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{customerName}様</h2>
            <p className="text-gray-600">
              {viewType === 'messages' ? 'メッセージ履歴' : '予約履歴'}
            </p>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          {viewType === 'messages' ? 
            `${filteredData.length}件のメッセージ履歴` : 
            `${filteredData.length}件の予約履歴`
          }
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">検索</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={viewType === 'messages' ? 'メッセージ内容で検索...' : 'メニューや備考で検索...'}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              {viewType === 'messages' ? (
                <>
                  <option value="OPEN">未対応</option>
                  <option value="IN_PROGRESS">対応中</option>
                  <option value="CLOSED">完了</option>
                </>
              ) : (
                <>
                  <option value="CONFIRMED">確定</option>
                  <option value="TENTATIVE">仮予約</option>
                  <option value="COMPLETED">完了</option>
                  <option value="CANCELLED">キャンセル</option>
                  <option value="NO_SHOW">未来店</option>
                </>
              )}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">期間</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="week">1週間以内</option>
              <option value="month">1ヶ月以内</option>
              <option value="quarter">3ヶ月以内</option>
            </select>
          </div>
        </div>
        
        {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {finalFilteredData.length}件の結果
            </div>
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setDateFilter('all')
              }}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <X className="w-4 h-4 mr-1" />
              フィルターをクリア
            </button>
          </div>
        )}
      </div>

      {/* データ一覧 */}
      <div className="space-y-4">
        {finalFilteredData.length > 0 ? (
          finalFilteredData.map((item) => 
            viewType === 'messages' 
              ? renderMessageItem(item as MessageThread)
              : renderReservationItem(item as Reservation)
          )
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="text-gray-400 mb-4">
              {viewType === 'messages' ? (
                <MessageSquare className="w-12 h-12 mx-auto" />
              ) : (
                <Calendar className="w-12 h-12 mx-auto" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                ? 'フィルター条件に一致するデータがありません'
                : viewType === 'messages' 
                  ? 'メッセージ履歴がありません'
                  : '予約履歴がありません'
              }
            </h3>
            <p className="text-gray-500">
              {viewType === 'messages' 
                ? 'この顧客からのメッセージはまだありません。'
                : 'この顧客の予約履歴はまだありません。'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FilteredCustomerView