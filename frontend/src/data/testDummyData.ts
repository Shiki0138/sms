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