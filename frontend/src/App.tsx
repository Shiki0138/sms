import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import LimitWarning from './components/Common/LimitWarning'
import PlanBadge from './components/Common/PlanBadge'
import PlanLimitNotifications from './components/Common/PlanLimitNotifications'
import { useSubscription } from './contexts/SubscriptionContext'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import UserProfile from './components/Auth/UserProfile'
import CustomerAnalyticsDashboard from './components/Analytics/CustomerAnalyticsDashboard'
import PremiumMarketingDashboard from './components/Analytics/PremiumMarketingDashboard'
import AnalyticsExport from './components/Analytics/AnalyticsExport'
import { getEnvironmentConfig, logEnvironmentInfo } from './utils/environment'
import TestConnection from './components/TestConnection'
import AdvancedHolidaySettings from './components/Settings/AdvancedHolidaySettings'
import ExternalAPISettings from './components/Settings/ExternalAPISettings'
import OpenAISettings from './components/Settings/OpenAISettings'
import NotificationSettings from './components/Settings/NotificationSettings'
import { ReminderSettings } from './components/Settings/ReminderSettings'
import DataBackupSettings from './components/Settings/DataBackupSettings'
import MenuManagement from './components/Settings/MenuManagement'
import UpgradePlan from './components/Settings/UpgradePlan'
// import SimpleSettingsFixed from './components/Settings/SimpleSettingsFixed' // Component not found
// import ErrorBoundary from './components/Common/ErrorBoundary' // Component not found
import SalonCalendar from './components/Calendar/SalonCalendar'
import MonthCalendar from './components/Calendar/MonthCalendar'
import NewReservationModal from './components/Calendar/NewReservationModal'
import CSVImporter from './components/CSVImporter'
import BulkMessageSender from './components/BulkMessageSender'
import ServiceHistoryModal from './components/ServiceHistoryModal'
import FeatureRequestForm from './components/FeatureRequestForm'
import FilteredCustomerView from './components/FilteredCustomerView'
import SettingsPage from './pages/SettingsPage'
// Import icons from lucide-react
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
  UserCheck,
  MapPin,
  Calendar as CalendarIcon,
  FileText,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Palette,
  Star,
  Sparkles,
  Bot,
  Loader2,
  Shield,
  Lightbulb,
  LogOut
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { format, isToday, isTomorrow, getDay, getWeekOfMonth } from 'date-fns'
import { ja } from 'date-fns/locale'
import { 
  dummyCustomers, 
  serviceHistory, 
  pastReservations,
  futureReservations, 
  messageThreads,
  calculateCustomerStats 
} from './data/dummyData'

// ダミーデータをグローバルに登録（分析画面で使用）
if (typeof window !== 'undefined') {
  (window as any).dummyCustomers = dummyCustomers;
  (window as any).serviceHistory = serviceHistory;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4002' : '/api')
const USE_DUMMY_DATA = false // 本番データを使用

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
  customerNumber: string  // 顧客番号
  name: string
  phone?: string
  email?: string
  instagramId?: string
  lineId?: string
  visitCount: number
  lastVisitDate?: string
  createdAt: string
  // ホットペッパービューティー関連データ
  furigana?: string
  birthDate?: string
  gender?: string
  zipCode?: string
  address?: string
  registrationDate?: string
  memberNumber?: string
  couponHistory?: string
  menuHistory?: string
  source?: 'HOTPEPPER' | 'MANUAL' | 'LINE' | 'INSTAGRAM'
  notes?: string
  stylistNotes?: string
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
  stylistNotes?: string
}

function App() {
  // 環境設定の初期化
  const config = getEnvironmentConfig()
  const enableLogin = import.meta.env.VITE_ENABLE_LOGIN === 'true'
  const queryClient = useQueryClient()
  const { user, logout } = useAuth()

  useEffect(() => {
    // 環境情報をログ出力
    logEnvironmentInfo()
    
    // 開発環境での警告表示
    if (config.isDevelopment && config.showProductionWarnings) {
      console.warn('🚧 Development Environment - Some features are restricted')
    }
    
    // Supabase接続情報をログ出力
    console.log('📊 Database Mode:', USE_DUMMY_DATA ? 'DUMMY DATA' : 'REAL DATABASE')
    console.log('🔐 Login Enabled:', enableLogin)
  }, [])

  const [activeTab, setActiveTab] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tab') || 'messages';
  })
  const [activeView, setActiveView] = useState<'main' | 'upgrade'>('main')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [replyingToThread, setReplyingToThread] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [isGeneratingAIReply, setIsGeneratingAIReply] = useState<string | null>(null)
  const [customerNotes, setCustomerNotes] = useState('')
  const [showCustomerMessages, setShowCustomerMessages] = useState(false)
  const [showCustomerReservations, setShowCustomerReservations] = useState(false)
  
  // Filtered customer view states
  const [showFilteredCustomerView, setShowFilteredCustomerView] = useState(false)
  const [filteredCustomerViewType, setFilteredCustomerViewType] = useState<'messages' | 'reservations'>('messages')
  const [filteredCustomerId, setFilteredCustomerId] = useState<string>('')
  const [filteredCustomerName, setFilteredCustomerName] = useState<string>('')
  
  // Feature requests state for admin notifications
  const [featureRequests, setFeatureRequests] = useState<any[]>([])
  const [unreadFeatureRequests, setUnreadFeatureRequests] = useState(0)
  
  // New customer registration modal state
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false)
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    instagramId: '',
    lineId: '',
    notes: ''
  })
  
  // CSV Import modal state
  const [showCSVImporter, setShowCSVImporter] = useState(false)
  
  // Bulk Message Sender state
  const [showBulkMessageSender, setShowBulkMessageSender] = useState(false)
  
  // Service History Modal state
  const [showServiceHistoryModal, setShowServiceHistoryModal] = useState(false)
  const [selectedServiceHistory, setSelectedServiceHistory] = useState<Reservation | null>(null)
  
  // New reservation modal state
  const [showNewReservationModal, setShowNewReservationModal] = useState(false)
  const [selectedReservationDate, setSelectedReservationDate] = useState<Date | undefined>()
  const [selectedReservationTime, setSelectedReservationTime] = useState<string | undefined>()
  
  // Reservations state for live updates
  const [liveReservations, setLiveReservations] = useState<Reservation[]>([])
  
  // Initialize live reservations from dummy data
  useEffect(() => {
    const past = Array.isArray(pastReservations) ? pastReservations : []
    const future = Array.isArray(futureReservations) ? futureReservations : []
    const allReservations = [...past, ...future]
    setLiveReservations(allReservations)
  }, [])
  
  // Settings state
  
  // Business settings state
  const [businessSettings, setBusinessSettings] = useState({
    openHour: 9,
    closeHour: 18,
    timeSlotMinutes: 30,
    closedDays: [1], // Sunday = 0, Monday = 1, etc. (月曜日定休)
    nthWeekdayRules: [{ nth: [2, 4], weekday: 2 }] as Array<{nth: number[], weekday: number}>, // 毎月第2・第4火曜日
    customClosedDates: ['2025-01-01', '2025-12-31'] as string[] // YYYY-MM-DD format
  })
  
  // Calendar view state
  const [calendarView, setCalendarView] = useState<'day' | 'threeDay' | 'week' | 'month'>('week')
  const [calendarDate, setCalendarDate] = useState(new Date())

  // Fetch data
  const { data: threads } = useQuery<{ threads: MessageThread[] }>({
    queryKey: ['threads'],
    queryFn: () => {
      if (USE_DUMMY_DATA) {
        // メッセージスレッドを新しい順にソート
        const sortedThreads = [...messageThreads].sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        return Promise.resolve({ threads: sortedThreads })
      }
      return axios.get(`${API_BASE_URL}/messages/threads`).then(res => res.data)
    },
    initialData: { threads: [] } // 初期値を設定
  })

  const { data: customers } = useQuery<{ customers: Customer[] }>({
    queryKey: ['customers'],
    queryFn: async () => {
      if (USE_DUMMY_DATA) {
        return Promise.resolve({ customers: dummyCustomers })
      }
      // Supabaseから取得
      try {
        const { customersApi } = await import('./lib/supabase-client')
        const data = await customersApi.getAll()
        return { customers: data || [] }
      } catch (error) {
        console.error('顧客データ取得エラー:', error)
        return { customers: [] }
      }
    },
    initialData: { customers: [] } // 初期値を設定
  })

  const { data: reservations } = useQuery<{ reservations: Reservation[] }>({
    queryKey: ['reservations'],
    queryFn: () => {
      if (USE_DUMMY_DATA) {
        // 過去の予約と未来の予約を結合
        return Promise.resolve({ 
          reservations: [...pastReservations, ...futureReservations] 
        })
      }
      return axios.get(`${API_BASE_URL}/reservations`).then(res => res.data)
    },
    initialData: { reservations: [] } // 初期値を設定
  })

  // Staff list (demo data)
  const staffList = [
    { id: 'staff1', name: '田中 美咲' },
    { id: 'staff2', name: '佐藤 麗子' },
    { id: 'staff3', name: '山田 花音' },
    { id: 'staff4', name: '鈴木 あゆみ' }
  ]

  // Calculate unread count with enhanced safety checks
  const unreadCount = threads?.threads && Array.isArray(threads.threads) 
    ? threads.threads.reduce((sum, t) => {
        const count = typeof t?.unreadCount === 'number' ? t.unreadCount : 0
        return sum + count
      }, 0) 
    : 0

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
    const dayOfWeek = getDay(date)
    const dateString = format(date, 'yyyy-MM-dd')
    
    // 毎週の定休日チェック
    if (businessSettings.closedDays.includes(dayOfWeek)) {
      return true
    }
    
    // 毎月第◯◯曜日チェック
    for (const rule of businessSettings.nthWeekdayRules) {
      if (dayOfWeek === rule.weekday) {
        const weekOfMonth = getWeekOfMonth(date, { weekStartsOn: 1 })
        if (rule.nth.includes(weekOfMonth)) {
          return true
        }
      }
    }
    
    // 特定日チェック
    return businessSettings.customClosedDates.includes(dateString)
  }

  // Get holiday type for display
  const getHolidayType = (date: Date) => {
    const dayOfWeek = getDay(date)
    const dateString = format(date, 'yyyy-MM-dd')
    const dayNames = ['日', '月', '火', '水', '木', '金', '土']
    
    // 毎週の定休日チェック
    if (businessSettings.closedDays.includes(dayOfWeek)) {
      return `定休日（${dayNames[dayOfWeek]}曜日）`
    }
    
    // 毎月第◯◯曜日チェック
    for (const rule of businessSettings.nthWeekdayRules) {
      if (dayOfWeek === rule.weekday) {
        const weekOfMonth = getWeekOfMonth(date, { weekStartsOn: 1 })
        if (rule.nth.includes(weekOfMonth)) {
          const nthText = rule.nth.map(n => `第${n}`).join('・')
          return `定休日（${nthText}${dayNames[dayOfWeek]}曜日）`
        }
      }
    }
    
    // 特定日チェック
    if (businessSettings.customClosedDates.includes(dateString)) {
      return '特別休業日'
    }
    
    return null
  }
  
  // Get reservations for a specific date and time slot
  const getReservationsForSlot = (date: Date, timeSlot: string) => {
    const safeReservations = Array.isArray(liveReservations) ? liveReservations : []
    return safeReservations.filter(r => {
      if (!r?.startTime) return false
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
  
  // Handle stylist notes update
  const handleUpdateStylistNotes = (reservationId: string, notes: string) => {
    // In a real app, this would make an API call to update the notes
    console.log('Updating stylist notes for reservation:', reservationId, notes)
    
    // For demo purposes, we'll just update the selected service history
    if (selectedServiceHistory && selectedServiceHistory.id === reservationId) {
      setSelectedServiceHistory({
        ...selectedServiceHistory,
        stylistNotes: notes
      })
    }
    
    // Show success message
    alert('美容師メモが更新されました！')
  }

  // Handle service history click
  const handleServiceHistoryClick = (reservation: Reservation) => {
    setSelectedServiceHistory(reservation)
    setShowServiceHistoryModal(true)
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


  // Handle AI reply generation
  const handleAIReplyClick = async (threadId: string) => {
    setIsGeneratingAIReply(threadId)
    
    try {
      // AI返信生成（デモ用）
      const thread = threads?.threads.find(t => t.id === threadId)
      if (!thread) return
      
      const lastMessage = thread.lastMessage.content
      const customerName = thread.customer.name
      
      // デモ用の返信生成ロジック
      await new Promise(resolve => setTimeout(resolve, 1500)) // 生成中の演出
      
      let generatedReply = ''
      if (lastMessage.includes('予約') || lastMessage.includes('空いて')) {
        generatedReply = `${customerName}様、お問い合わせありがとうございます。ご希望のお日にちをお聞かせください。お客様に最適なお時間をご提案させていただきます。`
      } else if (lastMessage.includes('カット') || lastMessage.includes('カラー')) {
        generatedReply = `${customerName}様、いつもありがとうございます。ご希望のスタイルについて詳しくお聞かせください。`
      } else if (lastMessage.includes('料金') || lastMessage.includes('値段')) {
        generatedReply = `${customerName}様、お問い合わせありがとうございます。当店のメニュー料金についてご案内いたします。詳細はお気軽にお尋ねください。`
      } else {
        generatedReply = `${customerName}様、いつもありがとうございます。お気軽にご相談ください。スタッフ一同、心よりお待ちしております。`
      }
      
      setReplyMessage(generatedReply)
    } catch (error) {
      console.error('AI reply generation error:', error)
      alert('AI返信の生成に失敗しました')
    } finally {
      setIsGeneratingAIReply(null)
    }
  }

  // Handle new reservation creation
  const handleNewReservation = () => {
    setSelectedReservationDate(undefined)
    setSelectedReservationTime(undefined)
    setShowNewReservationModal(true)
  }

  const handleTimeSlotClick = (date: Date, hour: number, minute: number) => {
    setSelectedReservationDate(date)
    setSelectedReservationTime(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
    setShowNewReservationModal(true)
  }

  const handleSaveReservation = (newReservation: any) => {
    // デモ用：実際の実装では、サーバーに保存する
    console.log('新規予約作成:', newReservation)
    alert('予約が正常に作成されました！')
    
    // 予約データを更新（デモ用）
    // 実際の実装では、React Queryのinvalidateを使用
  }

  // Handle customer notes update
  const handleUpdateCustomerNotes = () => {
    if (!selectedCustomer) return
    
    // デモ用：実際の実装では、サーバーに保存する
    console.log('カルテ更新:', { customerId: selectedCustomer.id, notes: customerNotes })
    alert(`${selectedCustomer.name}様のカルテを更新しました！`)
    
    // 実際の実装では、React Queryのinvalidateを使用してデータを更新
  }

  // Handle showing customer messages
  const handleShowCustomerMessages = () => {
    if (!selectedCustomer) return
    
    // モーダルを閉じて、フィルタービューに切り替え
    setShowCustomerModal(false)
    setFilteredCustomerId(selectedCustomer.id)
    setFilteredCustomerName(selectedCustomer.name)
    setFilteredCustomerViewType('messages')
    setShowFilteredCustomerView(true)
    setSelectedCustomer(null)
  }

  // Handle showing customer reservations
  const handleShowCustomerReservations = () => {
    if (!selectedCustomer) return
    
    // モーダルを閉じて、フィルタービューに切り替え
    setShowCustomerModal(false)
    setFilteredCustomerId(selectedCustomer.id)
    setFilteredCustomerName(selectedCustomer.name)
    setFilteredCustomerViewType('reservations')
    setShowFilteredCustomerView(true)
    setSelectedCustomer(null)
  }

  // Handle going back from filtered customer view
  const handleBackFromFilteredView = () => {
    setShowFilteredCustomerView(false)
    setFilteredCustomerId('')
    setFilteredCustomerName('')
    setActiveTab('customers')
  }

  // Handle new feature request submission
  const handleNewFeatureRequest = (request: any) => {
    setFeatureRequests(prev => [request, ...prev])
    setUnreadFeatureRequests(prev => prev + 1)
  }

  // Handle new customer registration
  const handleNewCustomerRegistration = () => {
    setShowNewCustomerModal(true)
  }

  // Handle save new customer
  const handleSaveNewCustomer = async () => {
    if (!newCustomerData.name.trim()) {
      alert('顧客名を入力してください')
      return
    }

    try {
      // 顧客番号を生成
      const nextCustomerNumber = `C${String((customers?.customers?.length || 0) + 1).padStart(3, '0')}`
      
      // デモ用：ローカルストレージに保存（実際の実装ではSupabaseを使用）
      const newCustomer = {
        id: crypto.randomUUID(),
        customerNumber: nextCustomerNumber,
        name: newCustomerData.name,
        nameKana: '', // 必要に応じて追加
        phone: newCustomerData.phone || '',
        email: newCustomerData.email || '',
        instagramId: newCustomerData.instagramId || '',
        lineId: newCustomerData.lineId || '',
        notes: newCustomerData.notes || '',
        gender: '未設定',
        visitCount: 0,
        createdAt: new Date().toISOString(),
        lastVisitDate: null,
        source: 'MANUAL' as const
      }
      
      // ローカルストレージに保存（デモ用）
      const existingCustomers = JSON.parse(localStorage.getItem('demoCustomers') || '[]')
      existingCustomers.push(newCustomer)
      localStorage.setItem('demoCustomers', JSON.stringify(existingCustomers))
      
      // React Queryのデータを更新
      if (queryClient) {
        await queryClient.invalidateQueries({ queryKey: ['customers'] })
      }
      
      alert(`${newCustomerData.name}様（${nextCustomerNumber}）を新規登録しました！`)
      
      // フォームをリセット
      setNewCustomerData({
        name: '',
        phone: '',
        email: '',
        instagramId: '',
        lineId: '',
        notes: ''
      })
      setShowNewCustomerModal(false)
      
    } catch (error: any) {
      console.error('顧客登録エラー:', error)
      
      // より詳細なエラーメッセージを表示
      let errorMessage = '顧客登録に失敗しました。'
      
      if (error?.response?.status === 403) {
        errorMessage = '顧客数の上限に達しています。プランのアップグレードが必要です。'
      } else if (error?.response?.status === 409) {
        errorMessage = 'この顧客情報は既に登録されています。'
      } else if (error?.response?.status === 401) {
        errorMessage = '認証エラーです。ページを再読み込みしてください。'
      } else if (error?.response?.status === 500) {
        errorMessage = 'サーバーエラーが発生しました。時間をおいて再度お試しください。'
      } else if (error?.message) {
        errorMessage = `エラー: ${error.message}`
      } else {
        errorMessage = '不明なエラーが発生しました。ブラウザのコンソールを確認してください。'
      }
      
      alert(errorMessage)
    }
  }

  // Handle cancel new customer registration
  const handleCancelNewCustomer = () => {
    setNewCustomerData({
      name: '',
      phone: '',
      email: '',
      instagramId: '',
      lineId: '',
      notes: ''
    })
    setShowNewCustomerModal(false)
  }

  // Handle CSV import
  const handleCSVImport = (importedCustomers: any[] = []) => {
    console.log('CSV Import:', importedCustomers)
    
    // デモ用：実際の実装では、サーバーに送信して一括登録
    const safeImportedCustomers = Array.isArray(importedCustomers) ? importedCustomers : []
    const successCount = safeImportedCustomers.length
    const hotpepperCount = safeImportedCustomers.filter(c => c?.source === 'HOTPEPPER').length
    const manualCount = safeImportedCustomers.filter(c => c?.source === 'MANUAL').length
    
    alert(`${successCount}件の顧客データをインポートしました！\n\n内訳:\n・ホットペッパービューティー: ${hotpepperCount}件\n・手動追加: ${manualCount}件`)
    
    setShowCSVImporter(false)
    
    // 実際の実装では、React Queryのinvalidateを使用してデータを更新
  }

  // Handle new reservation save
  const handleSaveNewReservation = (reservationData: any) => {
    // 重複チェック
    const isDuplicate = (Array.isArray(liveReservations) ? liveReservations : []).some(existing => 
      existing.startTime === reservationData.startTime &&
      existing.customerName === reservationData.customerName &&
      existing.menuContent === reservationData.menuContent
    )
    
    if (isDuplicate) {
      alert('同じ予約が既に存在します。')
      return
    }
    
    // 新しい予約オブジェクトを作成
    const newReservation: Reservation = {
      id: reservationData.id || `res_${Date.now()}`,
      startTime: reservationData.startTime,
      endTime: reservationData.endTime,
      menuContent: reservationData.menuContent,
      customerName: reservationData.customerName,
      customer: reservationData.customer,
      staff: reservationData.staff,
      source: reservationData.source as any,
      status: reservationData.status as any,
      notes: reservationData.notes,
      price: reservationData.price,
      stylistNotes: ''
    }
    
    // ライブ予約データに追加
    setLiveReservations(prev => [...prev, newReservation])
    
    // モーダルを閉じる
    setShowNewReservationModal(false)
    setSelectedReservationDate(undefined)
    setSelectedReservationTime(undefined)
    
    alert(`${reservationData.customerName}様の予約を登録しました！\n日時: ${format(new Date(newReservation.startTime), 'M月d日 HH:mm', { locale: ja })}\nメニュー: ${reservationData.menuContent}`)
  }

  // Handle bulk message send
  const handleBulkMessageSend = (selectedCustomers: any[], message: string, channels: string[]) => {
    console.log('Bulk Message Send:', {
      recipients: selectedCustomers.length,
      message,
      channels: Array.isArray(channels) ? channels.reduce((acc: any, channel: string) => {
        acc[channel] = (acc[channel] || 0) + 1
        return acc
      }, {}) : {}
    })
    
    // デモ用：実際の実装では、各チャンネルのAPIに送信
    const channelCounts = Array.isArray(channels) ? channels.reduce((acc: any, channel: string) => {
      acc[channel] = (acc[channel] || 0) + 1
      return acc
    }, {}) : {}
    
    let resultMessage = `${selectedCustomers.length}名にメッセージを送信しました！\n\n送信内訳:\n`
    if (channelCounts && channelCounts['LINE']) resultMessage += `・LINE: ${channelCounts['LINE']}名\n`
    if (channelCounts && channelCounts['Instagram']) resultMessage += `・Instagram: ${channelCounts['Instagram']}名\n`
    if (channelCounts && channelCounts['Email']) resultMessage += `・Email: ${channelCounts['Email']}名\n`
    
    // 実際の実装では、LINEメッセージAPI、Instagram Graph API、SMTPなどを使用
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
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">メッセージ管理</h2>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {(threads?.threads && Array.isArray(threads.threads) ? threads.threads.filter(t => t?.status === 'OPEN') : []).length} 未対応
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {(threads?.threads && Array.isArray(threads.threads) ? threads.threads.filter(t => t?.status === 'IN_PROGRESS') : []).length} 対応中
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {(threads?.threads && Array.isArray(threads.threads) ? threads.threads.filter(t => t?.status === 'CLOSED') : []).length} 完了
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {(threads?.threads && Array.isArray(threads.threads) ? threads.threads : []).map((thread) => (
          <div key={thread.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-4 space-y-3">
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
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {thread.unreadCount}
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
                      {thread.assignedStaff && thread.customer.id && (
                        <div className="flex items-center">
                          <UserCheck className="w-3 h-3 mr-1" />
                          <span className="text-xs">担当: {thread.assignedStaff.name}</span>
                        </div>
                      )}
                      {!thread.customer.id && (
                        <div className="flex items-center text-yellow-600">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          <span className="text-xs">新規問い合わせ</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Reply Button */}
                <div className="flex-shrink-0 ml-2">
                  <button
                    onClick={() => setReplyingToThread(replyingToThread === thread.id ? null : thread.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <Send className="w-4 h-4 mr-1 inline" />
                    返信
                  </button>
                </div>
              </div>

              {/* Reply Form */}
              {replyingToThread === thread.id && (
                <div className="border-t pt-3">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="メッセージを入力..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={3}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendReply(thread.id)
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAIReplyClick(thread.id)}
                        disabled={isGeneratingAIReply === thread.id}
                        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-md transition-colors flex-shrink-0 flex items-center space-x-1 text-sm"
                        title="AI返信生成"
                      >
                        {isGeneratingAIReply === thread.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>生成中...</span>
                          </>
                        ) : (
                          <>
                            <Bot className="w-4 h-4" />
                            <span>AI返信</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Enter で送信、Shift+Enter で改行</span>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setReplyingToThread(null)
                            setReplyMessage('')
                          }}
                          className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={() => handleSendReply(thread.id)}
                          disabled={!replyMessage.trim()}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1 rounded-md text-sm font-medium transition-colors"
                        >
                          送信
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Templates */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">よく使うテンプレート:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'いつもありがとうございます',
                        'お疲れ様でした',
                        'ご来店ありがとうございました',
                        'お気軽にご連絡ください'
                      ].map((template, idx) => (
                        <button
                          key={idx}
                          onClick={() => setReplyMessage(template)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {(!threads?.threads || threads.threads.length === 0) && (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              メッセージがありません
            </h3>
            <p className="text-gray-500">
              新しいメッセージが届くとここに表示されます
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const CustomersList = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">顧客管理</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setShowCSVImporter(true)}
            className="btn btn-secondary text-sm flex items-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            CSVインポート
          </button>
          <button 
            onClick={handleNewCustomerRegistration}
            className="btn btn-primary text-sm"
          >
            新規顧客登録
          </button>
        </div>
      </div>
      
      {/* 検索バー */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="顧客名、顧客番号、電話番号で検索..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="btn btn-secondary text-sm">
            <Users className="w-4 h-4 mr-1" />
            検索
          </button>
        </div>
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
                      // Load existing customer notes (demo implementation)
                      setCustomerNotes(`${customer.name}様の過去のカルテ情報がここに表示されます。\n\n例：\n- アレルギー: なし\n- 好みのスタイル: ショートカット\n- 注意事項: カラー剤に敏感`)
                    }}
                    className="text-lg font-medium text-gray-900 mb-2 break-words hover:text-blue-600 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">{customer.customerNumber}</span>
                      <span>{customer.name}</span>
                    </div>
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
                {/* Data Source Badge */}
                {customer.source === 'HOTPEPPER' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                    <FileText className="w-3 h-3 mr-1" />
                    ホットペッパー
                  </span>
                )}
                {customer.source === 'MANUAL' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                    <Users className="w-3 h-3 mr-1" />
                    手動登録
                  </span>
                )}
                
                {/* SNS Links */}
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

                {/* Member Number for Hotpepper customers */}
                {customer.memberNumber && (
                  <span className="text-xs text-gray-500 font-mono">
                    会員: {customer.memberNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const ReservationsList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              予約管理
            </h2>
            <p className="text-gray-600">
              予約の確認と管理を行います
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="font-medium">今日: {(reservations?.reservations && Array.isArray(reservations.reservations) ? reservations.reservations.filter(r => r?.startTime && isToday(new Date(r.startTime))) : []).length}件</span>
          </div>
          <div className="flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="font-medium">確定済み</span>
          </div>
          <div className="flex items-center bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg border border-yellow-200">
            <Clock className="w-4 h-4 mr-2" />
            <span className="font-medium">仮予約</span>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-gray-900">カレンダー表示</h3>
            
            {/* View Selector */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { value: 'day', label: '日' }, 
                { value: 'threeDay', label: '3日' }, 
                { value: 'week', label: '週' }, 
                { value: 'month', label: '月' }
              ].map((view) => (
                <button
                  key={view.value}
                  onClick={() => setCalendarView(view.value as any)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    calendarView === view.value
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleNewReservation}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Calendar className="w-4 h-4 mr-2" />
              新規予約
            </button>
            <button 
              onClick={() => {
                setLiveReservations([...pastReservations, ...futureReservations])
                alert('予約データをリセットしました')
              }}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              リセット
            </button>
          </div>
        </div>
        
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const newDate = new Date(calendarDate)
                if (calendarView === 'day') newDate.setDate(newDate.getDate() - 1)
                else if (calendarView === 'threeDay') newDate.setDate(newDate.getDate() - 3)
                else if (calendarView === 'week') newDate.setDate(newDate.getDate() - 7)
                else newDate.setMonth(newDate.getMonth() - 1)
                setCalendarDate(newDate)
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="text-center">
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
            </div>
            
            <button
              onClick={() => {
                const newDate = new Date(calendarDate)
                if (calendarView === 'day') newDate.setDate(newDate.getDate() + 1)
                else if (calendarView === 'threeDay') newDate.setDate(newDate.getDate() + 3)
                else if (calendarView === 'week') newDate.setDate(newDate.getDate() + 7)
                else newDate.setMonth(newDate.getMonth() + 1)
                setCalendarDate(newDate)
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <button
            onClick={() => setCalendarDate(new Date())}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            今日
          </button>
        </div>
      </div>
      
      {/* Calendar Display */}
      {calendarView === 'month' ? (
        <MonthCalendar
          currentDate={calendarDate}
          onDateChange={setCalendarDate}
          reservations={liveReservations}
          isHoliday={isClosedDay}
          getHolidayType={getHolidayType}
          onDayClick={(date) => {
            setCalendarDate(date)
            setCalendarView('day')
          }}
        />
      ) : (
        <SalonCalendar
          reservations={liveReservations}
          view={calendarView}
          currentDate={calendarDate}
          onDateChange={setCalendarDate}
          onReservationClick={handleServiceHistoryClick}
          onTimeSlotClick={handleTimeSlotClick}
          businessHours={businessSettings}
          isHoliday={isClosedDay}
          getHolidayType={getHolidayType}
        />
      )}
    </div>
  )

  const Dashboard = () => {
    const totalThreads = threads?.threads?.length || 0
    const safeReservations = Array.isArray(liveReservations) ? liveReservations : []
    const todayReservations = safeReservations.filter(r => 
      r?.startTime && isToday(new Date(r.startTime))
    ).length || 0
    
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">ダッシュボード</h2>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => setActiveTab('messages')}
            className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left cursor-pointer"
          >
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総メッセージ数</p>
                <p className="text-2xl font-bold text-gray-900">{totalThreads}</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('messages')}
            className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left cursor-pointer"
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
            className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left cursor-pointer"
          >
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">今日の予約</p>
                <p className="text-2xl font-bold text-gray-900">{todayReservations}</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('customers')}
            className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left cursor-pointer"
          >
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総顧客数</p>
                <p className="text-2xl font-bold text-gray-900">{customers?.customers.length || 0}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
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
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
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
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
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
              {(Array.isArray(liveReservations) ? liveReservations : [])
                .filter(r => r?.startTime && isToday(new Date(r.startTime)))
                .slice(0, 3)
                .map((reservation) => (
                <button
                  key={reservation.id}
                  onClick={() => setActiveTab('reservations')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
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
              {(Array.isArray(liveReservations) ? liveReservations : []).filter(r => r?.startTime && isToday(new Date(r.startTime))).length === 0 && (
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
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                  <Scissors className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                    SMS
                  </h1>
                  <p className="text-xs text-gray-600 hidden sm:block">Salon Management System</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* プランバッジ */}
              <PlanBadge 
                variant="compact" 
                onUpgradeClick={() => setActiveView('upgrade')}
              />
              
              {unreadCount > 0 && (
                <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm border border-red-200">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">{unreadCount}件の未読</span>
                </div>
              )}
              <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="hidden sm:inline font-medium">オンライン</span>
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
            style={{ touchAction: 'none' }}
          />
        )}

        {/* Sidebar */}
        <nav className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:h-screen md:sticky md:top-16
          overflow-y-auto
        `}>
          <div className="p-4 md:p-6 pt-20 md:pt-6 h-full overflow-y-auto">
            <div className="space-y-2">
              <button
                onClick={() => {
                  setActiveTab('dashboard')
                  setIsSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">ダッシュボード</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('messages')
                  setIsSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'messages' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <MessageSquare className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">メッセージ</span>
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => {
                  setShowBulkMessageSender(true)
                  setIsSidebarOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-50 ml-6"
              >
                <Send className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-sm">メッセージ一斉送信</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('reservations')
                  setIsSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'reservations' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">予約管理</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('customers')
                  setIsSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'customers' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">顧客管理</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('analytics')
                  setIsSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'analytics' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">分析</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('premium-marketing')
                  setIsSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'premium-marketing' 
                    ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Star className="w-5 h-5 flex-shrink-0 text-yellow-500" />
                <span className="font-medium">経営戦略 (Premium)</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('feature-request')
                  setIsSidebarOpen(false)
                  setUnreadFeatureRequests(0) // Clear notification count when visiting page
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'feature-request' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Lightbulb className="w-5 h-5 flex-shrink-0 text-yellow-500" />
                <span className="font-medium">機能改善要望</span>
                {unreadFeatureRequests > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadFeatureRequests}
                  </span>
                )}
              </button>
              
              {/* アップグレードボタン */}
              <button
                onClick={() => {
                  setActiveView('upgrade')
                  setIsSidebarOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
              >
                <Sparkles className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">プランアップグレード</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('settings')
                  setIsSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'settings' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">設定</span>
              </button>
            </div>
            
            {/* ログアウトセクション */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="px-4 py-2 text-sm text-gray-600">
                ログイン中: {user?.profile?.name || user?.email || 'ゲスト'}
              </div>
              <button
                onClick={() => {
                  logout()
                  setActiveTab('dashboard')
                  setIsSidebarOpen(false)
                  window.location.href = '/login'
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">ログアウト</span>
              </button>
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-600 font-medium">
                  本日の予約数<br />
                  {reservations?.reservations.filter(r => isToday(new Date(r.startTime))).length || 0}件
                </p>
              </div>
            </div>
            
            {/* ユーザープロファイル */}
            {enableLogin && (
              <div className="mt-6">
                {/* <UserProfile /> ログイン無効時は非表示 */}
              </div>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-full">
          <div className="max-w-7xl mx-auto">
            {/* アップグレード画面 */}
            {activeView === 'upgrade' && (
              <div>
                <div className="mb-4">
                  <button
                    onClick={() => setActiveView('main')}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>戻る</span>
                  </button>
                </div>
                <UpgradePlan />
              </div>
            )}
            
            {activeView === 'main' && showFilteredCustomerView && (
              <FilteredCustomerView
                viewType={filteredCustomerViewType}
                customerId={filteredCustomerId}
                customerName={filteredCustomerName}
                allMessages={messageThreads || []}
                allReservations={[...(pastReservations || []), ...(futureReservations || []), ...(liveReservations || [])]}
                onBack={handleBackFromFilteredView}
              />
            )}
            {activeView === 'main' && !showFilteredCustomerView && activeTab === 'dashboard' && <Dashboard />}
            {activeView === 'main' && !showFilteredCustomerView && activeTab === 'messages' && <MessagesList />}
            {activeView === 'main' && !showFilteredCustomerView && activeTab === 'customers' && <CustomersList />}
            {activeView === 'main' && !showFilteredCustomerView && activeTab === 'reservations' && <ReservationsList />}
            {activeView === 'main' && !showFilteredCustomerView && activeTab === 'analytics' && <CustomerAnalyticsDashboard />}
            {activeView === 'main' && !showFilteredCustomerView && activeTab === 'premium-marketing' && <PremiumMarketingDashboard />}
            {activeView === 'main' && !showFilteredCustomerView && activeTab === 'feature-request' && <FeatureRequestForm onNewRequest={handleNewFeatureRequest} />}
            {activeView === 'main' && !showFilteredCustomerView && activeTab === 'settings' && (
              <SettingsPage />
            )}
          </div>
        </main>
      </div>

      {/* Customer Detail Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <User className="w-6 h-6 mr-2" />
                  顧客カルテ - {selectedCustomer.customerNumber} {selectedCustomer.name}
                </h2>
                <button
                  onClick={() => {
                    setShowCustomerModal(false)
                    setSelectedCustomer(null)
                    setCustomerNotes('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Customer Information */}
              <div className="space-y-6">
                {/* Data Source Indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {selectedCustomer.source === 'HOTPEPPER' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <FileText className="w-3 h-3 mr-1" />
                        ホットペッパービューティー
                      </span>
                    )}
                    {selectedCustomer.source === 'MANUAL' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Users className="w-3 h-3 mr-1" />
                        手動登録
                      </span>
                    )}
                    {selectedCustomer.source === 'LINE' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        LINE
                      </span>
                    )}
                    {selectedCustomer.source === 'INSTAGRAM' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                        <Instagram className="w-3 h-3 mr-1" />
                        Instagram
                      </span>
                    )}
                  </div>
                  {selectedCustomer.memberNumber && (
                    <span className="text-sm text-gray-600">
                      会員番号: <span className="font-mono font-medium">{selectedCustomer.memberNumber}</span>
                    </span>
                  )}
                </div>

                {/* Customer Details Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">項目</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">詳細</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">顧客番号</td>
                        <td className="px-4 py-3 text-sm text-blue-600 font-mono font-medium">{selectedCustomer.customerNumber}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">氏名</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{selectedCustomer.name}</td>
                      </tr>
                      {selectedCustomer.furigana && (
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">フリガナ</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{selectedCustomer.furigana}</td>
                        </tr>
                      )}
                      {selectedCustomer.phone && (
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">電話番号</td>
                          <td className="px-4 py-3 text-sm">
                            <a href={`tel:${selectedCustomer.phone}`} className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                              {selectedCustomer.phone}
                              <Phone className="w-3 h-3 ml-1" />
                            </a>
                          </td>
                        </tr>
                      )}
                      {selectedCustomer.email && (
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">メールアドレス</td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleEmailClick(selectedCustomer.email!)}
                              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                            >
                              {selectedCustomer.email}
                              <Mail className="w-3 h-3 ml-1" />
                            </button>
                          </td>
                        </tr>
                      )}
                      {selectedCustomer.birthDate && (
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">生年月日</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {format(new Date(selectedCustomer.birthDate), 'yyyy年M月d日', { locale: ja })}
                            <span className="text-gray-500 ml-2">
                              ({Math.floor((new Date().getTime() - new Date(selectedCustomer.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365))}歳)
                            </span>
                          </td>
                        </tr>
                      )}
                      {selectedCustomer.gender && (
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">性別</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{selectedCustomer.gender}</td>
                        </tr>
                      )}
                      {(selectedCustomer.zipCode || selectedCustomer.address) && (
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">住所</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {selectedCustomer.zipCode && (
                              <div className="text-gray-600 text-xs">〒{selectedCustomer.zipCode}</div>
                            )}
                            {selectedCustomer.address}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">来店回数</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="text-2xl font-bold text-blue-600">{selectedCustomer.visitCount}</span>
                          <span className="text-gray-600 ml-1">回</span>
                        </td>
                      </tr>
                      {selectedCustomer.lastVisitDate && (
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">最終来店日</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="text-gray-900 font-medium">
                              {format(new Date(selectedCustomer.lastVisitDate), 'yyyy年M月d日', { locale: ja })}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {Math.floor((new Date().getTime() - new Date(selectedCustomer.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24))}日前
                            </div>
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">登録日</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {format(new Date(selectedCustomer.createdAt), 'yyyy年M月d日', { locale: ja })}
                        </td>
                      </tr>
                      {selectedCustomer.registrationDate && selectedCustomer.registrationDate !== selectedCustomer.createdAt && (
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">ホットペッパー登録日</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {format(new Date(selectedCustomer.registrationDate), 'yyyy年M月d日', { locale: ja })}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ホットペッパー専用情報 */}
                {selectedCustomer.source === 'HOTPEPPER' && (selectedCustomer.couponHistory || selectedCustomer.menuHistory) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">ホットペッパービューティー利用履歴</h3>
                    
                    {selectedCustomer.couponHistory && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h4 className="font-medium text-orange-900 mb-2 flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          クーポン利用履歴
                        </h4>
                        <p className="text-sm text-orange-800 whitespace-pre-line">{selectedCustomer.couponHistory}</p>
                      </div>
                    )}
                    
                    {selectedCustomer.menuHistory && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                          <Scissors className="w-4 h-4 mr-2" />
                          メニュー利用履歴
                        </h4>
                        <p className="text-sm text-blue-800 whitespace-pre-line">{selectedCustomer.menuHistory}</p>
                      </div>
                    )}
                  </div>
                )}
                
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
                
                {/* Service History */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">施術履歴</h3>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {(Array.isArray(liveReservations) ? liveReservations : [])
                      .filter(reservation => 
                        reservation.customer?.id === selectedCustomer.id && 
                        reservation.status === 'COMPLETED'
                      )
                      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                      .map((reservation, index) => (
                      <button
                        key={index} 
                        onClick={() => handleServiceHistoryClick(reservation)}
                        className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors text-left cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{reservation.menuContent}</span>
                            <span className="text-xs text-gray-500">担当: {reservation.staff?.name}</span>
                          </div>
                          <div className="text-right">
                            {reservation.price && (
                              <div className="text-sm font-medium text-gray-900">¥{reservation.price.toLocaleString()}</div>
                            )}
                            <div className="text-xs text-gray-500">{format(new Date(reservation.startTime), 'M月d日', { locale: ja })}</div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">{reservation.notes}</p>
                        {reservation.stylistNotes && (
                          <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            💡 美容師メモあり
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          クリックして詳細を表示
                        </div>
                      </button>
                    ))}
                    {(Array.isArray(liveReservations) ? liveReservations : []).filter(r => r?.customer?.id === selectedCustomer.id && r?.status === 'COMPLETED').length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        施術履歴がありません
                      </div>
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
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <button 
                    onClick={handleUpdateCustomerNotes}
                    className="btn btn-primary flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    カルテを更新
                  </button>
                  
                  <button
                    onClick={handleShowCustomerMessages}
                    className="btn btn-secondary flex items-center"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    メッセージ履歴
                  </button>
                  
                  <button
                    onClick={handleShowCustomerReservations}
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
        </div>
      )}

      {/* New Customer Registration Modal */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Users className="w-6 h-6 mr-2" />
                    新規顧客登録
                  </h2>
                  <button
                    onClick={handleCancelNewCustomer}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Registration Form */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 基本情報 */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">基本情報</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          氏名 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newCustomerData.name}
                          onChange={(e) => setNewCustomerData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="例: 山田 花子"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                        <input
                          type="tel"
                          value={newCustomerData.phone}
                          onChange={(e) => setNewCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="例: 090-1234-5678"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
                        <input
                          type="email"
                          value={newCustomerData.email}
                          onChange={(e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="例: hanako@email.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    {/* SNS情報 */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">SNS情報</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Instagram className="w-4 h-4 mr-1 text-pink-500" />
                          Instagram ID
                        </label>
                        <input
                          type="text"
                          value={newCustomerData.instagramId}
                          onChange={(e) => setNewCustomerData(prev => ({ ...prev, instagramId: e.target.value }))}
                          placeholder="例: hanako_beauty"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1 text-green-500" />
                          LINE ID
                        </label>
                        <input
                          type="text"
                          value={newCustomerData.lineId}
                          onChange={(e) => setNewCustomerData(prev => ({ ...prev, lineId: e.target.value }))}
                          placeholder="例: hanako123"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-700">
                          <span className="font-medium">💡 SNS連携のメリット</span><br />
                          Instagram・LINEのIDを登録することで、統合メッセージ管理で一元的にやり取りできます。
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* メモ・備考 */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">初回カルテメモ</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <textarea
                        rows={4}
                        value={newCustomerData.notes}
                        onChange={(e) => setNewCustomerData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="顧客の特記事項、希望、アレルギー情報などを記録..."
                        className="w-full border-0 bg-transparent resize-none focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <button 
                      onClick={handleSaveNewCustomer}
                      className="btn btn-primary flex items-center justify-center"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      顧客を登録
                    </button>
                    
                    <button
                      onClick={handleCancelNewCustomer}
                      className="btn btn-secondary flex items-center justify-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      キャンセル
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Importer Modal */}
      <CSVImporter
        isOpen={showCSVImporter}
        onImport={handleCSVImport}
        onClose={() => setShowCSVImporter(false)}
        existingCustomers={customers?.customers || []}
      />

      {/* Bulk Message Sender Modal */}
      <BulkMessageSender
        isOpen={showBulkMessageSender}
        customers={customers?.customers || []}
        onSend={handleBulkMessageSend}
        onClose={() => setShowBulkMessageSender(false)}
      />

      {/* New Reservation Modal */}
      <NewReservationModal
        isOpen={showNewReservationModal}
        onClose={() => {
          setShowNewReservationModal(false)
          setSelectedReservationDate(undefined)
          setSelectedReservationTime(undefined)
        }}
        selectedDate={selectedReservationDate}
        selectedTime={selectedReservationTime}
        customers={customers?.customers || []}
        onSave={handleSaveNewReservation}
      />

      {/* Service History Modal */}
      <ServiceHistoryModal
        reservation={selectedServiceHistory}
        onClose={() => {
          setShowServiceHistoryModal(false)
          setSelectedServiceHistory(null)
        }}
        onUpdateStylistNotes={handleUpdateStylistNotes}
      />

    </div>
  )
}

// 認証で保護されたメインアプリケーション
const AuthenticatedApp = () => {
  const enableLogin = import.meta.env.VITE_ENABLE_LOGIN === 'true'
  
  // ログイン機能が無効な場合でも本番では認証を要求
  if (!enableLogin && import.meta.env.DEV) {
    console.warn('⚠️ 開発モード：認証をバイパスしています')
    return <App />
  }
  
  // ログイン機能が有効な場合は認証でラップ
  return (
    <ProtectedRoute requireAuth={true}>
      <App />
    </ProtectedRoute>
  )
}

// 認証プロバイダーでラップされたルートコンポーネント
const RootApp = () => {
  const enableLogin = import.meta.env.VITE_ENABLE_LOGIN === 'true'
  
  // 本番環境では常に認証を要求
  if (!enableLogin && import.meta.env.DEV) {
    console.warn('⚠️ 開発モード：認証をバイパスしています')
    return (
      <>
        <SubscriptionProvider>
          <App />
        </SubscriptionProvider>
      </>
    )
  }
  
  // ログイン機能が有効な場合は認証プロバイダーでラップ
  return (
    <>
      <AuthProvider>
        <SubscriptionProvider>
          <AuthenticatedApp />
        </SubscriptionProvider>
      </AuthProvider>
    </>
  )
}

export default RootApp