import { Router } from 'express';
import { instagramWebhook, lineWebhook, emailWebhook } from '../controllers/webhookController';

const router = Router();

/**
 * @route   POST /api/v1/webhooks/instagram
 * @desc    Instagram webhook endpoint
 * @access  Public (verified via signature)
 */
router.post('/instagram', instagramWebhook);

/**
 * @route   GET /api/v1/webhooks/instagram
 * @desc    Instagram webhook verification
 * @access  Public
 */
router.get('/instagram', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Check if verification token matches
  if (mode === 'subscribe' && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
    console.log('Instagram webhook verified');
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

/**
 * @route   POST /api/v1/webhooks/line
 * @desc    LINE webhook endpoint
 * @access  Public (verified via signature)
 */
router.post('/line', lineWebhook);

/**
 * @route   POST /api/v1/webhooks/email
 * @desc    Email webhook endpoint for HotPepper Beauty reservations
 * @access  Public (for email service providers)
 */
router.post('/email', emailWebhook);

/**
 * @route   POST /api/v1/webhooks/hotpepper
 * @desc    Alternative endpoint for HotPepper Beauty email webhooks
 * @access  Public (for email service providers)
 */
router.post('/hotpepper', emailWebhook);

export default router;