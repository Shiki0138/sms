import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { PrismaClient } from '@prisma/client';
import { checkFeatureFlag } from '../middleware/featureFlag';

const prisma = new PrismaClient();

// 応援要請を作成
export const createSupportRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // フィーチャーフラグチェック
    const isEnabled = await checkFeatureFlag('support_beautician_service', req.user?.tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: '応援美容師サービスは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    const {
      title,
      description,
      requiredSkills,
      preferredTime,
      duration,
      hourlyRate,
      location,
      latitude,
      longitude,
      maxDistance = 10,
      urgencyLevel = 'MEDIUM'
    } = req.body;

    const supportRequest = await prisma.supportRequest.create({
      data: {
        tenantId: req.user?.tenantId,
        requesterId: req.user?.staffId,
        title,
        description,
        requiredSkills: JSON.stringify(requiredSkills || []),
        preferredTime: new Date(preferredTime),
        duration: parseInt(duration),
        hourlyRate: parseFloat(hourlyRate),
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        maxDistance: parseInt(maxDistance),
        urgencyLevel
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true }
        },
        tenant: {
          select: { id: true, name: true }
        }
      }
    });

    // 近隣の応援可能な美容師を検索してマッチング通知
    if (latitude && longitude) {
      await notifyNearbyStylists(supportRequest);
    }

    res.status(201).json({
      message: '応援要請を作成しました',
      supportRequest
    });

  } catch (error) {
    console.error('Support request creation error:', error);
    res.status(500).json({ 
      error: '応援要請の作成に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 自分の応援可能時間を登録
export const createAvailability = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isEnabled = await checkFeatureFlag('support_beautician_service', req.user?.tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: '応援美容師サービスは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    const {
      availableFrom,
      availableTo,
      skills,
      hourlyRate,
      maxDistance = 15,
      notes
    } = req.body;

    const availability = await prisma.supportAvailability.create({
      data: {
        staffId: req.user?.staffId,
        tenantId: req.user?.tenantId,
        availableFrom: new Date(availableFrom),
        availableTo: new Date(availableTo),
        skills: JSON.stringify(skills || []),
        hourlyRate: parseFloat(hourlyRate),
        maxDistance: parseInt(maxDistance),
        notes
      },
      include: {
        staff: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: '応援可能時間を登録しました',
      availability
    });

  } catch (error) {
    console.error('Availability creation error:', error);
    res.status(500).json({ 
      error: '応援可能時間の登録に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 応援要請に応答
export const respondToRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isEnabled = await checkFeatureFlag('support_beautician_service', req.user?.tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: '応援美容師サービスは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    const { requestId } = req.params;
    const { availabilityId, message, proposedRate } = req.body;

    // 既に応答済みかチェック
    const existingResponse = await prisma.supportResponse.findUnique({
      where: {
        requestId_responderId: {
          requestId,
          responderId: req.user?.staffId
        }
      }
    });

    if (existingResponse) {
      return res.status(400).json({ error: '既にこの要請に応答済みです' });
    }

    const response = await prisma.supportResponse.create({
      data: {
        requestId,
        availabilityId,
        responderId: req.user?.staffId,
        message,
        proposedRate: proposedRate ? parseFloat(proposedRate) : null
      },
      include: {
        availability: {
          include: {
            staff: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        request: {
          include: {
            requester: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: '応援要請に応答しました',
      response
    });

  } catch (error) {
    console.error('Response creation error:', error);
    res.status(500).json({ 
      error: '応答の送信に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 近隣の応援可能な美容師に通知
async function notifyNearbyStylists(request: any) {
  try {
    // 簡易的な距離計算（実装時はより精密な計算が必要）
    const availableStylists = await prisma.supportAvailability.findMany({
      where: {
        isActive: true,
        availableFrom: { lte: request.preferredTime },
        availableTo: { gte: request.preferredTime }
      },
      include: {
        staff: { select: { id: true, name: true, email: true } }
      }
    });

    // TODO: 実際の通知システム（メール・プッシュ通知等）を実装
    console.log(`Notifying ${availableStylists.length} nearby stylists about support request ${request.id}`);

  } catch (error) {
    console.error('Notification error:', error);
  }
}

// 応援要請一覧取得
export const getSupportRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isEnabled = await checkFeatureFlag('support_beautician_service', req.user?.tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: '応援美容師サービスは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    const { status = 'OPEN', page = 1, limit = 20 } = req.query;

    const requests = await prisma.supportRequest.findMany({
      where: {
        tenantId: req.user?.tenantId,
        status: status as string
      },
      include: {
        requester: {
          select: { id: true, name: true }
        },
        responses: {
          include: {
            responder: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    res.json({
      requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: requests.length
      }
    });

  } catch (error) {
    console.error('Get support requests error:', error);
    res.status(500).json({ 
      error: '応援要請の取得に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 自分の応援可能時間一覧取得
export const getMyAvailability = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isEnabled = await checkFeatureFlag('support_beautician_service', req.user?.tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: '応援美容師サービスは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    const availability = await prisma.supportAvailability.findMany({
      where: {
        staffId: req.user?.staffId,
        isActive: true
      },
      orderBy: { availableFrom: 'asc' }
    });

    res.json({ availability });

  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ 
      error: '応援可能時間の取得に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// マッチング確定
export const confirmMatch = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isEnabled = await checkFeatureFlag('support_beautician_service', req.user?.tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: '応援美容師サービスは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    const { responseId } = req.params;
    const { agreedRate, startTime, endTime } = req.body;

    // 応答の詳細を取得
    const response = await prisma.supportResponse.findUnique({
      where: { id: responseId },
      include: {
        request: {
          include: { requester: true }
        },
        responder: true
      }
    });

    if (!response) {
      return res.status(404).json({ error: '応答が見つかりません' });
    }

    // 要請者のみがマッチングを確定できる
    if (response.request.requesterId !== req.user?.staffId) {
      return res.status(403).json({ error: 'マッチング確定権限がありません' });
    }

    const match = await prisma.supportMatch.create({
      data: {
        requestId: response.requestId,
        responseId: response.id,
        supporterId: response.responderId,
        requesterId: response.request.requesterId,
        agreedRate: parseFloat(agreedRate),
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      },
      include: {
        supporter: {
          select: { id: true, name: true, email: true }
        },
        requester: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // 応援要請のステータスを更新
    await prisma.supportRequest.update({
      where: { id: response.requestId },
      data: { status: 'MATCHED' }
    });

    res.status(201).json({
      message: 'マッチングが確定しました',
      match
    });

  } catch (error) {
    console.error('Match confirmation error:', error);
    res.status(500).json({ 
      error: 'マッチング確定に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};