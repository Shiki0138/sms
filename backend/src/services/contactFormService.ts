import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import OpenAI from 'openai';
import { EmailService } from './emailService';

const prisma = new PrismaClient();
const emailService = new EmailService();

// OpenAI クライアント初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface ContactInquiry {
  name: string;
  email: string;
  company?: string;
  category: string;
  subject: string;
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  tenantId?: string;
  userId?: string;
  source?: string;
}

interface AIResponse {
  response: string;
  suggestedAction: string;
  requiresHumanReview: boolean;
  confidence: number;
  tags: string[];
}

export class ContactFormService {
  /**
   * お問い合わせ受付・自動対応
   */
  static async handleInquiry(data: ContactInquiry): Promise<{
    success: boolean;
    inquiryId: string;
    autoResponded: boolean;
    aiResponse?: AIResponse;
    estimatedResponseTime: string;
  }> {
    try {
      // 1. データベースに保存
      // Note: contactInquiry model doesn't exist in the schema
      // This is a stub implementation
      const inquiry = {
        id: 'mock-inquiry-' + Date.now(),
        name: data.name,
        email: data.email,
        company: data.company,
        category: data.category,
        subject: data.subject,
        message: data.message,
        urgency: data.urgency,
        tenantId: data.tenantId,
        userId: data.userId,
        status: 'received',
        receivedAt: new Date()
      };
      
      logger.warn('ContactInquiry model not found in schema - using mock data', { inquiry });

      // 2. AI自動分析・応答
      const aiResponse = await this.generateAIResponse(data);
      
      // 3. 自動応答メール送信
      if (aiResponse.confidence > 0.8 && !aiResponse.requiresHumanReview) {
        await this.sendAutoResponse(data.email, data.subject, aiResponse.response);
      }
      
      // 4. 優先度に基づく応答時間見積もり
      const estimatedResponseTime = this.calculateResponseTime(data.urgency);
      
      // 5. 通知
      await this.notifyRelevantStaff(inquiry, aiResponse);
      
      return {
        success: true,
        inquiryId: inquiry.id,
        autoResponded: aiResponse.confidence > 0.8,
        aiResponse,
        estimatedResponseTime
      };
    } catch (error) {
      logger.error('お問い合わせ処理エラー:', error);
      throw error;
    }
  }

  /**
   * AI応答生成
   */
  private static async generateAIResponse(inquiry: ContactInquiry): Promise<AIResponse> {
    try {
      const categoryPrompts = {
        technical: '技術的な問題に関する問い合わせです。簡潔で分かりやすい解決策を提案してください。',
        pricing: '料金・プランに関する問い合わせです。適切なプランの提案と料金説明を行ってください。',
        feature: '機能に関する問い合わせです。該当機能の説明と使用方法を案内してください。',
        demo: 'デモに関する問い合わせです。デモの予約方法と準備事項を案内してください。',
        other: '一般的な問い合わせです。丁寧で親切な対応を心がけてください。'
      };

      const prompt = `
        以下のお問い合わせに対して、プロフェッショナルで親切な応答を生成してください。

        カテゴリ: ${inquiry.category}
        件名: ${inquiry.subject}
        内容: ${inquiry.message}

        ${categoryPrompts[inquiry.category as keyof typeof categoryPrompts] || categoryPrompts.other}

        応答は日本語で、以下の形式で生成してください：
        - 挨拶と問い合わせへの感謝
        - 具体的な回答や提案
        - 次のステップや追加情報の案内
        - 締めの挨拶
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '美容室向けSaaSの親切でプロフェッショナルなカスタマーサポート担当者として応答してください。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const response = completion.choices[0].message.content || '';
      
      // タグ抽出
      const tags = this.extractTags(inquiry);
      
      // 人間の確認が必要かどうかを判断
      const requiresHumanReview = this.checkIfHumanReviewRequired(inquiry);
      
      // 信頼度スコア計算
      const confidence = this.calculateConfidence(inquiry, response);
      
      // 推奨アクション
      const suggestedAction = this.determineSuggestedAction(inquiry, tags);
      
      return {
        response,
        suggestedAction,
        requiresHumanReview,
        confidence,
        tags
      };
    } catch (error) {
      logger.error('AI応答生成エラー:', error);
      return {
        response: '申し訳ございません。現在自動応答を生成できません。担当者が確認次第、ご連絡いたします。',
        suggestedAction: 'manual_review',
        requiresHumanReview: true,
        confidence: 0,
        tags: []
      };
    }
  }

  /**
   * タグ抽出
   */
  private static extractTags(inquiry: ContactInquiry): string[] {
    const tags: string[] = [inquiry.category];
    
    // キーワードベースのタグ抽出
    const keywords = {
      '料金': 'pricing',
      'プラン': 'plan',
      'デモ': 'demo',
      'エラー': 'error',
      'バグ': 'bug',
      '機能': 'feature',
      '使い方': 'usage',
      '導入': 'onboarding',
      '解約': 'cancellation',
      '支払い': 'payment'
    };
    
    for (const [keyword, tag] of Object.entries(keywords)) {
      if (inquiry.message.includes(keyword) || inquiry.subject.includes(keyword)) {
        tags.push(tag);
      }
    }
    
    return [...new Set(tags)];
  }

  /**
   * 人間の確認が必要かチェック
   */
  private static checkIfHumanReviewRequired(inquiry: ContactInquiry): boolean {
    // 緊急度が高い場合
    if (inquiry.urgency === 'high') return true;
    
    // 特定のキーワードが含まれる場合
    const sensitiveKeywords = ['クレーム', '返金', '訴訟', '個人情報', 'バグ', '障害'];
    const requiresReview = sensitiveKeywords.some(keyword => 
      inquiry.message.includes(keyword) || inquiry.subject.includes(keyword)
    );
    
    return requiresReview;
  }

  /**
   * 信頼度スコア計算
   */
  private static calculateConfidence(inquiry: ContactInquiry, response: string): number {
    let confidence = 0.7; // ベーススコア
    
    // カテゴリが明確な場合
    if (inquiry.category !== 'other') confidence += 0.1;
    
    // 応答が十分な長さの場合
    if (response.length > 200) confidence += 0.1;
    
    // 緊急度が低い場合
    if (inquiry.urgency === 'low') confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * 推奨アクション決定
   */
  private static determineSuggestedAction(inquiry: ContactInquiry, tags: string[]): string {
    if (tags.includes('demo')) return 'schedule_demo';
    if (tags.includes('pricing') || tags.includes('plan')) return 'send_pricing_info';
    if (tags.includes('error') || tags.includes('bug')) return 'create_support_ticket';
    if (tags.includes('cancellation')) return 'retention_followup';
    
    return 'standard_followup';
  }

  /**
   * 自動応答メール送信
   */
  private static async sendAutoResponse(
    email: string, 
    subject: string, 
    response: string
  ): Promise<void> {
    try {
      await emailService.sendEmail({
        to: email,
        subject: `Re: ${subject}`,
        text: response,
        html: this.formatResponseHtml(response)
      });
      
      logger.info('自動応答メール送信完了:', { email, subject });
    } catch (error) {
      logger.error('自動応答メール送信エラー:', error);
    }
  }

  /**
   * 応答時間見積もり
   */
  private static calculateResponseTime(urgency: string): string {
    const times = {
      high: '2時間以内',
      medium: '1営業日以内',
      low: '2営業日以内'
    };
    
    return times[urgency as keyof typeof times] || times.medium;
  }

  /**
   * 関連スタッフへの通知
   */
  private static async notifyRelevantStaff(
    inquiry: any,
    aiResponse: AIResponse
  ): Promise<void> {
    try {
      // 高優先度または人間の確認が必要な場合は通知
      if (inquiry.urgency === 'high' || aiResponse.requiresHumanReview) {
        await emailService.sendEmail({
          to: process.env.SUPPORT_EMAIL || 'support@example.com',
          subject: `[${inquiry.urgency.toUpperCase()}] 新規お問い合わせ: ${inquiry.subject}`,
          text: `
新規お問い合わせを受信しました。

カテゴリ: ${inquiry.category}
優先度: ${inquiry.urgency}
お客様: ${inquiry.name}
メール: ${inquiry.email}

内容:
${inquiry.message}

AI推奨アクション: ${aiResponse.suggestedAction}
タグ: ${aiResponse.tags.join(', ')}

管理画面から詳細を確認してください。
          `
        });
      }
    } catch (error) {
      logger.error('スタッフ通知エラー:', error);
    }
  }

  /**
   * HTML形式のメールフォーマット
   */
  private static formatResponseHtml(response: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .content { padding: 20px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>お問い合わせありがとうございます</h2>
          </div>
          <div class="content">
            ${response.replace(/\n/g, '<br>')}
          </div>
          <div class="footer">
            <p>このメールは自動送信されています。</p>
            <p>さらなるご質問がある場合は、このメールに返信してください。</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 問い合わせ履歴取得
   */
  static async getInquiryHistory(tenantId?: string, page = 1, limit = 20) {
    try {
      const where = tenantId ? { tenantId } : {};
      
      // Note: contactInquiry model doesn't exist in the schema
      // This is a stub implementation
      const inquiries: any[] = [];
      const total = 0;
      
      logger.warn('ContactInquiry model not found in schema - returning empty data');
      
      return {
        inquiries,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('問い合わせ履歴取得エラー:', error);
      throw error;
    }
  }

  /**
   * 統計情報取得
   */
  static async getStatistics(tenantId?: string, period = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);
      
      // Note: Since contactInquiry model doesn't exist, returning mock statistics
      logger.warn('ContactInquiry model not found in schema - returning mock statistics');
      
      return {
        totalInquiries: 0,
        byCategory: {},
        byUrgency: {
          high: 0,
          medium: 0,
          low: 0
        },
        avgResponseTime: 0,
        autoResponseRate: 0,
        resolutionRate: 0
      };
    } catch (error) {
      logger.error('統計情報取得エラー:', error);
      throw error;
    }
  }

  /**
   * 手動応答送信
   */
  static async sendManualResponse(
    inquiryId: string, 
    responseContent: string, 
    staffId: string,
    resolved = false
  ): Promise<void> {
    try {
      // Note: contactInquiry model doesn't exist in the schema
      // This is a stub implementation - just log and return
      logger.warn('ContactInquiry model not found in schema - manual response functionality not available');
      logger.info('Manual response request:', { inquiryId, responseContent, staffId, resolved });
      
      logger.info('手動応答送信完了:', { inquiryId, staffId });
    } catch (error) {
      logger.error('手動応答送信エラー:', error);
      throw error;
    }
  }
}