import express from 'express'
import { 
  createTestAdmin,
  createTestUsers,
  cleanupTestData,
  getTestUsers
} from '../controllers/testUserController'
import {
  getApiSettings,
  updateApiSettings,
  simulateApiCall,
  getApiLogs
} from '../controllers/testApiController'
import {
  prepare20Managers,
  getManagerList,
  cleanupAllDemoAccounts
} from '../controllers/testManagerController'
import { 
  testEnvironmentSecurity, 
  verifyTestMode, 
  logApiAttempt 
} from '../middleware/testSecurity'

const router = express.Router()

// テスト環境セキュリティミドルウェアを全体に適用
router.use(testEnvironmentSecurity)
router.use(logApiAttempt)

// テスト環境管理
router.post('/admin', createTestAdmin)
router.post('/users', createTestUsers)
router.get('/users/:tenantId', getTestUsers)
router.delete('/cleanup', cleanupTestData)

// API設定管理（テスト環境専用）
router.get('/api-settings/:tenantId', verifyTestMode, getApiSettings)
router.put('/api-settings/:tenantId', verifyTestMode, updateApiSettings)
router.post('/api-simulate', simulateApiCall)
router.get('/api-logs/:tenantId', verifyTestMode, getApiLogs)

// 20人経営者管理者アカウント管理
router.post('/prepare-managers', prepare20Managers)
router.get('/managers', getManagerList)
router.delete('/cleanup-demo', cleanupAllDemoAccounts)

export default router