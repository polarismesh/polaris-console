import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { notification } from 'tea-component'
import tips from './tips'
import router from './router'

export interface APIRequestOption {
  action: string
  data?: any
  opts?: AxiosRequestConfig
}
export interface ApiResponse {
  code: number
  info: string
}
export const SuccessCode = 200000
export const TokenNotExistCode = 401004
export async function apiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts } = options
  try {
    tips.showLoading({})
    const res = (await axios
      .post<T & ApiResponse>(action, data, {
        ...opts,
        headers: {
          'X-Polaris-Token': window.localStorage.getItem('polaris_token'),
          'X-Polaris-User': window.localStorage.getItem('login-user-id')
        },
      })
      .catch(function (error) {
        if (error.response) {
          notification.error({
            title: '请求错误',
            description: error.response?.data?.info,
          })
        }
      })) as AxiosResponse<T & ApiResponse>
    if (res.data.code > 200000) {
      throw res.data.info
    }
    return res.data
  } catch (e) {
    console.error(e)
  } finally {
    tips.hideLoading()
  }
}
export async function getApiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts } = options
  try {
    tips.showLoading({})
    const res = (await axios
      .get<T & ApiResponse>(action, {
        params: data,
        ...opts,
        headers: {
          'X-Polaris-Token': window.localStorage.getItem('polaris_token'),
          'X-Polaris-User': window.localStorage.getItem('login-user-id')
        },
      })
      .catch(function (error) {
        if (error.response.data.code === TokenNotExistCode) {
          notification.error({
            title: 'Token不存在',
            description: '您当前使用的Token不存在，可能已被重置，请重新登录。',
          })
          router.navigate('/login')
        }
        if (error.response) {
          notification.error({
            title: '请求错误',
            description: error.response?.data?.info,
          })
        }
      })) as AxiosResponse<T & ApiResponse>
    if (res.data.code > 200000) {
      throw res.data.info
    }
    return res.data
  } catch (e) {
    notification.error(e)
    console.error(e)
  } finally {
    tips.hideLoading()
  }
}
export async function putApiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts } = options
  try {
    tips.showLoading({})
    const res = (await axios
      .put<T & ApiResponse>(action, data, {
        ...opts,
        headers: {
          'X-Polaris-Token': window.localStorage.getItem('polaris_token'),
          'X-Polaris-User': window.localStorage.getItem('login-user-id')
        },
      })
      .catch(function (error) {
        if (error.response) {
          notification.error({
            title: '请求错误',
            description: error.response?.data?.info,
          })
        }
      })) as AxiosResponse<T & ApiResponse>
    if (res.data.code > 200000) {
      throw res.data.info
    }
    return res.data
  } catch (e) {
    console.error(e)
  } finally {
    tips.hideLoading()
  }
}
export async function deleteApiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts } = options
  try {
    tips.showLoading({})
    const res = (await axios
      .delete<T & ApiResponse>(action, {
        params: data,
        ...opts,
        headers: {
          'X-Polaris-Token': window.localStorage.getItem('polaris_token'),
          'X-Polaris-User': window.localStorage.getItem('login-user-id')
        },
      })
      .catch(function (error) {
        if (error.response) {
          notification.error({
            title: '请求错误',
            description: error.response?.data?.info,
          })
        }
      })) as AxiosResponse<T & ApiResponse>
    if (res.data.code > 200000) {
      throw res.data.info
    }
    return res.data
  } catch (e) {
    notification.error(e)
    console.error(e)
  } finally {
    tips.hideLoading()
  }
}
export interface FetchAllOptions {
  listKey?: string
  totalKey?: string
  limitKey?: string
  offsetKey?: string
}
const DefaultOptions = {
  listKey: 'list',
  totalKey: 'totalCount',
  limitKey: 'limit',
  offsetKey: 'offset',
}
/**
 * 获取所有的列表
 * @param fetchFun 模板函数需要支持pageNo,pageSize参数
 * @param listKey 返回结果中列表的键名称 默认list
 */
export function getAllList(fetchFun: (params?: any) => Promise<any>, options: FetchAllOptions = {}) {
  return async function (params: any) {
    const fetchOptions = { ...DefaultOptions, ...options }
    let allList = [],
      pageNo = 0
    const pageSize = 50
    while (true) {
      // 每次获取获取50条
      params = { ...params }

      const result = await fetchFun({
        ...params,
        [fetchOptions.offsetKey]: pageNo * pageSize,
        [fetchOptions.limitKey]: pageSize,
      } as any)

      allList = allList.concat(result[fetchOptions.listKey])

      if (allList.length >= result[fetchOptions.totalKey]) {
        // 返回
        break
      } else {
        pageNo++
      }
      break
    }
    return {
      list: allList,
      totalCount: allList.length,
    }
  }
}
