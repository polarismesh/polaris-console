import { apiRequest, getApiRequest, putApiRequest } from '@src/polaris/common/util/apiRequest'

export interface CustomRoute {
  id?: string
  name: string // 规则名
  enable: boolean // 是否启用
  priority: number
  description: string
  routing_config: RoutingConfig
  ctime: string
  mtime: string
  etime: string
  routing_policy: string
}

export interface DescribeCustomRouteParams {
  id?: string
  name?: string
  namespace?: string
  service?: string
  enable?: boolean
  order_field?: string
  order_type?: string
  offset: number
  limit: number
}
export interface DescribeCustomRouteResult {
  data: CustomRoute[]
  amount: number
}
export async function describeCustomRoute(params: DescribeCustomRouteParams) {
  const res = await getApiRequest<DescribeCustomRouteResult>({
    action: 'naming/v2/routings',
    data: params,
  })
  return {
    list: res.data,
    totalCount: res.amount,
  }
}

export interface CreateCustomRoutesParams {
  id?: string
  name: string // 规则名
  enable: boolean // 是否启用
  routing_config: RoutingConfig
}
export interface RoutingConfig {
  '@type': string
  destinations: RoutingDestination[]
  sources: RoutingSources[]
}
export interface RoutingSources {
  service: string
  namespace: string
  arguments: RoutingSourceArgument[]
}
export interface RoutingSourceArgument {
  type: string
  key: string
  value: {
    type: string
    value: string
    value_type: string
  }
}
export interface RoutingDestination {
  name: string
  service: string
  namespace: string
  priority: number
  weight: number
  isolate: boolean
  transfer?: string
  labels: Record<string, RoutingLabel>
}
export interface RoutingLabel {
  key: string
  value: {
    type: string
    value: string
    value_type: string
  }
}
export async function createCustomRoute(params: CreateCustomRoutesParams[]) {
  const res = await apiRequest<any>({
    action: 'naming/v2/routings',
    data: params,
  })
  return res
}

export async function modifyCustomRoute(params: CreateCustomRoutesParams[]) {
  const res = await putApiRequest<any>({
    action: 'naming/v2/routings',
    data: params,
  })
  return res
}
export interface DeleteCustomRouteParams {
  id: string
}
export async function deleteCustomRoute(params: DeleteCustomRouteParams[]) {
  const res = await apiRequest<any>({
    action: 'naming/v2/routings/delete',
    data: params,
  })
  return res
}
export interface EnableCustomRouteParams {
  id: string
}
export async function enableCustomRoute(params: EnableCustomRouteParams[]) {
  const res = await putApiRequest<any>({
    action: 'naming/v2/routings/enable',
    data: params,
  })
  return res
}

export interface DisableCustomRouteParams {
  id: string
}
export async function disableCustomRoute(params: DisableCustomRouteParams[]) {
  const res = await putApiRequest<any>({
    action: 'naming/v2/routings/disable',
    data: params,
  })
  return res
}
