import { motion } from 'framer-motion'

// 链的显示名称和颜色
const CHAIN_CONFIG: Record<string, { name: string; color: string }> = {
  ethereum: { name: 'Ethereum', color: '#627eea' },
  polygon: { name: 'Polygon', color: '#8247e5' },
  arbitrum: { name: 'Arbitrum', color: '#28a0f0' },
  optimism: { name: 'Optimism', color: '#ff0420' },
  'binance-smart-chain': { name: 'BSC', color: '#f3ba2f' },
  bsc: { name: 'BSC', color: '#f3ba2f' },
  avalanche: { name: 'Avalanche', color: '#e84142' },
  base: { name: 'Base', color: '#0052ff' },
  'zksync-era': { name: 'zkSync', color: '#8c8dfc' },
  linea: { name: 'Linea', color: '#61dfff' },
  scroll: { name: 'Scroll', color: '#ffeeda' },
  fantom: { name: 'Fantom', color: '#1969ff' },
}

interface ChainFilterProps {
  chains: string[]
  selectedChain: string | null
  onSelect: (chain: string | null) => void
  positionCounts?: Record<string, number>
}

function ChainFilter({ chains, selectedChain, onSelect, positionCounts }: ChainFilterProps) {
  const getChainConfig = (chainId: string) => {
    return CHAIN_CONFIG[chainId.toLowerCase()] || { name: chainId, color: '#6b7280' }
  }

  const allCount = positionCounts 
    ? Object.values(positionCounts).reduce((sum, count) => sum + count, 0) 
    : 0

  return (
    <div className="chain-filter">
      <div className="chain-filter-label">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        链筛选
      </div>
      <div className="chain-filter-list">
        {/* 全部网络选项 */}
        <motion.button
          className={`chain-filter-item ${selectedChain === null ? 'active' : ''}`}
          onClick={() => onSelect(null)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="chain-dot" style={{ background: 'linear-gradient(135deg, #627eea, #8247e5, #28a0f0)' }} />
          <span className="chain-name">全部网络</span>
          {positionCounts && <span className="chain-count">{allCount}</span>}
        </motion.button>

        {/* 各个链选项 */}
        {chains.map((chain) => {
          const config = getChainConfig(chain)
          const count = positionCounts?.[chain] || 0
          
          return (
            <motion.button
              key={chain}
              className={`chain-filter-item ${selectedChain === chain ? 'active' : ''}`}
              onClick={() => onSelect(chain)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="chain-dot" style={{ background: config.color }} />
              <span className="chain-name">{config.name}</span>
              {positionCounts && <span className="chain-count">{count}</span>}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default ChainFilter

