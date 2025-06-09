import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
  accessToken?: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  location?: string;
  attendees?: string[];
  status: 'confirmed' | 'tentative' | 'cancelled';
}

export class GoogleCalendarService {
  private auth: OAuth2Client;
  private calendar: calendar_v3.Calendar;
  private tenantId: string;

  constructor(config: GoogleCalendarConfig, tenantId: string) {
    this.tenantId = tenantId;
    this.auth = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    if (config.refreshToken) {
      this.auth.setCredentials({
        refresh_token: config.refreshToken,
        access_token: config.accessToken,
      });
    }

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  /**
   * Get authorization URL for OAuth flow
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const { tokens } = await this.auth.getToken(code);
      
      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Failed to obtain tokens from Google');
      }

      this.auth.setCredentials(tokens);

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      };
    } catch (error) {
      logger.error('Failed to exchange Google auth code for tokens', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: this.tenantId,
      });
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string> {
    try {
      const { credentials } = await this.auth.refreshAccessToken();
      
      if (!credentials.access_token) {
        throw new Error('Failed to refresh access token');
      }

      this.auth.setCredentials(credentials);
      return credentials.access_token;
    } catch (error) {
      logger.error('Failed to refresh Google access token', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: this.tenantId,
      });
      throw error;
    }
  }

  /**
   * Get calendar events within date range
   */
  async getEvents(
    calendarId: string = 'primary',
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];
      
      return events
        .filter(event => event.start && event.end)
        .map(event => this.convertGoogleEventToCalendarEvent(event));

    } catch (error) {
      logger.error('Failed to fetch Google Calendar events', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: this.tenantId,
        calendarId,
      });
      throw error;
    }
  }

  /**
   * Create calendar event
   */
  async createEvent(
    event: Omit<CalendarEvent, 'id'>,
    calendarId: string = 'primary'
  ): Promise<CalendarEvent> {
    try {
      const googleEvent: calendar_v3.Schema$Event = {
        summary: event.summary,
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: 'Asia/Tokyo',
        },
        end: {
          dateTime: (event.endTime || new Date(event.startTime.getTime() + 60 * 60 * 1000)).toISOString(),
          timeZone: 'Asia/Tokyo',
        },
        attendees: event.attendees?.map(email => ({ email })),
        status: event.status,
      };

      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: googleEvent,
      });

      if (!response.data) {
        throw new Error('Failed to create Google Calendar event');
      }

      return this.convertGoogleEventToCalendarEvent(response.data);

    } catch (error) {
      logger.error('Failed to create Google Calendar event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: this.tenantId,
        event,
      });
      throw error;
    }
  }

  /**
   * Update calendar event
   */
  async updateEvent(
    eventId: string,
    event: Partial<Omit<CalendarEvent, 'id'>>,
    calendarId: string = 'primary'
  ): Promise<CalendarEvent> {
    try {
      const googleEvent: calendar_v3.Schema$Event = {};

      if (event.summary) googleEvent.summary = event.summary;
      if (event.description) googleEvent.description = event.description;
      if (event.location) googleEvent.location = event.location;
      if (event.startTime) {
        googleEvent.start = {
          dateTime: event.startTime.toISOString(),
          timeZone: 'Asia/Tokyo',
        };
      }
      if (event.endTime) {
        googleEvent.end = {
          dateTime: event.endTime.toISOString(),
          timeZone: 'Asia/Tokyo',
        };
      }
      if (event.attendees) {
        googleEvent.attendees = event.attendees.map(email => ({ email }));
      }
      if (event.status) googleEvent.status = event.status;

      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        requestBody: googleEvent,
      });

      if (!response.data) {
        throw new Error('Failed to update Google Calendar event');
      }

      return this.convertGoogleEventToCalendarEvent(response.data);

    } catch (error) {
      logger.error('Failed to update Google Calendar event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: this.tenantId,
        eventId,
        event,
      });
      throw error;
    }
  }

  /**
   * Delete calendar event
   */
  async deleteEvent(eventId: string, calendarId: string = 'primary'): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId,
        eventId,
      });

      logger.info('Google Calendar event deleted', {
        eventId,
        calendarId,
        tenantId: this.tenantId,
      });

    } catch (error) {
      logger.error('Failed to delete Google Calendar event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: this.tenantId,
        eventId,
      });
      throw error;
    }
  }

  /**
   * Convert Google Calendar event to our CalendarEvent interface
   */
  private convertGoogleEventToCalendarEvent(googleEvent: calendar_v3.Schema$Event): CalendarEvent {
    const startTime = new Date(
      googleEvent.start?.dateTime || googleEvent.start?.date || new Date()
    );
    const endTime = (googleEvent.end?.dateTime || googleEvent.end?.date)
      ? new Date(googleEvent.end.dateTime || googleEvent.end.date || new Date())
      : undefined;

    return {
      id: googleEvent.id || '',
      summary: googleEvent.summary || '',
      description: googleEvent.description || undefined,
      startTime,
      endTime,
      location: googleEvent.location || undefined,
      attendees: googleEvent.attendees?.map(attendee => attendee.email || '').filter(Boolean),
      status: (googleEvent.status as 'confirmed' | 'tentative' | 'cancelled') || 'confirmed',
    };
  }

  /**
   * Sync Google Calendar events to database
   */
  async syncEventsToDatabase(
    calendarId: string = 'primary',
    startDate: Date,
    endDate: Date
  ): Promise<{ imported: number; updated: number; errors: string[] }> {
    const results = {
      imported: 0,
      updated: 0,
      errors: [] as string[],
    };

    try {
      const events = await this.getEvents(calendarId, startDate, endDate);

      for (const event of events) {
        try {
          // Check if reservation already exists
          const existingReservation = await prisma.reservation.findFirst({
            where: {
              sourceId: event.id,
              source: 'GOOGLE_CALENDAR',
              tenantId: this.tenantId,
            },
          });

          if (existingReservation) {
            // Update existing reservation
            await prisma.reservation.update({
              where: { id: existingReservation.id },
              data: {
                startTime: event.startTime,
                endTime: event.endTime,
                menuContent: event.summary,
                notes: event.description,
                status: event.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED',
              },
            });
            results.updated++;
          } else {
            // Create new reservation
            await prisma.reservation.create({
              data: {
                startTime: event.startTime,
                endTime: event.endTime,
                menuContent: event.summary,
                customerName: event.attendees?.[0] || 'Google Calendar',
                notes: event.description,
                source: 'GOOGLE_CALENDAR',
                sourceId: event.id,
                status: event.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED',
                tenantId: this.tenantId,
              },
            });
            results.imported++;
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push(`Event ${event.id}: ${errorMessage}`);
        }
      }

      logger.info('Google Calendar sync completed', {
        ...results,
        tenantId: this.tenantId,
      });

      return results;

    } catch (error) {
      logger.error('Failed to sync Google Calendar events', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: this.tenantId,
      });
      throw error;
    }
  }
}

/**
 * Factory function to create GoogleCalendarService instance
 */
export async function createGoogleCalendarService(tenantId: string): Promise<GoogleCalendarService | null> {
  try {
    // TODO: Implement tenant settings table to store Google OAuth credentials
    // For now, use environment variables
    const config: GoogleCalendarConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: process.env.GOOGLE_ACCESS_TOKEN,
    };

    if (!config.clientId || !config.clientSecret) {
      logger.warn('Google Calendar configuration missing', { tenantId });
      return null;
    }

    return new GoogleCalendarService(config, tenantId);

  } catch (error) {
    logger.error('Failed to create Google Calendar service', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId,
    });
    return null;
  }
}