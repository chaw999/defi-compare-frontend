import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'defi-onekey-address-history'
const MAX_HISTORY = 50

export function useAddressHistory() {
  const [history, setHistory] = useState<string[]>([])

  // 从 localStorage 加载历史记录
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setHistory(parsed)
        }
      }
    } catch (e) {
      console.error('Failed to load address history:', e)
    }
  }, [])

  // 保存到 localStorage
  const saveHistory = useCallback((newHistory: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
    } catch (e) {
      console.error('Failed to save address history:', e)
    }
  }, [])

  // 添加地址到历史记录
  const addAddress = useCallback((address: string) => {
    const normalizedAddress = address.toLowerCase().trim()
    if (!normalizedAddress) return

    setHistory((prev) => {
      // 检查地址是否已存在
      const exists = prev.some((a) => a.toLowerCase() === normalizedAddress)
      
      // 如果已存在，不改变顺序
      if (exists) {
        return prev
      }
      
      // 只有新地址才添加到最前面
      const newHistory = [normalizedAddress, ...prev].slice(0, MAX_HISTORY)
      saveHistory(newHistory)
      return newHistory
    })
  }, [saveHistory])

  // 移除单个地址
  const removeAddress = useCallback((address: string) => {
    setHistory((prev) => {
      const newHistory = prev.filter((a) => a.toLowerCase() !== address.toLowerCase())
      saveHistory(newHistory)
      return newHistory
    })
  }, [saveHistory])

  // 清除所有历史记录
  const clearHistory = useCallback(() => {
    setHistory([])
    saveHistory([])
  }, [saveHistory])

  return {
    history,
    addAddress,
    removeAddress,
    clearHistory,
  }
}

