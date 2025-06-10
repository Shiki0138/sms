import { Request, Response } from 'express';
import { prisma } from '../database';

/**
 * 顧客一覧取得（認証なし・デモ用）
 */
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        instagramId: true,
        lineId: true,
        visitCount: true,
        lastVisitDate: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      customers,
      pagination: {
        page: 1,
        limit: 20,
        total: customers.length,
        totalPages: 1,
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * 顧客詳細取得（認証なし・デモ用）
 */
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        reservations: {
          orderBy: { startTime: 'desc' },
          take: 10,
        },
        threads: {
          orderBy: { updatedAt: 'desc' },
          take: 5,
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.status(200).json({ customer });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * 顧客統計取得（認証なし・デモ用）
 */
export const getCustomerStats = async (req: Request, res: Response) => {
  try {
    const totalCustomers = await prisma.customer.count();
    
    const newCustomersThisMonth = await prisma.customer.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });
    
    const activeCustomers = await prisma.customer.count({
      where: {
        lastVisitDate: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      },
    });
    
    const averageVisitCount = await prisma.customer.aggregate({
      _avg: { visitCount: true },
    });

    const stats = {
      totalCustomers,
      newCustomersThisMonth,
      activeCustomers,
      averageVisitCount: Math.round(averageVisitCount._avg.visitCount || 0),
    };

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};