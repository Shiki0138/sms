import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { InstagramApiService, LineApiService } from '../services/externalApiService';
import { parseReservationEmail } from '../services/emailParser';
import { addDays, addHours } from 'date-fns';

const prisma = new PrismaClient();

/**
 * Instagram Webhook Handler
 */
export const instagramWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['x-hub-signature-256'] as string;
  const body = JSON.stringify(req.body);
  
  // Verify webhook signature
  const appSecret = process.env.INSTAGRAM_APP_SECRET || '';
  if (!InstagramApiService.verifyWebhookSignature(signature, body, appSecret)) {
    throw createError('Invalid webhook signature', 401);
  }

  const webhookData = req.body;

  // Handle verification challenge
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.INSTAGRAM_VERIFY_TOKEN) {
    res.status(200).send(req.query['hub.challenge']);
    return;
  }

  // Process webhook events
  if (webhookData.object === 'instagram') {
    for (const entry of webhookData.entry) {
      if (entry.messaging) {
        for (const messagingEvent of entry.messaging) {
          await processInstagramMessage(messagingEvent);
        }
      }
    }
  }

  res.status(200).json({ success: true });
});

/**
 * LINE Webhook Handler
 */
export const lineWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['x-line-signature'] as string;
  const body = JSON.stringify(req.body);
  
  // Verify webhook signature
  const channelSecret = process.env.LINE_CHANNEL_SECRET || '';
  if (!LineApiService.verifyWebhookSignature(signature, body, channelSecret)) {
    throw createError('Invalid webhook signature', 401);
  }

  const webhookData = req.body;

  // Process webhook events
  for (const event of webhookData.events) {
    switch (event.type) {
      case 'message':
        await processLineMessage(event);
        break;
      case 'follow':
        await processLineFollow(event);
        break;
      case 'unfollow':
        await processLineUnfollow(event);
        break;
      default:
        logger.info(`Unhandled LINE event type: ${event.type}`);
    }
  }

  res.status(200).json({ success: true });
});

/**
 * Process Instagram message event
 */
async function processInstagramMessage(messagingEvent: any): Promise<void> {
  try {
    const senderId = messagingEvent.sender.id;
    const recipientId = messagingEvent.recipient.id;
    const message = messagingEvent.message;

    // Find tenant based on Instagram business account ID
    // TODO: Implement proper tenant resolution
    const tenantId = await findTenantByInstagramId(recipientId);
    
    if (!tenantId) {
      logger.warn(`No tenant found for Instagram account: ${recipientId}`);
      return;
    }

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { instagramId: senderId, tenantId },
    });

    if (!customer) {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          instagramId: senderId,
          tenantId,
          visitCount: 0,
        },
      });
      
      logger.info(`New customer created from Instagram: ${senderId}`);
    }

    // Find or create message thread
    let thread = await prisma.messageThread.findFirst({
      where: {
        channel: 'INSTAGRAM',
        channelThreadId: senderId,
        tenantId,
      },
    });

    if (!thread) {
      thread = await prisma.messageThread.create({
        data: {
          customerId: customer.id,
          channel: 'INSTAGRAM',
          channelThreadId: senderId,
          status: 'OPEN',
          tenantId,
        },
      });
      
      logger.info(`New Instagram thread created: ${thread.id}`);
    }

    // Determine message type and content
    let content = '';
    let mediaType: 'TEXT' | 'IMAGE' | 'STICKER' | 'FILE' = 'TEXT';
    let mediaUrl: string | undefined;

    if (message.text) {
      content = message.text;
      mediaType = 'TEXT';
    } else if (message.attachments) {
      const attachment = message.attachments[0];
      if (attachment.type === 'image') {
        content = '[Image]';
        mediaType = 'IMAGE';
        mediaUrl = attachment.payload.url;
      } else if (attachment.type === 'audio') {
        content = '[Audio]';
        mediaType = 'FILE';
        mediaUrl = attachment.payload.url;
      } else if (attachment.type === 'video') {
        content = '[Video]';
        mediaType = 'FILE';
        mediaUrl = attachment.payload.url;
      } else if (attachment.type === 'file') {
        content = '[File]';
        mediaType = 'FILE';
        mediaUrl = attachment.payload.url;
      }
    }

    // Create message record
    await prisma.message.create({
      data: {
        threadId: thread.id,
        senderType: 'CUSTOMER',
        content,
        mediaType,
        mediaUrl,
        externalId: message.mid,
        isRead: false,
        createdAt: new Date(messagingEvent.timestamp),
      },
    });

    // Update thread timestamp
    await prisma.messageThread.update({
      where: { id: thread.id },
      data: { updatedAt: new Date() },
    });

    logger.info(`Instagram message processed: ${message.mid}`, {
      threadId: thread.id,
      customerId: customer.id,
      tenantId,
    });

  } catch (error) {
    logger.error('Failed to process Instagram message', {
      error: error instanceof Error ? error.message : 'Unknown error',
      messagingEvent,
    });
  }
}

/**
 * Process LINE message event
 */
async function processLineMessage(event: any): Promise<void> {
  try {
    const userId = event.source.userId;
    const message = event.message;

    // Find tenant based on destination (channel ID)
    // TODO: Implement proper tenant resolution
    const tenantId = await findTenantByLineChannelId(event.destination);
    
    if (!tenantId) {
      logger.warn(`No tenant found for LINE channel: ${event.destination}`);
      return;
    }

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { lineId: userId, tenantId },
    });

    if (!customer) {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          lineId: userId,
          tenantId,
          visitCount: 0,
        },
      });
      
      logger.info(`New customer created from LINE: ${userId}`);
    }

    // Find or create message thread
    let thread = await prisma.messageThread.findFirst({
      where: {
        channel: 'LINE',
        channelThreadId: userId,
        tenantId,
      },
    });

    if (!thread) {
      thread = await prisma.messageThread.create({
        data: {
          customerId: customer.id,
          channel: 'LINE',
          channelThreadId: userId,
          status: 'OPEN',
          tenantId,
        },
      });
      
      logger.info(`New LINE thread created: ${thread.id}`);
    }

    // Determine message type and content
    let content = '';
    let mediaType: 'TEXT' | 'IMAGE' | 'STICKER' | 'FILE' = 'TEXT';
    let mediaUrl: string | undefined;

    switch (message.type) {
      case 'text':
        content = message.text;
        mediaType = 'TEXT';
        break;
      case 'image':
        content = '[Image]';
        mediaType = 'IMAGE';
        // Note: LINE image URLs require authentication to access
        break;
      case 'video':
        content = '[Video]';
        mediaType = 'FILE';
        break;
      case 'audio':
        content = '[Audio]';
        mediaType = 'FILE';
        break;
      case 'file':
        content = '[File]';
        mediaType = 'FILE';
        break;
      case 'sticker':
        content = '[Sticker]';
        mediaType = 'STICKER';
        break;
      default:
        content = `[${message.type}]`;
        mediaType = 'TEXT';
    }

    // Create message record
    await prisma.message.create({
      data: {
        threadId: thread.id,
        senderType: 'CUSTOMER',
        content,
        mediaType,
        mediaUrl,
        externalId: message.id,
        isRead: false,
        createdAt: new Date(event.timestamp),
      },
    });

    // Update thread timestamp
    await prisma.messageThread.update({
      where: { id: thread.id },
      data: { updatedAt: new Date() },
    });

    logger.info(`LINE message processed: ${message.id}`, {
      threadId: thread.id,
      customerId: customer.id,
      tenantId,
    });

  } catch (error) {
    logger.error('Failed to process LINE message', {
      error: error instanceof Error ? error.message : 'Unknown error',
      event,
    });
  }
}

/**
 * Process LINE follow event
 */
async function processLineFollow(event: any): Promise<void> {
  try {
    const userId = event.source.userId;
    const tenantId = await findTenantByLineChannelId(event.destination);
    
    if (!tenantId) {
      logger.warn(`No tenant found for LINE channel: ${event.destination}`);
      return;
    }

    // Update or create customer
    let customer = await prisma.customer.findFirst({
      where: { lineId: userId, tenantId },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          lineId: userId,
          tenantId,
          visitCount: 0,
        },
      });
    }

    logger.info(`LINE follow event processed for user: ${userId}`, {
      customerId: customer.id,
      tenantId,
    });

  } catch (error) {
    logger.error('Failed to process LINE follow event', {
      error: error instanceof Error ? error.message : 'Unknown error',
      event,
    });
  }
}

/**
 * Process LINE unfollow event
 */
async function processLineUnfollow(event: any): Promise<void> {
  try {
    const userId = event.source.userId;
    const tenantId = await findTenantByLineChannelId(event.destination);
    
    if (!tenantId) {
      logger.warn(`No tenant found for LINE channel: ${event.destination}`);
      return;
    }

    // Update customer (mark as unfollowed if needed)
    // Note: We don't delete the customer record for data integrity
    
    logger.info(`LINE unfollow event processed for user: ${userId}`, {
      tenantId,
    });

  } catch (error) {
    logger.error('Failed to process LINE unfollow event', {
      error: error instanceof Error ? error.message : 'Unknown error',
      event,
    });
  }
}

/**
 * Find tenant by Instagram business account ID
 * TODO: Implement proper mapping from Instagram account to tenant
 */
async function findTenantByInstagramId(instagramAccountId: string): Promise<string | null> {
  // For now, return the first active tenant
  // In production, this should be mapped through tenant settings
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
  });
  
  return tenant?.id || null;
}

/**
 * Find tenant by LINE channel ID
 * TODO: Implement proper mapping from LINE channel to tenant
 */
async function findTenantByLineChannelId(channelId: string): Promise<string | null> {
  // For now, return the first active tenant
  // In production, this should be mapped through tenant settings
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
  });
  
  return tenant?.id || null;
}

/**
 * Email Webhook Handler for HotPepper Beauty reservations
 * Supports multiple email service providers (SendGrid, Mailgun, etc.)
 */
export const emailWebhook = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Detect email service provider
    const provider = detectEmailProvider(req);
    
    // Parse email data based on provider
    const emailData = parseEmailWebhookData(provider, req);
    
    if (!emailData) {
      logger.warn('Failed to parse email webhook data', { provider, headers: req.headers });
      return res.status(400).json({ error: 'Invalid email data' });
    }
    
    // Parse reservation from email
    const reservation = parseReservationEmail(
      emailData.subject,
      emailData.body,
      emailData.from
    );
    
    if (!reservation) {
      logger.info('Email is not a HotPepper reservation', { subject: emailData.subject });
      return res.status(200).json({ message: 'Not a reservation email' });
    }
    
    // Find tenant based on forwarding email address
    const tenantId = await findTenantByEmail(emailData.to);
    
    if (!tenantId) {
      logger.warn('No tenant found for email address', { email: emailData.to });
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Check for duplicate reservation
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        tenantId,
        startTime: reservation.startTime,
        customer: {
          name: reservation.customerName
        }
      }
    });
    
    if (existingReservation) {
      logger.info('Duplicate reservation detected', { 
        reservationId: existingReservation.id,
        customerName: reservation.customerName,
        startTime: reservation.startTime
      });
      return res.status(200).json({ message: 'Reservation already exists' });
    }
    
    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: {
        tenantId,
        OR: [
          { phone: reservation.phone },
          { email: reservation.email },
          { name: reservation.customerName }
        ]
      }
    });
    
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          tenantId,
          name: reservation.customerName,
          phone: reservation.phone,
          email: reservation.email,
          visitCount: 0,
        }
      });
      
      logger.info('New customer created from HotPepper email', {
        customerId: customer.id,
        name: customer.name
      });
    }
    
    // Create reservation
    const endTime = addHours(reservation.startTime, 2); // Default 2 hours duration
    
    const newReservation = await prisma.reservation.create({
      data: {
        tenantId,
        customerId: customer.id,
        startTime: reservation.startTime,
        endTime,
        status: reservation.status,
        source: reservation.source,
        notes: reservation.notes,
        menuContent: reservation.menuContent,
        paymentStatus: 'pending',
        reminderSent: false
      }
    });
    
    logger.info('Reservation created from HotPepper email', {
      reservationId: newReservation.id,
      customerId: customer.id,
      customerName: reservation.customerName,
      startTime: reservation.startTime,
      tenantId
    });
    
    // Send confirmation email to salon
    // TODO: Implement email notification to salon
    
    res.status(201).json({
      success: true,
      reservationId: newReservation.id,
      message: 'Reservation created successfully'
    });
    
  } catch (error) {
    logger.error('Email webhook processing error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    res.status(500).json({ error: 'Failed to process email webhook' });
  }
});

/**
 * Detect email service provider from request
 */
function detectEmailProvider(req: Request): string {
  const userAgent = req.headers['user-agent'] || '';
  const headers = req.headers;
  
  if (headers['x-sendgrid-webhook-id']) return 'sendgrid';
  if (headers['x-mailgun-signature']) return 'mailgun';
  if (headers['x-postmark-server-token']) return 'postmark';
  if (userAgent.includes('Mandrill')) return 'mandrill';
  if (headers['x-ses-message-id']) return 'ses';
  
  return 'generic';
}

/**
 * Parse email data based on provider
 */
function parseEmailWebhookData(provider: string, req: Request): {
  from: string;
  to: string;
  subject: string;
  body: string;
  html?: string;
} | null {
  try {
    switch (provider) {
      case 'sendgrid':
        return {
          from: req.body.from,
          to: req.body.to,
          subject: req.body.subject,
          body: req.body.text || req.body.html || '',
          html: req.body.html
        };
        
      case 'mailgun':
        return {
          from: req.body.sender || req.body.from,
          to: req.body.recipient,
          subject: req.body.subject,
          body: req.body['body-plain'] || req.body['body-html'] || '',
          html: req.body['body-html']
        };
        
      case 'postmark':
        return {
          from: req.body.From,
          to: req.body.To,
          subject: req.body.Subject,
          body: req.body.TextBody || req.body.HtmlBody || '',
          html: req.body.HtmlBody
        };
        
      case 'mandrill':
        const mandrillEvent = req.body.mandrill_events ? JSON.parse(req.body.mandrill_events)[0] : req.body;
        return {
          from: mandrillEvent.msg.from_email,
          to: mandrillEvent.msg.email,
          subject: mandrillEvent.msg.subject,
          body: mandrillEvent.msg.text || mandrillEvent.msg.html || '',
          html: mandrillEvent.msg.html
        };
        
      case 'ses':
        const sesMessage = JSON.parse(req.body.Message);
        const mail = sesMessage.mail;
        return {
          from: mail.source,
          to: mail.destination[0],
          subject: mail.commonHeaders.subject,
          body: sesMessage.content || '',
          html: undefined
        };
        
      default:
        // Generic format
        return {
          from: req.body.from || req.body.sender,
          to: req.body.to || req.body.recipient,
          subject: req.body.subject,
          body: req.body.text || req.body.body || req.body.html || '',
          html: req.body.html
        };
    }
  } catch (error) {
    logger.error('Failed to parse email webhook data', { provider, error });
    return null;
  }
}

/**
 * Find tenant by forwarding email address
 */
async function findTenantByEmail(email: string): Promise<string | null> {
  // Extract the part before @ to get the tenant identifier
  // Format: salon-[tenantId]@yourdomain.com
  const match = email.match(/salon-([a-zA-Z0-9]+)@/);
  
  if (!match) {
    // Try to find by settings
    const setting = await prisma.tenantSetting.findFirst({
      where: {
        key: 'hotpepper_email',
        value: email
      }
    });
    
    return setting?.tenantId || null;
  }
  
  const tenantId = match[1];
  
  // Verify tenant exists
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  });
  
  return tenant?.id || null;
}