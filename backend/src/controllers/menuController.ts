import { Request, Response } from 'express';
import { menuService } from '../services/menuService';
import { z } from 'zod';

// リクエストバリデーション用スキーマ
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

const RecordMenuHistorySchema = z.object({
  customerId: z.string().min(1, '顧客IDは必須です'),
  menuId: z.string().min(1, 'メニューIDは必須です'),
  visitDate: z.string().transform((val) => new Date(val)),
  satisfaction: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
});

export class MenuController {
  // === カテゴリー管理 ===
  
  /**
   * カテゴリー一覧取得
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      
      const categories = await menuService.getCategories(tenantId);
      
      res.json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      console.error('カテゴリー一覧取得エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * カテゴリー作成
   */
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const validatedData = CreateMenuCategorySchema.parse(req.body);
      
      const category = await menuService.createCategory(tenantId, validatedData);
      
      res.status(201).json({
        success: true,
        data: category,
        message: 'カテゴリーを作成しました',
      });
    } catch (error: any) {
      console.error('カテゴリー作成エラー:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'バリデーションエラー',
          details: error.errors,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * カテゴリー更新
   */
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { categoryId } = req.params;
      const validatedData = CreateMenuCategorySchema.partial().parse(req.body);
      
      const category = await menuService.updateCategory(tenantId, categoryId, validatedData);
      
      res.json({
        success: true,
        data: category,
        message: 'カテゴリーを更新しました',
      });
    } catch (error: any) {
      console.error('カテゴリー更新エラー:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'バリデーションエラー',
          details: error.errors,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * カテゴリー削除
   */
  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { categoryId } = req.params;
      
      await menuService.deleteCategory(tenantId, categoryId);
      
      res.json({
        success: true,
        message: 'カテゴリーを削除しました',
      });
    } catch (error: any) {
      console.error('カテゴリー削除エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  // === メニュー管理 ===

  /**
   * メニュー一覧取得
   */
  async getMenus(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { categoryId } = req.query;
      
      const menus = await menuService.getMenus(tenantId, categoryId as string);
      
      res.json({
        success: true,
        data: menus,
      });
    } catch (error: any) {
      console.error('メニュー一覧取得エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * メニュー詳細取得
   */
  async getMenu(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { menuId } = req.params;
      
      const menu = await menuService.getMenu(tenantId, menuId);
      
      if (!menu) {
        res.status(404).json({
          success: false,
          error: 'メニューが見つかりません',
        });
        return;
      }
      
      res.json({
        success: true,
        data: menu,
      });
    } catch (error: any) {
      console.error('メニュー詳細取得エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * メニュー作成
   */
  async createMenu(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const validatedData = CreateMenuSchema.parse(req.body);
      
      const menu = await menuService.createMenu(tenantId, validatedData);
      
      res.status(201).json({
        success: true,
        data: menu,
        message: 'メニューを作成しました',
      });
    } catch (error: any) {
      console.error('メニュー作成エラー:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'バリデーションエラー',
          details: error.errors,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * メニュー更新
   */
  async updateMenu(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { menuId } = req.params;
      const validatedData = CreateMenuSchema.partial().parse(req.body);
      
      const menu = await menuService.updateMenu(tenantId, menuId, validatedData);
      
      res.json({
        success: true,
        data: menu,
        message: 'メニューを更新しました',
      });
    } catch (error: any) {
      console.error('メニュー更新エラー:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'バリデーションエラー',
          details: error.errors,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * メニュー削除
   */
  async deleteMenu(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { menuId } = req.params;
      
      await menuService.deleteMenu(tenantId, menuId);
      
      res.json({
        success: true,
        message: 'メニューを削除しました',
      });
    } catch (error: any) {
      console.error('メニュー削除エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  // === AI推奨機能 ===

  /**
   * 顧客向けAI推奨メニュー取得
   */
  async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { customerId } = req.params;
      const limit = parseInt(req.query.limit as string) || 5;
      
      const recommendations = await menuService.getRecommendationsForCustomer(
        tenantId, 
        customerId, 
        limit
      );
      
      res.json({
        success: true,
        data: {
          recommendations: recommendations.map(rec => ({
            menu: rec.menu,
            score: rec.score,
            reasoning: rec.reasoning,
            confidence: rec.score > 0.7 ? 'HIGH' : rec.score > 0.4 ? 'MEDIUM' : 'LOW',
          })),
          generatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日後
        },
      });
    } catch (error: any) {
      console.error('AI推奨取得エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * メニュー履歴記録
   */
  async recordMenuHistory(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const validatedData = RecordMenuHistorySchema.parse(req.body);
      
      const history = await menuService.recordMenuHistory(tenantId, validatedData);
      
      res.status(201).json({
        success: true,
        data: history,
        message: 'メニュー履歴を記録しました',
      });
    } catch (error: any) {
      console.error('メニュー履歴記録エラー:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'バリデーションエラー',
          details: error.errors,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  // === 分析機能 ===

  /**
   * メニュー分析データ取得
   */
  async getMenuAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const period = parseInt(req.query.period as string) || 30;
      
      const analytics = await menuService.getMenuAnalytics(tenantId, period);
      
      // 追加の分析データ
      const totalOrders = analytics.reduce((sum, item) => sum + item.count, 0);
      const averageSatisfaction = analytics.reduce((sum, item, _, arr) => 
        sum + (item.averageSatisfaction || 0) / arr.length, 0
      );
      
      res.json({
        success: true,
        data: {
          analytics,
          summary: {
            totalOrders,
            averageSatisfaction: Math.round(averageSatisfaction * 100) / 100,
            topPerformingMenu: analytics.sort((a, b) => b.count - a.count)[0],
            period: `${period}日間`,
          },
        },
      });
    } catch (error: any) {
      console.error('メニュー分析取得エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * 人気メニュートレンド取得
   */
  async getPopularMenus(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const limit = parseInt(req.query.limit as string) || 10;
      
      const analytics = await menuService.getMenuAnalytics(tenantId, 30);
      
      // 人気順でソート
      const popularMenus = analytics
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map((item, index) => ({
          rank: index + 1,
          menu: item.menu,
          orderCount: item.count,
          averageSatisfaction: item.averageSatisfaction,
          trend: index === 0 ? 'up' : index < 3 ? 'stable' : 'down', // 簡易トレンド
        }));
      
      res.json({
        success: true,
        data: {
          popularMenus,
          period: '30日間',
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      console.error('人気メニュートレンド取得エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }
}

export const menuController = new MenuController();