import { apiRequest, getApiRequest, putApiRequest } from '@src/polaris/common/util/apiRequest'
import { Instance, HEALTH_CHECK_STRUCT } from './types'

export interface DescribeInstancesParams {
  offset: number
  limit: number
  service: string
  namespace: string
  host?: string
  port?: number
  weight?: number
  protocol?: string
  version?: string
  keys?: string
  values?: string
  healthy?: boolean
  isolate?: boolean
}

export interface DescribeInstancesResult {
  amount: number
  size: number
  instances: Array<Instance>
}
export interface OperateInstancesResult {
  amount: number
  size: number
  responses: Array<InstanceResponse>
}
export interface InstanceResponse {
  code: number
  info: string
  instance: {
    host: string
    id: string
    namespace: string
    port: number
    service: string
  }
}

export interface DescribeInstanceLabelsParams {
  namespace: string
  service: string
}
export interface DescribeInstanceLabelsResult {
  instanceLabels: {
    labels: Record<string, { values: string[] }>
  }
}
export interface CreateInstanceParams {
  enable_health_check: boolean
  health_check: HEALTH_CHECK_STRUCT
  healthy: boolean
  host: string
  isolate: boolean
  metadata: Record<string, string>
  namespace: string
  port: number
  protocol: string
  service: string
  version: string
  weight: number
  location: {
    region: string
    zone: string
    campus: string
  }
}

export interface ModifyInstanceParams {
  enable_health_check: boolean
  health_check: HEALTH_CHECK_STRUCT
  healthy: boolean
  isolate: boolean
  metadata: Record<string, string>
  namespace: string
  protocol: string
  service: string
  version: string
  weight: number
  location: {
    region: string
    zone: string
    campus: string
  }
  id: string
}
export interface DeleteInstancesParams {
  id: string
}
export async function describeInstances(params: DescribeInstancesParams) {
  const res = await getApiRequest<DescribeInstancesResult>({
    action: 'naming/v1/instances',
    data: params,
  })
  return {
    list: res.instances,
    totalCount: res.amount,
  }
}

export async function createInstances(params: CreateInstanceParams[]) {
  const res = await apiRequest<OperateInstancesResult>({
    action: 'naming/v1/instances',
    data: params,
  })

  return res
}

export async function modifyInstances(params: ModifyInstanceParams[]) {
  const res = await putApiRequest<OperateInstancesResult>({
    action: 'naming/v1/instances',
    data: params,
  })

  return res
}
export async function deleteInstances(params: DeleteInstancesParams[]) {
  const res = await apiRequest<void>({
    action: 'naming/v1/instances/delete',
    data: params,
  })

  return res
}

export async function describeInstanceLabels(params: DescribeInstanceLabelsParams) {
  const res = await getApiRequest<DescribeInstanceLabelsResult>({
    action: 'naming/v1/instances/labels',
    data: params,
    noError: true,
  })

  return res.instanceLabels.labels
}
