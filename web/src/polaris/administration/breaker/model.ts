import { apiRequest, getApiRequest, putApiRequest } from '@src/polaris/common/util/apiRequest'
import { CircuitBreakerRule } from './types'

export interface DescribeCircuitBreakersParams {
  brief: boolean
  offset: number
  limit: number
  id?: string
  name?: string
  enable?: boolean
  level?: number
  service?: string
  serviceNamespace?: string
  srcService?: string
  srcNamespace?: string
  dstService?: string
  dstNamespace?: string
  dstMethod?: string
  description?: string
}
export interface DescribeCircuitBreakersResult {
  data: CircuitBreakerRule[]
  amount: number
  size: number
}
export async function DescribeCircuitBreakers(params: DescribeCircuitBreakersParams) {
  const res = await getApiRequest<DescribeCircuitBreakersResult>({
    action: 'naming/v1/circuitbreaker/rules',
    data: params,
  })
  return {
    list: res.data,
    totalCount: res.amount,
  }
}

export type CreateCircuitBreakerParams = CircuitBreakerRule
export async function createCircuitBreaker(params: CreateCircuitBreakerParams[]) {
  const res = await apiRequest<any>({
    action: 'naming/v1/circuitbreaker/rules',
    data: params,
  })
  return res
}

export async function modifyCircuitBreaker(params: CreateCircuitBreakerParams[]) {
  const res = await putApiRequest<any>({
    action: 'naming/v1/circuitbreaker/rules',
    data: params,
  })
  return res
}
export interface DeleteCircuitBreakerParams {
  id: string
}
export async function deleteCircuitBreaker(params: DeleteCircuitBreakerParams[]) {
  const res = await apiRequest<any>({
    action: 'naming/v1/circuitbreaker/rules/delete',
    data: params,
  })
  return res
}
export interface EnableCircuitBreakerParams {
  id: string
  enable: boolean
}
export async function enableCircuitBreaker(params: EnableCircuitBreakerParams[]) {
  const res = await putApiRequest<any>({
    action: 'naming/v1/circuitbreaker/rules/enable',
    data: params,
  })
  return res
}
