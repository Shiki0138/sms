import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import BusinessHoursService from '../services/businessHoursService';

const router = Router();
const businessHoursService = new BusinessHoursService();

// 営業時間・休日設定を取得
router.get('/settings/:salonId', authenticateToken, async (req, res) => {
  try {
    const { salonId } = req.params;
    const settings = await businessHoursService.getBusinessHoursSettings(salonId);
    res.json(settings);
  } catch (error) {
    console.error('営業時間設定の取得エラー:', error);
    res.status(500).json({ error: '営業時間設定の取得に失敗しました' });
  }
});

// 営業時間・休日設定を更新
router.put('/settings/:salonId', authenticateToken, async (req, res) => {
  try {
    const { salonId } = req.params;
    const settings = req.body;
    const updatedSettings = await businessHoursService.updateBusinessHoursSettings(salonId, settings);
    res.json(updatedSettings);
  } catch (error) {
    console.error('営業時間設定の更新エラー:', error);
    res.status(500).json({ error: '営業時間設定の更新に失敗しました' });
  }
});

// 特定日が休日かどうかをチェック
router.get('/check-holiday/:salonId/:date', authenticateToken, async (req, res) => {
  try {
    const { salonId, date } = req.params;
    const holidayInfo = await businessHoursService.checkIfHoliday(salonId, new Date(date));
    res.json(holidayInfo);
  } catch (error) {
    console.error('休日チェックエラー:', error);
    res.status(500).json({ error: '休日チェックに失敗しました' });
  }
});

// 特定期間の休日一覧を取得
router.get('/holidays/:salonId', authenticateToken, async (req, res) => {
  try {
    const { salonId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: '開始日と終了日を指定してください' });
    }
    
    const holidays = await businessHoursService.getHolidaysInRange(
      salonId,
      new Date(startDate as string),
      new Date(endDate as string)
    );
    
    res.json(holidays);
  } catch (error) {
    console.error('休日一覧取得エラー:', error);
    res.status(500).json({ error: '休日一覧の取得に失敗しました' });
  }
});

export default router;