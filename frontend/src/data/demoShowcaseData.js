"use strict";
// 🌟 明日の美容師向けデモ用データセット
// 作成日: 2025-06-22
// 目的: リアルで魅力的なデモンストレーション用データ
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoShowcaseData = exports.demoReservations = exports.demoSalesSummary = exports.demoMessages = exports.demoServiceHistory = exports.demoCustomers = exports.demoStaff = exports.demoSalonInfo = void 0;
// 🏪 デモ美容室基本情報
exports.demoSalonInfo = {
    id: 'demo-salon-2025',
    name: 'Beauty Salon DEMO',
    nameKana: 'ビューティーサロンデモ',
    address: '東京都渋谷区表参道1-2-3 ビューティービル2F',
    phone: '03-1234-5678',
    email: 'demo@beautysalon-demo.jp',
    website: 'https://beautysalon-demo.jp',
    openHours: '10:00-20:00',
    closedDays: '毎週月曜日',
    seats: 6,
    parkingSpaces: 2,
    description: '最新技術と丁寧な接客で、お客様の「なりたい」を実現します',
    images: [
        '/images/salon-exterior.jpg',
        '/images/salon-interior-1.jpg',
        '/images/salon-interior-2.jpg'
    ],
    features: [
        'カット技術コンテスト優勝スタッフ在籍',
        '完全個室のプライベート空間',
        'オーガニックカラー取り扱い',
        'キッズスペース完備',
        '駐車場2台完備'
    ]
};
// 👨‍💼 デモ用スタッフデータ
exports.demoStaff = [
    {
        id: 'staff-001',
        name: '佐藤 美咲',
        nameKana: 'サトウ ミサキ',
        role: 'スタイリスト',
        experience: 8,
        specialties: ['カット', 'カラー', 'パーマ'],
        introduction: 'お客様一人ひとりの魅力を最大限に引き出すスタイルをご提案します',
        imageUrl: '/images/staff-sato.jpg',
        instagram: '@misaki_beauty',
        workDays: ['火', '水', '木', '金', '土', '日'],
        monthlyRevenue: 850000,
        customerSatisfaction: 4.8,
        repeatRate: 85
    },
    {
        id: 'staff-002',
        name: '田中 健太',
        nameKana: 'タナカ ケンタ',
        role: 'トップスタイリスト',
        experience: 12,
        specialties: ['メンズカット', 'パーマ', 'ヘッドスパ'],
        introduction: 'メンズスタイルのスペシャリスト。ビジネスからカジュアルまで幅広く対応',
        imageUrl: '/images/staff-tanaka.jpg',
        instagram: '@kenta_mens',
        workDays: ['火', '水', '金', '土', '日'],
        monthlyRevenue: 920000,
        customerSatisfaction: 4.9,
        repeatRate: 88
    },
    {
        id: 'staff-003',
        name: '山田 愛子',
        nameKana: 'ヤマダ アイコ',
        role: 'カラーリスト',
        experience: 6,
        specialties: ['カラー', 'ハイライト', 'トリートメント'],
        introduction: '最新のカラー技術でなりたい髪色を実現。ダメージレスな施術を心がけています',
        imageUrl: '/images/staff-yamada.jpg',
        instagram: '@aiko_color',
        workDays: ['水', '木', '金', '土', '日'],
        monthlyRevenue: 680000,
        customerSatisfaction: 4.7,
        repeatRate: 82
    },
    {
        id: 'staff-004',
        name: '鈴木 翔',
        nameKana: 'スズキ ショウ',
        role: 'アシスタント',
        experience: 2,
        specialties: ['シャンプー', 'ヘッドスパ', 'スタイリング'],
        introduction: '心地よいシャンプーとヘッドスパで癒しの時間をご提供します',
        imageUrl: '/images/staff-suzuki.jpg',
        instagram: '@sho_assistant',
        workDays: ['火', '水', '木', '金', '土'],
        monthlyRevenue: 320000,
        customerSatisfaction: 4.6,
        repeatRate: 75
    }
];
// 👥 デモ用顧客データ（多様な顧客層）
exports.demoCustomers = [
    {
        id: 'cust-001',
        name: '山田 花子',
        nameKana: 'ヤマダ ハナコ',
        phone: '090-1234-5678',
        email: 'hanako@example.com',
        gender: '女性',
        birthDate: '1993-04-15',
        address: '東京都渋谷区',
        occupation: 'OL（IT企業勤務）',
        tags: ['月1来店', 'カラー希望', 'トリートメント重視'],
        notes: 'オフィスでも浮かない上品なカラーを希望。髪のダメージを気にしている',
        visitCount: 24,
        totalSpent: 285000,
        lastVisit: '2025-06-15',
        averageSpent: 11875,
        preferredStaff: 'staff-001',
        lineId: 'hanako_line',
        instagramId: '@hanako_daily'
    },
    {
        id: 'cust-002',
        name: '佐藤 美咲',
        nameKana: 'サトウ ミサキ',
        phone: '080-2345-6789',
        email: 'misaki@example.com',
        gender: '女性',
        birthDate: '2002-09-20',
        address: '東京都目黒区',
        occupation: '大学生（美術専攻）',
        tags: ['2ヶ月に1回', '学割利用', 'SNS発信'],
        notes: '個性的なスタイルを好む。Instagram投稿多め。学割必須',
        visitCount: 8,
        totalSpent: 64000,
        lastVisit: '2025-05-28',
        averageSpent: 8000,
        preferredStaff: 'staff-003',
        instagramId: '@misaki_art'
    },
    {
        id: 'cust-003',
        name: '田中 恵美',
        nameKana: 'タナカ メグミ',
        phone: '090-3456-7890',
        email: 'megumi@example.com',
        gender: '女性',
        birthDate: '1982-12-03',
        address: '東京都世田谷区',
        occupation: '主婦（2児の母）',
        tags: ['月2回来店', 'VIP', '白髪染め', 'キッズ同伴'],
        notes: '子供を連れてくることが多い。白髪染めとカットを定期的に',
        visitCount: 48,
        totalSpent: 624000,
        lastVisit: '2025-06-20',
        averageSpent: 13000,
        preferredStaff: 'staff-001',
        lineId: 'megumi_line'
    },
    {
        id: 'cust-004',
        name: '鈴木 愛子',
        nameKana: 'スズキ アイコ',
        phone: '080-4567-8901',
        email: 'aiko@example.com',
        gender: '女性',
        birthDate: '1975-07-22',
        address: '東京都港区',
        occupation: '会社役員',
        tags: ['VIP', '高額利用', '月2-3回', 'プレミアム'],
        notes: 'エグゼクティブ。時間に厳しい。最高級のサービスを求める',
        visitCount: 72,
        totalSpent: 1440000,
        lastVisit: '2025-06-18',
        averageSpent: 20000,
        preferredStaff: 'staff-002',
        lineId: 'aiko_vip'
    },
    {
        id: 'cust-005',
        name: '高橋 ゆり',
        nameKana: 'タカハシ ユリ',
        phone: '090-5678-9012',
        email: 'yuri@example.com',
        gender: '女性',
        birthDate: '1998-02-14',
        address: '東京都渋谷区',
        occupation: 'モデル・インフルエンサー',
        tags: ['インフルエンサー', '撮影多数', '週1来店', 'SNS協力'],
        notes: '撮影前は必ず来店。SNSでの発信力あり。特別対応必要',
        visitCount: 52,
        totalSpent: 780000,
        lastVisit: '2025-06-21',
        averageSpent: 15000,
        preferredStaff: 'staff-003',
        instagramId: '@yuri_model',
        followers: 85000
    },
    {
        id: 'cust-006',
        name: '渡辺 太郎',
        nameKana: 'ワタナベ タロウ',
        phone: '080-6789-0123',
        email: 'taro@example.com',
        gender: '男性',
        birthDate: '1985-11-30',
        address: '東京都新宿区',
        occupation: '銀行員',
        tags: ['月1来店', 'ビジネススタイル', '土日来店'],
        notes: '清潔感重視。土日の午前中希望。カット＋眉カット',
        visitCount: 36,
        totalSpent: 216000,
        lastVisit: '2025-06-08',
        averageSpent: 6000,
        preferredStaff: 'staff-002'
    },
    {
        id: 'cust-007',
        name: '小林 さくら',
        nameKana: 'コバヤシ サクラ',
        phone: '090-7890-1234',
        email: 'sakura@example.com',
        gender: '女性',
        birthDate: '1990-03-25',
        address: '東京都品川区',
        occupation: '看護師',
        tags: ['不定期', 'シフト勤務', 'ショートヘア'],
        notes: 'シフト勤務のため予約変更多め。扱いやすいショートスタイル希望',
        visitCount: 15,
        totalSpent: 120000,
        lastVisit: '2025-05-30',
        averageSpent: 8000,
        preferredStaff: 'staff-001'
    },
    {
        id: 'cust-008',
        name: '伊藤 健一',
        nameKana: 'イトウ ケンイチ',
        phone: '080-8901-2345',
        email: 'kenichi@example.com',
        gender: '男性',
        birthDate: '1970-08-10',
        address: '東京都千代田区',
        occupation: '会社経営者',
        tags: ['VIP', '月2回', 'ヘッドスパ愛好'],
        notes: '多忙。リラクゼーション重視。ヘッドスパは必須',
        visitCount: 60,
        totalSpent: 900000,
        lastVisit: '2025-06-19',
        averageSpent: 15000,
        preferredStaff: 'staff-002',
        lineId: 'kenichi_ceo'
    },
    {
        id: 'cust-009',
        name: '加藤 みどり',
        nameKana: 'カトウ ミドリ',
        phone: '090-9012-3456',
        email: 'midori@example.com',
        gender: '女性',
        birthDate: '1988-06-18',
        address: '東京都杉並区',
        occupation: 'ヨガインストラクター',
        tags: ['オーガニック志向', 'ナチュラル', '2ヶ月に1回'],
        notes: 'ケミカルフリーのメニュー希望。自然派志向',
        visitCount: 12,
        totalSpent: 144000,
        lastVisit: '2025-06-01',
        averageSpent: 12000,
        preferredStaff: 'staff-003'
    },
    {
        id: 'cust-010',
        name: '中村 翔太',
        nameKana: 'ナカムラ ショウタ',
        phone: '080-0123-4567',
        email: 'shota@example.com',
        gender: '男性',
        birthDate: '2000-01-15',
        address: '東京都豊島区',
        occupation: 'YouTuber',
        tags: ['若年層', 'トレンド重視', '撮影利用'],
        notes: '最新トレンドに敏感。動画撮影OK。派手めスタイルOK',
        visitCount: 20,
        totalSpent: 200000,
        lastVisit: '2025-06-12',
        averageSpent: 10000,
        preferredStaff: 'staff-002',
        instagramId: '@shota_style',
        youtubeChannel: 'ショウタのライフスタイル'
    },
    {
        id: 'cust-011',
        name: '松本 由美',
        nameKana: 'マツモト ユミ',
        phone: '090-1234-5679',
        email: 'yumi@example.com',
        gender: '女性',
        birthDate: '1965-09-08',
        address: '東京都文京区',
        occupation: '大学教授',
        tags: ['シニア', 'グレイヘア', '品格重視'],
        notes: '上品なグレイヘアスタイルを維持。月1回の定期メンテナンス',
        visitCount: 84,
        totalSpent: 840000,
        lastVisit: '2025-06-17',
        averageSpent: 10000,
        preferredStaff: 'staff-001'
    },
    {
        id: 'cust-012',
        name: '橋本 蓮',
        nameKana: 'ハシモト レン',
        phone: '080-2345-6790',
        email: 'ren@example.com',
        gender: '男性',
        birthDate: '2005-04-20',
        address: '東京都江東区',
        occupation: '高校生',
        tags: ['学生', '部活', '休日来店'],
        notes: 'サッカー部所属。スポーツに適した短髪スタイル。学割利用',
        visitCount: 6,
        totalSpent: 24000,
        lastVisit: '2025-06-14',
        averageSpent: 4000,
        preferredStaff: 'staff-004'
    },
    {
        id: 'cust-013',
        name: '森田 千尋',
        nameKana: 'モリタ チヒロ',
        phone: '090-3456-7891',
        email: 'chihiro@example.com',
        gender: '女性',
        birthDate: '1995-12-25',
        address: '東京都中野区',
        occupation: 'ウェブデザイナー',
        tags: ['クリエイティブ', '個性派', 'カラーチェンジ'],
        notes: '季節ごとにカラーチェンジ。デザイン性の高いスタイル希望',
        visitCount: 18,
        totalSpent: 270000,
        lastVisit: '2025-06-05',
        averageSpent: 15000,
        preferredStaff: 'staff-003',
        instagramId: '@chihiro_design'
    },
    {
        id: 'cust-014',
        name: '大田 正義',
        nameKana: 'オオタ マサヨシ',
        phone: '080-4567-8902',
        email: 'masayoshi@example.com',
        gender: '男性',
        birthDate: '1978-07-07',
        address: '東京都板橋区',
        occupation: '営業部長',
        tags: ['ビジネス', '白髪染め', '月1来店'],
        notes: '白髪が気になり始めた。自然な仕上がり希望',
        visitCount: 24,
        totalSpent: 192000,
        lastVisit: '2025-06-16',
        averageSpent: 8000,
        preferredStaff: 'staff-002'
    },
    {
        id: 'cust-015',
        name: '石井 絵里',
        nameKana: 'イシイ エリ',
        phone: '090-5678-9013',
        email: 'eri@example.com',
        gender: '女性',
        birthDate: '1992-02-29',
        address: '東京都足立区',
        occupation: '保育士',
        tags: ['扱いやすさ重視', '子供ウケ', '予算重視'],
        notes: '仕事柄、派手すぎないスタイル。手入れが簡単なスタイル希望',
        visitCount: 16,
        totalSpent: 112000,
        lastVisit: '2025-06-11',
        averageSpent: 7000,
        preferredStaff: 'staff-001'
    },
    {
        id: 'cust-016',
        name: '西村 康平',
        nameKana: 'ニシムラ コウヘイ',
        phone: '080-6789-0124',
        email: 'kohei@example.com',
        gender: '男性',
        birthDate: '1986-10-10',
        address: '東京都練馬区',
        occupation: 'エンジニア',
        tags: ['リモートワーク', '不定期', 'カジュアル'],
        notes: 'リモートワーク中心。Web会議映えするスタイル希望',
        visitCount: 10,
        totalSpent: 60000,
        lastVisit: '2025-05-25',
        averageSpent: 6000,
        preferredStaff: 'staff-002'
    },
    {
        id: 'cust-017',
        name: '吉田 真理子',
        nameKana: 'ヨシダ マリコ',
        phone: '090-7890-1235',
        email: 'mariko@example.com',
        gender: '女性',
        birthDate: '1980-05-05',
        address: '東京都墨田区',
        occupation: 'フリーアナウンサー',
        tags: ['メディア', 'イメージ重要', 'トリートメント'],
        notes: 'テレビ出演あり。艶のある健康的な髪を維持したい',
        visitCount: 30,
        totalSpent: 450000,
        lastVisit: '2025-06-13',
        averageSpent: 15000,
        preferredStaff: 'staff-001',
        lineId: 'mariko_announcer'
    },
    {
        id: 'cust-018',
        name: '斎藤 涼',
        nameKana: 'サイトウ リョウ',
        phone: '080-8901-2346',
        email: 'ryo@example.com',
        gender: '男性',
        birthDate: '1999-08-20',
        address: '東京都大田区',
        occupation: 'バンドマン',
        tags: ['音楽関係', '個性的', '深夜対応希望'],
        notes: 'ライブ活動中。個性的なスタイルOK。遅い時間希望',
        visitCount: 12,
        totalSpent: 96000,
        lastVisit: '2025-06-09',
        averageSpent: 8000,
        preferredStaff: 'staff-002',
        instagramId: '@ryo_band'
    },
    {
        id: 'cust-019',
        name: '藤原 さとみ',
        nameKana: 'フジワラ サトミ',
        phone: '090-9012-3457',
        email: 'satomi@example.com',
        gender: '女性',
        birthDate: '1973-11-11',
        address: '東京都荒川区',
        occupation: 'パート（スーパー勤務）',
        tags: ['主婦', '節約志向', '3ヶ月に1回'],
        notes: '必要最低限のメンテナンス。カットのみが多い',
        visitCount: 8,
        totalSpent: 32000,
        lastVisit: '2025-04-20',
        averageSpent: 4000,
        preferredStaff: 'staff-004'
    },
    {
        id: 'cust-020',
        name: '木村 大輝',
        nameKana: 'キムラ ダイキ',
        phone: '080-0123-4568',
        email: 'daiki@example.com',
        gender: '男性',
        birthDate: '1991-06-30',
        address: '東京都葛飾区',
        occupation: '消防士',
        tags: ['公務員', '規則的', '短髪必須'],
        notes: '仕事の規則で短髪必須。月1回の定期カット',
        visitCount: 36,
        totalSpent: 144000,
        lastVisit: '2025-06-22',
        averageSpent: 4000,
        preferredStaff: 'staff-002'
    }
];
// 📅 今日から1週間分の予約データ
const generateReservations = () => {
    const today = new Date('2025-06-22');
    const reservations = [];
    // 今週の予約パターン
    const weeklyPattern = [
        { date: 0, count: 3, staffDistribution: [1, 1, 1, 0] }, // 日曜（今日）
        { date: 1, count: 5, staffDistribution: [2, 2, 1, 0] }, // 月曜
        { date: 2, count: 2, staffDistribution: [1, 0, 1, 0] }, // 火曜
        { date: 3, count: 4, staffDistribution: [1, 1, 1, 1] }, // 水曜
        { date: 4, count: 6, staffDistribution: [2, 2, 1, 1] }, // 木曜
        { date: 5, count: 8, staffDistribution: [3, 2, 2, 1] }, // 金曜
        { date: 6, count: 7, staffDistribution: [2, 2, 2, 1] } // 土曜
    ];
    weeklyPattern.forEach((pattern, dayOffset) => {
        const date = new Date(today);
        date.setDate(date.getDate() + dayOffset);
        let timeSlot = 10; // 10:00開始
        let customerIndex = 0;
        // スタッフごとに予約を割り振り
        pattern.staffDistribution.forEach((count, staffIndex) => {
            for (let i = 0; i < count; i++) {
                const customer = exports.demoCustomers[customerIndex % exports.demoCustomers.length];
                const startTime = `${String(timeSlot).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`;
                const duration = customer.tags?.includes('VIP') ? 120 : 90;
                reservations.push({
                    id: `res-${date.toISOString().split('T')[0]}-${customerIndex}`,
                    customerId: customer.id,
                    customerName: customer.name,
                    staffId: exports.demoStaff[staffIndex].id,
                    staffName: exports.demoStaff[staffIndex].name,
                    date: date.toISOString().split('T')[0],
                    time: startTime,
                    startTime: startTime,
                    endTime: calculateEndTime(startTime, duration),
                    duration: duration,
                    service: getRandomMenu(customer),
                    menuContent: getRandomMenu(customer),
                    price: getMenuPrice(customer),
                    status: dayOffset === 0 ? 'completed' : (dayOffset < 3 ? 'confirmed' : 'tentative'),
                    source: getBookingSource(customer),
                    notes: customer.notes || '',
                    createdAt: new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000).toISOString()
                });
                customerIndex++;
                if (i % 2 === 1)
                    timeSlot++;
            }
        });
    });
    return reservations;
};
// 🕐 終了時間計算
const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
};
// 🎨 顧客に応じたメニュー選択
const getRandomMenu = (customer) => {
    const menuOptions = {
        'カラー希望': ['カット＋カラー', 'カット＋カラー＋トリートメント'],
        '白髪染め': ['カット＋白髪染め', '白髪染めリタッチ＋トリートメント'],
        'トリートメント重視': ['カット＋トリートメント', 'カラー＋トリートメント'],
        'ビジネススタイル': ['カット', 'カット＋眉カット'],
        'パーマ': ['カット＋パーマ', 'パーマ＋トリートメント'],
        'ヘッドスパ愛好': ['カット＋ヘッドスパ', 'ヘッドスパ＋トリートメント']
    };
    if (customer.tags) {
        for (const tag of customer.tags) {
            if (menuOptions[tag]) {
                return menuOptions[tag][Math.floor(Math.random() * menuOptions[tag].length)];
            }
        }
    }
    return 'カット';
};
// 💰 メニュー価格設定
const getMenuPrice = (customer) => {
    const basePrice = {
        'カット': 4000,
        'カット＋カラー': 8000,
        'カット＋パーマ': 10000,
        'カット＋トリートメント': 6000,
        'カット＋ヘッドスパ': 7000,
        'カット＋白髪染め': 8000,
        'カット＋眉カット': 5000
    };
    // VIP顧客は20%増し
    const multiplier = customer.tags?.includes('VIP') ? 1.2 : 1;
    // 学割は20%引き
    const discount = customer.tags?.includes('学割利用') ? 0.8 : 1;
    return Math.round(8000 * multiplier * discount);
};
// 📱 予約経路
const getBookingSource = (customer) => {
    if (customer.lineId)
        return 'LINE';
    if (customer.instagramId)
        return 'Instagram';
    if (customer.tags?.includes('VIP'))
        return '電話';
    return 'Web';
};
// 📊 施術履歴データ
exports.demoServiceHistory = exports.demoCustomers.flatMap(customer => {
    const historyCount = Math.floor(Math.random() * 3) + 3; // 3-5件の履歴
    const histories = [];
    for (let i = 0; i < historyCount; i++) {
        const daysAgo = (i + 1) * 30 + Math.floor(Math.random() * 15);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        histories.push({
            id: `hist-${customer.id}-${i}`,
            customerId: customer.id,
            customerName: customer.name,
            staffId: customer.preferredStaff || exports.demoStaff[0].id,
            staffName: exports.demoStaff.find(s => s.id === customer.preferredStaff)?.name || exports.demoStaff[0].name,
            date: date.toISOString().split('T')[0],
            service: getRandomMenu(customer),
            menuContent: getRandomMenu(customer),
            price: getMenuPrice(customer),
            duration: 90,
            beforeImage: `/images/before-${customer.id}-${i}.jpg`,
            afterImage: `/images/after-${customer.id}-${i}.jpg`,
            notes: `${customer.name}様の${i + 1}回目の施術。仕上がりに満足いただけました。`,
            rating: 4 + Math.random(),
            products: [['シャンプー', 'トリートメント'][Math.floor(Math.random() * 2)]]
        });
    }
    return histories;
});
// 💬 メッセージ履歴
exports.demoMessages = [
    {
        id: 'msg-001',
        customerId: 'cust-001',
        customerName: '山田 花子',
        channel: 'LINE',
        direction: 'outgoing',
        content: '山田様、先日はご来店ありがとうございました。仕上がりはいかがでしょうか？',
        timestamp: '2025-06-16T10:30:00',
        read: true,
        staffId: 'staff-001'
    },
    {
        id: 'msg-002',
        customerId: 'cust-001',
        customerName: '山田 花子',
        channel: 'LINE',
        direction: 'incoming',
        content: 'とても気に入っています！次回もよろしくお願いします。',
        timestamp: '2025-06-16T14:20:00',
        date: '2025-06-16',
        type: 'received',
        read: true
    },
    {
        id: 'msg-003',
        customerId: 'cust-003',
        customerName: '田中 恵美',
        channel: 'LINE',
        direction: 'outgoing',
        content: '田中様、明日のご予約確認です。15:00からお待ちしております。',
        timestamp: '2025-06-19T18:00:00',
        read: true,
        staffId: 'staff-001'
    },
    {
        id: 'msg-004',
        customerId: 'cust-005',
        customerName: '高橋 ゆり',
        channel: 'Instagram',
        direction: 'incoming',
        content: '明日の撮影前にカラーとトリートメントお願いできますか？',
        timestamp: '2025-06-20T20:00:00',
        date: '2025-06-20',
        type: 'received',
        read: true
    },
    {
        id: 'msg-005',
        customerId: 'cust-005',
        customerName: '高橋 ゆり',
        channel: 'Instagram',
        direction: 'outgoing',
        content: '承知いたしました！10:00からご予約をお取りしました。',
        timestamp: '2025-06-20T20:30:00',
        read: true,
        staffId: 'staff-003'
    },
    {
        id: 'msg-006',
        customerId: 'cust-004',
        customerName: '鈴木 愛子',
        channel: 'email',
        direction: 'outgoing',
        content: '【VIP限定】7月のプレミアムトリートメントキャンペーンのご案内',
        timestamp: '2025-06-21T09:00:00',
        read: false,
        staffId: 'staff-002'
    },
    {
        id: 'msg-007',
        customerId: 'cust-008',
        customerName: '伊藤 健一',
        channel: 'LINE',
        direction: 'outgoing',
        content: '伊藤様、本日はヘッドスパもご一緒にいかがでしょうか？疲労回復に効果的です。',
        timestamp: '2025-06-19T09:00:00',
        date: '2025-06-19',
        type: 'sent',
        read: true,
        staffId: 'staff-002'
    },
    {
        id: 'msg-008',
        customerId: 'cust-017',
        customerName: '吉田 真理子',
        channel: 'LINE',
        direction: 'incoming',
        content: '来週のテレビ収録があるので、いつもの時間に予約できますか？',
        timestamp: '2025-06-21T16:00:00',
        read: true
    },
    {
        id: 'msg-009',
        customerId: 'cust-012',
        customerName: '橋本 蓮',
        channel: 'Web',
        direction: 'outgoing',
        content: '橋本様、お誕生日おめでとうございます！今月はバースデー割引がご利用いただけます。',
        timestamp: '2025-06-14T00:00:00',
        read: true,
        staffId: 'staff-004'
    },
    {
        id: 'msg-010',
        customerId: 'cust-011',
        customerName: '松本 由美',
        channel: 'email',
        direction: 'outgoing',
        content: 'いつもご利用ありがとうございます。グレイヘア専用の新しいトリートメントが入荷しました。',
        timestamp: '2025-06-20T11:00:00',
        read: true,
        staffId: 'staff-001'
    }
];
// 📈 売上サマリーデータ
exports.demoSalesSummary = {
    today: {
        revenue: 52000,
        customers: 5,
        averageSpend: 10400,
        services: {
            cut: 2,
            color: 2,
            perm: 0,
            treatment: 3,
            other: 1
        }
    },
    thisWeek: {
        revenue: 245000,
        customers: 28,
        averageSpend: 8750
    },
    thisMonth: {
        revenue: 980000,
        customers: 112,
        averageSpend: 8750,
        topStaff: 'staff-002',
        topService: 'カット＋カラー'
    },
    lastMonth: {
        revenue: 1050000,
        customers: 125,
        averageSpend: 8400
    }
};
// 予約データ生成
exports.demoReservations = generateReservations();
// エクスポート
exports.demoShowcaseData = {
    salon: exports.demoSalonInfo,
    staff: exports.demoStaff,
    customers: exports.demoCustomers,
    reservations: exports.demoReservations,
    serviceHistory: exports.demoServiceHistory,
    messages: exports.demoMessages,
    salesSummary: exports.demoSalesSummary
};
