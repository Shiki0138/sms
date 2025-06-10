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
  Phone,
  Mail,
  Send,
  Menu,
  X,
  User,
  Bell,
  Edit,
  Save,
  Toggle,
  Plus,
  Search,
  Filter,
  MapPin,
  AlertCircle,
  CalendarDays,
  RefreshCw,
  Trash2,
  MoreHorizontal,
  Eye,
  UserPlus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('messages')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [autoMessageSettings, setAutoMessageSettings] = useState({
    autoReminderEnabled: false,
    autoFollowUpEnabled: false
  })
  
  // 営業設定
  const [businessSettings, setBusinessSettings] = useState({
    businessHours: {
      start: '09:00',
      end: '19:00'
    },
    closedDays: [0], // 0 = 日曜日, 1 = 月曜日... 6 = 土曜日
    specialHolidays: [
      '2025-06-15', // 例：臨時休業日
      '2025-12-31',
      '2025-01-01'
    ]
  })
  const [messageTemplates, setMessageTemplates] = useState({
    REMINDER_1_WEEK: {
      title: '1週間前リマインダー',
      content: '{customerName}様\n\nいつもありがとうございます。\n{reservationDate} {reservationTime}からのご予約のリマインダーです。\n\nメニュー: {menuContent}\n\nご不明な点がございましたら、お気軽にお問い合わせください。\n\nお待ちしております。'
    },
    REMINDER_3_DAYS: {
      title: '3日前リマインダー',
      content: '{customerName}様\n\nご予約まであと3日となりました。\n{reservationDate} {reservationTime}からお待ちしております。\n\nメニュー: {menuContent}\n\n当日は少し早めにお越しいただけますと幸いです。\n\nお会いできることを楽しみにしております。'
    },
    FOLLOWUP_VISIT: {
      title: '来店促進メッセージ',
      content: '{customerName}様\n\nいつもご利用いただきありがとうございます。\n\n前回のご来店から時間が経ちましたが、お元気でお過ごしでしょうか？\n\n髪の調子はいかがですか？そろそろお手入れの時期かもしれませんね。\n\nご都合の良い時にぜひお越しください。お待ちしております。'
    }
  })

  // メニュー管理
  const [serviceMenus, setServiceMenus] = useState([
    {
      id: '1',
      name: 'カット',
      price: 4000,
      duration: 60,
      description: 'お客様のご希望に合わせたカット',
      category: 'カット',
      isActive: true
    },
    {
      id: '2', 
      name: 'カラー',
      price: 6000,
      duration: 90,
      description: 'トレンドカラーからナチュラルカラーまで',
      category: 'カラー',
      isActive: true
    },
    {
      id: '3',
      name: 'パーマ',
      price: 8000,
      duration: 120,
      description: 'デジタルパーマ・エアウェーブ対応',
      category: 'パーマ',
      isActive: true
    },
    {
      id: '4',
      name: 'カット+カラー',
      price: 9000,
      duration: 150,
      description: 'カットとカラーのセットメニュー',
      category: 'セットメニュー',
      isActive: true
    },
    {
      id: '5',
      name: 'トリートメント',
      price: 3000,
      duration: 45,
      description: '髪質改善トリートメント',
      category: 'ケア',
      isActive: true
    },
    {
      id: '6',
      name: 'ヘッドスパ',
      price: 3500,
      duration: 30,
      description: 'リラクゼーション効果のあるヘッドスパ',
      category: 'ケア',
      isActive: false
    }
  ])
  
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [editingMenu, setEditingMenu] = useState(null)

  // Mock data for demonstration
  const mockThreads = [
    {
      id: '1',
      customer: { id: '1', name: '田中花子', instagramId: 'hanako_beauty' },
      channel: 'INSTAGRAM',
      status: 'OPEN',
      lastMessage: {
        content: '明日のカラーの件なんですが、やっぱりもう少し明るめにしたくて...😅 変更可能でしょうか？',
        createdAt: '2024-12-09T20:30:00.000Z',
        senderType: 'CUSTOMER'
      },
      unreadCount: 1
    },
    {
      id: '2', 
      customer: { id: '2', name: '山田太郎', lineId: 'taro_yamada' },
      channel: 'LINE',
      status: 'IN_PROGRESS',
      lastMessage: {
        content: '金曜日18:30からでしたら空きがございます。いかがでしょうか？',
        createdAt: '2024-12-08T15:15:00.000Z',
        senderType: 'STAFF'
      },
      unreadCount: 0
    },
    {
      id: '3',
      customer: { id: null, name: '新規ユーザー', instagramId: 'new_user_123' },
      channel: 'INSTAGRAM',
      status: 'OPEN',
      lastMessage: {
        content: 'はじめまして！インスタグラムを拝見してお問い合わせしました。カットの予約をお願いできますでしょうか？',
        createdAt: '2025-06-11T14:30:00.000Z',
        senderType: 'CUSTOMER'
      },
      unreadCount: 1
    }
  ]

  // 顧客番号生成システム
  const generateCustomerNumber = () => {
    const currentYear = new Date().getFullYear()
    const existingNumbers = mockCustomers
      .map(customer => customer.customerNumber)
      .filter(num => num && num.startsWith(currentYear.toString()))
      .map(num => parseInt(num.slice(-3))) // 末尾3桁を取得
      .sort((a, b) => b - a) // 降順ソート
    
    const nextSequence = existingNumbers.length > 0 ? existingNumbers[0] + 1 : 1
    const paddedSequence = nextSequence.toString().padStart(3, '0')
    
    return `${currentYear}${paddedSequence}`
  }

  const mockCustomers = [
    {
      id: '1',
      customerNumber: '2025001',
      name: '田中花子',
      phone: '090-1234-5678',
      email: 'hanako.tanaka@gmail.com',
      visitCount: 12,
      lastVisitDate: '2025-06-10T14:00:00.000Z',
      registrationDate: '2025-01-15T10:00:00.000Z'
    },
    {
      id: '2',
      customerNumber: '2025002',
      name: '山田太郎', 
      phone: '090-9876-5432',
      email: 'taro.yamada@outlook.com',
      visitCount: 6,
      lastVisitDate: '2025-06-10T16:30:00.000Z',
      registrationDate: '2025-02-20T14:30:00.000Z'
    },
    {
      id: '3',
      customerNumber: '2025003',
      name: '佐藤美咲',
      phone: '080-1111-2222',
      email: 'misaki.sato@gmail.com',
      visitCount: 8,
      lastVisitDate: '2025-06-09T13:00:00.000Z',
      registrationDate: '2025-03-10T11:15:00.000Z'
    },
    {
      id: '4',
      customerNumber: '2025004',
      name: '鈴木一郎',
      phone: '070-3333-4444',
      email: 'ichiro.suzuki@yahoo.co.jp',
      visitCount: 15,
      lastVisitDate: '2025-06-08T11:00:00.000Z',
      registrationDate: '2024-08-22T16:45:00.000Z'
    },
    {
      id: '5',
      customerNumber: '2025005',
      name: '高橋美穂',
      phone: '090-5555-6666',
      email: 'miho.takahashi@hotmail.com',
      visitCount: 3,
      lastVisitDate: '2025-06-07T15:30:00.000Z',
      registrationDate: '2025-04-18T13:20:00.000Z'
    },
    {
      id: '6',
      customerNumber: '2025006',
      name: '佐々木誠',
      phone: '080-7777-8888',
      email: 'makoto.sasaki@gmail.com',
      visitCount: 4,
      lastVisitDate: '2025-06-06T14:00:00.000Z',
      registrationDate: '2025-05-05T12:00:00.000Z'
    }
  ]

  // Mock reservations data
  const mockReservations = [
    // 今日の予約
    {
      id: '1',
      startTime: '2025-06-11T10:00:00.000Z',
      endTime: '2025-06-11T12:00:00.000Z',
      menuContent: 'イルミナカラー＋トリートメント',
      customerName: '田中花子',
      customerId: '1',
      staffName: '中村雪乃',
      staffId: 'staff-2',
      source: 'MANUAL',
      status: 'CONFIRMED',
      notes: '明るめのアッシュベージュ希望、ブリーチ追加の可能性あり',
      price: 15000,
      nextVisitDate: '2025-07-11'
    },
    {
      id: '2',
      startTime: '2025-06-11T14:30:00.000Z',
      endTime: '2025-06-11T15:30:00.000Z',
      menuContent: 'メンズカット',
      customerName: '山田太郎',
      customerId: '2',
      staffName: '高橋武志',
      staffId: 'staff-1',
      source: 'LINE',
      status: 'CONFIRMED',
      notes: 'いつものビジネススタイル',
      price: 5000,
      nextVisitDate: '2025-07-11'
    },
    // 昨日の予約（完了）
    {
      id: '3',
      startTime: '2025-06-10T14:00:00.000Z',
      endTime: '2025-06-10T16:30:00.000Z',
      menuContent: '髪質改善トリートメント＋カット',
      customerName: '佐藤美咲',
      customerId: '3',
      staffName: '中村雪乃',
      staffId: 'staff-2',
      source: 'INSTAGRAM',
      status: 'COMPLETED',
      notes: 'VIP顧客、個室希望',
      price: 18000,
      nextVisitDate: '2025-08-10'
    },
    // 明日の予約
    {
      id: '4',
      startTime: '2025-06-12T11:00:00.000Z',
      endTime: '2025-06-12T12:00:00.000Z',
      menuContent: '白髪染め',
      customerName: '鈴木一郎',
      customerId: '4',
      staffName: '小林健二',
      staffId: 'staff-4',
      source: 'PHONE',
      status: 'CONFIRMED',
      notes: '月次定期、ナチュラルブラウン',
      price: 7000,
      nextVisitDate: '2025-07-12'
    },
    {
      id: '5',
      startTime: '2025-06-12T16:30:00.000Z',
      endTime: '2025-06-12T17:30:00.000Z',
      menuContent: 'ヘアセット',
      customerName: '石井美和',
      customerPhone: '080-7777-8888',
      staffName: '鈴木麻耶',
      staffId: 'staff-5',
      source: 'HOTPEPPER',
      status: 'CONFIRMED',
      notes: '結婚式用セット',
      price: 8000,
      nextVisitDate: '2025-08-12'
    },
    // 明後日の予約
    {
      id: '6',
      startTime: '2025-06-13T09:30:00.000Z',
      endTime: '2025-06-13T11:00:00.000Z',
      menuContent: 'カット＋パーマ',
      customerName: '田中花子',
      customerId: '1',
      staffName: '中村雪乃',
      staffId: 'staff-2',
      source: 'MANUAL',
      status: 'CONFIRMED',
      notes: 'ゆるふわパーマ希望',
      price: 12000,
      nextVisitDate: '2025-08-13'
    },
    // 今週後半の予約
    {
      id: '7',
      startTime: '2025-06-14T13:00:00.000Z',
      endTime: '2025-06-14T14:30:00.000Z',
      menuContent: 'カット＋カラー',
      customerName: '高橋美穂',
      customerId: '5',
      staffName: '高橋武志',
      staffId: 'staff-1',
      source: 'INSTAGRAM',
      status: 'CONFIRMED',
      notes: 'インナーカラー希望',
      price: 10000,
      nextVisitDate: '2025-08-14'
    },
    {
      id: '8',
      startTime: '2025-06-15T15:00:00.000Z',
      endTime: '2025-06-15T16:30:00.000Z',
      menuContent: 'ストレートパーマ',
      customerName: '山田太郎',
      customerId: '2',
      staffName: '小林健二',
      staffId: 'staff-4',
      source: 'LINE',
      status: 'TENTATIVE',
      notes: '部分ストレート、要相談',
      price: 15000,
      nextVisitDate: '2025-09-15'
    },
    // 来週の予約
    {
      id: '9',
      startTime: '2025-06-16T10:30:00.000Z',
      endTime: '2025-06-16T12:00:00.000Z',
      menuContent: 'トリートメント＋ヘッドスパ',
      customerName: '佐藤美咲',
      customerId: '3',
      staffName: '副店長 伊藤花音',
      staffId: 'staff-3',
      source: 'MANUAL',
      status: 'CONFIRMED',
      notes: 'リラクゼーションコース',
      price: 14000,
      nextVisitDate: '2025-08-16'
    },
    {
      id: '10',
      startTime: '2025-06-17T14:00:00.000Z',
      endTime: '2025-06-17T15:00:00.000Z',
      menuContent: 'メンズカット＋眉カット',
      customerName: '佐々木誠',
      customerId: '6',
      staffName: '高橋武志',
      staffId: 'staff-1',
      source: 'PHONE',
      status: 'CONFIRMED',
      notes: 'ビジネス仕様、きっちりめ',
      price: 6000,
      nextVisitDate: '2025-07-17'
    },
    // 月末の予約
    {
      id: '11',
      startTime: '2025-06-30T11:00:00.000Z',
      endTime: '2025-06-30T13:00:00.000Z',
      menuContent: '夏限定カラー＋カット',
      customerName: '田中花子',
      customerId: '1',
      staffName: '中村雪乃',
      staffId: 'staff-2',
      source: 'INSTAGRAM',
      status: 'CONFIRMED',
      notes: '夏らしい明るめカラー',
      price: 16000,
      nextVisitDate: '2025-08-30'
    }
  ]

  const mockStaff = [
    { id: 'staff-1', name: '高橋武志', role: 'スタイリスト' },
    { id: 'staff-2', name: '中村雪乃', role: 'スタイリスト' },
    { id: 'staff-3', name: '副店長 伊藤花音', role: 'マネージャー' },
    { id: 'staff-4', name: '小林健二', role: 'スタイリスト' },
    { id: 'staff-5', name: '鈴木麻耶', role: 'スタイリスト' }
  ]

  // 顧客別予約履歴ダミーデータ
  // カレンダービュー用のヘルパー関数
  const getDateRange = (date, mode) => {
    const start = new Date(date)
    let end = new Date(date)
    
    switch (mode) {
      case 'day':
        // 1日表示
        break
      case '3days':
        end.setDate(start.getDate() + 2)
        break
      case 'week':
        start.setDate(start.getDate() - start.getDay()) // 週の始まり（日曜日）
        end.setDate(start.getDate() + 6)
        break
      case 'month':
        start.setDate(1) // 月の最初
        end = new Date(start.getFullYear(), start.getMonth() + 1, 0) // 月の最後
        break
    }
    
    return { start, end }
  }

  // 営業時間チェック関数
  const isBusinessDay = (date) => {
    const dayOfWeek = date.getDay()
    const dateString = date.toISOString().split('T')[0]
    
    // 定休日チェック
    if (businessSettings.closedDays.includes(dayOfWeek)) {
      return false
    }
    
    // 特別休業日チェック
    if (businessSettings.specialHolidays.includes(dateString)) {
      return false
    }
    
    return true
  }

  const isBusinessHour = (timeString) => {
    const time = timeString.replace(':', '')
    const startTime = businessSettings.businessHours.start.replace(':', '')
    const endTime = businessSettings.businessHours.end.replace(':', '')
    
    return time >= startTime && time <= endTime
  }

  const generateTimeSlots = () => {
    const slots = []
    const startHour = parseInt(businessSettings.businessHours.start.split(':')[0])
    const endHour = parseInt(businessSettings.businessHours.end.split(':')[0])
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        // 営業時間終了チェック
        if (hour === endHour && minute > 0) break
        
        slots.push(timeString)
      }
    }
    return slots
  }

  const getReservationForTimeSlot = (date, timeSlot) => {
    const slotDate = new Date(date)
    const [hour, minute] = timeSlot.split(':')
    slotDate.setHours(parseInt(hour), parseInt(minute), 0, 0)
    
    return mockReservations.find(reservation => {
      const reservationDate = new Date(reservation.startTime)
      return reservationDate.getTime() === slotDate.getTime()
    })
  }

  const handleTimeSlotClick = (date, timeSlot) => {
    // 営業日・営業時間チェック
    if (!isBusinessDay(date) || !isBusinessHour(timeSlot)) {
      return
    }
    
    const slotDateTime = new Date(date)
    const [hour, minute] = timeSlot.split(':')
    slotDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0)
    
    setSelectedTimeSlot({ date: slotDateTime, timeSlot })
    setShowReservationForm(true)
  }

  const getCustomerReservationHistory = (customerId) => {
    const historyData = {
      '1': [ // 田中花子の履歴
        {
          id: 'hist-1',
          date: '2024-11-28T14:00:00.000Z',
          endTime: '2024-11-28T16:00:00.000Z',
          menu: 'カット+イルミナカラー',
          staff: '中村雪乃',
          price: 12500,
          status: 'COMPLETED',
          notes: 'ブリーチ1回、ミルクティーベージュ'
        },
        {
          id: 'hist-2',
          date: '2024-09-15T13:30:00.000Z',
          endTime: '2024-09-15T15:30:00.000Z',
          menu: 'カット+カラー+トリートメント',
          staff: '高橋武志',
          price: 15000,
          status: 'COMPLETED',
          notes: 'ダメージケア重点、暗めアッシュ'
        },
        {
          id: 'hist-3',
          date: '2024-07-20T10:00:00.000Z',
          endTime: '2024-07-20T12:00:00.000Z',
          menu: 'カット+パーマ',
          staff: '中村雪乃',
          price: 13800,
          status: 'COMPLETED',
          notes: '緩めのウェーブパーマ'
        },
        {
          id: 'hist-4',
          date: '2024-05-10T15:00:00.000Z',
          endTime: '2024-05-10T16:30:00.000Z',
          menu: 'カット+白髪染め',
          staff: '高橋武志',
          price: 9500,
          status: 'COMPLETED',
          notes: '根元中心、ナチュラルブラウン'
        }
      ],
      '2': [ // 山田太郎の履歴
        {
          id: 'hist-5',
          date: '2024-11-16T11:00:00.000Z',
          endTime: '2024-11-16T11:45:00.000Z',
          menu: 'ビジネスカット',
          staff: '高橋武志',
          price: 4500,
          status: 'COMPLETED',
          notes: 'サイド短め、トップ少し残し'
        },
        {
          id: 'hist-6',
          date: '2024-10-05T14:30:00.000Z',
          endTime: '2024-10-05T15:15:00.000Z',
          menu: 'カット+眉カット',
          staff: '小林健二',
          price: 5000,
          status: 'COMPLETED',
          notes: '清潔感重視'
        },
        {
          id: 'hist-7',
          date: '2024-08-22T16:00:00.000Z',
          endTime: '2024-08-22T16:45:00.000Z',
          menu: 'カット',
          staff: '高橋武志',
          price: 4500,
          status: 'COMPLETED',
          notes: '夏仕様、短めスタイル'
        }
      ],
      '3': [ // 佐藤美咲の履歴
        {
          id: 'hist-8',
          date: '2024-10-20T13:00:00.000Z',
          endTime: '2024-10-20T15:30:00.000Z',
          menu: 'カット+ハイライト+トリートメント',
          staff: '中村雪乃',
          price: 18000,
          status: 'COMPLETED',
          notes: '立体感のあるハイライト'
        },
        {
          id: 'hist-9',
          date: '2024-08-15T10:30:00.000Z',
          endTime: '2024-08-15T12:30:00.000Z',
          menu: 'カット+縮毛矯正',
          staff: '副店長 伊藤花音',
          price: 22000,
          status: 'COMPLETED',
          notes: '部分縮毛矯正、毛先はそのまま'
        }
      ]
    }
    return historyData[customerId] || []
  }

  // State for reservation management
  const [reservationsFilter, setReservationsFilter] = useState('all')
  const [reservationsSearch, setReservationsSearch] = useState('')
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [showReservationForm, setShowReservationForm] = useState(false)
  const [reservationViewMode, setReservationViewMode] = useState('day') // 'day', '3days', 'week', 'month'
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  
  // State for customer management
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  
  // State for staff management
  const [showStaffForm, setShowStaffForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  
  // State for message sending
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageCustomer, setMessageCustomer] = useState(null)
  const [messageContent, setMessageContent] = useState('')
  
  // State for message management
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [selectedThread, setSelectedThread] = useState(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [showCustomerDetail, setShowCustomerDetail] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  
  // State for mass message feature
  const [showMassMessageModal, setShowMassMessageModal] = useState(false)
  const [massMessageContent, setMassMessageContent] = useState('')
  const [massMessageFilters, setMassMessageFilters] = useState({
    excludeRecentVisits: false,
    excludeRecentVisitDays: 7,
    excludeLongAbsent: false,
    excludeLongAbsentDays: 180,
    includeOnlyActive: true,
    channels: ['LINE', 'INSTAGRAM', 'EMAIL']
  })
  
  // Mock thread status state
  const [threadStatuses, setThreadStatuses] = useState({
    '1': 'OPEN',
    '2': 'IN_PROGRESS'
  })

  // Helper functions
  const detectReservationIntent = (content: string) => {
    const reservationKeywords = [
      '予約', '空いて', '可能', 'カット', 'カラー', 'パーマ', 'トリートメント',
      '明日', '今週', '来週', '時間', '何時'
    ]
    return reservationKeywords.some(keyword => content.toLowerCase().includes(keyword))
  }

  const getMessageStatus = (thread: any) => {
    if (thread.lastMessage.senderType === 'STAFF') {
      return { text: '返信済', color: 'text-green-600 bg-green-100' }
    }
    if (thread.status === 'CLOSED') {
      return { text: '完了', color: 'text-gray-600 bg-gray-100' }
    }
    return { text: '未対応', color: 'text-red-600 bg-red-100' }
  }

  const getChannelIcon = (channel: string) => {
    return channel === 'INSTAGRAM' ? (
      <Instagram className="w-4 h-4 text-pink-500" />
    ) : (
      <MessageCircle className="w-4 h-4 text-green-500" />
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return `${Math.floor(diffInHours * 60)}分前`
    if (diffInHours < 24) return `${Math.floor(diffInHours)}時間前`
    return date.toLocaleDateString('ja-JP')
  }

  const MessagesList = () => {
    // AI返信生成機能
    const generateAIReply = async (customerMessage, customerName) => {
      setIsGeneratingAI(true)
      try {
        // 実際のAPI呼び出しの代わりにモック応答
        await new Promise(resolve => setTimeout(resolve, 2000))
        const responses = [
          `${customerName}様、お問い合わせありがとうございます。確認いたしますので少々お待ちください。`,
          `${customerName}様、ご連絡いただきありがとうございます。詳細をお聞かせください。`,
          `${customerName}様、承知いたしました。対応させていただきます。`,
          `${customerName}様、ありがとうございます。お時間をいただけますでしょうか。`
        ]
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        setReplyMessage(randomResponse)
      } finally {
        setIsGeneratingAI(false)
      }
    }

    // ステータス変更
    const toggleThreadStatus = (threadId) => {
      setThreadStatuses(prev => {
        const currentStatus = prev[threadId] || 'OPEN'
        let newStatus
        if (currentStatus === 'OPEN') newStatus = 'COMPLETED'
        else if (currentStatus === 'COMPLETED') newStatus = 'OPEN'
        else newStatus = 'COMPLETED'
        
        return { ...prev, [threadId]: newStatus }
      })
    }

    // 返信送信
    const sendReply = () => {
      if (!replyMessage.trim()) return
      alert(`メッセージを送信しました: "${replyMessage}"`)
      setShowReplyModal(false)
      setReplyMessage('')
      setSelectedThread(null)
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">メッセージ</h2>
          <div className="flex items-center space-x-2">
            <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
              未読 {mockThreads.reduce((sum, t) => sum + t.unreadCount, 0)}
            </div>
          </div>
        </div>
      
        <div className="space-y-3">
          {mockThreads.map((thread) => {
            const currentStatus = threadStatuses[thread.id] || thread.status
            const hasReservationIntent = detectReservationIntent(thread.lastMessage.content)
            const isUnhandled = currentStatus === 'OPEN'
            
            return (
              <div key={thread.id} className="card hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 mt-1">
                        {getChannelIcon(thread.channel)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {(thread.customer.id !== null && thread.customer.id !== undefined) ? (
                            <button
                              className={`hover:text-blue-600 transition-colors text-left ${
                                isUnhandled ? 'font-bold text-gray-900' : 'font-medium text-gray-700'
                              }`}
                              onClick={() => {
                                // mockCustomersから該当顧客の詳細データを取得
                                const customerDetail = mockCustomers.find(c => c.id === thread.customer.id)
                                if (customerDetail) {
                                  setSelectedCustomer(customerDetail)
                                  setShowCustomerDetail(true)
                                }
                              }}
                            >
                              {thread.customer.name}
                            </button>
                          ) : (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ${
                              isUnhandled ? 'font-bold' : 'font-medium'
                            }`}>
                              🆕 新規お問合せ
                            </span>
                          )}
                          <div className="flex items-center space-x-1">
                            {hasReservationIntent && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                📅 予約申込
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              currentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              currentStatus === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {currentStatus === 'COMPLETED' ? '完了' :
                               currentStatus === 'IN_PROGRESS' ? '対応中' : '未対応'}
                            </span>
                          </div>
                        </div>
                        <p className={`text-sm line-clamp-2 break-words ${
                          isUnhandled ? 'text-gray-800 font-medium' : 'text-gray-600'
                        }`}>
                          {thread.lastMessage.content}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{formatDate(thread.lastMessage.createdAt)}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            thread.channel === 'INSTAGRAM' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800' :
                            thread.channel === 'LINE' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {thread.channel === 'INSTAGRAM' ? '📷 Instagram DM' :
                             thread.channel === 'LINE' ? '💬 LINE' :
                             thread.channel}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                      <button
                        className="btn btn-primary btn-sm flex items-center text-xs px-3 py-1.5"
                        onClick={() => {
                          setSelectedThread(thread)
                          setShowReplyModal(true)
                        }}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        返信
                      </button>
                      <button
                        className={`btn btn-sm flex items-center text-xs px-3 py-1.5 ${
                          currentStatus === 'COMPLETED' 
                            ? 'btn-secondary bg-gray-100 text-gray-600' 
                            : 'btn-success'
                        }`}
                        onClick={() => toggleThreadStatus(thread.id)}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {currentStatus === 'COMPLETED' ? '未完了' : '完了'}
                      </button>
                      {!thread.customer.id && (
                        <button
                          className="btn btn-success btn-sm flex items-center text-xs px-3 py-1.5"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            console.log('顧客登録ボタンがクリックされました', thread.customer)
                            // Pre-populate form with available information from the thread
                            const newCustomerData = {
                              name: thread.customer.name === '新規ユーザー' ? '' : thread.customer.name,
                              nameKana: '',
                              phone: '',
                              email: '',
                              lineId: thread.customer.lineId || '',
                              instagramId: thread.customer.instagramId || '',
                              assignedStaff: '',
                              notes: `${thread.channel}から問い合わせ: ${thread.lastMessage.content}`
                            }
                            console.log('新規顧客データ:', newCustomerData)
                            setEditingCustomer(newCustomerData)
                            setShowCustomerForm(true)
                          }}
                        >
                          <User className="w-3 h-3 mr-1" />
                          顧客登録
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 返信モーダル */}
        {showReplyModal && selectedThread && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedThread.customer.name}様への返信
                  </h3>
                  <button
                    onClick={() => {
                      setShowReplyModal(false)
                      setReplyMessage('')
                      setSelectedThread(null)
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* 元メッセージ表示 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">元メッセージ:</p>
                    <p className="text-sm text-gray-800">{selectedThread.lastMessage.content}</p>
                  </div>

                  {/* 返信入力 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      返信メッセージ
                    </label>
                    <textarea
                      rows={4}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="返信メッセージを入力してください..."
                    />
                  </div>

                  {/* AI生成ボタン */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => generateAIReply(selectedThread.lastMessage.content, selectedThread.customer.name)}
                      disabled={isGeneratingAI}
                      className="btn btn-secondary flex items-center"
                    >
                      {isGeneratingAI ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <BarChart3 className="w-4 h-4 mr-2" />
                      )}
                      {isGeneratingAI ? 'AI生成中...' : 'AI返信生成'}
                    </button>
                    <span className="text-xs text-gray-500">
                      ※ AI が適切な返信文を生成します
                    </span>
                  </div>

                  {/* 送信ボタン */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setShowReplyModal(false)
                        setReplyMessage('')
                        setSelectedThread(null)
                      }}
                      className="btn btn-secondary"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={sendReply}
                      disabled={!replyMessage.trim()}
                      className="btn btn-primary disabled:opacity-50"
                    >
                      送信
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 顧客登録フォームモーダル（メッセージ用） */}
        {showCustomerForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    新規顧客登録
                  </h3>
                  <button
                    onClick={() => {
                      setShowCustomerForm(false)
                      setEditingCustomer(null)
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        氏名 *
                      </label>
                      <input
                        type="text"
                        defaultValue={editingCustomer?.name || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="田中花子"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        氏名（カナ）
                      </label>
                      <input
                        type="text"
                        defaultValue={editingCustomer?.nameKana || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="タナカ ハナコ"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        電話番号
                      </label>
                      <input
                        type="tel"
                        defaultValue={editingCustomer?.phone || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="090-1234-5678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        メールアドレス
                      </label>
                      <input
                        type="email"
                        defaultValue={editingCustomer?.email || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="example@gmail.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LINE ID
                      </label>
                      <input
                        type="text"
                        defaultValue={editingCustomer?.lineId || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="line_user_123"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram ID
                      </label>
                      <input
                        type="text"
                        defaultValue={editingCustomer?.instagramId || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="@instagram_user"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      担当スタッフ
                    </label>
                    <select 
                      defaultValue={editingCustomer?.assignedStaff || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">担当スタッフを選択</option>
                      {mockStaff.map(staff => (
                        <option key={staff.id} value={staff.name}>{staff.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      備考・メモ
                    </label>
                    <textarea
                      rows={3}
                      defaultValue={editingCustomer?.notes || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="お客様の情報やメモを入力"
                    />
                  </div>

                  <div className="flex space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomerForm(false)
                        setEditingCustomer(null)
                      }}
                      className="btn btn-secondary flex-1"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary flex-1"
                      onClick={(e) => {
                        e.preventDefault()
                        
                        // フォームデータの取得
                        const form = e.target.form
                        const customerName = form.elements[0].value || 'お客様'
                        
                        console.log('顧客登録完了:', {
                          name: form.elements[0].value,
                          nameKana: form.elements[1].value,
                          phone: form.elements[2].value,
                          email: form.elements[3].value,
                          lineId: form.elements[4].value,
                          instagramId: form.elements[5].value,
                          assignedStaff: form.elements[6].value,
                          notes: form.elements[7].value
                        })
                        
                        // 成功メッセージ
                        alert(`${customerName}様を新規顧客として登録しました`)
                        
                        // フォームを閉じる
                        setShowCustomerForm(false)
                        setEditingCustomer(null)
                      }}
                    >
                      登録
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 一斉送信設定モーダル */}
        {showMassMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    一斉送信設定
                  </h3>
                  <button
                    onClick={() => {
                      setShowMassMessageModal(false)
                      setMassMessageContent('')
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* メッセージ内容 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      送信メッセージ
                    </label>
                    <textarea
                      rows={6}
                      value={massMessageContent}
                      onChange={(e) => setMassMessageContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="キャンペーン情報や定休日のお知らせなど、送信したいメッセージを入力してください..."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {massMessageContent.length}/500文字
                    </p>
                  </div>

                  {/* 送信条件設定 */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">送信条件設定</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 直近来店者の除外 */}
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="excludeRecentVisits"
                            checked={massMessageFilters.excludeRecentVisits}
                            onChange={(e) => setMassMessageFilters(prev => ({
                              ...prev,
                              excludeRecentVisits: e.target.checked
                            }))}
                            className="mr-2"
                          />
                          <label htmlFor="excludeRecentVisits" className="text-sm font-medium text-gray-700">
                            直近来店者を除外
                          </label>
                        </div>
                        {massMessageFilters.excludeRecentVisits && (
                          <div className="ml-6">
                            <label className="block text-sm text-gray-600 mb-1">除外期間</label>
                            <select
                              value={massMessageFilters.excludeRecentVisitDays}
                              onChange={(e) => setMassMessageFilters(prev => ({
                                ...prev,
                                excludeRecentVisitDays: parseInt(e.target.value)
                              }))}
                              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                            >
                              <option value={3}>3日以内</option>
                              <option value={7}>1週間以内</option>
                              <option value={14}>2週間以内</option>
                              <option value={30}>1ヶ月以内</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* 長期未来店者の除外 */}
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="excludeLongAbsent"
                            checked={massMessageFilters.excludeLongAbsent}
                            onChange={(e) => setMassMessageFilters(prev => ({
                              ...prev,
                              excludeLongAbsent: e.target.checked
                            }))}
                            className="mr-2"
                          />
                          <label htmlFor="excludeLongAbsent" className="text-sm font-medium text-gray-700">
                            長期未来店者を除外
                          </label>
                        </div>
                        {massMessageFilters.excludeLongAbsent && (
                          <div className="ml-6">
                            <label className="block text-sm text-gray-600 mb-1">除外期間</label>
                            <select
                              value={massMessageFilters.excludeLongAbsentDays}
                              onChange={(e) => setMassMessageFilters(prev => ({
                                ...prev,
                                excludeLongAbsentDays: parseInt(e.target.value)
                              }))}
                              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                            >
                              <option value={90}>3ヶ月以上</option>
                              <option value={180}>6ヶ月以上</option>
                              <option value={365}>1年以上</option>
                              <option value={730}>2年以上</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* その他の条件 */}
                    <div className="mt-6">
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          id="includeOnlyActive"
                          checked={massMessageFilters.includeOnlyActive}
                          onChange={(e) => setMassMessageFilters(prev => ({
                            ...prev,
                            includeOnlyActive: e.target.checked
                          }))}
                          className="mr-2"
                        />
                        <label htmlFor="includeOnlyActive" className="text-sm font-medium text-gray-700">
                          アクティブな顧客のみ
                        </label>
                        <span className="text-xs text-gray-500 ml-2">
                          （最近メッセージのやり取りがある顧客）
                        </span>
                      </div>

                      {/* 送信チャンネル選択 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">送信チャンネル</label>
                        <div className="flex flex-wrap gap-3">
                          {[
                            { id: 'LINE', label: 'LINE', icon: MessageCircle },
                            { id: 'INSTAGRAM', label: 'Instagram', icon: Instagram },
                            { id: 'EMAIL', label: 'Email', icon: Mail }
                          ].map(({ id, label, icon: Icon }) => (
                            <label key={id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={massMessageFilters.channels.includes(id)}
                                onChange={(e) => {
                                  const channels = e.target.checked
                                    ? [...massMessageFilters.channels, id]
                                    : massMessageFilters.channels.filter(ch => ch !== id)
                                  setMassMessageFilters(prev => ({ ...prev, channels }))
                                }}
                                className="mr-2"
                              />
                              <Icon className="w-4 h-4 mr-1" />
                              <span className="text-sm text-gray-700">{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 対象顧客プレビュー */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">送信対象プレビュー</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">対象顧客数</span>
                        <span className="font-medium text-gray-900">
                          {(() => {
                            let count = mockCustomers.length
                            if (massMessageFilters.excludeRecentVisits) count -= 1
                            if (massMessageFilters.excludeLongAbsent) count -= 1
                            if (!massMessageFilters.includeOnlyActive) count += 2
                            return Math.max(0, count)
                          })()}人
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        設定条件に基づく概算値です。実際の送信時に最終確認されます。
                      </div>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowMassMessageModal(false)
                        setMassMessageContent('')
                      }}
                      className="btn btn-secondary"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={() => {
                        if (!massMessageContent.trim()) {
                          alert('送信メッセージを入力してください。')
                          return
                        }
                        if (massMessageFilters.channels.length === 0) {
                          alert('送信チャンネルを選択してください。')
                          return
                        }
                        
                        const targetCount = Math.max(0, (() => {
                          let count = mockCustomers.length
                          if (massMessageFilters.excludeRecentVisits) count -= 1
                          if (massMessageFilters.excludeLongAbsent) count -= 1
                          if (!massMessageFilters.includeOnlyActive) count += 2
                          return count
                        })())
                        
                        if (confirm(`${targetCount}人の顧客に一斉送信しますか？\n\n送信後は取り消しできません。`)) {
                          alert(`${targetCount}人への一斉送信を開始しました。\n\n送信状況は「メッセージ」タブで確認できます。`)
                          setShowMassMessageModal(false)
                          setMassMessageContent('')
                        }
                      }}
                      disabled={!massMessageContent.trim() || massMessageFilters.channels.length === 0}
                      className="btn btn-primary disabled:opacity-50"
                    >
                      一斉送信開始
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

  const CustomersList = () => {
    // 拡張された顧客データ
    const extendedCustomers = mockCustomers.map((customer, index) => ({
      ...customer,
      instagramId: index === 0 ? 'hanako_beauty_lover' : index === 1 ? 'taro_style' : null,
      lineId: index === 0 ? 'line_hanako_123' : index === 1 ? 'line_taro_456' : null,
      status: index === 0 ? 'IN_PROGRESS' : 'WAITING_REPLY',
      assignedStaff: index === 0 ? '中村雪乃' : '高橋武志',
      lastMessageTime: index === 0 ? '2024-12-09T20:30:00.000Z' : '2024-12-08T15:00:00.000Z',
      notes: index === 0 ? 'イルミナカラー希望、ブリーチ履歴あり' : 'ビジネスカット、短時間希望'
    }))

    // 顧客編集フォーム
    const CustomerForm = () => {
      const [formData, setFormData] = useState(editingCustomer || {
        name: '',
        nameKana: '',
        phone: '',
        email: '',
        lineId: '',
        instagramId: '',
        assignedStaff: '',
        notes: ''
      })

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingCustomer ? '顧客情報編集' : '新規顧客登録'}
                </h3>
                <button
                  onClick={() => {
                    setShowCustomerForm(false)
                    setEditingCustomer(null)
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      氏名 *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="田中花子"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      氏名（カナ）
                    </label>
                    <input
                      type="text"
                      value={formData.nameKana}
                      onChange={(e) => setFormData({ ...formData, nameKana: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="タナカ ハナコ"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      電話番号
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="090-1234-5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      メールアドレス
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example@gmail.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LINE ID
                    </label>
                    <input
                      type="text"
                      value={formData.lineId}
                      onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="line_hanako_123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram ID
                    </label>
                    <input
                      type="text"
                      value={formData.instagramId}
                      onChange={(e) => setFormData({ ...formData, instagramId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="@hanako_beauty"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    担当スタッフ
                  </label>
                  <select
                    value={formData.assignedStaff}
                    onChange={(e) => setFormData({ ...formData, assignedStaff: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">選択してください</option>
                    {mockStaff.map(staff => (
                      <option key={staff.id} value={staff.name}>{staff.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    備考・特記事項
                  </label>
                  <textarea
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="施術の好み、アレルギー情報など"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomerForm(false)
                      setEditingCustomer(null)
                    }}
                    className="btn btn-secondary"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.preventDefault()
                      
                      // フォームデータの取得
                      const formElements = e.target.form.elements
                      const newCustomer = {
                        name: formData.name,
                        nameKana: formData.nameKana,
                        phone: formData.phone,
                        email: formData.email,
                        lineId: formData.lineId,
                        instagramId: formData.instagramId,
                        assignedStaff: formData.assignedStaff,
                        notes: formData.notes
                      }
                      
                      console.log('顧客データ保存:', newCustomer)
                      
                      // 成功メッセージ
                      alert(editingCustomer 
                        ? `${formData.name}様の情報を更新しました` 
                        : `${formData.name}様を新規顧客として登録しました`)
                      
                      // フォームを閉じる
                      setShowCustomerForm(false)
                      setEditingCustomer(null)
                    }}
                  >
                    {editingCustomer ? '更新' : '登録'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )
    }

    const getStatusInfo = (status) => {
      switch (status) {
        case 'IN_PROGRESS':
          return { label: '対応中', color: 'bg-blue-100 text-blue-800' }
        case 'WAITING_REPLY':
          return { label: '返信待ち', color: 'bg-yellow-100 text-yellow-800' }
        case 'COMPLETED':
          return { label: '完了', color: 'bg-green-100 text-green-800' }
        default:
          return { label: '未対応', color: 'bg-gray-100 text-gray-800' }
      }
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">顧客管理</h2>
          <button 
            onClick={() => setShowCustomerForm(true)}
            className="btn btn-primary text-sm flex items-center"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            新規顧客登録
          </button>
        </div>
        
        <div className="space-y-4">
          {extendedCustomers.map((customer) => {
            const statusInfo = getStatusInfo(customer.status)
            
            return (
              <div key={customer.id} className="card hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900 break-words">
                          {customer.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color} ml-2`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-3">
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

                      {/* SNSボタンと担当者情報 */}
                      <div className="flex flex-wrap items-center gap-3">
                        {customer.lineId && (
                          <button className="flex items-center px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-md transition-colors text-sm">
                            <MessageCircle className="w-4 h-4 mr-1.5" />
                            LINE
                          </button>
                        )}
                        {customer.instagramId && (
                          <button className="flex items-center px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-md transition-colors text-sm">
                            <Instagram className="w-4 h-4 mr-1.5" />
                            Instagram
                          </button>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="w-4 h-4 mr-1" />
                          <span>担当: {customer.assignedStaff}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start lg:items-end text-sm text-gray-500 space-y-1">
                      <span>来店回数: {customer.visitCount}回</span>
                      {customer.lastVisitDate && (
                        <span>最終来店: {formatDate(customer.lastVisitDate)}</span>
                      )}
                      {customer.lastMessageTime && (
                        <span className="text-xs">最終連絡: {formatDate(customer.lastMessageTime)}</span>
                      )}
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    <button 
                      onClick={() => {
                        setEditingCustomer(customer)
                        setShowCustomerForm(true)
                      }}
                      className="btn btn-secondary btn-sm flex items-center"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      編集
                    </button>
                    <button className="btn btn-secondary btn-sm flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      予約履歴
                    </button>
                    <button 
                      onClick={() => {
                        setMessageCustomer(customer)
                        setShowMessageModal(true)
                      }}
                      className="btn btn-primary btn-sm flex items-center"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      メッセージ送信
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* 顧客フォームモーダル */}
        {showCustomerForm && <CustomerForm />}
        
        {/* 顧客詳細モーダル */}
        {showCustomerDetail && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedCustomer.name}様 - 顧客詳細
                  </h3>
                  <button
                    onClick={() => {
                      setShowCustomerDetail(false)
                      setSelectedCustomer(null)
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 顧客情報 */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">基本情報</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">氏名</span>
                          <span className="text-sm font-medium text-gray-900">{selectedCustomer.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">電話番号</span>
                          <span className="text-sm font-medium text-gray-900">{selectedCustomer.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">メール</span>
                          <span className="text-sm font-medium text-gray-900">{selectedCustomer.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">来店回数</span>
                          <span className="text-sm font-medium text-gray-900">{selectedCustomer.visitCount}回</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">最終来店</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(selectedCustomer.lastVisitDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">アクション</h4>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => {
                            setEditingCustomer(selectedCustomer)
                            setShowCustomerForm(true)
                            setShowCustomerDetail(false)
                          }}
                          className="btn btn-secondary flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          編集
                        </button>
                        <button 
                          onClick={() => {
                            setMessageCustomer(selectedCustomer)
                            setShowMessageModal(true)
                          }}
                          className="btn btn-primary flex items-center"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          メッセージ送信
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 予約履歴と新規予約作成 */}
                  <div className="space-y-6">
                    {/* 予約履歴 */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">予約履歴</h4>
                      <div className="max-h-64 overflow-y-auto space-y-3">
                        {getCustomerReservationHistory(selectedCustomer.id).map((reservation) => (
                          <div key={reservation.id} className="bg-gray-50 rounded-lg p-4 border">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-medium text-gray-900">{reservation.menu}</h5>
                                <p className="text-sm text-gray-600">担当: {reservation.staff}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">¥{reservation.price.toLocaleString()}</p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  完了
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>{formatDate(reservation.date)} - {new Date(reservation.endTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {reservation.notes && (
                              <p className="text-xs text-gray-600 mt-2 bg-white rounded px-2 py-1">{reservation.notes}</p>
                            )}
                          </div>
                        ))}
                        {getCustomerReservationHistory(selectedCustomer.id).length === 0 && (
                          <p className="text-gray-500 text-center py-4">予約履歴がありません</p>
                        )}
                      </div>
                    </div>

                    {/* 新規予約作成 */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">新規予約作成</h4>
                      <form className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            予約日時 *
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="date"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="time"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            メニュー内容 *
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">メニューを選択</option>
                            <option value="カット">カット</option>
                            <option value="カット+カラー">カット+カラー</option>
                            <option value="カット+パーマ">カット+パーマ</option>
                            <option value="トリートメント">トリートメント</option>
                            <option value="ヘアセット">ヘアセット</option>
                            <option value="白髪染め">白髪染め</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            担当スタッフ
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">スタッフを選択</option>
                            {mockStaff.map(staff => (
                              <option key={staff.id} value={staff.name}>{staff.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            予想所要時間
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="60">60分</option>
                            <option value="90">90分</option>
                            <option value="120">120分</option>
                            <option value="150">150分</option>
                            <option value="180">180分</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            料金
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            備考
                          </label>
                          <textarea
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="特記事項があれば入力"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full btn btn-primary"
                          onClick={(e) => {
                            e.preventDefault()
                            alert(`${selectedCustomer.name}様の予約を登録しました`)
                            setShowCustomerDetail(false)
                            setSelectedCustomer(null)
                          }}
                        >
                          予約を登録
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* メッセージ送信モーダル */}
        {showMessageModal && messageCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {messageCustomer.name}様へメッセージ送信
                  </h3>
                  <button
                    onClick={() => {
                      setShowMessageModal(false)
                      setMessageCustomer(null)
                      setMessageContent('')
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      メッセージ内容
                    </label>
                    <textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="メッセージを入力してください..."
                    />
                  </div>
                  

                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowMessageModal(false)
                        setMessageCustomer(null)
                        setMessageContent('')
                      }}
                      className="btn btn-secondary flex-1"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={() => {
                        if (!messageContent.trim()) return
                        alert(`${messageCustomer.name}様へメッセージを送信しました: "${messageContent}"`)
                        setShowMessageModal(false)
                        setMessageCustomer(null)
                        setMessageContent('')
                      }}
                      disabled={!messageContent.trim()}
                      className="btn btn-primary flex-1 disabled:opacity-50"
                    >
                      送信
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

  const AutoMessageManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">自動メッセージ管理</h2>
      </div>

      {/* Settings Section */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          自動送信設定
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">予約リマインダー</h4>
              <p className="text-sm text-gray-600">予約の1週間前・3日前に自動でリマインダーを送信</p>
            </div>
            <button
              onClick={() => setAutoMessageSettings(prev => ({ ...prev, autoReminderEnabled: !prev.autoReminderEnabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoMessageSettings.autoReminderEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoMessageSettings.autoReminderEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">来店促進メッセージ</h4>
              <p className="text-sm text-gray-600">次回来店目安から1週間後に来店を促すメッセージを送信</p>
            </div>
            <button
              onClick={() => setAutoMessageSettings(prev => ({ ...prev, autoFollowUpEnabled: !prev.autoFollowUpEnabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoMessageSettings.autoFollowUpEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoMessageSettings.autoFollowUpEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Message Templates */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Edit className="w-5 h-5 mr-2" />
          メッセージテンプレート
        </h3>

        {Object.entries(messageTemplates).map(([type, template]) => (
          <div key={type} className="card">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{template.title}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    送信順位: LINE → Instagram → Email
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メッセージ内容
                </label>
                <textarea
                  value={template.content}
                  onChange={(e) => setMessageTemplates(prev => ({
                    ...prev,
                    [type]: { ...prev[type], content: e.target.value }
                  }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="メッセージ内容を入力..."
                />
                <div className="mt-2 text-xs text-gray-500">
                  使用可能な変数: {'{customerName}'} (お客様名), {type.includes('REMINDER') ? '{reservationDate} (予約日), {reservationTime} (予約時間), {menuContent} (メニュー内容)' : ''}
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  className="btn btn-primary btn-sm flex items-center"
                  onClick={() => alert('テンプレートを保存しました')}
                >
                  <Save className="w-4 h-4 mr-1" />
                  保存
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mass Message Section */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Send className="w-5 h-5 mr-2" />
          一斉送信
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">キャンペーンや定休日情報を一斉送信</h4>
            <p className="text-sm text-gray-600">条件を指定して複数のお客様に同時にメッセージを送信します</p>
          </div>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowMassMessageModal(true)}
          >
            一斉送信設定
          </button>
        </div>
      </div>
    </div>
  )

  // Reservation Management Component
  const ReservationManagement = () => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
        case 'COMPLETED': return 'bg-green-100 text-green-800'
        case 'CANCELLED': return 'bg-red-100 text-red-800'
        case 'NO_SHOW': return 'bg-gray-100 text-gray-800'
        case 'TENTATIVE': return 'bg-yellow-100 text-yellow-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }

    const getSourceIcon = (source) => {
      switch (source) {
        case 'LINE': return <MessageCircle className="w-4 h-4 text-green-500" />
        case 'INSTAGRAM': return <Instagram className="w-4 h-4 text-pink-500" />
        case 'PHONE': return <Phone className="w-4 h-4 text-blue-500" />
        case 'HOTPEPPER': return <CalendarDays className="w-4 h-4 text-orange-500" />
        default: return <Calendar className="w-4 h-4 text-gray-500" />
      }
    }

    const filteredReservations = mockReservations.filter(reservation => {
      const matchesFilter = reservationsFilter === 'all' || reservation.status === reservationsFilter
      const matchesSearch = reservation.customerName.toLowerCase().includes(reservationsSearch.toLowerCase()) ||
                          reservation.menuContent.toLowerCase().includes(reservationsSearch.toLowerCase()) ||
                          reservation.staffName.toLowerCase().includes(reservationsSearch.toLowerCase())
      return matchesFilter && matchesSearch
    })

    const formatReservationDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('ja-JP', { 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
      })
    }

    const formatReservationTime = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit'
      })
    }

    // カレンダービューコンポーネント
    const DayView = ({ date }) => {
      const timeSlots = generateTimeSlots()
      
      return (
        <div className="grid grid-cols-12 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {/* Time labels */}
          <div className="col-span-2 bg-gray-50">
            <div className="p-3 border-b border-gray-200 font-medium text-gray-700 text-center">
              時間
            </div>
            {timeSlots.map((slot) => (
              <div key={slot} className="p-2 border-b border-gray-200 text-sm text-gray-600 text-center">
                {slot}
              </div>
            ))}
          </div>
          
          {/* Day column */}
          <div className="col-span-10 bg-white">
            <div className="p-3 border-b border-gray-200 font-medium text-gray-700 text-center">
              {date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })}
            </div>
            {timeSlots.map((slot) => {
              const reservation = getReservationForTimeSlot(date, slot)
              const isBusinessOpen = isBusinessDay(date) && isBusinessHour(slot)
              
              return (
                <div
                  key={slot}
                  className={`p-2 border-b border-gray-200 min-h-[40px] transition-colors ${
                    !isBusinessOpen 
                      ? 'bg-gray-100 cursor-not-allowed' 
                      : reservation 
                        ? 'bg-blue-100 cursor-default' 
                        : 'cursor-pointer hover:bg-blue-50'
                  }`}
                  onClick={() => !reservation && isBusinessOpen && handleTimeSlotClick(date, slot)}
                >
                  {!isBusinessOpen && !reservation && (
                    <div className="text-xs text-gray-400 text-center">休業時間</div>
                  )}
                  {reservation && (
                    <div className="text-xs bg-blue-500 text-white rounded px-2 py-1">
                      <div className="font-medium">{reservation.customerName}</div>
                      <div>{reservation.menuContent}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    const ThreeDaysView = ({ date }) => {
      const timeSlots = generateTimeSlots()
      const days = []
      
      for (let i = 0; i < 3; i++) {
        const day = new Date(date)
        day.setDate(date.getDate() + i)
        days.push(day)
      }
      
      return (
        <div className="grid grid-cols-12 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {/* Time labels */}
          <div className="col-span-3 bg-gray-50">
            <div className="p-3 border-b border-gray-200 font-medium text-gray-700 text-center">
              時間
            </div>
            {timeSlots.map((slot) => (
              <div key={slot} className="p-2 border-b border-gray-200 text-sm text-gray-600 text-center">
                {slot}
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          {days.map((day, index) => (
            <div key={index} className="col-span-3 bg-white">
              <div className="p-3 border-b border-gray-200 font-medium text-gray-700 text-center">
                {day.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })}
              </div>
              {timeSlots.map((slot) => {
                const reservation = getReservationForTimeSlot(day, slot)
                const isBusinessOpen = isBusinessDay(day) && isBusinessHour(slot)
                
                return (
                  <div
                    key={slot}
                    className={`p-2 border-b border-gray-200 min-h-[40px] transition-colors ${
                      !isBusinessOpen 
                        ? 'bg-gray-100 cursor-not-allowed' 
                        : reservation 
                          ? 'bg-blue-100 cursor-default' 
                          : 'cursor-pointer hover:bg-blue-50'
                    }`}
                    onClick={() => !reservation && isBusinessOpen && handleTimeSlotClick(day, slot)}
                  >
                    {!isBusinessOpen && !reservation && (
                      <div className="text-xs text-gray-400 text-center">休</div>
                    )}
                    {reservation && (
                      <div className="text-xs bg-blue-500 text-white rounded px-1 py-1">
                        <div className="font-medium truncate">{reservation.customerName}</div>
                        <div className="truncate">{reservation.menuContent}</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )
    }

    const WeekView = ({ date }) => {
      const timeSlots = generateTimeSlots()
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // 日曜日を週の始まりとする
      
      const days = []
      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart)
        day.setDate(weekStart.getDate() + i)
        days.push(day)
      }
      
      return (
        <div className="overflow-x-auto">
          <div className="min-w-[800px] grid grid-cols-8 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {/* Time labels */}
            <div className="bg-gray-50">
              <div className="p-2 border-b border-gray-200 font-medium text-gray-700 text-center text-sm">
                時間
              </div>
              {timeSlots.filter((_, index) => index % 2 === 0).map((slot) => (
                <div key={slot} className="p-1 border-b border-gray-200 text-xs text-gray-600 text-center">
                  {slot}
                </div>
              ))}
            </div>
            
            {/* Day columns */}
            {days.map((day, index) => (
              <div key={index} className="bg-white">
                <div className="p-2 border-b border-gray-200 font-medium text-gray-700 text-center text-sm">
                  {day.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })}
                </div>
                {timeSlots.filter((_, index) => index % 2 === 0).map((slot) => {
                  const reservation = getReservationForTimeSlot(day, slot)
                  const isBusinessOpen = isBusinessDay(day) && isBusinessHour(slot)
                  
                  return (
                    <div
                      key={slot}
                      className={`p-1 border-b border-gray-200 min-h-[30px] transition-colors ${
                        !isBusinessOpen 
                          ? 'bg-gray-100 cursor-not-allowed' 
                          : reservation 
                            ? 'bg-blue-100 cursor-default' 
                            : 'cursor-pointer hover:bg-blue-50'
                      }`}
                      onClick={() => !reservation && isBusinessOpen && handleTimeSlotClick(day, slot)}
                    >
                      {!isBusinessOpen && !reservation && (
                        <div className="text-xs text-gray-400 text-center">休</div>
                      )}
                      {reservation && (
                        <div className="text-xs bg-blue-500 text-white rounded px-1 py-0.5">
                          <div className="font-medium truncate">{reservation.customerName}</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )
    }

    const MonthView = ({ date }) => {
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      const startDate = new Date(monthStart)
      startDate.setDate(startDate.getDate() - startDate.getDay()) // 月曜日を週の始まりとする場合は - (startDate.getDay() + 6) % 7
      
      const days = []
      const current = new Date(startDate)
      
      for (let week = 0; week < 6; week++) {
        for (let day = 0; day < 7; day++) {
          days.push(new Date(current))
          current.setDate(current.getDate() + 1)
        }
      }
      
      return (
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {/* Day headers */}
          {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
            <div key={day} className="bg-gray-50 p-3 text-center font-medium text-gray-700">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === date.getMonth()
            const isBusinessOpen = isBusinessDay(day)
            const reservationsForDay = mockReservations.filter(reservation => {
              const reservationDate = new Date(reservation.startTime)
              return reservationDate.toDateString() === day.toDateString()
            })
            
            return (
              <div
                key={index}
                className={`p-2 min-h-[100px] transition-colors ${
                  !isCurrentMonth 
                    ? 'bg-gray-50 opacity-30' 
                    : !isBusinessOpen 
                      ? 'bg-gray-100 cursor-not-allowed' 
                      : 'bg-white cursor-pointer hover:bg-blue-50'
                }`}
                onClick={() => isBusinessOpen && isCurrentMonth && handleTimeSlotClick(day, businessSettings.businessHours.start)}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {day.getDate()}
                  {!isBusinessOpen && isCurrentMonth && (
                    <span className="text-xs text-red-500 ml-1">休</span>
                  )}
                </div>
                <div className="space-y-1">
                  {isBusinessOpen ? (
                    <>
                      {reservationsForDay.slice(0, 3).map((reservation) => (
                        <div key={reservation.id} className="text-xs bg-blue-500 text-white rounded px-1 py-0.5 truncate">
                          {reservation.customerName}
                        </div>
                      ))}
                      {reservationsForDay.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{reservationsForDay.length - 3}件
                        </div>
                      )}
                    </>
                  ) : (
                    isCurrentMonth && (
                      <div className="text-xs text-gray-400 text-center">定休日</div>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    const ReservationForm = () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">新規予約登録</h3>
              <button
                onClick={() => {
                  setShowReservationForm(false)
                  setSelectedTimeSlot(null)
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    顧客名 *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="顧客名を入力"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    担当スタッフ *
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">スタッフを選択</option>
                    {mockStaff.map(staff => (
                      <option key={staff.id} value={staff.id}>{staff.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    予約日 *
                  </label>
                  <input
                    type="date"
                    defaultValue={selectedTimeSlot ? selectedTimeSlot.date.toISOString().split('T')[0] : ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    時間 *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      defaultValue={selectedTimeSlot ? selectedTimeSlot.timeSlot : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="開始時間"
                    />
                    <input
                      type="time"
                      defaultValue={selectedTimeSlot ? 
                        (() => {
                          const [hour, minute] = selectedTimeSlot.timeSlot.split(':')
                          const endHour = parseInt(hour) + 1
                          return `${endHour.toString().padStart(2, '0')}:${minute}`
                        })() : ''
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="終了時間"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メニュー内容 *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: カット + カラー"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    料金
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    予約経路
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="MANUAL">手動登録</option>
                    <option value="LINE">LINE</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="PHONE">電話</option>
                    <option value="HOTPEPPER">ホットペッパー</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  次回来店目安
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  備考
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="特記事項があれば入力してください"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowReservationForm(false)}
                  className="btn btn-secondary"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('予約を登録しました')
                    setShowReservationForm(false)
                  }}
                >
                  予約登録
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">予約管理</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setShowReservationForm(true)}
              className="btn btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              新規予約
            </button>
            <button className="btn btn-secondary flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              更新
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex border-b border-gray-200">
              {[
                { key: 'day', label: '1日' },
                { key: '3days', label: '3日' },
                { key: 'week', label: '1週間' },
                { key: 'month', label: '1ヶ月' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setReservationViewMode(tab.key)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    reservationViewMode === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Date Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  if (reservationViewMode === 'month') {
                    newDate.setMonth(newDate.getMonth() - 1)
                  } else if (reservationViewMode === 'week') {
                    newDate.setDate(newDate.getDate() - 7)
                  } else if (reservationViewMode === '3days') {
                    newDate.setDate(newDate.getDate() - 3)
                  } else {
                    newDate.setDate(newDate.getDate() - 1)
                  }
                  setSelectedDate(newDate)
                }}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="text-lg font-medium text-gray-900 min-w-[120px] text-center">
                {selectedDate.toLocaleDateString('ja-JP', { 
                  year: 'numeric',
                  month: 'long',
                  ...(reservationViewMode !== 'month' && { day: 'numeric' })
                })}
              </div>
              
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  if (reservationViewMode === 'month') {
                    newDate.setMonth(newDate.getMonth() + 1)
                  } else if (reservationViewMode === 'week') {
                    newDate.setDate(newDate.getDate() + 7)
                  } else if (reservationViewMode === '3days') {
                    newDate.setDate(newDate.getDate() + 3)
                  } else {
                    newDate.setDate(newDate.getDate() + 1)
                  }
                  setSelectedDate(newDate)
                }}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setSelectedDate(new Date())}
                className="btn btn-secondary btn-sm ml-2"
              >
                今日
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="顧客名、メニュー、スタッフで検索..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={reservationsSearch}
                  onChange={(e) => setReservationsSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={reservationsFilter}
                onChange={(e) => setReservationsFilter(e.target.value)}
              >
                <option value="all">全ステータス</option>
                <option value="CONFIRMED">確定</option>
                <option value="COMPLETED">完了</option>
                <option value="CANCELLED">キャンセル</option>
                <option value="TENTATIVE">仮予約</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">今日の予約</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">完了予約</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredReservations.filter(r => r.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">確定予約</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredReservations.filter(r => r.status === 'CONFIRMED').length}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">今月売上</p>
                <p className="text-2xl font-bold text-gray-900">¥{mockReservations.reduce((sum, r) => sum + (r.price || 0), 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="card">
          {reservationViewMode === 'day' && (
            <DayView date={selectedDate} />
          )}
          {reservationViewMode === '3days' && (
            <ThreeDaysView date={selectedDate} />
          )}
          {reservationViewMode === 'week' && (
            <WeekView date={selectedDate} />
          )}
          {reservationViewMode === 'month' && (
            <MonthView date={selectedDate} />
          )}
        </div>

        {/* Reservations List */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    顧客・日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メニュー・スタッフ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス・経路
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    料金・次回来店
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatReservationDate(reservation.startTime)} {formatReservationTime(reservation.startTime)}
                          {' - '}
                          {formatReservationTime(reservation.endTime)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {reservation.menuContent}
                      </div>
                      <div className="text-sm text-gray-500">
                        担当: {reservation.staffName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                          {reservation.status === 'CONFIRMED' && '確定'}
                          {reservation.status === 'COMPLETED' && '完了'}
                          {reservation.status === 'CANCELLED' && 'キャンセル'}
                          {reservation.status === 'TENTATIVE' && '仮予約'}
                          {reservation.status === 'NO_SHOW' && '無断欠席'}
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          {getSourceIcon(reservation.source)}
                          <span className="ml-1">{reservation.source}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>¥{reservation.price?.toLocaleString() || '-'}</div>
                      {reservation.nextVisitDate && (
                        <div className="text-xs text-gray-500">
                          次回: {new Date(reservation.nextVisitDate).toLocaleDateString('ja-JP')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedReservation(reservation)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reservation Form Modal */}
        {showReservationForm && <ReservationForm />}

        {/* Reservation Detail Modal */}
        {selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">予約詳細</h3>
                  <button
                    onClick={() => setSelectedReservation(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">顧客名</label>
                      <p className="text-sm text-gray-900">{selectedReservation.customerName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">担当スタッフ</label>
                      <p className="text-sm text-gray-900">{selectedReservation.staffName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">予約日時</label>
                      <p className="text-sm text-gray-900">
                        {formatReservationDate(selectedReservation.startTime)} {formatReservationTime(selectedReservation.startTime)}
                        {' - '}
                        {formatReservationTime(selectedReservation.endTime)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedReservation.status)}`}>
                        {selectedReservation.status === 'CONFIRMED' && '確定'}
                        {selectedReservation.status === 'COMPLETED' && '完了'}
                        {selectedReservation.status === 'CANCELLED' && 'キャンセル'}
                        {selectedReservation.status === 'TENTATIVE' && '仮予約'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">メニュー内容</label>
                    <p className="text-sm text-gray-900">{selectedReservation.menuContent}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">料金</label>
                      <p className="text-sm text-gray-900">¥{selectedReservation.price?.toLocaleString() || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">予約経路</label>
                      <div className="flex items-center">
                        {getSourceIcon(selectedReservation.source)}
                        <span className="ml-2 text-sm text-gray-900">{selectedReservation.source}</span>
                      </div>
                    </div>
                  </div>

                  {selectedReservation.nextVisitDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">次回来店目安</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedReservation.nextVisitDate).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  )}

                  {selectedReservation.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
                      <p className="text-sm text-gray-900">{selectedReservation.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    onClick={() => setSelectedReservation(null)}
                    className="btn btn-secondary"
                  >
                    閉じる
                  </button>
                  <button className="btn btn-primary">
                    編集
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Analytics Component
  const AnalyticsComponent = () => {
    const totalRevenue = mockReservations.reduce((sum, r) => sum + (r.price || 0), 0)
    const completedReservations = mockReservations.filter(r => r.status === 'COMPLETED')
    const cancelledReservations = mockReservations.filter(r => r.status === 'CANCELLED')
    const cancelRate = (cancelledReservations.length / mockReservations.length * 100).toFixed(1)

    const monthlyData = [
      { month: '1月', revenue: 1250000, reservations: 45, customers: 38 },
      { month: '2月', revenue: 1180000, reservations: 42, customers: 35 },
      { month: '3月', revenue: 1420000, reservations: 52, customers: 44 },
      { month: '4月', revenue: 1350000, reservations: 48, customers: 41 },
      { month: '5月', revenue: 1580000, reservations: 58, customers: 49 },
      { month: '6月', revenue: 1720000, reservations: 62, customers: 53 },
      { month: '7月', revenue: 1650000, reservations: 59, customers: 51 },
      { month: '8月', revenue: 1480000, reservations: 54, customers: 46 },
      { month: '9月', revenue: 1390000, reservations: 50, customers: 43 },
      { month: '10月', revenue: 1560000, reservations: 56, customers: 47 },
      { month: '11月', revenue: 1680000, reservations: 60, customers: 52 },
      { month: '12月', revenue: totalRevenue, reservations: mockReservations.length, customers: 15 }
    ]

    const popularServices = [
      { name: 'カット + カラー', count: 28, revenue: 420000 },
      { name: 'トリートメント', count: 15, revenue: 225000 },
      { name: 'パーマ', count: 12, revenue: 180000 },
      { name: 'ヘアセット', count: 8, revenue: 64000 },
      { name: '白髪染め', count: 6, revenue: 42000 }
    ]

    const staffPerformance = [
      { name: '中村雪乃', reservations: 18, revenue: 270000, rating: 4.8 },
      { name: '高橋武志', reservations: 15, revenue: 210000, rating: 4.7 },
      { name: '副店長 伊藤花音', reservations: 12, revenue: 180000, rating: 4.9 },
      { name: '小林健二', reservations: 10, revenue: 140000, rating: 4.6 },
      { name: '鈴木麻耶', reservations: 8, revenue: 120000, rating: 4.5 }
    ]

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">分析レポート</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="month">今月</option>
              <option value="quarter">四半期</option>
              <option value="year">年間</option>
            </select>
            <button className="btn btn-secondary flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              更新
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">総売上</p>
                <p className="text-2xl font-bold text-gray-900">¥{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600">+12.5% 前月比</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">総予約数</p>
                <p className="text-2xl font-bold text-gray-900">{mockReservations.length}</p>
                <p className="text-xs text-blue-600">+8.3% 前月比</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">新規顧客</p>
                <p className="text-2xl font-bold text-gray-900">15</p>
                <p className="text-xs text-purple-600">+25.0% 前月比</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">キャンセル率</p>
                <p className="text-2xl font-bold text-gray-900">{cancelRate}%</p>
                <p className="text-xs text-red-600">-2.1% 前月比</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">月次売上推移</h3>
          <div className="h-80 flex items-end justify-between space-x-2">
            {monthlyData.map((data, index) => (
              <div key={data.month} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative group"
                  style={{ height: `${(data.revenue / 2000000) * 100}%`, minHeight: '20px' }}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    ¥{data.revenue.toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  {data.month}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Services */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">人気メニュー</h3>
            <div className="space-y-4">
              {popularServices.map((service, index) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{service.name}</p>
                      <p className="text-xs text-gray-500">{service.count}回</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">¥{service.revenue.toLocaleString()}</p>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(service.count / 30) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Staff Performance */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">スタッフ別売上</h3>
            <div className="space-y-4">
              {staffPerformance.map((staff, index) => (
                <div key={staff.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{staff.name}</p>
                      <p className="text-xs text-gray-500">{staff.reservations}件・評価{staff.rating}★</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">¥{staff.revenue.toLocaleString()}</p>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${(staff.revenue / 300000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reservation Sources */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">予約経路別分析</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { source: 'LINE', count: 8, color: 'bg-green-500', icon: MessageCircle },
              { source: 'Instagram', count: 6, color: 'bg-pink-500', icon: Instagram },
              { source: '電話', count: 4, color: 'bg-blue-500', icon: Phone },
              { source: 'ホットペッパー', count: 3, color: 'bg-orange-500', icon: CalendarDays },
              { source: '手動登録', count: 5, color: 'bg-gray-500', icon: User }
            ].map((source) => {
              const Icon = source.icon
              const percentage = ((source.count / mockReservations.length) * 100).toFixed(1)
              return (
                <div key={source.source} className="text-center">
                  <div className={`${source.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{source.source}</p>
                  <p className="text-xs text-gray-500">{source.count}件 ({percentage}%)</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Customer Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">顧客動向</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">平均来店間隔</span>
                <span className="text-sm font-medium text-gray-900">6.2週</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">平均単価</span>
                <span className="text-sm font-medium text-gray-900">¥{Math.round(totalRevenue / mockReservations.length).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">リピート率</span>
                <span className="text-sm font-medium text-gray-900">78.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">満足度</span>
                <span className="text-sm font-medium text-gray-900">4.7★</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">時間帯別予約</h3>
            <div className="space-y-2">
              {[
                { time: '9:00-11:00', percentage: 15 },
                { time: '11:00-13:00', percentage: 25 },
                { time: '13:00-15:00', percentage: 30 },
                { time: '15:00-17:00', percentage: 20 },
                { time: '17:00-19:00', percentage: 10 }
              ].map((slot) => (
                <div key={slot.time} className="flex items-center">
                  <span className="text-xs text-gray-600 w-20">{slot.time}</span>
                  <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${slot.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-900 w-8">{slot.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">年齢層分析</h3>
            <div className="space-y-2">
              {[
                { age: '20代', percentage: 35, count: 8 },
                { age: '30代', percentage: 30, count: 7 },
                { age: '40代', percentage: 20, count: 5 },
                { age: '50代', percentage: 10, count: 2 },
                { age: '60代+', percentage: 5, count: 1 }
              ].map((age) => (
                <div key={age.age} className="flex items-center">
                  <span className="text-xs text-gray-600 w-12">{age.age}</span>
                  <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${age.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-900 w-8">{age.count}人</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Settings Component
  const SettingsComponent = () => {
    const [tenantSettings, setTenantSettings] = useState({
      shopName: 'SHIKI美容室 渋谷店',
      address: '東京都渋谷区道玄坂1-15-3 プライムプラザ道玄坂2F',
      phone: '03-5728-3456',
      email: 'info@shiki-salon.com',
      businessHours: {
        open: '09:00',
        close: '19:00',
        closedDays: ['月曜日']
      },
      timezone: 'Asia/Tokyo',
      currency: 'JPY'
    })

    const [systemSettings, setSystemSettings] = useState({
      autoBackup: true,
      emailNotifications: true,
      smsNotifications: false,
      dataRetention: 365,
      sessionTimeout: 60,
      twoFactorAuth: false
    })

    const [integrationSettings, setIntegrationSettings] = useState({
      lineWebhook: 'https://api.line.me/webhook/xxxxx',
      instagramToken: '••••••••••••••••',
      hotpepperApiKey: '••••••••••••••••',
      googleCalendarSync: true,
      emailProvider: 'gmail'
    })

    const [staffPermissions, setStaffPermissions] = useState([
      { id: 'staff-1', name: '高橋武志', role: 'STAFF', canViewAnalytics: false, canManageCustomers: true, canManageReservations: true },
      { id: 'staff-2', name: '中村雪乃', role: 'STAFF', canViewAnalytics: false, canManageCustomers: true, canManageReservations: true },
      { id: 'staff-3', name: '副店長 伊藤花音', role: 'MANAGER', canViewAnalytics: true, canManageCustomers: true, canManageReservations: true },
      { id: 'staff-4', name: '小林健二', role: 'STAFF', canViewAnalytics: false, canManageCustomers: true, canManageReservations: true },
      { id: 'staff-5', name: '鈴木麻耶', role: 'STAFF', canViewAnalytics: false, canManageCustomers: true, canManageReservations: true }
    ])

    const [activeSettingsTab, setActiveSettingsTab] = useState('general')

    const settingsTabs = [
      { id: 'general', label: '基本設定', icon: Settings },
      { id: 'menus', label: 'メニュー管理', icon: Calendar },
      { id: 'system', label: 'システム', icon: BarChart3 },
      { id: 'integrations', label: '連携設定', icon: MessageSquare },
      { id: 'permissions', label: '権限管理', icon: Users }
    ]

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">システム設定</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="btn btn-secondary flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              設定リロード
            </button>
            <button className="btn btn-primary flex items-center">
              <Save className="w-4 h-4 mr-2" />
              変更を保存
            </button>
          </div>
        </div>

        {/* Settings Tabs */}
        <div className="card">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSettingsTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeSettingsTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* General Settings */}
            {activeSettingsTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">店舗基本情報</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">店舗名</label>
                      <input
                        type="text"
                        value={tenantSettings.shopName}
                        onChange={(e) => setTenantSettings(prev => ({ ...prev, shopName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                      <input
                        type="tel"
                        value={tenantSettings.phone}
                        onChange={(e) => setTenantSettings(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">住所</label>
                    <input
                      type="text"
                      value={tenantSettings.address}
                      onChange={(e) => setTenantSettings(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
                    <input
                      type="email"
                      value={tenantSettings.email}
                      onChange={(e) => setTenantSettings(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">営業時間</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">開店時間</label>
                      <input
                        type="time"
                        value={tenantSettings.businessHours.open}
                        onChange={(e) => setTenantSettings(prev => ({ 
                          ...prev, 
                          businessHours: { ...prev.businessHours, open: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">閉店時間</label>
                      <input
                        type="time"
                        value={tenantSettings.businessHours.close}
                        onChange={(e) => setTenantSettings(prev => ({ 
                          ...prev, 
                          businessHours: { ...prev.businessHours, close: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">定休日</label>
                    <div className="flex flex-wrap gap-2">
                      {['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'].map((day) => (
                        <label key={day} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={tenantSettings.businessHours.closedDays.includes(day)}
                            onChange={(e) => {
                              const closedDays = e.target.checked 
                                ? [...tenantSettings.businessHours.closedDays, day]
                                : tenantSettings.businessHours.closedDays.filter(d => d !== day)
                              setTenantSettings(prev => ({ 
                                ...prev, 
                                businessHours: { ...prev.businessHours, closedDays }
                              }))
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 臨時休業日管理 */}
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">臨時休業日設定</h4>
                    <p className="text-sm text-gray-600 mb-4">定休日以外で臨時休業する日を設定できます</p>
                    
                    <div className="space-y-3">
                      {businessSettings.specialHolidays.map((holiday, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center">
                            <CalendarDays className="w-4 h-4 text-red-500 mr-2" />
                            <span className="text-sm font-medium text-red-700">
                              {new Date(holiday + 'T00:00:00').toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                weekday: 'short'
                              })}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setBusinessSettings(prev => ({
                                ...prev,
                                specialHolidays: prev.specialHolidays.filter((_, i) => i !== index)
                              }))
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      <div className="flex items-center gap-3">
                        <input
                          type="date"
                          id="newHolidayDate"
                          min={new Date().toISOString().split('T')[0]}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => {
                            const dateInput = document.getElementById('newHolidayDate') as HTMLInputElement
                            if (dateInput.value) {
                              if (!businessSettings.specialHolidays.includes(dateInput.value)) {
                                setBusinessSettings(prev => ({
                                  ...prev,
                                  specialHolidays: [...prev.specialHolidays, dateInput.value].sort()
                                }))
                                dateInput.value = ''
                              } else {
                                alert('この日付は既に臨時休業日として設定されています。')
                              }
                            }
                          }}
                          className="btn btn-secondary flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          追加
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        // 設定をbusinessSettingsに反映
                        setBusinessSettings(prev => ({
                          ...prev,
                          businessHours: {
                            start: tenantSettings.businessHours.open,
                            end: tenantSettings.businessHours.close
                          },
                          closedDays: tenantSettings.businessHours.closedDays.map(day => {
                            const dayMap = {'日曜日': 0, '月曜日': 1, '火曜日': 2, '水曜日': 3, '木曜日': 4, '金曜日': 5, '土曜日': 6}
                            return dayMap[day]
                          })
                        }))
                        alert('営業時間設定を保存しました。カレンダーに反映されます。')
                      }}
                      className="btn btn-primary"
                    >
                      営業時間・休業日設定を保存
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Menu Management */}
            {activeSettingsTab === 'menus' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">メニュー管理</h3>
                  <button 
                    onClick={() => {
                      setEditingMenu(null)
                      setShowMenuModal(true)
                    }}
                    className="btn btn-primary flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    新規メニュー追加
                  </button>
                </div>

                {/* メニューカテゴリー別表示 */}
                {['カット', 'カラー', 'パーマ', 'セットメニュー', 'ケア'].map(category => {
                  const categoryMenus = serviceMenus.filter(menu => menu.category === category)
                  if (categoryMenus.length === 0) return null
                  
                  return (
                    <div key={category} className="card">
                      <h4 className="text-md font-medium text-gray-900 mb-4">{category}</h4>
                      <div className="space-y-3">
                        {categoryMenus.map(menu => (
                          <div key={menu.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className={`inline-block w-3 h-3 rounded-full ${menu.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                <h5 className="font-medium text-gray-900">{menu.name}</h5>
                                <span className="text-sm text-gray-500">¥{menu.price.toLocaleString()}</span>
                                <span className="text-sm text-gray-500">{menu.duration}分</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1 ml-6">{menu.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setServiceMenus(prev => prev.map(m => 
                                    m.id === menu.id ? { ...m, isActive: !m.isActive } : m
                                  ))
                                }}
                                className={`btn btn-sm ${menu.isActive ? 'btn-secondary' : 'btn-primary'}`}
                              >
                                {menu.isActive ? '非表示' : '表示'}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMenu(menu)
                                  setShowMenuModal(true)
                                }}
                                className="btn btn-sm btn-secondary"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`「${menu.name}」を削除しますか？`)) {
                                    setServiceMenus(prev => prev.filter(m => m.id !== menu.id))
                                  }
                                }}
                                className="btn btn-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* メニューモーダル */}
                {showMenuModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-medium text-gray-900">
                            {editingMenu ? 'メニュー編集' : '新規メニュー追加'}
                          </h3>
                          <button
                            onClick={() => {
                              setShowMenuModal(false)
                              setEditingMenu(null)
                            }}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>

                        <form onSubmit={(e) => {
                          e.preventDefault()
                          const formData = new FormData(e.target)
                          const menuData = {
                            id: editingMenu?.id || Date.now().toString(),
                            name: formData.get('name'),
                            price: parseInt(formData.get('price')),
                            duration: parseInt(formData.get('duration')),
                            description: formData.get('description'),
                            category: formData.get('category'),
                            isActive: true
                          }

                          if (editingMenu) {
                            setServiceMenus(prev => prev.map(m => 
                              m.id === editingMenu.id ? { ...m, ...menuData } : m
                            ))
                          } else {
                            setServiceMenus(prev => [...prev, menuData])
                          }

                          setShowMenuModal(false)
                          setEditingMenu(null)
                        }}>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  メニュー名 *
                                </label>
                                <input
                                  type="text"
                                  name="name"
                                  defaultValue={editingMenu?.name || ''}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="例：カット"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  カテゴリー *
                                </label>
                                <select
                                  name="category"
                                  defaultValue={editingMenu?.category || ''}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">カテゴリーを選択</option>
                                  <option value="カット">カット</option>
                                  <option value="カラー">カラー</option>
                                  <option value="パーマ">パーマ</option>
                                  <option value="セットメニュー">セットメニュー</option>
                                  <option value="ケア">ケア</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  料金 (円) *
                                </label>
                                <input
                                  type="number"
                                  name="price"
                                  defaultValue={editingMenu?.price || ''}
                                  required
                                  min="0"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="例：4000"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  所要時間 (分) *
                                </label>
                                <input
                                  type="number"
                                  name="duration"
                                  defaultValue={editingMenu?.duration || ''}
                                  required
                                  min="15"
                                  step="15"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="例：60"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                メニュー説明
                              </label>
                              <textarea
                                name="description"
                                rows={3}
                                defaultValue={editingMenu?.description || ''}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="メニューの詳細説明を入力"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                            <button
                              type="button"
                              onClick={() => {
                                setShowMenuModal(false)
                                setEditingMenu(null)
                              }}
                              className="btn btn-secondary"
                            >
                              キャンセル
                            </button>
                            <button
                              type="submit"
                              className="btn btn-primary"
                            >
                              {editingMenu ? '更新' : '追加'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* System Settings */}
            {activeSettingsTab === 'system' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">システム設定</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">自動バックアップ</h4>
                        <p className="text-sm text-gray-600">毎日自動でデータベースをバックアップ</p>
                      </div>
                      <button
                        onClick={() => setSystemSettings(prev => ({ ...prev, autoBackup: !prev.autoBackup }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          systemSettings.autoBackup ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">メール通知</h4>
                        <p className="text-sm text-gray-600">重要な更新をメールで通知</p>
                      </div>
                      <button
                        onClick={() => setSystemSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          systemSettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">SMS通知</h4>
                        <p className="text-sm text-gray-600">緊急時にSMSで通知</p>
                      </div>
                      <button
                        onClick={() => setSystemSettings(prev => ({ ...prev, smsNotifications: !prev.smsNotifications }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          systemSettings.smsNotifications ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">二段階認証</h4>
                        <p className="text-sm text-gray-600">ログイン時の追加セキュリティ</p>
                      </div>
                      <button
                        onClick={() => setSystemSettings(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          systemSettings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">データ管理</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">データ保持期間（日）</label>
                      <input
                        type="number"
                        value={systemSettings.dataRetention}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">セッションタイムアウト（分）</label>
                      <input
                        type="number"
                        value={systemSettings.sessionTimeout}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Integration Settings */}
            {activeSettingsTab === 'integrations' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">外部サービス連携</h3>
                  
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <MessageCircle className="w-6 h-6 text-green-500 mr-3" />
                        <h4 className="font-medium text-gray-900">LINE連携</h4>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                        <input
                          type="url"
                          value={integrationSettings.lineWebhook}
                          onChange={(e) => setIntegrationSettings(prev => ({ ...prev, lineWebhook: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Instagram className="w-6 h-6 text-pink-500 mr-3" />
                        <h4 className="font-medium text-gray-900">Instagram連携</h4>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">アクセストークン</label>
                        <input
                          type="password"
                          value={integrationSettings.instagramToken}
                          onChange={(e) => setIntegrationSettings(prev => ({ ...prev, instagramToken: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <CalendarDays className="w-6 h-6 text-orange-500 mr-3" />
                        <h4 className="font-medium text-gray-900">ホットペッパービューティー</h4>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                        <input
                          type="password"
                          value={integrationSettings.hotpepperApiKey}
                          onChange={(e) => setIntegrationSettings(prev => ({ ...prev, hotpepperApiKey: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Calendar className="w-6 h-6 text-blue-500 mr-3" />
                          <div>
                            <h4 className="font-medium text-gray-900">Googleカレンダー同期</h4>
                            <p className="text-sm text-gray-600">予約をGoogleカレンダーと同期</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIntegrationSettings(prev => ({ ...prev, googleCalendarSync: !prev.googleCalendarSync }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            integrationSettings.googleCalendarSync ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            integrationSettings.googleCalendarSync ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Staff Permissions */}
            {activeSettingsTab === 'permissions' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">スタッフ権限管理</h3>
                    <button
                      onClick={() => setShowStaffForm(true)}
                      className="btn btn-primary btn-sm flex items-center"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      スタッフ追加
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">スタッフ</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">役職</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">分析閲覧</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">顧客管理</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">予約管理</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">操作</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {staffPermissions.map((staff) => (
                          <tr key={staff.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                  {staff.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                                  <div className="text-sm text-gray-500">{staff.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                staff.role === 'MANAGER' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {staff.role === 'MANAGER' ? 'マネージャー' : 'スタッフ'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => {
                                  const updated = staffPermissions.map(s => 
                                    s.id === staff.id ? { ...s, canViewAnalytics: !s.canViewAnalytics } : s
                                  )
                                  setStaffPermissions(updated)
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  staff.canViewAnalytics ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  staff.canViewAnalytics ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => {
                                  const updated = staffPermissions.map(s => 
                                    s.id === staff.id ? { ...s, canManageCustomers: !s.canManageCustomers } : s
                                  )
                                  setStaffPermissions(updated)
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  staff.canManageCustomers ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  staff.canManageCustomers ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => {
                                  const updated = staffPermissions.map(s => 
                                    s.id === staff.id ? { ...s, canManageReservations: !s.canManageReservations } : s
                                  )
                                  setStaffPermissions(updated)
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  staff.canManageReservations ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  staff.canManageReservations ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingStaff(staff)
                                    setShowStaffForm(true)
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">権限変更時の注意</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        権限を変更すると、該当スタッフは次回ログイン時から新しい権限が適用されます。
                        重要な権限の変更は事前にスタッフに通知することをお勧めします。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">システム状況</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">システム状態</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">稼働中</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">最終バックアップ</span>
                <span className="text-sm font-medium text-gray-900">2時間前</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">データベース</span>
                <span className="text-sm font-medium text-green-600">正常</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ストレージ使用量</span>
                <span className="text-sm font-medium text-gray-900">2.4GB / 10GB</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">API接続状況</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">LINE</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">接続中</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Instagram</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">接続中</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ホットペッパー</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-yellow-600">制限中</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Google Calendar</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">同期中</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">セキュリティ</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">SSL証明書</span>
                <span className="text-sm font-medium text-green-600">有効</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">最終ログイン</span>
                <span className="text-sm font-medium text-gray-900">5分前</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">アクティブセッション</span>
                <span className="text-sm font-medium text-gray-900">3件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">二段階認証</span>
                <span className={`text-sm font-medium ${systemSettings.twoFactorAuth ? 'text-green-600' : 'text-gray-600'}`}>
                  {systemSettings.twoFactorAuth ? '有効' : '無効'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* スタッフフォームモーダル */}
        {showStaffForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingStaff ? 'スタッフ情報編集' : '新規スタッフ登録'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowStaffForm(false)
                      setEditingStaff(null)
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        氏名 *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="田中太郎"
                        defaultValue={editingStaff?.name || ''}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        メールアドレス *
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="staff@salon.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        役職 *
                      </label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue={editingStaff?.role || 'STAFF'}
                      >
                        <option value="STAFF">スタッフ</option>
                        <option value="MANAGER">マネージャー</option>
                        <option value="ADMIN">管理者</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        初回パスワード
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={editingStaff ? "変更する場合のみ入力" : "初回ログイン用パスワード"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      権限設定
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">分析データ閲覧</span>
                        <button
                          type="button"
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            editingStaff?.canViewAnalytics ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            editingStaff?.canViewAnalytics ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">顧客管理</span>
                        <button
                          type="button"
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            editingStaff?.canManageCustomers !== false ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            editingStaff?.canManageCustomers !== false ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">予約管理</span>
                        <button
                          type="button"
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            editingStaff?.canManageReservations !== false ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            editingStaff?.canManageReservations !== false ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowStaffForm(false)
                        setEditingStaff(null)
                      }}
                      className="btn btn-secondary"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.preventDefault()
                        alert(editingStaff ? 'スタッフ情報を更新しました' : '新規スタッフを登録しました')
                        setShowStaffForm(false)
                        setEditingStaff(null)
                      }}
                    >
                      {editingStaff ? '更新' : '登録'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const sidebarItems = [
    { id: 'messages', label: 'メッセージ', icon: MessageSquare },
    { id: 'customers', label: '顧客管理', icon: Users },
    { id: 'reservations', label: '予約管理', icon: Calendar },
    { id: 'auto-messages', label: '自動メッセージ', icon: Bell },
    { id: 'analytics', label: '分析', icon: BarChart3 },
    { id: 'settings', label: '設定', icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'messages':
        return <MessagesList />
      case 'customers':
        return <CustomersList />
      case 'reservations':
        return <ReservationManagement />
      case 'auto-messages':
        return <AutoMessageManagement />
      case 'analytics':
        return <AnalyticsComponent />
      case 'settings':
        return <SettingsComponent />
      default:
        return <MessagesList />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">美容室管理</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setIsSidebarOpen(false)
                }}
                className={`w-full flex items-center px-3 py-2 mt-1 text-left rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">システム稼働中</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App