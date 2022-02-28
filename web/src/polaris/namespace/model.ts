import { getApiRequest, apiRequest, putApiRequest } from '../common/util/apiRequest'
import { DescribeNamespacesResult } from '../service/model'
import { Namespace } from '../service/types'

export interface DescribeNamespaceParams {
  limit: number
  offset: number
  name?: string
  owners?: string
}

export interface CreateNamespaceParams {
  name: string
  comment: string
  owners?: string
  user_ids?: string[]
  group_ids?: string[]
}
export interface CreateNamespaceResult {
  namespace: Namespace
}
export interface ModifyNamespaceParams {
  name: string
  comment?: string
  owners?: string
  user_ids?: string[]
  group_ids?: string[]
  remove_user_ids?: string[]
  remove_group_ids?: string[]
}
export interface ModifyNamespaceResult {
  size: number
}
export interface DeleteNamespaceParams {
  name: string
  token: string
}
export interface DeleteNamespaceResult {
  size: number
}
export async function describeComplicatedNamespaces(params: DescribeNamespaceParams) {
  const res = await getApiRequest<DescribeNamespacesResult>({
    action: 'naming/v1/namespaces',
    data: params,
  })

  return res
}

export async function createNamespace(params: CreateNamespaceParams[]) {
  const res = await apiRequest<CreateNamespaceResult>({
    action: 'naming/v1/namespaces',
    data: params,
  })

  return res
}

export async function modifyNamespace(params: ModifyNamespaceParams[]) {
  const res = await putApiRequest<ModifyNamespaceResult>({
    action: 'naming/v1/namespaces',
    data: params,
  })

  return res
}

export async function deleteNamespace(params: DeleteNamespaceParams[]) {
  const res = await apiRequest<DeleteNamespaceResult>({
    action: 'naming/v1/namespaces/delete',
    data: params,
  })

  return res
}
