import { format, parse } from 'date-fns'
import { ja } from 'date-fns/locale'

export interface ParsedReservation {
  customerName: string
  startTime: Date
  menuContent: string
  phone?: string
  email?: string
  notes?: string
  source: 'HOTPEPPER'
  status: 'CONFIRMED'
}

// ホットペッパービューティー予約確認メールのパターン
const HOTPEPPER_PATTERNS = {
  // 件名パターン
  subject: /予約確認|ご予約を承りました|予約完了/i,
  
  // 顧客名抽出パターン
  customerName: [
    /お客様名[：:\s]*([^\r\n]+)/,
    /ご予約者[：:\s]*([^\r\n]+)/,
    /氏名[：:\s]*([^\r\n]+)/,
    /お名前[：:\s]*([^\r\n]+)/
  ],
  
  // 日時抽出パターン
  datetime: [
    /予約日時[：:\s]*([^\r\n]+)/,
    /ご予約日時[：:\s]*([^\r\n]+)/,
    /日時[：:\s]*([^\r\n]+)/,
    /(\d{4})[年\/\-](\d{1,2})[月\/\-](\d{1,2})[日\s]*[（\(]?[月火水木金土日][）\)]?\s*(\d{1,2})[：:](\d{2})/
  ],
  
  // メニュー抽出パターン
  menu: [
    /メニュー[：:\s]*([^\r\n]+)/,
    /ご利用メニュー[：:\s]*([^\r\n]+)/,
    /施術内容[：:\s]*([^\r\n]+)/,
    /コース[：:\s]*([^\r\n]+)/
  ],
  
  // 電話番号抽出パターン
  phone: [
    /電話番号[：:\s]*([0-9\-\(\)\s]+)/,
    /お電話番号[：:\s]*([0-9\-\(\)\s]+)/,
    /TEL[：:\s]*([0-9\-\(\)\s]+)/i
  ],
  
  // メールアドレス抽出パターン
  email: [
    /メールアドレス[：:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
    /Email[：:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
  ]
}

/**
 * ホットペッパービューティーの予約確認メールかどうかを判定
 */
export function isHotpepperReservationEmail(subject: string, body: string): boolean {
  // 件名でチェック
  if (HOTPEPPER_PATTERNS.subject.test(subject)) return true
  
  // 本文にホットペッパー関連のキーワードがあるかチェック
  const hotpepperKeywords = [
    'ホットペッパービューティー',
    'Hot Pepper Beauty',
    'hotpepper.jp',
    'リクルート',
    'サロンボード'
  ]
  
  return hotpepperKeywords.some(keyword => 
    body.toLowerCase().includes(keyword.toLowerCase())
  )
}

/**
 * テキストから指定されたパターンで値を抽出
 */
function extractValue(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  return null
}

/**
 * 日時文字列をDateオブジェクトに変換
 */
function parseDateTime(dateTimeStr: string): Date | null {
  if (!dateTimeStr) return null
  
  // 一般的な日時フォーマット
  const formats = [
    'yyyy年M月d日 H時m分',
    'yyyy年M月d日(E) H:mm',
    'yyyy/MM/dd H:mm',
    'yyyy-MM-dd H:mm',
    'M月d日(E) H:mm',
    'M/d H:mm'
  ]
  
  // 現在の年を取得（年が省略されている場合の補完用）
  const currentYear = new Date().getFullYear()
  
  for (const formatPattern of formats) {
    try {
      let processedStr = dateTimeStr
      
      // 年が省略されている場合は現在の年を補完
      if (!processedStr.includes(currentYear.toString())) {
        if (processedStr.match(/^\d{1,2}[月\/]/)) {
          processedStr = `${currentYear}年${processedStr}`
        }
      }
      
      // 曜日を除去
      processedStr = processedStr.replace(/[（\(][月火水木金土日][）\)]/g, '')
      
      const parsed = parse(processedStr, formatPattern, new Date())
      if (!isNaN(parsed.getTime())) {
        return parsed
      }
    } catch (error) {
      continue
    }
  }
  
  // 正規表現での抽出も試行
  const dateRegex = /(\d{4})[年\/\-](\d{1,2})[月\/\-](\d{1,2})[日\s]*.*?(\d{1,2})[：:](\d{2})/
  const match = dateTimeStr.match(dateRegex)
  if (match) {
    const [, year, month, day, hour, minute] = match
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute)
    )
  }
  
  return null
}

/**
 * メール本文から予約情報を抽出
 */
export function parseReservationEmail(
  subject: string,
  body: string,
  senderEmail?: string
): ParsedReservation | null {
  try {
    // ホットペッパーの予約確認メールかチェック
    if (!isHotpepperReservationEmail(subject, body)) {
      return null
    }
    
    // 改行を統一
    const normalizedBody = body.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    
    // 各フィールドを抽出
    const customerName = extractValue(normalizedBody, HOTPEPPER_PATTERNS.customerName)
    const dateTimeStr = extractValue(normalizedBody, HOTPEPPER_PATTERNS.datetime)
    const menuContent = extractValue(normalizedBody, HOTPEPPER_PATTERNS.menu)
    const phone = extractValue(normalizedBody, HOTPEPPER_PATTERNS.phone)
    const email = extractValue(normalizedBody, HOTPEPPER_PATTERNS.email) || senderEmail
    
    // 必須項目のチェック
    if (!customerName) {
      throw new Error('顧客名が見つかりません')
    }
    
    if (!dateTimeStr) {
      throw new Error('予約日時が見つかりません')
    }
    
    const startTime = parseDateTime(dateTimeStr)
    if (!startTime) {
      throw new Error(`日時の解析に失敗しました: ${dateTimeStr}`)
    }
    
    return {
      customerName: customerName,
      startTime: startTime,
      menuContent: menuContent || 'メニュー詳細なし',
      phone: phone?.replace(/[^\d\-]/g, '') || undefined,
      email: email || undefined,
      notes: `メール自動取り込み\n送信者: ${senderEmail || '不明'}`,
      source: 'HOTPEPPER',
      status: 'CONFIRMED'
    }
    
  } catch (error) {
    console.error('Email parsing error:', error)
    return null
  }
}

/**
 * 複数のメール形式に対応したパーサー
 */
export function parseMultipleEmailFormats(emails: {
  subject: string
  body: string
  senderEmail?: string
  receivedAt?: Date
}[]): ParsedReservation[] {
  const results: ParsedReservation[] = []
  
  for (const email of emails) {
    try {
      const parsed = parseReservationEmail(email.subject, email.body, email.senderEmail)
      if (parsed) {
        results.push(parsed)
      }
    } catch (error) {
      console.error(`Failed to parse email: ${email.subject}`, error)
    }
  }
  
  return results
}

/**
 * サンプルメール解析（テスト用）
 */
export function parseHotpepperSampleEmail(): ParsedReservation {
  const sampleEmail = `
件名: 【ホットペッパービューティー】ご予約を承りました

美容室サンプル様

いつもホットペッパービューティーをご利用いただき、ありがとうございます。
下記の通りご予約を承りました。

■ご予約内容
お客様名：山田 太郎
予約日時：2024年6月10日(月) 14:00
メニュー：カット + カラー
電話番号：090-1234-5678
メールアドレス：yamada@example.com

■ご来店時のお願い
・ご予約時間の5分前にお越しください
・マスクの着用をお願いいたします

何かご不明な点がございましたら、お気軽にお問い合わせください。
  `
  
  const parsed = parseReservationEmail(
    '【ホットペッパービューティー】ご予約を承りました',
    sampleEmail,
    'noreply@hotpepper.jp'
  )
  
  if (!parsed) {
    throw new Error('サンプルメールの解析に失敗しました')
  }
  
  return parsed
}