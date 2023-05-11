import { APIRequestOption, getApiRequest } from '@src/polaris/common/util/apiRequest'
import axios from 'axios'

interface PromethusResponse<T> {
  data: T
  status: string
}
export interface MonitorFetcherData {
  metrics: Record<string, string>
  values: Array<Array<number>>
}
export async function getPromethusApiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts } = options
  try {
    //tips.showLoading({});
    const res = await axios.get<PromethusResponse<T>>(action, {
      params: data,
      ...opts,
    })
    if (res.data.status !== 'success') {
      throw res.data
    }
    return res.data
  } catch (e) {
    console.error(e)
  } finally {
    //tips.hideLoading();
  }
}
export interface DeleteInstancesParams {
  id: string
}
export interface GetMonitorDataParams {
  query: string
  start: number
  end: number
  step: number
}

export interface GetLabelDataParams {
  match?: string[]
  start?: number
  end?: number
  labelKey: string
}
export async function getMonitorData(params: GetMonitorDataParams) {
  const res = await getPromethusApiRequest<{ result: MonitorFetcherData[] }>({
    action: `api/v1/query_range`,
    data: new URLSearchParams(params as any),
  })
  return res.data.result
}
export async function getLabelData(params: GetLabelDataParams) {
  const searchParams = new URLSearchParams()

  if (params.match) {
    params.match.forEach(match => searchParams.append('match[]', match))
    searchParams.append('start', params.start.toString())
    searchParams.append('end', params.end.toString())
  }
  const res = await getPromethusApiRequest<string[]>({
    action: `api/v1/label/${params.labelKey}/values`,
    data: searchParams,
  })
  return res.data
}

export interface MetricInterface {
  name: string // 接口名称
  desc: string // 接口描述
  type: string // 接口类型
  query_labels: string[]
}

export async function getMetricsInterface() {
  const res = await getApiRequest<MetricInterface[]>({
    action: 'metrics/v1/server/interfaces',
    data: {},
  })

  return res
}

export async function getNamespaceNodes() {
  const res = await getApiRequest<{ data: string[] }>({
    action: 'metrics/v1/server/nodes',
    data: {},
  })

  return res.data
}

export async function getMetricService(params: GetMetricServiceParams) {
  const res = await getApiRequest<MetricService[]>({
    action: '/metrics/v1/services',
    data: params,
  })

  return res
}
export interface GetMetricServiceParams {
  name?: string
  namespace: string
  start: number
  end: number
  step: number
}
export interface MetricService {
  name: string // 接口名称
  namespace: string // 接口描述
  healthy_instance_count: string // 健康实例数
  total_instance_count: string // 中实例数
  success_rate: string // 成功率
  total_request: string // 总请求数
  failed_request: string // 失败请求数
  limited_request: string // 限流请求数
  circuitbreaker_request: string // 熔断请求数
  avg_timeout: string // 平均时延
}

export async function getMetricInterface(params: GetMetricInterfaceParams) {
  const res = await getApiRequest<GetMetricInterfaceResult>({
    action: '/metrics/v1/services/interfaces',
    data: params,
  })

  return res
}
export interface GetMetricInterfaceParams {
  callee_instance: string
  service: string
  namespace: string
  start: number
  end: number
  step: number
}
export interface GetMetricInterfaceResult {
  category_service: CategoryAllInterface
  category_interface: CategoryInterface
}

export interface CategoryAllInterface {
  interface_name: string // 接口名称
  status: string // 状态，正常/熔断
  success_request: string // 总请求数
  flow_control_request: string // 流控请求数
  abnormal_request: string // 异常请求数
  avg_timeout: string // 平均时延
}
export interface CategoryInterface {
  interface_name: string // 接口名称
  status: string // 状态，正常/熔断
  success_request: string // 总请求数
  flow_control_request: string // 流控请求数
  abnormal_request: string // 异常请求数
  avg_timeout: string // 平均时延
}

export async function getMetricInstance(params: GetMetricInstanceParams) {
  const res = await getApiRequest<GetMetricInstanceResult>({
    action: '/metrics/v1/services/instances',
    data: params,
  })

  return res
}
export interface GetMetricInstanceParams {
  service: string
  namespace: string
  callee_method: string
  start: number
  end: number
  step: number
}
export interface GetMetricInstanceResult {
  data: MetricInstance[]
}
export interface MetricInstance {
  id: string
  host: string
  port: string
  status: string
  isolate: string
  success_rate: string
  total_request: string
  failed_request: string
  limited_request: string
  circuitbreaker_request: string
  avg_timeout: string
}

export async function getMetricCaller(params: GetMetricCallerParams) {
  const res = await getApiRequest<GetMetricCallerResult>({
    action: '/metrics/v1/callers',
    data: params,
  })

  return res
}
export interface GetMetricCallerParams {
  callee_service: string
  callee_namespace: string
  callee_method: string
  start: number
  end: number
  step: number
}
export interface GetMetricCallerResult {
  data: MetricCaller[]
}
export interface MetricCaller {
  host: string // 命名空间
  service: string // 服务名称
  namespace: string // 命名空间
  success_rate: string // 成功率
  total_request: string // 总请求数
  failed_request: string // 失败请求数
  limited_request: string // 限流请求数
  circuitbreaker_request: string // 熔断请求数
  avg_timeout: string // 平均时延
}

export async function getAllService(params: GetAllServiceParams) {
  const res = await getApiRequest<SimpleService[]>({
    action: '/naming/v1/services/all',
    data: params,
  })

  return res
}
export interface GetAllServiceParams {
  name?: string
  namespace: string
}
export interface SimpleService {
  name: string // 接口名称
  namespace: string // 接口描述
}

export async function getAllInstance(params: GetAllInstanceParams) {
  const res = await getApiRequest<SimpleService[]>({
    action: '/metrics/v1/services/instances/list',
    data: params,
  })

  return res
}
export interface GetAllInstanceParams {
  service: string
  namespace: string
}
