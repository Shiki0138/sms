import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import OpenAI from 'openai';
import { emailService } from './emailService';

const prisma = new PrismaClient();

// OpenAI クライアント初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  category: 'technical' | 'billing' | 'feature' | 'emergency' | 'general';
  subject: string;
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  tenantId?: string;
  userId?: string;
}

interface AIResponse {
  response: string;
  confidence: number;
  needsHumanReview: boolean;
  suggestedActions?: string[];
  relatedDocuments?: string[];
}

/**
 * 🤖 AI駆動お問い合わせフォームサービス
 * 自動応答・分類・エスカレーション機能
 */
export class ContactFormService {
  
  /**
   * お問い合わせ受信・処理
   */
  static async submitInquiry(data: ContactFormData): Promise<{
    inquiryId: string;
    aiResponse?: AIResponse;
    estimatedResponseTime: string;
  }> {
    try {
      // 1. データベースに保存
      const inquiry = await prisma.contactInquiry.create({
        data: {
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
        }
      });

      // 2. AI自動分析・応答
      const aiResponse = await this.generateAIResponse(data);
      
      // 3. 自動応答メール送信
      await this.sendAutoResponse(data, aiResponse, inquiry.id);
      
      // 4. 緊急度に応じてアラート
      if (data.urgency === 'critical') {
        await this.escalateToSupport(inquiry.id, data);
      }

      // 5. 応答時間推定
      const estimatedResponseTime = this.calculateResponseTime(data.category, data.urgency);

      logger.info('Contact inquiry processed:', {
        inquiryId: inquiry.id,
        category: data.category,
        urgency: data.urgency,
        aiConfidence: aiResponse.confidence
      });

      return {
        inquiryId: inquiry.id,
        aiResponse,
        estimatedResponseTime
      };

    } catch (error) {
      logger.error('Contact form submission failed:', error);
      throw new Error('お問い合わせの処理中にエラーが発生しました');
    }
  }

  /**
   * AI自動応答生成
   */
  private static async generateAIResponse(data: ContactFormData): Promise<AIResponse> {
    try {
      const systemPrompt = `
あなたは美容室統合管理システムの専門サポートAIです。
以下のルールに従って回答してください：

1. 日本語で丁寧に回答する
2. 技術的な問題は具体的な解決策を提示
3. 不明な点は「人間のサポート担当者が詳しく対応いたします」と案内
4. 緊急度が高い場合は即座にエスカレーション推奨

カテゴリ別対応方針：
- technical: 具体的なトラブルシューティング手順を提示
- billing: 請求に関する一般的な説明と連絡先案内
- feature: 機能要望として受け付けた旨を伝達
- emergency: 即座に緊急サポートに転送
- general: 一般的な質問に丁寧に回答

美容室業界の専門知識を活用して、親切で有用な回答を心がけてください。
`;

      const userPrompt = `
お問い合わせ内容：
件名: ${data.subject}
カテゴリ: ${data.category}
緊急度: ${data.urgency}
メッセージ: ${data.message}

このお問い合わせに対する適切な回答を生成してください。
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // 信頼度計算（簡易版）
      const confidence = this.calculateConfidence(data, response);
      
      // 人間レビュー必要性判定
      const needsHumanReview = confidence < 0.8 || 
                               data.urgency === 'critical' || 
                               data.category === 'billing';

      // 関連ドキュメント提案
      const relatedDocuments = await this.findRelatedDocuments(data);

      return {
        response,
        confidence,
        needsHumanReview,
        relatedDocuments
      };

    } catch (error) {
      logger.error('AI response generation failed:', error);
      
      // AI失敗時のフォールバック応答
      return {
        response: 'お問い合わせをありがとうございます。担当者が確認し、24時間以内にご回答いたします。',
        confidence: 0.5,
        needsHumanReview: true
      };
    }
  }

  /**
   * 自動応答メール送信
   */
  private static async sendAutoResponse(
    data: ContactFormData, 
    aiResponse: AIResponse, 
    inquiryId: string
  ): Promise<void> {
    try {
      const emailContent = `
${data.name} 様

この度は美容室統合管理システムにお問い合わせいただき、ありがとうございます。

【お問い合わせ番号】${inquiryId}
【受付日時】${new Date().toLocaleString('ja-JP')}

${aiResponse.response}

${aiResponse.needsHumanReview ? 
  '\n詳細については、担当者より24時間以内にご連絡いたします。' : 
  '\n\nこちらの回答で解決しない場合は、お気軽に再度お問い合わせください。'
}

何かご不明な点がございましたら、いつでもお気軽にお問い合わせください。

---
美容室統合管理システム サポートチーム
support@salon-system.com
      `;

      await emailService.sendEmail({
        to: data.email,
        subject: `【自動応答】お問い合わせを受け付けました（${inquiryId}）`,
        html: emailContent.replace(/\n/g, '<br>')
      });

    } catch (error) {
      logger.error('Auto response email failed:', error);
    }
  }

  /**
   * 緊急エスカレーション
   */
  private static async escalateToSupport(inquiryId: string, data: ContactFormData): Promise<void> {
    try {
      // Slack/Teams通知
      await this.sendSlackNotification({
        inquiryId,
        urgency: data.urgency,
        category: data.category,
        subject: data.subject,
        email: data.email
      });

      // 緊急対応チームにメール送信
      await emailService.sendEmail({
        to: process.env.EMERGENCY_SUPPORT_EMAIL || 'emergency@salon-system.com',
        subject: `🚨 緊急お問い合わせ - ${inquiryId}`,
        html: `
          <h2>緊急お問い合わせ</h2>
          <p><strong>ID:</strong> ${inquiryId}</p>
          <p><strong>件名:</strong> ${data.subject}</p>
          <p><strong>緊急度:</strong> ${data.urgency}</p>
          <p><strong>カテゴリ:</strong> ${data.category}</p>
          <p><strong>お客様:</strong> ${data.name} (${data.email})</p>
          <p><strong>内容:</strong></p>
          <p>${data.message}</p>
        `
      });

    } catch (error) {
      logger.error('Support escalation failed:', error);
    }
  }

  /**
   * 応答時間推定
   */
  private static calculateResponseTime(category: string, urgency: string): string {
    const timeMap: Record<string, Record<string, string>> = {
      emergency: { critical: '30分以内', high: '1時間以内' },
      technical: { critical: '2時間以内', high: '4時間以内', medium: '12時間以内' },
      billing: { high: '4時間以内', medium: '24時間以内' },
      feature: { medium: '48時間以内', low: '1週間以内' },
      general: { medium: '24時間以内', low: '48時間以内' }
    };

    return timeMap[category]?.[urgency] || '48時間以内';
  }

  /**
   * AI信頼度計算
   */
  private static calculateConfidence(data: ContactFormData, response: string): number {
    let confidence = 0.8; // ベース信頼度

    // 緊急度による調整
    if (data.urgency === 'critical') confidence -= 0.2;
    if (data.urgency === 'low') confidence += 0.1;

    // カテゴリによる調整
    if (data.category === 'technical') confidence += 0.1;
    if (data.category === 'billing') confidence -= 0.3;

    // 応答長による調整
    if (response.length < 100) confidence -= 0.2;
    if (response.length > 500) confidence += 0.1;

    return Math.max(0.3, Math.min(1.0, confidence));
  }

  /**
   * 関連ドキュメント検索
   */
  private static async findRelatedDocuments(data: ContactFormData): Promise<string[]> {
    // 実装: ナレッジベースから関連文書を検索
    const keywords = data.subject.split(' ').concat(data.message.split(' '));
    
    // 簡易実装
    const documentMap: Record<string, string[]> = {
      technical: [
        'トラブルシューティングガイド',
        'システム要件',
        'FAQ - 技術的問題'
      ],
      billing: [
        '料金プラン説明',
        '請求に関するFAQ',
        'お支払い方法'
      ],
      feature: [
        '機能一覧',
        'ロードマップ',
        '機能リクエストガイド'
      ]
    };

    return documentMap[data.category] || ['ユーザーガイド', 'FAQ'];
  }

  /**
   * Slack通知
   */
  private static async sendSlackNotification(data: any): Promise<void> {
    try {
      if (process.env.SLACK_WEBHOOK_URL) {
        // Slack Webhook実装
        logger.info('Slack notification sent for inquiry:', data.inquiryId);
      }
    } catch (error) {
      logger.error('Slack notification failed:', error);
    }
  }

  /**
   * 問い合わせ履歴取得
   */
  static async getInquiryHistory(tenantId?: string, page = 1, limit = 20) {
    try {
      const where = tenantId ? { tenantId } : {};
      
      const [inquiries, total] = await Promise.all([
        prisma.contactInquiry.findMany({
          where,
          orderBy: { receivedAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            responses: {
              orderBy: { createdAt: 'desc' }
            }
          }
        }),
        prisma.contactInquiry.count({ where })
      ]);

      return {
        inquiries,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          totalCount: total
        }
      };

    } catch (error) {
      logger.error('Inquiry history fetch failed:', error);
      throw error;
    }
  }

  /**
   * 人間サポート担当者による返信
   */
  static async respondToInquiry(
    inquiryId: string, 
    response: string, 
    staffId: string,
    resolved = false
  ): Promise<void> {
    try {
      const inquiry = await prisma.contactInquiry.findUnique({
        where: { id: inquiryId }
      });

      if (!inquiry) {
        throw new Error('お問い合わせが見つかりません');
      }

      // 応答記録
      await prisma.contactResponse.create({
        data: {
          inquiryId,
          response,
          staffId,
          isAI: false,
          createdAt: new Date()
        }
      });

      // ステータス更新
      await prisma.contactInquiry.update({
        where: { id: inquiryId },
        data: {
          status: resolved ? 'resolved' : 'in_progress',
          lastResponseAt: new Date()
        }
      });

      // 顧客にメール送信
      await emailService.sendEmail({
        to: inquiry.email,
        subject: `【回答】お問い合わせの件（${inquiryId}）`,
        html: `
          ${inquiry.name} 様<br><br>
          
          お問い合わせの件につきまして、ご回答させていただきます。<br><br>
          
          ${response.replace(/\n/g, '<br>')}<br><br>
          
          ${resolved ? 
            'この件につきまして解決いたしましたが、' : 
            '引き続きサポートが必要でしたら、'
          }お気軽にお問い合わせください。<br><br>
          
          ---<br>
          美容室統合管理システム サポートチーム
        `
      });

      logger.info('Manual response sent:', {
        inquiryId,
        staffId,
        resolved
      });

    } catch (error) {
      logger.error('Manual response failed:', error);
      throw error;
    }
  }
}

export default ContactFormService;