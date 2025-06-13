import { Router } from 'express';
import {
  getThreads,
  getThreadById,
  createThread,
  updateThread,
  sendMessage,
  markMessagesAsRead,
  getThreadStats,
  performRFMAnalysis,
  createSegment,
  getSegmentCustomers,
  createBroadcastCampaign,
  getBroadcastAnalytics,
  getBroadcastCampaigns,
  testPersonalization,
} from '../controllers/messageController';
import { 
  authenticate, 
  ensureTenantAccess,
  requirePermission,
} from '../middleware/auth';
import { PERMISSIONS } from '../utils/auth';

const router = Router();

// Apply authentication and tenant access to all routes
router.use(authenticate);
router.use(ensureTenantAccess);

/**
 * @route   GET /api/v1/messages/threads
 * @desc    Get all message threads with pagination and filtering
 * @access  Private (requires message:read permission)
 */
router.get(
  '/threads', 
  requirePermission(PERMISSIONS.MESSAGE_READ),
  getThreads
);

/**
 * @route   GET /api/v1/messages/stats
 * @desc    Get message thread statistics
 * @access  Private (requires message:read permission)
 */
router.get(
  '/stats',
  requirePermission(PERMISSIONS.MESSAGE_READ),
  getThreadStats
);

/**
 * @route   GET /api/v1/messages/threads/:id
 * @desc    Get thread by ID with messages
 * @access  Private (requires message:read permission)
 */
router.get(
  '/threads/:id',
  requirePermission(PERMISSIONS.MESSAGE_READ),
  getThreadById
);

/**
 * @route   POST /api/v1/messages/threads
 * @desc    Create new message thread
 * @access  Private (requires message:write permission)
 */
router.post(
  '/threads',
  requirePermission(PERMISSIONS.MESSAGE_WRITE),
  createThread
);

/**
 * @route   PUT /api/v1/messages/threads/:id
 * @desc    Update thread (assign staff, change status, add tags)
 * @access  Private (requires message:write permission)
 */
router.put(
  '/threads/:id',
  requirePermission(PERMISSIONS.MESSAGE_WRITE),
  updateThread
);

/**
 * @route   POST /api/v1/messages/send
 * @desc    Send message to thread
 * @access  Private (requires message:write permission)
 */
router.post(
  '/send',
  requirePermission(PERMISSIONS.MESSAGE_WRITE),
  sendMessage
);

/**
 * @route   PUT /api/v1/messages/threads/:threadId/read
 * @desc    Mark messages as read
 * @access  Private (requires message:read permission)
 */
router.put(
  '/threads/:threadId/read',
  requirePermission(PERMISSIONS.MESSAGE_READ),
  markMessagesAsRead
);

// Broadcast Routes

/**
 * @route   POST /api/v1/messages/broadcast/segments
 * @desc    Create customer segment
 * @access  Private (requires message:write permission)
 */
router.post(
  '/broadcast/segments',
  requirePermission(PERMISSIONS.MESSAGE_WRITE),
  createSegment
);

/**
 * @route   GET /api/v1/messages/broadcast/segments
 * @desc    Get customers in a segment
 * @access  Private (requires message:read permission)
 */
router.get(
  '/broadcast/segments',
  requirePermission(PERMISSIONS.MESSAGE_READ),
  getSegmentCustomers
);

/**
 * @route   POST /api/v1/messages/broadcast/send
 * @desc    Create and send broadcast campaign
 * @access  Private (requires message:write permission)
 */
router.post(
  '/broadcast/send',
  requirePermission(PERMISSIONS.MESSAGE_WRITE),
  createBroadcastCampaign
);

/**
 * @route   GET /api/v1/messages/broadcast/analytics/:campaignId
 * @desc    Get broadcast campaign analytics
 * @access  Private (requires message:read permission)
 */
router.get(
  '/broadcast/analytics/:campaignId',
  requirePermission(PERMISSIONS.MESSAGE_READ),
  getBroadcastAnalytics
);

/**
 * @route   GET /api/v1/messages/broadcast/campaigns
 * @desc    Get broadcast campaigns list
 * @access  Private (requires message:read permission)
 */
router.get(
  '/broadcast/campaigns',
  requirePermission(PERMISSIONS.MESSAGE_READ),
  getBroadcastCampaigns
);

/**
 * @route   POST /api/v1/messages/broadcast/rfm-analysis
 * @desc    Perform RFM analysis for customer segmentation
 * @access  Private (requires message:read permission)
 */
router.post(
  '/broadcast/rfm-analysis',
  requirePermission(PERMISSIONS.MESSAGE_READ),
  performRFMAnalysis
);

/**
 * @route   POST /api/v1/messages/broadcast/test-personalization
 * @desc    Test message personalization
 * @access  Private (requires message:read permission)
 */
router.post(
  '/broadcast/test-personalization',
  requirePermission(PERMISSIONS.MESSAGE_READ),
  testPersonalization
);

export default router;