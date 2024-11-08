import { KeyValuePair } from '@src/polaris/configuration/fileGroup/types'

export interface CircuitBreakerRule {
  id?: string
  name: string // 规则名
  enable: boolean // 是否启用
  level: string
  description: string
  ruleMatcher: {
    source: {
      service: string
      namespace: string
    }
    destination: {
      service: string
      namespace: string
      method: {
        type: string
        value: string
      }
    }
  }
  errorConditions: ErrorCondition[]
  triggerCondition: TriggerCondition[]
  recoverCondition: RecoverCondition
  faultDetectConfig: FaultDetectConfig
  fallbackConfig: FallbackConfig
  ctime?: string
  mtime?: string
  etime?: string
  editable: boolean
  deleteable: boolean
  metadata?: Record<string, string>
}
export interface ErrorCondition {
  inputType: string
  condition: {
    type: string
    value: string
  }
}
export interface TriggerCondition {
  // 触发类型：ERROR_RATE错误率，CONSECUTIVE_ERROR连续错误数
  triggerType: string
  errorCount: number
  errorPercent: number
  interval: number
  minimumRequest: number
}
export interface RecoverCondition {
  sleepWindow?: number
  consecutiveSuccess?: number
}

export interface FaultDetectConfig {
  enable: boolean
}
export interface FallbackConfig {
  enable: boolean
  response: {
    code: number
    headers: KeyValuePair[]
    body: string
  }
}
export enum ErrorConditionType {
  RET_CODE = 'RET_CODE',
  DELAY = 'DELAY',
}
export const ErrorConditionMap = {
  [ErrorConditionType.DELAY]: '时延',
  [ErrorConditionType.RET_CODE]: '返回码',
}
export const ErrorConditionOptions = Object.entries(ErrorConditionMap).map(([key, value]) => ({
  text: value,
  value: key,
}))
export enum TriggerType {
  ERROR_RATE = 'ERROR_RATE',
  CONSECUTIVE_ERROR = 'CONSECUTIVE_ERROR',
}
export const TriggerTypeMap = {
  [TriggerType.CONSECUTIVE_ERROR]: { text: '连续错误数', unit: '个' },
  [TriggerType.ERROR_RATE]: { text: '错误率', unit: '%' },
}
export const TriggerTypeOptions = Object.entries(TriggerTypeMap).map(([key, value]) => ({
  text: value.text,
  value: key,
}))
export enum BreakLevelType {
  Instance = 'INSTANCE',
  Group = 'GROUP',
  Method = 'METHOD',
  Service = 'SERVICE',
}
export const BreakLevelMap = {
  [BreakLevelType.Instance]: '实例',
  [BreakLevelType.Group]: '实例分组',
  [BreakLevelType.Method]: '接口',
  [BreakLevelType.Service]: '服务',
}
export const BreakLevelSearchParamMap = {
  [BreakLevelType.Instance]: 4,
  [BreakLevelType.Group]: 3,
  [BreakLevelType.Method]: 2,
  [BreakLevelType.Service]: 1,
}
export const ServiceLevelType = [BreakLevelType.Method, BreakLevelType.Service]
export const InterfaceLevelType = [BreakLevelType.Instance]
export const ServiceBreakLevelOptions = Object.entries(BreakLevelMap)
  .filter(([key]) => ServiceLevelType.indexOf(key as any) > -1)
  .map(([key, value]) => ({
    text: value,
    value: key,
  }))
export const InterfaceBreakLevelOptions = Object.entries(BreakLevelMap)
  .filter(([key]) => InterfaceLevelType.indexOf(key as any) > -1)
  .map(([key, value]) => ({
    text: value,
    value: key,
  }))
export enum BreakerType {
  Service = 'Service',
  Interface = 'Interface',
  FaultDetect = 'FaultDetect',
}
export const checkRuleType = level =>
  ServiceLevelType.indexOf(level as any) > -1
    ? BreakerType.Service
    : InterfaceLevelType.indexOf(level as any) > -1
    ? BreakerType.Interface
    : BreakerType.FaultDetect
export const FaultDetectTabs = [
  { id: BreakerType.Service, label: '服务级熔断' },
  { id: BreakerType.Interface, label: '节点级熔断' },
  { id: BreakerType.FaultDetect, label: '主动探测' },
]
