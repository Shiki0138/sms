import { useState } from 'react'
import { 
  MessageSquare, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings,
  Instagram,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Send,
  Menu,
  X,
  ExternalLink
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { format, isToday, isTomorrow } from 'date-fns'
import { ja } from 'date-fns/locale'

const API_BASE_URL = 'http://localhost:4002/api/v1'

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

interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  instagramId?: string
  lineId?: string
  visitCount: number
  lastVisitDate?: string
  createdAt: string
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
}

function App() {
  const [activeTab, setActiveTab] = useState('messages')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [replyingToThread, setReplyingToThread] = useState<string | null>(null)

  // Fetch data
  const { data: threads } = useQuery<{ threads: MessageThread[] }>({
    queryKey: ['threads'],
    queryFn: () => axios.get(`${API_BASE_URL}/messages/threads`).then(res => res.data)
  })

  const { data: customers } = useQuery<{ customers: Customer[] }>({
    queryKey: ['customers'],
    queryFn: () => axios.get(`${API_BASE_URL}/customers`).then(res => res.data)
  })

  const { data: reservations } = useQuery<{ reservations: Reservation[] }>({
    queryKey: ['reservations'],
    queryFn: () => axios.get(`${API_BASE_URL}/reservations`).then(res => res.data)
  })

  // Calculate unread count
  const unreadCount = threads?.threads.reduce((sum, t) => sum + t.unreadCount, 0) || 0

  // Handle reply submission
  const handleSendReply = async (threadId: string) => {
    if (!replyMessage.trim()) return
    
    try {
      await axios.post(`${API_BASE_URL}/messages/send`, {
        threadId,
        content: replyMessage.trim(),
        mediaType: 'TEXT'
      })
      
      setReplyMessage('')
      setReplyingToThread(null)
      // Refetch threads to update the UI
      window.location.reload()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  // Handle Instagram link click
  const handleInstagramClick = (instagramId: string) => {
    window.open(`https://www.instagram.com/${instagramId}`, '_blank')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return `今日 ${format(date, 'HH:mm')}`
    if (isTomorrow(date)) return `明日 ${format(date, 'HH:mm')}`
    return format(date, 'M月d日 HH:mm', { locale: ja })
  }

  const getChannelIcon = (channel: string) => {
    return channel === 'INSTAGRAM' ? (
      <Instagram className="w-4 h-4 text-pink-500" />
    ) : (
      <MessageCircle className="w-4 h-4 text-green-500" />
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      OPEN: 'badge-danger',
      IN_PROGRESS: 'badge-warning',
      CLOSED: 'badge-success',
      CONFIRMED: 'badge-success',
      TENTATIVE: 'badge-warning',
      CANCELLED: 'badge-danger',
      COMPLETED: 'badge-primary'
    }
    
    const labels = {
      OPEN: '未対応',
      IN_PROGRESS: '対応中',
      CLOSED: '完了',
      CONFIRMED: '確定',
      TENTATIVE: '仮予約',
      CANCELLED: 'キャンセル',
      COMPLETED: '完了'
    }
    
    return (
      <span className={`badge ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const MessagesList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">統合インボックス</h2>
        <div className="flex flex-wrap gap-2">
          <span className="badge badge-danger text-xs">{threads?.threads.filter(t => t.status === 'OPEN').length || 0} 未対応</span>
          <span className="badge badge-warning text-xs">{threads?.threads.filter(t => t.status === 'IN_PROGRESS').length || 0} 対応中</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {threads?.threads.map((thread) => (
          <div key={thread.id} className="card hover:shadow-md transition-shadow">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-1">
                    {getChannelIcon(thread.channel)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {thread.customer.name}
                      </h3>
                      {getStatusBadge(thread.status)}
                      {thread.unreadCount > 0 && (
                        <span className="badge badge-danger">{thread.unreadCount}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2 break-words">
                      {thread.lastMessage.content}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 flex-wrap gap-2">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(thread.lastMessage.createdAt)}
                      </div>
                      {thread.assignedStaff && (
                        <div className="flex items-center">
                          <span>担当: {thread.assignedStaff.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Reply Button */}
                <div className="flex-shrink-0 ml-2">
                  <button
                    onClick={() => setReplyingToThread(replyingToThread === thread.id ? null : thread.id)}
                    className="btn btn-primary btn-sm flex items-center text-xs px-3 py-1.5"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    返信
                  </button>
                </div>
              </div>

              {/* Reply Form */}
              {replyingToThread === thread.id && (
                <div className="border-t pt-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="メッセージを入力..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSendReply(thread.id)
                        }
                      }}
                    />
                    <button
                      onClick={() => handleSendReply(thread.id)}
                      disabled={!replyMessage.trim()}
                      className="btn btn-primary btn-sm px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => {
                        setReplyingToThread(null)
                        setReplyMessage('')
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const CustomersList = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">顧客管理</h2>
        <button className="btn btn-primary text-sm">新規顧客登録</button>
      </div>
      
      <div className="space-y-4">
        {customers?.customers.map((customer) => (
          <div key={customer.id} className="card hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-2 break-words">{customer.name}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                    {customer.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="break-all">{customer.phone}</span>
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="break-all">{customer.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-medium text-gray-900">来店回数: {customer.visitCount}回</div>
                  {customer.lastVisitDate && (
                    <div className="text-xs text-gray-500">
                      最終来店: {format(new Date(customer.lastVisitDate), 'M月d日', { locale: ja })}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                {customer.instagramId && (
                  <button
                    onClick={() => handleInstagramClick(customer.instagramId!)}
                    className="flex items-center text-xs text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-2 py-1 rounded-md transition-colors"
                  >
                    <Instagram className="w-3 h-3 mr-1" />
                    {customer.instagramId}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </button>
                )}
                {customer.lineId && (
                  <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    LINE連携済み
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const ReservationsList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">予約管理</h2>
        <button className="btn btn-primary">新規予約</button>
      </div>
      
      <div className="grid gap-4">
        {reservations?.reservations.map((reservation) => (
          <div key={reservation.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{reservation.customerName}</h3>
                  {getStatusBadge(reservation.status)}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <div className="flex items-center mb-1">
                    <Clock className="w-4 h-4 mr-2" />
                    {formatDate(reservation.startTime)}
                    {reservation.endTime && ` - ${format(new Date(reservation.endTime), 'HH:mm')}`}
                  </div>
                  <div className="ml-6">
                    メニュー: {reservation.menuContent}
                  </div>
                  {reservation.staff && (
                    <div className="ml-6">
                      担当: {reservation.staff.name}
                    </div>
                  )}
                </div>
                {reservation.notes && (
                  <p className="text-sm text-gray-500 ml-6">{reservation.notes}</p>
                )}
              </div>
              <div className="text-right text-xs text-gray-500">
                {reservation.source === 'HOTPEPPER' && 'ホットペッパー'}
                {reservation.source === 'GOOGLE_CALENDAR' && 'Google Calendar'}
                {reservation.source === 'MANUAL' && '手動登録'}
                {reservation.source === 'PHONE' && '電話予約'}
                {reservation.source === 'WALK_IN' && '飛び込み'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const Dashboard = () => {
    const totalThreads = threads?.threads.length || 0
    const todayReservations = reservations?.reservations.filter(r => 
      isToday(new Date(r.startTime))
    ).length || 0
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">ダッシュボード</h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総メッセージ数</p>
                <p className="text-2xl font-bold text-gray-900">{totalThreads}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">未読メッセージ</p>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">今日の予約</p>
                <p className="text-2xl font-bold text-gray-900">{todayReservations}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総顧客数</p>
                <p className="text-2xl font-bold text-gray-900">{customers?.customers.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">最近のメッセージ</h3>
            <div className="space-y-3">
              {threads?.threads.slice(0, 3).map((thread) => (
                <div key={thread.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  {getChannelIcon(thread.channel)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {thread.customer.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {thread.lastMessage.content}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {format(new Date(thread.lastMessage.createdAt), 'HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">今日の予約</h3>
            <div className="space-y-3">
              {reservations?.reservations
                .filter(r => isToday(new Date(r.startTime)))
                .slice(0, 3)
                .map((reservation) => (
                <div key={reservation.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {reservation.customerName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {reservation.menuContent}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {format(new Date(reservation.startTime), 'HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">🏪 美容室統合管理システム</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="hidden sm:inline">デモモード</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <nav className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-white shadow-sm transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:h-screen md:sticky md:top-16
        `}>
          <div className="p-4 md:p-6 pt-20 md:pt-6">
            <div className="space-y-2">
              <button
                onClick={() => {
                  setActiveTab('dashboard')
                  setIsSidebarOpen(false)
                }}
                className={`sidebar-item w-full ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                <BarChart3 className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">ダッシュボード</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('messages')
                  setIsSidebarOpen(false)
                }}
                className={`sidebar-item w-full ${activeTab === 'messages' ? 'active' : ''}`}
              >
                <MessageSquare className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">統合インボックス</span>
                {unreadCount > 0 && (
                  <span className="ml-auto badge badge-danger flex-shrink-0">{unreadCount}</span>
                )}
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('reservations')
                  setIsSidebarOpen(false)
                }}
                className={`sidebar-item w-full ${activeTab === 'reservations' ? 'active' : ''}`}
              >
                <Calendar className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">予約管理</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('customers')
                  setIsSidebarOpen(false)
                }}
                className={`sidebar-item w-full ${activeTab === 'customers' ? 'active' : ''}`}
              >
                <Users className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">顧客管理</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('settings')
                  setIsSidebarOpen(false)
                }}
                className={`sidebar-item w-full ${activeTab === 'settings' ? 'active' : ''}`}
              >
                <Settings className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">設定</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-full">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'messages' && <MessagesList />}
            {activeTab === 'customers' && <CustomersList />}
            {activeTab === 'reservations' && <ReservationsList />}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">設定</h2>
                <div className="card">
                  <p className="text-gray-600">設定画面は実装中です。</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App