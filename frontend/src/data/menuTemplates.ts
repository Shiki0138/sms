export const menuTemplates = {
  hair: [
    { name: 'カット', price: 4000, duration: 30 },
    { name: 'カラー', price: 5000, duration: 90 },
    { name: 'パーマ', price: 6000, duration: 120 },
    { name: 'トリートメント', price: 3000, duration: 30 }
  ],
  nail: [
    { name: 'ジェルネイル', price: 5000, duration: 60 },
    { name: 'スカルプチュア', price: 7000, duration: 90 },
    { name: 'ネイルケア', price: 3000, duration: 30 },
    { name: 'フットネイル', price: 6000, duration: 60 }
  ],
  beauty: [
    { name: 'フェイシャル', price: 8000, duration: 60 },
    { name: 'ボディケア', price: 10000, duration: 90 },
    { name: '脱毛', price: 5000, duration: 30 },
    { name: 'リフトアップ', price: 12000, duration: 60 }
  ],
  eyelash: [
    { name: 'まつげエクステ', price: 5000, duration: 60 },
    { name: 'まつげパーマ', price: 4000, duration: 45 },
    { name: 'リペア', price: 3000, duration: 30 },
    { name: 'オフ', price: 1000, duration: 20 }
  ],
  relaxation: [
    { name: '全身マッサージ', price: 8000, duration: 60 },
    { name: 'フットマッサージ', price: 4000, duration: 30 },
    { name: 'ヘッドスパ', price: 5000, duration: 45 },
    { name: 'アロマセラピー', price: 7000, duration: 60 }
  ]
};

export const setMenuTemplates = menuTemplates;

export const menuCategories = [
  { id: 'hair', name: 'ヘアメニュー' },
  { id: 'nail', name: 'ネイルメニュー' },
  { id: 'beauty', name: 'エステメニュー' },
  { id: 'eyelash', name: 'まつげメニュー' },
  { id: 'relaxation', name: 'リラクゼーション' }
];