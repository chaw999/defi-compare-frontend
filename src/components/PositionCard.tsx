import { motion } from 'framer-motion'
import type { Position } from '../types'

interface PositionCardProps {
  position: Position
  index?: number
  showDiff?: boolean
  diffType?: 'added' | 'removed' | 'changed'
  compact?: boolean
}

const typeLabels: Record<Position['type'], string> = {
  lending: '借贷',
  borrowing: '借款',
  liquidity: '流动性',
  staking: '质押',
  farming: '挖矿',
  wallet: '钱包',
  other: '其他',
}

const typeColors: Record<Position['type'], string> = {
  lending: '#10b981',
  borrowing: '#f59e0b',
  liquidity: '#3b82f6',
  staking: '#8b5cf6',
  farming: '#ec4899',
  wallet: '#6b7280',
  other: '#6b7280',
}

function PositionCard({ position, index = 0, showDiff, diffType, compact }: PositionCardProps) {
  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return (balance / 1000000).toFixed(2) + 'M'
    } else if (balance >= 1000) {
      return (balance / 1000).toFixed(2) + 'K'
    }
    return balance.toFixed(4)
  }

  return (
    <motion.div
      className={`position-card ${showDiff ? `diff-${diffType}` : ''} ${compact ? 'compact' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
    >
      <div className="position-header">
        <div className="protocol-info">
          {position.protocol.logo ? (
            <img src={position.protocol.logo} alt={position.protocol.name} className="protocol-logo" />
          ) : (
            <div className="protocol-logo-placeholder">
              {position.protocol.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="protocol-details">
            <h4 className="protocol-name">{position.protocol.name}</h4>
            <div className="protocol-meta">
              <span className="chain-tag">{position.protocol.chain}</span>
              <span className="position-type" style={{ backgroundColor: typeColors[position.type] + '20', color: typeColors[position.type] }}>
                {typeLabels[position.type]}
              </span>
            </div>
          </div>
        </div>
        <div className="position-value">
          {formatUSD(position.totalValueUSD)}
        </div>
      </div>

      {!compact && position.tokens.length > 0 && (
        <div className="position-tokens">
          {position.tokens.slice(0, 3).map((tokenData, idx) => (
            <div key={idx} className="token-row">
              <div className="token-info">
                {tokenData.token.logo ? (
                  <img src={tokenData.token.logo} alt={tokenData.token.symbol} className="token-logo" />
                ) : (
                  <div className="token-logo-placeholder">
                    {tokenData.token.symbol.charAt(0)}
                  </div>
                )}
                <span className="token-symbol">{tokenData.token.symbol}</span>
              </div>
              <div className="token-balance">
                <span className="balance-amount">{formatBalance(tokenData.balanceFormatted)}</span>
                <span className="balance-usd">{formatUSD(tokenData.balanceUSD)}</span>
              </div>
            </div>
          ))}
          {position.tokens.length > 3 && (
            <div className="token-more">+{position.tokens.length - 3} 更多</div>
          )}
        </div>
      )}

      {showDiff && diffType && (
        <div className={`diff-badge ${diffType}`}>
          {diffType === 'added' && '+'}
          {diffType === 'removed' && '-'}
          {diffType === 'changed' && '~'}
        </div>
      )}
    </motion.div>
  )
}

export default PositionCard
