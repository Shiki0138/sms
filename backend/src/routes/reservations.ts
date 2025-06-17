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
  optimizeBooking,
  getAvailabilityAnalysis,
  createSmartBooking,
  getDemandPredictions,
  predictNoShow,
} from '../controllers/reservationController';
import { 
  authenticate, 
  ensureTenantAccess,
  requirePermission,
} from '../middleware/auth';
import { PERMISSIONS } from '../utils/auth';
import { 
  limitReservationCreation,
  requireAnalytics,
  requireExternalIntegrations,
  requireAI,
  requireBulkOperations,
  addPlanInfo 
} from '../middleware/planRestriction';

const router = Router();

// Apply authentication and tenant access to all routes
router.use(authenticate);
router.use(ensureTenantAccess);
router.use(addPlanInfo);

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
 * @access  Private (requires reservation:read permission and analytics feature)
 */
router.get(
  '/stats',
  requirePermission(PERMISSIONS.RESERVATION_READ),
  requireAnalytics,
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
 * @access  Private (requires reservation:write permission and respects reservation limits)
 */
router.post(
  '/',
  requirePermission(PERMISSIONS.RESERVATION_WRITE),
  limitReservationCreation,
  createReservation
);

/**
 * @route   POST /api/v1/reservations/import/hotpepper
 * @desc    Import Hot Pepper reservations from CSV
 * @access  Private (requires reservation:write permission and external integrations)
 */
router.post(
  '/import/hotpepper',
  requirePermission(PERMISSIONS.RESERVATION_WRITE),
  requireExternalIntegrations,
  requireBulkOperations,
  importHotpepperReservations
);

/**
 * @route   POST /api/v1/reservations/sync/google-calendar
 * @desc    Sync Google Calendar events to reservations
 * @access  Private (requires reservation:write permission and external integrations)
 */
router.post(
  '/sync/google-calendar',
  requirePermission(PERMISSIONS.RESERVATION_WRITE),
  requireExternalIntegrations,
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

// Smart Booking Routes

/**
 * @route   POST /api/v1/reservations/optimize
 * @desc    Get optimal booking suggestions
 * @access  Private (requires reservation:read permission and AI features)
 */
router.post(
  '/optimize',
  requirePermission(PERMISSIONS.RESERVATION_READ),
  requireAI,
  optimizeBooking
);

/**
 * @route   GET /api/v1/reservations/availability/:date
 * @desc    Get availability analysis for a specific date
 * @access  Private (requires reservation:read permission)
 */
router.get(
  '/availability/:date',
  requirePermission(PERMISSIONS.RESERVATION_READ),
  getAvailabilityAnalysis
);

/**
 * @route   POST /api/v1/reservations/smart-book
 * @desc    Create smart booking with optimization
 * @access  Private (requires reservation:write permission and AI features)
 */
router.post(
  '/smart-book',
  requirePermission(PERMISSIONS.RESERVATION_WRITE),
  requireAI,
  limitReservationCreation,
  createSmartBooking
);

/**
 * @route   GET /api/v1/reservations/predictions
 * @desc    Get demand predictions for a date range
 * @access  Private (requires reservation:read permission and AI features)
 */
router.get(
  '/predictions',
  requirePermission(PERMISSIONS.RESERVATION_READ),
  requireAI,
  getDemandPredictions
);

/**
 * @route   POST /api/v1/reservations/predict-noshow
 * @desc    Predict no-show probability for a customer
 * @access  Private (requires reservation:read permission and AI features)
 */
router.post(
  '/predict-noshow',
  requirePermission(PERMISSIONS.RESERVATION_READ),
  requireAI,
  predictNoShow
);

export default router;