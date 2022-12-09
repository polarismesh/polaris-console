import { getApiRequest } from '../common/util/apiRequest'

export interface DescribeOperationRecordParams {
  offset: number
  limit: number
  namespace?: string
  resource_type?: string
  resource_name?: string
  operation_type?: string
  operator?: string
  operation_detail?: string
  start_time?: string
  end_time?: string
  extend_info?: string
}
export type DescribeOperationRecordResult = {
  amount: number
  size: number
  extend_info: string
  data: OperationRecord[]
  has_next: boolean
}

export interface OperationRecord {
  resource_type: string
  resource_desc: string
  resource_name: string
  namespace: string
  operation_type: string
  operation_desc: string
  operator: string
  operation_detail: string
  happen_time: string
}

export async function describeOperationRecord(params: DescribeOperationRecordParams) {
  const res = await getApiRequest<DescribeOperationRecordResult>({
    action: 'log/v1/operation/history',
    data: params,
  })
  return res
}

export type DescribeResourceTypeParams = {}
export type DescribeResourceTypeResult = ResourceType[]

export interface ResourceType {
  type: string
  desc: string
}

export async function describeResourceType() {
  const res = await getApiRequest<DescribeResourceTypeResult>({
    action: 'log/v1/operation/types',
    data: {},
  })
  return res
}
