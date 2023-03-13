import { once, ttl } from '../helpers/cacheable'
import { getApiRequest } from './apiRequest'
import React from 'react'

export enum FeatureDisplayType {
  visible = 'visible',
  block = 'block',
  hidden = 'hidden',
}
export interface CheckFeatureResult {
  data: Feature[]
}
export interface Feature {
  name: string
  display: string
  tip: string
}
/** 检查策略是否已开启 */
export async function checkFeature() {
  const result = await getApiRequest<CheckFeatureResult>({ action: '/functions', data: {} })
  return result.data
}

export const cacheCheckFeature = once(checkFeature, ttl(30 * 60 * 1000))

export const checkFeatureKey = (feature: Feature[], key: string) => {
  return feature.find(item => item.name === key)?.display === FeatureDisplayType.visible
}
export function useCheckFeatureValid(features: string[] = []) {
  const [result, setResult] = React.useState([] as Feature[])
  const getValidity = React.useCallback(async () => {
    try {
      const res = await cacheCheckFeature()
      setResult(res)
    } catch (e) {
      setResult({} as any)
    }
  }, [])
  React.useEffect(() => {
    getValidity()
  }, [getValidity])
  if (!features.length) {
    return result
  }
  return features.map(item => result.find?.(feature => feature.name === item))
}
