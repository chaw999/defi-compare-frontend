import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { compareDataSources } from '../api'
import type { DataSourceCompareResult, AddressDefiData, Position, PositionDiff } from '../types'
import PositionCard from './PositionCard'
import AddressHistory from './AddressHistory'
import FavoritesList from './FavoritesList'
import ChainFilter from './ChainFilter'
import { useAddressHistory } from '../hooks/useAddressHistory'
import { useFavorites } from '../hooks/useFavorites'

function DataSourceCompare() {
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DataSourceCompareResult | null>(null)
  const [currentSearchAddress, setCurrentSearchAddress] = useState<string | undefined>()
  const [selectedChain, setSelectedChain] = useState<string | null>(null)

  const { history, addAddress, removeAddress, clearHistory } = useAddressHistory()
  const { favorites, isFavorite, toggleFavorite, removeFavorite, updateLabel } = useFavorites()

  const handleCompare = useCallback(async (searchAddress?: string) => {
    const targetAddress = searchAddress || address.trim()
    
    if (!targetAddress) {
      setError('请输入有效的钱包地址')
      return
    }

    setLoading(true)
    setError(null)
    setCurrentSearchAddress(targetAddress)
    setSelectedChain(null) // 重置链筛选

    // 添加到历史记录
    addAddress(targetAddress)

    const response = await compareDataSources(targetAddress)

    setLoading(false)

    if (response.success && response.data) {
      setResult(response.data)
    } else {
      setError(response.error || '对比失败')
      setResult(null)
    }
  }, [address, addAddress])

  const handleSelectHistory = useCallback((historyAddress: string) => {
    setAddress(historyAddress)
    handleCompare(historyAddress)
  }, [handleCompare])

  const handleSelectFavorite = useCallback((favoriteAddress: string) => {
    setAddress(favoriteAddress)
    handleCompare(favoriteAddress)
  }, [handleCompare])

  // 获取所有可用的链（合并两个数据源的链）
  const availableChains = useMemo(() => {
    if (!result) return []
    const chainsA = result.addressA.chains || []
    const chainsB = result.addressB.chains || []
    return [...new Set([...chainsA, ...chainsB])].sort()
  }, [result])

  // 计算每条链的持仓数量
  const chainPositionCounts = useMemo(() => {
    if (!result) return {}
    const counts: Record<string, number> = {}
    
    const allPositions = [...result.addressA.positions, ...result.addressB.positions]
    allPositions.forEach(pos => {
      const chain = pos.protocol.chain
      counts[chain] = (counts[chain] || 0) + 1
    })
    
    return counts
  }, [result])

  // 过滤后的数据
  const filteredResult = useMemo(() => {
    if (!result) return null
    if (!selectedChain) return result

    const filterPositions = (positions: Position[]) => 
      positions.filter(p => p.protocol.chain === selectedChain)

    const filterDiffs = (diffs: PositionDiff[]) =>
      diffs.filter(d => d.chain === selectedChain)

    const filteredPositionsA = filterPositions(result.addressA.positions)
    const filteredPositionsB = filterPositions(result.addressB.positions)
    const filteredDiffs = filterDiffs(result.positionDiffs)

    // 重新计算过滤后的总价值
    const totalValueA = filteredPositionsA.reduce((sum, p) => sum + p.totalValueUSD, 0)
    const totalValueB = filteredPositionsB.reduce((sum, p) => sum + p.totalValueUSD, 0)

    // 重新计算摘要
    const totalValueDiffUSD = totalValueB - totalValueA
    const totalValueDiffPercent = totalValueA > 0 ? (totalValueDiffUSD / totalValueA) * 100 : 0

    return {
      ...result,
      addressA: {
        ...result.addressA,
        positions: filteredPositionsA,
        totalValueUSD: totalValueA,
        chains: [selectedChain],
      },
      addressB: {
        ...result.addressB,
        positions: filteredPositionsB,
        totalValueUSD: totalValueB,
        chains: [selectedChain],
      },
      summary: {
        ...result.summary,
        totalValueDiffUSD,
        totalValueDiffPercent,
        positionsOnlyInA: filteredDiffs.filter(d => d.diffType === 'removed').length,
        positionsOnlyInB: filteredDiffs.filter(d => d.diffType === 'added').length,
        changedPositions: filteredDiffs.filter(d => d.diffType === 'changed').length,
      },
      positionDiffs: filteredDiffs,
    }
  }, [result, selectedChain])

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatDiffValue = (value: number) => {
    const prefix = value >= 0 ? '+' : ''
    return prefix + formatUSD(value)
  }

  const formatPercent = (value: number) => {
    const prefix = value >= 0 ? '+' : ''
    return prefix + value.toFixed(2) + '%'
  }

  // 获取位置的差异状态
  const getPositionDiffType = (position: Position, diffs: PositionDiff[], source: 'A' | 'B') => {
    const diff = diffs.find(d => {
      const p = source === 'A' ? d.positionA : d.positionB
      return p?.id === position.id
    })
    return diff?.diffType
  }

  // 当前地址是否已收藏
  const isCurrentFavorite = currentSearchAddress ? isFavorite(currentSearchAddress) : false

  return (
    <div className="page-with-sidebar">
      {/* 左侧边栏 */}
      <aside className="sidebar">
        {/* 收藏列表 */}
        <FavoritesList
          favorites={favorites}
          onSelect={handleSelectFavorite}
          onRemove={removeFavorite}
          onUpdateLabel={updateLabel}
          currentAddress={currentSearchAddress}
        />
        
        {/* 历史记录 */}
        <AddressHistory
          history={history}
          onSelect={handleSelectHistory}
          onRemove={removeAddress}
          onClear={clearHistory}
          onToggleFavorite={toggleFavorite}
          isFavorite={isFavorite}
          currentAddress={currentSearchAddress}
        />
      </aside>

      {/* 主内容区 */}
      <div className="page-main">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Zerion VS OneKey 数据对比工具</h1>
          <p>验证同一地址在 Zerion 和 OneKey 数据源的 DeFi 数据差异</p>
        </motion.div>

        <motion.div
          className="search-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="search-box large">
            <input
              type="text"
              className="search-input"
              placeholder="输入钱包地址 (0x...)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
            />
            <button
              className="search-button"
              onClick={() => handleCompare()}
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner" />
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 7H16M4 13H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="7" cy="7" r="2" fill="currentColor" />
                    <circle cx="13" cy="13" r="2" fill="currentColor" />
                  </svg>
                  对比数据源
                </>
              )}
            </button>
            {/* 收藏按钮 */}
            {currentSearchAddress && (
              <button
                className={`favorite-toggle ${isCurrentFavorite ? 'active' : ''}`}
                onClick={() => toggleFavorite(currentSearchAddress)}
                title={isCurrentFavorite ? '取消收藏' : '收藏当前地址'}
              >
                {isCurrentFavorite ? '⭐' : '☆'}
              </button>
            )}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {filteredResult && (
            <motion.div
              className="compare-results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
            >
              {/* 链筛选器 */}
              {availableChains.length > 0 && (
                <ChainFilter
                  chains={availableChains}
                  selectedChain={selectedChain}
                  onSelect={setSelectedChain}
                  positionCounts={chainPositionCounts}
                />
              )}

              {/* 摘要统计 */}
              <div className="compare-summary-bar">
                <div className="summary-item">
                  <span className="label">差异金额</span>
                  <span className={`value ${filteredResult.summary.totalValueDiffUSD >= 0 ? 'positive' : 'negative'}`}>
                    {formatDiffValue(filteredResult.summary.totalValueDiffUSD)}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">差异比例</span>
                  <span className={`value ${filteredResult.summary.totalValueDiffPercent >= 0 ? 'positive' : 'negative'}`}>
                    {formatPercent(filteredResult.summary.totalValueDiffPercent)}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">仅在源 A</span>
                  <span className="value warning">{filteredResult.summary.positionsOnlyInA}</span>
                </div>
                <div className="summary-item">
                  <span className="label">仅在源 B</span>
                  <span className="value warning">{filteredResult.summary.positionsOnlyInB}</span>
                </div>
                <div className="summary-item">
                  <span className="label">有变化</span>
                  <span className="value info">{filteredResult.summary.changedPositions}</span>
                </div>
              </div>

              {/* 左右对比布局 */}
              <div className="side-by-side-compare">
                {/* 左侧：数据源 A (Zerion) */}
                <SourcePanel
                  data={filteredResult.addressA}
                  diffs={filteredResult.positionDiffs}
                  side="A"
                  formatUSD={formatUSD}
                  getPositionDiffType={getPositionDiffType}
                />

                {/* 中间分隔线 */}
                <div className="compare-divider">
                  <div className="divider-line" />
                  <div className="divider-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M7 16L3 12L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M17 8L21 12L17 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="divider-line" />
                </div>

                {/* 右侧：数据源 B (OneKey) */}
                <SourcePanel
                  data={filteredResult.addressB}
                  diffs={filteredResult.positionDiffs}
                  side="B"
                  formatUSD={formatUSD}
                  getPositionDiffType={getPositionDiffType}
                />
              </div>

              {/* 差异详情 */}
              {filteredResult.positionDiffs.length > 0 && (
                <DiffDetails diffs={filteredResult.positionDiffs} formatUSD={formatUSD} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!result && !error && !loading && (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="empty-icon">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <rect x="8" y="20" width="28" height="44" rx="4" stroke="currentColor" strokeWidth="2" />
                <rect x="44" y="20" width="28" height="44" rx="4" stroke="currentColor" strokeWidth="2" />
                <path d="M36 36H44M36 44H44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 4" />
                <text x="22" y="38" fontSize="10" fill="currentColor" textAnchor="middle">A</text>
                <text x="58" y="38" fontSize="10" fill="currentColor" textAnchor="middle">B</text>
              </svg>
            </div>
            <h3>数据源对比验证</h3>
            <p>输入钱包地址，对比 Zerion 和 OneKey 数据源的差异</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// 单侧数据源面板
interface SourcePanelProps {
  data: AddressDefiData
  diffs: PositionDiff[]
  side: 'A' | 'B'
  formatUSD: (value: number) => string
  getPositionDiffType: (position: Position, diffs: PositionDiff[], source: 'A' | 'B') => string | undefined
}

function SourcePanel({ data, diffs, side, formatUSD, getPositionDiffType }: SourcePanelProps) {
  const sourceLabel = side === 'A' ? 'Zerion' : 'OneKey'
  const sourceColor = side === 'A' ? 'var(--color-zerion)' : 'var(--color-onekey)'

  return (
    <div className="source-panel">
      <div className="source-header" style={{ borderColor: sourceColor }}>
        <div className="source-badge" style={{ background: sourceColor }}>
          {sourceLabel}
        </div>
        <div className="source-info">
          <span className="source-label">数据源 {side}</span>
          <span className="source-name">{data.source}</span>
        </div>
        <div className="source-total">
          <span className="label">总价值</span>
          <span className="value">{formatUSD(data.totalValueUSD)}</span>
        </div>
      </div>

      <div className="source-meta">
        <div className="meta-item">
          <span className="label">持仓数</span>
          <span className="value">{data.positions.length}</span>
        </div>
        <div className="meta-item">
          <span className="label">活跃链</span>
          <span className="value">{data.chains.length > 0 ? data.chains.join(', ') : '-'}</span>
        </div>
        <div className="meta-item">
          <span className="label">更新时间</span>
          <span className="value">{new Date(data.lastUpdated).toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="source-positions">
        {data.positions.length === 0 ? (
          <div className="no-positions">
            <p>暂无持仓数据</p>
          </div>
        ) : (
          data.positions.map((position, index) => {
            const diffType = getPositionDiffType(position, diffs, side)
            return (
              <PositionCard
                key={position.id}
                position={position}
                index={index}
                showDiff={!!diffType && diffType !== 'unchanged'}
                diffType={diffType as 'added' | 'removed' | 'changed' | undefined}
                compact
              />
            )
          })
        )}
      </div>
    </div>
  )
}

// 差异详情面板
interface DiffDetailsProps {
  diffs: PositionDiff[]
  formatUSD: (value: number) => string
}

function DiffDetails({ diffs, formatUSD }: DiffDetailsProps) {
  const added = diffs.filter(d => d.diffType === 'added')
  const removed = diffs.filter(d => d.diffType === 'removed')
  const changed = diffs.filter(d => d.diffType === 'changed')

  if (added.length === 0 && removed.length === 0 && changed.length === 0) {
    return null
  }

  return (
    <div className="diff-details-section">
      <h3 className="section-title">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 3V17M3 10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        差异详情
      </h3>

      <div className="diff-table">
        <div className="diff-table-header">
          <div className="col-protocol">协议</div>
          <div className="col-chain">链</div>
          <div className="col-type">类型</div>
          <div className="col-status">状态</div>
          <div className="col-diff">差异</div>
        </div>

        {[...added, ...removed, ...changed].map((diff, index) => (
          <div key={index} className={`diff-table-row ${diff.diffType}`}>
            <div className="col-protocol">{diff.protocol}</div>
            <div className="col-chain">
              <span className="chain-badge">{diff.chain}</span>
            </div>
            <div className="col-type">{diff.type}</div>
            <div className="col-status">
              <span className={`status-badge ${diff.diffType}`}>
                {diff.diffType === 'added' && '仅在 B'}
                {diff.diffType === 'removed' && '仅在 A'}
                {diff.diffType === 'changed' && '数值变化'}
              </span>
            </div>
            <div className="col-diff">
              {diff.valueDiffUSD !== undefined && (
                <span className={diff.valueDiffUSD >= 0 ? 'positive' : 'negative'}>
                  {diff.valueDiffUSD >= 0 ? '+' : ''}{formatUSD(diff.valueDiffUSD)}
                  {diff.valueDiffPercent !== undefined && (
                    <small> ({diff.valueDiffPercent >= 0 ? '+' : ''}{diff.valueDiffPercent.toFixed(2)}%)</small>
                  )}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DataSourceCompare
