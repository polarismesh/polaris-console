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

  DiscoveryConnTotal = 'discovery_conn_total', //总请求数
  ConfigConnTotal = 'config_conn_total', //总成功数
  SdkClientTotal = 'sdk_client_total', //总时延
}

export const MetricNameMap = {
  [MetricName.UpstreamRqTotal]: {
    text: '总请求数',
    unit: '个',
  },
  [MetricName.UpstreamRqSuccess]: {
    text: '成功数',
    unit: '个',
  },
  [MetricName.UpstreamRqMaxTimeout]: {
    text: '最大时延',
    unit: 'ms',
  },
  [MetricName.UpstreamRqTimeout]: {
    text: '平均时延',
    unit: 'ms',
  },
  [MetricName.RatelimitRqTotal]: {
    text: '总请求数',
    unit: '个',
  },
  [MetricName.RatelimitRqPass]: {
    text: '通过数',
    unit: '个',
  },
  [MetricName.RatelimitRqLimit]: {
    text: '限流数',
    unit: '个',
  },
  [MetricName.CircuitbreakerOpen]: {
    text: '熔断数',
    unit: '个',
  },
  [MetricName.CircuitbreakerHalfopen]: {
    text: '半开数',
    unit: '个',
  },
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

export const MetricNameOptions = Object.keys(MetricNameMap).map(key => ({
  text: MetricNameMap[key].text,
  value: key,
}))

export const LabelKeyMap = {
  [MonitorLabelKey.Namespace]: {
    text: '被调命名空间',
  },
  [MonitorLabelKey.Service]: {
    text: '被调服务名',
  },
  [MonitorLabelKey.Method]: {
    text: '被调接口名',
  },
  [MonitorLabelKey.Subset]: {
    text: '被调实例分组',
  },
  [MonitorLabelKey.Instance]: {
    text: '被调实例',
  },
  [MonitorLabelKey.CalleeLabels]: {
    text: '被调请求标签',
  },
  [MonitorLabelKey.RetCode]: {
    text: '返回码',
  },
  [MonitorLabelKey.CallerNamespace]: {
    text: '主调命名空间',
  },
  [MonitorLabelKey.CallerService]: {
    text: '主调服务名',
  },
  [MonitorLabelKey.CallerIp]: {
    text: '主调实例IP',
  },
  [MonitorLabelKey.CallerLabels]: {
    text: '主调请求标签',
  },
}

export const LabelKeyOptions = Object.keys(LabelKeyMap).map(key => ({
  text: LabelKeyMap[key].text,
  value: key,
}))

export const OptionSumKey = '__SUM__'
export const OptionAllKey = '__ALL__'

export enum LineColor {
  Blue = '#006EFF',
  Green = '#0ABF5B',
  Red = '#E54545',
  Yellow = '#FF7200',
  Gray = '#6E829D',
}

export const DefaultLineColors = Object.values(LineColor)

export const LatestValueReduceFunction = (prev, curr, index, array) => {
  const [, value] = curr
  if (index === array?.length - 1) return Math.floor(Number(value))
}

export const SumUpReduceFunction = (prev, curr, index, array) => {
  const [, value] = curr
  if (index === array.length - 1) return Math.floor(prev + Number(value))
  return prev + Number(value)
}

export const AvgReduceFunction = (prev, curr, index, array) => {
  const [, value, oldVal] = curr
  let numVal = Number(value)
  if (oldVal === 'NaN') {
    numVal = 0
  }
  if (index === array.length - 1)
    return (prev / array.filter(item => item.value !== '0' || item.value !== 'NaN').length).toFixed(2)
  return prev + numVal
}

export const MaxReduceFunction = (prev, curr, index, array) => {
  const ppre = prev ? prev : Number.MIN_VALUE
  const [, value] = curr
  if (!value) {
    return ppre
  }
  return Math.max(ppre, Number(value)).toFixed(2)
}

export const MinReduceFunction = (prev, curr, index, array) => {
  const ppre = prev ? prev : Number.MAX_VALUE
  const [, value] = curr
  if (!value) {
    return ppre
  }
  return Math.min(ppre, Number(value)).toFixed(2)
}
