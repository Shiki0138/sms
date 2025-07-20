export const apiTemplates = [
  {
    id: 'hotpepper',
    name: 'ホットペッパービューティー',
    fields: [
      { key: 'apiKey', label: 'APIキー', type: 'password' },
      { key: 'salonId', label: 'サロンID', type: 'text' }
    ]
  },
  {
    id: 'line',
    name: 'LINE公式アカウント',
    fields: [
      { key: 'channelAccessToken', label: 'チャネルアクセストークン', type: 'password' },
      { key: 'channelSecret', label: 'チャネルシークレット', type: 'password' }
    ]
  },
  {
    id: 'instagram',
    name: 'Instagram',
    fields: [
      { key: 'accessToken', label: 'アクセストークン', type: 'password' },
      { key: 'businessId', label: 'ビジネスID', type: 'text' }
    ]
  },
  {
    id: 'google',
    name: 'Google Calendar',
    fields: [
      { key: 'clientId', label: 'クライアントID', type: 'text' },
      { key: 'clientSecret', label: 'クライアントシークレット', type: 'password' }
    ]
  }
];