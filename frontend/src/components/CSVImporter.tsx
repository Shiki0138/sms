import React, { useState, useRef } from 'react'
import { Upload, FileText, Download, CheckCircle, AlertCircle, Users, X } from 'lucide-react'

interface CSVImporterProps {
  onImport: (customers: any[]) => void
  onClose: () => void
  isOpen: boolean
  existingCustomers?: any[] // 既存顧客データ
}

interface ImportedCustomer {
  name: string
  phone: string
  email: string
  visitCount: number
  lastVisitDate: string
  notes: string
  source: 'HOTPEPPER' | 'MANUAL'
  hotpepperData?: {
    memberNumber?: string
    birthDate?: string
    gender?: string
    address?: string
    registrationDate?: string
  }
}

const CSVImporter: React.FC<CSVImporterProps> = ({ onImport, onClose, isOpen, existingCustomers = [] }) => {
  const [csvData, setCsvData] = useState<string>('')
  const [previewData, setPreviewData] = useState<ImportedCustomer[]>([])
  const [duplicateData, setDuplicateData] = useState<ImportedCustomer[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ホットペッパービューティーのCSVフォーマット例
  const hotpepperColumns = [
    '会員番号', '氏名', '氏名（フリガナ）', '電話番号', 'メールアドレス',
    '生年月日', '性別', '郵便番号', '住所', '来店回数', '最終来店日',
    '登録日', '備考', 'クーポン利用履歴', 'メニュー履歴'
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setErrors(['CSVファイルを選択してください'])
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setCsvData(text)
      processCSV(text)
    }
    reader.readAsText(file, 'Shift_JIS') // ホットペッパーはShift_JISが一般的
  }

  const processCSV = (csvText: string) => {
    setIsProcessing(true)
    setErrors([])

    try {
      const lines = csvText.split('\n').filter(line => line.trim())
      if (lines.length < 2) {
        throw new Error('CSVファイルにデータが含まれていません')
      }

      const headers = parseCSVLine(lines[0])
      const customers: ImportedCustomer[] = []
      const duplicates: ImportedCustomer[] = []
      const newErrors: string[] = []

      // ヘッダーの検証
      const requiredColumns = ['氏名', '電話番号']
      const missingColumns = requiredColumns.filter(col => !headers.includes(col))
      if (missingColumns.length > 0) {
        throw new Error(`必須列が見つかりません: ${missingColumns.join(', ')}`)
      }

      // 重複チェック用の関数
      const isDuplicate = (customer: ImportedCustomer): boolean => {
        // 電話番号での重複チェック
        if (customer.phone) {
          const normalizedPhone = customer.phone.replace(/[-\s]/g, '')
          const phoneExists = existingCustomers.some(existing => {
            const existingPhone = existing.phone?.replace(/[-\s]/g, '') || ''
            return existingPhone === normalizedPhone
          })
          if (phoneExists) return true
        }

        // メールアドレスでの重複チェック
        if (customer.email) {
          const emailExists = existingCustomers.some(existing => 
            existing.email?.toLowerCase() === customer.email.toLowerCase()
          )
          if (emailExists) return true
        }

        // ホットペッパー会員番号での重複チェック
        if (customer.hotpepperData?.memberNumber) {
          const memberExists = existingCustomers.some(existing => 
            existing.memberNumber === customer.hotpepperData?.memberNumber
          )
          if (memberExists) return true
        }

        return false
      }

      // データ行の処理
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = parseCSVLine(lines[i])
          if (values.length < headers.length) continue

          const customer = parseCustomerRow(headers, values, i + 1)
          if (customer) {
            if (isDuplicate(customer)) {
              duplicates.push(customer)
              newErrors.push(`${i + 1}行目: 既存顧客と重複しています (${customer.name})`)
            } else {
              customers.push(customer)
            }
          }
        } catch (error) {
          newErrors.push(`${i + 1}行目: ${error instanceof Error ? error.message : 'データエラー'}`)
        }
      }

      if (customers.length === 0 && duplicates.length === 0) {
        throw new Error('有効な顧客データが見つかりませんでした')
      }

      setPreviewData(customers)
      setDuplicateData(duplicates)
      setErrors(newErrors)
      setStep('preview')
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'CSVの処理中にエラーが発生しました'])
    } finally {
      setIsProcessing(false)
    }
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result.map(val => val.replace(/^"|"$/g, ''))
  }

  const parseCustomerRow = (headers: string[], values: string[], rowNumber: number): ImportedCustomer | null => {
    const getColumnValue = (columnName: string): string => {
      const index = headers.indexOf(columnName)
      return index >= 0 ? values[index]?.trim() || '' : ''
    }

    const name = getColumnValue('氏名')
    if (!name) {
      throw new Error('氏名が入力されていません')
    }

    const phone = getColumnValue('電話番号').replace(/[-\s]/g, '')
    const email = getColumnValue('メールアドレス')
    const visitCountStr = getColumnValue('来店回数')
    const lastVisitDate = getColumnValue('最終来店日')
    const birthDate = getColumnValue('生年月日')
    const gender = getColumnValue('性別')
    const address = getColumnValue('住所')
    const registrationDate = getColumnValue('登録日')
    const memberNumber = getColumnValue('会員番号')
    const notes = getColumnValue('備考')

    // 来店回数の処理
    let visitCount = 0
    if (visitCountStr) {
      const parsed = parseInt(visitCountStr)
      if (!isNaN(parsed)) {
        visitCount = Math.max(0, parsed)
      }
    }

    // 日付の正規化
    const normalizeDate = (dateStr: string): string => {
      if (!dateStr) return ''
      
      // 様々な日付フォーマットに対応
      const dateFormats = [
        /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/,  // YYYY/MM/DD, YYYY-MM-DD
        /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/,  // MM/DD/YYYY
        /(\d{4})(\d{2})(\d{2})/,              // YYYYMMDD
      ]

      for (const format of dateFormats) {
        const match = dateStr.match(format)
        if (match) {
          if (match[1].length === 4) {
            // YYYY-MM-DD形式
            return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
          } else {
            // MM/DD/YYYY形式
            return `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
          }
        }
      }
      
      return dateStr
    }

    return {
      name,
      phone,
      email,
      visitCount,
      lastVisitDate: normalizeDate(lastVisitDate),
      notes: notes || `ホットペッパービューティーからのインポート顧客`,
      source: 'HOTPEPPER',
      hotpepperData: {
        memberNumber,
        birthDate: normalizeDate(birthDate),
        gender,
        address,
        registrationDate: normalizeDate(registrationDate)
      }
    }
  }

  const handleImport = () => {
    onImport(previewData)
    setStep('complete')
    setTimeout(() => {
      onClose()
      resetState()
    }, 2000)
  }

  const resetState = () => {
    setCsvData('')
    setPreviewData([])
    setDuplicateData([])
    setErrors([])
    setStep('upload')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadTemplate = () => {
    const template = `会員番号,氏名,氏名（フリガナ）,電話番号,メールアドレス,生年月日,性別,郵便番号,住所,来店回数,最終来店日,登録日,備考
HP001,山田 花子,ヤマダ ハナコ,090-1234-5678,hanako@example.com,1985/04/15,女性,123-4567,東京都新宿区1-2-3,5,2024/06/01,2023/08/15,カラー希望
HP002,佐藤 太郎,サトウ タロウ,080-9876-5432,taro@example.com,1990/07/20,男性,567-8901,東京都渋谷区4-5-6,3,2024/05/20,2024/01/10,短髪希望`

    const blob = new Blob([template], { type: 'text/csv;charset=shift_jis' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hotpepper_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                ホットペッパービューティー顧客データインポート
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {step === 'upload' && (
              <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-3">📋 インポート手順</h3>
                  <ol className="text-sm text-blue-800 space-y-2">
                    <li>1. ホットペッパービューティー管理画面から顧客データをCSVでダウンロード</li>
                    <li>2. 下記の「CSVテンプレートをダウンロード」で形式を確認</li>
                    <li>3. CSVファイルを選択してアップロード</li>
                    <li>4. プレビューを確認してインポート実行</li>
                  </ol>
                </div>

                {/* Template Download */}
                <div className="flex justify-center">
                  <button
                    onClick={downloadTemplate}
                    className="btn btn-secondary flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSVテンプレートをダウンロード
                  </button>
                </div>

                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      CSVファイルをアップロード
                    </h3>
                    <p className="text-gray-600 mb-4">
                      ホットペッパービューティーからダウンロードしたCSVファイルを選択してください
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-primary"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'ファイルを選択'}
                    </button>
                  </div>
                </div>

                {/* Supported Columns */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">対応可能な列項目</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {hotpepperColumns.map((col) => (
                      <div key={col} className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          ['氏名', '電話番号'].includes(col) ? 'bg-red-500' : 'bg-green-500'
                        }`}></span>
                        <span className={['氏名', '電話番号'].includes(col) ? 'font-medium' : ''}>
                          {col}
                          {['氏名', '電話番号'].includes(col) && ' (必須)'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Errors */}
                {errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800 mb-2">エラーが発生しました</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          {errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 'preview' && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <h4 className="font-medium text-green-800">
                          {previewData.length}件の新規顧客データを検出しました
                        </h4>
                        <p className="text-sm text-green-700 mt-1">
                          これらのデータがインポートされます
                        </p>
                      </div>
                    </div>
                  </div>

                  {duplicateData.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                        <div>
                          <h4 className="font-medium text-yellow-800">
                            {duplicateData.length}件の重複データを検出しました
                          </h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            既存顧客と重複するため、これらのデータはスキップされます
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.length > duplicateData.length && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                        <div>
                          <h4 className="font-medium text-red-800">
                            {errors.length - duplicateData.length}件のエラーが発生しました
                          </h4>
                          <p className="text-sm text-red-700 mt-1">
                            データ形式の問題によりこれらの行はスキップされます
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Table - New Customers */}
                {previewData.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">インポート対象データ ({previewData.length}件)</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">氏名</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">電話番号</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">メール</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">来店回数</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">最終来店日</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">会員番号</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {previewData.slice(0, 10).map((customer, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{customer.phone}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{customer.email}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{customer.visitCount}回</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{customer.lastVisitDate}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{customer.hotpepperData?.memberNumber}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {previewData.length > 10 && (
                        <p className="text-sm text-gray-600 mt-2 text-center">
                          ...他 {previewData.length - 10}件
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Duplicate Table */}
                {duplicateData.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">重複データ ({duplicateData.length}件)</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200 bg-yellow-50">
                        <thead className="bg-yellow-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-yellow-800 uppercase">氏名</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-yellow-800 uppercase">電話番号</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-yellow-800 uppercase">メール</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-yellow-800 uppercase">会員番号</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-yellow-800 uppercase">重複理由</th>
                          </tr>
                        </thead>
                        <tbody className="bg-yellow-50 divide-y divide-yellow-200">
                          {duplicateData.slice(0, 5).map((customer, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm font-medium text-yellow-900">{customer.name}</td>
                              <td className="px-4 py-3 text-sm text-yellow-800">{customer.phone}</td>
                              <td className="px-4 py-3 text-sm text-yellow-800">{customer.email}</td>
                              <td className="px-4 py-3 text-sm text-yellow-800">{customer.hotpepperData?.memberNumber}</td>
                              <td className="px-4 py-3 text-sm text-yellow-800">
                                {customer.phone && existingCustomers.some(e => e.phone?.replace(/[-\s]/g, '') === customer.phone.replace(/[-\s]/g, '')) && '電話番号'}
                                {customer.email && existingCustomers.some(e => e.email?.toLowerCase() === customer.email.toLowerCase()) && 'メール'}
                                {customer.hotpepperData?.memberNumber && existingCustomers.some(e => e.memberNumber === customer.hotpepperData?.memberNumber) && '会員番号'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {duplicateData.length > 5 && (
                        <p className="text-sm text-yellow-600 mt-2 text-center">
                          ...他 {duplicateData.length - 5}件
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Errors */}
                {errors.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800 mb-2">スキップされた行</h4>
                        <div className="text-sm text-yellow-700 max-h-32 overflow-y-auto">
                          {errors.slice(0, 5).map((error, index) => (
                            <div key={index}>• {error}</div>
                          ))}
                          {errors.length > 5 && (
                            <div>...他 {errors.length - 5}件</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep('upload')}
                    className="btn btn-secondary"
                  >
                    戻る
                  </button>
                  <button
                    onClick={handleImport}
                    className="btn btn-primary flex items-center"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {previewData.length}件をインポート
                  </button>
                </div>
              </div>
            )}

            {step === 'complete' && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  インポート完了！
                </h3>
                <p className="text-gray-600">
                  {previewData.length}件の顧客データが正常にインポートされました
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CSVImporter