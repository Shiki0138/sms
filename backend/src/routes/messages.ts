import { Router } from 'express';
import {
  getThreads,
  getThreadById,
  createThread,
  updateThread,
  sendMessage,
  markMessagesAsRead,
  getThreadStats,
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

export default router;