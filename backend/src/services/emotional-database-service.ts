/**
 * 💝 感動データベースサービス
 * 「美容室スタッフが『このシステム、私の心を読んでくれる！』と感じるデータベース操作」
 */

import { PrismaClient } from '@prisma/client'
import emotionalCache from '../utils/emotional-cache'
import { logger } from '../utils/logger'

class EmotionalDatabaseService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    })
  }

  /**
   * 💫 美容室スタッフが感動する顧客検索
   */
  async findCustomersWithEmotion(
    tenantId: string,
    searchParams: {
      query?: string
      limit?: number
      sortBy?: 'name' | 'lastVisitDate' | 'visitCount' | 'createdAt'
      sortOrder?: 'asc' | 'desc'
    } = {}
  ) {
    const { query, limit = 50, sortBy = 'lastVisitDate', sortOrder = 'desc' } = searchParams
    const cacheKey = `customers:${tenantId}:${JSON.stringify(searchParams)}`

    return emotionalCache.getWithEmotion(
      cacheKey,
      async () => {
        const where: any = { tenantId }

        // 💝 美容室スタッフの気持ちに寄り添う検索条件
        if (query) {
          where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { nameKana: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query } },
            { email: { contains: query, mode: 'insensitive' } }
          ]
        }

        const customers = await this.prisma.customer.findMany({
          where,
          include: {
            threads: {
              select: {
                id: true,
                status: true,
                updatedAt: true,
                messages: {
                  select: { id: true },
                  take: 1,
                  orderBy: { createdAt: 'desc' }
                }
              },
              take: 1,
              orderBy: { updatedAt: 'desc' }
            },
            reservations: {
              select: {
                id: true,
                startTime: true,
                menuContent: true,
                status: true
              },
              take: 3,
              orderBy: { startTime: 'desc' }
            },
            _count: {
              select: {
                reservations: true,
                threads: true
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          take: limit
        })

        // 💫 感動の追加情報を付与
        const enrichedCustomers = customers.map(customer => ({
          ...customer,
          // 美容室スタッフが嬉しい追加情報
          displayInfo: {
            isVIP: customer.visitCount >= 10,
            isNewCustomer: customer.visitCount <= 2,
            needsAttention: customer.lastVisitDate && 
              new Date().getTime() - new Date(customer.lastVisitDate).getTime() > 90 * 24 * 60 * 60 * 1000, // 90日以上
            birthday: customer.birthDate ? {
              isBirthdayMonth: customer.birthDate && new Date(customer.birthDate).getMonth() === new Date().getMonth(),
              daysUntilBirthday: customer.birthDate ? this.calculateDaysUntilBirthday(customer.birthDate) : null
            } : null,
            relationship: {
              totalReservations: customer._count.reservations,
              totalThreads: customer._count.threads,
              loyaltyLevel: this.calculateLoyaltyLevel(customer.visitCount, customer.firstVisitDate),
              preferredMenus: customer.reservations.reduce((acc, r) => {
                if (r.menuContent && !acc.includes(r.menuContent)) {
                  acc.push(r.menuContent)
                }
                return acc
              }, [] as string[]).slice(0, 3)
            }
          }
        }))

        logger.info('💝 顧客検索完了 - スタッフの皆様に最適な情報をお届け', {
          tenantId,
          searchQuery: query || '全顧客',
          resultCount: enrichedCustomers.length,
          userMessage: `${enrichedCustomers.length}名の大切なお客様情報を表示します`
        })

        return enrichedCustomers

      },
      {
        ttl: 300, // 5分キャッシュ
        priority: 'urgent',
        context: '顧客検索中'
      }
    )
  }

  /**
   * 📅 美容室スタッフが時間の魔法使いになる予約検索
   */
  async findReservationsWithEmotion(
    tenantId: string,
    searchParams: {
      startDate?: Date
      endDate?: Date
      staffId?: string
      status?: string
      limit?: number
    } = {}
  ) {
    const { startDate, endDate, staffId, status, limit = 100 } = searchParams
    const cacheKey = `reservations:${tenantId}:${JSON.stringify(searchParams)}`

    return emotionalCache.getWithEmotion(
      cacheKey,
      async () => {
        const where: any = { tenantId }

        if (startDate || endDate) {
          where.startTime = {}
          if (startDate) where.startTime.gte = startDate
          if (endDate) where.startTime.lte = endDate
        }

        if (staffId) where.staffId = staffId
        if (status) where.status = status

        const reservations = await this.prisma.reservation.findMany({
          where,
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                visitCount: true,
                lastVisitDate: true,
                notes: true
              }
            },
            staff: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { startTime: 'asc' },
          take: limit
        })

        // 🌟 美容室スタッフが感動する予約情報の強化
        const enrichedReservations = reservations.map(reservation => ({
          ...reservation,
          displayInfo: {
            timeUntil: this.calculateTimeUntil(reservation.startTime),
            duration: this.calculateDuration(reservation.startTime, reservation.endTime),
            customerType: reservation.customer ? {
              isVIP: reservation.customer.visitCount >= 10,
              isRegular: reservation.customer.visitCount >= 5,
              isNew: reservation.customer.visitCount <= 2
            } : null,
            specialNotes: {
              isToday: this.isToday(reservation.startTime),
              isTomorrow: this.isTomorrow(reservation.startTime),
              isThisWeek: this.isThisWeek(reservation.startTime),
              needsReminder: this.needsReminder(reservation.startTime, reservation.reminderSentAt),
              isUpcoming: reservation.startTime > new Date()
            }
          }
        }))

        logger.info('📅 予約検索完了 - 美しいスケジュールをお届け', {
          tenantId,
          dateRange: startDate && endDate ? `${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}` : '全期間',
          resultCount: enrichedReservations.length,
          userMessage: `${enrichedReservations.length}件の大切な予約をご確認ください`
        })

        return enrichedReservations

      },
      {
        ttl: 180, // 3分キャッシュ（予約は変更が多いため短め）
        priority: 'urgent',
        context: '予約確認中'
      }
    )
  }

  /**
   * 💌 美容室スタッフが愛するメッセージスレッド検索
   */
  async findMessageThreadsWithEmotion(
    tenantId: string,
    searchParams: {
      status?: string
      assignedStaffId?: string
      customerId?: string
      channel?: string
      limit?: number
    } = {}
  ) {
    const { status, assignedStaffId, customerId, channel, limit = 50 } = searchParams
    const cacheKey = `message_threads:${tenantId}:${JSON.stringify(searchParams)}`

    return emotionalCache.getWithEmotion(
      cacheKey,
      async () => {
        const where: any = { tenantId }

        if (status) where.status = status
        if (assignedStaffId) where.assignedStaffId = assignedStaffId
        if (customerId) where.customerId = customerId
        if (channel) where.channel = channel

        const threads = await this.prisma.messageThread.findMany({
          where,
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                visitCount: true,
                lastVisitDate: true,
                instagramId: true,
                lineId: true
              }
            },
            assignedStaff: {
              select: {
                id: true,
                name: true
              }
            },
            messages: {
              select: {
                id: true,
                content: true,
                senderType: true,
                createdAt: true
              },
              orderBy: { createdAt: 'desc' },
              take: 3
            },
            _count: {
              select: {
                messages: true
              }
            }
          },
          orderBy: { updatedAt: 'desc' },
          take: limit
        })

        // 💕 美容室スタッフの心に響くメッセージ情報の強化
        const enrichedThreads = threads.map(thread => {
          const lastMessage = thread.messages[0]
          const unreadCount = thread.messages.filter(m => 
            m.senderType === 'CUSTOMER' && thread.status === 'OPEN'
          ).length

          return {
            ...thread,
            lastMessage,
            unreadCount,
            displayInfo: {
              responseTime: lastMessage ? this.calculateResponseTime(lastMessage.createdAt) : null,
              customerType: thread.customer ? {
                isVIP: thread.customer.visitCount >= 10,
                isRegular: thread.customer.visitCount >= 5,
                isNew: thread.customer.visitCount <= 2,
                channelDisplay: thread.channel === 'INSTAGRAM' ? 'Instagram DM' : 'LINE'
              } : null,
              urgency: {
                isUrgent: unreadCount > 0 && thread.status === 'OPEN',
                isHigh: unreadCount > 2,
                needsResponse: lastMessage?.senderType === 'CUSTOMER' && 
                              thread.status === 'OPEN' &&
                              new Date().getTime() - new Date(lastMessage.createdAt).getTime() > 60 * 60 * 1000 // 1時間以上
              }
            }
          }
        })

        logger.info('💌 メッセージ検索完了 - お客様との心のつながりをお届け', {
          tenantId,
          filters: { status, assignedStaffId, customerId, channel },
          resultCount: enrichedThreads.length,
          unreadTotal: enrichedThreads.reduce((sum, t) => sum + t.unreadCount, 0),
          userMessage: `${enrichedThreads.length}件のメッセージスレッドをご確認ください`
        })

        return enrichedThreads

      },
      {
        ttl: 60, // 1分キャッシュ（メッセージは高頻度更新）
        priority: 'urgent',
        context: 'メッセージ確認中'
      }
    )
  }

  /**
   * 🎂 誕生日までの日数計算
   */
  private calculateDaysUntilBirthday(birthDate: Date): number {
    const today = new Date()
    const thisYear = today.getFullYear()
    const birthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate())
    
    if (birthday < today) {
      birthday.setFullYear(thisYear + 1)
    }
    
    const diffTime = birthday.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  /**
   * 💝 ロイヤルティレベル計算
   */
  private calculateLoyaltyLevel(visitCount: number, firstVisitDate?: Date): string {
    if (visitCount >= 20) return '💎 ダイヤモンド'
    if (visitCount >= 15) return '👑 プラチナ'
    if (visitCount >= 10) return '🥇 ゴールド'
    if (visitCount >= 5) return '🥈 シルバー'
    if (visitCount >= 2) return '🥉 ブロンズ'
    return '🌟 新しいお客様'
  }

  /**
   * ⏰ 時間までの計算
   */
  private calculateTimeUntil(dateTime: Date): string {
    const now = new Date()
    const diff = dateTime.getTime() - now.getTime()
    
    if (diff < 0) return '終了済み'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}日後`
    }
    if (hours > 0) {
      return `${hours}時間${minutes}分後`
    }
    return `${minutes}分後`
  }

  /**
   * ⏱️ 所要時間計算
   */
  private calculateDuration(startTime: Date, endTime: Date): string {
    const diff = endTime.getTime() - startTime.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`
    }
    return `${minutes}分`
  }

  /**
   * 📅 日付判定ヘルパー
   */
  private isToday(date: Date): boolean {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  private isTomorrow(date: Date): boolean {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return date.toDateString() === tomorrow.toDateString()
  }

  private isThisWeek(date: Date): boolean {
    const now = new Date()
    const oneWeek = 7 * 24 * 60 * 60 * 1000
    return date.getTime() - now.getTime() <= oneWeek
  }

  private needsReminder(startTime: Date, reminderSentAt?: Date): boolean {
    if (reminderSentAt) return false
    
    const now = new Date()
    const timeUntil = startTime.getTime() - now.getTime()
    const oneDayInMs = 24 * 60 * 60 * 1000
    
    return timeUntil <= oneDayInMs && timeUntil > 0
  }

  /**
   * ⏰ レスポンス時間計算
   */
  private calculateResponseTime(messageTime: Date): string {
    const now = new Date()
    const diff = now.getTime() - messageTime.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}日前`
    if (hours > 0) return `${hours}時間前`
    if (minutes > 0) return `${minutes}分前`
    return '今'
  }

  /**
   * 🌙 データベース接続終了時のクリーンアップ
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect()
    logger.info('💫 美容室データベースサービス終了 - 今日も一日お疲れ様でした')
  }
}

// 美容室専用感動データベースサービス
export const emotionalDB = new EmotionalDatabaseService()
export default emotionalDB