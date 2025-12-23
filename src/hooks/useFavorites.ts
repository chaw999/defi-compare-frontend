import { useState, useEffect, useCallback } from 'react'

export interface FavoriteItem {
  address: string
  label?: string
  createdAt: string
}

const STORAGE_KEY = 'defi-onekey-favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])

  // 从 localStorage 加载收藏
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setFavorites(parsed)
        }
      }
    } catch (e) {
      console.error('Failed to load favorites:', e)
    }
  }, [])

  // 保存到 localStorage
  const saveFavorites = useCallback((newFavorites: FavoriteItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites))
    } catch (e) {
      console.error('Failed to save favorites:', e)
    }
  }, [])

  // 检查地址是否已收藏
  const isFavorite = useCallback((address: string) => {
    return favorites.some((f) => f.address.toLowerCase() === address.toLowerCase())
  }, [favorites])

  // 获取收藏项
  const getFavorite = useCallback((address: string) => {
    return favorites.find((f) => f.address.toLowerCase() === address.toLowerCase())
  }, [favorites])

  // 添加收藏
  const addFavorite = useCallback((address: string, label?: string) => {
    const normalizedAddress = address.toLowerCase().trim()
    if (!normalizedAddress) return

    setFavorites((prev) => {
      // 如果已存在，不重复添加
      if (prev.some((f) => f.address.toLowerCase() === normalizedAddress)) {
        return prev
      }

      const newFavorite: FavoriteItem = {
        address: normalizedAddress,
        label,
        createdAt: new Date().toISOString(),
      }

      const newFavorites = [newFavorite, ...prev]
      saveFavorites(newFavorites)
      return newFavorites
    })
  }, [saveFavorites])

  // 移除收藏
  const removeFavorite = useCallback((address: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.filter(
        (f) => f.address.toLowerCase() !== address.toLowerCase()
      )
      saveFavorites(newFavorites)
      return newFavorites
    })
  }, [saveFavorites])

  // 切换收藏状态
  const toggleFavorite = useCallback((address: string) => {
    if (isFavorite(address)) {
      removeFavorite(address)
    } else {
      addFavorite(address)
    }
  }, [isFavorite, addFavorite, removeFavorite])

  // 更新标签
  const updateLabel = useCallback((address: string, label: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.map((f) => {
        if (f.address.toLowerCase() === address.toLowerCase()) {
          return { ...f, label: label.trim() || undefined }
        }
        return f
      })
      saveFavorites(newFavorites)
      return newFavorites
    })
  }, [saveFavorites])

  // 清除所有收藏
  const clearFavorites = useCallback(() => {
    setFavorites([])
    saveFavorites([])
  }, [saveFavorites])

  return {
    favorites,
    isFavorite,
    getFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    updateLabel,
    clearFavorites,
  }
}

