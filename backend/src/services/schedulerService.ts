import * as cron from 'node-cron';
import { AutoMessageService } from './autoMessageService';
import { logger } from '../utils/logger';

export class SchedulerService {
  private static jobs: any[] = [];

  /**
   * Start all scheduled jobs
   */
  static start(): void {
    logger.info('Starting scheduler service...');

    // Auto-message processing every hour at minute 0
    const autoMessageJob = cron.schedule('0 * * * *', async () => {
      logger.info('Running scheduled auto-message processing...');
      try {
        await AutoMessageService.processAllMessages();
        logger.info('Scheduled auto-message processing completed');
      } catch (error) {
        logger.error('Scheduled auto-message processing failed:', error);
      }
    });

    // Cleanup old logs daily at 2 AM
    const cleanupJob = cron.schedule('0 2 * * *', async () => {
      logger.info('Running scheduled cleanup...');
      try {
        await this.cleanupOldLogs();
        logger.info('Scheduled cleanup completed');
      } catch (error) {
        logger.error('Scheduled cleanup failed:', error);
      }
    });

    this.jobs.push(autoMessageJob, cleanupJob);

    // Start all jobs
    this.jobs.forEach(job => job.start());

    logger.info(`Scheduler service started with ${this.jobs.length} jobs`);
  }

  /**
   * Stop all scheduled jobs
   */
  static stop(): void {
    logger.info('Stopping scheduler service...');
    
    this.jobs.forEach(job => {
      job.stop();
      job.destroy();
    });
    
    this.jobs = [];
    logger.info('Scheduler service stopped');
  }

  /**
   * Cleanup old auto-message logs (older than 30 days)
   */
  private static async cleanupOldLogs(): Promise<void> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prisma.autoMessageLog.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      });

      logger.info(`Cleaned up ${result.count} old auto-message logs`);
    } catch (error) {
      logger.error('Failed to cleanup old logs:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Get scheduler status
   */
  static getStatus(): { running: boolean; jobCount: number } {
    return {
      running: this.jobs.length > 0,
      jobCount: this.jobs.length
    };
  }
}