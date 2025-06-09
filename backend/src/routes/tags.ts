import { Router } from 'express';
import {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  getPopularTags,
} from '../controllers/tagController';
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
 * @route   GET /api/v1/tags
 * @desc    Get all tags
 * @access  Private (requires customer:read or message:read permission)
 */
router.get(
  '/', 
  (req, res, next) => {
    // Allow access if user has either customer or message read permission
    if (req.user && (
      req.user.role === 'ADMIN' || 
      req.user.role === 'MANAGER' || 
      req.user.role === 'STAFF'
    )) {
      return next();
    }
    throw new Error('Insufficient permissions');
  },
  getTags
);

/**
 * @route   GET /api/v1/tags/popular
 * @desc    Get popular tags
 * @access  Private
 */
router.get(
  '/popular',
  (req, res, next) => {
    if (req.user && (
      req.user.role === 'ADMIN' || 
      req.user.role === 'MANAGER' || 
      req.user.role === 'STAFF'
    )) {
      return next();
    }
    throw new Error('Insufficient permissions');
  },
  getPopularTags
);

/**
 * @route   GET /api/v1/tags/:id
 * @desc    Get tag by ID
 * @access  Private
 */
router.get(
  '/:id',
  (req, res, next) => {
    if (req.user && (
      req.user.role === 'ADMIN' || 
      req.user.role === 'MANAGER' || 
      req.user.role === 'STAFF'
    )) {
      return next();
    }
    throw new Error('Insufficient permissions');
  },
  getTagById
);

/**
 * @route   POST /api/v1/tags
 * @desc    Create new tag
 * @access  Private (requires manager or admin)
 */
router.post(
  '/',
  requirePermission(PERMISSIONS.TEMPLATE_WRITE), // Using template write as proxy for tag management
  createTag
);

/**
 * @route   PUT /api/v1/tags/:id
 * @desc    Update tag
 * @access  Private (requires manager or admin)
 */
router.put(
  '/:id',
  requirePermission(PERMISSIONS.TEMPLATE_WRITE),
  updateTag
);

/**
 * @route   DELETE /api/v1/tags/:id
 * @desc    Delete tag
 * @access  Private (requires manager or admin)
 */
router.delete(
  '/:id',
  requirePermission(PERMISSIONS.TEMPLATE_DELETE),
  deleteTag
);

export default router;