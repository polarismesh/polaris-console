import React from 'react'
import { getApiRequest } from './apiRequest'
import { once, ttl } from '../helpers/cacheable'

export type DescribeServerConfigParams = {
  module: string
}
export async function describeServerConfig(params) {
  const res = await getApiRequest<any>({
    action: '/maintain/v1/bootstrap/config',
    data: params,
    noError: true,
  })
  return res
}
export const cacheDescribeServerConfig = once(describeServerConfig, ttl(60 * 5 * 1000))
export function useServerConfig(configKey: string) {
  const [result, setResult] = React.useState({} as any)
  const getServerConfig = React.useCallback(async () => {
    try {
      const res = await cacheDescribeServerConfig({ module: configKey })
      setResult(res)
    } catch (e) {
      setResult({} as any)
    }
  }, [])
  React.useEffect(() => {
    getServerConfig()
  }, [getServerConfig])
  if (!configKey) {
    return result
  }
  return result
}
