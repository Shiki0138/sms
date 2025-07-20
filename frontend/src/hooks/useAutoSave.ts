import { useEffect, useRef, useCallback } from 'react'

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

interface UseAutoSaveOptions {
  delay?: number // 自動保存の遅延時間（ミリ秒）
  enabled?: boolean // 自動保存の有効/無効
  onSave?: (data: any) => Promise<void> // 保存処理
  onError?: (error: Error) => void // エラー処理
  storageKey?: string // ローカルストレージのキー
}

interface UseAutoSaveReturn {
  save: (data: any) => void // 手動保存
  isAutoSaving: boolean // 自動保存中かどうか
  lastSaved: Date | null // 最後に保存された時刻
  hasUnsavedChanges: boolean // 未保存の変更があるか
}

export const useAutoSave = (
  data: any,
  options: UseAutoSaveOptions = {}
): UseAutoSaveReturn => {
  const {
    delay = 2000,
    enabled = true,
    onSave,
    onError,
    storageKey
  } = options

  const isAutoSavingRef = useRef(false)
  const lastSavedRef = useRef<Date | null>(null)
  const hasUnsavedChangesRef = useRef(false)
  const lastDataRef = useRef<any>(null)

  // デバウンスされた保存処理
  const debouncedSave = useCallback(
    debounce(async (dataToSave: any) => {
      if (!enabled || isAutoSavingRef.current) return

      try {
        isAutoSavingRef.current = true
        
        // ローカルストレージに保存
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify({
            data: dataToSave,
            timestamp: new Date().toISOString(),
            version: '1.0'
          }))
        }

        // サーバーに保存
        if (onSave) {
          await onSave(dataToSave)
        }

        lastSavedRef.current = new Date()
        hasUnsavedChangesRef.current = false
        lastDataRef.current = dataToSave

        console.log('🔄 自動保存完了:', new Date().toLocaleTimeString())
      } catch (error) {
        console.error('自動保存エラー:', error)
        if (onError) {
          onError(error as Error)
        }
      } finally {
        isAutoSavingRef.current = false
      }
    }, delay),
    [delay, enabled, onSave, onError, storageKey]
  )

  // データ変更の監視
  useEffect(() => {
    if (!enabled) return

    // 初回データまたはデータに変更があった場合
    if (lastDataRef.current !== null && 
        JSON.stringify(lastDataRef.current) !== JSON.stringify(data)) {
      hasUnsavedChangesRef.current = true
      debouncedSave(data)
    } else if (lastDataRef.current === null) {
      lastDataRef.current = data
    }
  }, [data, enabled, debouncedSave])

  // ページを離れる前の保存
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChangesRef.current) {
        // ブラウザに警告を表示
        event.preventDefault()
        event.returnValue = '未保存の変更があります。ページを離れますか？'
        
        // 最後の緊急保存
        if (storageKey && data) {
          localStorage.setItem(`${storageKey}_emergency`, JSON.stringify({
            data,
            timestamp: new Date().toISOString(),
            emergency: true
          }))
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [data, storageKey])

  // 手動保存
  const save = useCallback(async (dataToSave: any = data) => {
    try {
      isAutoSavingRef.current = true
      
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify({
          data: dataToSave,
          timestamp: new Date().toISOString(),
          version: '1.0'
        }))
      }

      if (onSave) {
        await onSave(dataToSave)
      }

      lastSavedRef.current = new Date()
      hasUnsavedChangesRef.current = false
      lastDataRef.current = dataToSave

      console.log('💾 手動保存完了:', new Date().toLocaleTimeString())
    } catch (error) {
      console.error('手動保存エラー:', error)
      if (onError) {
        onError(error as Error)
      }
      throw error
    } finally {
      isAutoSavingRef.current = false
    }
  }, [data, onSave, onError, storageKey])

  return {
    save,
    isAutoSaving: isAutoSavingRef.current,
    lastSaved: lastSavedRef.current,
    hasUnsavedChanges: hasUnsavedChangesRef.current
  }
}

// ローカルストレージからデータを復元
export const useRestoreFromStorage = (storageKey: string) => {
  const restoreData = useCallback(() => {
    try {
      // 通常保存データの復元
      const savedData = localStorage.getItem(storageKey)
      if (savedData) {
        const parsed = JSON.parse(savedData)
        return parsed.data
      }

      // 緊急保存データの復元
      const emergencyData = localStorage.getItem(`${storageKey}_emergency`)
      if (emergencyData) {
        const parsed = JSON.parse(emergencyData)
        // 緊急保存データは復元後削除
        localStorage.removeItem(`${storageKey}_emergency`)
        return parsed.data
      }

      return null
    } catch (error) {
      console.error('データ復元エラー:', error)
      return null
    }
  }, [storageKey])

  const clearStoredData = useCallback(() => {
    localStorage.removeItem(storageKey)
    localStorage.removeItem(`${storageKey}_emergency`)
  }, [storageKey])

  return { restoreData, clearStoredData }
}