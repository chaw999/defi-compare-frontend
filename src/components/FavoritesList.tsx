import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { FavoriteItem } from '../hooks/useFavorites'

interface FavoritesListProps {
  favorites: FavoriteItem[]
  onSelect: (address: string) => void
  onRemove: (address: string) => void
  onUpdateLabel: (address: string, label: string) => void
  currentAddress?: string
}

function FavoritesList({ favorites, onSelect, onRemove, onUpdateLabel, currentAddress }: FavoritesListProps) {
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')

  const formatAddress = (address: string) => {
    if (address.length <= 16) return address
    return `${address.slice(0, 8)}...${address.slice(-6)}`
  }

  const handleStartEdit = (address: string, currentLabel?: string) => {
    setEditingAddress(address)
    setEditLabel(currentLabel || '')
  }

  const handleSaveLabel = (address: string) => {
    onUpdateLabel(address, editLabel)
    setEditingAddress(null)
    setEditLabel('')
  }

  const handleCancelEdit = () => {
    setEditingAddress(null)
    setEditLabel('')
  }

  return (
    <div className="favorites-list">
      <div className="favorites-header">
        <h3>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L10.163 5.279L15 6.018L11.5 9.373L12.326 14L8 11.779L3.674 14L4.5 9.373L1 6.018L5.837 5.279L8 1Z" 
              fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          收藏列表
        </h3>
        <span className="favorites-count">{favorites.length}</span>
      </div>

      <div className="favorites-items">
        <AnimatePresence mode="popLayout">
          {favorites.length === 0 ? (
            <motion.div
              className="favorites-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p>点击 ⭐ 收藏地址</p>
            </motion.div>
          ) : (
            favorites.map((item, index) => (
              <motion.div
                key={item.address}
                className={`favorite-item ${currentAddress === item.address ? 'active' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.03 }}
              >
                {editingAddress === item.address ? (
                  <div className="favorite-edit">
                    <input
                      type="text"
                      className="label-input"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      placeholder="输入标签名称"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveLabel(item.address)
                        if (e.key === 'Escape') handleCancelEdit()
                      }}
                    />
                    <div className="edit-actions">
                      <button className="edit-save" onClick={() => handleSaveLabel(item.address)}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button className="edit-cancel" onClick={handleCancelEdit}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="favorite-content" onClick={() => onSelect(item.address)}>
                      <span className="favorite-star">⭐</span>
                      <div className="favorite-info">
                        {item.label && (
                          <span className="favorite-label">{item.label}</span>
                        )}
                        <span className="favorite-address" title={item.address}>
                          {formatAddress(item.address)}
                        </span>
                      </div>
                    </div>
                    <div className="favorite-actions">
                      <button
                        className="action-btn edit"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartEdit(item.address, item.label)
                        }}
                        title="编辑标签"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M8.5 1.5L10.5 3.5M1 11L1.5 8.5L9 1L11 3L3.5 10.5L1 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        className="action-btn remove"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemove(item.address)
                        }}
                        title="取消收藏"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default FavoritesList

