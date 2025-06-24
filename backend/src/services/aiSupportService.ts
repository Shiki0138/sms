import OpenAI from 'openai'
import prisma from '../lib/prisma'

// OpenAI クライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// システムプロンプト
const SYSTEM_PROMPT = `あなたは美容室管理システムの専門的なサポートアシスタントです。
以下の点に注意して回答してください：

1. 常に丁寧で親切な日本語で回答する
2. 美容室の業務に関する専門知識を活用する
3. システムの操作方法を分かりやすく説明する
4. 具体的な手順を番号付きリストで提示する
5. 技術的な用語は避け、分かりやすい言葉を使う

主な機能：
- 顧客管理（CRM）
- 予約管理
- スタッフ管理
- メニュー管理
- 売上分析
- メッセージ機能（LINE/Instagram連携）
- 在庫管理
- シフト管理

回答は簡潔に、要点を押さえて行ってください。`

// ナレッジベース（よくある質問と回答）
const KNOWLEDGE_BASE = [
  {
    category: '予約管理',
    questions: [
      {
        q: '予約を登録するには？',
        a: '1. サイドメニューから「予約管理」をクリック\n2. 「新規予約」ボタンをクリック\n3. お客様情報、日時、メニューを選択\n4. 「予約を確定」ボタンをクリック',
      },
      {
        q: '予約を変更・キャンセルするには？',
        a: '1. 予約管理画面で該当の予約をクリック\n2. 「編集」または「キャンセル」ボタンをクリック\n3. 必要な変更を行い「保存」をクリック',
      },
      {
        q: '繰り返し予約を設定するには？',
        a: '1. 新規予約作成時に「繰り返し設定」をオン\n2. 頻度（毎週/毎月）を選択\n3. 終了日を設定\n4. 「予約を確定」をクリック',
      },
      {
        q: '予約確認メールを送るには？',
        a: '予約登録時に自動で確認メールが送信されます。手動で送る場合は、予約詳細画面から「確認メール送信」をクリックしてください。',
      },
    ],
  },
  {
    category: '顧客管理',
    questions: [
      {
        q: '新規顧客を登録するには？',
        a: '1. サイドメニューから「顧客管理」をクリック\n2. 「新規顧客登録」ボタンをクリック\n3. お名前、連絡先、誕生日などを入力\n4. 「登録」ボタンをクリック',
      },
      {
        q: '顧客の来店履歴を確認するには？',
        a: '1. 顧客管理画面で該当のお客様を検索\n2. お客様の名前をクリック\n3. 「来店履歴」タブをクリック',
      },
      {
        q: '顧客情報を編集するには？',
        a: '1. 顧客管理画面で該当のお客様を検索\n2. お客様の名前をクリック\n3. 「編集」ボタンをクリック\n4. 必要な情報を変更して「保存」',
      },
      {
        q: '顧客にタグを付けるには？',
        a: '1. 顧客詳細画面を開く\n2. 「タグ」セクションで「+」ボタンをクリック\n3. タグを選択または新規作成\n4. 「保存」をクリック',
      },
    ],
  },
  {
    category: 'メッセージ機能',
    questions: [
      {
        q: 'お客様にメッセージを送るには？',
        a: '1. 顧客管理画面で該当のお客様を選択\n2. 「メッセージ送信」ボタンをクリック\n3. メッセージを入力\n4. 「送信」をクリック',
      },
      {
        q: 'LINE連携を設定するには？',
        a: '1. 設定メニューから「外部連携」を選択\n2. 「LINE設定」タブをクリック\n3. LINE Business IDを入力\n4. 認証手続きを完了',
      },
      {
        q: '一括メッセージを送るには？',
        a: '1. メッセージメニューから「一括送信」を選択\n2. 送信対象を選択（タグやフィルタで絞り込み）\n3. メッセージ内容を作成\n4. 「送信」をクリック',
      },
    ],
  },
  {
    category: 'スタッフ管理',
    questions: [
      {
        q: 'スタッフのシフトを設定するには？',
        a: '1. サイドメニューから「シフト管理」をクリック\n2. カレンダー上で設定したい日付をクリック\n3. スタッフと勤務時間を選択\n4. 「シフトを保存」をクリック',
      },
      {
        q: 'スタッフの権限を変更するには？',
        a: '1. 設定メニューから「スタッフ管理」を選択\n2. 該当スタッフの「編集」をクリック\n3. 役割（管理者/マネージャー/スタッフ）を選択\n4. 「保存」をクリック',
      },
      {
        q: 'スタッフの売上を確認するには？',
        a: '1. 分析メニューから「スタッフ別売上」を選択\n2. 期間とスタッフを選択\n3. グラフと詳細データが表示されます',
      },
    ],
  },
  {
    category: '売上・分析',
    questions: [
      {
        q: '日別の売上を確認するには？',
        a: '1. ダッシュボードを開く\n2. 「売上推移」グラフを確認\n3. 詳細は「分析」メニューから「売上分析」を選択',
      },
      {
        q: '人気メニューを確認するには？',
        a: '1. 分析メニューから「メニュー分析」を選択\n2. 期間を指定\n3. 予約数・売上順でランキング表示',
      },
      {
        q: 'レポートをエクスポートするには？',
        a: '1. 各分析画面の右上「エクスポート」ボタンをクリック\n2. 形式（CSV/Excel/PDF）を選択\n3. 「ダウンロード」をクリック',
      },
    ],
  },
  {
    category: '設定・その他',
    questions: [
      {
        q: '営業時間を変更するには？',
        a: '1. 設定メニューから「基本設定」を選択\n2. 「営業時間」タブをクリック\n3. 曜日ごとの営業時間を設定\n4. 「保存」をクリック',
      },
      {
        q: '定休日を設定するには？',
        a: '1. 設定メニューから「基本設定」を選択\n2. 「定休日・祝日」タブをクリック\n3. 定休日を選択または特定日を追加\n4. 「保存」をクリック',
      },
      {
        q: 'パスワードを変更するには？',
        a: '1. 右上のプロフィールアイコンをクリック\n2. 「アカウント設定」を選択\n3. 「パスワード変更」をクリック\n4. 新しいパスワードを入力して「変更」',
      },
      {
        q: 'データをバックアップするには？',
        a: '1. 設定メニューから「データ管理」を選択\n2. 「バックアップ」タブをクリック\n3. 「今すぐバックアップ」をクリック\n4. 完了後、ダウンロードリンクが表示',
      },
    ],
  },
]

interface GenerateResponseParams {
  message: string
  sessionId: string
  userId?: string
  userRole?: string
}

interface AIResponse {
  content: string
  suggestions: string[]
  model: string
  tokensUsed: number
}

export const aiSupportService = {
  // AIレスポンス生成
  async generateResponse(params: GenerateResponseParams): Promise<AIResponse> {
    const { message, sessionId, userId, userRole } = params
    
    try {
      // 会話履歴を取得（直近10件）
      const recentHistory = await prisma.aIChatHistory.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })
      
      // メッセージ履歴を構築
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: SYSTEM_PROMPT },
      ]
      
      // 過去の会話を追加（古い順）
      recentHistory.reverse().forEach(history => {
        messages.push({ role: 'user', content: history.userMessage })
        messages.push({ role: 'assistant', content: history.aiResponse })
      })
      
      // 現在のメッセージを追加
      messages.push({ role: 'user', content: message })
      
      // ナレッジベースから関連する情報を検索
      const relevantInfo = this.searchKnowledgeBase(message)
      if (relevantInfo) {
        messages.push({
          role: 'system',
          content: `参考情報: ${relevantInfo}`,
        })
      }
      
      // OpenAI APIを呼び出し
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      })
      
      const responseContent = completion.choices[0]?.message?.content || 'お答えできません。'
      
      // 関連する提案を生成
      const suggestions = this.generateSuggestions(message, responseContent)
      
      return {
        content: responseContent,
        suggestions,
        model: 'gpt-3.5-turbo',
        tokensUsed: completion.usage?.total_tokens || 0,
      }
    } catch (error) {
      console.error('OpenAI API Error:', error)
      
      // エラー時はナレッジベースから回答を試みる
      const fallbackResponse = this.getFallbackResponse(message)
      return {
        content: fallbackResponse,
        suggestions: ['予約管理について', '顧客管理について', 'よくある質問を見る'],
        model: 'fallback',
        tokensUsed: 0,
      }
    }
  },

  // ナレッジベースを検索
  searchKnowledgeBase(message: string): string | null {
    const lowerMessage = message.toLowerCase()
    
    for (const category of KNOWLEDGE_BASE) {
      for (const qa of category.questions) {
        if (
          qa.q.includes(message) ||
          lowerMessage.includes(qa.q.toLowerCase()) ||
          this.calculateSimilarity(message, qa.q) > 0.6
        ) {
          return qa.a
        }
      }
    }
    
    return null
  },

  // 文字列の類似度を計算（簡易版）
  calculateSimilarity(str1: string, str2: string): number {
    const set1 = new Set(str1.split(''))
    const set2 = new Set(str2.split(''))
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    return intersection.size / union.size
  },

  // フォールバック応答
  getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('予約')) {
      return '予約に関するお問い合わせですね。予約管理画面から新規予約の登録、変更、キャンセルが可能です。詳しい操作方法をお知りになりたい場合は、具体的にお聞きください。'
    } else if (lowerMessage.includes('顧客') || lowerMessage.includes('お客')) {
      return '顧客管理に関するお問い合わせですね。顧客管理画面では、お客様情報の登録・編集、来店履歴の確認、メモの追加などが可能です。'
    } else if (lowerMessage.includes('売上') || lowerMessage.includes('分析')) {
      return '売上分析に関するお問い合わせですね。ダッシュボードから日別・月別の売上推移、人気メニュー、スタッフ別売上などを確認できます。'
    } else {
      return '申し訳ございません。お問い合わせ内容を理解できませんでした。もう少し詳しく教えていただけますか？\n\n例えば：\n- 「予約を登録したい」\n- 「顧客情報を編集したい」\n- 「売上を確認したい」\nなど、具体的にお聞きください。'
    }
  },

  // 提案を生成
  generateSuggestions(message: string, response: string): string[] {
    const suggestions = new Set<string>()
    
    // メッセージに基づいた提案
    if (message.includes('予約')) {
      suggestions.add('予約の変更方法')
      suggestions.add('予約確認メールの設定')
      suggestions.add('繰り返し予約の登録')
    } else if (message.includes('顧客')) {
      suggestions.add('顧客の検索方法')
      suggestions.add('顧客へのメッセージ送信')
      suggestions.add('顧客分析の見方')
    } else if (message.includes('スタッフ')) {
      suggestions.add('スタッフの権限設定')
      suggestions.add('スタッフの売上確認')
      suggestions.add('シフト管理の使い方')
    }
    
    // デフォルトの提案
    suggestions.add('よくある質問')
    suggestions.add('操作マニュアル')
    
    return Array.from(suggestions).slice(0, 3)
  },

  // よくある質問を取得
  async getFrequentlyAskedQuestions() {
    const faqs = []
    
    for (const category of KNOWLEDGE_BASE) {
      faqs.push({
        category: category.category,
        questions: category.questions.map(qa => ({
          question: qa.q,
          answer: qa.a,
        })),
      })
    }
    
    return faqs
  },
}