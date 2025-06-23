import express from 'express';
import {
  createSupportRequest,
  createAvailability,
  respondToRequest,
  getSupportRequests,
  getMyAvailability,
  confirmMatch
} from '../controllers/supportBeauticianController';
import { requireAuth } from '../middleware/auth';
import { requireFeatureFlag } from '../middleware/featureFlag';

const router = express.Router();

// 全ルートに認証を適用
router.use(requireAuth);

// 応援要請関連
router.post('/requests', createSupportRequest);
router.get('/requests', getSupportRequests);
router.post('/requests/:requestId/responses', respondToRequest);
router.post('/responses/:responseId/confirm', confirmMatch);

// 応援可能時間関連
router.post('/availability', createAvailability);
router.get('/availability/my', getMyAvailability);

export default router;