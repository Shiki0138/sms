// 20名のテスト顧客データ
export const testCustomers = [
    {
        id: 'test-customer-001',
        customerNumber: 'C001',
        name: '田中 美咲',
        furigana: 'タナカ ミサキ',
        phone: '090-1234-5678',
        email: 'misaki.tanaka@example.com',
        instagramId: 'misaki_hair',
        lineId: 'misaki_tanaka_line',
        birthDate: '1985-03-15',
        gender: 'female',
        address: '東京都渋谷区神宮前1-2-3',
        visitCount: 12,
        totalSpent: 98000,
        lastVisitDate: '2025-06-15T14:00:00+09:00',
        createdAt: '2024-01-15T10:00:00+09:00',
        tags: ['VIP', 'カラー常連', 'Instagram投稿'],
        notes: 'ダメージが気になるとのこと。トリートメントを推奨。'
    },
    {
        id: 'test-customer-002',
        customerNumber: 'C002',
        name: '佐藤 健太',
        furigana: 'サトウ ケンタ',
        phone: '080-2345-6789',
        email: 'kenta.sato@example.com',
        birthDate: '1990-07-22',
        gender: 'male',
        address: '東京都新宿区西新宿2-4-5',
        visitCount: 8,
        totalSpent: 32000,
        lastVisitDate: '2025-06-12T16:30:00+09:00',
        createdAt: '2024-03-10T11:30:00+09:00',
        tags: ['メンズ', '月1回'],
        notes: 'ビジネススタイル希望。短時間で仕上げてほしい。'
    },
    {
        id: 'test-customer-003',
        customerNumber: 'C003',
        name: '山田 花音',
        furigana: 'ヤマダ カノン',
        phone: '070-3456-7890',
        email: 'kanon.yamada@example.com',
        instagramId: 'kanon_beauty',
        birthDate: '1995-11-08',
        gender: 'female',
        address: '東京都港区六本木3-6-7',
        visitCount: 15,
        totalSpent: 145000,
        lastVisitDate: '2025-06-10T13:00:00+09:00',
        createdAt: '2023-09-20T14:15:00+09:00',
        tags: ['VIP', 'トレンドセッター', 'インフルエンサー'],
        notes: '最新トレンドに敏感。SNS投稿を積極的にしてくれる。'
    },
    {
        id: 'test-customer-004',
        customerNumber: 'C004',
        name: '鈴木 麗子',
        furigana: 'スズキ レイコ',
        phone: '090-4567-8901',
        email: 'reiko.suzuki@example.com',
        lineId: 'reiko_suzuki_line',
        birthDate: '1978-01-30',
        gender: 'female',
        address: '東京都世田谷区三軒茶屋4-8-9',
        visitCount: 20,
        totalSpent: 180000,
        lastVisitDate: '2025-06-08T15:30:00+09:00',
        createdAt: '2023-05-12T09:45:00+09:00',
        tags: ['長期顧客', '口コミ', '紹介多数'],
        notes: '美容院の常連。お友達を紹介してくれることが多い。'
    },
    {
        id: 'test-customer-005',
        customerNumber: 'C005',
        name: '高橋 大輔',
        furigana: 'タカハシ ダイスケ',
        phone: '080-5678-9012',
        birthDate: '1982-09-14',
        gender: 'male',
        address: '東京都品川区大崎5-10-11',
        visitCount: 6,
        totalSpent: 21000,
        lastVisitDate: '2025-06-05T18:00:00+09:00',
        createdAt: '2024-12-01T16:20:00+09:00',
        tags: ['新規', 'ビジネスマン'],
        notes: '仕事帰りの利用が多い。平日夜の予約を希望。'
    },
    {
        id: 'test-customer-006',
        customerNumber: 'C006',
        name: '伊藤 さくら',
        furigana: 'イトウ サクラ',
        phone: '070-6789-0123',
        email: 'sakura.ito@example.com',
        instagramId: 'sakura_style',
        birthDate: '1992-04-03',
        gender: 'female',
        address: '東京都中野区中野6-12-13',
        visitCount: 9,
        totalSpent: 67000,
        lastVisitDate: '2025-06-03T11:00:00+09:00',
        createdAt: '2024-06-08T12:30:00+09:00',
        tags: ['カラー専門', '写真映え重視'],
        notes: 'パステルカラーが好み。写真撮影のため色持ちを重視。'
    },
    {
        id: 'test-customer-007',
        customerNumber: 'C007',
        name: '渡辺 康太',
        furigana: 'ワタナベ コウタ',
        phone: '090-7890-1234',
        birthDate: '1988-12-25',
        gender: 'male',
        visitCount: 4,
        totalSpent: 14000,
        lastVisitDate: '2025-05-28T17:30:00+09:00',
        createdAt: '2025-02-14T15:45:00+09:00',
        tags: ['学生', '予算重視'],
        notes: '学生割引を利用。シンプルなスタイルを希望。'
    },
    {
        id: 'test-customer-008',
        customerNumber: 'C008',
        name: '小林 優子',
        furigana: 'コバヤシ ユウコ',
        phone: '080-8901-2345',
        email: 'yuko.kobayashi@example.com',
        lineId: 'yuko_line',
        birthDate: '1975-06-18',
        gender: 'female',
        address: '東京都杉並区荻窪7-14-15',
        visitCount: 25,
        totalSpent: 220000,
        lastVisitDate: '2025-05-25T10:30:00+09:00',
        createdAt: '2022-11-03T13:20:00+09:00',
        tags: ['最長期顧客', 'VIP', '家族利用'],
        notes: '開店当初からの顧客。娘さんも一緒に来店される。'
    },
    {
        id: 'test-customer-009',
        customerNumber: 'C009',
        name: '加藤 雄一',
        furigana: 'カトウ ユウイチ',
        phone: '070-9012-3456',
        birthDate: '1965-10-12',
        gender: 'male',
        address: '東京都練馬区石神井8-16-17',
        visitCount: 18,
        totalSpent: 54000,
        lastVisitDate: '2025-05-20T14:00:00+09:00',
        createdAt: '2023-08-15T11:10:00+09:00',
        tags: ['シニア', '定期カット', '白髪染め'],
        notes: '月1回の定期利用。白髪染めとカットがメイン。'
    },
    {
        id: 'test-customer-010',
        customerNumber: 'C010',
        name: '森田 あゆみ',
        furigana: 'モリタ アユミ',
        phone: '090-0123-4567',
        email: 'ayumi.morita@example.com',
        instagramId: 'ayumi_hair_style',
        birthDate: '1993-02-28',
        gender: 'female',
        address: '東京都台東区浅草9-18-19',
        visitCount: 11,
        totalSpent: 89000,
        lastVisitDate: '2025-05-18T16:00:00+09:00',
        createdAt: '2024-04-22T14:40:00+09:00',
        tags: ['パーマ専門', 'ナチュラル志向'],
        notes: 'ナチュラルなパーマスタイルが好み。ダメージレスを重視。'
    },
    {
        id: 'test-customer-011',
        customerNumber: 'C011',
        name: '中村 拓也',
        furigana: 'ナカムラ タクヤ',
        phone: '080-1234-5678',
        birthDate: '1987-08-05',
        gender: 'male',
        visitCount: 7,
        totalSpent: 28000,
        lastVisitDate: '2025-05-15T19:00:00+09:00',
        createdAt: '2024-10-30T17:25:00+09:00',
        tags: ['夜間利用', 'クリエイティブ'],
        notes: 'デザイナー職。個性的なスタイルを好む。'
    },
    {
        id: 'test-customer-012',
        customerNumber: 'C012',
        name: '斎藤 美穂',
        furigana: 'サイトウ ミホ',
        phone: '070-2345-6789',
        email: 'miho.saito@example.com',
        lineId: 'miho_saito',
        birthDate: '1980-05-17',
        gender: 'female',
        address: '神奈川県横浜市西区みなとみらい1-20-21',
        visitCount: 14,
        totalSpent: 112000,
        lastVisitDate: '2025-05-12T12:30:00+09:00',
        createdAt: '2023-12-18T10:50:00+09:00',
        tags: ['遠方顧客', 'まとめて施術'],
        notes: '横浜から来店。1回で複数メニューを希望。'
    },
    {
        id: 'test-customer-013',
        customerNumber: 'C013',
        name: '松本 誠',
        furigana: 'マツモト マコト',
        phone: '090-3456-7890',
        birthDate: '1991-01-09',
        gender: 'male',
        visitCount: 5,
        totalSpent: 17500,
        lastVisitDate: '2025-05-08T15:45:00+09:00',
        createdAt: '2025-01-20T16:15:00+09:00',
        tags: ['新規', 'カジュアル'],
        notes: 'カジュアルなスタイル希望。手入れが楽なカットを好む。'
    },
    {
        id: 'test-customer-014',
        customerNumber: 'C014',
        name: '木村 恵子',
        furigana: 'キムラ ケイコ',
        phone: '080-4567-8901',
        email: 'keiko.kimura@example.com',
        birthDate: '1983-07-26',
        gender: 'female',
        address: '東京都目黒区自由が丘2-22-23',
        visitCount: 16,
        totalSpent: 128000,
        lastVisitDate: '2025-05-05T13:15:00+09:00',
        createdAt: '2023-07-10T11:40:00+09:00',
        tags: ['ブライダル経験', '特別日利用'],
        notes: '結婚式でヘアセットを担当。記念日などの特別な日に来店。'
    },
    {
        id: 'test-customer-015',
        customerNumber: 'C015',
        name: '橋本 翔太',
        furigana: 'ハシモト ショウタ',
        phone: '070-5678-9012',
        birthDate: '1996-11-11',
        gender: 'male',
        visitCount: 3,
        totalSpent: 10500,
        lastVisitDate: '2025-05-02T18:30:00+09:00',
        createdAt: '2025-03-05T19:20:00+09:00',
        tags: ['若年層', 'トレンド重視'],
        notes: '最新のトレンドスタイルに興味あり。SNS参考にスタイル決定。'
    },
    {
        id: 'test-customer-016',
        customerNumber: 'C016',
        name: '青木 理沙',
        furigana: 'アオキ リサ',
        phone: '090-6789-0123',
        email: 'risa.aoki@example.com',
        instagramId: 'risa_beauty_life',
        birthDate: '1989-09-03',
        gender: 'female',
        address: '東京都豊島区池袋3-24-25',
        visitCount: 13,
        totalSpent: 104000,
        lastVisitDate: '2025-04-28T14:45:00+09:00',
        createdAt: '2024-02-14T12:20:00+09:00',
        tags: ['美容マニア', '新技術好き'],
        notes: '新しい技術や製品に興味深い。美容情報に詳しい。'
    },
    {
        id: 'test-customer-017',
        customerNumber: 'C017',
        name: '石井 浩二',
        furigana: 'イシイ コウジ',
        phone: '080-7890-1234',
        birthDate: '1972-04-20',
        gender: 'male',
        visitCount: 22,
        totalSpent: 88000,
        lastVisitDate: '2025-04-25T16:20:00+09:00',
        createdAt: '2022-09-08T14:30:00+09:00',
        tags: ['長期顧客', '管理職', '品質重視'],
        notes: '管理職のため身だしなみに気を使う。品質重視で価格は二の次。'
    },
    {
        id: 'test-customer-018',
        customerNumber: 'C018',
        name: '村上 千佳',
        furigana: 'ムラカミ チカ',
        phone: '070-8901-2345',
        email: 'chika.murakami@example.com',
        lineId: 'chika_mura',
        birthDate: '1994-12-07',
        gender: 'female',
        address: '東京都文京区本郷4-26-27',
        visitCount: 8,
        totalSpent: 64000,
        lastVisitDate: '2025-04-22T11:30:00+09:00',
        createdAt: '2024-08-12T13:45:00+09:00',
        tags: ['大学生', '就活準備'],
        notes: '大学生。就職活動に向けてスタイルチェンジ希望。'
    },
    {
        id: 'test-customer-019',
        customerNumber: 'C019',
        name: '福田 明',
        furigana: 'フクダ アキラ',
        phone: '090-9012-3456',
        birthDate: '1986-06-13',
        gender: 'male',
        visitCount: 10,
        totalSpent: 40000,
        lastVisitDate: '2025-04-18T17:00:00+09:00',
        createdAt: '2024-05-25T15:10:00+09:00',
        tags: ['定期利用', '時短希望'],
        notes: '忙しいため短時間での施術を希望。効率重視。'
    },
    {
        id: 'test-customer-020',
        customerNumber: 'C020',
        name: '野口 真由美',
        furigana: 'ノグチ マユミ',
        phone: '080-0123-4567',
        email: 'mayumi.noguchi@example.com',
        instagramId: 'mayumi_style_diary',
        birthDate: '1977-08-30',
        gender: 'female',
        address: '東京都江戸川区葛西5-28-29',
        visitCount: 19,
        totalSpent: 152000,
        lastVisitDate: '2025-04-15T10:00:00+09:00',
        createdAt: '2023-03-20T09:30:00+09:00',
        tags: ['ママ友グループ', '口コミ拡散'],
        notes: 'ママ友グループのリーダー的存在。口コミ効果が高い。'
    }
];
// テスト予約データ
export const testReservations = [
    {
        id: 'test-reservation-001',
        customerId: 'test-customer-001',
        customerName: '田中 美咲',
        startTime: '2025-06-20T10:00:00+09:00',
        endTime: '2025-06-20T12:00:00+09:00',
        menuContent: 'カット + イルミナカラー',
        staffId: 'staff-001',
        staffName: '佐藤 麗子',
        status: 'confirmed',
        price: 14000,
        notes: 'いつものようにトーンダウンで',
        source: 'line'
    },
    {
        id: 'test-reservation-002',
        customerId: 'test-customer-002',
        customerName: '佐藤 健太',
        startTime: '2025-06-20T14:30:00+09:00',
        endTime: '2025-06-20T15:15:00+09:00',
        menuContent: 'メンズカット',
        staffId: 'staff-002',
        staffName: '田中 美咲',
        status: 'confirmed',
        price: 3500,
        source: 'phone'
    },
    {
        id: 'test-reservation-003',
        customerId: 'test-customer-003',
        customerName: '山田 花音',
        startTime: '2025-06-21T13:00:00+09:00',
        endTime: '2025-06-21T16:30:00+09:00',
        menuContent: 'カット + グラデーションカラー + トリートメント',
        staffId: 'staff-001',
        staffName: '佐藤 麗子',
        status: 'confirmed',
        price: 23000,
        notes: 'Instagram投稿用の写真撮影希望',
        source: 'instagram'
    },
    {
        id: 'test-reservation-004',
        customerId: 'test-customer-004',
        customerName: '鈴木 麗子',
        startTime: '2025-06-22T15:30:00+09:00',
        endTime: '2025-06-22T17:30:00+09:00',
        menuContent: 'カット + デジタルパーマ',
        staffId: 'staff-003',
        staffName: '山田 花音',
        status: 'tentative',
        price: 16500,
        source: 'web'
    },
    {
        id: 'test-reservation-005',
        customerId: 'test-customer-005',
        customerName: '高橋 大輔',
        startTime: '2025-06-23T18:00:00+09:00',
        endTime: '2025-06-23T18:45:00+09:00',
        menuContent: 'メンズカット + シェービング',
        staffId: 'staff-002',
        staffName: '田中 美咲',
        status: 'confirmed',
        price: 6000,
        source: 'phone'
    }
];
// テストメッセージデータ
export const testMessages = [
    {
        id: 'test-message-001',
        customerId: 'test-customer-001',
        customerName: '田中 美咲',
        channel: 'line',
        content: '明日の予約の件ですが、少し時間を変更できますか？',
        direction: 'incoming',
        timestamp: '2025-06-19T09:30:00+09:00',
        status: 'unread'
    },
    {
        id: 'test-message-002',
        customerId: 'test-customer-003',
        customerName: '山田 花音',
        channel: 'instagram',
        content: '新しいトレンドカラーについて相談したいです！',
        direction: 'incoming',
        timestamp: '2025-06-19T11:15:00+09:00',
        status: 'read'
    },
    {
        id: 'test-message-003',
        customerId: 'test-customer-002',
        customerName: '佐藤 健太',
        channel: 'line',
        content: '来週の予約を取りたいのですが、空いている日はありますか？',
        direction: 'incoming',
        timestamp: '2025-06-19T14:20:00+09:00',
        status: 'replied'
    },
    {
        id: 'test-message-004',
        customerId: 'test-customer-006',
        customerName: '伊藤 さくら',
        channel: 'instagram',
        content: 'パステルピンクのカラーはできますか？',
        direction: 'incoming',
        timestamp: '2025-06-19T16:45:00+09:00',
        status: 'unread'
    },
    {
        id: 'test-message-005',
        customerId: 'test-customer-012',
        customerName: '斎藤 美穂',
        channel: 'line',
        content: 'ありがとうございました！次回もよろしくお願いします。',
        direction: 'incoming',
        timestamp: '2025-06-19T18:30:00+09:00',
        status: 'read'
    }
];
// テストスタッフデータ
export const testStaff = [
    {
        id: 'staff-001',
        name: '佐藤 麗子',
        furigana: 'サトウ レイコ',
        position: 'スタイリスト',
        specialties: ['カラー', 'トリートメント', 'ヘッドスパ'],
        workSchedule: {
            monday: { start: '10:00', end: '19:00', available: false },
            tuesday: { start: '10:00', end: '19:00', available: true },
            wednesday: { start: '10:00', end: '19:00', available: true },
            thursday: { start: '10:00', end: '19:00', available: true },
            friday: { start: '10:00', end: '20:00', available: true },
            saturday: { start: '09:00', end: '19:00', available: true },
            sunday: { start: '09:00', end: '18:00', available: true }
        },
        contactInfo: {
            phone: '090-1111-2222',
            email: 'reiko.sato@salon.com'
        },
        joinDate: '2020-04-01',
        performance: {
            monthlyRevenue: 450000,
            customerSatisfaction: 4.8,
            repeatCustomerRate: 85
        }
    },
    {
        id: 'staff-002',
        name: '田中 美咲',
        furigana: 'タナカ ミサキ',
        position: 'スタイリスト',
        specialties: ['カット', 'メンズスタイル', 'ショートヘア'],
        workSchedule: {
            monday: { start: '09:00', end: '18:00', available: true },
            tuesday: { start: '09:00', end: '18:00', available: true },
            wednesday: { start: '09:00', end: '18:00', available: false },
            thursday: { start: '09:00', end: '18:00', available: true },
            friday: { start: '09:00', end: '19:00', available: true },
            saturday: { start: '08:30', end: '18:00', available: true },
            sunday: { start: '08:30', end: '17:00', available: true }
        },
        contactInfo: {
            phone: '080-3333-4444',
            email: 'misaki.tanaka@salon.com'
        },
        joinDate: '2019-06-15',
        performance: {
            monthlyRevenue: 380000,
            customerSatisfaction: 4.7,
            repeatCustomerRate: 78
        }
    },
    {
        id: 'staff-003',
        name: '山田 花音',
        furigana: 'ヤマダ カノン',
        position: 'アシスタント',
        specialties: ['パーマ', 'ヘッドスパ', 'シャンプー'],
        workSchedule: {
            monday: { start: '10:00', end: '19:00', available: true },
            tuesday: { start: '10:00', end: '19:00', available: true },
            wednesday: { start: '10:00', end: '19:00', available: true },
            thursday: { start: '10:00', end: '19:00', available: true },
            friday: { start: '10:00', end: '20:00', available: true },
            saturday: { start: '09:00', end: '19:00', available: false },
            sunday: { start: '09:00', end: '18:00', available: true }
        },
        contactInfo: {
            phone: '070-5555-6666',
            email: 'kanon.yamada@salon.com'
        },
        joinDate: '2023-03-01',
        performance: {
            monthlyRevenue: 180000,
            customerSatisfaction: 4.5,
            repeatCustomerRate: 65
        }
    }
];
// API接続確認用ダミーレスポンス
export const apiTestResponses = {
    line: {
        connection: { status: 'success', message: 'LINE APIに正常に接続できました' },
        send: { status: 'test', message: 'テストモードのため実際には送信されません' },
        receive: { status: 'success', messages: testMessages.filter(m => m.channel === 'line') }
    },
    instagram: {
        connection: { status: 'success', message: 'Instagram APIに正常に接続できました' },
        send: { status: 'test', message: 'テストモードのため実際には送信されません' },
        receive: { status: 'success', messages: testMessages.filter(m => m.channel === 'instagram') }
    },
    email: {
        connection: { status: 'success', message: 'SMTPサーバーに正常に接続できました' },
        send: { status: 'test', message: 'テストモードのため実際には送信されません' }
    },
    google: {
        connection: { status: 'success', message: 'Google Calendar APIに正常に接続できました' },
        sync: { status: 'success', events: testReservations.length, message: `${testReservations.length}件の予約を同期しました` }
    },
    stripe: {
        connection: { status: 'success', message: 'Stripe APIに正常に接続できました' },
        test: { status: 'success', message: 'テスト決済が正常に動作します' }
    }
};
// 初期設定用サンプルデータパック
export const initialSetupData = {
    customers: testCustomers.slice(0, 10), // 最初は10名から開始
    reservations: testReservations,
    messages: testMessages,
    staff: testStaff,
    settings: {
        salonInfo: {
            name: 'Hair Studio TOKYO（テスト店）',
            description: 'テストユーザー用のサンプル美容室です',
            address: '東京都渋谷区神宮前1-1-1 テストビル2F',
            phone: '03-0000-0000',
            email: 'test@salon-test.com'
        },
        businessHours: {
            monday: { open: '10:00', close: '19:00', closed: true },
            tuesday: { open: '10:00', close: '19:00', closed: false },
            wednesday: { open: '10:00', close: '19:00', closed: false },
            thursday: { open: '10:00', close: '19:00', closed: false },
            friday: { open: '10:00', close: '20:00', closed: false },
            saturday: { open: '09:00', close: '19:00', closed: false },
            sunday: { open: '09:00', close: '18:00', closed: false }
        },
        testMode: true,
        apiRestrictions: {
            allowExternalSend: false,
            logAllRequests: true,
            testModeOnly: true
        }
    }
};
