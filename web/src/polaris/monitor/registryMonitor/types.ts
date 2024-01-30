import moment from 'moment'
import { getMonitorData } from '../models'
import {
  LatestValueReduceFunction,
  SumUpReduceFunction,
  AvgReduceFunction,
  LineColor,
  MaxReduceFunction,
  MinReduceFunction,
} from '../types'

export enum MetricName {
  Node = 'Node',
  Connect = 'Connect',
  Request = 'Request',
  Timeout = 'Timeout',
  Service = 'Service',
  Instance = 'Instance',
  ConfigGroup = 'ConfigGroup',
  ConfigFile = 'ConfigFile',
  ErrorReq = 'ErrorReq',
  RetCode = 'RetCode',
}

const miniStep = 60

export const getQueryMap = {
  [MetricName.Node]: () => [
    {
      name: '总节点数',
      query: 'max(max(client_total) by (polaris_server_instance) or on() vector(0))',
      boardFunction: LatestValueReduceFunction,
      unit: '个',
    },
  ],
  [MetricName.Connect]: () => [
    {
      name: '总连接数',
      query: 'sum(sdk_client_total) or on() vector(0)',
      boardFunction: LatestValueReduceFunction,
    },
    {
      name: '注册中心连接数',
      query: 'sum(discovery_conn_total) or on() vector(0)',
      boardFunction: LatestValueReduceFunction,
    },
    {
      name: '配置中心连接数',
      query: 'sum(config_conn_total) or on() vector(0)',
      boardFunction: LatestValueReduceFunction,
    },
  ],
  [MetricName.Request]: (queryParam = {} as any) => {
    const { interfaceName, podName } = queryParam
    return [
      {
        name: '总请求数',
        query:
          interfaceName && podName
            ? `sum(client_rq_interval_count{api=~"${interfaceName}",polaris_server_instance="${podName}"}) or on() vector(0)`
            : interfaceName
              ? `sum(client_rq_interval_count{api=~"${interfaceName}"}) or on() vector(0)`
              : podName
                ? `sum(client_rq_interval_count{polaris_server_instance="${podName}"}) or on() vector(0)`
                : 'sum(client_rq_interval_count) or on() vector(0)',
        boardFunction: SumUpReduceFunction,
        minStep: miniStep,
      },
      {
        name: '成功请求数',
        query:
          interfaceName && podName
            ? `sum(client_rq_interval_count{err_code=~"2.+|0",api=~"${interfaceName}",polaris_server_instance="${podName}"}) or on() vector(0)`
            : interfaceName
              ? `sum(client_rq_interval_count{err_code=~"2.+|0",api=~"${interfaceName}"}) or on() vector(0)`
              : podName
                ? `sum(client_rq_interval_count{err_code=~"2.+|0",polaris_server_instance="${podName}"}) or on() vector(0)`
                : 'sum(client_rq_interval_count{err_code=~"2.+|0"}) or on() vector(0)',
        boardFunction: SumUpReduceFunction,
        minStep: miniStep,
      },
      {
        name: '失败请求数',
        query:
          interfaceName && podName
            ? `sum(client_rq_interval_count{err_code!~"2.+|0",api=~"${interfaceName}",polaris_server_instance="${podName}"}) or on() vector(0)`
            : interfaceName
              ? `sum(client_rq_interval_count{err_code!~"2.+|0",api=~"${interfaceName}"}) or on() vector(0)`
              : podName
                ? `sum(client_rq_interval_count{err_code!~"2.+|0",polaris_server_instance="${podName}"}) or on() vector(0)`
                : 'sum(client_rq_interval_count{err_code!~"2.+|0"}) or on() vector(0)',
        boardFunction: SumUpReduceFunction,
        minStep: miniStep,
      },
      {
        name: '请求成功率',
        query:
          interfaceName && podName
            ? `((sum(client_rq_interval_count{err_code=~"2.+|0",api=~"${interfaceName}",polaris_server_instance="${podName}"}) / sum(client_rq_interval_count{api=~"${interfaceName}",polaris_server_instance="${podName}"})) * 100) or on() vector(0)`
            : interfaceName
              ? `((sum(client_rq_interval_count{err_code=~"2.+|0",api=~"${interfaceName}"}) / sum(client_rq_interval_count{api=~"${interfaceName}"})) * 100) or on() vector(0)`
              : podName
                ? `((sum(client_rq_interval_count{err_code=~"2.+|0",polaris_server_instance="${podName}"}) / sum(client_rq_interval_count{api=~"${interfaceName}",polaris_server_instance="${podName}"})) * 100) or on() vector(0)`
                : '((sum(client_rq_interval_count{err_code=~"2.+|0"}) / sum(client_rq_interval_count)) * 100) or on() vector(0)',
        boardFunction: LatestValueReduceFunction,
        minStep: miniStep,
        unit: '%',
        noLine: true,
      },
    ]
  },
  [MetricName.Timeout]: queryParam => {
    const { interfaceName, podName, start, end, step } = queryParam
    const interval = Math.floor(moment.duration(end - start, 's').asSeconds())
    return [
      {
        name: '均值',
        query:
          interfaceName && podName
            ? `avg(client_rq_timeout_avg{api=~"${interfaceName}",polaris_server_instance="${podName}"}) or on() vector(0)`
            : interfaceName
              ? `avg(client_rq_timeout_avg{api=~"${interfaceName}"}) or on() vector(0)`
              : podName
                ? `avg(client_rq_timeout_avg{polaris_server_instance="${podName}"}) or on() vector(0)`
                : `avg(client_rq_timeout_avg) or on() vector(0)`,
        boardFunction: AvgReduceFunction,
        unit: 'ms',
        minStep: miniStep,
        color: LineColor.Blue,
      },
      {
        name: '最大值',
        query:
          interfaceName && podName
            ? `max(client_rq_timeout_avg{api=~"${interfaceName}",polaris_server_instance="${podName}"}) or on() vector(0)`
            : interfaceName
              ? `max(client_rq_timeout_avg{api=~"${interfaceName}"}) or on() vector(0)`
              : podName
                ? `max(client_rq_timeout_avg{polaris_server_instance="${podName}"}) or on() vector(0)`
                : `max(client_rq_timeout_avg) or on() vector(0)`,
        boardFunction: MaxReduceFunction,
        unit: 'ms',
        minStep: miniStep,
        color: LineColor.Red,
      },
      {
        name: '最小值',
        query:
          interfaceName && podName
            ? `min(client_rq_timeout_avg{api=~"${interfaceName}",polaris_server_instance="${podName}"}) or on() vector(0)`
            : interfaceName
              ? `min(client_rq_timeout_avg{api=~"${interfaceName}"}) or on() vector(0)`
              : podName
                ? `min(client_rq_timeout_avg{polaris_server_instance="${podName}"}) or on() vector(0)`
                : `min(client_rq_timeout_avg) or on() vector(0)`,
        boardFunction: MinReduceFunction,
        unit: 'ms',
        minStep: miniStep,
        color: LineColor.Green,
      },
      {
        name: 'P99',
        query:
          interfaceName && podName
            ? `quantile(0.99, client_rq_timeout_avg{api=~"${interfaceName}",polaris_server_instance="${podName}"}) or on() vector(0)`
            : interfaceName
              ? `quantile(0.99, client_rq_timeout_avg{api=~"${interfaceName}"}) or on() vector(0)`
              : podName
                ? `quantile(0.99, client_rq_timeout_avg{polaris_server_instance="${podName}"}) or on() vector(0)`
                : `quantile(0.99, client_rq_timeout_avg) or on() vector(0)`,
        asyncBoardFunction: async () => {
          const res = await getMonitorData({
            start,
            end,
            step: interval,
            query:
              interfaceName && podName
                ? `quantile(0.99, client_rq_timeout_avg{api=~"${interfaceName}",polaris_server_instance="${podName}"}) or on() vector(0)`
                : interfaceName
                  ? `quantile(0.99, client_rq_timeout_avg{api=~"${interfaceName}"}) or on() vector(0)`
                  : podName
                    ? `quantile(0.99, client_rq_timeout_avg{polaris_server_instance="${podName}"}) or on() vector(0)`
                    : `quantile(0.99, client_rq_timeout_avg) or on() vector(0)`,
          })
          const point = res?.[0]?.values?.[0]
          if (!point) return '-'
          const [, value] = point
          return value
        },
        unit: 'ms',
        minStep: miniStep,
        color: LineColor.Yellow,
      },
      {
        name: 'P95',
        query:
          interfaceName && podName
            ? `quantile(0.95, client_rq_timeout_avg{api=~"${interfaceName}",polaris_server_instance="${podName}"}) or on() vector(0)`
            : interfaceName
              ? `quantile(0.95, client_rq_timeout_avg{api=~"${interfaceName}"}) or on() vector(0)`
              : podName
                ? `quantile(0.95, client_rq_timeout_avg{polaris_server_instance="${podName}"}) or on() vector(0)`
                : `quantile(0.95, client_rq_timeout_avg) or on() vector(0)`,
        asyncBoardFunction: async () => {
          const res = await getMonitorData({
            start,
            end,
            step: interval,
            query:
              interfaceName && podName
                ? `quantile(0.95, client_rq_timeout_avg{api=~"${interfaceName}",polaris_server_instance="${podName}"}) or on() vector(0)`
                : interfaceName
                  ? `quantile(0.95, client_rq_timeout_avg{api=~"${interfaceName}"}) or on() vector(0)`
                  : podName
                    ? `quantile(0.95, client_rq_timeout_avg{polaris_server_instance="${podName}"}) or on() vector(0)`
                    : `quantile(0.95, client_rq_timeout_avg) or on() vector(0)`,
          })
          const point = res?.[0]?.values?.[0]
          if (!point) return '-'
          const [, value] = point
          return value
        },
        unit: 'ms',
        minStep: miniStep,
        color: LineColor.Gray,
      },
    ]
  },
  [MetricName.Service]: queryParam => {
    const { namespace, start, end } = queryParam
    const interval = Math.floor(moment.duration(end - start, 's').asHours())
    const minStep = interval > 24 ? 10 : 1
    return [
      {
        name: '总服务数',
        minStep: minStep,
        query: namespace
          ? `max(sum(service_count{namespace="${namespace}"}) by(polaris_server_instance)) or on() vector(0)`
          : 'max(sum(service_count) by(polaris_server_instance)) or on() vector(0)',
        boardFunction: LatestValueReduceFunction,
      },
      {
        name: '在线服务数',
        minStep: minStep,
        query: namespace
          ? `max(sum(service_online_count{namespace="${namespace}"}) by(polaris_server_instance)) or on() vector(0)`
          : 'max(sum(service_online_count) by(polaris_server_instance)) or on() vector(0)',
        boardFunction: LatestValueReduceFunction,
      },
      {
        name: '异常服务数',
        minStep: minStep,
        query: namespace
          ? `max(sum(service_abnormal_count{namespace="${namespace}"}) by(polaris_server_instance)) or on() vector(0)`
          : 'max(sum(service_abnormal_count) by(polaris_server_instance)) or on() vector(0)',
        boardFunction: LatestValueReduceFunction,
      },
      {
        name: '离线服务数',
        minStep: minStep,
        query: namespace
          ? `max(sum(service_offline_count{namespace="${namespace}"}) by(polaris_server_instance)) or on() vector(0)`
          : 'max(sum(service_offline_count) by(polaris_server_instance)) or on() vector(0)',
        boardFunction: LatestValueReduceFunction,
      },
    ]
  },
  [MetricName.Instance]: queryParam => {
    const { namespace, service, start, end, step } = queryParam
    const interval = Math.floor(moment.duration(end - start, 's').asHours())
    const minStep = interval > 24 ? 10 : 1
    return [
      {
        name: '总实例数',
        minStep: minStep,
        query:
          namespace && service
            ? `max(sum(instance_count{namespace="${namespace}",service="${service}"}) by(polaris_server_instance)) or on() vector(0)`
            : namespace
              ? `max(sum(instance_count{namespace="${namespace}"}) by(polaris_server_instance)) or on() vector(0)`
              : 'max(sum(instance_count) by(polaris_server_instance)) or on() vector(0)',
        boardFunction: LatestValueReduceFunction,
      },
      {
        name: '在线实例数',
        minStep: minStep,
        query:
          namespace && service
            ? `max(sum(instance_online_count{namespace="${namespace}",service="${service}"}) by(polaris_server_instance)) or on() vector(0)`
            : namespace
              ? `max(sum(instance_online_count{namespace="${namespace}"}) by(polaris_server_instance)) or on() vector(0)`
              : 'max(sum(instance_online_count) by(polaris_server_instance)) or on() vector(0)',
        boardFunction: LatestValueReduceFunction,
      },
      {
        name: '隔离实例数',
        minStep: minStep,
        query:
          namespace && service
            ? `max(sum(instance_isolate_count{namespace="${namespace}",service="${service}"}) by(polaris_server_instance)) or on() vector(0)`
            : namespace
              ? `max(sum(instance_isolate_count{namespace="${namespace}"}) by(polaris_server_instance)) or on() vector(0)`
              : 'max(sum(instance_isolate_count) by(polaris_server_instance)) or on() vector(0)',
        boardFunction: LatestValueReduceFunction,
      },
      {
        name: '异常实例数',
        minStep: minStep,
        query:
          namespace && service
            ? `max(sum(instance_abnormal_count{namespace="${namespace}",service="${service}"}) by(polaris_server_instance)) or on() vector(0)`
            : namespace
              ? `max(sum(instance_abnormal_count{namespace="${namespace}"}) by(polaris_server_instance)) or on() vector(0)`
              : 'max(sum(instance_abnormal_count) by(polaris_server_instance)) or on() vector(0)',
        boardFunction: LatestValueReduceFunction,
      },
    ]
  },
  [MetricName.ConfigGroup]: queryParam => {
    const { namespace, start, end } = queryParam
    const interval = Math.floor(moment.duration(end - start, 's').asHours())
    const minStep = interval > 24 ? 10 : 1
    return [
      {
        name: '配置分组总数',
        minStep: minStep,
        query: namespace
          ? `max(sum(config_group_count{namespace="${namespace}"}) by(polaris_server_instance)) or on() vector(0)`
          : 'max(sum(config_group_count) by(polaris_server_instance)) or on() vector(0)',
        boardFunction: LatestValueReduceFunction,
      },
    ]
  },
  [MetricName.ConfigFile]: queryParam => {
    const { namespace, configGroup, start, end } = queryParam
    const interval = Math.floor(moment.duration(end - start, 's').asHours())
    const minStep = interval > 24 ? 10 : 1
    return [
      {
        name: '配置文件数',
        minStep: minStep,
        query:
          namespace && configGroup
            ? `max(sum(config_file_count{namespace="${namespace}",group="${configGroup}"}) by(polaris_server_instance)) or on() vector(0)`
            : namespace
              ? `max(sum(config_file_count{namespace="${namespace}"}) by(polaris_server_instance)) or on() vector(0)`
              : 'max(sum(config_file_count) by(polaris_server_instance)) or on() vector(0)',
        boardFunction: LatestValueReduceFunction,
      },
      {
        name: '已发布配置文件数',
        minStep: minStep,
        query:
          namespace && configGroup
            ? `max(sum(config_release_file_count{namespace="${namespace}",group="${configGroup}"}) by(polaris_server_instance)) or on() vector(0)`
            : namespace
              ? `max(sum(config_release_file_count{namespace="${namespace}"}) by(polaris_server_instance)) or on() vector(0)`
              : 'max(sum(config_release_file_count) by(polaris_server_instance)) or on() vector(0)',
        boardFunction: LatestValueReduceFunction,
      },
    ]
  },
  [MetricName.ErrorReq]: (queryParam = {} as any) => {
    const { interfaceName, podName } = queryParam
    return [
      {
        name: '总失败请求数',
        query:
          interfaceName && podName
            ? `sum(client_rq_interval_count{err_code!~"2.+|0",api=~"${interfaceName}",polaris_server_instance="${podName}"}) or on() vector(0)`
            : interfaceName
              ? `sum(client_rq_interval_count{err_code!~"2.+|0",api=~"${interfaceName}"}) or on() vector(0)`
              : podName
                ? `sum(client_rq_interval_count{err_code!~"2.+|0",polaris_server_instance="${podName}"}) or on() vector(0)`
                : 'sum(client_rq_interval_count{err_code!~"2.+|0"}) or on() vector(0)',
        boardFunction: SumUpReduceFunction,
        minStep: 60,
      },
      {
        name: '5xx失败请求数',
        query:
          interfaceName && podName
            ? `sum(client_rq_interval_count{err_code=~"5.+",api=~"${interfaceName}",polaris_server_instance="${podName}"}) or on() vector(0)`
            : interfaceName
              ? `sum(client_rq_interval_count{err_code=~"5.+",api=~"${interfaceName}"}) or on() vector(0)`
              : podName
                ? `sum(client_rq_interval_count{err_code=~"5.+",polaris_server_instance="${podName}"}) or on() vector(0)`
                : 'sum(client_rq_interval_count{err_code=~"5.+"}) or on() vector(0)',
        boardFunction: SumUpReduceFunction,
        minStep: 60,
      },
      {
        name: '4xx失败请求数',
        query:
          interfaceName && podName
            ? `sum(client_rq_interval_count{err_code=~"4.+",api=~"${interfaceName}",polaris_server_instance="${podName}"}) or on() vector(0)`
            : interfaceName
              ? `sum(client_rq_interval_count{err_code=~"4.+",api=~"${interfaceName}"}) or on() vector(0)`
              : podName
                ? `sum(client_rq_interval_count{err_code=~"4.+",polaris_server_instance="${podName}"}) or on() vector(0)`
                : 'sum(client_rq_interval_count{err_code=~"4.+"}) or on() vector(0)',
        boardFunction: SumUpReduceFunction,
        minStep: 60,
      },
      {
        name: '网络失败数',
        query:
          interfaceName && podName
            ? `sum(client_rq_interval_count{err_code=~"-1",api=~"${interfaceName}",polaris_server_instance="${podName}"}) or on() vector(0)`
            : interfaceName
              ? `sum(client_rq_interval_count{err_code=~"-1",api=~"${interfaceName}"}) or on() vector(0)`
              : podName
                ? `sum(client_rq_interval_count{err_code=~"-1",polaris_server_instance="${podName}"}) or on() vector(0)`
                : 'sum(client_rq_interval_count{err_code=~"-1"}) or on() vector(0)',
        boardFunction: SumUpReduceFunction,
        minStep: 60,
      },
    ]
  },
  [MetricName.RetCode]: (queryParam = {} as any) => {
    const { interfaceName, podName } = queryParam
    return [
      {
        name: '200',
        query:
          interfaceName && podName
            ? `sum(client_rq_interval_count{err_code=~"2.+|0",api=~"${interfaceName}",polaris_server_instance="${podName}"}) or on() vector(0)`
            : interfaceName
              ? `sum(client_rq_interval_count{err_code=~"2.+|0",api=~"${interfaceName}"}) or on() vector(0)`
              : podName
                ? `sum(client_rq_interval_count{err_code=~"2.+|0",polaris_server_instance="${podName}"}) or on() vector(0)`
                : 'sum(client_rq_interval_count{err_code=~"2.+|0"}) or on() vector(0)',
        boardFunction: SumUpReduceFunction,
        minStep: 60,
      },
      {
        name: '5xx',
        query:
          interfaceName && podName
            ? `sum(client_rq_interval_count{err_code=~"5.+",api=~"${interfaceName}",polaris_server_instance="${podName}"}) or on() vector(0)`
            : interfaceName
              ? `sum(client_rq_interval_count{err_code=~"5.+",api=~"${interfaceName}"}) or on() vector(0)`
              : podName
                ? `sum(client_rq_interval_count{err_code=~"5.+",polaris_server_instance="${podName}"}) or on() vector(0)`
                : 'sum(client_rq_interval_count{err_code=~"5.+"}) or on() vector(0)',
        boardFunction: SumUpReduceFunction,
        minStep: 60,
      },
      {
        name: '4xx',
        query:
          interfaceName && podName
            ? `sum(client_rq_interval_count{err_code=~"4.+",api=~"${interfaceName}",polaris_server_instance="${podName}"}) or on() vector(0)`
            : interfaceName
              ? `sum(client_rq_interval_count{err_code=~"4.+",api=~"${interfaceName}"}) or on() vector(0)`
              : podName
                ? `sum(client_rq_interval_count{err_code=~"4.+",polaris_server_instance="${podName}"}) or on() vector(0)`
                : 'sum(client_rq_interval_count{err_code=~"4.+"}) or on() vector(0)',
        boardFunction: SumUpReduceFunction,
        minStep: 60,
      },
    ]
  },
}
export enum MonitorFeature {
  Register = 'Register',
  Discovery = 'Discovery',
  HealthCheck = 'HealthCheck',
  Config = 'Config',
  OpenAPI = 'OpenAPI',
}
export const MonitorFeatureTextMap = {
  [MonitorFeature.Register]: '服务注册',
  [MonitorFeature.Discovery]: '服务发现',
  [MonitorFeature.HealthCheck]: '健康检查',
  [MonitorFeature.Config]: '配置读取',
  [MonitorFeature.OpenAPI]: 'OpenAPI',
}
export const MonitorFeatureOptions = Object.entries(MonitorFeatureTextMap).map(([key, value]) => ({
  text: value,
  value: key,
}))
export const compressNumber = n => {
  if (n < 1e3) return roundToN(n, 2)
  if (n >= 1e3 && n < 1e6) return roundToN(+(n / 1e3), 2) + 'K'
  if (n >= 1e6 && n < 1e9) return roundToN(+(n / 1e6), 2) + 'M'
  if (n >= 1e9 && n < 1e12) return roundToN(+(n / 1e9), 2) + 'B'
  if (n >= 1e12) return roundToN(+(n / 1e12), 2) + 'T'
}
export function roundToN(value, n) {
  return Math.round(value * Math.pow(10, n)) / Math.pow(10, n)
}
