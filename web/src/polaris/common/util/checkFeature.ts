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
  try {
    const result = await getApiRequest<CheckFeatureResult>({ action: '/admin/v1/functions', data: {} })
    return result.data
  } catch (e) {
    return []
  }
}

export const cacheCheckFeature = once(checkFeature, ttl(30 * 60 * 1000))

export const checkFeatureKey = (feature: Feature[], key: string) => {
  return feature.find(item => item.name === key)?.display === FeatureDisplayType.visible
}
export async function checkFeatureValid(featureKey) {
  const feature = await cacheCheckFeature()
  if (feature.length === 0) return true
  const check = feature.find(item => item.name === featureKey)
  if (!check) return true
  return check?.display === FeatureDisplayType.visible
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
