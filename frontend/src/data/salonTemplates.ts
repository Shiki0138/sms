export const salonTemplates = [
  { id: '1', name: 'ヘアサロン', type: 'hair' },
  { id: '2', name: 'ネイルサロン', type: 'nail' },
  { id: '3', name: 'エステサロン', type: 'beauty' },
  { id: '4', name: 'まつげエクステ', type: 'eyelash' },
  { id: '5', name: 'リラクゼーション', type: 'relaxation' }
];

export const salonOptions = [
  {
    id: '1',
    name: 'ヘアサロン',
    type: 'hair',
    description: '美容室・理容室',
    address: '東京都渋谷区',
    phone: '03-1234-5678',
    email: 'info@salon.com',
    capacity: 10,
    priceRange: '¥3,000〜¥10,000',
    services: ['カット', 'カラー', 'パーマ'],
    openHours: '10:00-20:00'
  }
];

(salonOptions as any).salonTypes = ['hair', 'nail', 'beauty', 'eyelash', 'relaxation'];
(salonOptions as any).prefectures = ['東京都', '神奈川県', '千葉県', '埼玉県'];
(salonOptions as any).capacityOptions = [5, 10, 15, 20, 30, 50];