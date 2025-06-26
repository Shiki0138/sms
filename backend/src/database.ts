import { PrismaClient } from '@prisma/client'

// Prisma Client インスタンス作成
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// データベース接続の確認
export async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// データベース切断
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect()
    console.log('✅ Database disconnected successfully')
  } catch (error) {
    console.error('❌ Database disconnection failed:', error)
  }
}

// 開発用シードデータ作成
export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...')

    // テナント作成
    const tenant = await prisma.tenant.upsert({
      where: { id: 'demo-tenant-id' },
      update: {},
      create: {
        id: 'demo-tenant-id',
        name: 'SHIKI美容室 渋谷店',
        address: '東京都渋谷区道玄坂1-15-3 プライムプラザ道玄坂2F',
        phone: '03-5728-3456',
        email: 'info@shiki-salon.com',
        plan: 'premium',
      },
    })

    // 管理者スタッフ作成
    const adminStaff = await prisma.staff.upsert({
      where: { email: 'admin@shiki-salon.com' },
      update: {},
      create: {
        email: 'admin@shiki-salon.com',
        password: '$2a$12$dummy.hashed.password.for.development.only',
        name: '店長 佐藤美紀',
        role: 'ADMIN',
        tenantId: tenant.id,
      },
    })

    // スタッフ作成
    const staff1 = await prisma.staff.upsert({
      where: { email: 'takeshi@shiki-salon.com' },
      update: {},
      create: {
        email: 'takeshi@shiki-salon.com',
        password: '$2a$12$dummy.hashed.password.for.development.only',
        name: '高橋武志',
        role: 'STAFF',
        tenantId: tenant.id,
      },
    })

    const staff2 = await prisma.staff.upsert({
      where: { email: 'yuki@shiki-salon.com' },
      update: {},
      create: {
        email: 'yuki@shiki-salon.com',
        password: '$2a$12$dummy.hashed.password.for.development.only',
        name: '中村雪乃',
        role: 'STAFF',
        tenantId: tenant.id,
      },
    })

    const staff3 = await prisma.staff.upsert({
      where: { email: 'manager@shiki-salon.com' },
      update: {},
      create: {
        email: 'manager@shiki-salon.com',
        password: '$2a$12$dummy.hashed.password.for.development.only',
        name: '副店長 伊藤花音',
        role: 'MANAGER',
        tenantId: tenant.id,
      },
    })

    const staff4 = await prisma.staff.upsert({
      where: { email: 'kenji@shiki-salon.com' },
      update: {},
      create: {
        email: 'kenji@shiki-salon.com',
        password: '$2a$12$dummy.hashed.password.for.development.only',
        name: '小林健二',
        role: 'STAFF',
        tenantId: tenant.id,
      },
    })

    const staff5 = await prisma.staff.upsert({
      where: { email: 'maya@shiki-salon.com' },
      update: {},
      create: {
        email: 'maya@shiki-salon.com',
        password: '$2a$12$dummy.hashed.password.for.development.only',
        name: '鈴木麻耶',
        role: 'STAFF',
        tenantId: tenant.id,
      },
    })

    // タグ作成
    const vipTag = await prisma.tag.upsert({
      where: { 
        tenantId_name_type: {
          tenantId: tenant.id,
          name: 'VIP顧客',
          type: 'CUSTOMER'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        name: 'VIP顧客',
        color: '#FFD700',
        type: 'CUSTOMER',
      },
    })

    const newCustomerTag = await prisma.tag.upsert({
      where: {
        tenantId_name_type: {
          tenantId: tenant.id,
          name: '新規顧客',
          type: 'CUSTOMER'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        name: '新規顧客',
        color: '#10B981',
        type: 'CUSTOMER',
      },
    })

    const colorSpecialistTag = await prisma.tag.upsert({
      where: {
        tenantId_name_type: {
          tenantId: tenant.id,
          name: 'カラー希望',
          type: 'CUSTOMER'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        name: 'カラー希望',
        color: '#F59E0B',
        type: 'CUSTOMER',
      },
    })

    const urgentTag = await prisma.tag.upsert({
      where: {
        tenantId_name_type: {
          tenantId: tenant.id,
          name: '急ぎ対応',
          type: 'THREAD'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        name: '急ぎ対応',
        color: '#EF4444',
        type: 'THREAD',
      },
    })

    const followUpTag = await prisma.tag.upsert({
      where: {
        tenantId_name_type: {
          tenantId: tenant.id,
          name: 'フォローアップ',
          type: 'THREAD'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        name: 'フォローアップ',
        color: '#8B5CF6',
        type: 'THREAD',
      },
    })

    // 顧客作成（15人）
    const customers = []
    
    const customer1 = await prisma.customer.upsert({
      where: { id: 'demo-customer-1' },
      update: {},
      create: {
        id: 'demo-customer-1',
        name: '田中花子',
        nameKana: 'タナカ ハナコ',
        gender: 'FEMALE',
        birthDate: new Date('1995-03-15'),
        phone: '090-1234-5678',
        email: 'hanako.tanaka@gmail.com',
        address: '東京都渋谷区恵比寿2-3-14',
        instagramId: 'hanako_beauty_lover',
        lineId: 'line_hanako_123',
        firstVisitDate: new Date('2023-05-10'),
        visitCount: 12,
        lastVisitDate: new Date('2024-11-28T14:00:00.000Z'),
        notes: 'イルミナカラー希望、ブリーチ履歴あり',
        tenantId: tenant.id,
      },
    })
    customers.push(customer1)

    const customer2 = await prisma.customer.upsert({
      where: { id: 'demo-customer-2' },
      update: {},
      create: {
        id: 'demo-customer-2',
        name: '山田太郎',
        nameKana: 'ヤマダ タロウ',
        gender: 'MALE',
        birthDate: new Date('1988-09-22'),
        phone: '090-9876-5432',
        email: 'taro.yamada@outlook.com',
        address: '東京都新宿区西新宿1-1-1',
        instagramId: 'taro_style',
        lineId: 'line_taro_456',
        firstVisitDate: new Date('2024-01-20'),
        visitCount: 6,
        lastVisitDate: new Date('2024-11-15T16:30:00.000Z'),
        notes: 'ビジネスカット、短時間希望',
        tenantId: tenant.id,
      },
    })
    customers.push(customer2)

    const customer3 = await prisma.customer.upsert({
      where: { id: 'demo-customer-3' },
      update: {},
      create: {
        id: 'demo-customer-3',
        name: '佐藤美咲',
        nameKana: 'サトウ ミサキ',
        gender: 'FEMALE',
        birthDate: new Date('1992-07-08'),
        phone: '080-1122-3344',
        email: 'misaki.sato@yahoo.co.jp',
        address: '東京都港区六本木3-2-1',
        instagramId: 'misaki_hair_journey',
        lineId: 'line_misaki_789',
        firstVisitDate: new Date('2022-11-03'),
        visitCount: 24,
        lastVisitDate: new Date('2024-12-05T10:30:00.000Z'),
        notes: 'ロングヘア専門、トリートメント重視',
        tenantId: tenant.id,
      },
    })
    customers.push(customer3)

    const customer4 = await prisma.customer.upsert({
      where: { id: 'demo-customer-4' },
      update: {},
      create: {
        id: 'demo-customer-4',
        name: '鈴木一郎',
        nameKana: 'スズキ イチロウ',
        gender: 'MALE',
        birthDate: new Date('1975-12-25'),
        phone: '070-5566-7788',
        email: 'ichiro.suzuki@company.co.jp',
        instagramId: 'ichiro_businessman',
        visitCount: 8,
        firstVisitDate: new Date('2024-03-12'),
        lastVisitDate: new Date('2024-11-20T18:00:00.000Z'),
        notes: '白髪染め、月1回定期',
        tenantId: tenant.id,
      },
    })
    customers.push(customer4)

    const customer5 = await prisma.customer.upsert({
      where: { id: 'demo-customer-5' },
      update: {},
      create: {
        id: 'demo-customer-5',
        name: '高橋りな',
        nameKana: 'タカハシ リナ',
        gender: 'FEMALE',
        birthDate: new Date('2001-04-18'),
        phone: '090-2233-4455',
        email: 'rina.takahashi@student.ac.jp',
        instagramId: 'rina_kawaii_style',
        lineId: 'line_rina_abc',
        firstVisitDate: new Date('2024-08-15'),
        visitCount: 3,
        lastVisitDate: new Date('2024-11-10T13:00:00.000Z'),
        notes: '学割適用、韓国風スタイル希望',
        tenantId: tenant.id,
      },
    })
    customers.push(customer5)

    const customer6 = await prisma.customer.upsert({
      where: { id: 'demo-customer-6' },
      update: {},
      create: {
        id: 'demo-customer-6',
        name: '伊藤和子',
        nameKana: 'イトウ カズコ',
        gender: 'FEMALE',
        birthDate: new Date('1965-01-30'),
        phone: '080-6677-8899',
        email: 'kazuko.ito@gmail.com',
        visitCount: 18,
        firstVisitDate: new Date('2023-02-14'),
        lastVisitDate: new Date('2024-11-25T11:00:00.000Z'),
        notes: 'パーマ＋白髪染め、丁寧な接客希望',
        tenantId: tenant.id,
      },
    })
    customers.push(customer6)

    const customer7 = await prisma.customer.upsert({
      where: { id: 'demo-customer-7' },
      update: {},
      create: {
        id: 'demo-customer-7',
        name: '中村翔太',
        nameKana: 'ナカムラ ショウタ',
        gender: 'MALE',
        birthDate: new Date('1997-11-12'),
        phone: '090-3344-5566',
        email: 'shota.nakamura@freelance.com',
        instagramId: 'shota_creative_hair',
        lineId: 'line_shota_def',
        firstVisitDate: new Date('2024-06-20'),
        visitCount: 4,
        lastVisitDate: new Date('2024-11-08T15:30:00.000Z'),
        notes: 'フリーランサー、個性的なスタイル好み',
        tenantId: tenant.id,
      },
    })
    customers.push(customer7)

    const customer8 = await prisma.customer.upsert({
      where: { id: 'demo-customer-8' },
      update: {},
      create: {
        id: 'demo-customer-8',
        name: '小林あかり',
        nameKana: 'コバヤシ アカリ',
        gender: 'FEMALE',
        birthDate: new Date('1990-06-03'),
        phone: '080-7788-9900',
        email: 'akari.kobayashi@media.tv',
        instagramId: 'akari_media_style',
        visitCount: 15,
        firstVisitDate: new Date('2023-09-08'),
        lastVisitDate: new Date('2024-12-02T12:00:00.000Z'),
        notes: 'TV関係者、撮影前メンテナンス多',
        tenantId: tenant.id,
      },
    })
    customers.push(customer8)

    const customer9 = await prisma.customer.upsert({
      where: { id: 'demo-customer-9' },
      update: {},
      create: {
        id: 'demo-customer-9',
        name: '森田健一',
        nameKana: 'モリタ ケンイチ',
        gender: 'MALE',
        birthDate: new Date('1982-02-28'),
        phone: '070-9988-7766',
        email: 'kenichi.morita@bank.co.jp',
        visitCount: 10,
        firstVisitDate: new Date('2024-01-15'),
        lastVisitDate: new Date('2024-11-18T17:00:00.000Z'),
        notes: '金融関係、保守的なスタイル',
        tenantId: tenant.id,
      },
    })
    customers.push(customer9)

    const customer10 = await prisma.customer.upsert({
      where: { id: 'demo-customer-10' },
      update: {},
      create: {
        id: 'demo-customer-10',
        name: '吉田麻衣',
        nameKana: 'ヨシダ マイ',
        gender: 'FEMALE',
        birthDate: new Date('1994-08-14'),
        phone: '090-1122-3344',
        email: 'mai.yoshida@design.studio',
        instagramId: 'mai_designer_hair',
        lineId: 'line_mai_ghi',
        firstVisitDate: new Date('2023-12-10'),
        visitCount: 7,
        lastVisitDate: new Date('2024-11-22T14:30:00.000Z'),
        notes: 'デザイナー、トレンドに敏感',
        tenantId: tenant.id,
      },
    })
    customers.push(customer10)

    const customer11 = await prisma.customer.upsert({
      where: { id: 'demo-customer-11' },
      update: {},
      create: {
        id: 'demo-customer-11',
        name: '松本裕子',
        nameKana: 'マツモト ユウコ',
        gender: 'FEMALE',
        birthDate: new Date('1978-05-20'),
        phone: '080-5544-3322',
        email: 'yuko.matsumoto@hospital.org',
        visitCount: 20,
        firstVisitDate: new Date('2022-08-25'),
        lastVisitDate: new Date('2024-11-30T09:30:00.000Z'),
        notes: '看護師、早朝対応希望時々',
        tenantId: tenant.id,
      },
    })
    customers.push(customer11)

    const customer12 = await prisma.customer.upsert({
      where: { id: 'demo-customer-12' },
      update: {},
      create: {
        id: 'demo-customer-12',
        name: '井上直也',
        nameKana: 'イノウエ ナオヤ',
        gender: 'MALE',
        birthDate: new Date('1986-10-07'),
        phone: '090-6655-4433',
        email: 'naoya.inoue@startup.tech',
        instagramId: 'naoya_tech_style',
        lineId: 'line_naoya_jkl',
        firstVisitDate: new Date('2024-04-03'),
        visitCount: 5,
        lastVisitDate: new Date('2024-11-12T19:00:00.000Z'),
        notes: 'IT系スタートアップ経営者',
        tenantId: tenant.id,
      },
    })
    customers.push(customer12)

    const customer13 = await prisma.customer.upsert({
      where: { id: 'demo-customer-13' },
      update: {},
      create: {
        id: 'demo-customer-13',
        name: '渡辺さくら',
        nameKana: 'ワタナベ サクラ',
        gender: 'FEMALE',
        birthDate: new Date('1999-03-26'),
        phone: '080-7766-5544',
        email: 'sakura.watanabe@model.agency',
        instagramId: 'sakura_model_official',
        lineId: 'line_sakura_mno',
        firstVisitDate: new Date('2024-07-18'),
        visitCount: 6,
        lastVisitDate: new Date('2024-12-01T16:00:00.000Z'),
        notes: 'モデル、撮影スケジュールに合わせて対応',
        tenantId: tenant.id,
      },
    })
    customers.push(customer13)

    const customer14 = await prisma.customer.upsert({
      where: { id: 'demo-customer-14' },
      update: {},
      create: {
        id: 'demo-customer-14',
        name: '岡田雅人',
        nameKana: 'オカダ マサト',
        gender: 'MALE',
        birthDate: new Date('1971-12-11'),
        phone: '070-8877-6655',
        email: 'masato.okada@law.firm',
        visitCount: 14,
        firstVisitDate: new Date('2023-06-05'),
        lastVisitDate: new Date('2024-11-26T15:00:00.000Z'),
        notes: '弁護士、フォーマルなスタイル',
        tenantId: tenant.id,
      },
    })
    customers.push(customer14)

    const customer15 = await prisma.customer.upsert({
      where: { id: 'demo-customer-15' },
      update: {},
      create: {
        id: 'demo-customer-15',
        name: '加藤えみ',
        nameKana: 'カトウ エミ',
        gender: 'FEMALE',
        birthDate: new Date('2003-09-09'),
        phone: '090-9900-8877',
        email: 'emi.kato@univ.student.jp',
        instagramId: 'emi_univ_life',
        lineId: 'line_emi_pqr',
        firstVisitDate: new Date('2024-11-01'),
        visitCount: 1,
        lastVisitDate: new Date('2024-11-01T11:00:00.000Z'),
        notes: '大学生、初回来店、友達紹介',
        tenantId: tenant.id,
      },
    })
    customers.push(customer15)

    // 顧客タグの関連付け
    await prisma.customerTag.createMany({
      data: [
        { customerId: customer3.id, tagId: vipTag.id },
        { customerId: customer8.id, tagId: vipTag.id },
        { customerId: customer13.id, tagId: vipTag.id },
        { customerId: customer15.id, tagId: newCustomerTag.id },
        { customerId: customer5.id, tagId: newCustomerTag.id },
        { customerId: customer1.id, tagId: colorSpecialistTag.id },
        { customerId: customer3.id, tagId: colorSpecialistTag.id },
        { customerId: customer10.id, tagId: colorSpecialistTag.id },
      ],
    })

    // メッセージスレッド作成（12個）
    const threads = []
    
    const thread1 = await prisma.messageThread.upsert({
      where: { 
        tenantId_channel_channelThreadId: {
          tenantId: tenant.id,
          channel: 'INSTAGRAM',
          channelThreadId: 'instagram_hanako_123'
        }
      },
      update: {},
      create: {
        customerId: customer1.id,
        channel: 'INSTAGRAM',
        channelThreadId: 'instagram_hanako_123',
        status: 'OPEN',
        tenantId: tenant.id,
      },
    })
    threads.push(thread1)

    const thread2 = await prisma.messageThread.upsert({
      where: { 
        tenantId_channel_channelThreadId: {
          tenantId: tenant.id,
          channel: 'LINE',
          channelThreadId: 'line_taro_456'
        }
      },
      update: {},
      create: {
        customerId: customer2.id,
        channel: 'LINE',
        channelThreadId: 'line_taro_456',
        assignedStaffId: staff1.id,
        status: 'IN_PROGRESS',
        tenantId: tenant.id,
      },
    })
    threads.push(thread2)

    const thread3 = await prisma.messageThread.upsert({
      where: { 
        tenantId_channel_channelThreadId: {
          tenantId: tenant.id,
          channel: 'INSTAGRAM',
          channelThreadId: 'instagram_misaki_789'
        }
      },
      update: {},
      create: {
        customerId: customer3.id,
        channel: 'INSTAGRAM',
        channelThreadId: 'instagram_misaki_789',
        assignedStaffId: staff2.id,
        status: 'CLOSED',
        tenantId: tenant.id,
      },
    })
    threads.push(thread3)

    const thread4 = await prisma.messageThread.upsert({
      where: { 
        tenantId_channel_channelThreadId: {
          tenantId: tenant.id,
          channel: 'LINE',
          channelThreadId: 'line_rina_abc'
        }
      },
      update: {},
      create: {
        customerId: customer5.id,
        channel: 'LINE',
        channelThreadId: 'line_rina_abc',
        assignedStaffId: staff5.id,
        status: 'OPEN',
        tenantId: tenant.id,
      },
    })
    threads.push(thread4)

    const thread5 = await prisma.messageThread.upsert({
      where: { 
        tenantId_channel_channelThreadId: {
          tenantId: tenant.id,
          channel: 'INSTAGRAM',
          channelThreadId: 'instagram_shota_def'
        }
      },
      update: {},
      create: {
        customerId: customer7.id,
        channel: 'INSTAGRAM',
        channelThreadId: 'instagram_shota_def',
        assignedStaffId: staff4.id,
        status: 'IN_PROGRESS',
        tenantId: tenant.id,
      },
    })
    threads.push(thread5)

    const thread6 = await prisma.messageThread.upsert({
      where: { 
        tenantId_channel_channelThreadId: {
          tenantId: tenant.id,
          channel: 'INSTAGRAM',
          channelThreadId: 'instagram_akari_ghi'
        }
      },
      update: {},
      create: {
        customerId: customer8.id,
        channel: 'INSTAGRAM',
        channelThreadId: 'instagram_akari_ghi',
        assignedStaffId: staff3.id,
        status: 'OPEN',
        tenantId: tenant.id,
      },
    })
    threads.push(thread6)

    const thread7 = await prisma.messageThread.upsert({
      where: { 
        tenantId_channel_channelThreadId: {
          tenantId: tenant.id,
          channel: 'LINE',
          channelThreadId: 'line_mai_ghi'
        }
      },
      update: {},
      create: {
        customerId: customer10.id,
        channel: 'LINE',
        channelThreadId: 'line_mai_ghi',
        assignedStaffId: staff2.id,
        status: 'OPEN',
        tenantId: tenant.id,
      },
    })
    threads.push(thread7)

    const thread8 = await prisma.messageThread.upsert({
      where: { 
        tenantId_channel_channelThreadId: {
          tenantId: tenant.id,
          channel: 'LINE',
          channelThreadId: 'line_naoya_jkl'
        }
      },
      update: {},
      create: {
        customerId: customer12.id,
        channel: 'LINE',
        channelThreadId: 'line_naoya_jkl',
        status: 'OPEN',
        tenantId: tenant.id,
      },
    })
    threads.push(thread8)

    const thread9 = await prisma.messageThread.upsert({
      where: { 
        tenantId_channel_channelThreadId: {
          tenantId: tenant.id,
          channel: 'INSTAGRAM',
          channelThreadId: 'instagram_sakura_mno'
        }
      },
      update: {},
      create: {
        customerId: customer13.id,
        channel: 'INSTAGRAM',
        channelThreadId: 'instagram_sakura_mno',
        assignedStaffId: staff1.id,
        status: 'IN_PROGRESS',
        tenantId: tenant.id,
      },
    })
    threads.push(thread9)

    const thread10 = await prisma.messageThread.upsert({
      where: { 
        tenantId_channel_channelThreadId: {
          tenantId: tenant.id,
          channel: 'LINE',
          channelThreadId: 'line_emi_pqr'
        }
      },
      update: {},
      create: {
        customerId: customer15.id,
        channel: 'LINE',
        channelThreadId: 'line_emi_pqr',
        assignedStaffId: staff5.id,
        status: 'OPEN',
        tenantId: tenant.id,
      },
    })
    threads.push(thread10)

    // スレッドタグの関連付け
    await prisma.threadTag.createMany({
      data: [
        { threadId: thread1.id, tagId: urgentTag.id },
        { threadId: thread6.id, tagId: urgentTag.id },
        { threadId: thread9.id, tagId: urgentTag.id },
        { threadId: thread3.id, tagId: followUpTag.id },
        { threadId: thread5.id, tagId: followUpTag.id },
      ],
    })

    // メッセージ作成
    await prisma.message.createMany({
      data: [
        // Thread 1 (Instagram - 田中花子)
        {
          threadId: thread1.id,
          senderType: 'CUSTOMER',
          content: '明日のカラーの件なんですが、やっぱりもう少し明るめにしたくて...😅 変更可能でしょうか？',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-09T20:30:00.000Z'),
        },
        {
          threadId: thread1.id,
          senderId: staff2.id,
          senderType: 'STAFF',
          content: '田中様、こんばんは！明るめのご希望承知いたします✨ブリーチの追加が必要になる可能性がございますが、お時間大丈夫でしょうか？',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-09T21:15:00.000Z'),
        },
        {
          threadId: thread1.id,
          senderType: 'CUSTOMER',
          content: '時間は大丈夫です！お値段はどのくらい変わりますか？',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-09T21:20:00.000Z'),
        },

        // Thread 2 (LINE - 山田太郎)
        {
          threadId: thread2.id,
          senderType: 'CUSTOMER',
          content: 'いつもお世話になっております。来週の予約を変更したいのですが...',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-08T14:00:00.000Z'),
        },
        {
          threadId: thread2.id,
          senderId: staff1.id,
          senderType: 'STAFF',
          content: '山田様、いつもありがとうございます。変更承ります。ご希望の日時をお聞かせください。',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-08T14:30:00.000Z'),
        },
        {
          threadId: thread2.id,
          senderType: 'CUSTOMER',
          content: '金曜日の夕方は空いていますでしょうか？18時以降希望です。',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-08T15:00:00.000Z'),
        },
        {
          threadId: thread2.id,
          senderId: staff1.id,
          senderType: 'STAFF',
          content: '金曜日18:30からでしたら空きがございます。いかがでしょうか？',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-08T15:15:00.000Z'),
        },

        // Thread 3 (Instagram - 佐藤美咲) - VIP顧客
        {
          threadId: thread3.id,
          senderType: 'CUSTOMER',
          content: 'こんにちは！先日のトリートメント、本当に良かったです❤️ 次回も同じメニューでお願いします',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-06T16:00:00.000Z'),
        },
        {
          threadId: thread3.id,
          senderId: staff2.id,
          senderType: 'STAFF',
          content: '佐藤様✨いつもありがとうございます！髪質改善トリートメント、効果を実感していただけて嬉しいです😊 次回のご予約はいつ頃がよろしいでしょうか？',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-06T16:30:00.000Z'),
        },

        // Thread 4 (LINE - 高橋りな) - 新規顧客
        {
          threadId: thread4.id,
          senderType: 'CUSTOMER',
          content: 'はじめまして！インスタで拝見して、ぜひお願いしたいと思いました。韓国風のヘアスタイルは得意でしょうか？',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-07T19:00:00.000Z'),
        },
        {
          threadId: thread4.id,
          senderId: staff5.id,
          senderType: 'STAFF',
          content: 'はじめまして！韓国風スタイル、とても人気で得意としております😊 どのようなスタイルをお考えでしょうか？お写真などございましたらお送りください♪',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-07T19:30:00.000Z'),
        },
        {
          threadId: thread4.id,
          senderType: 'CUSTOMER',
          content: 'ヨシンモリカットに憧れています！顔型に合うかカウンセリングでご相談したいです🥰',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-07T20:00:00.000Z'),
        },

        // Thread 5 (Instagram - 中村翔太)
        {
          threadId: thread5.id,
          senderType: 'CUSTOMER',
          content: '今度撮影があるので、少し個性的なスタイルを試してみたいです。ブリーチありでも大丈夫でしょうか？',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-05T11:00:00.000Z'),
        },
        {
          threadId: thread5.id,
          senderId: staff4.id,
          senderType: 'STAFF',
          content: '中村様！個性的なスタイル、ぜひ挑戦しましょう🔥 どのような雰囲気の撮影でしょうか？それに合わせてご提案させていただきます！',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-05T11:30:00.000Z'),
        },

        // Thread 6 (Instagram - 小林あかり) - VIP・メディア関係
        {
          threadId: thread6.id,
          senderType: 'CUSTOMER',
          content: '急で申し訳ないのですが、明日の朝一番で対応可能でしょうか？撮影が急遽入ってしまって😭',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-09T22:00:00.000Z'),
        },
        {
          threadId: thread6.id,
          senderId: staff3.id,
          senderType: 'STAFF',
          content: '小林様、お疲れ様です！明日9時からでしたら空きがございます。いつものメニューでよろしいでしょうか？',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-09T22:30:00.000Z'),
        },

        // Thread 7 (LINE - 吉田麻衣)
        {
          threadId: thread7.id,
          senderType: 'CUSTOMER',
          content: '今流行りのインナーカラーに挑戦してみたいのですが、仕事でも問題ないような控えめなものは可能でしょうか？',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-08T16:00:00.000Z'),
        },
        {
          threadId: thread7.id,
          senderId: staff2.id,
          senderType: 'STAFF',
          content: '吉田様！オフィスでも大丈夫なインナーカラー、とても人気です✨ 耳後ろや襟足部分でしたら普段は見えないので安心ですよ😊',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-08T16:30:00.000Z'),
        },

        // Thread 8 (LINE - 井上直也)
        {
          threadId: thread8.id,
          senderType: 'CUSTOMER',
          content: 'お疲れ様です。来月から海外出張が多くなるので、スタイリングが楽なカットにしたいのですが...',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-09T18:00:00.000Z'),
        },

        // Thread 9 (Instagram - 渡辺さくら) - VIP・モデル
        {
          threadId: thread9.id,
          senderType: 'CUSTOMER',
          content: '来週の撮影でロングからボブに大幅チェンジします！ウィッグ用に髪を寄付したいのですが、対応していただけますか？',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-09T15:00:00.000Z'),
        },
        {
          threadId: thread9.id,
          senderId: staff1.id,
          senderType: 'STAFF',
          content: '渡辺様✨ヘアドネーション、素晴らしい取り組みですね！もちろん対応いたします。長さや状態の確認をさせていただきますので、一度ご来店いただけますでしょうか？',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-09T15:30:00.000Z'),
        },

        // Thread 10 (LINE - 加藤えみ) - 新規
        {
          threadId: thread10.id,
          senderType: 'CUSTOMER',
          content: 'はじめまして！友達の紹介で連絡しました。学割はありますでしょうか？🙇‍♀️',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-09T12:00:00.000Z'),
        },
        {
          threadId: thread10.id,
          senderId: staff5.id,
          senderType: 'STAFF',
          content: 'はじめまして！ご紹介ありがとうございます😊 学生証をお持ちいただければ20%割引でご案内いたします♪ ご希望のメニューはございますか？',
          mediaType: 'TEXT',
          createdAt: new Date('2024-12-09T12:30:00.000Z'),
        },
      ],
    })

    // テンプレート作成
    await prisma.template.createMany({
      data: [
        {
          title: '新規予約受付',
          content: 'この度はお問い合わせいただき、ありがとうございます✨\n\nご希望のメニューとお日にちをお聞かせください。\nカウンセリングでしっかりとご相談させていただきます😊\n\nご質問等ございましたら、お気軽にお聞かせください！',
          category: '予約対応',
          createdById: adminStaff.id,
          tenantId: tenant.id,
        },
        {
          title: '予約確認',
          content: 'ご予約を承りました📝\n\n【予約詳細】\n日時：○月○日（○）○○時〜\nメニュー：\n担当：\n\n当日お気をつけてお越しください✨\nご質問がございましたらお気軽にご連絡ください♪',
          category: '予約対応',
          createdById: staff3.id,
          tenantId: tenant.id,
        },
        {
          title: '予約変更対応',
          content: 'ご連絡ありがとうございます。\n予約変更を承ります😊\n\nご希望の日時をお聞かせください。\n空き状況を確認してご連絡いたします！',
          category: '予約対応',
          createdById: staff1.id,
          tenantId: tenant.id,
        },
        {
          title: 'アフターフォロー',
          content: '本日はご来店いただき、ありがとうございました✨\n\n仕上がりはいかがでしょうか？\nスタイリング方法などご不明な点がございましたら、お気軽にお聞かせください😊\n\n次回のご来店もお待ちしております♪',
          category: 'アフターフォロー',
          createdById: staff2.id,
          tenantId: tenant.id,
        },
        {
          title: 'カラー相談',
          content: 'カラーのご相談ありがとうございます🎨\n\nお客様の髪質や普段のスタイリング、ご希望のイメージをお聞かせください。\nダメージレベルも考慮して、最適なカラーをご提案させていただきます✨',
          category: 'メニュー相談',
          createdById: staff4.id,
          tenantId: tenant.id,
        },
        {
          title: '急ぎ対応',
          content: 'お急ぎのご相談ありがとうございます。\n\n可能な限り対応させていただきたく存じます。\n空き状況を確認いたしますので、少々お待ちください🙇‍♀️',
          category: '緊急対応',
          createdById: staff3.id,
          tenantId: tenant.id,
        },
      ],
    })

    // 予約作成（20件、様々な期間・スタッフ・メニュー）
    await prisma.reservation.createMany({
      data: [
        {
          startTime: new Date('2024-12-10T10:00:00.000Z'),
          endTime: new Date('2024-12-10T12:00:00.000Z'),
          menuContent: 'イルミナカラー＋トリートメント',
          customerName: '田中花子',
          customerId: customer1.id,
          staffId: staff2.id,
          source: 'MANUAL',
          status: 'CONFIRMED',
          notes: '明るめのアッシュベージュ希望、ブリーチ追加の可能性あり',
          tenantId: tenant.id,
        },
        {
          startTime: new Date('2024-12-13T18:30:00.000Z'),
          endTime: new Date('2024-12-13T19:30:00.000Z'),
          menuContent: 'メンズカット',
          customerName: '山田太郎',
          customerId: customer2.id,
          staffId: staff1.id,
          source: 'LINE',
          status: 'CONFIRMED',
          notes: 'いつものビジネススタイル',
          tenantId: tenant.id,
        },
        {
          startTime: new Date('2024-12-12T14:00:00.000Z'),
          endTime: new Date('2024-12-12T16:30:00.000Z'),
          menuContent: '髪質改善トリートメント＋カット',
          customerName: '佐藤美咲',
          customerId: customer3.id,
          staffId: staff2.id,
          source: 'INSTAGRAM',
          status: 'CONFIRMED',
          notes: 'VIP顧客、個室希望',
          tenantId: tenant.id,
        },
        {
          startTime: new Date('2024-12-15T11:00:00.000Z'),
          endTime: new Date('2024-12-15T12:00:00.000Z'),
          menuContent: '白髪染め',
          customerName: '鈴木一郎',
          customerId: customer4.id,
          staffId: staff4.id,
          source: 'PHONE',
          status: 'CONFIRMED',
          notes: '月次定期、ナチュラルブラウン',
          tenantId: tenant.id,
        },
        {
          startTime: new Date('2024-12-14T15:00:00.000Z'),
          endTime: new Date('2024-12-14T17:00:00.000Z'),
          menuContent: 'ヨシンモリカット＋韓国風カラー',
          customerName: '高橋りな',
          customerId: customer5.id,
          staffId: staff5.id,
          source: 'LINE',
          status: 'CONFIRMED',
          notes: '学割適用、初回カウンセリング重要',
          tenantId: tenant.id,
        },
        {
          startTime: new Date('2024-12-11T13:00:00.000Z'),
          endTime: new Date('2024-12-11T15:00:00.000Z'),
          menuContent: 'パーマ＋白髪染め',
          customerName: '伊藤和子',
          customerId: customer6.id,
          staffId: staff3.id,
          source: 'HOTPEPPER',
          status: 'CONFIRMED',
          notes: 'ソフトパーマ、丁寧な対応を心がける',
          tenantId: tenant.id,
        },
        {
          startTime: new Date('2024-12-16T16:00:00.000Z'),
          endTime: new Date('2024-12-16T18:00:00.000Z'),
          menuContent: 'デザインカラー＋カット',
          customerName: '中村翔太',
          customerId: customer7.id,
          staffId: staff4.id,
          source: 'INSTAGRAM',
          status: 'CONFIRMED',
          notes: '撮影用、個性的なスタイル希望',
          tenantId: tenant.id,
        },
        {
          startTime: new Date('2024-12-10T09:00:00.000Z'),
          endTime: new Date('2024-12-10T10:30:00.000Z'),
          menuContent: 'ブローセット',
          customerName: '小林あかり',
          customerId: customer8.id,
          staffId: staff3.id,
          source: 'INSTAGRAM',
          status: 'COMPLETED',
          notes: 'TV撮影用、急ぎ対応',
          tenantId: tenant.id,
        },
        {
          startTime: new Date('2024-12-18T17:00:00.000Z'),
          endTime: new Date('2024-12-18T18:00:00.000Z'),
          menuContent: 'ビジネスカット',
          customerName: '森田健一',
          customerId: customer9.id,
          staffId: staff1.id,
          source: 'PHONE',
          status: 'CONFIRMED',
          notes: '保守的なスタイル、清潔感重視',
          tenantId: tenant.id,
        },
        {
          startTime: new Date('2024-12-17T14:30:00.000Z'),
          endTime: new Date('2024-12-17T16:00:00.000Z'),
          menuContent: 'インナーカラー＋カット',
          customerName: '吉田麻衣',
          customerId: customer10.id,
          staffId: staff2.id,
          source: 'LINE',
          status: 'CONFIRMED',
          notes: 'オフィス対応、控えめなインナーカラー',
          tenantId: tenant.id,
        },
        {
          startTime: new Date('2024-12-19T11:00:00.000Z'),
          endTime: new Date('2024-12-19T12:30:00.000Z'),
          menuContent: '海外対応カット',
          customerName: '井上直也',
          customerId: customer12.id,
          staffId: staff1.id,
          source: 'LINE',
          status: 'CONFIRMED',
          notes: 'スタイリング簡単、出張多めのため',
          tenantId: tenant.id,
        },
        {
          startTime: new Date('2024-12-20T13:00:00.000Z'),
          endTime: new Date('2024-12-20T16:00:00.000Z'),
          menuContent: 'ロング→ボブ大変身＋ヘアドネーション',
          customerName: '渡辺さくら',
          customerId: customer13.id,
          staffId: staff1.id,
          source: 'INSTAGRAM',
          status: 'CONFIRMED',
          notes: 'モデル撮影用、ヘアドネーション対応',
          tenantId: tenant.id,
        },
        {
          startTime: new Date('2024-12-21T15:00:00.000Z'),
          endTime: new Date('2024-12-21T16:00:00.000Z'),
          menuContent: 'フォーマルカット',
          customerName: '岡田雅人',
          customerId: customer14.id,
          staffId: staff3.id,
          source: 'PHONE',
          status: 'CONFIRMED',
          notes: '弁護士、フォーマルな仕上がり',
          tenantId: tenant.id,
        },
        {
          startTime: new Date('2024-12-22T11:00:00.000Z'),
          endTime: new Date('2024-12-22T13:00:00.000Z'),
          menuContent: '初回カット＋カラー',
          customerName: '加藤えみ',
          customerId: customer15.id,
          staffId: staff5.id,
          source: 'LINE',
          status: 'CONFIRMED',
          notes: '学割適用、友達紹介、大学生',
          tenantId: tenant.id,
        },
        // 外部予約システムからの予約（顧客情報未紐付け）
        {
          startTime: new Date('2024-12-11T10:00:00.000Z'),
          endTime: new Date('2024-12-11T11:30:00.000Z'),
          menuContent: 'カット＋カラー',
          customerName: '新見由香',
          customerPhone: '080-1111-2222',
          customerEmail: 'yuka.niimi@email.com',
          staffId: staff2.id,
          source: 'HOTPEPPER',
          status: 'COMPLETED',
          notes: 'ホットペッパー経由、初回来店',
          tenantId: tenant.id,
        },
        {
          startTime: new Date('2024-12-12T16:00:00.000Z'),
          endTime: new Date('2024-12-12T17:00:00.000Z'),
          menuContent: 'メンズカット',
          customerName: '橋本竜也',
          customerPhone: '090-3333-4444',
          source: 'GOOGLE_CALENDAR',
          status: 'NO_SHOW',
          notes: 'Googleカレンダー連携、無断キャンセル',
          tenantId: tenant.id,
        },
        {
          startTime: new Date('2024-12-14T12:00:00.000Z'),
          endTime: new Date('2024-12-14T13:30:00.000Z'),
          menuContent: 'パーマ',
          customerName: '木村千春',
          customerPhone: '070-5555-6666',
          staffId: staff4.id,
          source: 'WALK_IN',
          status: 'COMPLETED',
          notes: '飛び込み来店、当日対応',
          tenantId: tenant.id,
        },
        {
          startTime: new Date('2024-12-16T14:00:00.000Z'),
          endTime: new Date('2024-12-16T15:00:00.000Z'),
          menuContent: 'ヘアセット',
          customerName: '石井美和',
          customerPhone: '080-7777-8888',
          staffId: staff5.id,
          source: 'HOTPEPPER',
          status: 'CANCELLED',
          notes: '結婚式用セット予定、キャンセル',
          tenantId: tenant.id,
        },
        // 未来の予約
        {
          startTime: new Date('2024-12-25T10:00:00.000Z'),
          endTime: new Date('2024-12-25T12:00:00.000Z'),
          menuContent: 'お正月スペシャルセット',
          customerName: '佐藤美咲',
          customerId: customer3.id,
          staffId: staff2.id,
          source: 'MANUAL',
          status: 'CONFIRMED',
          notes: '年末特別メニュー、VIP対応',
          tenantId: tenant.id,
        },
        {
          startTime: new Date('2024-12-30T14:00:00.000Z'),
          endTime: new Date('2024-12-30T16:00:00.000Z'),
          menuContent: '年末デザインカラー',
          customerName: '渡辺さくら',
          customerId: customer13.id,
          staffId: staff1.id,
          source: 'INSTAGRAM',
          status: 'TENTATIVE',
          notes: '年末撮影用、仮予約',
          tenantId: tenant.id,
        },
      ],
    })

    console.log('✅ Database seeded successfully with comprehensive data')
    console.log(`📊 Created:`)
    console.log(`   - 1 tenant: ${tenant.name}`)
    console.log(`   - 6 staff members (1 admin, 1 manager, 4 staff)`)
    console.log(`   - 15 customers with diverse profiles`)
    console.log(`   - 5 tags (3 customer tags, 2 thread tags)`)
    console.log(`   - 10 message threads (Instagram & LINE)`)
    console.log(`   - 25+ realistic messages in Japanese`)
    console.log(`   - 6 message templates`)
    console.log(`   - 20 reservations (various sources: HotPepper, Google Calendar, LINE, Instagram, Phone, Walk-in)`)
    console.log(`   - Various service types: Cut, Color, Perm, Treatment, Set, etc.`)
    console.log(`   - Mix of completed, confirmed, cancelled, and no-show reservations`)

  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    throw error
  }
}