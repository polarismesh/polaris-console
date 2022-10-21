import { t } from 'i18next'
export enum MetricName {
  UpstreamRqTotal = 'upstream_rq_total', //总请求数
  UpstreamRqSuccess = 'upstream_rq_success', //总成功数
  UpstreamRqTimeout = 'upstream_rq_timeout', //总时延
  UpstreamRqMaxTimeout = 'upstream_rq_max_timeout', //最大时延

  RatelimitRqTotal = 'ratelimit_rq_total', //总请求数（求和）
  RatelimitRqPass = 'ratelimit_rq_pass', //总成功数
  RatelimitRqLimit = 'ratelimit_rq_limit', //总限流数

  CircuitbreakerOpen = 'circuitbreaker_open', //熔断数
  CircuitbreakerHalfopen = 'circuitbreaker_halfopen', //半开数
}

export const MetricNameMap = {
  [MetricName.UpstreamRqTotal]: {
    text: t('总请求数'),
    unit: t('个'),
  },
  [MetricName.UpstreamRqSuccess]: {
    text: t('成功数'),
    unit: t('个'),
  },
  [MetricName.UpstreamRqMaxTimeout]: {
    text: t('最大时延'),
    unit: 'ms',
  },
  [MetricName.UpstreamRqTimeout]: {
    text: t('平均时延'),
    unit: 'ms',
  },
  [MetricName.RatelimitRqTotal]: {
    text: t('总请求数'),
    unit: t('个'),
  },
  [MetricName.RatelimitRqPass]: {
    text: t('通过数'),
    unit: t('个'),
  },
  [MetricName.RatelimitRqLimit]: {
    text: t('限流数'),
    unit: t('个'),
  },
  [MetricName.CircuitbreakerOpen]: {
    text: t('熔断数'),
    unit: t('个'),
  },
  [MetricName.CircuitbreakerHalfopen]: {
    text: t('半开数'),
    unit: t('个'),
  },
}
export enum MonitorLabelKey {
  Namespace = 'callee_namespace', //被调命名空间

  Service = 'callee_service', //被调服务名

  Method = 'callee_method', //被调接口

  Subset = 'callee_subset', //被调实例分组

  Instance = 'callee_instance', //被调实例（IP:PORT格式）

  RetCode = 'callee_result_code', //返回码

  CalleeLabels = 'callee_labels', //被调请求标签

  CallerLabels = 'caller_labels', //主调请求标签

  CallerNamespace = 'caller_namespace', //主调命名空间

  CallerService = 'caller_service', //主调服务名

  CallerIp = 'caller_ip', //主调IP
}

export const MetricNameOptions = Object.keys(MetricNameMap).map((key) => ({
  text: MetricNameMap[key].text,
  value: key,
}))

export const LabelKeyMap = {
  [MonitorLabelKey.Namespace]: {
    text: t('被调命名空间'),
  },
  [MonitorLabelKey.Service]: {
    text: t('被调服务名'),
  },
  [MonitorLabelKey.Method]: {
    text: t('被调接口名'),
  },
  [MonitorLabelKey.Subset]: {
    text: t('被调实例分组'),
  },
  [MonitorLabelKey.Instance]: {
    text: t('被调实例'),
  },
  [MonitorLabelKey.CalleeLabels]: {
    text: t('被调请求标签'),
  },
  [MonitorLabelKey.RetCode]: {
    text: t('返回码'),
  },
  [MonitorLabelKey.CallerNamespace]: {
    text: t('主调命名空间'),
  },
  [MonitorLabelKey.CallerService]: {
    text: t('主调服务名'),
  },
  [MonitorLabelKey.CallerIp]: {
    text: t('主调实例IP'),
  },
  [MonitorLabelKey.CallerLabels]: {
    text: t('主调请求标签'),
  },
}

export const LabelKeyOptions = Object.keys(LabelKeyMap).map((key) => ({
  text: LabelKeyMap[key].text,
  value: key,
}))

export const OptionSumKey = '__SUM__'
export const OptionAllKey = '__ALL__'
