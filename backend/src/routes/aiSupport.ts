import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { aiSupportController } from '../controllers/aiSupportController'

const router = Router()

// 認証不要（ゲストユーザーも利用可能）
router.post('/chat', aiSupportController.sendMessage)
router.get('/faq', aiSupportController.getFAQ)

// 認証必要
router.get('/history', authenticate, aiSupportController.getHistory)
router.post('/feedback', authenticate, aiSupportController.sendFeedback)

export default router