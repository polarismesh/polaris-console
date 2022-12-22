import { apiRequest, getApiRequest, putApiRequest } from '../common/util/apiRequest'
import { AlertInfo } from './types'

export interface CreateAlertRuleParams {
  id?: string
  name: string
  enable?: boolean
  monitor_type: string
  alter_expr?: {
    metrics_name: string
    expr: string
    value: string
    for: number
    for_unit: string
  }
  interval: string
  interval_unit: string
  topic: string
  message: string
  callback: {
    type: string
    info: {
      topic_id?: string
      url?: string
    }
  }
}
export type CreateAlertRuleResult = {
  data: boolean
}

export async function createAlertRule(params: CreateAlertRuleParams[]) {
  const res = await apiRequest<CreateAlertRuleResult>({
    action: '/alert/v1/rules',
    data: params,
  })
  return res
}

export async function modifyAlertRule(params: CreateAlertRuleParams[]) {
  const res = await putApiRequest<CreateAlertRuleResult>({
    action: '/alert/v1/rules',
    data: params,
  })
  return res
}
export interface DescribeAlertRulesParams {
  offset: number
  limit: number
  name?: string
  id?: String
}
export type DescribeAlertRulesResult = {
  amount: number
  size: number
  data: AlertInfo[]
}

export async function describeAlertRules(params: DescribeAlertRulesParams) {
  const res = await getApiRequest<DescribeAlertRulesResult>({
    action: '/alert/v1/rules',
    data: params,
  })
  return res
}

export interface DeleteAlertRuleParams {
  id: string
}
export type DeleteAlertRuleResult = {
  data: boolean
}

export async function deleteAlertRule(params: DeleteAlertRuleParams[]) {
  const res = await apiRequest<DeleteAlertRuleResult>({
    action: '/alert/v1/rules/delete',
    data: params,
  })
  return res
}

export interface ToggleAlertRuleParams {
  id: string
  enable: boolean
}
export type ToggleAlertRuleResult = {
  data: boolean
}

export async function toggleAlertRule(params: ToggleAlertRuleParams[]) {
  const res = await putApiRequest<ToggleAlertRuleResult>({
    action: '/alert/v1/rules/enable',
    data: params,
  })
  return res
}

export type FetchClsInfoParams = {}
export type FetchClsInfoResult = {
  data: ClsInfo
}
export interface ClsInfo {
  topic_id: string
  topic_name: string
  link: string
}
export async function fetchClsInfo(params: FetchClsInfoParams) {
  const res = await getApiRequest<FetchClsInfoResult>({
    action: '/cls/v1/info',
    data: params,
  })
  return res
}
