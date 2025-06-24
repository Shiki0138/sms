import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { requireAI, limitAIReplies } from '../middleware/planRestriction'
import { aiSupportController } from '../controllers/aiSupportController'

const router = Router()

// AI チャット機能は Premium AI プランのみ + AI返信制限チェック
router.post('/chat', authenticate, requireAI, limitAIReplies, aiSupportController.sendMessage)

// FAQ は全プランで利用可能（AI 機能ではないため）
router.get('/faq', aiSupportController.getFAQ)

// 認証必要 + AI機能制限
router.get('/history', authenticate, requireAI, aiSupportController.getHistory)
router.post('/feedback', authenticate, aiSupportController.sendFeedback)

export default router