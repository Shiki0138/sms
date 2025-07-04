import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { generateTenantId, generateStaffId } from '../utils/idGenerator'

const prisma = new PrismaClient()

// 20人の経営者用管理者ID準備
export const prepare20Managers = async (req: Request, res: Response) => {
  try {
    const managerData = []
    const tenantData = []

    // 20人の経営者データ
    const managerNames = [
      '田中サロン', '佐藤美容室', '鈴木ヘアスタジオ', '高橋美容院', '渡辺サロン',
      '伊藤ビューティー', '山本ヘアメイク', '中村美容室', '小林サロン', '加藤美容院',
      '吉田ヘアサロン', '山田美容室', '松本サロン', '井上美容院', '木村ヘアスタジオ',
      '林美容室', '清水サロン', '山崎美容院', '森ヘアサロン', '池田美容室'
    ]

    const cities = [
      '東京', '大阪', '名古屋', '横浜', '福岡', '札幌', '神戸', '京都', '広島', '仙台',
      '千葉', '川崎', '北九州', '新潟', '浜松', '熊本', '岡山', '鹿児島', '金沢', '長崎'
    ]

    for (let i = 1; i <= 20; i++) {
      const tenantId = generateTenantId()
      const staffId = generateStaffId()
      const email = `manager${i}@test-salon.com`
      const defaultPassword = `Manager${i}2025!`
      const hashedPassword = await bcrypt.hash(defaultPassword, 12)

      // テナント作成
      tenantData.push({
        id: tenantId,
        name: managerNames[i - 1],
        address: `${cities[i - 1]}市テスト区1-${i}-1`,
        phone: `03-${String(1000 + i).padStart(4, '0')}-${String(i * 11).padStart(4, '0')}`,
        email: email,
        plan: 'premium_ai',
        isActive: true
      })

      // 管理者スタッフ作成
      managerData.push({
        id: staffId,
        email: email,
        password: hashedPassword,
        name: `${managerNames[i - 1]}経営者`,
        role: 'ADMIN',
        isActive: true,
        tenantId: tenantId,
        originalPassword: defaultPassword // レスポンス用（DBには保存しない）
      })
    }

    // テナント一括作成
    await prisma.tenant.createMany({
      data: tenantData
    })

    // 管理者一括作成（originalPasswordを除く）
    const staffDataForDB = managerData.map(({ originalPassword, ...rest }) => rest)
    await prisma.staff.createMany({
      data: staffDataForDB
    })

    // 各テナントにテストモード設定追加
    const settingsData = []
    for (const tenant of tenantData) {
      settingsData.push(
        {
          tenantId: tenant.id,
          key: 'test_mode',
          value: 'true'
        },
        {
          tenantId: tenant.id,
          key: 'manager_demo_account',
          value: 'true'
        },
        {
          tenantId: tenant.id,
          key: 'created_for_demo',
          value: new Date().toISOString()
        }
      )
    }

    await prisma.tenantSetting.createMany({
      data: settingsData
    })

    // 管理者情報をパスワード付きで返す（初回のみ）
    const managersWithPasswords = managerData.map(manager => ({
      tenantId: manager.tenantId,
      tenantName: tenantData.find(t => t.id === manager.tenantId)?.name,
      email: manager.email,
      name: manager.name,
      password: manager.originalPassword,
      loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:4003'}/login`
    }))

    res.status(201).json({
      success: true,
      message: '20人の経営者用管理者アカウントを準備しました',
      data: {
        managers: managersWithPasswords,
        totalCount: 20,
        note: 'パスワードは初回表示のみです。必要に応じて保存してください。'
      }
    })

  } catch (error) {
    console.error('20人管理者準備エラー:', error)
    res.status(500).json({
      success: false,
      message: '管理者アカウントの準備に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// 準備済み管理者一覧取得（パスワードなし）
export const getManagerList = async (req: Request, res: Response) => {
  try {
    const managers = await prisma.staff.findMany({
      where: {
        role: 'ADMIN',
        tenant: {
          settings: {
            some: {
              key: 'manager_demo_account',
              value: 'true'
            }
          }
        }
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            isActive: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    const managerList = managers.map(manager => ({
      id: manager.id,
      email: manager.email,
      name: manager.name,
      isActive: manager.isActive,
      lastLoginAt: manager.lastLoginAt,
      tenant: manager.tenant,
      createdAt: manager.createdAt
    }))

    res.json({
      success: true,
      data: {
        managers: managerList,
        totalCount: managerList.length
      }
    })

  } catch (error) {
    console.error('管理者一覧取得エラー:', error)
    res.status(500).json({
      success: false,
      message: '管理者一覧の取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// 全デモアカウント削除
export const cleanupAllDemoAccounts = async (req: Request, res: Response) => {
  try {
    const { confirmPassword } = req.body

    if (confirmPassword !== 'DELETE_ALL_DEMO_ACCOUNTS_CONFIRM') {
      return res.status(400).json({
        success: false,
        message: '削除確認パスワードが正しくありません'
      })
    }

    // デモアカウントのテナントID取得
    const demoTenants = await prisma.tenant.findMany({
      where: {
        settings: {
          some: {
            key: 'manager_demo_account',
            value: 'true'
          }
        }
      },
      select: { id: true }
    })

    const tenantIds = demoTenants.map(t => t.id)

    // 関連データを順序立てて削除
    await prisma.tenantSetting.deleteMany({
      where: { tenantId: { in: tenantIds } }
    })

    await prisma.staff.deleteMany({
      where: { tenantId: { in: tenantIds } }
    })

    const deletedTenants = await prisma.tenant.deleteMany({
      where: { id: { in: tenantIds } }
    })

    res.json({
      success: true,
      message: 'デモアカウントを完全に削除しました',
      deletedCount: deletedTenants.count
    })

  } catch (error) {
    console.error('デモアカウント削除エラー:', error)
    res.status(500).json({
      success: false,
      message: 'デモアカウントの削除に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}