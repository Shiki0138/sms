import { Request, Response } from 'express';
import { prisma } from '../database';

/**
 * メッセージスレッド一覧取得（認証なし・デモ用）
 */
export const getThreads = async (req: Request, res: Response) => {
  try {
    const threads = await prisma.messageThread.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            instagramId: true,
            lineId: true,
          },
        },
        assignedStaff: {
          select: {
            id: true,
            name: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            senderType: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderType: 'CUSTOMER',
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Format threads for frontend
    const formattedThreads = threads.map(thread => ({
      id: thread.id,
      customer: thread.customer,
      channel: thread.channel,
      status: thread.status,
      assignedStaff: thread.assignedStaff,
      lastMessage: thread.messages[0] || null,
      unreadCount: thread._count.messages,
      updatedAt: thread.updatedAt,
    }));

    res.status(200).json({
      threads: formattedThreads,
      pagination: {
        page: 1,
        limit: 20,
        total: formattedThreads.length,
        totalPages: 1,
      },
    });
  } catch (error) {
    console.error('Error fetching threads:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * メッセージ送信（認証なし・デモ用）
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { threadId, content, mediaType = 'TEXT' } = req.body;

    // スレッドの存在確認
    const thread = await prisma.messageThread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      res.status(404).json({ error: 'Thread not found' });
      return;
    }

    // メッセージ作成
    const message = await prisma.message.create({
      data: {
        threadId,
        senderType: 'STAFF',
        content,
        mediaType,
        isRead: true,
      },
    });

    // スレッドの更新日時を更新
    await prisma.messageThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });

    res.status(200).json({
      message: 'メッセージが送信されました（デモモード）',
      sentMessage: {
        id: message.id,
        threadId: message.threadId,
        content: message.content,
        mediaType: message.mediaType,
        senderType: message.senderType,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * メッセージ統計取得（認証なし・デモ用）
 */
export const getMessageStats = async (req: Request, res: Response) => {
  try {
    const totalThreads = await prisma.messageThread.count();
    const openThreads = await prisma.messageThread.count({
      where: { status: 'OPEN' },
    });
    const inProgressThreads = await prisma.messageThread.count({
      where: { status: 'IN_PROGRESS' },
    });
    const closedThreads = await prisma.messageThread.count({
      where: { status: 'CLOSED' },
    });
    
    const unreadMessages = await prisma.message.count({
      where: {
        isRead: false,
        senderType: 'CUSTOMER',
      },
    });

    const instagramThreads = await prisma.messageThread.count({
      where: { channel: 'INSTAGRAM' },
    });
    const lineThreads = await prisma.messageThread.count({
      where: { channel: 'LINE' },
    });

    const stats = {
      totalThreads,
      openThreads,
      inProgressThreads,
      closedThreads,
      unreadMessages,
      avgResponseTime: '2.5時間',
      channelBreakdown: {
        INSTAGRAM: instagramThreads,
        LINE: lineThreads,
      },
    };

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error fetching message stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};