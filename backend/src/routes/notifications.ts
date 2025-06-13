import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';

const router = Router();

// === 通知管理 ===
router.post('/send', notificationController.sendNotification);
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:notificationId/read', notificationController.markAsRead);
router.put('/mark-all-read', notificationController.markAllAsRead);
router.delete('/:notificationId', notificationController.deleteNotification);

// === 管理・統計 ===
router.get('/connection-status', notificationController.getConnectionStatus);
router.get('/stats', notificationController.getNotificationStats);

export { router as notificationsRouter };