import { motion, AnimatePresence } from 'framer-motion'

interface AddressHistoryProps {
  history: string[]
  onSelect: (address: string) => void
  onRemove: (address: string) => void
  onClear: () => void
  onToggleFavorite?: (address: string) => void
  isFavorite?: (address: string) => boolean
  currentAddress?: string
}

function AddressHistory({ 
  history, 
  onSelect, 
  onRemove, 
  onClear, 
  onToggleFavorite,
  isFavorite,
  currentAddress 
}: AddressHistoryProps) {
  const formatAddress = (address: string) => {
    if (address.length <= 16) return address
    return `${address.slice(0, 8)}...${address.slice(-6)}`
  }

  return (
    <div className="address-history">
      <div className="history-header">
        <h3>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4.5V8L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          历史记录
        </h3>
        {history.length > 0 && (
          <button className="clear-btn" onClick={onClear} title="清除所有">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 4H12M5 4V3C5 2.44772 5.44772 2 6 2H8C8.55228 2 9 2.44772 9 3V4M10.5 4V11C10.5 11.5523 10.0523 12 9.5 12H4.5C3.94772 12 3.5 11.5523 3.5 11V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      <div className="history-list">
        <AnimatePresence mode="popLayout">
          {history.length === 0 ? (
            <motion.div
              className="history-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p>暂无搜索历史</p>
            </motion.div>
          ) : (
            history.map((address, index) => {
              const favorited = isFavorite?.(address)
              return (
                <motion.div
                  key={address}
                  className={`history-item ${currentAddress === address ? 'active' : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => onSelect(address)}
                >
                  <div className="item-content">
                    <span className="item-index">{index + 1}</span>
                    <span className="item-address" title={address}>
                      {formatAddress(address)}
                    </span>
                  </div>
                  <div className="item-actions">
                    {onToggleFavorite && (
                      <button
                        className={`item-favorite ${favorited ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleFavorite(address)
                        }}
                        title={favorited ? '取消收藏' : '收藏'}
                      >
                        {favorited ? '⭐' : '☆'}
                      </button>
                    )}
                    <button
                      className="item-remove"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemove(address)
                      }}
                      title="移除"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AddressHistory
