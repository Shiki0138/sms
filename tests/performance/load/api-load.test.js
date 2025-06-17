const Artillery = require('artillery');

// 美容室管理システム API負荷テスト設定
module.exports = {
  config: {
    target: 'http://localhost:4002',
    phases: [
      // ウォームアップフェーズ
      {
        duration: 60,  // 60秒
        arrivalRate: 5, // 1秒あたり5ユーザー
        name: 'ウォームアップ'
      },
      // 通常負荷フェーズ
      {
        duration: 120, // 120秒
        arrivalRate: 20, // 1秒あたり20ユーザー
        name: '通常負荷'
      },
      // 高負荷フェーズ
      {
        duration: 180, // 180秒
        arrivalRate: 50, // 1秒あたり50ユーザー
        name: '高負荷'
      },
      // ピーク負荷フェーズ
      {
        duration: 60,  // 60秒
        arrivalRate: 100, // 1秒あたり100ユーザー
        name: 'ピーク負荷'
      },
      // クールダウンフェーズ
      {
        duration: 60,  // 60秒
        arrivalRate: 10, // 1秒あたり10ユーザー
        name: 'クールダウン'
      }
    ],
    defaults: {
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'load-test-tenant'
      }
    },
    // パフォーマンス目標値
    ensure: {
      'http.response_time.p95': 100, // 95%タイルが100ms以下
      'http.response_time.p99': 200, // 99%タイルが200ms以下
      'http.request_rate': "> 50",   // 50req/s以上
      'http.codes.200': "> 99"       // 成功率99%以上
    },
    // プラグイン設定
    plugins: {
      expect: {},
      metrics: {
        prometheus: {
          enabled: true,
          port: 9090
        }
      }
    }
  },
  
  scenarios: [
    // シナリオ1: ダッシュボードKPI取得
    {
      name: 'ダッシュボードKPI取得',
      weight: 30, // 全リクエストの30%
      flow: [
        {
          get: {
            url: '/api/v1/analytics/dashboard-kpis',
            expect: [
              { statusCode: 200 },
              { hasProperty: 'data.revenue' },
              { hasProperty: 'data.customers' },
              { hasProperty: 'data.reservations' }
            ],
            capture: [
              {
                json: '$.data.revenue.thisMonth',
                as: 'currentRevenue'
              }
            ]
          }
        }
      ]
    },

    // シナリオ2: 顧客一覧取得
    {
      name: '顧客一覧取得',
      weight: 25, // 全リクエストの25%
      flow: [
        {
          get: {
            url: '/api/v1/customers',
            qs: {
              page: 1,
              limit: 20,
              sortBy: 'lastVisitDate',
              sortOrder: 'desc'
            },
            expect: [
              { statusCode: 200 },
              { hasProperty: 'data' },
              { hasProperty: 'pagination' }
            ]
          }
        }
      ]
    },

    // シナリオ3: 予約一覧取得
    {
      name: '予約一覧取得',
      weight: 20, // 全リクエストの20%
      flow: [
        {
          get: {
            url: '/api/v1/reservations',
            qs: {
              date: '{{ $date() }}',
              status: 'CONFIRMED'
            },
            expect: [
              { statusCode: 200 },
              { hasProperty: 'data' }
            ]
          }
        }
      ]
    },

    // シナリオ4: メッセージ取得
    {
      name: 'メッセージ取得',
      weight: 15, // 全リクエストの15%
      flow: [
        {
          get: {
            url: '/api/v1/messages',
            qs: {
              channel: 'LINE',
              status: 'UNREAD'
            },
            expect: [
              { statusCode: 200 },
              { hasProperty: 'data' }
            ]
          }
        }
      ]
    },

    // シナリオ5: 新規予約作成（書き込み処理）
    {
      name: '新規予約作成',
      weight: 10, // 全リクエストの10%
      flow: [
        {
          post: {
            url: '/api/v1/reservations',
            json: {
              customerId: '{{ customerId() }}',
              staffId: '{{ staffId() }}',
              startTime: '{{ $date() }}',
              endTime: '{{ $date() }}',
              menuIds: ['{{ menuId() }}'],
              notes: 'Load test reservation'
            },
            expect: [
              { statusCode: [200, 201] },
              { hasProperty: 'data.id' }
            ],
            capture: [
              {
                json: '$.data.id',
                as: 'reservationId'
              }
            ]
          }
        }
      ]
    },

    // シナリオ6: 複合ワークフロー（認証→ダッシュボード→詳細確認）
    {
      name: '複合ワークフロー',
      weight: 10, // 全リクエストの10%
      flow: [
        // 1. 認証
        {
          post: {
            url: '/api/v1/auth/login',
            json: {
              email: 'loadtest@example.com',
              password: 'loadtest123'
            },
            expect: [
              { statusCode: 200 },
              { hasProperty: 'token' }
            ],
            capture: [
              {
                json: '$.token',
                as: 'authToken'
              }
            ]
          }
        },
        // 2. ダッシュボードKPI取得
        {
          get: {
            url: '/api/v1/analytics/dashboard-kpis',
            headers: {
              'Authorization': 'Bearer {{ authToken }}'
            },
            expect: [
              { statusCode: 200 }
            ]
          }
        },
        // 3. 顧客詳細取得
        {
          get: {
            url: '/api/v1/customers/{{ customerId() }}',
            headers: {
              'Authorization': 'Bearer {{ authToken }}'
            },
            expect: [
              { statusCode: 200 },
              { hasProperty: 'data.id' }
            ]
          }
        },
        // 4. 顧客インサイト取得
        {
          get: {
            url: '/api/v1/analytics/customers/{{ customerId() }}/insights',
            headers: {
              'Authorization': 'Bearer {{ authToken }}'
            },
            expect: [
              { statusCode: 200 },
              { hasProperty: 'data.customerProfile' }
            ]
          }
        }
      ]
    },

    // シナリオ7: AI分析機能負荷テスト
    {
      name: 'AI分析機能',
      weight: 5, // 全リクエストの5%
      flow: [
        // 売上予測
        {
          get: {
            url: '/api/v1/analytics/revenue-forecast',
            expect: [
              { statusCode: 200 },
              { hasProperty: 'data.nextMonth' }
            ]
          }
        },
        // 離脱分析
        {
          get: {
            url: '/api/v1/analytics/churn-analysis',
            expect: [
              { statusCode: 200 },
              { hasProperty: 'data.highRiskCustomers' }
            ]
          }
        },
        // 最適化提案
        {
          get: {
            url: '/api/v1/analytics/optimization-suggestions',
            expect: [
              { statusCode: 200 },
              { hasProperty: 'data.suggestions' }
            ]
          }
        }
      ]
    }
  ]
};

// カスタム関数定義
Artillery.util.template.addFunction('customerId', () => {
  const customerIds = [
    'customer-001', 'customer-002', 'customer-003',
    'customer-004', 'customer-005', 'customer-006',
    'customer-007', 'customer-008', 'customer-009', 'customer-010'
  ];
  return customerIds[Math.floor(Math.random() * customerIds.length)];
});

Artillery.util.template.addFunction('staffId', () => {
  const staffIds = [
    'staff-001', 'staff-002', 'staff-003', 'staff-004', 'staff-005'
  ];
  return staffIds[Math.floor(Math.random() * staffIds.length)];
});

Artillery.util.template.addFunction('menuId', () => {
  const menuIds = [
    'menu-001', 'menu-002', 'menu-003', 'menu-004', 'menu-005'
  ];
  return menuIds[Math.floor(Math.random() * menuIds.length)];
});

Artillery.util.template.addFunction('date', () => {
  const now = new Date();
  const future = new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000); // 7日以内
  return future.toISOString();
});