import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../database'
import { aiSupportService } from '../services/aiSupportService'
import { AuthRequest } from '../types/auth'

// チャットメッセージ送信のスキーマ
const sendMessageSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string().optional(),
})

// 会話履歴取得のスキーマ
const getHistorySchema = z.object({
  sessionId: z.string(),
  limit: z.number().optional().default(50),
})

export const aiSupportController = {
  // チャットメッセージ送信
  async sendMessage(req: AuthRequest, res: Response) {
    try {
      const { message, sessionId } = sendMessageSchema.parse(req.body)
      
      // セッションIDがない場合は新規作成
      const chatSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // ユーザー情報を取得
      const userId = req.user?.id
      const userRole = req.user?.role
      
      // AIからの回答を取得
      const response = await aiSupportService.generateResponse({
        message,
        sessionId: chatSessionId,
        userId,
        userRole,
      })
      
      // 会話履歴を保存（実装予定）
      // await prisma.aIChatHistory.create({
      //   data: {
      //     sessionId: chatSessionId,
      //     userId: userId || 'anonymous',
      //     userMessage: message,
      //     aiResponse: response.content,
      //     metadata: JSON.stringify({
      //       model: response.model,
      //       tokensUsed: response.tokensUsed,
      //       userRole,
      //     }),
      //   },
      // })
      
      res.json({
        success: true,
        data: {
          sessionId: chatSessionId,
          response: response.content,
          suggestions: response.suggestions,
        },
      })
    } catch (error) {
      console.error('AI Support Error:', error)
      res.status(500).json({
        success: false,
        error: 'AIサポートへの接続に問題が発生しました。',
      })
    }
  },

  // 会話履歴取得
  async getHistory(req: AuthRequest, res: Response) {
    try {
      const { sessionId, limit } = getHistorySchema.parse(req.query)
      
      // 実装予定：会話履歴取得
      const history: any[] = []
      // const history = await prisma.aIChatHistory.findMany({
      //   where: {
      //     sessionId,
      //     userId: req.user?.id || 'anonymous',
      //   },
      //   orderBy: { createdAt: 'desc' },
      //   take: limit,
      // })
      
      res.json({
        success: true,
        data: history.reverse(), // 古い順に並び替え
      })
    } catch (error) {
      console.error('Get History Error:', error)
      res.status(500).json({
        success: false,
        error: '会話履歴の取得に失敗しました。',
      })
    }
  },

  // よくある質問取得
  async getFAQ(req: Request, res: Response) {
    try {
      const faqs = await aiSupportService.getFrequentlyAskedQuestions()
      
      res.json({
        success: true,
        data: faqs,
      })
    } catch (error) {
      console.error('Get FAQ Error:', error)
      res.status(500).json({
        success: false,
        error: 'FAQの取得に失敗しました。',
      })
    }
  },

  // フィードバック送信
  async sendFeedback(req: AuthRequest, res: Response) {
    try {
      const { sessionId, messageId, helpful } = z.object({
        sessionId: z.string(),
        messageId: z.string(),
        helpful: z.boolean(),
      }).parse(req.body)
      
      // 実装予定：フィードバック保存
      // await prisma.aIChatFeedback.create({
      //   data: {
      //     sessionId,
      //     messageId,
      //     helpful,
      //     userId: req.user?.id || 'anonymous',
      //   },
      // })
      
      res.json({
        success: true,
        message: 'フィードバックありがとうございます。',
      })
    } catch (error) {
      console.error('Send Feedback Error:', error)
      res.status(500).json({
        success: false,
        error: 'フィードバックの送信に失敗しました。',
      })
    }
  },
}