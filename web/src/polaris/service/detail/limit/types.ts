import { LimitResource, LimitRange, LimitType } from './model'

export const LIMIT_RANGE_MAP = {
  [LimitRange.LOCAL]: {
    text: '单机限流',
  },
  [LimitRange.GLOBAL]: {
    text: '分布式限流',
  },
}
export interface ComposedId {
  name: string
  namespace: string
  ruleId: string
}
export const LIMIT_TYPE_MAP = {
  [LimitType.REJECT]: {
    text: '快速失败',
  },
  [LimitType.UNIRATE]: {
    text: '匀速排队',
  },
}
export const LIMIT_TYPE_OPTIONS = (type: string) => [
  {
    text: LIMIT_TYPE_MAP[LimitType.REJECT].text,
    value: LimitType.REJECT,
  },
  {
    text: LIMIT_TYPE_MAP[LimitType.UNIRATE].text,
    value: LimitType.UNIRATE,
    disabled: type === LimitRange.GLOBAL,
  },
]
export const LIMIT_RANGE_OPTIONS = [
  {
    text: LIMIT_RANGE_MAP[LimitRange.LOCAL].text,
    value: LimitRange.LOCAL,
  },
  {
    text: LIMIT_RANGE_MAP[LimitRange.GLOBAL].text,
    value: LimitRange.GLOBAL,
  },
]

export enum LimitThresholdMode {
  GLOBAL_TOTAL = 'GLOBAL_TOTAL',
  SHARE_EQUALLY = 'SHARE_EQUALLY',
}
export const LIMIT_THRESHOLD_MAP = {
  [LimitThresholdMode.GLOBAL_TOTAL]: {
    text: '总体阈值',
    message: '以集群作为整体来查看阈值，不受集群内单机数量变化影响',
  },
  [LimitThresholdMode.SHARE_EQUALLY]: {
    text: '单机均摊阈值',
    message: '针对单个机器做限流',
  },
}
export const LIMIT_THRESHOLD_OPTIONS = Object.keys(LIMIT_THRESHOLD_MAP).map(key => ({
  text: LIMIT_THRESHOLD_MAP[key].text,
  value: key,
}))
export const getTemplateRatelimit = (namespace, service) => `{
  "service": "${service}", 
  "namespace": "${namespace}", 
  "priority": 0,
  "type": "LOCAL",
  "labels": {
     "method": {
         "type": "REGEX",
          "value": ".*"
      },
      "labelKey": {
         "type": "EXACT",
          "value": "labelValue"
      }
  },
  "amounts": [
      {
          "maxAmount": 100,
          "validDuration": "1s"
      }
  ],
  "action": "REJECT",
  "resource": "QPS"
}
`
