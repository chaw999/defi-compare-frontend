// DeFi 协议类型
export interface Protocol {
  id: string
  name: string
  logo?: string
  chain: string
  url?: string
}

// 代币信息
export interface Token {
  symbol: string
  name: string
  address: string
  decimals: number
  price?: number
  logo?: string
}

// 代币余额
export interface TokenBalance {
  token: Token
  balance: string
  balanceFormatted: number
  balanceUSD: number
}

// 持仓类型
export type PositionType = 'lending' | 'borrowing' | 'liquidity' | 'staking' | 'farming' | 'wallet' | 'other'

// 单个持仓
export interface Position {
  id: string
  protocol: Protocol
  type: PositionType
  tokens: TokenBalance[]
  totalValueUSD: number
  apy?: number
  healthFactor?: number
  metadata?: Record<string, unknown>
}

// 地址 DeFi 数据
export interface AddressDefiData {
  address: string
  totalValueUSD: number
  positions: Position[]
  chains: string[]
  lastUpdated: string
  source: string
}

// 差异类型
export type DiffType = 'added' | 'removed' | 'changed' | 'unchanged'

// 持仓差异
export interface PositionDiff {
  protocol: string
  chain: string
  type: PositionType
  diffType: DiffType
  positionA?: Position
  positionB?: Position
  valueDiffUSD?: number
  valueDiffPercent?: number
}

// 对比摘要
export interface CompareSummary {
  totalValueDiffUSD: number
  totalValueDiffPercent: number
  positionsOnlyInA: number
  positionsOnlyInB: number
  commonPositions: number
  changedPositions: number
}

// 数据源对比结果
export interface DataSourceCompareResult {
  addressA: AddressDefiData  // 数据源 A（如 Zerion）
  addressB: AddressDefiData  // 数据源 B（如 OneKey）
  summary: CompareSummary
  positionDiffs: PositionDiff[]
}

// API 响应
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
}
