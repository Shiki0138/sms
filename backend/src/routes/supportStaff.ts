import { Router } from 'express';
import {
  createSupportStaffProfile,
  createAvailability,
  createSupportRequest,
  searchAvailableStaff,
  applyForSupport,
  acceptApplication
} from '../controllers/supportStaffController';
import { authenticateToken } from '../middleware/auth';
// import { requireFeatureFlag } from '../middleware/featureFlag';

const router = Router();

// 応援スタッフプロフィール関連
router.post('/profiles', createSupportStaffProfile);
router.post('/availabilities', createAvailability);

// 店舗からの依頼関連（認証必須）
router.post('/requests', authenticateToken, createSupportRequest);
router.get('/search', authenticateToken, searchAvailableStaff);

// 応募関連
router.post('/applications', applyForSupport);
router.put('/applications/:applicationId/accept', authenticateToken, acceptApplication);

export default router;