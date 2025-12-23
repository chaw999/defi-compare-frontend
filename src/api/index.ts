import axios from 'axios'
import type { DataSourceCompareResult, ApiResponse } from '../types'

/**
 * 根据环境获取 API 基础 URL
 * - 开发环境: 使用 Vite 代理到本地 Worker
 * - 生产环境: 直接调用远端 API
 */
function getBaseURL(): string {
  // Vite 在构建时会替换 import.meta.env
  if (import.meta.env.DEV) {
    // 开发环境使用代理
    return '/api'
  }
  // 生产环境直接调用后端 API
  return 'https://defi-backend.qa.onekey-internal.com/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const message = error.response?.data?.message || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

/**
 * 对比同一地址在不同数据源的数据
 * @param address 钱包地址
 */
export async function compareDataSources(address: string): Promise<ApiResponse<DataSourceCompareResult>> {
  try {
    const response = await api.get<unknown, ApiResponse<DataSourceCompareResult>>(`/compare/sources/${address}`)
    return response
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '对比失败',
    }
  }
}

/**
 * 获取 Zerion 数据
 */
export async function getZerionData(address: string): Promise<ApiResponse<unknown>> {
  try {
    const response = await api.get<unknown, ApiResponse<unknown>>(`/defi/zerion/${address}`)
    return response
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
    }
  }
}

/**
 * 获取 OneKey 数据
 */
export async function getOnekeyData(address: string): Promise<ApiResponse<unknown>> {
  try {
    const response = await api.get<unknown, ApiResponse<unknown>>(`/defi/onekey/${address}`)
    return response
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
    }
  }
}

/**
 * 健康检查
 */
export async function healthCheck(): Promise<ApiResponse<{ status: string }>> {
  try {
    const response = await api.get<unknown, ApiResponse<{ status: string }>>('/health')
    return response
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '健康检查失败',
    }
  }
}

export default api
