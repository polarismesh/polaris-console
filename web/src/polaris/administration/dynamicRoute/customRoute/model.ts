import { apiRequest, getApiRequest, putApiRequest } from '@src/polaris/common/util/apiRequest'

export interface CustomRoute {
  id?: string
  name?: string // 规则名
  enable?: boolean // 是否启用
  priority?: number
  description?: string
  routing_config?: RoutingConfig
  ctime?: string
  mtime?: string
  etime?: string
  routing_policy?: string
  editable?: boolean
  deleteable?: boolean
}

export interface DescribeCustomRouteParams {
  id?: string
  name?: string
  namespace?: string
  service?: string
  enable?: boolean
  order_field?: string
  order_type?: string
  source_service?: string
  source_namespace?: string
  destination_service?: string
  destination_namespace?: string
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
  rules: RoutingRule[]
}

export interface RoutingSources {
  service: string
  namespace: string
}

export interface RoutingRule {
  name: string
  sources: RoutingRuleSource[]
  destinations: RoutingRuleDestination[]
}

export interface RoutingRuleSource {
  service: string
  namespace: string
  arguments: RoutingSourceArgument[]
}

export interface RoutingRuleDestination {
  service: string
  namespace: string
  weight: number
  isolate: boolean
  labels: Record<string, RoutingLabel>
  name: string
  priority?: number
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
  service: string
  namespace: string
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
  enable: boolean
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
  enable: boolean
}
export async function disableCustomRoute(params: DisableCustomRouteParams[]) {
  const res = await putApiRequest<any>({
    action: 'naming/v2/routings/enable',
    data: params,
  })
  return res
}
