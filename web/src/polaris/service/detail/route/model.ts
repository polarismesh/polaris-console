import { InboundItem, OutboundItem } from './types'
import { getApiRequest, putApiRequest, apiRequest } from '@src/polaris/common/util/apiRequest'

export interface DescribeRoutesParams {
  namespace: string
  service: string
}
export interface Routing {
  namespace: string
  service: string
  ctime: string
  mtime: string
  revision: string
  inbounds: InboundItem[]
  outbounds: OutboundItem[]
}

export interface DescribeRoutesResult {
  routings: Routing
}
export async function describeRoutes(params: DescribeRoutesParams) {
  const res = await getApiRequest<DescribeRoutesResult>({
    action: 'naming/v1/routings',
    data: params,
  })
  return res.routings
}

export interface CreateRoutesParams {
  namespace: string
  service: string
  inbounds: InboundItem[]
  outbounds: OutboundItem[]
}
export async function createRoutes(params: any) {
  const res = await apiRequest<DescribeRoutesResult>({
    action: 'naming/v1/routings',
    data: params,
  })
  return res
}

export async function modifyRoutes(params: any) {
  const res = await putApiRequest<DescribeRoutesResult>({
    action: 'naming/v1/routings',
    data: params,
  })
  return res
}
export async function deleteRoutes(params: any) {
  const res = await apiRequest<DescribeRoutesResult>({
    action: 'naming/v1/routings/delete',
    data: params,
  })
  return res
}
