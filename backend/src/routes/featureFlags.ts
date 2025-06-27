import express from 'express';
import { featureFlagController } from '../controllers/featureFlagController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 認証が必要なルート
router.use(authenticate);

// テナント用エンドポイント
router.get('/enabled', featureFlagController.getEnabledFeatures);
router.get('/check/:featureKey', featureFlagController.checkFeature);

// 管理者用エンドポイント
router.get('/admin/all', featureFlagController.getAllFeatureFlags);
router.post('/admin/create', featureFlagController.createFeatureFlag);
router.put('/admin/:id', featureFlagController.updateFeatureFlag);
router.post('/admin/setup', featureFlagController.setupInitialFeatureFlags);
router.post('/admin/setup-production', featureFlagController.setupProductionFlags);
router.post('/admin/setup-production-full', featureFlagController.setupProductionProductionFlags);

// 段階的リリース管理
router.put('/admin/rollout/:featureKey', featureFlagController.updateRolloutPercentage);
router.post('/admin/emergency-disable/:featureKey', featureFlagController.emergencyDisableFeature);

// ベータテスト管理
router.post('/admin/beta/enable/:tenantId', featureFlagController.enableBetaFeatures);

// テナント別機能管理
router.get('/admin/tenant/:tenantId', featureFlagController.getTenantFeatureSettings);
router.post('/admin/tenant/:tenantId/feature/:featureFlagId', featureFlagController.setTenantFeatureFlag);

export default router;