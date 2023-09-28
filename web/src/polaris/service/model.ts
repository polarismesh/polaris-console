import { apiRequest, getApiRequest, putApiRequest } from '../common/util/apiRequest'
import { Service, Namespace } from './types'

export interface DescribeServicesParams {
  offset: number
  limit: number
  name?: string
  namespace?: string
  host?: string
  keys?: string
  values?: string
  business?: string
  department?: string
  hide_empty_service?: boolean
}
export interface OperateServicesResult {
  amount: number
  size: number
  services: Array<Service>
}

export interface CreateServicesParams {
  name: string
  namespace: string
  ports: string
  comment: string
  business: string
  metadata: Record<string, string>
  owners: string
  department: string
  user_ids?: string[]
  group_ids?: string[]
}

export interface ModifyServicesParams {
  name: string
  namespace: string
  ports: string
  comment: string
  business: string
  metadata: Record<string, string>
  owners: string
  cmdb_mod1: string
  cmdb_mod2: string
  cmdb_mod3: string
  department: string
  user_ids?: string[]
  group_ids?: string[]
  remove_user_ids?: string[]
  remove_group_ids?: string[]
}
export interface DescribeNamespacesResult {
  amount: number
  size: number
  namespaces: Array<Namespace>
}

export interface DeleteServicesParams {
  name: string
  namespace: string
}
export async function describeServices(params: DescribeServicesParams) {
  const res = await getApiRequest<OperateServicesResult>({
    action: 'naming/v1/services',
    data: params,
  })
  return {
    list: res.services,
    totalCount: res.amount,
  }
}

export async function modifyServices(params: ModifyServicesParams[]) {
  const res = await putApiRequest<OperateServicesResult>({
    action: 'naming/v1/services',
    data: params,
  })

  return res
}

export async function createService(params: CreateServicesParams[]) {
  const res = await apiRequest<OperateServicesResult>({
    action: 'naming/v1/services',
    data: params,
  })

  return res
}

export async function deleteService(params: DeleteServicesParams[]) {
  const res = await apiRequest<OperateServicesResult>({
    action: 'naming/v1/services/delete',
    data: params,
  })

  return res
}

export async function describeNamespaces() {
  const res = await getApiRequest<DescribeNamespacesResult>({
    action: 'naming/v1/namespaces',
    data: { limit: 100, offset: 0 },
  })

  return res.namespaces
}
