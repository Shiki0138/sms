import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AutoMessageService } from '../services/autoMessageService';
import { logger } from '../utils/logger';
import { 
  requireMarketing, 
  requireAnalytics,
  limitAIReplies,
  addPlanInfo 
} from '../middleware/planRestriction';

const router = express.Router();
const prisma = new PrismaClient();

// 認証ミドルウェアを適用
router.use(authenticate);
router.use(addPlanInfo);

/**
 * リマインダー設定取得
 */
router.get('/settings', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;

    // テナント設定を取得
    const settings = await prisma.tenantSetting.findMany({
      where: {
        tenantId,
        key: {
          in: [
            'auto_reminder_enabled',
            'auto_followup_enabled',
            'email_reminder_enabled',
            'line_reminder_enabled',
            'instagram_reminder_enabled'
          ]
        }
      }
    });

    // デフォルト値を設定
    const defaultSettings = {
      autoReminderEnabled: true,
      autoFollowupEnabled: true,
      emailReminderEnabled: true,
      lineReminderEnabled: true,
      instagramReminderEnabled: true
    };

    // 設定値をマッピング
    const currentSettings = { ...defaultSettings };
    settings.forEach(setting => {
      switch (setting.key) {
        case 'auto_reminder_enabled':
          currentSettings.autoReminderEnabled = setting.value === 'true';
          break;
        case 'auto_followup_enabled':
          currentSettings.autoFollowupEnabled = setting.value === 'true';
          break;
        case 'email_reminder_enabled':
          currentSettings.emailReminderEnabled = setting.value === 'true';
          break;
        case 'line_reminder_enabled':
          currentSettings.lineReminderEnabled = setting.value === 'true';
          break;
        case 'instagram_reminder_enabled':
          currentSettings.instagramReminderEnabled = setting.value === 'true';
          break;
      }
    });

    // メッセージテンプレートも取得
    const templates = await prisma.autoMessageTemplate.findMany({
      where: {
        tenantId,
        type: {
          in: ['REMINDER_1_WEEK', 'REMINDER_3_DAYS', 'FOLLOWUP_VISIT']
        }
      }
    });

    const templateMap: Record<string, any> = {};
    templates.forEach(template => {
      templateMap[template.type] = {
        id: template.id,
        title: template.title,
        content: template.content,
        isActive: template.isActive
      };
    });

    res.json({
      success: true,
      data: {
        settings: currentSettings,
        templates: templateMap
      }
    });
  } catch (error) {
    logger.error('Failed to get reminder settings:', error);
    res.status(500).json({
      success: false,
      error: 'リマインダー設定の取得に失敗しました'
    });
  }
});

/**
 * リマインダー設定更新
 */
router.post('/settings', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const {
      autoReminderEnabled,
      autoFollowupEnabled,
      emailReminderEnabled,
      lineReminderEnabled,
      instagramReminderEnabled
    } = req.body;

    // 設定を更新
    const settingsToUpdate = [
      { key: 'auto_reminder_enabled', value: String(autoReminderEnabled) },
      { key: 'auto_followup_enabled', value: String(autoFollowupEnabled) },
      { key: 'email_reminder_enabled', value: String(emailReminderEnabled) },
      { key: 'line_reminder_enabled', value: String(lineReminderEnabled) },
      { key: 'instagram_reminder_enabled', value: String(instagramReminderEnabled) }
    ];

    for (const setting of settingsToUpdate) {
      await prisma.tenantSetting.upsert({
        where: {
          tenantId_key: {
            tenantId,
            key: setting.key
          }
        },
        update: {
          value: setting.value
        },
        create: {
          tenantId,
          key: setting.key,
          value: setting.value
        }
      });
    }

    logger.info(`Reminder settings updated for tenant ${tenantId}`, {
      autoReminderEnabled,
      autoFollowupEnabled,
      emailReminderEnabled,
      lineReminderEnabled,
      instagramReminderEnabled
    });

    res.json({
      success: true,
      message: 'リマインダー設定を保存しました'
    });
  } catch (error) {
    logger.error('Failed to update reminder settings:', error);
    res.status(500).json({
      success: false,
      error: 'リマインダー設定の保存に失敗しました'
    });
  }
});

/**
 * メッセージテンプレート更新
 */
router.post('/templates', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { type, title, content, isActive } = req.body;

    if (!type || !title || !content) {
      res.status(400).json({
        success: false,
        error: 'テンプレートタイプ、タイトル、内容は必須です'
      });
      return;
    }

    const validTypes = ['REMINDER_1_WEEK', 'REMINDER_3_DAYS', 'FOLLOWUP_VISIT'];
    if (!validTypes.includes(type)) {
      res.status(400).json({
        success: false,
        error: '無効なテンプレートタイプです'
      });
      return;
    }

    await prisma.autoMessageTemplate.upsert({
      where: {
        tenantId_type: {
          tenantId,
          type
        }
      },
      update: {
        title,
        content,
        isActive: isActive !== false
      },
      create: {
        tenantId,
        type,
        title,
        content,
        isActive: isActive !== false
      }
    });

    logger.info(`Message template updated for tenant ${tenantId}`, { type, title });

    res.json({
      success: true,
      message: 'メッセージテンプレートを保存しました'
    });
  } catch (error) {
    logger.error('Failed to update message template:', error);
    res.status(500).json({
      success: false,
      error: 'メッセージテンプレートの保存に失敗しました'
    });
  }
});

/**
 * テスト送信（特定の顧客への優先順位テスト）
 * スタンダード以上のプランでマーケティング機能が必要
 */
router.post('/test/:customerId', requireMarketing, limitAIReplies, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { customerId } = req.params;
    const { message = 'テストメッセージです。これは優先順位テスト用の送信です。' } = req.body;

    // 顧客が存在し、同じテナントに属するかチェック
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId
      }
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        error: '顧客が見つかりません'
      });
      return;
    }

    // 優先順位テストを実行
    const result = await AutoMessageService.testChannelPriority(customerId, message);

    logger.info(`Test reminder sent for customer ${customerId}`, result);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Failed to send test reminder:', error);
    res.status(500).json({
      success: false,
      error: 'テスト送信に失敗しました'
    });
  }
});

/**
 * 接続テスト（全チャネル）
 */
router.post('/test-connections', async (req, res) => {
  try {
    const result = await AutoMessageService.testAllConnections();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Failed to test connections:', error);
    res.status(500).json({
      success: false,
      error: '接続テストに失敗しました'
    });
  }
});

/**
 * 統計情報取得
 * 分析機能が必要（スタンダード以上）
 */
router.get('/stats', requireAnalytics, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const days = parseInt(req.query.days as string) || 30;

    const stats = await AutoMessageService.getChannelStats(tenantId, days);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Failed to get reminder stats:', error);
    res.status(500).json({
      success: false,
      error: '統計情報の取得に失敗しました'
    });
  }
});

/**
 * 手動実行（即座にリマインダー処理を実行）
 * マーケティング自動化機能が必要（スタンダード以上）
 */
router.post('/run-now', requireMarketing, async (req, res) => {
  try {
    const { type } = req.body;

    switch (type) {
      case 'week':
        await AutoMessageService.processWeekReminders();
        break;
      case '3days':
        await AutoMessageService.processDayReminders();
        break;
      case 'followup':
        await AutoMessageService.processFollowUpMessages();
        break;
      case 'all':
        await AutoMessageService.processAllMessages();
        break;
      default:
        res.status(400).json({
          success: false,
          error: '無効な実行タイプです'
        });
        return;
    }

    logger.info(`Manual reminder execution completed: ${type}`);

    res.json({
      success: true,
      message: 'リマインダー処理を実行しました'
    });
  } catch (error) {
    logger.error('Failed to run manual reminder:', error);
    res.status(500).json({
      success: false,
      error: 'リマインダー処理の実行に失敗しました'
    });
  }
});

/**
 * ログ一覧取得
 */
router.get('/logs', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.autoMessageLog.findMany({
        where: { tenantId },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.autoMessageLog.count({
        where: { tenantId }
      })
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get reminder logs:', error);
    res.status(500).json({
      success: false,
      error: 'ログの取得に失敗しました'
    });
  }
});

export default router;