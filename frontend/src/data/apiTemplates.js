export const apiTemplates = [
    {
        id: 'line-messaging-api',
        name: 'LINE Messaging API',
        type: 'line',
        endpoint: 'https://api.line.me/v2/bot/message',
        description: 'LINEメッセージの送受信・ユーザー管理',
        required: false,
        testMode: true,
        enabled: false,
        credentials: {
            channelAccessToken: {
                label: 'チャンネルアクセストークン',
                value: '',
                type: 'token',
                required: true,
                placeholder: 'your-channel-access-token',
                description: 'LINE Developersで発行されるアクセストークン'
            },
            channelSecret: {
                label: 'チャンネルシークレット',
                value: '',
                type: 'password',
                required: true,
                placeholder: 'your-channel-secret',
                description: 'Webhookの署名検証に使用'
            },
            webhookUrl: {
                label: 'Webhook URL',
                value: '',
                type: 'url',
                required: true,
                placeholder: 'https://your-app.com/webhook/line',
                description: 'LINE Platformに設定するWebhook URL'
            }
        },
        testData: {
            sampleMessage: 'こんにちは！サロンです。ご予約ありがとうございます。',
            testUserId: 'U123456789abcdef123456789abcdef12',
            testGroupId: 'C123456789abcdef123456789abcdef12'
        },
        restrictions: {
            maxRequestsPerDay: 1000,
            maxRequestsPerHour: 100,
            allowExternalSend: false,
            testModeOnly: true
        }
    },
    {
        id: 'instagram-basic-display',
        name: 'Instagram Basic Display API',
        type: 'instagram',
        endpoint: 'https://graph.instagram.com',
        description: 'Instagramメッセージ・投稿の管理',
        required: false,
        testMode: true,
        enabled: false,
        credentials: {
            appId: {
                label: 'アプリID',
                value: '',
                type: 'text',
                required: true,
                placeholder: '123456789012345',
                description: 'Facebook Developersで作成したアプリID'
            },
            appSecret: {
                label: 'アプリシークレット',
                value: '',
                type: 'password',
                required: true,
                placeholder: 'your-app-secret',
                description: 'アプリのシークレットキー'
            },
            accessToken: {
                label: 'アクセストークン',
                value: '',
                type: 'token',
                required: true,
                placeholder: 'IGQVJXabc123...',
                description: 'ユーザーアクセストークン'
            },
            webhookSecret: {
                label: 'Webhookシークレット',
                value: '',
                type: 'password',
                required: false,
                placeholder: 'your-webhook-secret',
                description: 'Webhook署名検証用のシークレット'
            }
        },
        testData: {
            sampleMessage: 'インスタグラムからのお問い合わせありがとうございます！',
            testUserId: 'ig_user_123456789',
            testConversationId: 'conversation_123456789'
        },
        restrictions: {
            maxRequestsPerDay: 500,
            maxRequestsPerHour: 50,
            allowExternalSend: false,
            testModeOnly: true
        }
    },
    {
        id: 'google-calendar',
        name: 'Google Calendar API',
        type: 'google',
        endpoint: 'https://www.googleapis.com/calendar/v3',
        description: 'Googleカレンダーとの予約同期',
        required: false,
        testMode: true,
        enabled: false,
        credentials: {
            clientId: {
                label: 'クライアントID',
                value: '',
                type: 'text',
                required: true,
                placeholder: '123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
                description: 'Google Cloud Consoleで作成したクライアントID'
            },
            clientSecret: {
                label: 'クライアントシークレット',
                value: '',
                type: 'password',
                required: true,
                placeholder: 'GOCSPX-abc123...',
                description: 'クライアントシークレット'
            },
            redirectUri: {
                label: 'リダイレクトURI',
                value: '',
                type: 'url',
                required: true,
                placeholder: 'https://your-app.com/auth/google/callback',
                description: 'OAuth認証後のリダイレクト先'
            },
            calendarId: {
                label: 'カレンダーID',
                value: '',
                type: 'text',
                required: false,
                placeholder: 'primary または specific-calendar-id@group.calendar.google.com',
                description: '同期対象のカレンダーID（空欄の場合はプライマリカレンダー）'
            }
        },
        testData: {
            sampleEvent: {
                summary: '田中様 カット+カラー',
                start: '2025-06-20T10:00:00+09:00',
                end: '2025-06-20T12:00:00+09:00',
                description: 'サロン管理システムからの予約'
            }
        },
        restrictions: {
            maxRequestsPerDay: 1000,
            maxRequestsPerHour: 100,
            allowExternalSend: false,
            testModeOnly: true
        }
    },
    {
        id: 'stripe-payment',
        name: 'Stripe Payment API',
        type: 'stripe',
        endpoint: 'https://api.stripe.com/v1',
        description: 'クレジットカード決済処理',
        required: false,
        testMode: true,
        enabled: false,
        credentials: {
            publishableKey: {
                label: '公開可能キー',
                value: '',
                type: 'text',
                required: true,
                placeholder: 'pk_test_abc123...',
                description: 'フロントエンドで使用する公開キー'
            },
            secretKey: {
                label: 'シークレットキー',
                value: '',
                type: 'password',
                required: true,
                placeholder: 'sk_test_abc123...',
                description: 'サーバーサイドで使用するシークレットキー'
            },
            webhookSecret: {
                label: 'Webhookシークレット',
                value: '',
                type: 'password',
                required: false,
                placeholder: 'whsec_abc123...',
                description: 'Webhook署名検証用'
            }
        },
        testData: {
            testCardNumber: '4242424242424242',
            testCardExpiry: '12/25',
            testCardCvc: '123',
            testAmount: 5000
        },
        restrictions: {
            maxRequestsPerDay: 2000,
            maxRequestsPerHour: 200,
            allowExternalSend: false,
            testModeOnly: true
        }
    },
    {
        id: 'smtp-email',
        name: 'SMTP メール送信',
        type: 'email',
        endpoint: 'smtp://your-smtp-server.com',
        description: '予約確認・リマインダーメール送信',
        required: false,
        testMode: true,
        enabled: false,
        credentials: {
            smtpHost: {
                label: 'SMTPホスト',
                value: '',
                type: 'text',
                required: true,
                placeholder: 'smtp.gmail.com',
                description: 'SMTPサーバーのホスト名'
            },
            smtpPort: {
                label: 'SMTPポート',
                value: '587',
                type: 'text',
                required: true,
                placeholder: '587',
                description: 'SMTPポート番号（587推奨）'
            },
            username: {
                label: 'ユーザー名',
                value: '',
                type: 'text',
                required: true,
                placeholder: 'your-email@example.com',
                description: 'SMTP認証用のユーザー名（通常はメールアドレス）'
            },
            password: {
                label: 'パスワード',
                value: '',
                type: 'password',
                required: true,
                placeholder: 'your-app-password',
                description: 'SMTP認証用のパスワード'
            },
            fromName: {
                label: '送信者名',
                value: '',
                type: 'text',
                required: false,
                placeholder: 'Hair Studio TOKYO',
                description: 'メールの送信者として表示される名前'
            }
        },
        testData: {
            testEmail: 'test@example.com',
            testSubject: '予約確認メール（テスト）',
            testBody: 'ご予約ありがとうございます。テストメールです。'
        },
        restrictions: {
            maxRequestsPerDay: 500,
            maxRequestsPerHour: 50,
            allowExternalSend: false,
            testModeOnly: true
        }
    },
    {
        id: 'sms-service',
        name: 'SMS送信サービス',
        type: 'sms',
        endpoint: 'https://api.sms-service.com/v1',
        description: '予約リマインダーSMS送信',
        required: false,
        testMode: true,
        enabled: false,
        credentials: {
            apiKey: {
                label: 'APIキー',
                value: '',
                type: 'token',
                required: true,
                placeholder: 'sms_api_key_abc123...',
                description: 'SMS送信サービスのAPIキー'
            },
            senderId: {
                label: '送信者ID',
                value: '',
                type: 'text',
                required: false,
                placeholder: 'SalonTokyo',
                description: 'SMS送信者として表示されるID'
            },
            endpoint: {
                label: 'エンドポイントURL',
                value: '',
                type: 'url',
                required: true,
                placeholder: 'https://api.sms-service.com/v1/send',
                description: 'SMS送信APIのエンドポイント'
            }
        },
        testData: {
            testPhoneNumber: '+819012345678',
            testMessage: '明日10:00にご予約いただいております。お待ちしております。'
        },
        restrictions: {
            maxRequestsPerDay: 100,
            maxRequestsPerHour: 20,
            allowExternalSend: false,
            testModeOnly: true
        }
    }
];
// API接続テスト用の設定
export const apiTestConfig = {
    enableTestMode: true,
    logAllRequests: true,
    mockResponses: {
        line: {
            sendMessage: {
                success: true,
                messageId: 'test_message_123456',
                timestamp: Date.now()
            },
            getUserProfile: {
                userId: 'U123456789abcdef123456789abcdef12',
                displayName: 'テストユーザー',
                pictureUrl: 'https://example.com/avatar.jpg',
                statusMessage: 'Hello!'
            }
        },
        instagram: {
            sendMessage: {
                success: true,
                messageId: 'ig_message_123456',
                timestamp: Date.now()
            },
            getConversations: [
                {
                    id: 'conversation_123456789',
                    participants: ['ig_user_123456789'],
                    messages: [
                        {
                            id: 'message_123',
                            from: 'ig_user_123456789',
                            to: 'salon_account',
                            text: 'テストメッセージです',
                            timestamp: Date.now()
                        }
                    ]
                }
            ]
        },
        google: {
            createEvent: {
                success: true,
                eventId: 'test_event_123456',
                htmlLink: 'https://calendar.google.com/event?eid=test_event_123456'
            }
        },
        stripe: {
            createPaymentIntent: {
                id: 'pi_test_123456',
                status: 'requires_payment_method',
                amount: 5000,
                currency: 'jpy',
                client_secret: 'pi_test_123456_secret_test123'
            }
        },
        email: {
            sendEmail: {
                success: true,
                messageId: 'email_test_123456',
                timestamp: Date.now()
            }
        },
        sms: {
            sendSMS: {
                success: true,
                messageId: 'sms_test_123456',
                cost: 10,
                timestamp: Date.now()
            }
        }
    },
    testEndpoints: {
        line: 'https://api.line.me/v2/bot/info',
        instagram: 'https://graph.instagram.com/me',
        google: 'https://www.googleapis.com/calendar/v3/calendars/primary',
        stripe: 'https://api.stripe.com/v1/account',
        email: 'test-connection',
        sms: 'test-connection'
    }
};
// API制限・セキュリティ設定
export const apiSecurityConfig = {
    defaultRestrictions: {
        maxRequestsPerDay: 1000,
        maxRequestsPerHour: 100,
        allowExternalSend: false,
        testModeOnly: true,
        requireAPIKey: true,
        enableRateLimit: true,
        logLevel: 'info' // 'debug', 'info', 'warn', 'error'
    },
    allowedOrigins: [
        'https://salon-system.com',
        'https://*.salon-system.com',
        'http://localhost:3000',
        'http://localhost:4000'
    ],
    blockedIPs: [],
    encryptCredentials: true,
    credentialRotationDays: 90,
    auditLog: true,
    alertThresholds: {
        failedRequestsPerHour: 50,
        suspiciousPatterns: true,
        unusualUsage: true
    }
};
// 初期設定ウィザード用の推奨設定
export const recommendedAPISetup = {
    essential: ['line-messaging-api', 'google-calendar'],
    recommended: ['smtp-email', 'stripe-payment'],
    optional: ['instagram-basic-display', 'sms-service'],
    setupOrder: [
        'google-calendar', // 最も設定しやすい
        'smtp-email', // 基本的な通知機能
        'line-messaging-api', // 主要なコミュニケーション
        'stripe-payment', // 決済機能
        'instagram-basic-display', // SNS連携
        'sms-service' // 追加の通知手段
    ],
    testSequence: [
        {
            api: 'google-calendar',
            test: 'connection',
            description: 'Googleカレンダーへの接続確認'
        },
        {
            api: 'smtp-email',
            test: 'send-test-email',
            description: 'テストメール送信（実際には送信されません）'
        },
        {
            api: 'line-messaging-api',
            test: 'verify-token',
            description: 'LINEアクセストークンの検証'
        },
        {
            api: 'stripe-payment',
            test: 'verify-keys',
            description: 'Stripeキーの検証'
        }
    ]
};
