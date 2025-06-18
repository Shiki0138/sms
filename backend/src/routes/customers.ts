import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
  uploadCustomerPhoto,
} from '../controllers/customerController';
import { 
  authenticate, 
  ensureTenantAccess,
  requirePermission,
} from '../middleware/auth';
import { PERMISSIONS } from '../utils/auth';
import { 
  limitCustomerCreation,
  requireAnalytics,
  addPlanInfo 
} from '../middleware/planRestriction';

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/customers/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const router = Router();

// Apply authentication and tenant access to all routes
router.use(authenticate);
router.use(ensureTenantAccess);
router.use(addPlanInfo);

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
 * @access  Private (requires customer:read permission and analytics feature)
 */
router.get(
  '/stats',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  requireAnalytics,
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
 * @access  Private (requires customer:write permission and respects customer limits)
 */
router.post(
  '/',
  requirePermission(PERMISSIONS.CUSTOMER_WRITE),
  limitCustomerCreation,
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

/**
 * @route   POST /api/v1/customers/:customerId/photo
 * @desc    Upload optimized customer photo
 * @access  Private (requires customer:write permission)
 */
router.post(
  '/:customerId/photo',
  requirePermission(PERMISSIONS.CUSTOMER_WRITE),
  upload.single('photo'),
  uploadCustomerPhoto
);

/**
 * @route   POST /api/v1/customers/upload-photo
 * @desc    Upload photo for service history
 * @access  Private (requires customer:write permission)
 */
router.post(
  '/upload-photo',
  requirePermission(PERMISSIONS.CUSTOMER_WRITE),
  upload.single('photo'),
  uploadCustomerPhoto
);

/**
 * @route   DELETE /api/v1/customers/:customerId/photo
 * @desc    Delete customer photo
 * @access  Private (requires customer:write permission)
 */
router.delete(
  '/:customerId/photo',
  requirePermission(PERMISSIONS.CUSTOMER_WRITE),
  deleteCustomerPhoto
);

/**
 * @route   GET /api/v1/customers/:customerId/photo/variants
 * @desc    Get customer photo variants (thumbnail, medium, large)
 * @access  Private (requires customer:read permission)
 */
router.get(
  '/:customerId/photo/variants',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  getCustomerPhotoVariants
);

export default router;