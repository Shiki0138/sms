/**
 * 📊 Googleスプレッドシート連携サービス
 * デモモードフィードバック・統計データの管理
 */

import { GoogleAuth } from 'google-auth-library'
import { sheets_v4, google } from 'googleapis'
import { logger } from '../utils/logger'

interface FeedbackRow {
  timestamp: string
  session_id: string
  title: string
  category: string
  page: string
  description: string
  user_agent: string
  ip_address: string
  status: string
}

interface DemoSessionRow {
  session_id: string
  start_date: string
  expiry_date: string
  ip_address: string
  user_agent: string
  status: string
}

export class GoogleSheetsService {
  private sheets: sheets_v4.Sheets | null = null
  private spreadsheetId: string
  private isInitialized = false

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID || ''
    this.initializeAuth()
  }

  private async initializeAuth() {
    try {
      if (!process.env.GOOGLE_SHEETS_CREDENTIALS) {
        logger.warn('Google Sheets credentials not configured, feedback will be logged only')
        return
      }

      const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS)
      
      const auth = new GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      })

      this.sheets = google.sheets({ version: 'v4', auth })
      this.isInitialized = true

      // スプレッドシートの初期化
      await this.initializeSpreadsheet()

      logger.info('Google Sheets service initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize Google Sheets:', error)
      this.isInitialized = false
    }
  }

  private async initializeSpreadsheet() {
    if (!this.sheets || !this.spreadsheetId) return

    try {
      // フィードバックシートの初期化
      await this.ensureSheetExists('Feedback', [
        'Timestamp',
        'Session ID',
        'Title', 
        'Category',
        'Page',
        'Description',
        'User Agent',
        'IP Address',
        'Status'
      ])

      // セッション管理シートの初期化
      await this.ensureSheetExists('Demo_Sessions', [
        'Session ID',
        'Start Date',
        'Expiry Date',
        'IP Address',
        'User Agent',
        'Status',
        'Created At'
      ])

    } catch (error) {
      logger.error('Failed to initialize spreadsheet:', error)
    }
  }

  private async ensureSheetExists(sheetName: string, headers: string[]) {
    if (!this.sheets || !this.spreadsheetId) return

    try {
      // シートの存在確認
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      })

      const existingSheet = response.data.sheets?.find(
        sheet => sheet.properties?.title === sheetName
      )

      if (!existingSheet) {
        // シートを作成
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: sheetName
                }
              }
            }]
          }
        })

        logger.info(`Created sheet: ${sheetName}`)
      }

      // ヘッダーを設定
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headers]
        }
      })

    } catch (error) {
      logger.error(`Failed to ensure sheet exists: ${sheetName}`, error)
    }
  }

  /**
   * フィードバックデータをスプレッドシートに追加
   */
  async appendFeedback(feedback: FeedbackRow): Promise<void> {
    if (!this.isInitialized) {
      // Googleスプレッドシートが利用できない場合はログに出力
      logger.info('Demo feedback (logged only):', feedback)
      return
    }

    try {
      if (!this.sheets || !this.spreadsheetId) {
        throw new Error('Google Sheets not properly initialized')
      }

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Feedback!A:I',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            feedback.timestamp,
            feedback.session_id,
            feedback.title,
            feedback.category,
            feedback.page,
            feedback.description,
            feedback.user_agent,
            feedback.ip_address,
            feedback.status
          ]]
        }
      })

      logger.info('Feedback added to Google Sheets', {
        sessionId: feedback.session_id,
        category: feedback.category
      })

    } catch (error) {
      logger.error('Failed to append feedback to Google Sheets:', error)
      // フォールバック: ローカルログに記録
      logger.info('Demo feedback (fallback):', feedback)
    }
  }

  /**
   * デモセッション情報をスプレッドシートに追加
   */
  async appendDemoSession(session: DemoSessionRow): Promise<void> {
    if (!this.isInitialized) {
      logger.info('Demo session (logged only):', session)
      return
    }

    try {
      if (!this.sheets || !this.spreadsheetId) {
        throw new Error('Google Sheets not properly initialized')
      }

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Demo_Sessions!A:G',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            session.session_id,
            session.start_date,
            session.expiry_date,
            session.ip_address,
            session.user_agent,
            session.status,
            new Date().toISOString()
          ]]
        }
      })

      logger.info('Demo session added to Google Sheets', {
        sessionId: session.session_id
      })

    } catch (error) {
      logger.error('Failed to append demo session to Google Sheets:', error)
      logger.info('Demo session (fallback):', session)
    }
  }

  /**
   * デモセッション情報を取得
   */
  async getDemoSession(sessionId: string): Promise<DemoSessionRow | null> {
    if (!this.isInitialized || !this.sheets || !this.spreadsheetId) {
      return null
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Demo_Sessions!A:G'
      })

      const rows = response.data.values
      if (!rows || rows.length <= 1) return null

      // ヘッダーを除いてセッションを検索
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (row[0] === sessionId) {
          return {
            session_id: row[0],
            start_date: row[1],
            expiry_date: row[2],
            ip_address: row[3],
            user_agent: row[4],
            status: row[5]
          }
        }
      }

      return null

    } catch (error) {
      logger.error('Failed to get demo session from Google Sheets:', error)
      return null
    }
  }

  /**
   * デモセッションのステータスを更新
   */
  async updateDemoSessionStatus(sessionId: string, status: string): Promise<void> {
    if (!this.isInitialized || !this.sheets || !this.spreadsheetId) {
      logger.info(`Demo session status update (logged only): ${sessionId} -> ${status}`)
      return
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Demo_Sessions!A:G'
      })

      const rows = response.data.values
      if (!rows || rows.length <= 1) return

      // セッションを見つけて更新
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (row[0] === sessionId) {
          await this.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: `Demo_Sessions!F${i + 1}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [[status]]
            }
          })
          
          logger.info('Demo session status updated', {
            sessionId,
            status
          })
          return
        }
      }

    } catch (error) {
      logger.error('Failed to update demo session status:', error)
    }
  }

  /**
   * デモ統計情報を取得
   */
  async getDemoStats(): Promise<any> {
    if (!this.isInitialized || !this.sheets || !this.spreadsheetId) {
      return {
        totalSessions: 0,
        activeSessions: 0,
        totalFeedback: 0,
        feedbackByCategory: {}
      }
    }

    try {
      // セッション統計
      const sessionsResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Demo_Sessions!A:G'
      })

      // フィードバック統計
      const feedbackResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Feedback!A:I'
      })

      const sessionRows = sessionsResponse.data.values || []
      const feedbackRows = feedbackResponse.data.values || []

      const totalSessions = Math.max(0, sessionRows.length - 1) // ヘッダーを除く
      const activeSessions = sessionRows.slice(1).filter(row => row[5] === 'active').length
      const totalFeedback = Math.max(0, feedbackRows.length - 1)

      // カテゴリー別フィードバック
      const feedbackByCategory: Record<string, number> = {}
      feedbackRows.slice(1).forEach(row => {
        const category = row[3] || 'other'
        feedbackByCategory[category] = (feedbackByCategory[category] || 0) + 1
      })

      return {
        totalSessions,
        activeSessions,
        totalFeedback,
        feedbackByCategory,
        lastUpdated: new Date().toISOString()
      }

    } catch (error) {
      logger.error('Failed to get demo stats:', error)
      return {
        totalSessions: 0,
        activeSessions: 0,
        totalFeedback: 0,
        feedbackByCategory: {},
        error: 'Failed to fetch stats'
      }
    }
  }

  /**
   * 期限切れセッションの一括処理
   */
  async getExpiredSessions(): Promise<string[]> {
    if (!this.isInitialized || !this.sheets || !this.spreadsheetId) {
      return []
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Demo_Sessions!A:G'
      })

      const rows = response.data.values
      if (!rows || rows.length <= 1) return []

      const now = new Date()
      const expiredSessions: string[] = []

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        const sessionId = row[0]
        const expiryDate = new Date(row[2])
        const status = row[5]

        if (status === 'active' && now > expiryDate) {
          expiredSessions.push(sessionId)
        }
      }

      return expiredSessions

    } catch (error) {
      logger.error('Failed to get expired sessions:', error)
      return []
    }
  }
}