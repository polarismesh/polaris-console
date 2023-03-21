import i18n from '@src/polaris/common/util/i18n'

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
    text: i18n.t('总请求数'),
    unit: i18n.t('个'),
  },
  [MetricName.UpstreamRqSuccess]: {
    text: i18n.t('成功数'),
    unit: i18n.t('个'),
  },
  [MetricName.UpstreamRqMaxTimeout]: {
    text: i18n.t('最大时延'),
    unit: 'ms',
  },
  [MetricName.UpstreamRqTimeout]: {
    text: i18n.t('平均时延'),
    unit: 'ms',
  },
  [MetricName.RatelimitRqTotal]: {
    text: i18n.t('总请求数'),
    unit: i18n.t('个'),
  },
  [MetricName.RatelimitRqPass]: {
    text: i18n.t('通过数'),
    unit: i18n.t('个'),
  },
  [MetricName.RatelimitRqLimit]: {
    text: i18n.t('限流数'),
    unit: i18n.t('个'),
  },
  [MetricName.CircuitbreakerOpen]: {
    text: i18n.t('熔断数'),
    unit: i18n.t('个'),
  },
  [MetricName.CircuitbreakerHalfopen]: {
    text: i18n.t('半开数'),
    unit: i18n.t('个'),
  },
  [MetricName.DiscoveryConnTotal]: {
    text: i18n.t('服务发现连接数'),
    unit: i18n.t('个'),
  },
  [MetricName.ConfigConnTotal]: {
    text: i18n.t('配置获取连接数'),
    unit: i18n.t('个'),
  },
  [MetricName.SdkClientTotal]: {
    text: i18n.t('客户端数'),
    unit: i18n.t('个'),
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

export function getLabelKeyMap() {
  return {
    [MonitorLabelKey.Namespace]: {
      text: i18n.t('被调命名空间'),
    },
    [MonitorLabelKey.Service]: {
      text: i18n.t('被调服务名'),
    },
    [MonitorLabelKey.Method]: {
      text: i18n.t('被调接口名'),
    },
    [MonitorLabelKey.Subset]: {
      text: i18n.t('被调实例分组'),
    },
    [MonitorLabelKey.Instance]: {
      text: i18n.t('被调实例'),
    },
    [MonitorLabelKey.CalleeLabels]: {
      text: i18n.t('被调请求标签'),
    },
    [MonitorLabelKey.RetCode]: {
      text: i18n.t('返回码'),
    },
    [MonitorLabelKey.CallerNamespace]: {
      text: i18n.t('主调命名空间'),
    },
    [MonitorLabelKey.CallerService]: {
      text: i18n.t('主调服务名'),
    },
    [MonitorLabelKey.CallerIp]: {
      text: i18n.t('主调实例IP'),
    },
    [MonitorLabelKey.CallerLabels]: {
      text: i18n.t('主调请求标签'),
    },
  }
}

export function getLabelKeyOptions() {
  const LabelKeyMap = getLabelKeyMap()
  return Object.keys(LabelKeyMap).map(key => ({
    text: LabelKeyMap[key].text,
    value: key,
  }))
}

export const OptionSumKey = '__SUM__'
export const OptionAllKey = '__ALL__'
