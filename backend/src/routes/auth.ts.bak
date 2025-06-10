import { Router } from 'express';
import {
  login,
  register,
  getProfile,
  changePassword,
  requestPasswordReset,
  logout,
  refreshToken,
} from '../controllers/authController';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/v1/auth/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/v1/auth/register
 * @desc    User registration (admin only)
 * @access  Private (Admin only)
 */
router.post('/register', authenticate, adminOnly, register);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /api/v1/auth/password
 * @desc    Change password
 * @access  Private
 */
router.put('/password', authenticate, changePassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/reset-password', requestPasswordReset);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    User logout
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh token
 * @access  Private
 */
router.post('/refresh', authenticate, refreshToken);

export default router;