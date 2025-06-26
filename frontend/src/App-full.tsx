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
  ExternalLink,
  Save,
  User,
  Calendar as CalendarIcon,
  FileText,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Palette,
  Star,
  Sparkles,
  RotateCcw
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { format, isToday, isTomorrow } from 'date-fns'
import { ja } from 'date-fns/locale'

const API_BASE_URL = 'http://localhost:8080/api/v1'

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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  
  // Settings state
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false)
  const [calendarSettings, setCalendarSettings] = useState({
    googleClientId: '',
    googleClientSecret: '',
    autoSync: true,
    syncInterval: 15, // minutes
  })
  
  // Business settings state
  const [businessSettings, setBusinessSettings] = useState({
    openHour: 9,
    closeHour: 18,
    timeSlotMinutes: 30,
    closedDays: [0], // Sunday = 0, Monday = 1, etc.
    customClosedDates: [] as string[] // YYYY-MM-DD format
  })
  
  // Calendar view state
  const [calendarView, setCalendarView] = useState<'day' | 'threeDay' | 'week' | 'month'>('week')
  const [calendarDate, setCalendarDate] = useState(new Date())

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

  // Handle email click
  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  // Handle LINE click
  
  // Get menu icon based on menu content
  const getMenuIcon = (menuContent: string) => {
    const menu = menuContent.toLowerCase()
    if (menu.includes('カット')) return <Scissors className="w-3 h-3 text-blue-500" />
    if (menu.includes('カラー')) return <Palette className="w-3 h-3 text-purple-500" />
    if (menu.includes('パーマ')) return <Sparkles className="w-3 h-3 text-pink-500" />
    return <Star className="w-3 h-3 text-yellow-500" />
  }
  
  // Generate time slots for business hours
  const generateTimeSlots = () => {
    const slots = []
    const { openHour, closeHour, timeSlotMinutes } = businessSettings
    
    for (let hour = openHour; hour < closeHour; hour++) {
      for (let minute = 0; minute < 60; minute += timeSlotMinutes) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }
  
  // Check if a date is a closed day
  const isClosedDay = (date: Date) => {
    const dayOfWeek = date.getDay()
    const dateString = format(date, 'yyyy-MM-dd')
    return businessSettings.closedDays.includes(dayOfWeek) || 
           businessSettings.customClosedDates.includes(dateString)
  }
  
  // Get reservations for a specific date and time slot
  const getReservationsForSlot = (date: Date, timeSlot: string) => {
    return reservations?.reservations.filter(r => {
      const reservationDate = new Date(r.startTime)
      const reservationTime = format(reservationDate, 'HH:mm')
      const reservationDateStr = format(reservationDate, 'yyyy-MM-dd')
      const targetDateStr = format(date, 'yyyy-MM-dd')
      
      return reservationDateStr === targetDateStr && reservationTime === timeSlot
    }) || []
  }
  
  // Get dates for current view
  const getViewDates = () => {
    const dates = []
    const baseDate = new Date(calendarDate)
    
    if (calendarView === 'day') {
      dates.push(baseDate)
    } else if (calendarView === 'threeDay') {
      for (let i = 0; i < 3; i++) {
        const date = new Date(baseDate)
        date.setDate(date.getDate() + i)
        dates.push(date)
      }
    } else if (calendarView === 'week') {
      // Start from Monday
      const startOfWeek = new Date(baseDate)
      startOfWeek.setDate(baseDate.getDate() - baseDate.getDay() + 1)
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        dates.push(date)
      }
    }
    
    return dates
  }
  
  // Handle LINE app launch
  const handleLineAppClick = (lineId?: string) => {
    // Try to open LINE app with specific user if lineId is provided
    const lineUrl = lineId ? `line://ti/p/${lineId}` : 'line://'
    const lineWebUrl = 'https://line.me/'
    
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /iphone|ipad|android/.test(userAgent)
    
    if (isMobile) {
      // Try to open LINE app
      window.location.href = lineUrl
      // Fallback to web version after a delay
      setTimeout(() => {
        window.open(lineWebUrl, '_blank')
      }, 1000)
    } else {
      window.open(lineWebUrl, '_blank')
    }
  }

  // Handle Google Calendar connection
  const handleGoogleCalendarConnect = async () => {
    try {
      // Demo mode - simulate connection
      setGoogleCalendarConnected(true)
      alert('Google Calendarに接続しました（デモモード）')
    } catch (error) {
      alert('接続に失敗しました')
    }
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
                  <button
                    onClick={() => {
                      setSelectedCustomer(customer)
                      setShowCustomerModal(true)
                    }}
                    className="text-lg font-medium text-gray-900 mb-2 break-words hover:text-blue-600 transition-colors text-left"
                  >
                    {customer.name}
                  </button>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                    {customer.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1 flex-shrink-0" />
                        <a href={`tel:${customer.phone}`} className="break-all hover:text-blue-600 transition-colors">
                          {customer.phone}
                        </a>
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1 flex-shrink-0" />
                        <button
                          onClick={() => handleEmailClick(customer.email!)}
                          className="break-all hover:text-blue-600 transition-colors text-left"
                        >
                          {customer.email}
                        </button>
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
                  <button
                    onClick={() => handleLineAppClick(customer.lineId)}
                    className="flex items-center text-xs text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-md transition-colors"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    LINE連携済み
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </button>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">予約管理</h2>
        <div className="flex flex-wrap items-center gap-3">
          {/* Calendar View Selector */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {[{ value: 'day', label: '日' }, { value: 'threeDay', label: '3日' }, { value: 'week', label: '週' }, { value: 'month', label: '月' }].map((view) => (
              <button
                key={view.value}
                onClick={() => setCalendarView(view.value as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  calendarView === view.value
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
          <button className="btn btn-primary text-sm">新規予約</button>
        </div>
      </div>
      
      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              const newDate = new Date(calendarDate)
              if (calendarView === 'day') newDate.setDate(newDate.getDate() - 1)
              else if (calendarView === 'threeDay') newDate.setDate(newDate.getDate() - 3)
              else if (calendarView === 'week') newDate.setDate(newDate.getDate() - 7)
              else newDate.setMonth(newDate.getMonth() - 1)
              setCalendarDate(newDate)
            }}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <h3 className="text-lg font-medium text-gray-900">
            {calendarView === 'month' 
              ? format(calendarDate, 'yyyy年M月', { locale: ja })
              : calendarView === 'week'
                ? `${format(calendarDate, 'M月d日', { locale: ja })} 週`
                : calendarView === 'threeDay'
                  ? `${format(calendarDate, 'M月d日', { locale: ja })} (3日間)`
                  : format(calendarDate, 'M月d日', { locale: ja })
            }
          </h3>
          
          <button
            onClick={() => {
              const newDate = new Date(calendarDate)
              if (calendarView === 'day') newDate.setDate(newDate.getDate() + 1)
              else if (calendarView === 'threeDay') newDate.setDate(newDate.getDate() + 3)
              else if (calendarView === 'week') newDate.setDate(newDate.getDate() + 7)
              else newDate.setMonth(newDate.getMonth() + 1)
              setCalendarDate(newDate)
            }}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setCalendarDate(new Date())}
            className="btn btn-secondary btn-sm"
          >
            今日
          </button>
        </div>
      </div>
      
      {/* Calendar Views */}
      {calendarView === 'month' ? (
        /* Month View - Original implementation */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 h-96">
            {Array.from({ length: 42 }, (_, i) => {
              const startOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1)
              const startOfCalendar = new Date(startOfMonth)
              startOfCalendar.setDate(startOfCalendar.getDate() - startOfMonth.getDay())
              const currentDate = new Date(startOfCalendar)
              currentDate.setDate(currentDate.getDate() + i)
              
              const dayReservations = reservations?.reservations.filter(r => 
                format(new Date(r.startTime), 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
              ) || []
              
              const isClosed = isClosedDay(currentDate)
              
              return (
                <div key={i} className={`border-r border-b border-gray-200 p-1 min-h-24 ${
                  isClosed ? 'bg-red-50' : ''
                }`}>
                  <div className={`text-sm flex items-center justify-between ${
                    currentDate.getMonth() !== calendarDate.getMonth() 
                      ? 'text-gray-400' 
                      : isToday(currentDate) 
                        ? 'text-blue-600 font-bold'
                        : 'text-gray-900'
                  }`}>
                    <span>{currentDate.getDate()}</span>
                    {isClosed && <span className="text-xs text-red-500">定休</span>}
                  </div>
                  <div className="space-y-1 mt-1">
                    {dayReservations.slice(0, 2).map((reservation) => (
                      <div key={reservation.id} className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate">
                        <div className="font-medium">{reservation.customerName}</div>
                        <div className="flex items-center text-xs">
                          {getMenuIcon(reservation.menuContent)}
                          <span className="ml-1 truncate">{reservation.menuContent}</span>
                        </div>
                        {reservation.staff && (
                          <div className="text-xs text-blue-600">{reservation.staff.name}</div>
                        )}
                      </div>
                    ))}
                    {dayReservations.length > 2 && (
                      <div className="text-xs text-gray-500">+{dayReservations.length - 2} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex">
            {/* Time column */}
            <div className="w-20 border-r border-gray-200">
              <div className="h-12 border-b border-gray-200 bg-gray-50 flex items-center justify-center text-sm font-medium text-gray-500">
                時間
              </div>
              {generateTimeSlots().map((timeSlot) => (
                <div key={timeSlot} className="h-16 border-b border-gray-200 flex items-center justify-center text-xs text-gray-600">
                  {timeSlot}
                </div>
              ))}
            </div>
            
            {/* Date columns */}
            <div className="flex-1 overflow-x-auto">
              <div className="flex min-w-full">
                {getViewDates().map((date, dateIndex) => {
                  const isClosed = isClosedDay(date)
                  const isToday_ = isToday(date)
                  
                  return (
                    <div key={dateIndex} className={`flex-1 min-w-48 border-r border-gray-200 ${
                      isClosed ? 'bg-red-50' : ''
                    }`}>
                      {/* Date header */}
                      <div className={`h-12 border-b border-gray-200 flex flex-col items-center justify-center text-sm ${
                        isClosed 
                          ? 'bg-red-100 text-red-700'
                          : isToday_
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'bg-gray-50 text-gray-700'
                      }`}>
                        <div className="font-medium">
                          {format(date, 'M/d', { locale: ja })}
                        </div>
                        <div className="text-xs">
                          {format(date, 'E', { locale: ja })}
                          {isClosed && <span className="ml-1 text-red-600">(定休)</span>}
                        </div>
                      </div>
                      
                      {/* Time slots */}
                      {generateTimeSlots().map((timeSlot) => {
                        const slotReservations = getReservationsForSlot(date, timeSlot)
                        
                        return (
                          <div key={timeSlot} className={`h-16 border-b border-gray-200 p-1 ${
                            isClosed ? 'bg-red-25' : 'hover:bg-gray-50'
                          }`}>
                            {slotReservations.map((reservation) => (
                              <div key={reservation.id} className="bg-blue-100 text-blue-800 rounded p-1 mb-1 text-xs">
                                <div className="font-medium truncate">{reservation.customerName}</div>
                                <div className="flex items-center">
                                  {getMenuIcon(reservation.menuContent)}
                                  <span className="ml-1 truncate">{reservation.menuContent}</span>
                                </div>
                                {reservation.staff && (
                                  <div className="text-xs text-blue-600 truncate">{reservation.staff.name}</div>
                                )}
                              </div>
                            ))}
                            
                            {/* Click area to add new reservation */}
                            {!isClosed && slotReservations.length === 0 && (
                              <button className="w-full h-full text-gray-400 hover:text-gray-600 hover:bg-blue-50 rounded transition-colors text-xs">
                                +
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
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
          <button
            onClick={() => setActiveTab('messages')}
            className="card hover:shadow-lg transition-all duration-200 hover:scale-105 text-left cursor-pointer"
          >
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総メッセージ数</p>
                <p className="text-2xl font-bold text-gray-900">{totalThreads}</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('messages')}
            className="card hover:shadow-lg transition-all duration-200 hover:scale-105 text-left cursor-pointer"
          >
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">未読メッセージ</p>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('reservations')}
            className="card hover:shadow-lg transition-all duration-200 hover:scale-105 text-left cursor-pointer"
          >
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">今日の予約</p>
                <p className="text-2xl font-bold text-gray-900">{todayReservations}</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('customers')}
            className="card hover:shadow-lg transition-all duration-200 hover:scale-105 text-left cursor-pointer"
          >
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総顧客数</p>
                <p className="text-2xl font-bold text-gray-900">{customers?.customers.length || 0}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">最近のメッセージ</h3>
              <button
                onClick={() => setActiveTab('messages')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                すべて見る →
              </button>
            </div>
            <div className="space-y-3">
              {threads?.threads.slice(0, 3).map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setActiveTab('messages')}
                  className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  {getChannelIcon(thread.channel)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {thread.customer.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {thread.lastMessage.content}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0">
                    {format(new Date(thread.lastMessage.createdAt), 'HH:mm')}
                  </div>
                </button>
              ))}
              {(!threads?.threads || threads.threads.length === 0) && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  メッセージがありません
                </div>
              )}
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">今日の予約</h3>
              <button
                onClick={() => setActiveTab('reservations')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                すべて見る →
              </button>
            </div>
            <div className="space-y-3">
              {reservations?.reservations
                .filter(r => isToday(new Date(r.startTime)))
                .slice(0, 3)
                .map((reservation) => (
                <button
                  key={reservation.id}
                  onClick={() => setActiveTab('reservations')}
                  className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {reservation.customerName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {reservation.menuContent}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0">
                    {format(new Date(reservation.startTime), 'HH:mm')}
                  </div>
                </button>
              ))}
              {(!reservations?.reservations || 
                reservations.reservations.filter(r => isToday(new Date(r.startTime))).length === 0) && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  今日の予約はありません
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg sticky top-0 z-40">
        <div className="px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                {/* Logo */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-xl flex items-center justify-center shadow-lg">
                  <Scissors className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                
                {/* Title */}
                <div className="min-w-0 flex-1">
                  <h1 className="text-xs sm:text-lg font-bold text-white truncate leading-tight">美容室統合管理システム</h1>
                  <p className="text-xs text-blue-100 hidden sm:block opacity-90">統合管理プラットフォーム</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
              <div className="flex items-center space-x-1 sm:space-x-2 bg-green-500 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm shadow-lg">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                <span className="hidden sm:inline font-medium">デモモード</span>
                <span className="sm:hidden">●</span>
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
          w-64 bg-gray-50 shadow-xl transform transition-transform duration-300 ease-in-out
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
              <div className="space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">設定</h2>
                
                {/* Google Calendar Integration */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Google Calendar 連携</h3>
                    <div className={`flex items-center ${googleCalendarConnected ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${googleCalendarConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      {googleCalendarConnected ? '接続済み' : '未接続'}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Google Client ID
                        </label>
                        <input
                          type="text"
                          value={calendarSettings.googleClientId}
                          onChange={(e) => setCalendarSettings(prev => ({ ...prev, googleClientId: e.target.value }))}
                          placeholder="Google API Client ID"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Google Client Secret
                        </label>
                        <input
                          type="password"
                          value={calendarSettings.googleClientSecret}
                          onChange={(e) => setCalendarSettings(prev => ({ ...prev, googleClientSecret: e.target.value }))}
                          placeholder="Google API Client Secret"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={calendarSettings.autoSync}
                            onChange={(e) => setCalendarSettings(prev => ({ ...prev, autoSync: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">自動同期を有効にする</span>
                        </label>
                        <p className="text-xs text-gray-500 ml-6 mt-1">指定間隔でGoogle Calendarと自動同期します</p>
                      </div>
                      
                      <div className="text-right">
                        <label className="block text-sm font-medium text-gray-700 mb-1">同期間隔</label>
                        <select
                          value={calendarSettings.syncInterval}
                          onChange={(e) => setCalendarSettings(prev => ({ ...prev, syncInterval: parseInt(e.target.value) }))}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={5}>5分</option>
                          <option value={15}>15分</option>
                          <option value={30}>30分</option>
                          <option value={60}>1時間</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleGoogleCalendarConnect}
                        disabled={!calendarSettings.googleClientId || !calendarSettings.googleClientSecret}
                        className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {googleCalendarConnected ? '再接続' : 'Google Calendarに接続'}
                      </button>
                      
                      {googleCalendarConnected && (
                        <button
                          onClick={() => setGoogleCalendarConnected(false)}
                          className="btn btn-secondary"
                        >
                          接続解除
                        </button>
                      )}
                      
                      <button className="btn btn-secondary">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        手動同期
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Business Hours & Closed Days Settings */}
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">営業時間・定休日設定</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          開店時間
                        </label>
                        <select
                          value={businessSettings.openHour}
                          onChange={(e) => setBusinessSettings(prev => ({ ...prev, openHour: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i}>{i}:00</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          閉店時間
                        </label>
                        <select
                          value={businessSettings.closeHour}
                          onChange={(e) => setBusinessSettings(prev => ({ ...prev, closeHour: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i}>{i}:00</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          予約間隔
                        </label>
                        <select
                          value={businessSettings.timeSlotMinutes}
                          onChange={(e) => setBusinessSettings(prev => ({ ...prev, timeSlotMinutes: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={15}>15分</option>
                          <option value={30}>30分</option>
                          <option value={60}>60分</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        定休日
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                          <label key={index} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={businessSettings.closedDays.includes(index)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setBusinessSettings(prev => ({
                                    ...prev,
                                    closedDays: [...prev.closedDays, index]
                                  }))
                                } else {
                                  setBusinessSettings(prev => ({
                                    ...prev,
                                    closedDays: prev.closedDays.filter(d => d !== index)
                                  }))
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                            />
                            <span className="text-sm text-gray-700">{day}曜日</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <button className="btn btn-primary">
                        <Save className="w-4 h-4 mr-2" />
                        設定を保存
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Other Settings */}
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">システム設定</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">通知設定</h4>
                        <p className="text-xs text-gray-500">新しいメッセージや予約の通知を管理します</p>
                      </div>
                      <button className="btn btn-secondary btn-sm">設定</button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">データバックアップ</h4>
                        <p className="text-xs text-gray-500">定期的なデータバックアップを設定します</p>
                      </div>
                      <button className="btn btn-secondary btn-sm">設定</button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">API設定</h4>
                        <p className="text-xs text-gray-500">Instagram・LINE APIの設定を管理します</p>
                      </div>
                      <button className="btn btn-secondary btn-sm">設定</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Customer Detail Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <User className="w-6 h-6 mr-2" />
                  顧客カルテ - {selectedCustomer.name}
                </h2>
                <button
                  onClick={() => {
                    setShowCustomerModal(false)
                    setSelectedCustomer(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Customer Information */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">基本情報</h3>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">氏名</label>
                      <p className="text-gray-900 font-medium">{selectedCustomer.name}</p>
                    </div>
                    
                    {selectedCustomer.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">電話番号</label>
                        <div className="flex items-center space-x-2">
                          <a 
                            href={`tel:${selectedCustomer.phone}`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {selectedCustomer.phone}
                          </a>
                          <Phone className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    )}
                    
                    {selectedCustomer.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">メールアドレス</label>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEmailClick(selectedCustomer.email!)}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {selectedCustomer.email}
                          </button>
                          <Mail className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">登録日</label>
                      <p className="text-gray-900">
                        {format(new Date(selectedCustomer.createdAt), 'yyyy年M月d日', { locale: ja })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Visit Stats */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">来店情報</h3>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">来店回数</label>
                      <p className="text-2xl font-bold text-blue-600">{selectedCustomer.visitCount}回</p>
                    </div>
                    
                    {selectedCustomer.lastVisitDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">最終来店日</label>
                        <p className="text-gray-900 font-medium">
                          {format(new Date(selectedCustomer.lastVisitDate), 'yyyy年M月d日', { locale: ja })}
                        </p>
                        <p className="text-sm text-gray-500">
                          （{Math.floor((new Date().getTime() - new Date(selectedCustomer.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24))}日前）
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Social Media Links */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">SNS連携</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedCustomer.instagramId && (
                      <button
                        onClick={() => handleInstagramClick(selectedCustomer.instagramId!)}
                        className="flex items-center text-sm text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-3 py-2 rounded-md transition-colors"
                      >
                        <Instagram className="w-4 h-4 mr-2" />
                        Instagram: {selectedCustomer.instagramId}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </button>
                    )}
                    
                    {selectedCustomer.lineId && (
                      <button
                        onClick={() => handleLineAppClick(selectedCustomer.lineId)}
                        className="flex items-center text-sm text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-md transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        LINE連携済み
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Notes Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">カルテメモ</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <textarea
                      rows={4}
                      placeholder="顧客の特記事項、好み、アレルギー情報などを記録..."
                      className="w-full border-0 bg-transparent resize-none focus:outline-none text-sm"
                      defaultValue="・ブラウン系カラー希望\n・毛量多め\n・敏感肌のため、パッチテスト必要\n・次回予約: カット + カラー希望"
                    />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <button className="btn btn-primary flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    カルテを更新
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="btn btn-secondary flex items-center"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    メッセージ履歴
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('reservations')}
                    className="btn btn-secondary flex items-center"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    予約履歴
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App