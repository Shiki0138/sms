export const businessHoursTemplates = {
  // デフォルトの営業時間
  defaultHours: {
    sunday: { isOpen: false, openTime: '10:00', closeTime: '19:00' },
    monday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
    tuesday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
    wednesday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
    thursday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
    friday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
    saturday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
  },

  // 定休日のサンプル
  regularHolidaysSample: [
    {
      dayOfWeek: 1, // 月曜日
      weekNumbers: [2, 4], // 第2、第4月曜日
    },
  ],

  // 特別休業日のサンプル
  specialHolidaysSample: [
    {
      id: '1',
      name: '年末年始',
      startDate: '2025-12-30',
      endDate: '2026-01-03',
    },
    {
      id: '2',
      name: 'ゴールデンウィーク',
      startDate: '2025-05-03',
      endDate: '2025-05-06',
    },
  ],
};