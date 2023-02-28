export interface AlertInfo {
  id: string
  name: string
  enable: boolean
  monitor_type: string
  alter_expr: AlterExpr
  interval: string //'1m(分钟)/1h(小时)/1d(天)'
  interval_unit: string //'1m(分钟)/1h(小时)/1d(天)'
  topic: string
  message: string
  callback: {
    type: string //'CLS|WebHook'
    info: {
      topic_id: string //'cls 时需要传的参数'
      url: string // 'webhook 时需要传的参数'
    }
  }
  create_time: string
  modify_time: string
  enable_time: string
}
export interface AlterExpr {
  metrics_name: string
  expr: string //'Lt(小于)/Le(小于等于)/Gt(大于)/Ge(大于等于)/Eq(等于)/Ne(不等于)/Fluctuation(环比波动)/Rise(环比上升)/Decline(下降)/'
  value: number
  for: number //'1s(秒)/1m(分钟)/1h(小时)/1d(天)'
  for_unit: string
}
export enum AlterExprType {
  Lt = 'Lt',
  Le = 'Le',
  Gt = 'Gt',
  Ge = 'Ge',
  Eq = 'Eq',
  Ne = 'Ne',
  Fluctuation = 'Fluctuation',
  Rise = 'Rise',
  Decline = 'Decline',
}
export const AlterExprMap = {
  [AlterExprType.Lt]: '<',
  [AlterExprType.Le]: '<=',
  [AlterExprType.Gt]: '>',
  [AlterExprType.Ge]: '>=',
  [AlterExprType.Eq]: '==',
  [AlterExprType.Ne]: '!=',
  [AlterExprType.Fluctuation]: '环比波动',
  [AlterExprType.Rise]: '环比上升',
  [AlterExprType.Decline]: '环比下降',
}
export const AlterExprOptions = Object.entries(AlterExprMap).map(([key, value]) => {
  return { text: value, value: key }
})
export enum AlertTimeInterval {
  second = 's',
  minute = 'm',
  hour = 'h',
  day = 'd',
}
export const AlertTimeIntervalMap = {
  [AlertTimeInterval.second]: '秒',
  [AlertTimeInterval.minute]: '分钟',
  [AlertTimeInterval.hour]: '小时',
  [AlertTimeInterval.day]: '天',
}
export const AlertTimeIntervalOptions = Object.entries(AlertTimeIntervalMap).map(([key, value]) => {
  return { text: value, value: key }
})
export enum MonitorType {
  Business = 'Business',
}
export const MonitorTypeMap = {
  [MonitorType.Business]: '业务监控',
}
export const MonitorTypeOption = Object.entries(MonitorTypeMap).map(([key, value]) => {
  return { text: value, value: key }
})
export enum MetricName {
  DiscoveryConnTotal = 'discovery_conn_total',
  ConfigConnTotal = 'config_conn_total',
  SdkClientTotal = 'sdk_client_total',
}
export const MetricNameMap = {
  [MetricName.DiscoveryConnTotal]: {
    text: '服务发现连接数',
    unit: '个',
  },
  [MetricName.ConfigConnTotal]: {
    text: '配置获取连接数',
    unit: '个',
  },
  [MetricName.SdkClientTotal]: {
    text: '客户端数',
    unit: '个',
  },
}
export const MetricNameOptions = Object.entries(MetricNameMap).map(([key, value]) => {
  return { text: value.text, value: key }
})
export const IntervalOptions = [
  {
    text: '每1分钟告警一次',
    value: '1m',
    interval: 1,
    unit: AlertTimeInterval.minute,
  },
  {
    text: '每5分钟告警一次',
    value: '5m',
    interval: 5,
    unit: AlertTimeInterval.minute,
  },
  {
    text: '每15分钟告警一次',
    value: '15m',
    interval: 15,
    unit: AlertTimeInterval.minute,
  },
  {
    text: '每1小时告警一次',
    value: '1h',
    interval: 1,
    unit: AlertTimeInterval.hour,
  },
  {
    text: '每4小时告警一次',
    value: '4h',
    interval: 4,
    unit: AlertTimeInterval.hour,
  },
  {
    text: '每天告警一次',
    value: '1d',
    interval: 1,
    unit: AlertTimeInterval.day,
  },
]
export enum CallbackType {
  CLS = 'CLS',
  WebHook = 'WebHook',
}
