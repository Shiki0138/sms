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
import { featureFlag } from '../middleware/featureFlag';

const router = Router();

// 応援スタッフプロフィール関連
router.post('/profiles', featureFlag('support_staff_platform'), createSupportStaffProfile);
router.post('/availabilities', featureFlag('support_staff_platform'), createAvailability);

// 店舗からの依頼関連（認証必須）
router.post('/requests', authenticateToken, featureFlag('support_staff_platform'), createSupportRequest);
router.get('/search', authenticateToken, featureFlag('support_staff_platform'), searchAvailableStaff);

// 応募関連
router.post('/applications', featureFlag('support_staff_platform'), applyForSupport);
router.put('/applications/:applicationId/accept', authenticateToken, featureFlag('support_staff_platform'), acceptApplication);

export default router;