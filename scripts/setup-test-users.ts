import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// テストユーザー設定
const TEST_SALON_ID = 'test-salon-001'
const TEST_USERS_COUNT = 20

async function setupTestEnvironment() {
  console.log('🚀 テスト環境セットアップ開始...')

  try {
    // 1. テスト用美容室（テナント）作成
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        id: TEST_SALON_ID,
        name: 'テストサロン',
        email: 'test@salon.jp',
        phone: '03-1234-5678',
        address: '東京都渋谷区テスト1-2-3',
        plan: 'standard',
        isActive: true
      })
      .select()
      .single()

    if (tenantError && !tenantError.message.includes('duplicate')) {
      throw tenantError
    }

    console.log('✅ テスト美容室作成完了')

    // 2. テストユーザー作成
    const testUsers = []
    
    // 管理者アカウント
    testUsers.push({
      email: 'admin@test-salon.jp',
      password: 'TestAdmin2024!',
      name: 'テスト管理者',
      role: 'ADMIN'
    })

    // 一般テストユーザー
    for (let i = 1; i <= TEST_USERS_COUNT - 1; i++) {
      testUsers.push({
        email: `tester${i}@test-salon.jp`,
        password: `TestUser${i}2024!`,
        name: `テストユーザー${i}`,
        role: 'STAFF'
      })
    }

    // ユーザー作成
    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10)
      
      const { error: userError } = await supabase
        .from('staff')
        .insert({
          email: user.email,
          password: hashedPassword,
          name: user.name,
          role: user.role,
          tenantId: TEST_SALON_ID,
          isActive: true
        })

      if (userError && !userError.message.includes('duplicate')) {
        console.error(`❌ ユーザー作成エラー (${user.email}):`, userError)
      } else {
        console.log(`✅ ${user.name} (${user.email}) 作成完了`)
      }
    }

    // 3. テストデータ作成
    await createTestData()

    console.log('\n🎉 テスト環境セットアップ完了！')
    console.log('\n📋 テストユーザー情報:')
    console.log('=====================================')
    testUsers.forEach(user => {
      console.log(`${user.name}:`)
      console.log(`  メール: ${user.email}`)
      console.log(`  パスワード: ${user.password}`)
      console.log('-------------------------------------')
    })

  } catch (error) {
    console.error('❌ セットアップエラー:', error)
    process.exit(1)
  }
}

async function createTestData() {
  // テスト顧客データ
  const testCustomers = [
    {
      name: 'テスト顧客A',
      nameKana: 'テストコキャクエー',
      email: 'customer-a@test.jp',
      phone: '090-1111-1111',
      tenantId: TEST_SALON_ID
    },
    {
      name: 'テスト顧客B',
      nameKana: 'テストコキャクビー',
      email: 'customer-b@test.jp',
      phone: '090-2222-2222',
      tenantId: TEST_SALON_ID
    }
  ]

  for (const customer of testCustomers) {
    await supabase.from('customers').insert(customer)
  }

  // テストメニューデータ
  const testMenus = [
    {
      name: 'カット',
      price: 3500,
      durationMin: 30,
      tenantId: TEST_SALON_ID
    },
    {
      name: 'カラー',
      price: 5000,
      durationMin: 90,
      tenantId: TEST_SALON_ID
    },
    {
      name: 'パーマ',
      price: 8000,
      durationMin: 120,
      tenantId: TEST_SALON_ID
    }
  ]

  for (const menu of testMenus) {
    await supabase.from('menus').insert(menu)
  }

  console.log('✅ テストデータ作成完了')
}

// 実行
setupTestEnvironment()