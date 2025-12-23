import axios from 'axios'
import type { DataSourceCompareResult, ApiResponse } from '../types'

const api = axios.create({
  baseURL: '/api',
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

export default api
