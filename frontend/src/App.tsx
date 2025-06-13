import { useState, useEffect } from 'react'
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
  Eye,
  EyeOff,
  RefreshCw,
  Link,
  User,
  MapPin,
  Calendar as CalendarIcon,
  FileText,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Palette,
  Star,
  Sparkles,
  LogOut,
  Shield,
  TrendingUp,
  Activity,
  DollarSign,
  UserCheck,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Bookmark,
  Hash
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { format, isToday, isTomorrow, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { ja } from 'date-fns/locale'
import toast from 'react-hot-toast'
import Login from './components/Login'

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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentStaff, setCurrentStaff] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [replyingToThread, setReplyingToThread] = useState<string | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [customerIdentification, setCustomerIdentification] = useState<{[key: string]: any}>({})
  const [showCustomerRegistration, setShowCustomerRegistration] = useState<{[key: string]: boolean}>({})
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  })
  
  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    channel: 'all',
    assignedStaff: 'all',
    unreadOnly: false,
    dateFrom: '',
    dateTo: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  })
  const [savedFilters, setSavedFilters] = useState<any[]>([])
  const [filterMetadata, setFilterMetadata] = useState<any>(null)
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

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const staffData = localStorage.getItem('staff')
    
    if (token && staffData) {
      setIsAuthenticated(true)
      setCurrentStaff(JSON.parse(staffData))
    }
  }, [])

  // Handle login
  const handleLogin = (token: string, staff: any) => {
    setIsAuthenticated(true)
    setCurrentStaff(staff)
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('staff')
    setIsAuthenticated(false)
    setCurrentStaff(null)
    toast.success('ログアウトしました')
  }

  // AI返信提案を取得
  const getAiReplySuggestions = async (threadId: string, messageContent: string, customerContext?: any) => {
    setLoadingSuggestions(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/messages/ai-reply-suggestions`, {
        threadId,
        messageContent,
        customerContext
      })
      setAiSuggestions(response.data.suggestions)
    } catch (error) {
      console.error('AI返信提案の取得に失敗:', error)
      toast.error('AI返信提案の取得に失敗しました')
    } finally {
      setLoadingSuggestions(false)
    }
  }

  // 顧客識別機能
  const identifyCustomer = async (thread: MessageThread) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/customers/identify`, {
        instagramId: thread.customer.instagramId,
        lineId: thread.customer.lineId,
        name: thread.customer.name
      })
      
      setCustomerIdentification(prev => ({
        ...prev,
        [thread.id]: response.data
      }))
    } catch (error) {
      console.error('顧客識別に失敗:', error)
    }
  }

  // 新規顧客登録
  const registerNewCustomer = async (threadId: string, thread: MessageThread) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/customers/register`, {
        name: newCustomerData.name || thread.customer.name,
        phone: newCustomerData.phone,
        email: newCustomerData.email,
        instagramId: thread.customer.instagramId,
        lineId: thread.customer.lineId,
        notes: newCustomerData.notes
      })
      
      toast.success('新規顧客を登録しました')
      setShowCustomerRegistration(prev => ({ ...prev, [threadId]: false }))
      setNewCustomerData({ name: '', phone: '', email: '', notes: '' })
      
      // 顧客リストを更新
      window.location.reload()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '顧客登録に失敗しました'
      toast.error(errorMessage)
    }
  }

  // Fetch data with filters
  const { data: threadsData } = useQuery({
    queryKey: ['threads', searchQuery, filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.channel !== 'all') params.append('channel', filters.channel);
      if (filters.assignedStaff !== 'all') params.append('assignedStaff', filters.assignedStaff);
      if (filters.unreadOnly) params.append('unreadOnly', 'true');
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      
      return axios.get(`${API_BASE_URL}/messages/threads?${params.toString()}`).then(res => res.data);
    },
    enabled: isAuthenticated
  })
  
  const threads = threadsData

  const { data: customers } = useQuery<{ customers: Customer[] }>({
    queryKey: ['customers'],
    queryFn: () => axios.get(`${API_BASE_URL}/customers`).then(res => res.data),
    enabled: isAuthenticated
  })

  const { data: reservations } = useQuery<{ reservations: Reservation[] }>({
    queryKey: ['reservations'],
    queryFn: () => axios.get(`${API_BASE_URL}/reservations`).then(res => res.data),
    enabled: isAuthenticated
  })

  const { data: segments } = useQuery({
    queryKey: ['analytics', 'segments'],
    queryFn: () => axios.get(`${API_BASE_URL}/analytics/segments`).then(res => res.data),
    enabled: isAuthenticated
  })

  const { data: menus } = useQuery({
    queryKey: ['menus'],
    queryFn: () => axios.get(`${API_BASE_URL}/menus`).then(res => res.data),
    enabled: isAuthenticated
  })

  const { data: autoMessageTemplates } = useQuery({
    queryKey: ['auto-messages', 'templates'],
    queryFn: () => axios.get(`${API_BASE_URL}/auto-messages/templates`).then(res => res.data),
    enabled: isAuthenticated
  })

  // Fetch filter metadata and saved filters
  const { data: filterMetadataData } = useQuery({
    queryKey: ['messages', 'filter-metadata'],
    queryFn: () => axios.get(`${API_BASE_URL}/messages/filter-metadata`).then(res => res.data),
    enabled: isAuthenticated
  })

  const { data: savedFiltersData } = useQuery({
    queryKey: ['messages', 'saved-filters'],
    queryFn: () => axios.get(`${API_BASE_URL}/messages/saved-filters`).then(res => res.data),
    enabled: isAuthenticated
  })

  // Update local state when data is fetched
  useEffect(() => {
    if (filterMetadataData) setFilterMetadata(filterMetadataData)
    if (savedFiltersData) setSavedFilters(savedFiltersData.filters)
  }, [filterMetadataData, savedFiltersData])

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
  const handleLineClick = () => {
    // Try to open LINE app on mobile, fallback to web
    const lineUrl = 'line://'
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

  const MessagesList = () => {
    // 初回読み込み時に顧客識別を実行
    useEffect(() => {
      if (threads?.threads) {
        threads.threads.forEach(thread => {
          if (!customerIdentification[thread.id]) {
            identifyCustomer(thread)
          }
        })
      }
    }, [threads])

    return (
      <div className="space-y-4">
        {/* Header with Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">統合インボックス</h2>
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-danger text-xs">{filterMetadata?.stats.unread || 0} 未読</span>
            <span className="badge badge-primary text-xs">{filterMetadata?.stats.total || 0} 総件数</span>
            <span className="badge badge-success text-xs">{filterMetadata?.stats.todayMessages || 0} 今日</span>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="card mb-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="顧客名、メッセージ内容、担当者で検索..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn btn-secondary btn-sm flex items-center ${showFilters ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  フィルター
                </button>
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary btn-sm"
                >
                  クリア
                </button>
              </div>
            </div>

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, unreadOnly: !prev.unreadOnly }))}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${
                  filters.unreadOnly 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Hash className="w-3 h-3 inline mr-1" />
                未読のみ
              </button>
              {filterMetadata?.statuses.map((status: any) => (
                <button
                  key={status.value}
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    status: prev.status === status.value ? 'all' : status.value 
                  }))}
                  className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    filters.status === status.value
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.label} ({status.count})
                </button>
              ))}
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Channel Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">チャネル</label>
                    <select
                      value={filters.channel}
                      onChange={(e) => setFilters(prev => ({ ...prev, channel: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">すべて</option>
                      {filterMetadata?.channels.map((channel: any) => (
                        <option key={channel.value} value={channel.value}>
                          {channel.label} ({channel.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Staff Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">担当者</label>
                    <select
                      value={filters.assignedStaff}
                      onChange={(e) => setFilters(prev => ({ ...prev, assignedStaff: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">すべて</option>
                      {filterMetadata?.staff.map((staff: any) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Sort Options */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">並び順:</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="updatedAt">更新日時</option>
                      <option value="customerName">顧客名</option>
                      <option value="status">ステータス</option>
                      <option value="unreadCount">未読数</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                    }))}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                  >
                    {filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    {filters.sortOrder === 'asc' ? '昇順' : '降順'}
                  </button>
                </div>

                {/* Saved Filters */}
                {savedFilters.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">保存済みフィルター</label>
                    <div className="flex flex-wrap gap-2">
                      {savedFilters.map((savedFilter) => (
                        <button
                          key={savedFilter.id}
                          onClick={() => applySavedFilter(savedFilter)}
                          className="flex items-center text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1 rounded-md transition-colors"
                        >
                          <Bookmark className="w-3 h-3 mr-1" />
                          {savedFilter.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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
                      
                      {/* Customer Identification Badge */}
                      {customerInfo && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          customerInfo.isExisting 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {customerInfo.isExisting 
                            ? `既存顧客 (ID: ${customerInfo.customer.id})` 
                            : '新規'}
                        </span>
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
                
                {/* Reply Button and Customer Actions */}
                <div className="flex-shrink-0 ml-2 flex items-center space-x-2">
                  {/* Customer Registration Button for New Customers */}
                  {customerInfo && !customerInfo.isExisting && (
                    <button
                      onClick={() => setShowCustomerRegistration(prev => ({ 
                        ...prev, 
                        [thread.id]: !prev[thread.id] 
                      }))}
                      className="btn btn-secondary btn-sm flex items-center text-xs px-2 py-1"
                    >
                      <User className="w-3 h-3 mr-1" />
                      顧客登録
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setReplyingToThread(replyingToThread === thread.id ? null : thread.id)
                      if (replyingToThread !== thread.id) {
                        // AI返信提案を取得
                        getAiReplySuggestions(
                          thread.id, 
                          thread.lastMessage.content,
                          { customerName: thread.customer.name }
                        )
                      }
                    }}
                    className="btn btn-primary btn-sm flex items-center text-xs px-3 py-1.5"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    返信
                  </button>
                </div>
              </div>

              {/* Reply Form */}
              {replyingToThread === thread.id && (
                <div className="border-t pt-3 space-y-3">
                  {/* AI Reply Suggestions */}
                  {loadingSuggestions ? (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>AI返信案を生成中...</span>
                    </div>
                  ) : aiSuggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">🤖 AI返信提案:</p>
                      <div className="grid gap-2">
                        {aiSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            onClick={() => setReplyMessage(suggestion.text)}
                            className="text-left p-2 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-blue-600 font-medium">
                                {suggestion.tone === 'formal' ? '丁寧' : 
                                 suggestion.tone === 'friendly' ? 'フレンドリー' : 'プロフェッショナル'}
                              </span>
                              <span className="text-xs text-gray-500">{suggestion.category}</span>
                            </div>
                            <p className="text-sm text-gray-700">{suggestion.text}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
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
                        setAiSuggestions([])
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}

              {/* Customer Registration Form */}
              {showCustomerRegistration[thread.id] && (
                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-gray-700 mb-3">新規顧客登録</p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">顧客名</label>
                        <input
                          type="text"
                          value={newCustomerData.name}
                          onChange={(e) => setNewCustomerData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder={thread.customer.name}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">電話番号</label>
                        <input
                          type="tel"
                          value={newCustomerData.phone}
                          onChange={(e) => setNewCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="090-1234-5678"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">メールアドレス</label>
                      <input
                        type="email"
                        value={newCustomerData.email}
                        onChange={(e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="example@email.com"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">メモ</label>
                      <textarea
                        value={newCustomerData.notes}
                        onChange={(e) => setNewCustomerData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="特記事項など..."
                        rows={2}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => registerNewCustomer(thread.id, thread)}
                        className="btn btn-primary btn-sm"
                      >
                        顧客登録
                      </button>
                      <button
                        onClick={() => {
                          setShowCustomerRegistration(prev => ({ ...prev, [thread.id]: false }))
                          setNewCustomerData({ name: '', phone: '', email: '', notes: '' })
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  }

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
        /* Time Slot Views (Day, 3-Day, Week) */
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
    
    // 分析用のダミーデータ
    const monthlyRevenue = 1250000 // 今月の売上
    const monthlyGrowth = 12.5 // 前月比成長率
    const activeCustomers = customers?.customers.filter(c => 
      c.lastVisitDate && new Date(c.lastVisitDate) > subMonths(new Date(), 3)
    ).length || 0
    const newCustomersThisMonth = customers?.customers.filter(c =>
      new Date(c.createdAt) > startOfMonth(new Date())
    ).length || 0
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">ダッシュボード</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Activity className="w-4 h-4" />
            <span>リアルタイム更新</span>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue Card */}
          <div className="card hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <p className="text-sm font-medium text-gray-600">今月の売上</p>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ¥{monthlyRevenue.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">
                    +{monthlyGrowth}%
                  </span>
                  <span className="text-xs text-gray-500 ml-1">前月比</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Customers */}
          <div 
            onClick={() => setActiveTab('customers')}
            className="card hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
          >
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">アクティブ顧客</p>
                <p className="text-2xl font-bold text-gray-900">{activeCustomers}</p>
                <p className="text-xs text-gray-500 mt-1">過去3ヶ月以内</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('messages')}
            className="card hover:shadow-lg transition-all duration-200 hover:scale-105 text-left cursor-pointer"
          >
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-blue-500" />
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

  const AnalyticsView = () => (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">分析・レポート</h2>
      
      {/* Customer Segmentation */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">顧客セグメンテーション（RFM分析）</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segments && Object.entries(segments.segments).map(([key, segment]: [string, any]) => (
            <div key={key} className={`p-4 rounded-lg border-2 ${segment.count > 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{segment.name}</h4>
                <span className={`text-lg font-bold ${segment.count > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                  {segment.count}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{segment.description}</p>
              {segment.count > 0 && (
                <p className="text-xs text-gray-500">
                  平均単価: ¥{segment.avgValue.toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">売上トレンド</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">今月の売上</p>
            <p className="text-2xl font-bold text-gray-900">¥1,250,000</p>
            <p className="text-sm text-green-600">+12.5% 前月比</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">先月の売上</p>
            <p className="text-2xl font-bold text-gray-900">¥1,111,000</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">今年累計</p>
            <p className="text-2xl font-bold text-gray-900">¥12,450,000</p>
            <p className="text-sm text-blue-600">+8.3% 前年比</p>
          </div>
        </div>
      </div>

      {/* Popular Services */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">人気メニューランキング</h3>
        <div className="space-y-3">
          {[
            { name: 'カット + カラー', bookings: 45, revenue: 360000 },
            { name: 'カット', bookings: 38, revenue: 171000 },
            { name: 'デジタルパーマ', bookings: 22, revenue: 264000 },
            { name: 'プレミアムトリートメント', bookings: 15, revenue: 75000 }
          ].map((service, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                <div>
                  <p className="font-medium text-gray-900">{service.name}</p>
                  <p className="text-sm text-gray-600">{service.bookings}回予約</p>
                </div>
              </div>
              <p className="font-bold text-gray-900">¥{service.revenue.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const MenusView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">メニュー管理</h2>
        <button className="btn btn-primary text-sm">新規メニュー追加</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menus?.menus.map((menu: any) => (
          <div key={menu.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getMenuIcon(menu.category)}
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {menu.category}
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900">¥{menu.price.toLocaleString()}</span>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">{menu.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{menu.description}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{menu.duration}分</span>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                編集
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* AI Recommendations Section */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">AIメニューレコメンド</h3>
        <p className="text-sm text-gray-600 mb-4">
          顧客の来店履歴と好みを分析して、最適なメニューを提案します
        </p>
        <div className="space-y-3">
          {customers?.customers.slice(0, 2).map((customer) => (
            <div key={customer.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">{customer.name}様</p>
                <button className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  レコメンド表示
                </button>
              </div>
              <p className="text-sm text-gray-600">
                前回から{Math.floor(Math.random() * 60 + 30)}日経過・来店回数{customer.visitCount}回
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="hidden sm:inline font-medium">{currentStaff?.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {currentStaff?.role === 'ADMIN' ? '管理者' : currentStaff?.role === 'MANAGER' ? 'マネージャー' : 'スタッフ'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">ログアウト</span>
              </button>
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
                  setActiveTab('analytics')
                  setIsSidebarOpen(false)
                }}
                className={`sidebar-item w-full ${activeTab === 'analytics' ? 'active' : ''}`}
              >
                <TrendingUp className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">分析・レポート</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('menus')
                  setIsSidebarOpen(false)
                }}
                className={`sidebar-item w-full ${activeTab === 'menus' ? 'active' : ''}`}
              >
                <Scissors className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">メニュー管理</span>
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
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'menus' && <MenusView />}
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
                        <Link className="w-4 h-4 mr-2" />
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
                        <RefreshCw className="w-4 h-4 mr-2" />
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
                
                {/* Auto Message Templates */}
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">自動メッセージ設定</h3>
                  <div className="space-y-4">
                    {autoMessageTemplates?.templates.map((template: any) => (
                      <div key={template.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              template.enabled 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {template.enabled ? '有効' : '無効'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            トリガー: {template.trigger} | チャネル: {template.channel}
                          </p>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded text-xs">
                            {template.content.substring(0, 100)}...
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={template.enabled}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              onChange={() => {
                                toast.success(`${template.name}を${template.enabled ? '無効' : '有効'}にしました`)
                              }}
                            />
                          </label>
                          <button className="btn btn-secondary btn-sm">編集</button>
                        </div>
                      </div>
                    ))}
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