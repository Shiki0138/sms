import { Router } from 'express';
import {
  createFeedback,
  getFeedback,
  updateFeedbackStatus,
  getFeedbackStats,
  submitQuickRating,
  getRecentFeedback
} from '../controllers/feedbackController';
import { authenticate, requirePermission } from '../middleware/auth';
import { PERMISSIONS } from '../utils/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/feedback
 * @desc    Submit feedback (bug report, feature request, general feedback)
 * @access  Private (any authenticated user)
 */
router.post('/', createFeedback);

/**
 * @route   POST /api/v1/feedback/quick-rating
 * @desc    Submit quick rating (1-5 stars)
 * @access  Private (any authenticated user)
 */
router.post('/quick-rating', submitQuickRating);

/**
 * @route   GET /api/v1/feedback
 * @desc    Get all feedback (admin only)
 * @access  Private (requires admin permission)
 */
router.get(
  '/',
  requirePermission(PERMISSIONS.ADMIN),
  getFeedback
);

/**
 * @route   GET /api/v1/feedback/stats
 * @desc    Get feedback statistics
 * @access  Private (requires admin permission)
 */
router.get(
  '/stats',
  requirePermission(PERMISSIONS.ADMIN),
  getFeedbackStats
);

/**
 * @route   GET /api/v1/feedback/recent
 * @desc    Get recent feedback items
 * @access  Private (requires admin permission)
 */
router.get(
  '/recent',
  requirePermission(PERMISSIONS.ADMIN),
  getRecentFeedback
);

/**
 * @route   PUT /api/v1/feedback/:id/status
 * @desc    Update feedback status
 * @access  Private (requires admin permission)
 */
router.put(
  '/:id/status',
  requirePermission(PERMISSIONS.ADMIN),
  updateFeedbackStatus
);

export default router;