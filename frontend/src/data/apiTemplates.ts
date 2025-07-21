export const apiTemplates = [
  {
    id: 'hotpepper',
    name: 'ホットペッパービューティー',
    type: 'external',
    description: 'ホットペッパービューティーとの連携',
    fields: [
      { key: 'apiKey', label: 'APIキー', type: 'password' },
      { key: 'salonId', label: 'サロンID', type: 'text' }
    ],
    credentials: {}
  },
  {
    id: 'line',
    name: 'LINE公式アカウント',
    type: 'messaging',
    description: 'LINE公式アカウントとの連携',
    fields: [
      { key: 'channelAccessToken', label: 'チャネルアクセストークン', type: 'password' },
      { key: 'channelSecret', label: 'チャネルシークレット', type: 'password' }
    ],
    credentials: {}
  },
  {
    id: 'instagram',
    name: 'Instagram',
    type: 'social',
    description: 'Instagramビジネスアカウントとの連携',
    fields: [
      { key: 'accessToken', label: 'アクセストークン', type: 'password' },
      { key: 'businessId', label: 'ビジネスID', type: 'text' }
    ],
    credentials: {}
  },
  {
    id: 'google',
    name: 'Google Calendar',
    type: 'calendar',
    description: 'Googleカレンダーとの連携',
    fields: [
      { key: 'clientId', label: 'クライアントID', type: 'text' },
      { key: 'clientSecret', label: 'クライアントシークレット', type: 'password' }
    ],
    credentials: {}
  }
];

export const recommendedAPISetup = apiTemplates;