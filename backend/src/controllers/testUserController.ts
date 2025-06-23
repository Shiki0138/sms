import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { generateTenantId, generateStaffId, generateCustomerId } from '../utils/idGenerator'

const prisma = new PrismaClient()

// テスト用管理者アカウント作成
export const createTestAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password, tenantName } = req.body

    // テスト用テナント作成
    const tenant = await prisma.tenant.create({
      data: {
        id: generateTenantId(),
        name: tenantName || 'テスト美容室',
        address: 'テスト住所',
        phone: '03-1234-5678',
        email: 'test@example.com',
        plan: 'premium_ai',
        isActive: true
      }
    })

    // 管理者パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12)

    // テスト用管理者アカウント作成
    const admin = await prisma.staff.create({
      data: {
        id: generateStaffId(),
        email: email,
        password: hashedPassword,
        name: 'テスト管理者',
        role: 'ADMIN',
        isActive: true,
        tenantId: tenant.id
      }
    })

    // 管理者用設定作成
    await prisma.tenantSetting.createMany({
      data: [
        {
          tenantId: tenant.id,
          key: 'test_mode',
          value: 'true'
        },
        {
          tenantId: tenant.id,
          key: 'test_start_time',
          value: new Date().toISOString()
        },
        {
          tenantId: tenant.id,
          key: 'auto_cleanup_enabled',
          value: 'true'
        }
      ]
    })

    res.status(201).json({
      success: true,
      message: 'テスト管理者アカウントが作成されました',
      data: {
        tenantId: tenant.id,
        adminId: admin.id,
        email: admin.email,
        testMode: true
      }
    })

  } catch (error) {
    console.error('テスト管理者作成エラー:', error)
    res.status(500).json({
      success: false,
      message: 'テスト管理者アカウントの作成に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// テスト用ユーザー20名一括作成
export const createTestUsers = async (req: Request, res: Response) => {
  try {
    const { tenantId, count = 20 } = req.body

    const testUsers = []
    const testCustomers = []

    // テスト用スタッフアカウント作成（5名）
    for (let i = 1; i <= 5; i++) {
      const hashedPassword = await bcrypt.hash(`teststaff${i}`, 12)
      
      testUsers.push({
        id: generateStaffId(),
        email: `teststaff${i}@test.com`,
        password: hashedPassword,
        name: `テストスタッフ${i}`,
        role: i === 1 ? 'MANAGER' : 'STAFF',
        isActive: true,
        tenantId: tenantId
      })
    }

    // テスト用顧客アカウント作成（15名）
    const customerNames = [
      '田中花子', '佐藤美咲', '鈴木愛', '高橋麻衣', '渡辺優子',
      '伊藤真理', '山本彩', '中村美穂', '小林由香', '加藤理恵',
      '吉田明美', '山田千春', '松本美樹', '井上綾子', '木村直美'
    ]

    for (let i = 0; i < 15; i++) {
      testCustomers.push({
        id: generateCustomerId(),
        name: customerNames[i],
        email: `testcustomer${i + 1}@test.com`,
        phone: `090-1234-${String(i + 1).padStart(4, '0')}`,
        birthday: new Date(1990 + (i % 20), i % 12, (i % 28) + 1),
        gender: i % 2 === 0 ? 'female' : 'male',
        tenantId: tenantId,
        notes: `テスト顧客${i + 1}の詳細情報`,
        isActive: true
      })
    }

    // データベースに一括作成
    await prisma.staff.createMany({
      data: testUsers
    })

    await prisma.customer.createMany({
      data: testCustomers
    })

    // テスト用予約データ作成
    const testReservations = []
    const now = new Date()
    
    for (let i = 0; i < 10; i++) {
      const reservationDate = new Date(now.getTime() + (i * 24 * 60 * 60 * 1000))
      testReservations.push({
        tenantId: tenantId,
        customerId: testCustomers[i % testCustomers.length].id,
        staffId: testUsers[i % testUsers.length].id,
        startTime: reservationDate,
        endTime: new Date(reservationDate.getTime() + (2 * 60 * 60 * 1000)), // 2時間後
        service: ['カット', 'カラー', 'パーマ', 'トリートメント'][i % 4],
        status: 'confirmed',
        source: 'MANUAL'
      })
    }

    await prisma.reservation.createMany({
      data: testReservations
    })

    // テスト開始記録
    await prisma.tenantSetting.upsert({
      where: {
        tenantId_key: {
          tenantId: tenantId,
          key: 'test_users_created'
        }
      },
      update: {
        value: 'true'
      },
      create: {
        tenantId: tenantId,
        key: 'test_users_created',
        value: 'true'
      }
    })

    res.status(201).json({
      success: true,
      message: `テストユーザー${count}名を作成しました`,
      data: {
        staffCount: testUsers.length,
        customerCount: testCustomers.length,
        reservationCount: testReservations.length,
        tenantId: tenantId
      }
    })

  } catch (error) {
    console.error('テストユーザー作成エラー:', error)
    res.status(500).json({
      success: false,
      message: 'テストユーザーの作成に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// テストデータ一括削除
export const cleanupTestData = async (req: Request, res: Response) => {
  try {
    const { tenantId, confirmPassword } = req.body

    // セキュリティチェック: パスワード確認
    if (confirmPassword !== 'DELETE_ALL_TEST_DATA_CONFIRM') {
      return res.status(400).json({
        success: false,
        message: '削除確認パスワードが正しくありません'
      })
    }

    // テストモードの確認
    const testModeSetting = await prisma.tenantSetting.findUnique({
      where: {
        tenantId_key: {
          tenantId: tenantId,
          key: 'test_mode'
        }
      }
    })

    if (!testModeSetting || testModeSetting.value !== 'true') {
      return res.status(400).json({
        success: false,
        message: 'テストモード以外のデータは削除できません'
      })
    }

    // 関連データを順序立てて削除
    const deletedCounts = {
      reservations: 0,
      customers: 0,
      staff: 0,
      settings: 0,
      tenant: 0
    }

    // 予約データ削除
    const reservationResult = await prisma.reservation.deleteMany({
      where: { tenantId: tenantId }
    })
    deletedCounts.reservations = reservationResult.count

    // 顧客データ削除
    const customerResult = await prisma.customer.deleteMany({
      where: { tenantId: tenantId }
    })
    deletedCounts.customers = customerResult.count

    // スタッフデータ削除（管理者以外）
    const staffResult = await prisma.staff.deleteMany({
      where: { 
        tenantId: tenantId,
        role: { not: 'ADMIN' }
      }
    })
    deletedCounts.staff = staffResult.count

    // 設定データ削除
    const settingsResult = await prisma.tenantSetting.deleteMany({
      where: { tenantId: tenantId }
    })
    deletedCounts.settings = settingsResult.count

    // テナント削除（管理者も含む）
    await prisma.staff.deleteMany({
      where: { tenantId: tenantId }
    })

    await prisma.tenant.delete({
      where: { id: tenantId }
    })
    deletedCounts.tenant = 1

    res.json({
      success: true,
      message: 'テストデータの削除が完了しました',
      deletedCounts: deletedCounts
    })

  } catch (error) {
    console.error('テストデータ削除エラー:', error)
    res.status(500).json({
      success: false,
      message: 'テストデータの削除に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// テストユーザー一覧取得
export const getTestUsers = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params

    const staff = await prisma.staff.findMany({
      where: { tenantId: tenantId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true
      }
    })

    const customers = await prisma.customer.findMany({
      where: { tenantId: tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true
      }
    })

    const reservations = await prisma.reservation.findMany({
      where: { tenantId: tenantId },
      include: {
        customer: { select: { name: true } },
        staff: { select: { name: true } }
      }
    })

    res.json({
      success: true,
      data: {
        staff: staff,
        customers: customers,
        reservations: reservations,
        summary: {
          staffCount: staff.length,
          customerCount: customers.length,
          reservationCount: reservations.length
        }
      }
    })

  } catch (error) {
    console.error('テストユーザー取得エラー:', error)
    res.status(500).json({
      success: false,
      message: 'テストユーザーの取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}