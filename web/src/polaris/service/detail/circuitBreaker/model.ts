import { InboundItem, OutboundItem } from './types'
import { getApiRequest, putApiRequest, apiRequest } from '@src/polaris/common/util/apiRequest'

export interface DescribeServiceCircuitBreakerParams {
  namespace: string
  service: string
}
export interface CircuitBreaker {
  namespace: string
  name: string
  ctime: string
  mtime: string
  revision: string
  inbounds: InboundItem[]
  outbounds: OutboundItem[]
  id: string
  version: string
}

export interface DescribeRoutesResult {
  configWithServices: Array<{ circuitBreaker: CircuitBreaker }>
}
export async function describeServiceCircuitBreaker(params: DescribeServiceCircuitBreakerParams) {
  const res = await getApiRequest<DescribeRoutesResult>({
    action: 'naming/v1/service/circuitbreaker',
    data: params,
  })
  return res.configWithServices?.[0]?.circuitBreaker
}

export interface CreateCircuitBreakerParams {
  namespace: string
  service: string
  inbounds: InboundItem[]
  outbounds: OutboundItem[]
  owners: string
  name: string
}
export interface ModifyCircuitBreakerParams {
  id: string
  namespace: string
  service: string
  inbounds: InboundItem[]
  outbounds: OutboundItem[]
}
export async function createServiceCircuitBreaker(params: CreateCircuitBreakerParams[]) {
  const res = await apiRequest<any>({
    action: 'naming/v1/circuitbreakers',
    data: params,
  })
  return res
}
export interface CreateCircuitBreakerVersionParams {
  id: string
  version: string
  namespace: string
  inbounds: InboundItem[]
  outbounds: OutboundItem[]
  name?: string
}
export async function createServiceCircuitBreakerVersion(params: CreateCircuitBreakerVersionParams[]) {
  const res = await apiRequest<any>({
    action: 'naming/v1/circuitbreakers/version',
    data: params,
  })
  return res
}
export async function modifyServiceCircuitBreaker(params: ModifyCircuitBreakerParams[]) {
  const res = await putApiRequest<any>({
    action: 'naming/v1/circuitbreakers',
    data: params,
  })
  return res
}

export interface ReleaseServiceCircuitBreakerParams {
  service: {
    name: string // 服务名；必填；string
    namespace: string // 命名空间；必填；string
    //token: "..."; // 服务token；必填；string
  }
  circuitBreaker: {
    // 要发布的规则必须是已经标记过的
    name: string // 规则name；必填；string
    namespace: string // 规则namespace；必填；string
    version: string // 规则version；必填；string；
  }
}

export async function releaseServiceCircuitBreaker(params: ReleaseServiceCircuitBreakerParams[]) {
  const res = await apiRequest<any>({
    action: 'naming/v1/circuitbreakers/release',
    data: params,
  })
  return res
}

export interface DeleteServiceCircuitBreakerParams {
  service: string // 服务名；必填；string
  service_namespace: string // 命名空间；必填；string
  //token: "..."; // 服务token；必填；string
  id: string // 规则name；必填；string
  name: string // 规则name；必填；string
  namespace: string // 规则namespace；必填；string
  version: string // 规则version；必填；string；
}

export async function deleteServiceCircuitBreaker(params: DeleteServiceCircuitBreakerParams[]) {
  const res = await apiRequest<any>({
    action: 'naming/v1/circuitbreakers/delete',
    data: params,
  })
  return res
}

export interface UnbindServiceCircuitBreakerParams {
  service: {
    name: string // 服务名；必填；string
    namespace: string // 命名空间；必填；string
    //token: "..."; // 服务token；必填；string
  }
  circuitBreaker: {
    id: string // 规则name；必填；string
    name: string // 规则name；必填；string
    namespace: string // 规则namespace；必填；string
    version: string // 规则version；必填；string；
  }
}

export async function unbindServiceCircuitBreaker(params: UnbindServiceCircuitBreakerParams[]) {
  const res = await apiRequest<any>({
    action: 'naming/v1/circuitbreakers/unbind',
    data: params,
  })
  return res
}
