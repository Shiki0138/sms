import { Request, Response } from 'express';
import { prisma } from '../database';

/**
 * 予約一覧取得（認証なし・デモ用）
 */
export const getReservations = async (req: Request, res: Response) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    res.status(200).json({
      reservations,
      pagination: {
        page: 1,
        limit: 50,
        total: reservations.length,
        totalPages: 1,
      },
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * 予約作成（認証なし・デモ用）
 */
export const createReservation = async (req: Request, res: Response) => {
  try {
    const {
      startTime,
      endTime,
      menuContent,
      customerName,
      customerId,
      customerPhone,
      customerEmail,
      staffId,
      source = 'MANUAL',
      status = 'CONFIRMED',
      notes,
    } = req.body;

    const reservation = await prisma.reservation.create({
      data: {
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        menuContent,
        customerName,
        customerId,
        customerPhone,
        customerEmail,
        staffId,
        source,
        status,
        notes,
        tenantId: 'demo-tenant-id', // Fixed for demo
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      message: '予約が作成されました（デモモード）',
      reservation,
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Hot Pepper CSV インポート（認証なし・デモ用）
 */
export const importHotPepperCsv = async (req: Request, res: Response) => {
  try {
    // デモ用の固定レスポンス
    res.status(200).json({
      message: 'ホットペッパーCSVインポートが完了しました（デモモード）',
      results: {
        total: 5,
        imported: 4,
        skipped: 1,
        errors: ['Row 3: 無効な日付形式'],
      },
    });
  } catch (error) {
    console.error('Error importing Hot Pepper CSV:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Google Calendar 同期（認証なし・デモ用）
 */
export const syncGoogleCalendar = async (req: Request, res: Response) => {
  try {
    // デモ用の固定レスポンス
    res.status(200).json({
      message: 'Google Calendar同期が完了しました（デモモード）',
      results: {
        imported: 3,
        updated: 2,
        errors: [],
      },
    });
  } catch (error) {
    console.error('Error syncing Google Calendar:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * 予約統計取得（認証なし・デモ用）
 */
export const getReservationStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [
      todayReservations,
      monthReservations,
      confirmedReservations,
      completedReservations,
      cancelledReservations,
    ] = await Promise.all([
      prisma.reservation.count({
        where: {
          startTime: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      }),
      prisma.reservation.count({
        where: {
          startTime: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      prisma.reservation.count({
        where: { status: 'CONFIRMED' },
      }),
      prisma.reservation.count({
        where: { status: 'COMPLETED' },
      }),
      prisma.reservation.count({
        where: { status: 'CANCELLED' },
      }),
    ]);

    const totalReservations = confirmedReservations + completedReservations + cancelledReservations;
    const cancellationRate = totalReservations > 0 
      ? Math.round((cancelledReservations / totalReservations) * 100)
      : 0;

    const stats = {
      todayReservations,
      monthReservations,
      confirmedReservations,
      completedReservations,
      cancelledReservations,
      cancellationRate,
    };

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error fetching reservation stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};