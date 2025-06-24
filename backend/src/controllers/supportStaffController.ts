import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/auth';

const prisma = new PrismaClient();

// 応援スタッフプロフィール作成
export const createSupportStaffProfile = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      skills,
      licenses,
      experience,
      specialties,
      preferredAreas,
      maxDistance,
      minHourlyRate
    } = req.body;

    const profile = await prisma.supportStaffProfile.create({
      data: {
        name,
        email,
        phone,
        skills: JSON.stringify(skills),
        licenses: licenses ? JSON.stringify(licenses) : null,
        experience,
        specialties,
        preferredAreas: JSON.stringify(preferredAreas),
        maxDistance,
        minHourlyRate
      }
    });

    res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating support staff profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 勤務可能期間登録
export const createAvailability = async (req: Request, res: Response) => {
  try {
    const {
      staffProfileId,
      availableFrom,
      availableTo,
      availableDays,
      availableHours,
      hourlyRate,
      services,
      preferredAreas,
      notes
    } = req.body;

    const availability = await prisma.supportStaffAvailability.create({
      data: {
        staffProfileId,
        availableFrom: new Date(availableFrom),
        availableTo: new Date(availableTo),
        availableDays: JSON.stringify(availableDays),
        availableHours: JSON.stringify(availableHours),
        hourlyRate,
        services: JSON.stringify(services),
        preferredAreas: preferredAreas ? JSON.stringify(preferredAreas) : null,
        notes
      }
    });

    res.status(201).json(availability);
  } catch (error) {
    console.error('Error creating availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 応援依頼作成（店舗から）
export const createSupportRequest = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      requiredSkills,
      workDate,
      startTime,
      endTime,
      breakTime,
      hourlyRate,
      transportationFee,
      location,
      latitude,
      longitude,
      nearestStation,
      urgencyLevel
    } = req.body;

    const request = await prisma.supportStaffRequest.create({
      data: {
        tenantId: req.staff!.tenantId,
        requesterId: req.staff!.id,
        title,
        description,
        requiredSkills: JSON.stringify(requiredSkills),
        workDate: new Date(workDate),
        startTime,
        endTime,
        breakTime,
        hourlyRate,
        transportationFee,
        location,
        latitude,
        longitude,
        nearestStation,
        urgencyLevel
      }
    });

    // 近隣の応援可能スタッフに通知を送信
    await notifyNearbyStaff(request);

    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating support request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 近隣の応援可能スタッフ検索
export const searchAvailableStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { lat, lng, date, skills, maxDistance = 20 } = req.query;

    const targetDate = new Date(date as string);
    
    // 位置情報ベースの検索（簡易版）
    const availableStaff = await prisma.supportStaffAvailability.findMany({
      where: {
        availableFrom: { lte: targetDate },
        availableTo: { gte: targetDate },
        isActive: true,
        staffProfile: {
          isActive: true,
          isVerified: true
        }
      },
      include: {
        staffProfile: true
      }
    });

    // スキルフィルタリング
    let filteredStaff = availableStaff;
    if (skills) {
      const requiredSkills = JSON.parse(skills as string);
      filteredStaff = availableStaff.filter(availability => {
        const staffSkills = JSON.parse(availability.staffProfile.skills);
        return requiredSkills.every((skill: string) => staffSkills.includes(skill));
      });
    }

    // 距離計算（簡易版 - 実際はGoogle Maps APIなどを使用）
    const staffWithDistance = filteredStaff.map(availability => ({
      ...availability,
      distance: calculateDistance(
        Number(lat),
        Number(lng),
        // 実際は各スタッフの位置情報を使用
        Number(lat) + Math.random() * 0.1,
        Number(lng) + Math.random() * 0.1
      )
    }));

    // 距離でフィルタリング
    const nearbyStaff = staffWithDistance.filter(
      staff => staff.distance <= Number(maxDistance)
    );

    res.json(nearbyStaff);
  } catch (error) {
    console.error('Error searching available staff:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 応援申し込み
export const applyForSupport = async (req: Request, res: Response) => {
  try {
    const {
      requestId,
      staffProfileId,
      availabilityId,
      message,
      proposedRate,
      canArrive,
      estimatedArrival
    } = req.body;

    const application = await prisma.supportStaffApplication.create({
      data: {
        requestId,
        staffProfileId,
        availabilityId,
        message,
        proposedRate,
        canArrive,
        estimatedArrival
      }
    });

    // 店舗に通知
    await notifyTenantOfApplication(requestId, application);

    res.status(201).json(application);
  } catch (error) {
    console.error('Error applying for support:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 応募承認
export const acceptApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId } = req.params;
    const { agreedRate, agreedStartTime, agreedEndTime, transportationFee } = req.body;

    const application = await prisma.supportStaffApplication.update({
      where: { id: applicationId },
      data: { status: 'ACCEPTED' }
    });

    // マッチング作成
    const match = await prisma.supportStaffMatch.create({
      data: {
        requestId: application.requestId,
        applicationId: application.id,
        supportStaffId: application.staffProfileId,
        agreedRate,
        agreedStartTime,
        agreedEndTime,
        transportationFee
      }
    });

    // 依頼のステータスを更新
    await prisma.supportStaffRequest.update({
      where: { id: application.requestId },
      data: { status: 'MATCHED' }
    });

    // 両者に通知
    await notifyMatchConfirmed(match);

    res.json(match);
  } catch (error) {
    console.error('Error accepting application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ヘルパー関数
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 地球の半径（km）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function notifyNearbyStaff(request: any) {
  // 実装予定：近隣スタッフへの通知ロジック
  console.log('Notifying nearby staff of new request:', request.id);
}

async function notifyTenantOfApplication(requestId: string, application: any) {
  // 実装予定：店舗への通知ロジック
  console.log('Notifying tenant of new application:', application.id);
}

async function notifyMatchConfirmed(match: any) {
  // 実装予定：マッチング確定通知ロジック
  console.log('Notifying both parties of confirmed match:', match.id);
}