import { Router } from 'express';
import { menuController } from '../controllers/menuController';

const router = Router();

// === カテゴリー管理 ===
router.get('/categories', menuController.getCategories);
router.post('/categories', menuController.createCategory);
router.put('/categories/:categoryId', menuController.updateCategory);
router.delete('/categories/:categoryId', menuController.deleteCategory);

// === メニュー管理 ===
router.get('/', menuController.getMenus);
router.post('/', menuController.createMenu);
router.get('/:menuId', menuController.getMenu);
router.put('/:menuId', menuController.updateMenu);
router.delete('/:menuId', menuController.deleteMenu);

// === AI推奨機能 ===
router.get('/recommendations/:customerId', menuController.getRecommendations);

// === 履歴・分析 ===
router.post('/history', menuController.recordMenuHistory);
router.get('/analytics/overview', menuController.getMenuAnalytics);
router.get('/analytics/popular', menuController.getPopularMenus);

export { router as menusRouter };