import { getApiRequest } from '../common/util/apiRequest'

export interface DescribeEventCenterRecordParams {
  offset: number
  limit: number
  namespace?: string
  service?: string
  instance?: string
  event_type?: string
  start_time?: string
  end_time?: string
  extend_info?: string
}
export type DescribeEventCenterRecordResult = {
  amount: number
  size: number
  extend_info: string
  data: EventRecord[]
  has_next: boolean
}

export interface EventRecord {
  event_type: string
  event_desc: string
  namespace: string
  service: string
  instance_id: string
  host: string
  port: number
  event_time: string
}

export async function describeEventCenterRecord(params: DescribeEventCenterRecordParams) {
  const res = await getApiRequest<DescribeEventCenterRecordResult>({
    action: 'log/v1/event/history',
    data: params,
  })
  return res
}

export type DescribeEventTypeParams = {}
export type DescribeEventTypeResult = EventType[]

export interface EventType {
  type: string
  desc: string
}

export async function describeEventType() {
  const res = await getApiRequest<DescribeEventTypeResult>({
    action: '/log/v1/event/types',
    data: {},
  })
  return res
}

export type DescribeCLSOpenStatusParams = {}
export type DescribeCLSOpenStatusResult = { data: string[] }

export interface EventType {
  type: string
  desc: string
}

export async function DescribeCLSOpenStatus() {
  const res = await getApiRequest<DescribeCLSOpenStatusResult>({
    action: 'console/ability',
    data: {},
  })
  return res.data.indexOf('log_observability') > -1
}
