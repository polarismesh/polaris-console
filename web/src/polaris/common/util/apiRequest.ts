import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { notification } from 'tea-component'
import tips from './tips'
import { userLogout } from './common'
import insertCSS from '../helpers/insertCSS'

insertCSS(
  `request-notification`,
  `
  .tea-notification-wrap{
    z-index: 9999;
  }
`,
)

export interface APIRequestOption {
  action: string
  data?: any
  opts?: AxiosRequestConfig
  noError?: boolean
  silence?: boolean
}
export interface ApiResponse {
  code: number
  info: string
}
export const SuccessCode = 299999
export const TokenNotExistCode = 407
const handleTokenNotExist = () => {
  userLogout()
}
export async function apiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts, noError = false, silence = false } = options
  try {
    if (!silence) {
      tips.showLoading({})
    }
    const res = (await axios
      .post<T & ApiResponse>(action, data, {
        ...opts,
        headers: {
          'X-Polaris-Token': window.localStorage.getItem('polaris_token'),
          'X-Polaris-User': window.localStorage.getItem('login-user-id'),
          ...(opts?.headers ?? {}),
        },
      })
      .catch(function(error) {
        if (error.response.status === TokenNotExistCode) {
          handleTokenNotExist()
          return
        }
        if (error.response) {
          if (error.response?.data?.code === TokenNotExistCode) {
            handleTokenNotExist()
            return
          }
          notification.error({
            unique: true,
            title: '请求错误',
            description: error.response?.data?.info,
          })
        }
      })) as AxiosResponse<T & ApiResponse>

    if (res?.data.code > 299999 && !noError) {
      throw res?.data.info
    }
    return res?.data
  } catch (e) {
    console.error(e)
  } finally {
    if (!silence) {
      tips.hideLoading()
    }
  }
}
export async function getApiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts, noError = false, silence = false } = options
  try {
    if (!silence) {
      tips.showLoading({})
    }
    const res = (await axios
      .get<T & ApiResponse>(action, {
        params: data,
        ...opts,
        headers: {
          'X-Polaris-Token': window.localStorage.getItem('polaris_token'),
          'X-Polaris-User': window.localStorage.getItem('login-user-id'),
        },
      })
      .catch(function(error) {
        if (error.response.status === TokenNotExistCode) {
          handleTokenNotExist()
          return
        }
        if (error.response) {
          if (error.response?.data?.code === TokenNotExistCode) {
            handleTokenNotExist()
            return
          }
          notification.error({
            unique: true,
            title: '请求错误',
            description: error.response?.data?.info,
          })
        }
      })) as AxiosResponse<T & ApiResponse>
    if (res?.data.code > 299999 && !noError) {
      throw res?.data.info
    }
    return res?.data
  } catch (e) {
    console.error(e)
  } finally {
    if (!silence) {
      tips.hideLoading()
    }
  }
}
export async function putApiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts, noError = false, silence = false } = options
  try {
    if (!silence) {
      tips.showLoading({})
    }
    const res = (await axios
      .put<T & ApiResponse>(action, data, {
        ...opts,
        headers: {
          'X-Polaris-Token': window.localStorage.getItem('polaris_token'),
          'X-Polaris-User': window.localStorage.getItem('login-user-id'),
        },
      })
      .catch(function(error) {
        if (error.response.status === TokenNotExistCode) {
          handleTokenNotExist()
          return
        }
        if (error.response) {
          if (error.response?.data?.code === TokenNotExistCode) {
            handleTokenNotExist()
            return
          }
          notification.error({
            unique: true,
            title: '请求错误',
            description: error.response?.data?.info,
          })
        }
      })) as AxiosResponse<T & ApiResponse>
    if (res?.data.code > 299999 && !noError) {
      throw res?.data.info
    }
    return res?.data
  } catch (e) {
    console.error(e)
  } finally {
    if (!silence) {
      tips.hideLoading()
    }
  }
}
export async function deleteApiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts, noError = false, silence = false } = options
  try {
    if (!silence) {
      tips.showLoading({})
    }
    const res = (await axios
      .delete<T & ApiResponse>(action, {
        params: data,
        ...opts,
        headers: {
          'X-Polaris-Token': window.localStorage.getItem('polaris_token'),
          'X-Polaris-User': window.localStorage.getItem('login-user-id'),
        },
      })
      .catch(function(error) {
        if (error.response.status === TokenNotExistCode) {
          handleTokenNotExist()
          return
        }
        if (error.response) {
          if (error.response?.data?.code === TokenNotExistCode) {
            handleTokenNotExist()
            return
          }
          notification.error({
            unique: true,
            title: '请求错误',
            description: error.response?.data?.info,
          })
        }
      })) as AxiosResponse<T & ApiResponse>
    if (res?.data.code > 299999 && !noError) {
      throw res?.data.info
    }
    return res?.data
  } catch (e) {
    console.error(e)
  } finally {
    if (!silence) {
      tips.hideLoading()
    }
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
  return async function(params: any) {
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
    }
    return {
      list: allList,
      totalCount: allList.length,
    }
  }
}
