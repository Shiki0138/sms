const express = require('express');
const cors = require('cors');

const app = express();
const port = 8080;

// CORS設定
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4003'],
  credentials: true
}));

app.use(express.json());

// ダミーデータ
const dummyData = {
  customers: [
    {
      id: '1',
      name: '田中花子',
      phone: '090-1234-5678',
      email: 'hanako@example.com',
      instagramId: 'hanako_tanaka',
      lineId: 'hanako_line',
      visitCount: 5,
      lastVisitDate: '2024-11-15T10:00:00Z',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: '佐藤美咲',
      phone: '080-9876-5432',
      email: 'misaki@example.com',
      instagramId: 'misaki_beauty',
      lineId: null,
      visitCount: 12,
      lastVisitDate: '2024-12-01T14:30:00Z',
      createdAt: '2023-08-20T09:15:00Z'
    },
    {
      id: '3',
      name: '山田麗子',
      phone: '070-5555-1234',
      email: null,
      instagramId: null,
      lineId: 'reiko_yamada',
      visitCount: 3,
      lastVisitDate: '2024-10-20T16:00:00Z',
      createdAt: '2024-03-10T11:30:00Z'
    }
  ],
  threads: [
    {
      id: '1',
      customer: {
        id: '1',
        name: '田中花子',
        instagramId: 'hanako_tanaka',
        lineId: 'hanako_line'
      },
      channel: 'INSTAGRAM',
      status: 'OPEN',
      assignedStaff: {
        id: '1',
        name: '山田スタイリスト'
      },
      lastMessage: {
        content: '次回の予約を相談したいのですが、来週の金曜日は空いていますか？',
        createdAt: '2024-12-13T09:30:00Z',
        senderType: 'CUSTOMER'
      },
      unreadCount: 1,
      updatedAt: '2024-12-13T09:30:00Z'
    },
    {
      id: '2',
      customer: {
        id: '2',
        name: '佐藤美咲',
        instagramId: 'misaki_beauty',
        lineId: null
      },
      channel: 'INSTAGRAM',
      status: 'IN_PROGRESS',
      assignedStaff: {
        id: '2',
        name: '鈴木マネージャー'
      },
      lastMessage: {
        content: 'ありがとうございます。では12月20日14時でお待ちしております。',
        createdAt: '2024-12-12T16:45:00Z',
        senderType: 'STAFF'
      },
      unreadCount: 0,
      updatedAt: '2024-12-12T16:45:00Z'
    },
    {
      id: '3',
      customer: {
        id: '3',
        name: '山田麗子',
        instagramId: null,
        lineId: 'reiko_yamada'
      },
      channel: 'LINE',
      status: 'CLOSED',
      assignedStaff: {
        id: '1',
        name: '山田スタイリスト'
      },
      lastMessage: {
        content: 'ありがとうございました。次回もよろしくお願いします！',
        createdAt: '2024-12-10T18:00:00Z',
        senderType: 'CUSTOMER'
      },
      unreadCount: 0,
      updatedAt: '2024-12-10T18:00:00Z'
    }
  ],
  reservations: [
    {
      id: '1',
      startTime: '2024-12-13T10:00:00Z',
      endTime: '2024-12-13T12:00:00Z',
      menuContent: 'カット + カラー',
      customerName: '田中花子',
      customer: {
        id: '1',
        name: '田中花子',
        phone: '090-1234-5678'
      },
      staff: {
        id: '1',
        name: '山田スタイリスト'
      },
      source: 'HOTPEPPER',
      status: 'CONFIRMED',
      notes: 'ブラウン系希望'
    },
    {
      id: '2',
      startTime: '2024-12-14T14:00:00Z',
      endTime: '2024-12-14T16:30:00Z',
      menuContent: 'カット + パーマ',
      customerName: '佐藤美咲',
      customer: {
        id: '2',
        name: '佐藤美咲',
        phone: '080-9876-5432'
      },
      staff: {
        id: '2',
        name: '鈴木マネージャー'
      },
      source: 'INSTAGRAM',
      status: 'CONFIRMED',
      notes: 'ゆるふわパーマ希望'
    },
    {
      id: '3',
      startTime: '2024-12-15T16:00:00Z',
      endTime: '2024-12-15T17:00:00Z',
      menuContent: 'カット',
      customerName: '山田麗子',
      customer: {
        id: '3',
        name: '山田麗子',
        phone: '070-5555-1234'
      },
      staff: {
        id: '1',
        name: '山田スタイリスト'
      },
      source: 'LINE',
      status: 'TENTATIVE',
      notes: '前髪カット中心'
    }
  ]
};

// ヘルスチェック
app.get('/health', (req, res) => {
  console.log('Health check accessed');
  res.json({
    status: 'OK',
    message: '美容室管理システムAPI - 正常動作中',
    timestamp: new Date().toISOString(),
    port: port
  });
});

// メッセージスレッド取得（フィルタリング・検索対応）
app.get('/api/v1/messages/threads', (req, res) => {
  console.log('Message threads accessed with filters:', req.query);
  
  let filteredThreads = [...dummyData.threads];
  
  // 検索キーワードでフィルタリング
  if (req.query.search) {
    const searchTerm = req.query.search.toLowerCase();
    filteredThreads = filteredThreads.filter(thread => 
      thread.customer.name.toLowerCase().includes(searchTerm) ||
      thread.lastMessage.content.toLowerCase().includes(searchTerm) ||
      (thread.assignedStaff?.name.toLowerCase().includes(searchTerm))
    );
  }
  
  // ステータスでフィルタリング
  if (req.query.status && req.query.status !== 'all') {
    filteredThreads = filteredThreads.filter(thread => 
      thread.status === req.query.status
    );
  }
  
  // チャネルでフィルタリング
  if (req.query.channel && req.query.channel !== 'all') {
    filteredThreads = filteredThreads.filter(thread => 
      thread.channel === req.query.channel
    );
  }
  
  // 担当者でフィルタリング
  if (req.query.assignedStaff && req.query.assignedStaff !== 'all') {
    filteredThreads = filteredThreads.filter(thread => 
      thread.assignedStaff?.id === req.query.assignedStaff
    );
  }
  
  // 未読のみフィルタリング
  if (req.query.unreadOnly === 'true') {
    filteredThreads = filteredThreads.filter(thread => 
      thread.unreadCount > 0
    );
  }
  
  // 日付範囲でフィルタリング
  if (req.query.dateFrom || req.query.dateTo) {
    const fromDate = req.query.dateFrom ? new Date(req.query.dateFrom) : new Date('2020-01-01');
    const toDate = req.query.dateTo ? new Date(req.query.dateTo + 'T23:59:59') : new Date();
    
    filteredThreads = filteredThreads.filter(thread => {
      const threadDate = new Date(thread.updatedAt);
      return threadDate >= fromDate && threadDate <= toDate;
    });
  }
  
  // ソート
  const sortBy = req.query.sortBy || 'updatedAt';
  const sortOrder = req.query.sortOrder || 'desc';
  
  filteredThreads.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'customerName':
        aValue = a.customer.name;
        bValue = b.customer.name;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'unreadCount':
        aValue = a.unreadCount;
        bValue = b.unreadCount;
        break;
      default: // updatedAt
        aValue = new Date(a.updatedAt);
        bValue = new Date(b.updatedAt);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  // ページネーション
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedThreads = filteredThreads.slice(startIndex, endIndex);
  
  res.json({
    threads: paginatedThreads,
    pagination: {
      total: filteredThreads.length,
      page,
      limit,
      totalPages: Math.ceil(filteredThreads.length / limit)
    },
    filters: {
      search: req.query.search || '',
      status: req.query.status || 'all',
      channel: req.query.channel || 'all',
      assignedStaff: req.query.assignedStaff || 'all',
      unreadOnly: req.query.unreadOnly === 'true',
      dateFrom: req.query.dateFrom || '',
      dateTo: req.query.dateTo || '',
      sortBy,
      sortOrder
    }
  });
});

// 顧客一覧取得
app.get('/api/v1/customers', (req, res) => {
  console.log('Customers accessed');
  res.json({
    customers: dummyData.customers
  });
});

// 予約一覧取得
app.get('/api/v1/reservations', (req, res) => {
  console.log('Reservations accessed');
  res.json({
    reservations: dummyData.reservations
  });
});

// メッセージ送信
app.post('/api/v1/messages/send', (req, res) => {
  console.log('Send message:', req.body);
  const { threadId, content, mediaType } = req.body;
  
  // ダミーレスポンス
  res.json({
    success: true,
    message: 'メッセージが送信されました',
    data: {
      id: Date.now().toString(),
      threadId,
      content,
      mediaType,
      senderType: 'STAFF',
      createdAt: new Date().toISOString()
    }
  });
});

// テストAPI
app.get('/api/v1/test', (req, res) => {
  console.log('Test API accessed');
  res.json({
    success: true,
    message: 'APIテスト成功',
    data: {
      system: '美容室統合管理システム',
      version: '1.0.0',
      features: ['メッセージ管理', '予約システム', '顧客管理']
    }
  });
});

// 顧客セグメンテーション（RFM分析）
app.get('/api/v1/analytics/segments', (req, res) => {
  console.log('Customer segments accessed');
  
  // RFM分析によるセグメント
  const segments = {
    champions: {
      name: 'チャンピオン',
      description: '最近来店・高頻度・高単価',
      customers: ['1'], // 田中花子
      count: 1,
      avgValue: 15000
    },
    loyalCustomers: {
      name: 'ロイヤル顧客',
      description: '定期的に来店・安定した売上',
      customers: ['2'], // 佐藤美咲
      count: 1,
      avgValue: 12000
    },
    potentialLoyalists: {
      name: '潜在的ロイヤル顧客',
      description: '最近来店開始・成長の可能性',
      customers: ['3'], // 山田麗子
      count: 1,
      avgValue: 8000
    },
    atRisk: {
      name: '離脱リスク顧客',
      description: '以前は常連・最近来店なし',
      customers: [],
      count: 0,
      avgValue: 0
    },
    cannotLose: {
      name: '失ってはいけない顧客',
      description: '高価値だが最近来店なし',
      customers: [],
      count: 0,
      avgValue: 0
    }
  };
  
  res.json({
    segments,
    totalCustomers: dummyData.customers.length,
    analysisDate: new Date().toISOString()
  });
});

// メニュー管理
app.get('/api/v1/menus', (req, res) => {
  console.log('Menus accessed');
  
  const menus = [
    {
      id: '1',
      category: 'カット',
      name: 'カット',
      price: 4500,
      duration: 60,
      description: 'シャンプー・ブロー込み'
    },
    {
      id: '2',
      category: 'カラー',
      name: 'フルカラー',
      price: 8000,
      duration: 120,
      description: 'リタッチ＋全体カラー'
    },
    {
      id: '3',
      category: 'パーマ',
      name: 'デジタルパーマ',
      price: 12000,
      duration: 150,
      description: 'トリートメント付き'
    },
    {
      id: '4',
      category: 'トリートメント',
      name: 'プレミアムトリートメント',
      price: 5000,
      duration: 30,
      description: '髪質改善トリートメント'
    }
  ];
  
  res.json({ menus });
});

// AIメニューレコメンド
app.get('/api/v1/menus/recommendations/:customerId', (req, res) => {
  const { customerId } = req.params;
  console.log('Menu recommendations for customer:', customerId);
  
  // カスタマーIDに基づいたダミーレコメンド
  const recommendations = {
    '1': [ // 田中花子
      {
        menuId: '2',
        reason: '前回から2ヶ月経過。カラーリタッチがおすすめ',
        score: 0.95
      },
      {
        menuId: '4',
        reason: 'カラー後のケアにトリートメントを',
        score: 0.85
      }
    ],
    '2': [ // 佐藤美咲
      {
        menuId: '3',
        reason: '季節の変わり目。イメージチェンジにパーマはいかが？',
        score: 0.88
      }
    ],
    '3': [ // 山田麗子
      {
        menuId: '1',
        reason: '前回から1ヶ月。カットの時期です',
        score: 0.92
      }
    ]
  };
  
  res.json({
    customerId,
    recommendations: recommendations[customerId] || [],
    generatedAt: new Date().toISOString()
  });
});

// 自動メッセージテンプレート
app.get('/api/v1/auto-messages/templates', (req, res) => {
  console.log('Auto message templates accessed');
  
  const templates = [
    {
      id: '1',
      name: '予約リマインダー（1週間前）',
      trigger: 'RESERVATION_REMINDER_7D',
      channel: 'ALL',
      content: '{{customer.name}}様\n\n来週{{reservation.date}}のご予約をお待ちしております。\n変更等ございましたらお早めにご連絡ください。',
      enabled: true
    },
    {
      id: '2',
      name: '来店後フォローアップ',
      trigger: 'AFTER_VISIT',
      channel: 'ALL',
      content: '{{customer.name}}様\n\n本日はご来店ありがとうございました。\n仕上がりはいかがでしょうか？\n次回のご予約もお待ちしております。',
      enabled: true
    },
    {
      id: '3',
      name: '誕生日メッセージ',
      trigger: 'BIRTHDAY',
      channel: 'ALL',
      content: '{{customer.name}}様\n\nお誕生日おめでとうございます！🎉\n今月ご来店で20%OFFクーポンをプレゼント。',
      enabled: true
    }
  ];
  
  res.json({ templates });
});

// AI返信提案機能
app.post('/api/v1/messages/ai-reply-suggestions', (req, res) => {
  const { threadId, messageContent, customerContext } = req.body;
  console.log('AI reply suggestions requested for thread:', threadId);
  
  // メッセージ内容に基づくAI返信提案（ダミー実装）
  const generateReplySuggestions = (content, context) => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('予約') && lowerContent.includes('したい')) {
      return [
        {
          id: '1',
          text: 'ご予約ありがとうございます。ご希望のお日にちはございますでしょうか？',
          tone: 'formal',
          category: 'reservation'
        },
        {
          id: '2', 
          text: 'いつもありがとうございます！ご都合の良いお日にちをお教えください✨',
          tone: 'friendly',
          category: 'reservation'
        },
        {
          id: '3',
          text: `${context?.customerName || 'お客様'}、お疲れ様です。カレンダーを確認いたしますので、第1〜3希望日をお教えください。`,
          tone: 'professional',
          category: 'reservation'
        }
      ];
    } else if (lowerContent.includes('キャンセル')) {
      return [
        {
          id: '1',
          text: '承知いたしました。キャンセル処理をさせていただきます。またのご利用をお待ちしております。',
          tone: 'formal',
          category: 'cancellation'
        },
        {
          id: '2',
          text: 'かしこまりました。またお時間ができましたらお気軽にご連絡ください！',
          tone: 'friendly', 
          category: 'cancellation'
        },
        {
          id: '3',
          text: 'キャンセル承りました。何かご不明な点がございましたらお聞かせください。',
          tone: 'professional',
          category: 'cancellation'
        }
      ];
    } else if (lowerContent.includes('金曜日') || lowerContent.includes('空いて')) {
      return [
        {
          id: '1',
          text: '金曜日でしたら、14:00〜、16:00〜が空いております。いかがでしょうか？',
          tone: 'formal',
          category: 'availability'
        },
        {
          id: '2',
          text: '金曜日空いてます！14時か16時はどうですか？お待ちしております😊',
          tone: 'friendly',
          category: 'availability' 
        },
        {
          id: '3',
          text: '金曜日の空き状況を確認いたします。14:00-15:30、16:00-17:30でご都合はいかがでしょうか。',
          tone: 'professional',
          category: 'availability'
        }
      ];
    } else {
      return [
        {
          id: '1',
          text: 'お疲れ様です。承知いたしました。詳細をお聞かせください。',
          tone: 'formal',
          category: 'general'
        },
        {
          id: '2',
          text: 'いつもありがとうございます！お気軽にご相談ください✨',
          tone: 'friendly',
          category: 'general'
        },
        {
          id: '3',
          text: 'ご連絡ありがとうございます。詳しくお聞かせいただけますでしょうか。',
          tone: 'professional',
          category: 'general'
        }
      ];
    }
  };
  
  const suggestions = generateReplySuggestions(messageContent, customerContext);
  
  res.json({
    threadId,
    suggestions,
    metadata: {
      analysisDate: new Date().toISOString(),
      messageAnalysis: {
        intent: messageContent.includes('予約') ? 'reservation' : 
                messageContent.includes('キャンセル') ? 'cancellation' : 'general',
        urgency: messageContent.includes('急ぎ') || messageContent.includes('至急') ? 'high' : 'normal',
        sentiment: 'neutral'
      }
    }
  });
});

// 顧客判定機能
app.post('/api/v1/customers/identify', (req, res) => {
  const { instagramId, lineId, phone, email, name } = req.body;
  console.log('Customer identification requested:', { instagramId, lineId, phone, email, name });
  
  // 既存顧客を検索
  const existingCustomer = dummyData.customers.find(customer => 
    (instagramId && customer.instagramId === instagramId) ||
    (lineId && customer.lineId === lineId) ||
    (phone && customer.phone === phone) ||
    (email && customer.email === email)
  );
  
  if (existingCustomer) {
    res.json({
      isExisting: true,
      customer: existingCustomer,
      matchedBy: instagramId && existingCustomer.instagramId === instagramId ? 'instagram' :
                lineId && existingCustomer.lineId === lineId ? 'line' :
                phone && existingCustomer.phone === phone ? 'phone' : 'email',
      confidence: 'high'
    });
  } else {
    res.json({
      isExisting: false,
      customer: null,
      suggestedCustomerData: {
        name: name || '',
        instagramId: instagramId || null,
        lineId: lineId || null,
        phone: phone || null,
        email: email || null,
        visitCount: 0,
        createdAt: new Date().toISOString()
      }
    });
  }
});

// 新規顧客登録
app.post('/api/v1/customers/register', (req, res) => {
  const { name, phone, email, instagramId, lineId, notes } = req.body;
  console.log('New customer registration:', { name, phone, email, instagramId, lineId });
  
  if (!name) {
    return res.status(400).json({
      error: '顧客名は必須です'
    });
  }
  
  // 重複チェック
  const existingCustomer = dummyData.customers.find(customer => 
    (instagramId && customer.instagramId === instagramId) ||
    (lineId && customer.lineId === lineId) ||
    (phone && customer.phone === phone) ||
    (email && customer.email === email)
  );
  
  if (existingCustomer) {
    return res.status(409).json({
      error: '既に登録済みの顧客です',
      existingCustomer
    });
  }
  
  // 新規顧客作成
  const newCustomer = {
    id: (dummyData.customers.length + 1).toString(),
    name,
    phone: phone || null,
    email: email || null,
    instagramId: instagramId || null,
    lineId: lineId || null,
    visitCount: 0,
    lastVisitDate: null,
    createdAt: new Date().toISOString(),
    notes: notes || null
  };
  
  dummyData.customers.push(newCustomer);
  
  res.status(201).json({
    success: true,
    customer: newCustomer,
    message: '新規顧客を登録しました'
  });
});

// メッセージ詳細・履歴取得
app.get('/api/v1/messages/threads/:threadId/history', (req, res) => {
  const { threadId } = req.params;
  console.log('Message history requested for thread:', threadId);
  
  // ダミーメッセージ履歴データ
  const messageHistory = {
    '1': [
      {
        id: 'm1',
        content: 'こんにちは！次回の予約を相談したいのですが、来週の金曜日は空いていますか？',
        senderType: 'CUSTOMER',
        createdAt: '2024-12-13T09:30:00Z',
        readAt: '2024-12-13T09:31:00Z'
      },
      {
        id: 'm2', 
        content: 'いつもありがとうございます。金曜日でしたら、14:00〜、16:00〜が空いております。',
        senderType: 'STAFF',
        createdAt: '2024-12-13T09:45:00Z',
        readAt: null
      }
    ],
    '2': [
      {
        id: 'm3',
        content: '12月20日14時でお願いします。',
        senderType: 'CUSTOMER', 
        createdAt: '2024-12-12T16:30:00Z',
        readAt: '2024-12-12T16:31:00Z'
      },
      {
        id: 'm4',
        content: 'ありがとうございます。では12月20日14時でお待ちしております。',
        senderType: 'STAFF',
        createdAt: '2024-12-12T16:45:00Z',
        readAt: '2024-12-12T16:46:00Z'
      }
    ],
    '3': [
      {
        id: 'm5',
        content: '今日はありがとうございました。とても満足しています！',
        senderType: 'CUSTOMER',
        createdAt: '2024-12-10T17:45:00Z', 
        readAt: '2024-12-10T17:46:00Z'
      },
      {
        id: 'm6',
        content: 'ありがとうございました。次回もよろしくお願いします！',
        senderType: 'STAFF',
        createdAt: '2024-12-10T18:00:00Z',
        readAt: '2024-12-10T18:01:00Z'
      }
    ]
  };
  
  const messages = messageHistory[threadId] || [];
  
  res.json({
    threadId,
    messages,
    totalCount: messages.length,
    unreadCount: messages.filter(m => m.senderType === 'CUSTOMER' && !m.readAt).length
  });
});

// フィルタリング用メタデータ取得
app.get('/api/v1/messages/filter-metadata', (req, res) => {
  console.log('Filter metadata requested');
  
  // 利用可能なスタッフリスト
  const availableStaff = [
    { id: '1', name: '山田スタイリスト' },
    { id: '2', name: '鈴木マネージャー' },
    { id: '3', name: '田中スタッフ' }
  ];
  
  // ステータス一覧
  const availableStatuses = [
    { value: 'OPEN', label: '未対応', count: dummyData.threads.filter(t => t.status === 'OPEN').length },
    { value: 'IN_PROGRESS', label: '対応中', count: dummyData.threads.filter(t => t.status === 'IN_PROGRESS').length },
    { value: 'CLOSED', label: '完了', count: dummyData.threads.filter(t => t.status === 'CLOSED').length }
  ];
  
  // チャネル一覧
  const availableChannels = [
    { value: 'INSTAGRAM', label: 'Instagram', count: dummyData.threads.filter(t => t.channel === 'INSTAGRAM').length },
    { value: 'LINE', label: 'LINE', count: dummyData.threads.filter(t => t.channel === 'LINE').length }
  ];
  
  // 統計情報
  const stats = {
    total: dummyData.threads.length,
    unread: dummyData.threads.reduce((sum, t) => sum + t.unreadCount, 0),
    todayMessages: dummyData.threads.filter(t => {
      const today = new Date().toDateString();
      const threadDate = new Date(t.updatedAt).toDateString();
      return today === threadDate;
    }).length
  };
  
  res.json({
    staff: availableStaff,
    statuses: availableStatuses,
    channels: availableChannels,
    stats
  });
});

// 人気検索キーワード取得
app.get('/api/v1/messages/popular-searches', (req, res) => {
  console.log('Popular searches requested');
  
  // ダミーの人気検索キーワード
  const popularSearches = [
    { keyword: '予約', count: 15 },
    { keyword: 'キャンセル', count: 8 },
    { keyword: '時間変更', count: 6 },
    { keyword: 'カラー', count: 5 },
    { keyword: '料金', count: 4 }
  ];
  
  res.json({
    searches: popularSearches
  });
});

// 保存済み検索フィルター
app.get('/api/v1/messages/saved-filters', (req, res) => {
  console.log('Saved filters requested');
  
  // ダミーの保存済みフィルター
  const savedFilters = [
    {
      id: '1',
      name: '今日の未対応',
      filters: {
        status: 'OPEN',
        dateFrom: new Date().toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0]
      },
      createdAt: '2024-12-13T09:00:00Z'
    },
    {
      id: '2', 
      name: 'Instagram未読',
      filters: {
        channel: 'INSTAGRAM',
        unreadOnly: true
      },
      createdAt: '2024-12-12T15:30:00Z'
    },
    {
      id: '3',
      name: '山田担当分',
      filters: {
        assignedStaff: '1'
      },
      createdAt: '2024-12-11T10:15:00Z'
    }
  ];
  
  res.json({
    filters: savedFilters
  });
});

// 404ハンドラー
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'エンドポイントが見つかりません',
    path: req.originalUrl
  });
});

app.listen(port, () => {
  console.log('\n🚀 美容室管理システム API サーバー起動');
  console.log(`📍 サーバー: http://localhost:${port}`);
  console.log(`🏥 ヘルスチェック: http://localhost:${port}/health`);
  console.log(`🧪 テストAPI: http://localhost:${port}/api/v1/test`);
  console.log('✨ CORS設定済み - localhost:5173からのアクセス許可\n');
});

module.exports = app;