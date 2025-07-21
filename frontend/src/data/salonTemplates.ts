export const salonTemplates = [
  { id: '1', name: 'ヘアサロン', type: 'hair' },
  { id: '2', name: 'ネイルサロン', type: 'nail' },
  { id: '3', name: 'エステサロン', type: 'beauty' },
  { id: '4', name: 'まつげエクステ', type: 'eyelash' },
  { id: '5', name: 'リラクゼーション', type: 'relaxation' }
];

interface SalonOption {
  id: string;
  name: string;
  type: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  capacity: number;
  priceRange: string;
  services: string[];
  openHours: string;
}

interface SalonOptionsWithExtras {
  salonTypes: string[];
  prefectures: string[];
  capacityOptions: { value: number; label: string }[];
}

export const salonOptions: SalonOption[] = [
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

export const salonOptionsExtras: SalonOptionsWithExtras = {
  salonTypes: ['hair', 'nail', 'beauty', 'eyelash', 'relaxation'],
  prefectures: ['東京都', '神奈川県', '千葉県', '埼玉県'],
  capacityOptions: [
    { value: 5, label: '5席' },
    { value: 10, label: '10席' },
    { value: 15, label: '15席' },
    { value: 20, label: '20席' },
    { value: 30, label: '30席' },
    { value: 50, label: '50席' }
  ]
};