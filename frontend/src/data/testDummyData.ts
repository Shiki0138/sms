export const testDummyData = {
  customers: [
    { id: '1', name: 'テスト太郎', phone: '090-1234-5678' },
    { id: '2', name: 'テスト花子', phone: '090-8765-4321' }
  ],
  reservations: [
    {
      id: '1',
      customerName: 'テスト太郎',
      startTime: '2024-01-01T10:00:00',
      endTime: '2024-01-01T11:00:00',
      menuContent: 'カット',
      status: 'CONFIRMED' as const
    }
  ],
  staff: [
    { id: '1', name: 'スタッフA' },
    { id: '2', name: 'スタッフB' }
  ]
};

export const testCustomers = testDummyData.customers;
export const testStaff = testDummyData.staff;
export const initialSetupData = {
  businessInfo: {
    name: 'サンプルサロン',
    address: '東京都渋谷区',
    phone: '03-1234-5678',
    email: 'info@salon.com'
  },
  operationHours: {
    weekday: { start: '10:00', end: '20:00' },
    weekend: { start: '10:00', end: '19:00' }
  }
};