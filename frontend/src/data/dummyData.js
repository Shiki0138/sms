// スタッフデータ
export const staffMembers = [
    { id: 'staff1', name: '田中 美咲' },
    { id: 'staff2', name: '佐藤 千夏' },
    { id: 'staff3', name: '山田 ゆり' },
    { id: 'staff4', name: '鈴木 あやか' }
];
// 顧客の担当スタッフ関係
export const customerStaffRelations = new Map([
    ['cust001', 'staff1'], // 山田 花子 → 田中 美咲
    ['cust002', 'staff2'], // 佐藤 美咲 → 佐藤 千夏
    ['cust003', 'staff3'], // 田中 ゆみ → 山田 ゆり
    ['cust004', 'staff1'], // 高橋 麻衣 → 田中 美咲
    ['cust005', 'staff4'], // 鈴木 さくら → 鈴木 あやか (VIP)
    ['cust006', 'staff2'], // 中村 理恵 → 佐藤 千夏
    ['cust007', 'staff3'], // 小林 あい → 山田 ゆり
    ['cust008', 'staff1'], // 渡辺 なお → 田中 美咲
    ['cust009', 'staff2'], // 加藤 美穂 → 佐藤 千夏
    ['cust010', 'staff4'], // 松本 りな → 鈴木 あやか
    ['cust011', 'staff3'], // 井上 ゆか → 山田 ゆり
    ['cust012', 'staff2'], // 木村 えり → 佐藤 千夏
    ['cust013', 'staff4'], // 橋本 まり → 鈴木 あやか
    ['cust014', 'staff1'], // 清水 みか → 田中 美咲
    ['cust015', 'staff3'], // 森田 ひろ → 山田 ゆり
]);
// 顧客データ（15人）
export const dummyCustomers = [
    {
        id: 'cust001',
        customerNumber: 'C001',
        name: '山田 花子',
        phone: '090-1234-5678',
        email: 'hanako.yamada@email.com',
        instagramId: 'hanako_beauty',
        lineId: 'hanako123',
        visitCount: 12,
        lastVisitDate: '2024-05-20',
        createdAt: '2023-08-15',
        preferences: ['ナチュラルカラー', 'ボブスタイル'],
        notes: '敏感肌のためパッチテスト必要。ブラウン系カラー希望。',
        furigana: 'ヤマダ ハナコ',
        birthDate: '1985-04-15',
        gender: '女性',
        zipCode: '150-0001',
        address: '東京都渋谷区神宮前1-2-3',
        registrationDate: '2023-08-15',
        memberNumber: 'HP2023080001',
        couponHistory: 'カット＋カラー20%OFF利用(2024/03), 新規限定30%OFF利用(2023/08)',
        menuHistory: 'カット＋カラー(¥8,000), ヘッドスパ(¥3,000), トリートメント(¥2,500)',
        source: 'HOTPEPPER'
    },
    {
        id: 'cust002',
        customerNumber: 'C002',
        name: '佐藤 美咲',
        phone: '080-2345-6789',
        email: 'misaki.sato@email.com',
        instagramId: 'misaki_style',
        visitCount: 8,
        lastVisitDate: '2024-06-01',
        createdAt: '2023-12-10',
        preferences: ['ロングヘア', 'パーマ'],
        notes: 'ゆるふわパーマ希望。カラーは控えめ。',
        furigana: 'サトウ ミサキ',
        birthDate: '1992-11-08',
        gender: '女性',
        zipCode: '106-0032',
        address: '東京都港区六本木3-4-5',
        registrationDate: '2023-12-10',
        memberNumber: 'HP2023120002',
        couponHistory: 'パーマ15%OFF利用(2024/04), 友達紹介特典利用(2024/01)',
        menuHistory: 'ロングパーマ(¥12,000), カット(¥4,500), トリートメント(¥3,000)',
        source: 'HOTPEPPER'
    },
    {
        id: 'cust003',
        customerNumber: 'C003',
        name: '田中 ゆみ',
        phone: '070-3456-7890',
        lineId: 'yumi_tanaka',
        visitCount: 15,
        lastVisitDate: '2024-05-25',
        createdAt: '2023-06-20',
        preferences: ['ショートカット', 'ハイライト'],
        notes: 'アクティブなスタイル希望。カラーチェンジ好き。',
        source: 'MANUAL'
    },
    {
        id: 'cust004',
        customerNumber: 'C004',
        name: '高橋 麻衣',
        phone: '090-4567-8901',
        email: 'mai.takahashi@email.com',
        visitCount: 6,
        lastVisitDate: '2024-06-05',
        createdAt: '2024-01-15',
        preferences: ['セミロング', 'トリートメント'],
        notes: '髪質改善重視。ダメージケア希望。'
    },
    {
        id: 'cust005',
        customerNumber: 'C005',
        name: '鈴木 さくら',
        phone: '080-5678-9012',
        instagramId: 'sakura_beauty',
        lineId: 'sakura2024',
        visitCount: 20,
        lastVisitDate: '2024-06-08',
        createdAt: '2023-03-10',
        preferences: ['アップスタイル', 'ヘッドスパ'],
        notes: 'VIP顧客。特別メニュー対応。リラクゼーション重視。'
    },
    {
        id: 'cust006',
        customerNumber: 'C006',
        name: '中村 理恵',
        phone: '070-6789-0123',
        email: 'rie.nakamura@email.com',
        visitCount: 4,
        lastVisitDate: '2024-04-20',
        createdAt: '2024-02-05',
        preferences: ['ミディアム', 'ストレート'],
        notes: '初回来店時は緊張気味。丁寧な説明必要。'
    },
    {
        id: 'cust007',
        customerNumber: 'C007',
        name: '小林 あい',
        phone: '090-7890-1234',
        instagramId: 'ai_beauty',
        visitCount: 10,
        lastVisitDate: '2024-05-30',
        createdAt: '2023-10-08',
        preferences: ['ウェーブ', 'グラデーション'],
        notes: 'トレンドに敏感。新しいスタイル挑戦好き。'
    },
    {
        id: 'cust008',
        customerNumber: 'C008',
        name: '渡辺 なお',
        phone: '080-8901-2345',
        lineId: 'nao_w',
        visitCount: 7,
        lastVisitDate: '2024-06-02',
        createdAt: '2023-11-20',
        preferences: ['ボブ', 'インナーカラー'],
        notes: '学生。予算重視。部分的なカラーリング希望。'
    },
    {
        id: 'cust009',
        customerNumber: 'C009',
        name: '加藤 美穂',
        phone: '070-9012-3456',
        email: 'miho.kato@email.com',
        visitCount: 3,
        lastVisitDate: '2024-03-15',
        createdAt: '2024-01-20',
        preferences: ['ロング', 'カット'],
        notes: '妊娠中のため、刺激の少ない施術希望。'
    },
    {
        id: 'cust010',
        customerNumber: 'C010',
        name: '松本 りな',
        phone: '090-0123-4567',
        instagramId: 'rina_style',
        lineId: 'rina_m',
        visitCount: 18,
        lastVisitDate: '2024-06-10',
        createdAt: '2023-04-15',
        preferences: ['レイヤー', 'ブリーチ'],
        notes: 'ファッション業界勤務。派手なスタイルOK。'
    },
    {
        id: 'cust011',
        customerNumber: 'C011',
        name: '井上 ゆか',
        phone: '080-1234-5678',
        email: 'yuka.inoue@email.com',
        visitCount: 5,
        lastVisitDate: '2024-05-10',
        createdAt: '2023-12-01',
        preferences: ['ショート', 'ナチュラル'],
        notes: '忙しい職場のため、お手入れ簡単スタイル希望。'
    },
    {
        id: 'cust012',
        customerNumber: 'C012',
        name: '木村 えり',
        phone: '070-2345-6789',
        lineId: 'eri_kimura',
        visitCount: 2,
        lastVisitDate: '2024-02-28',
        createdAt: '2024-01-10',
        preferences: ['ミディアム', 'パーマ'],
        notes: '新規顧客。他店からの移籍。前回の仕上がりに満足。'
    },
    {
        id: 'cust013',
        customerNumber: 'C013',
        name: '橋本 まり',
        phone: '090-3456-7890',
        instagramId: 'mari_beauty',
        visitCount: 13,
        lastVisitDate: '2024-06-07',
        createdAt: '2023-07-05',
        preferences: ['アシンメトリー', 'バレイヤージュ'],
        notes: '個性的なスタイル好み。アート系のカラーリング希望。'
    },
    {
        id: 'cust014',
        customerNumber: 'C014',
        name: '清水 みか',
        phone: '080-4567-8901',
        email: 'mika.shimizu@email.com',
        visitCount: 9,
        lastVisitDate: '2024-05-28',
        createdAt: '2023-09-12',
        preferences: ['ロング', 'ヘアケア'],
        notes: '美髪維持重視。高品質トリートメント定期利用。'
    },
    {
        id: 'cust015',
        customerNumber: 'C015',
        name: '森田 ひろ',
        phone: '070-5678-9012',
        lineId: 'hiro_morita',
        visitCount: 1,
        lastVisitDate: '2024-06-12',
        createdAt: '2024-06-12',
        preferences: ['メンズカット'],
        notes: '男性顧客。クールなビジネススタイル希望。初回来店。'
    }
];
// 施術履歴データ（50件程度）
export const serviceHistory = [
    // 山田 花子 (cust001) - 12回来店
    { id: 'hist001', customerId: 'cust001', customerName: '山田 花子', staffId: 'staff1', staffName: '田中 美咲', serviceType: 'カット+カラー', serviceDetails: 'ボブカット + ナチュラルブラウン', price: 12000, date: '2024-05-20', duration: 120, satisfactionRating: 5 },
    { id: 'hist002', customerId: 'cust001', customerName: '山田 花子', staffId: 'staff1', staffName: '田中 美咲', serviceType: 'カット', serviceDetails: 'ボブメンテナンス', price: 6000, date: '2024-04-15', duration: 60, satisfactionRating: 5 },
    { id: 'hist003', customerId: 'cust001', customerName: '山田 花子', staffId: 'staff1', staffName: '田中 美咲', serviceType: 'カラー', serviceDetails: 'リタッチ + トリートメント', price: 8000, date: '2024-03-20', duration: 90, satisfactionRating: 4 },
    { id: 'hist004', customerId: 'cust001', customerName: '山田 花子', staffId: 'staff1', staffName: '田中 美咲', serviceType: 'カット+カラー', serviceDetails: 'スタイルチェンジ + ダークブラウン', price: 13000, date: '2024-02-10', duration: 130, satisfactionRating: 5 },
    // 佐藤 美咲 (cust002) - 8回来店
    { id: 'hist005', customerId: 'cust002', customerName: '佐藤 美咲', staffId: 'staff2', staffName: '佐藤 千夏', serviceType: 'パーマ', serviceDetails: 'ゆるふわパーマ', price: 10000, date: '2024-06-01', duration: 150, satisfactionRating: 5 },
    { id: 'hist006', customerId: 'cust002', customerName: '佐藤 美咲', staffId: 'staff2', staffName: '佐藤 千夏', serviceType: 'カット', serviceDetails: 'ロングレイヤー', price: 6500, date: '2024-04-25', duration: 70, satisfactionRating: 4 },
    { id: 'hist007', customerId: 'cust002', customerName: '佐藤 美咲', staffId: 'staff2', staffName: '佐藤 千夏', serviceType: 'トリートメント', serviceDetails: 'システムトリートメント', price: 4500, date: '2024-03-30', duration: 45, satisfactionRating: 5 },
    // 田中 ゆみ (cust003) - 15回来店（最多顧客）
    { id: 'hist008', customerId: 'cust003', customerName: '田中 ゆみ', staffId: 'staff3', staffName: '山田 ゆり', serviceType: 'カット+ハイライト', serviceDetails: 'ショートボブ + ブロンドハイライト', price: 15000, date: '2024-05-25', duration: 180, satisfactionRating: 5 },
    { id: 'hist009', customerId: 'cust003', customerName: '田中 ゆみ', staffId: 'staff3', staffName: '山田 ゆり', serviceType: 'カラー', serviceDetails: 'ハイライトメンテナンス', price: 9000, date: '2024-04-20', duration: 120, satisfactionRating: 4 },
    { id: 'hist010', customerId: 'cust003', customerName: '田中 ゆみ', staffId: 'staff3', staffName: '山田 ゆり', serviceType: 'カット', serviceDetails: 'ショートスタイル調整', price: 5500, date: '2024-03-25', duration: 50, satisfactionRating: 5 },
    { id: 'hist011', customerId: 'cust003', customerName: '田中 ゆみ', staffId: 'staff3', staffName: '山田 ゆり', serviceType: 'カット+カラー', serviceDetails: 'ピクシーカット + アッシュ', price: 12500, date: '2024-02-28', duration: 140, satisfactionRating: 5 },
    // 高橋 麻衣 (cust004) - 6回来店
    { id: 'hist012', customerId: 'cust004', customerName: '高橋 麻衣', staffId: 'staff1', staffName: '田中 美咲', serviceType: 'トリートメント', serviceDetails: 'ケラチントリートメント', price: 8000, date: '2024-06-05', duration: 90, satisfactionRating: 5 },
    { id: 'hist013', customerId: 'cust004', customerName: '高橋 麻衣', staffId: 'staff1', staffName: '田中 美咲', serviceType: 'カット', serviceDetails: 'セミロングカット', price: 6000, date: '2024-05-10', duration: 60, satisfactionRating: 4 },
    { id: 'hist014', customerId: 'cust004', customerName: '高橋 麻衣', staffId: 'staff1', staffName: '田中 美咲', serviceType: 'ヘッドスパ', serviceDetails: 'リラクゼーションスパ', price: 3500, date: '2024-04-15', duration: 40, satisfactionRating: 5 },
    // 鈴木 さくら (cust005) - 20回来店（VIP顧客）
    { id: 'hist015', customerId: 'cust005', customerName: '鈴木 さくら', staffId: 'staff4', staffName: '鈴木 あやか', serviceType: 'アップスタイル+ヘッドスパ', serviceDetails: 'パーティーアップ + プレミアムスパ', price: 18000, date: '2024-06-08', duration: 180, satisfactionRating: 5 },
    { id: 'hist016', customerId: 'cust005', customerName: '鈴木 さくら', staffId: 'staff4', staffName: '鈴木 あやか', serviceType: 'カット+カラー', serviceDetails: 'ロングレイヤー + プラチナブロンド', price: 20000, date: '2024-05-15', duration: 200, satisfactionRating: 5 },
    { id: 'hist017', customerId: 'cust005', customerName: '鈴木 さくら', staffId: 'staff4', staffName: '鈴木 あやか', serviceType: 'ヘッドスパ', serviceDetails: 'VIPスペシャルスパ', price: 6000, date: '2024-04-28', duration: 60, satisfactionRating: 5 },
    { id: 'hist018', customerId: 'cust005', customerName: '鈴木 さくら', staffId: 'staff4', staffName: '鈴木 あやか', serviceType: 'トリートメント', serviceDetails: 'プレミアムケア', price: 12000, date: '2024-04-10', duration: 120, satisfactionRating: 5 },
    // 中村 理恵 (cust006) - 4回来店
    { id: 'hist019', customerId: 'cust006', customerName: '中村 理恵', staffId: 'staff2', staffName: '佐藤 千夏', serviceType: 'ストレートパーマ', serviceDetails: 'ナチュラルストレート', price: 12000, date: '2024-04-20', duration: 150, satisfactionRating: 4 },
    { id: 'hist020', customerId: 'cust006', customerName: '中村 理恵', staffId: 'staff2', staffName: '佐藤 千夏', serviceType: 'カット', serviceDetails: 'ミディアムスタイル', price: 5500, date: '2024-03-15', duration: 55, satisfactionRating: 4 },
    // 小林 あい (cust007) - 10回来店
    { id: 'hist021', customerId: 'cust007', customerName: '小林 あい', staffId: 'staff3', staffName: '山田 ゆり', serviceType: 'カラー', serviceDetails: 'グラデーションカラー', price: 14000, date: '2024-05-30', duration: 160, satisfactionRating: 5 },
    { id: 'hist022', customerId: 'cust007', customerName: '小林 あい', staffId: 'staff3', staffName: '山田 ゆり', serviceType: 'パーマ', serviceDetails: 'デジタルパーマ', price: 11000, date: '2024-04-22', duration: 140, satisfactionRating: 4 },
    { id: 'hist023', customerId: 'cust007', customerName: '小林 あい', staffId: 'staff3', staffName: '山田 ゆり', serviceType: 'カット', serviceDetails: 'ウェーブスタイル', price: 6000, date: '2024-03-28', duration: 65, satisfactionRating: 5 },
    // 渡辺 なお (cust008) - 7回来店
    { id: 'hist024', customerId: 'cust008', customerName: '渡辺 なお', staffId: 'staff1', staffName: '田中 美咲', serviceType: 'カット+インナーカラー', serviceDetails: 'ボブ + ピンクインナー', price: 9500, date: '2024-06-02', duration: 110, satisfactionRating: 5 },
    { id: 'hist025', customerId: 'cust008', customerName: '渡辺 なお', staffId: 'staff1', staffName: '田中 美咲', serviceType: 'カット', serviceDetails: 'ボブメンテナンス', price: 4500, date: '2024-05-05', duration: 45, satisfactionRating: 4 },
    // 加藤 美穂 (cust009) - 3回来店
    { id: 'hist026', customerId: 'cust009', customerName: '加藤 美穂', staffId: 'staff2', staffName: '佐藤 千夏', serviceType: 'カット', serviceDetails: 'ロングカット（妊婦対応）', price: 5000, date: '2024-03-15', duration: 50, satisfactionRating: 5 },
    { id: 'hist027', customerId: 'cust009', customerName: '加藤 美穂', staffId: 'staff2', staffName: '佐藤 千夏', serviceType: 'ヘッドスパ', serviceDetails: 'マタニティスパ', price: 3000, date: '2024-02-20', duration: 30, satisfactionRating: 5 },
    // 松本 りな (cust010) - 18回来店
    { id: 'hist028', customerId: 'cust010', customerName: '松本 りな', staffId: 'staff4', staffName: '鈴木 あやか', serviceType: 'ブリーチ+カラー', serviceDetails: 'プラチナブリーチ + ビビッドピンク', price: 18000, date: '2024-06-10', duration: 220, satisfactionRating: 5 },
    { id: 'hist029', customerId: 'cust010', customerName: '松本 りな', staffId: 'staff4', staffName: '鈴木 あやか', serviceType: 'カット', serviceDetails: 'レイヤーカット', price: 7000, date: '2024-05-18', duration: 70, satisfactionRating: 5 },
    { id: 'hist030', customerId: 'cust010', customerName: '松本 りな', staffId: 'staff4', staffName: '鈴木 あやか', serviceType: 'カラーチェンジ', serviceDetails: 'ブルー系グラデーション', price: 15000, date: '2024-04-25', duration: 180, satisfactionRating: 4 },
    { id: 'hist031', customerId: 'cust010', customerName: '松本 りな', staffId: 'staff4', staffName: '鈴木 あやか', serviceType: 'トリートメント', serviceDetails: 'ブリーチ後ケア', price: 5000, date: '2024-04-05', duration: 60, satisfactionRating: 5 },
    // 井上 ゆか (cust011) - 5回来店
    { id: 'hist032', customerId: 'cust011', customerName: '井上 ゆか', staffId: 'staff3', staffName: '山田 ゆり', serviceType: 'カット', serviceDetails: 'ショートカット（お手入れ簡単）', price: 5500, date: '2024-05-10', duration: 50, satisfactionRating: 5 },
    { id: 'hist033', customerId: 'cust011', customerName: '井上 ゆか', staffId: 'staff3', staffName: '山田 ゆり', serviceType: 'カラー', serviceDetails: 'ナチュラルブラウン', price: 7000, date: '2024-04-12', duration: 80, satisfactionRating: 4 },
    // 木村 えり (cust012) - 2回来店
    { id: 'hist034', customerId: 'cust012', customerName: '木村 えり', staffId: 'staff2', staffName: '佐藤 千夏', serviceType: 'パーマ', serviceDetails: 'ソフトパーマ', price: 9000, date: '2024-02-28', duration: 130, satisfactionRating: 5 },
    { id: 'hist035', customerId: 'cust012', customerName: '木村 えり', staffId: 'staff2', staffName: '佐藤 千夏', serviceType: 'カット', serviceDetails: 'ミディアムカット', price: 6000, date: '2024-01-20', duration: 60, satisfactionRating: 4 },
    // 橋本 まり (cust013) - 13回来店
    { id: 'hist036', customerId: 'cust013', customerName: '橋本 まり', staffId: 'staff4', staffName: '鈴木 あやか', serviceType: 'バレイヤージュ', serviceDetails: 'アシンメトリー + 3Dバレイヤージュ', price: 16000, date: '2024-06-07', duration: 200, satisfactionRating: 5 },
    { id: 'hist037', customerId: 'cust013', customerName: '橋本 まり', staffId: 'staff4', staffName: '鈴木 あやか', serviceType: 'カット', serviceDetails: 'アシンメトリーカット', price: 8000, date: '2024-05-12', duration: 80, satisfactionRating: 5 },
    { id: 'hist038', customerId: 'cust013', customerName: '橋本 まり', staffId: 'staff4', staffName: '鈴木 あやか', serviceType: 'カラー', serviceDetails: 'アート系マルチカラー', price: 12000, date: '2024-04-18', duration: 150, satisfactionRating: 4 },
    // 清水 みか (cust014) - 9回来店
    { id: 'hist039', customerId: 'cust014', customerName: '清水 みか', staffId: 'staff1', staffName: '田中 美咲', serviceType: 'トリートメント', serviceDetails: 'プレミアムトリートメント', price: 10000, date: '2024-05-28', duration: 100, satisfactionRating: 5 },
    { id: 'hist040', customerId: 'cust014', customerName: '清水 みか', staffId: 'staff1', staffName: '田中 美咲', serviceType: 'カット', serviceDetails: 'ロングメンテナンス', price: 6500, date: '2024-04-30', duration: 65, satisfactionRating: 5 },
    { id: 'hist041', customerId: 'cust014', customerName: '清水 みか', staffId: 'staff1', staffName: '田中 美咲', serviceType: 'ヘッドスパ', serviceDetails: '美髪ケアスパ', price: 4000, date: '2024-04-10', duration: 45, satisfactionRating: 5 },
    // 森田 ひろ (cust015) - 1回来店（新規男性客）
    { id: 'hist042', customerId: 'cust015', customerName: '森田 ひろ', staffId: 'staff3', staffName: '山田 ゆり', serviceType: 'メンズカット', serviceDetails: 'ビジネススタイルカット', price: 4000, date: '2024-06-12', duration: 40, satisfactionRating: 4 },
    // 追加の履歴（リピート顧客の過去データ）
    { id: 'hist043', customerId: 'cust001', customerName: '山田 花子', staffId: 'staff1', staffName: '田中 美咲', serviceType: 'カット', serviceDetails: 'ボブカット初回', price: 6000, date: '2024-01-15', duration: 60, satisfactionRating: 4 },
    { id: 'hist044', customerId: 'cust003', customerName: '田中 ゆみ', staffId: 'staff3', staffName: '山田 ゆり', serviceType: 'カラー', serviceDetails: 'アッシュベージュ', price: 8500, date: '2024-01-20', duration: 100, satisfactionRating: 5 },
    { id: 'hist045', customerId: 'cust005', customerName: '鈴木 さくら', staffId: 'staff4', staffName: '鈴木 あやか', serviceType: 'カット+カラー', serviceDetails: 'ロング維持 + ハイライト', price: 16000, date: '2024-03-20', duration: 170, satisfactionRating: 5 },
    { id: 'hist046', customerId: 'cust007', customerName: '小林 あい', staffId: 'staff3', staffName: '山田 ゆり', serviceType: 'トリートメント', serviceDetails: 'カラー後ケア', price: 4000, date: '2024-03-05', duration: 40, satisfactionRating: 4 },
    { id: 'hist047', customerId: 'cust010', customerName: '松本 りな', staffId: 'staff4', staffName: '鈴木 あやか', serviceType: 'カット', serviceDetails: 'ロングレイヤー', price: 6500, date: '2024-03-10', duration: 65, satisfactionRating: 5 },
    { id: 'hist048', customerId: 'cust013', customerName: '橋本 まり', staffId: 'staff4', staffName: '鈴木 あやか', serviceType: 'カラー', serviceDetails: 'レインボーハイライト', price: 14000, date: '2024-03-15', duration: 180, satisfactionRating: 5 },
    { id: 'hist049', customerId: 'cust014', customerName: '清水 みか', staffId: 'staff1', staffName: '田中 美咲', serviceType: 'ヘッドスパ', serviceDetails: 'リラクゼーションスパ', price: 3500, date: '2024-03-22', duration: 40, satisfactionRating: 5 },
    { id: 'hist050', customerId: 'cust002', customerName: '佐藤 美咲', staffId: 'staff2', staffName: '佐藤 千夏', serviceType: 'カット+パーマ', serviceDetails: 'ロングカット + ゆるパーマ', price: 13000, date: '2024-02-15', duration: 160, satisfactionRating: 5 }
];
// 過去の予約データ（施術履歴と連動）
export const pastReservations = [
    // 山田 花子 (cust001) - 12回来店分
    {
        id: 'past001',
        startTime: '2024-05-20T10:00:00',
        endTime: '2024-05-20T12:00:00',
        menuContent: 'カット+カラー',
        customerName: '山田 花子',
        customer: { id: 'cust001', name: '山田 花子', phone: '090-1234-5678' },
        staff: { id: 'staff1', name: '田中 美咲' },
        source: 'PHONE',
        status: 'COMPLETED',
        notes: 'ボブカット + ナチュラルブラウン',
        price: 12000,
        stylistNotes: '敏感肌のため、カラー剤を薄めに調合。パッチテスト実施済み。毛先のダメージが気になるとのことで、トリートメントを追加提案。次回はカラー前にトリートメントを勧める。'
    },
    {
        id: 'past002',
        startTime: '2024-04-15T14:00:00',
        endTime: '2024-04-15T15:00:00',
        menuContent: 'カット',
        customerName: '山田 花子',
        customer: { id: 'cust001', name: '山田 花子', phone: '090-1234-5678' },
        staff: { id: 'staff1', name: '田中 美咲' },
        source: 'PHONE',
        status: 'COMPLETED',
        notes: 'ボブメンテナンス',
        price: 6000,
        stylistNotes: 'ボブラインを維持しつつ、少し軽さを出したいとのリクエスト。レイヤーを浅めに入れて動きをプラス。髪質が太めなので、毛量調整も実施。'
    },
    {
        id: 'past003',
        startTime: '2024-03-20T11:00:00',
        endTime: '2024-03-20T12:30:00',
        menuContent: 'カラー',
        customerName: '山田 花子',
        customer: { id: 'cust001', name: '山田 花子', phone: '090-1234-5678' },
        staff: { id: 'staff1', name: '田中 美咲' },
        source: 'PHONE',
        status: 'COMPLETED',
        notes: 'リタッチ + トリートメント',
        price: 8000
    },
    {
        id: 'past004',
        startTime: '2024-02-10T13:00:00',
        endTime: '2024-02-10T15:10:00',
        menuContent: 'カット+カラー',
        customerName: '山田 花子',
        customer: { id: 'cust001', name: '山田 花子', phone: '090-1234-5678' },
        staff: { id: 'staff1', name: '田中 美咲' },
        source: 'HOTPEPPER',
        status: 'COMPLETED',
        notes: 'スタイルチェンジ + ダークブラウン',
        price: 13000
    },
    // 佐藤 美咲 (cust002) - 8回来店分
    {
        id: 'past005',
        startTime: '2024-06-01T15:00:00',
        endTime: '2024-06-01T17:30:00',
        menuContent: 'パーマ',
        customerName: '佐藤 美咲',
        customer: { id: 'cust002', name: '佐藤 美咲', phone: '080-2345-6789' },
        staff: { id: 'staff2', name: '佐藤 千夏' },
        source: 'HOTPEPPER',
        status: 'COMPLETED',
        notes: 'ゆるふわパーマ',
        price: 10000,
        stylistNotes: 'ロングヘアのため、パーマ液の浸透時間を通常より長めに設定。根元から中間はしっかり、毛先は軽めのカールで仕上げ。癖が強い髪質なので、パーマ後のスタイリング方法を詳しく説明。'
    },
    {
        id: 'past006',
        startTime: '2024-04-25T10:30:00',
        endTime: '2024-04-25T11:40:00',
        menuContent: 'カット',
        customerName: '佐藤 美咲',
        customer: { id: 'cust002', name: '佐藤 美咲', phone: '080-2345-6789' },
        staff: { id: 'staff2', name: '佐藤 千夏' },
        source: 'PHONE',
        status: 'COMPLETED',
        notes: 'ロングレイヤー',
        price: 6500
    },
    {
        id: 'past007',
        startTime: '2024-03-30T16:00:00',
        endTime: '2024-03-30T16:45:00',
        menuContent: 'トリートメント',
        customerName: '佐藤 美咲',
        customer: { id: 'cust002', name: '佐藤 美咲', phone: '080-2345-6789' },
        staff: { id: 'staff2', name: '佐藤 千夏' },
        source: 'PHONE',
        status: 'COMPLETED',
        notes: 'システムトリートメント',
        price: 4500
    },
    // 田中 ゆみ (cust003) - 15回来店分（最多顧客）
    {
        id: 'past008',
        startTime: '2024-05-25T13:00:00',
        endTime: '2024-05-25T16:00:00',
        menuContent: 'カット+ハイライト',
        customerName: '田中 ゆみ',
        customer: { id: 'cust003', name: '田中 ゆみ', phone: '070-3456-7890' },
        staff: { id: 'staff3', name: '山田 ゆり' },
        source: 'PHONE',
        status: 'COMPLETED',
        notes: 'ショートボブ + ブロンドハイライト',
        price: 15000
    },
    {
        id: 'past009',
        startTime: '2024-04-20T14:00:00',
        endTime: '2024-04-20T16:00:00',
        menuContent: 'カラー',
        customerName: '田中 ゆみ',
        customer: { id: 'cust003', name: '田中 ゆみ', phone: '070-3456-7890' },
        staff: { id: 'staff3', name: '山田 ゆり' },
        source: 'MANUAL',
        status: 'COMPLETED',
        notes: 'ハイライトメンテナンス',
        price: 9000
    },
    {
        id: 'past010',
        startTime: '2024-03-25T11:00:00',
        endTime: '2024-03-25T11:50:00',
        menuContent: 'カット',
        customerName: '田中 ゆみ',
        customer: { id: 'cust003', name: '田中 ゆみ', phone: '070-3456-7890' },
        staff: { id: 'staff3', name: '山田 ゆり' },
        source: 'PHONE',
        status: 'COMPLETED',
        notes: 'ショートスタイル調整',
        price: 5500
    },
    // 高橋 麻衣 (cust004) - 6回来店分
    {
        id: 'past011',
        startTime: '2024-06-05T10:00:00',
        endTime: '2024-06-05T11:30:00',
        menuContent: 'トリートメント',
        customerName: '高橋 麻衣',
        customer: { id: 'cust004', name: '高橋 麻衣', phone: '090-4567-8901' },
        staff: { id: 'staff1', name: '田中 美咲' },
        source: 'HOTPEPPER',
        status: 'COMPLETED',
        notes: 'ケラチントリートメント',
        price: 8000
    },
    {
        id: 'past012',
        startTime: '2024-05-10T15:00:00',
        endTime: '2024-05-10T16:00:00',
        menuContent: 'カット',
        customerName: '高橋 麻衣',
        customer: { id: 'cust004', name: '高橋 麻衣', phone: '090-4567-8901' },
        staff: { id: 'staff1', name: '田中 美咲' },
        source: 'PHONE',
        status: 'COMPLETED',
        notes: 'セミロングカット',
        price: 6000
    },
    // 鈴木 さくら (cust005) - 20回来店分（VIP顧客）
    {
        id: 'past013',
        startTime: '2024-06-08T14:00:00',
        endTime: '2024-06-08T17:00:00',
        menuContent: 'アップスタイル+ヘッドスパ',
        customerName: '鈴木 さくら',
        customer: { id: 'cust005', name: '鈴木 さくら', phone: '080-5678-9012' },
        staff: { id: 'staff4', name: '鈴木 あやか' },
        source: 'PHONE',
        status: 'COMPLETED',
        notes: 'パーティーアップ + プレミアムスパ',
        price: 18000,
        stylistNotes: 'VIP顧客の特別なパーティー用セット。髪が細く柔らかいため、ボリュームアップ用のムースを根元に使用。夜のパーティーまで崩れないよう、しっかりとヘアスプレーで固定。ヘッドスパはリラクゼーション重視で45分実施。'
    },
    {
        id: 'past014',
        startTime: '2024-05-15T10:00:00',
        endTime: '2024-05-15T13:20:00',
        menuContent: 'カット+カラー',
        customerName: '鈴木 さくら',
        customer: { id: 'cust005', name: '鈴木 さくら', phone: '080-5678-9012' },
        staff: { id: 'staff4', name: '鈴木 あやか' },
        source: 'PHONE',
        status: 'COMPLETED',
        notes: 'ロングレイヤー + プラチナブロンド',
        price: 20000
    },
    // 松本 りな (cust010) - 18回来店分
    {
        id: 'past015',
        startTime: '2024-06-10T13:00:00',
        endTime: '2024-06-10T16:40:00',
        menuContent: 'ブリーチ+カラー',
        customerName: '松本 りな',
        customer: { id: 'cust010', name: '松本 りな', phone: '090-0123-4567' },
        staff: { id: 'staff4', name: '鈴木 あやか' },
        source: 'MANUAL',
        status: 'COMPLETED',
        notes: 'プラチナブリーチ + ビビッドピンク',
        price: 18000,
        stylistNotes: '髪質が強くブリーチ耐性があるため、2回ブリーチでプラチナレベルまで脱色。ビビッドピンクは発色を良くするため、毛先を中心に濃いめに塗布。カラー後のケア方法とカラーシャンプーの使用方法を説明。次回は根元のリタッチのみでOK。'
    },
    {
        id: 'past016',
        startTime: '2024-05-18T11:00:00',
        endTime: '2024-05-18T12:10:00',
        menuContent: 'カット',
        customerName: '松本 りな',
        customer: { id: 'cust010', name: '松本 りな', phone: '090-0123-4567' },
        staff: { id: 'staff4', name: '鈴木 あやか' },
        source: 'PHONE',
        status: 'COMPLETED',
        notes: 'レイヤーカット',
        price: 7000
    },
    // 橋本 まり (cust013) - 13回来店分
    {
        id: 'past017',
        startTime: '2024-06-07T14:00:00',
        endTime: '2024-06-07T17:20:00',
        menuContent: 'バレイヤージュ',
        customerName: '橋本 まり',
        customer: { id: 'cust013', name: '橋本 まり', phone: '090-3456-7890' },
        staff: { id: 'staff4', name: '鈴木 あやか' },
        source: 'HOTPEPPER',
        status: 'COMPLETED',
        notes: 'アシンメトリー + 3Dバレイヤージュ',
        price: 16000
    },
    {
        id: 'past018',
        startTime: '2024-05-12T15:30:00',
        endTime: '2024-05-12T16:50:00',
        menuContent: 'カット',
        customerName: '橋本 まり',
        customer: { id: 'cust013', name: '橋本 まり', phone: '090-3456-7890' },
        staff: { id: 'staff4', name: '鈴木 あやか' },
        source: 'PHONE',
        status: 'COMPLETED',
        notes: 'アシンメトリーカット',
        price: 8000
    },
    // 清水 みか (cust014) - 9回来店分
    {
        id: 'past019',
        startTime: '2024-05-28T10:00:00',
        endTime: '2024-05-28T11:40:00',
        menuContent: 'トリートメント',
        customerName: '清水 みか',
        customer: { id: 'cust014', name: '清水 みか', phone: '080-4567-8901' },
        staff: { id: 'staff1', name: '田中 美咲' },
        source: 'PHONE',
        status: 'COMPLETED',
        notes: 'プレミアムトリートメント',
        price: 10000
    },
    {
        id: 'past020',
        startTime: '2024-04-30T13:00:00',
        endTime: '2024-04-30T14:05:00',
        menuContent: 'カット',
        customerName: '清水 みか',
        customer: { id: 'cust014', name: '清水 みか', phone: '080-4567-8901' },
        staff: { id: 'staff1', name: '田中 美咲' },
        source: 'HOTPEPPER',
        status: 'COMPLETED',
        notes: 'ロングメンテナンス',
        price: 6500
    },
    // 森田 ひろ (cust015) - 1回来店分（新規男性客）
    {
        id: 'past021',
        startTime: '2024-06-12T16:00:00',
        endTime: '2024-06-12T16:40:00',
        menuContent: 'メンズカット',
        customerName: '森田 ひろ',
        customer: { id: 'cust015', name: '森田 ひろ', phone: '070-5678-9012' },
        staff: { id: 'staff3', name: '山田 ゆり' },
        source: 'WALK_IN',
        status: 'COMPLETED',
        notes: 'ビジネススタイルカット',
        price: 4000
    },
    // 渡辺 なお (cust008) - 7回来店分
    {
        id: 'past022',
        startTime: '2024-06-02T15:00:00',
        endTime: '2024-06-02T16:50:00',
        menuContent: 'カット+インナーカラー',
        customerName: '渡辺 なお',
        customer: { id: 'cust008', name: '渡辺 なお', phone: '080-8901-2345' },
        staff: { id: 'staff1', name: '田中 美咲' },
        source: 'HOTPEPPER',
        status: 'COMPLETED',
        notes: 'ボブ + ピンクインナー',
        price: 9500
    },
    {
        id: 'past023',
        startTime: '2024-05-05T14:00:00',
        endTime: '2024-05-05T14:45:00',
        menuContent: 'カット',
        customerName: '渡辺 なお',
        customer: { id: 'cust008', name: '渡辺 なお', phone: '080-8901-2345' },
        staff: { id: 'staff1', name: '田中 美咲' },
        source: 'PHONE',
        status: 'COMPLETED',
        notes: 'ボブメンテナンス',
        price: 4500
    },
    // 小林 あい (cust007) - 10回来店分
    {
        id: 'past024',
        startTime: '2024-05-30T10:30:00',
        endTime: '2024-05-30T13:10:00',
        menuContent: 'カラー',
        customerName: '小林 あい',
        customer: { id: 'cust007', name: '小林 あい', phone: '090-7890-1234' },
        staff: { id: 'staff3', name: '山田 ゆり' },
        source: 'MANUAL',
        status: 'COMPLETED',
        notes: 'グラデーションカラー',
        price: 14000
    },
    {
        id: 'past025',
        startTime: '2024-04-22T14:30:00',
        endTime: '2024-04-22T16:50:00',
        menuContent: 'パーマ',
        customerName: '小林 あい',
        customer: { id: 'cust007', name: '小林 あい', phone: '090-7890-1234' },
        staff: { id: 'staff3', name: '山田 ゆり' },
        source: 'HOTPEPPER',
        status: 'COMPLETED',
        notes: 'デジタルパーマ',
        price: 11000
    }
];
// 未来の予約データ（10件）
export const futureReservations = [
    {
        id: 'res001',
        startTime: '2024-06-15T10:00:00',
        endTime: '2024-06-15T12:00:00',
        menuContent: 'カット+カラー',
        customerName: '山田 花子',
        customer: { id: 'cust001', name: '山田 花子', phone: '090-1234-5678' },
        staff: { id: 'staff1', name: '田中 美咲' },
        source: 'PHONE',
        status: 'CONFIRMED',
        notes: 'いつものボブスタイル希望',
        price: 12000
    },
    {
        id: 'res002',
        startTime: '2024-06-15T14:00:00',
        endTime: '2024-06-15T16:30:00',
        menuContent: 'パーマ+トリートメント',
        customerName: '佐藤 美咲',
        customer: { id: 'cust002', name: '佐藤 美咲', phone: '080-2345-6789' },
        staff: { id: 'staff2', name: '佐藤 千夏' },
        source: 'HOTPEPPER',
        status: 'CONFIRMED',
        notes: 'ゆるふわパーマ希望',
        price: 14500
    },
    {
        id: 'res002a',
        startTime: '2024-06-15T13:15:00',
        endTime: '2024-06-15T13:30:00',
        menuContent: '眉カット',
        customerName: '高橋 まき',
        customer: { id: 'cust101', name: '高橋 まき', phone: '090-1111-2222' },
        staff: { id: 'staff1', name: '田中 美咲' },
        source: 'MANUAL',
        status: 'CONFIRMED',
        notes: '15分間のクイックサービス',
        price: 1500
    },
    {
        id: 'res002b',
        startTime: '2024-06-15T17:00:00',
        endTime: '2024-06-15T17:45:00',
        menuContent: 'ヘッドスパ',
        customerName: '中川 さき',
        customer: { id: 'cust102', name: '中川 さき', phone: '080-3333-4444' },
        staff: { id: 'staff3', name: '山田 ゆり' },
        source: 'PHONE',
        status: 'CONFIRMED',
        notes: '45分間のリラクゼーション',
        price: 4500
    },
    {
        id: 'res003',
        startTime: '2024-06-16T09:30:00',
        endTime: '2024-06-16T12:00:00',
        menuContent: 'ブリーチ+カラー',
        customerName: '松本 りな',
        customer: { id: 'cust010', name: '松本 りな' },
        staff: { id: 'staff4', name: '鈴木 あやか' },
        source: 'MANUAL',
        status: 'CONFIRMED',
        notes: '新色チャレンジ（パープル系）',
        price: 18000
    },
    {
        id: 'res004',
        startTime: '2024-06-17T11:00:00',
        endTime: '2024-06-17T12:00:00',
        menuContent: 'カット',
        customerName: '田中 ゆみ',
        customer: { id: 'cust003', name: '田中 ゆみ', phone: '070-3456-7890' },
        staff: { id: 'staff3', name: '山田 ゆり' },
        source: 'PHONE',
        status: 'CONFIRMED',
        notes: 'ショートメンテナンス',
        price: 5500
    },
    {
        id: 'res005',
        startTime: '2024-06-18T13:00:00',
        endTime: '2024-06-18T16:00:00',
        menuContent: 'VIPスペシャルコース',
        customerName: '鈴木 さくら',
        customer: { id: 'cust005', name: '鈴木 さくら' },
        staff: { id: 'staff4', name: '鈴木 あやか' },
        source: 'PHONE',
        status: 'CONFIRMED',
        notes: 'パーティー用アップスタイル',
        price: 20000
    },
    {
        id: 'res006',
        startTime: '2024-06-19T10:00:00',
        endTime: '2024-06-19T11:30:00',
        menuContent: 'トリートメント+ヘッドスパ',
        customerName: '清水 みか',
        customer: { id: 'cust014', name: '清水 みか' },
        staff: { id: 'staff1', name: '田中 美咲' },
        source: 'HOTPEPPER',
        status: 'CONFIRMED',
        notes: '髪質改善コース',
        price: 8000
    },
    {
        id: 'res007',
        startTime: '2024-06-20T15:00:00',
        endTime: '2024-06-20T17:30:00',
        menuContent: 'バレイヤージュ',
        customerName: '橋本 まり',
        customer: { id: 'cust013', name: '橋本 まり' },
        staff: { id: 'staff4', name: '鈴木 あやか' },
        source: 'MANUAL',
        status: 'TENTATIVE',
        notes: '夏向けデザインカラー',
        price: 16000
    },
    {
        id: 'res008',
        startTime: '2024-06-21T09:00:00',
        endTime: '2024-06-21T10:00:00',
        menuContent: 'メンズカット',
        customerName: '森田 ひろ',
        customer: { id: 'cust015', name: '森田 ひろ' },
        staff: { id: 'staff3', name: '山田 ゆり' },
        source: 'PHONE',
        status: 'CONFIRMED',
        notes: '前回と同じスタイル希望',
        price: 4000
    },
    {
        id: 'res009',
        startTime: '2024-06-22T14:00:00',
        endTime: '2024-06-22T15:30:00',
        menuContent: 'カット+インナーカラー',
        customerName: '渡辺 なお',
        customer: { id: 'cust008', name: '渡辺 なお' },
        staff: { id: 'staff1', name: '田中 美咲' },
        source: 'HOTPEPPER',
        status: 'CONFIRMED',
        notes: 'インナーカラー色変更希望',
        price: 9500
    },
    {
        id: 'res010',
        startTime: '2024-06-23T11:00:00',
        endTime: '2024-06-23T13:00:00',
        menuContent: 'カット+カラー',
        customerName: '小林 あい',
        customer: { id: 'cust007', name: '小林 あい' },
        staff: { id: 'staff3', name: '山田 ゆり' },
        source: 'MANUAL',
        status: 'TENTATIVE',
        notes: '新しいグラデーション提案',
        price: 14000
    }
];
// メッセージスレッド（一部顧客）
export const messageThreads = [
    {
        id: 'thread001',
        customer: { id: 'cust001', name: '山田 花子', instagramId: 'hanako_beauty', lineId: 'hanako123' },
        channel: 'LINE',
        status: 'OPEN',
        assignedStaff: { id: 'staff1', name: '田中 美咲' }, // 既存顧客なので担当者表示
        lastMessage: {
            content: '来週の予約の件ですが、少し時間を変更していただくことは可能でしょうか？',
            createdAt: '2024-06-14T09:30:00',
            senderType: 'CUSTOMER'
        },
        unreadCount: 1,
        updatedAt: '2024-06-14T09:30:00'
    },
    {
        id: 'thread002',
        customer: { id: 'cust007', name: '小林 あい', instagramId: 'ai_beauty' },
        channel: 'INSTAGRAM',
        status: 'IN_PROGRESS',
        assignedStaff: { id: 'staff3', name: '山田 ゆり' },
        lastMessage: {
            content: 'グラデーションカラーの色見本を送っていただけますか？',
            createdAt: '2024-06-14T10:15:00',
            senderType: 'CUSTOMER'
        },
        unreadCount: 2,
        updatedAt: '2024-06-14T10:15:00'
    },
    {
        id: 'thread003',
        customer: { id: 'cust010', name: '松本 りな', instagramId: 'rina_style', lineId: 'rina_m' },
        channel: 'INSTAGRAM',
        status: 'CLOSED',
        assignedStaff: { id: 'staff4', name: '鈴木 あやか' },
        lastMessage: {
            content: '今日はありがとうございました！仕上がりとても気に入っています😊',
            createdAt: '2024-06-12T18:00:00',
            senderType: 'CUSTOMER'
        },
        unreadCount: 0,
        updatedAt: '2024-06-12T18:00:00'
    },
    {
        id: 'thread004',
        customer: { id: 'cust005', name: '鈴木 さくら', lineId: 'sakura2024' },
        channel: 'LINE',
        status: 'OPEN',
        assignedStaff: { id: 'staff4', name: '鈴木 あやか' },
        lastMessage: {
            content: 'パーティー用のアップスタイルの相談をしたいのですが、時間ありますか？',
            createdAt: '2024-06-13T16:45:00',
            senderType: 'CUSTOMER'
        },
        unreadCount: 1,
        updatedAt: '2024-06-13T16:45:00'
    },
    {
        id: 'thread005',
        customer: { id: '', name: '新規のお客様', instagramId: 'new_customer_2024' },
        channel: 'INSTAGRAM',
        status: 'OPEN',
        assignedStaff: undefined, // 新規顧客なので担当者なし
        lastMessage: {
            content: 'はじめまして！インスタを見て連絡しました。カラーの予約をしたいのですが、今週末は空いていますか？',
            createdAt: '2024-06-14T11:00:00',
            senderType: 'CUSTOMER'
        },
        unreadCount: 1,
        updatedAt: '2024-06-14T11:00:00'
    },
    {
        id: 'thread006',
        customer: { id: '', name: 'LINE User', lineId: 'unknown_line_user' },
        channel: 'LINE',
        status: 'OPEN',
        assignedStaff: undefined, // 連携できていない顧客なので担当者なし
        lastMessage: {
            content: '友達から紹介されました。パーマの料金を教えてください。',
            createdAt: '2024-06-14T10:45:00',
            senderType: 'CUSTOMER'
        },
        unreadCount: 1,
        updatedAt: '2024-06-14T10:45:00'
    }
];
// 統計データの計算
export const calculateCustomerStats = () => {
    const totalCustomers = dummyCustomers.length;
    const totalVisits = dummyCustomers.reduce((sum, customer) => sum + customer.visitCount, 0);
    const averageVisits = Math.round(totalVisits / totalCustomers * 10) / 10;
    const vipCustomers = dummyCustomers.filter(c => c.visitCount >= 15).length;
    const regularCustomers = dummyCustomers.filter(c => c.visitCount >= 5 && c.visitCount < 15).length;
    const newCustomers = dummyCustomers.filter(c => c.visitCount < 5).length;
    const totalRevenue = serviceHistory.reduce((sum, service) => sum + service.price, 0);
    const averageServicePrice = Math.round(totalRevenue / serviceHistory.length);
    return {
        totalCustomers,
        totalVisits,
        averageVisits,
        segments: {
            vip: vipCustomers,
            regular: regularCustomers,
            new: newCustomers
        },
        revenue: {
            total: totalRevenue,
            average: averageServicePrice
        }
    };
};
