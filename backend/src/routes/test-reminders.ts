import express from 'express';
import { AutoMessageService } from '../services/autoMessageService';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * 優先順位テスト用のシンプルなエンドポイント
 * 認証なしでテスト可能
 */
router.post('/priority-test', async (req, res) => {
  try {
    const testResult = {
      timestamp: new Date().toISOString(),
      priorityOrder: ['LINE', 'Instagram', 'Email'],
      testScenarios: [
        {
          name: 'すべてのチャネルが利用可能',
          customer: {
            lineId: 'U1234567890abcdef',
            instagramId: 'instagram_user_123',
            email: 'test@example.com'
          },
          expectedChannel: 'LINE'
        },
        {
          name: 'LINEなし、Instagram・Email利用可能',
          customer: {
            lineId: null,
            instagramId: 'instagram_user_456',
            email: 'test2@example.com'
          },
          expectedChannel: 'Instagram'
        },
        {
          name: 'Emailのみ利用可能',
          customer: {
            lineId: null,
            instagramId: null,
            email: 'test3@example.com'
          },
          expectedChannel: 'Email'
        }
      ]
    };

    // 実際のチャネル優先順位をテスト
    const actualResults = testResult.testScenarios.map(scenario => {
      const channels = AutoMessageService.getCustomerChannels(scenario.customer);
      return {
        ...scenario,
        actualChannels: channels.map(c => c.channel),
        firstChannel: channels.length > 0 ? channels[0].channel : null,
        matches: channels.length > 0 && channels[0].channel === scenario.expectedChannel
      };
    });

    logger.info('Priority test executed', { results: actualResults });

    res.json({
      success: true,
      message: '優先順位テストが完了しました',
      data: {
        ...testResult,
        actualResults,
        summary: {
          totalTests: actualResults.length,
          passed: actualResults.filter(r => r.matches).length,
          failed: actualResults.filter(r => !r.matches).length
        }
      }
    });
  } catch (error) {
    logger.error('Priority test failed:', error);
    res.status(500).json({
      success: false,
      error: 'テストの実行に失敗しました'
    });
  }
});

/**
 * 接続テスト用エンドポイント
 */
router.get('/connection-test', async (req, res) => {
  try {
    const connections = await AutoMessageService.testAllConnections();
    
    const summary = {
      totalServices: 3,
      connected: Object.values(connections).filter(Boolean).length,
      disconnected: Object.values(connections).filter(v => !v).length
    };

    res.json({
      success: true,
      message: '接続テストが完了しました',
      data: {
        connections,
        summary,
        recommendations: {
          line: connections.line ? '✓ 接続OK' : '✗ LINE_CHANNEL_ACCESS_TOKENを設定してください',
          instagram: connections.instagram ? '✓ 接続OK' : '✗ INSTAGRAM_ACCESS_TOKEN、INSTAGRAM_PAGE_IDを設定してください',
          email: connections.email ? '✓ 接続OK' : '✗ SMTP設定を確認してください'
        }
      }
    });
  } catch (error) {
    logger.error('Connection test failed:', error);
    res.status(500).json({
      success: false,
      error: '接続テストに失敗しました'
    });
  }
});

/**
 * 設定ガイド
 */
router.get('/setup-guide', (req, res) => {
  res.json({
    success: true,
    data: {
      title: '優先順位付きリマインダーシステム セットアップガイド',
      priority: {
        description: 'メッセージ送信の優先順位',
        order: [
          { rank: 1, channel: 'LINE', description: '最優先 - 即座に配信される' },
          { rank: 2, channel: 'Instagram', description: '2番目 - LINEが利用できない場合' },
          { rank: 3, channel: 'Email', description: '最後 - 他のチャネルが利用できない場合' }
        ]
      },
      setup: {
        line: {
          description: 'LINE Messaging API設定',
          steps: [
            '1. LINE Developersコンソールでチャネルを作成',
            '2. Channel Access Tokenを取得',
            '3. 環境変数 LINE_CHANNEL_ACCESS_TOKEN に設定',
            '4. Webhookを設定（オプション）'
          ],
          env: 'LINE_CHANNEL_ACCESS_TOKEN=your-line-channel-access-token'
        },
        instagram: {
          description: 'Instagram Graph API設定',
          steps: [
            '1. Facebook for DevelopersでInstagramビジネスアカウントを接続',
            '2. Page Access Tokenを取得',
            '3. 環境変数に設定',
            '4. Instagram基本表示またはInstagram管理権限を取得'
          ],
          env: [
            'INSTAGRAM_ACCESS_TOKEN=your-instagram-access-token',
            'INSTAGRAM_PAGE_ID=your-instagram-page-id'
          ]
        },
        email: {
          description: 'SMTP設定',
          steps: [
            '1. SMTPサーバー情報を準備',
            '2. Gmail使用の場合はアプリパスワードを生成',
            '3. 環境変数に設定'
          ],
          env: [
            'SMTP_HOST=smtp.gmail.com',
            'SMTP_PORT=587',
            'SMTP_USER=your-email@gmail.com',
            'SMTP_PASS=your-app-password',
            'SMTP_FROM=noreply@salon-system.com'
          ]
        }
      },
      endpoints: {
        description: 'テスト用エンドポイント',
        list: [
          'POST /api/v1/test-reminders/priority-test - 優先順位ロジックテスト',
          'GET /api/v1/test-reminders/connection-test - 接続テスト',
          'GET /api/v1/test-reminders/setup-guide - このガイド'
        ]
      }
    }
  });
});

export default router;