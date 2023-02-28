import { getMonitorData } from '../models'

export enum MetricName {
  Node = 'Node',
  Connect = 'Connect',
  Request = 'Request',
  Timeout = 'Timeout',
  Service = 'Service',
  Instance = 'Instance',
  ConfigGroup = 'ConfigGroup',
  ConfigFile = 'ConfigFile',
}
const LatestValueReduceFunction = (prev, curr, index, array) => {
  const [, value] = curr
  if (index === array?.length - 1) return value
}

const SumUpReduceFunction = (prev, curr) => {
  const [, value] = curr
  return prev + Number(value)
}

const AvgReduceFunction = (prev, curr, index, array) => {
  const [, value] = curr
  if (index === array.length - 1) return (prev / array.length).toFixed(2)
  return prev + Number(value)
}

export const getQueryMap = {
  [MetricName.Node]: () => [
    {
      name: '总节点数',
      query: 'max(client_total) by (polaris_server_instance)',
      boardFunction: LatestValueReduceFunction,
      unit: '个',
    },
  ],
  [MetricName.Connect]: () => [
    {
      name: '总连接数',
      query: 'sum(sdk_client_total)',
      boardFunction: LatestValueReduceFunction,
    },
    {
      name: '注册中心连接数',
      query: 'sum(discovery_conn_total)',
      boardFunction: LatestValueReduceFunction,
    },
    {
      name: '配置中心连接数',
      query: 'sum(config_conn_total)',
      boardFunction: LatestValueReduceFunction,
    },
  ],
  [MetricName.Request]: () => [
    {
      name: '总请求数',
      query: 'sum(client_rq_interval_count)',
      boardFunction: SumUpReduceFunction,
    },
    {
      name: '成功请求数',
      query: 'sum(client_rq_interval_count{err_code=~"2.+|0"})',
      boardFunction: SumUpReduceFunction,
    },
    {
      name: '失败请求数',
      query: 'sum(client_rq_interval_count{err_code=~"4.+|0"})',
      boardFunction: SumUpReduceFunction,
    },
    {
      name: '请求成功率',
      query: 'sum(client_rq_interval_count{err_code=~"2.+|0"}) / sum(client_rq_interval_count)',
      boardFunction: (prev, curr, index, array) => {
        const [, value] = curr
        if (index === array.length - 1) return ((prev / array.length) * 100).toFixed(2)
        return prev + Number(value)
      },
      unit: '%',
    },
  ],
  [MetricName.Timeout]: () => [
    {
      name: '均值',
      query: 'client_rq_timeout_avg',
      boardFunction: AvgReduceFunction,
      unit: 'ms',
    },
    {
      name: '最大值',
      query: 'client_rq_timeout_max',
      boardFunction: AvgReduceFunction,
      unit: 'ms',
    },
    {
      name: '最小值',
      query: 'client_rq_timeout_min',
      boardFunction: AvgReduceFunction,
      unit: 'ms',
    },
    {
      name: 'P99',
      query: 'histogram_quantile(0.99, rate(client_rq_timeout[5m]))',
      asyncBoardFunction: async queryParam => {
        const res = await getMonitorData({
          ...queryParam,
          query: `histogram_quantile(0.99, sum by(le) (rate(client_rq_time_ms_bucket[60m])))`,
        })
        const point = res?.[0]?.values?.[0]
        if (!point) return '-'
        const [, value] = point
        return value
      },
      unit: 'ms',
    },
    {
      name: 'P95',
      query: 'histogram_quantile(0.95, rate(client_rq_timeout[5m]))',
      asyncBoardFunction: async queryParam => {
        const res = await getMonitorData({
          ...queryParam,
          query: `histogram_quantile(0.95, sum by(le) (rate(client_rq_time_ms_bucket[60m])))`,
        })
        const point = res?.[0]?.values?.[0]
        if (!point) return '-'
        const [, value] = point
        return value
      },
      unit: 'ms',
    },
  ],
  [MetricName.Service]: queryParam => {
    const { namespace } = queryParam
    return [
      {
        name: '总服务数',
        query: namespace
          ? `max(sum(service_count{namespace="${namespace}"}) by(polaris_server_instance))`
          : 'max(sum(service_count) by(polaris_server_instance))',
        boardFunction: LatestValueReduceFunction,
      },
      {
        name: '在线服务数',
        query: namespace
          ? `max(sum(service_online_count{namespace="${namespace}"}) by(polaris_server_instance))`
          : 'max(sum(service_online_count) by(polaris_server_instance))',
        boardFunction: LatestValueReduceFunction,
      },
      {
        name: '异常服务数',
        query: namespace
          ? `max(sum(service_abnormal_count{namespace="${namespace}"}) by(polaris_server_instance))`
          : 'max(sum(service_abnormal_count) by(polaris_server_instance))',
        boardFunction: LatestValueReduceFunction,
      },
      {
        name: '离线服务数',
        query: namespace
          ? `max(sum(service_offline_count{namespace="${namespace}"}) by(polaris_server_instance))`
          : 'max(sum(service_offline_count) by(polaris_server_instance))',
        boardFunction: LatestValueReduceFunction,
      },
    ]
  },
  [MetricName.Instance]: queryParam => {
    const { namespace, service } = queryParam
    return [
      {
        name: '总实例数',
        query:
          namespace && service
            ? `max(sum(instance_count{namespace="${namespace}",service="${service}"}) by(polaris_server_instance))`
            : namespace
            ? `max(sum(instance_count{namespace="${namespace}"}) by(polaris_server_instance))`
            : 'max(sum(instance_count) by(polaris_server_instance))',
        boardFunction: LatestValueReduceFunction,
      },
      {
        name: '在线实例数',
        query:
          namespace && service
            ? `max(sum(instance_online_count{namespace="${namespace}",service="${service}"}) by(polaris_server_instance))`
            : namespace
            ? `max(sum(instance_online_count{namespace="${namespace}"}) by(polaris_server_instance))`
            : 'max(sum(instance_online_count) by(polaris_server_instance))',
        boardFunction: LatestValueReduceFunction,
      },
      {
        name: '隔离实例数',
        query:
          namespace && service
            ? `max(sum(instance_isolate_count{namespace="${namespace}",service="${service}"}) by(polaris_server_instance))`
            : namespace
            ? `max(sum(instance_isolate_count{namespace="${namespace}"}) by(polaris_server_instance))`
            : 'max(sum(instance_isolate_count) by(polaris_server_instance))',
        boardFunction: LatestValueReduceFunction,
      },
      {
        name: '异常实例数',
        query:
          namespace && service
            ? `max(sum(instance_abnormal_count{namespace="${namespace}",service="${service}"}) by(polaris_server_instance))`
            : namespace
            ? `max(sum(instance_abnormal_count{namespace="${namespace}"}) by(polaris_server_instance))`
            : 'max(sum(instance_abnormal_count) by(polaris_server_instance))',
        boardFunction: LatestValueReduceFunction,
      },
    ]
  },
  [MetricName.ConfigGroup]: queryParam => {
    const { namespace } = queryParam
    return [
      {
        name: '配置分组总数',
        query: namespace
          ? `max(sum(config_group_count{namespace="${namespace}"}) by(polaris_server_instance))`
          : 'max(sum(config_group_count) by(polaris_server_instance))',
        boardFunction: LatestValueReduceFunction,
      },
    ]
  },
  [MetricName.ConfigFile]: queryParam => {
    const { namespace, configGroup } = queryParam
    return [
      {
        name: '配置文件数',
        query:
          namespace && configGroup
            ? `max(sum(config_file_count{namespace="${namespace}",group="${configGroup}"}) by(polaris_server_instance))`
            : namespace
            ? `max(sum(config_file_count{namespace="${namespace}"}) by(polaris_server_instance))`
            : 'max(sum(config_file_count) by(polaris_server_instance))',
        boardFunction: LatestValueReduceFunction,
      },
      {
        name: '已发布配置文件数',
        query:
          namespace && configGroup
            ? `max(sum(config_release_file_count{namespace="${namespace}",group="${configGroup}"}) by(polaris_server_instance))`
            : namespace
            ? `max(sum(config_release_file_count{namespace="${namespace}"}) by(polaris_server_instance))`
            : 'max(sum(config_release_file_count) by(polaris_server_instance))',
        boardFunction: LatestValueReduceFunction,
      },
    ]
  },
}
