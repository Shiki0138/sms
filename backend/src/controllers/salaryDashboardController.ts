import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { PrismaClient } from '@prisma/client';
import { checkFeatureFlag } from '../middleware/featureFlag';

const prisma = new PrismaClient();

// 給与ダッシュボードのデータを取得
export const getSalaryDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isEnabled = await checkFeatureFlag('salary_transparency_dashboard', req.user?.tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: '給料見える化システムは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
    const targetStaffId = req.params.staffId || req.user?.staffId;

    // 権限チェック: 自分のデータまたは管理者のみ
    if (targetStaffId !== req.user?.staffId && req.user?.role !== 'ADMIN' && req.user?.role !== 'MANAGER') {
      return res.status(403).json({ error: '他のスタッフの給与情報を見る権限がありません' });
    }

    let dashboard = await prisma.salaryDashboard.findUnique({
      where: {
        staffId_year_month: {
          staffId: targetStaffId,
          year: Number(year),
          month: Number(month)
        }
      },
      include: {
        staff: {
          select: { id: true, name: true, role: true }
        },
        dailyRecords: {
          orderBy: { date: 'asc' }
        }
      }
    });

    // ダッシュボードが存在しない場合は作成
    if (!dashboard) {
      dashboard = await createSalaryDashboard(targetStaffId, req.user?.tenantId, Number(year), Number(month));
    } else {
      // データを最新に更新
      dashboard = await updateSalaryDashboard(dashboard.id);
    }

    // 目標達成率と予測を計算
    const projectionData = await calculateProjection(dashboard);

    res.json({
      dashboard: {
        ...dashboard,
        projection: projectionData
      }
    });

  } catch (error) {
    console.error('Get salary dashboard error:', error);
    res.status(500).json({ 
      error: '給与ダッシュボードの取得に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 月間目標を設定
export const setMonthlyGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isEnabled = await checkFeatureFlag('salary_transparency_dashboard', req.user?.tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: '給料見える化システムは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    const { monthlyGoal } = req.body;
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;

    const dashboard = await prisma.salaryDashboard.upsert({
      where: {
        staffId_year_month: {
          staffId: req.user?.staffId,
          year: Number(year),
          month: Number(month)
        }
      },
      update: {
        monthlyGoal: parseFloat(monthlyGoal)
      },
      create: {
        staffId: req.user?.staffId,
        tenantId: req.user?.tenantId,
        year: Number(year),
        month: Number(month),
        monthlyGoal: parseFloat(monthlyGoal)
      }
    });

    // 目標進捗を再計算
    const updatedDashboard = await updateSalaryDashboard(dashboard.id);

    res.json({
      message: '月間目標を設定しました',
      dashboard: updatedDashboard
    });

  } catch (error) {
    console.error('Set monthly goal error:', error);
    res.status(500).json({ 
      error: '月間目標の設定に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 日別実績を記録/更新
export const recordDailySalary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isEnabled = await checkFeatureFlag('salary_transparency_dashboard', req.user?.tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: '給料見える化システムは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    const {
      date,
      hoursWorked,
      customersServed,
      dailyRevenue,
      dailyEarnings,
      supportHours = 0,
      supportEarnings = 0,
      customerRating,
      notes
    } = req.body;

    const recordDate = new Date(date);
    const year = recordDate.getFullYear();
    const month = recordDate.getMonth() + 1;

    // 該当月のダッシュボードを取得または作成
    let dashboard = await prisma.salaryDashboard.findUnique({
      where: {
        staffId_year_month: {
          staffId: req.user?.staffId,
          year,
          month
        }
      }
    });

    if (!dashboard) {
      dashboard = await createSalaryDashboard(req.user?.staffId, req.user?.tenantId, year, month);
    }

    // 日別記録を作成/更新
    const dailyRecord = await prisma.dailySalaryRecord.upsert({
      where: {
        staffId_date: {
          staffId: req.user?.staffId,
          date: recordDate
        }
      },
      update: {
        hoursWorked: parseFloat(hoursWorked),
        customersServed: parseInt(customersServed),
        dailyRevenue: parseFloat(dailyRevenue),
        dailyEarnings: parseFloat(dailyEarnings),
        supportHours: parseFloat(supportHours),
        supportEarnings: parseFloat(supportEarnings),
        customerRating: customerRating ? parseFloat(customerRating) : null,
        notes
      },
      create: {
        dashboardId: dashboard.id,
        staffId: req.user?.staffId,
        date: recordDate,
        hoursWorked: parseFloat(hoursWorked),
        customersServed: parseInt(customersServed),
        dailyRevenue: parseFloat(dailyRevenue),
        dailyEarnings: parseFloat(dailyEarnings),
        supportHours: parseFloat(supportHours),
        supportEarnings: parseFloat(supportEarnings),
        customerRating: customerRating ? parseFloat(customerRating) : null,
        notes
      }
    });

    // ダッシュボードの集計データを更新
    const updatedDashboard = await updateSalaryDashboard(dashboard.id);

    res.json({
      message: '日別実績を記録しました',
      dailyRecord,
      dashboard: updatedDashboard
    });

  } catch (error) {
    console.error('Record daily salary error:', error);
    res.status(500).json({ 
      error: '日別実績の記録に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// インセンティブルール取得
export const getIncentiveRules = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isEnabled = await checkFeatureFlag('incentive_system', req.user?.tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: 'インセンティブシステムは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    const rules = await prisma.incentiveRule.findMany({
      where: {
        tenantId: req.user?.tenantId,
        isActive: true,
        OR: [
          { targetStaffIds: null }, // 全スタッフ対象
          { targetStaffIds: { contains: req.user?.staffId } }, // 特定スタッフ対象
          { targetRoles: { contains: req.user?.role } } // 特定ロール対象
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ rules });

  } catch (error) {
    console.error('Get incentive rules error:', error);
    res.status(500).json({ 
      error: 'インセンティブルールの取得に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// スタッフの達成記録を取得
export const getStaffAchievements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isEnabled = await checkFeatureFlag('incentive_system', req.user?.tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: 'インセンティブシステムは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    const { year = new Date().getFullYear(), month } = req.query;
    const targetStaffId = req.params.staffId || req.user?.staffId;

    // 権限チェック
    if (targetStaffId !== req.user?.staffId && req.user?.role !== 'ADMIN' && req.user?.role !== 'MANAGER') {
      return res.status(403).json({ error: '他のスタッフの達成記録を見る権限がありません' });
    }

    const whereClause: any = {
      staffId: targetStaffId,
      tenantId: req.user?.tenantId,
      achievedAt: {
        gte: new Date(Number(year), month ? Number(month) - 1 : 0, 1)
      }
    };

    if (month) {
      whereClause.achievedAt.lt = new Date(Number(year), Number(month), 1);
    } else {
      whereClause.achievedAt.lt = new Date(Number(year) + 1, 0, 1);
    }

    const achievements = await prisma.staffAchievement.findMany({
      where: whereClause,
      include: {
        rule: {
          select: { name: true, description: true, type: true, rewardType: true }
        },
        staff: {
          select: { name: true }
        }
      },
      orderBy: { achievedAt: 'desc' }
    });

    const totalRewards = achievements.reduce((sum, achievement) => sum + achievement.rewardAmount, 0);

    res.json({
      achievements,
      summary: {
        totalAchievements: achievements.length,
        totalRewards,
        byType: achievements.reduce((acc: any, achievement) => {
          const type = achievement.rule.type;
          acc[type] = (acc[type] || 0) + achievement.rewardAmount;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Get staff achievements error:', error);
    res.status(500).json({ 
      error: '達成記録の取得に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ダッシュボード作成のヘルパー関数
async function createSalaryDashboard(staffId: string, tenantId: string, year: number, month: number) {
  return await prisma.salaryDashboard.create({
    data: {
      staffId,
      tenantId,
      year,
      month
    },
    include: {
      staff: {
        select: { id: true, name: true, role: true }
      },
      dailyRecords: {
        orderBy: { date: 'asc' }
      }
    }
  });
}

// ダッシュボード更新のヘルパー関数
async function updateSalaryDashboard(dashboardId: string) {
  // 日別記録から集計データを計算
  const dailyRecords = await prisma.dailySalaryRecord.findMany({
    where: { dashboardId }
  });

  const totalHours = dailyRecords.reduce((sum, record) => sum + record.hoursWorked, 0);
  const totalCustomers = dailyRecords.reduce((sum, record) => sum + record.customersServed, 0);
  const totalRevenue = dailyRecords.reduce((sum, record) => sum + record.dailyRevenue, 0);
  const totalEarnings = dailyRecords.reduce((sum, record) => sum + record.dailyEarnings, 0);
  const totalSupportHours = dailyRecords.reduce((sum, record) => sum + record.supportHours, 0);
  const totalSupportEarnings = dailyRecords.reduce((sum, record) => sum + record.supportEarnings, 0);

  const avgRating = dailyRecords.filter(r => r.customerRating).length > 0
    ? dailyRecords.reduce((sum, record) => sum + (record.customerRating || 0), 0) / 
      dailyRecords.filter(r => r.customerRating).length
    : 0;

  return await prisma.salaryDashboard.update({
    where: { id: dashboardId },
    data: {
      totalHours,
      totalCustomers,
      totalRevenue,
      supportHours: totalSupportHours,
      supportEarnings: totalSupportEarnings,
      customerRating: avgRating,
      // 基本給与計算（実際のロジックに応じて調整）
      commission: totalRevenue * 0.3, // 30%歩合の例
      totalGross: totalEarnings + totalSupportEarnings,
      totalNet: (totalEarnings + totalSupportEarnings) * 0.8 // 税金等控除後の例
    },
    include: {
      staff: {
        select: { id: true, name: true, role: true }
      },
      dailyRecords: {
        orderBy: { date: 'asc' }
      }
    }
  });
}

// 月末予測計算のヘルパー関数
async function calculateProjection(dashboard: any) {
  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = new Date(dashboard.year, dashboard.month, 0).getDate();
  
  if (dashboard.month !== now.getMonth() + 1 || dashboard.year !== now.getFullYear()) {
    // 過去の月は予測しない
    return null;
  }

  const dailyAverage = dashboard.totalGross / currentDay;
  const projectedTotal = dailyAverage * daysInMonth;
  
  const goalProgress = dashboard.monthlyGoal 
    ? (dashboard.totalGross / dashboard.monthlyGoal) * 100 
    : 0;

  return {
    projectedTotal,
    dailyAverage,
    remainingDays: daysInMonth - currentDay,
    goalProgress: Math.min(goalProgress, 100),
    isOnTrack: dashboard.monthlyGoal ? projectedTotal >= dashboard.monthlyGoal : null
  };
}