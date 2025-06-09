import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
} from '../controllers/customerController';
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
 * @route   GET /api/v1/customers
 * @desc    Get all customers with pagination and filtering
 * @access  Private (requires customer:read permission)
 */
router.get(
  '/', 
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  getCustomers
);

/**
 * @route   GET /api/v1/customers/stats
 * @desc    Get customer statistics
 * @access  Private (requires customer:read permission)
 */
router.get(
  '/stats',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  getCustomerStats
);

/**
 * @route   GET /api/v1/customers/:id
 * @desc    Get customer by ID
 * @access  Private (requires customer:read permission)
 */
router.get(
  '/:id',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  getCustomerById
);

/**
 * @route   POST /api/v1/customers
 * @desc    Create new customer
 * @access  Private (requires customer:write permission)
 */
router.post(
  '/',
  requirePermission(PERMISSIONS.CUSTOMER_WRITE),
  createCustomer
);

/**
 * @route   PUT /api/v1/customers/:id
 * @desc    Update customer
 * @access  Private (requires customer:write permission)
 */
router.put(
  '/:id',
  requirePermission(PERMISSIONS.CUSTOMER_WRITE),
  updateCustomer
);

/**
 * @route   DELETE /api/v1/customers/:id
 * @desc    Delete customer
 * @access  Private (requires customer:delete permission)
 */
router.delete(
  '/:id',
  requirePermission(PERMISSIONS.CUSTOMER_DELETE),
  deleteCustomer
);

export default router;