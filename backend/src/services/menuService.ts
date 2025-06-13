import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const CreateMenuCategorySchema = z.object({
  name: z.string().min(1, 'カテゴリー名は必須です'),
  displayOrder: z.number().optional(),
});

const CreateMenuSchema = z.object({
  name: z.string().min(1, 'メニュー名は必須です'),
  description: z.string().optional(),
  price: z.number().min(0, '価格は0以上である必要があります'),
  duration: z.number().min(1, '所要時間は1分以上である必要があります'),
  categoryId: z.string().min(1, 'カテゴリーIDは必須です'),
  displayOrder: z.number().optional(),
  seasonality: z.enum(['SPRING', 'SUMMER', 'AUTUMN', 'WINTER', 'ALL']).optional(),
  ageGroup: z.enum(['TEENS', 'TWENTIES', 'THIRTIES', 'FORTIES_PLUS', 'ALL']).optional(),
  genderTarget: z.enum(['MALE', 'FEMALE', 'ALL']).optional(),
});

const UpdateMenuSchema = CreateMenuSchema.partial();
const UpdateMenuCategorySchema = CreateMenuCategorySchema.partial();

// AI推奨アルゴリズム
interface CustomerAnalysis {
  age?: number;
  gender?: string;
  visitHistory: {
    menuId: string;
    visitDate: Date;
    satisfaction?: number;
  }[];
  preferences: {
    averagePrice: number;
    preferredCategories: string[];
    seasonalTrends: { [season: string]: number };
  };
}

interface RecommendationFactors {
  personalHistory: number;    // 個人履歴ベース
  seasonality: number;       // 季節性
  popularity: number;        // 人気度
  priceMatch: number;        // 価格帯適合
  ageMatch: number;          // 年齢適合
  genderMatch: number;       // 性別適合
}

export class MenuService {
  // カテゴリー関連
  async createCategory(tenantId: string, data: z.infer<typeof CreateMenuCategorySchema>) {
    const validatedData = CreateMenuCategorySchema.parse(data);
    
    return await prisma.menuCategory.create({
      data: {
        ...validatedData,
        tenantId,
      },
    });
  }

  async getCategories(tenantId: string) {
    return await prisma.menuCategory.findMany({
      where: { tenantId, isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        menus: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  async updateCategory(tenantId: string, categoryId: string, data: z.infer<typeof UpdateMenuCategorySchema>) {
    const validatedData = UpdateMenuCategorySchema.parse(data);
    
    return await prisma.menuCategory.update({
      where: { id: categoryId, tenantId },
      data: validatedData,
    });
  }

  async deleteCategory(tenantId: string, categoryId: string) {
    // メニューが存在する場合は論理削除
    const menusCount = await prisma.menu.count({
      where: { categoryId, isActive: true },
    });

    if (menusCount > 0) {
      return await prisma.menuCategory.update({
        where: { id: categoryId, tenantId },
        data: { isActive: false },
      });
    } else {
      return await prisma.menuCategory.delete({
        where: { id: categoryId, tenantId },
      });
    }
  }

  // メニュー関連
  async createMenu(tenantId: string, data: z.infer<typeof CreateMenuSchema>) {
    const validatedData = CreateMenuSchema.parse(data);
    
    // カテゴリーの存在確認
    const category = await prisma.menuCategory.findFirst({
      where: { id: validatedData.categoryId, tenantId, isActive: true },
    });
    
    if (!category) {
      throw new Error('指定されたカテゴリーが見つかりません');
    }

    return await prisma.menu.create({
      data: {
        ...validatedData,
        tenantId,
      },
      include: {
        category: true,
      },
    });
  }

  async getMenus(tenantId: string, categoryId?: string) {
    return await prisma.menu.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(categoryId && { categoryId }),
      },
      orderBy: { displayOrder: 'asc' },
      include: {
        category: true,
      },
    });
  }

  async getMenu(tenantId: string, menuId: string) {
    return await prisma.menu.findFirst({
      where: { id: menuId, tenantId },
      include: {
        category: true,
        menuHistory: {
          include: {
            customer: true,
          },
          orderBy: { visitDate: 'desc' },
          take: 10,
        },
      },
    });
  }

  async updateMenu(tenantId: string, menuId: string, data: z.infer<typeof UpdateMenuSchema>) {
    const validatedData = UpdateMenuSchema.parse(data);
    
    // カテゴリー変更の場合は存在確認
    if (validatedData.categoryId) {
      const category = await prisma.menuCategory.findFirst({
        where: { id: validatedData.categoryId, tenantId, isActive: true },
      });
      
      if (!category) {
        throw new Error('指定されたカテゴリーが見つかりません');
      }
    }

    return await prisma.menu.update({
      where: { id: menuId, tenantId },
      data: validatedData,
      include: {
        category: true,
      },
    });
  }

  async deleteMenu(tenantId: string, menuId: string) {
    // 履歴が存在する場合は論理削除
    const historyCount = await prisma.menuHistory.count({
      where: { menuId },
    });

    if (historyCount > 0) {
      return await prisma.menu.update({
        where: { id: menuId, tenantId },
        data: { isActive: false },
      });
    } else {
      return await prisma.menu.delete({
        where: { id: menuId, tenantId },
      });
    }
  }

  // AI推奨機能
  async getRecommendationsForCustomer(tenantId: string, customerId: string, limit = 5) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, tenantId },
      include: {
        menuHistory: {
          include: { menu: true },
          orderBy: { visitDate: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new Error('顧客が見つかりません');
    }

    // 顧客分析
    const analysis = await this.analyzeCustomer(customer);
    
    // 全メニューを取得
    const allMenus = await prisma.menu.findMany({
      where: { tenantId, isActive: true },
      include: { category: true },
    });

    // 各メニューのスコア計算
    const recommendations = await Promise.all(
      allMenus.map(async (menu) => {
        const score = await this.calculateRecommendationScore(menu, analysis);
        const reasoning = this.generateReasoning(menu, analysis, score.factors);
        
        return {
          menu,
          score: score.total,
          reasoning,
          factors: score.factors,
        };
      })
    );

    // スコア順でソート
    recommendations.sort((a, b) => b.score - a.score);

    // 上位を保存
    const topRecommendations = recommendations.slice(0, limit);
    
    await this.saveRecommendations(tenantId, customerId, topRecommendations);

    return topRecommendations;
  }

  private async analyzeCustomer(customer: any): Promise<CustomerAnalysis> {
    const visitHistory = customer.menuHistory.map((h: any) => ({
      menuId: h.menuId,
      visitDate: h.visitDate,
      satisfaction: h.satisfaction,
    }));

    // 年齢計算
    const age = customer.birthDate 
      ? new Date().getFullYear() - customer.birthDate.getFullYear()
      : undefined;

    // 料金平均計算
    const averagePrice = visitHistory.length > 0
      ? customer.menuHistory.reduce((sum: number, h: any) => sum + h.menu.price, 0) / customer.menuHistory.length
      : 5000; // デフォルト値

    // カテゴリー傾向
    const categoryCount: { [key: string]: number } = {};
    customer.menuHistory.forEach((h: any) => {
      const categoryId = h.menu.categoryId;
      categoryCount[categoryId] = (categoryCount[categoryId] || 0) + 1;
    });

    const preferredCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([categoryId]) => categoryId);

    // 季節傾向（簡易版）
    const seasonalTrends = this.calculateSeasonalTrends(visitHistory);

    return {
      age,
      gender: customer.gender,
      visitHistory,
      preferences: {
        averagePrice,
        preferredCategories,
        seasonalTrends,
      },
    };
  }

  private async calculateRecommendationScore(menu: any, analysis: CustomerAnalysis) {
    const factors: RecommendationFactors = {
      personalHistory: 0,
      seasonality: 0,
      popularity: 0,
      priceMatch: 0,
      ageMatch: 0,
      genderMatch: 0,
    };

    // 個人履歴ベース（30%）
    const hasUsedMenu = analysis.visitHistory.some(h => h.menuId === menu.id);
    if (hasUsedMenu) {
      const lastSatisfaction = analysis.visitHistory
        .filter(h => h.menuId === menu.id)
        .reduce((sum, h) => sum + (h.satisfaction || 3), 0) / 
        analysis.visitHistory.filter(h => h.menuId === menu.id).length;
      factors.personalHistory = lastSatisfaction / 5;
    } else {
      // 同カテゴリーの履歴から推測
      const categoryScore = analysis.preferences.preferredCategories.includes(menu.categoryId) ? 0.8 : 0.3;
      factors.personalHistory = categoryScore;
    }

    // 季節性（15%）
    const currentSeason = this.getCurrentSeason();
    if (menu.seasonality === 'ALL' || menu.seasonality === currentSeason) {
      factors.seasonality = 1.0;
    } else {
      factors.seasonality = 0.3;
    }

    // 人気度（20%）
    factors.popularity = menu.popularity / 100; // 0-1 にノーマライズ

    // 価格適合（15%）
    const priceDiff = Math.abs(menu.price - analysis.preferences.averagePrice);
    const maxPriceDiff = analysis.preferences.averagePrice * 0.5; // 50%の差まで許容
    factors.priceMatch = Math.max(0, 1 - (priceDiff / maxPriceDiff));

    // 年齢適合（10%）
    if (analysis.age && menu.ageGroup && menu.ageGroup !== 'ALL') {
      const ageMatch = this.checkAgeMatch(analysis.age, menu.ageGroup);
      factors.ageMatch = ageMatch ? 1.0 : 0.3;
    } else {
      factors.ageMatch = 0.7; // 不明な場合は中間値
    }

    // 性別適合（10%）
    if (analysis.gender && menu.genderTarget && menu.genderTarget !== 'ALL') {
      factors.genderMatch = analysis.gender === menu.genderTarget ? 1.0 : 0.2;
    } else {
      factors.genderMatch = 0.7; // 不明な場合は中間値
    }

    // 重み付け合計
    const total = 
      factors.personalHistory * 0.3 +
      factors.seasonality * 0.15 +
      factors.popularity * 0.2 +
      factors.priceMatch * 0.15 +
      factors.ageMatch * 0.1 +
      factors.genderMatch * 0.1;

    return { total, factors };
  }

  private generateReasoning(menu: any, analysis: CustomerAnalysis, factors: RecommendationFactors): string {
    const reasons: string[] = [];

    if (factors.personalHistory > 0.7) {
      reasons.push('過去にご利用いただき満足度が高いメニューです');
    } else if (analysis.preferences.preferredCategories.includes(menu.categoryId)) {
      reasons.push('お好みのカテゴリーのメニューです');
    }

    if (factors.seasonality > 0.8) {
      reasons.push('今の季節にぴったりのメニューです');
    }

    if (factors.popularity > 0.7) {
      reasons.push('人気の高いメニューです');
    }

    if (factors.priceMatch > 0.8) {
      reasons.push('普段ご利用の価格帯に近いメニューです');
    }

    if (reasons.length === 0) {
      reasons.push('新しい体験としておすすめのメニューです');
    }

    return reasons.join('、');
  }

  private calculateSeasonalTrends(visitHistory: any[]): { [season: string]: number } {
    const trends: { [key: string]: number } = { SPRING: 0, SUMMER: 0, AUTUMN: 0, WINTER: 0 };
    
    visitHistory.forEach(visit => {
      const season = this.getSeasonFromDate(visit.visitDate);
      trends[season]++;
    });

    return trends;
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'SPRING';
    if (month >= 6 && month <= 8) return 'SUMMER';
    if (month >= 9 && month <= 11) return 'AUTUMN';
    return 'WINTER';
  }

  private getSeasonFromDate(date: Date): string {
    const month = date.getMonth() + 1;
    if (month >= 3 && month <= 5) return 'SPRING';
    if (month >= 6 && month <= 8) return 'SUMMER';
    if (month >= 9 && month <= 11) return 'AUTUMN';
    return 'WINTER';
  }

  private checkAgeMatch(age: number, ageGroup: string): boolean {
    switch (ageGroup) {
      case 'TEENS': return age >= 13 && age <= 19;
      case 'TWENTIES': return age >= 20 && age <= 29;
      case 'THIRTIES': return age >= 30 && age <= 39;
      case 'FORTIES_PLUS': return age >= 40;
      default: return true;
    }
  }

  private async saveRecommendations(tenantId: string, customerId: string, recommendations: any[]) {
    // 既存の推奨を削除
    await prisma.menuRecommendation.deleteMany({
      where: { customerId, tenantId },
    });

    // 新しい推奨を保存
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30日間有効

    await prisma.menuRecommendation.createMany({
      data: recommendations.map(rec => ({
        customerId,
        menuId: rec.menu.id,
        tenantId,
        score: rec.score,
        reasoning: rec.reasoning,
        factors: JSON.stringify(rec.factors),
        expiresAt,
      })),
    });
  }

  // メニュー履歴記録
  async recordMenuHistory(tenantId: string, data: {
    customerId: string;
    menuId: string;
    visitDate: Date;
    satisfaction?: number;
    notes?: string;
  }) {
    // メニューの人気度を更新
    await prisma.menu.update({
      where: { id: data.menuId },
      data: {
        popularity: {
          increment: 1,
        },
      },
    });

    return await prisma.menuHistory.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  // 分析用データ取得
  async getMenuAnalytics(tenantId: string, period = 30) {
    const since = new Date();
    since.setDate(since.getDate() - period);

    const menuStats = await prisma.menuHistory.groupBy({
      by: ['menuId'],
      where: {
        tenantId,
        visitDate: {
          gte: since,
        },
      },
      _count: {
        id: true,
      },
      _avg: {
        satisfaction: true,
      },
    });

    const menuDetails = await prisma.menu.findMany({
      where: {
        tenantId,
        id: {
          in: menuStats.map(stat => stat.menuId),
        },
      },
      include: {
        category: true,
      },
    });

    return menuStats.map(stat => {
      const menu = menuDetails.find(m => m.id === stat.menuId);
      return {
        menu,
        count: stat._count.id,
        averageSatisfaction: stat._avg.satisfaction,
      };
    });
  }
}

export const menuService = new MenuService();