import { Router } from 'express';
import {
  getTemplates,
  getTemplateByType,
  upsertTemplate,
  deleteTemplate,
  getSettings,
  updateSettings,
  updateNextVisitDate,
  getMessageLogs,
  triggerAutoMessages,
  getDefaultTemplates
} from '../controllers/autoMessageController';
// Simple demo - no authentication required for now
// import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes (disabled for demo)
// router.use(authenticateToken);

// Template management
router.get('/templates', getTemplates);
router.get('/templates/defaults', getDefaultTemplates);
router.get('/templates/:type', getTemplateByType);
router.post('/templates', upsertTemplate);
router.put('/templates', upsertTemplate);
router.delete('/templates/:type', deleteTemplate);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Reservation management
router.put('/reservations/:id/next-visit-date', updateNextVisitDate);

// Message logs
router.get('/logs', getMessageLogs);

// Manual trigger
router.post('/trigger', triggerAutoMessages);

export default router;