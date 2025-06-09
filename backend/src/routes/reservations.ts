import { Router } from 'express';
import {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  importHotpepperReservations,
  getReservationStats,
  syncGoogleCalendar,
} from '../controllers/reservationController';
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
 * @route   GET /api/v1/reservations
 * @desc    Get reservations with filtering
 * @access  Private (requires reservation:read permission)
 */
router.get(
  '/', 
  requirePermission(PERMISSIONS.RESERVATION_READ),
  getReservations
);

/**
 * @route   GET /api/v1/reservations/stats
 * @desc    Get reservation statistics
 * @access  Private (requires reservation:read permission)
 */
router.get(
  '/stats',
  requirePermission(PERMISSIONS.RESERVATION_READ),
  getReservationStats
);

/**
 * @route   GET /api/v1/reservations/:id
 * @desc    Get reservation by ID
 * @access  Private (requires reservation:read permission)
 */
router.get(
  '/:id',
  requirePermission(PERMISSIONS.RESERVATION_READ),
  getReservationById
);

/**
 * @route   POST /api/v1/reservations
 * @desc    Create new reservation
 * @access  Private (requires reservation:write permission)
 */
router.post(
  '/',
  requirePermission(PERMISSIONS.RESERVATION_WRITE),
  createReservation
);

/**
 * @route   POST /api/v1/reservations/import/hotpepper
 * @desc    Import Hot Pepper reservations from CSV
 * @access  Private (requires reservation:write permission)
 */
router.post(
  '/import/hotpepper',
  requirePermission(PERMISSIONS.RESERVATION_WRITE),
  importHotpepperReservations
);

/**
 * @route   POST /api/v1/reservations/sync/google-calendar
 * @desc    Sync Google Calendar events to reservations
 * @access  Private (requires reservation:write permission)
 */
router.post(
  '/sync/google-calendar',
  requirePermission(PERMISSIONS.RESERVATION_WRITE),
  syncGoogleCalendar
);

/**
 * @route   PUT /api/v1/reservations/:id
 * @desc    Update reservation
 * @access  Private (requires reservation:write permission)
 */
router.put(
  '/:id',
  requirePermission(PERMISSIONS.RESERVATION_WRITE),
  updateReservation
);

/**
 * @route   DELETE /api/v1/reservations/:id
 * @desc    Delete reservation
 * @access  Private (requires reservation:delete permission)
 */
router.delete(
  '/:id',
  requirePermission(PERMISSIONS.RESERVATION_DELETE),
  deleteReservation
);

export default router;