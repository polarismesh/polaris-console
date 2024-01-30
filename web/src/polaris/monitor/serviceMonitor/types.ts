import moment from 'moment'
import { getMonitorData } from '../models'
import { SumUpReduceFunction, AvgReduceFunction, MaxReduceFunction, MinReduceFunction } from '../types'

export enum MetricName {
  Request = 'Request',
  Timeout = 'Timeout',
  SuccessRate = 'SuccessRate',
  RetCodeDistribute = 'RetCodeDistribute',
  RetCode = 'RetCode',
}
export enum LineColor {
  Blue = '#006EFF',
  Green = '#0ABF5B',
  Red = '#E54545',
  Yellow = '#FF7200',
  Gray = '#6E829D',
}

export const DefaultLineColors = Object.values(LineColor)

const miniStep = 10;

export const getQueryMap = {
  [MetricName.Request]: (queryParam = {} as any) => {
    const { calleeNamespace, calleeService, calleeMethod, calleeInstance } = queryParam
    const conditionSets = {
      CalleeNamespace: calleeNamespace ? `callee_namespace="${calleeNamespace}"` : '',
      CalleeService: calleeService ? `callee_service="${calleeService}"` : '',
      CalleeMethod: calleeMethod ? `callee_method="${calleeMethod}"` : '',
      CalleeInstance: calleeInstance ? `callee_instance="${calleeInstance}"` : '',
    }
    const conditions = Object.entries(conditionSets)
      .filter(([, value]) => !!value)
      .map(([, value]) => value)
    const conditionString = conditions.join(',')
    return [
      {
        name: '总请求数',
        query: conditions.length
          ? `sum(upstream_rq_total{${conditionString}}) or on() vector(0)`
          : 'sum(upstream_rq_total) or on() vector(0)',
        boardFunction: SumUpReduceFunction,
        minStep: miniStep,
      },
      {
        name: '成功请求数',
        query: conditions.length
          ? `sum(upstream_rq_total{callee_result="success",${conditionString}}) or on() vector(0)`
          : 'sum(upstream_rq_total{callee_result="success"}) or on() vector(0)',
        boardFunction: SumUpReduceFunction,
        minStep: miniStep,
      },
      {
        name: '限流请求数',
        query: conditions.length
          ? `sum(upstream_rq_total{callee_result="flow_control",${conditionString}}) or on() vector(0)`
          : 'sum(upstream_rq_total{callee_result="flow_control"}) or on() vector(0)',
        boardFunction: SumUpReduceFunction,
        minStep: miniStep,
      },
      {
        name: '熔断请求数',
        query: conditions.length
          ? `sum(upstream_rq_total{callee_result="reject",${conditionString}}) or on() vector(0)`
          : 'sum(upstream_rq_total{callee_result="reject"}) or on() vector(0)',
        boardFunction: SumUpReduceFunction,
        minStep: miniStep,
      },
    ]
  },
  [MetricName.Timeout]: queryParam => {
    const { calleeNamespace, calleeService, calleeMethod, calleeInstance, start, end } = queryParam
    const conditionSets = {
      CalleeNamespace: calleeNamespace ? `callee_namespace="${calleeNamespace}"` : '',
      CalleeService: calleeService ? `callee_service="${calleeService}"` : '',
      CalleeMethod: calleeMethod ? `callee_method="${calleeMethod}"` : '',
      CalleeInstance: calleeInstance ? `callee_instance="${calleeInstance}"` : '',
    }
    const conditions = Object.entries(conditionSets)
      .filter(([, value]) => !!value)
      .map(([, value]) => value)
    const conditionString = conditions.join(',')
    const interval = Math.floor(moment.duration(end - start, 's').asSeconds())

    return [
      {
        name: '均值',
        query: conditions.length
          ? `avg(upstream_rq_timeout{${conditionString}}) or on() vector(0)`
          : 'avg(upstream_rq_timeout) or on() vector(0)',
        boardFunction: AvgReduceFunction,
        unit: 'ms',
        minStep: miniStep,
        color: LineColor.Blue,
      },
      {
        name: '最大值',
        query: conditions.length
          ? `max(upstream_rq_max_timeout{${conditionString}}) or on() vector(0)`
          : 'max(upstream_rq_max_timeout) or on() vector(0)',
        boardFunction: MaxReduceFunction,
        unit: 'ms',
        minStep: miniStep,
        color: LineColor.Red,
      },
      {
        name: '最小值',
        query: conditions.length
          ? `min(upstream_rq_timeout{${conditionString}}) or on() vector(0)`
          : 'min(upstream_rq_timeout) or on() vector(0)',
        boardFunction: MinReduceFunction,
        unit: 'ms',
        minStep: miniStep,
        color: LineColor.Green,
      },
      {
        name: 'P99',
        query: conditions.length
          ? `quantile(0.99, upstream_rq_timeout{${conditionString}}) or on() vector(0)`
          : `quantile(0.99, upstream_rq_timeout) or on() vector(0)`,
        asyncBoardFunction: async () => {
          const res = await getMonitorData({
            start,
            end,
            step: interval,
            query: conditions.length
              ? `quantile(0.99, upstream_rq_timeout{${conditionString}}) or on() vector(0)`
              : `quantile(0.99, upstream_rq_timeout) or on() vector(0)`,
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
        query: conditions.length
          ? `quantile(0.95, upstream_rq_timeout{${conditionString}}) or on() vector(0)`
          : `quantile(0.95, upstream_rq_timeout) or on() vector(0)`,
        asyncBoardFunction: async () => {
          const res = await getMonitorData({
            start,
            end,
            step: interval,
            query: conditions.length
              ? `quantile(0.95, upstream_rq_timeout{${conditionString}}) or on() vector(0)`
              : `quantile(0.95, upstream_rq_timeout) or on() vector(0)`,
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
  [MetricName.RetCode]: queryParam => {
    const {
      calleeNamespace,
      calleeService,
      calleeInstance,
      callerIp,
      callerNamespace,
      callerService,
      calleeResult,
    } = queryParam
    const conditionSets = {
      CalleeNamespace: calleeNamespace ? `callee_namespace="${calleeNamespace}"` : '',
      CalleeService: calleeService ? `callee_service="${calleeService}"` : '',
      CalleeInstance: calleeInstance ? `callee_instance="${calleeInstance}"` : '',
      CallerIp: callerIp ? `caller_ip="${callerIp}"` : '',
      CallerNamespace: callerNamespace ? `caller_namespace="${callerNamespace}"` : '',
      CallerService: callerService ? `caller_service="${callerService}"` : '',
      CalleeResult: calleeResult ? `callee_result=~"${calleeResult}"` : '',
    }
    const conditions = Object.entries(conditionSets)
      .filter(([, value]) => !!value)
      .map(([, value]) => value)
    const conditionString = conditions.join(',')

    return [
      {
        name: '错误码统计',
        query: `sum by (callee_result_code) (upstream_rq_total{${conditionString}})`,
        minStep: miniStep,
        multiMetricName: 'callee_result_code',
        multiValue: true,
      },
    ]
  },
}
export const getPieQueryMap = {
  [MetricName.SuccessRate]: (queryParam = {} as any) => {
    const { calleeNamespace } = queryParam
    const conditionSets = {
      CalleeNamespace: calleeNamespace ? `callee_namespace="${calleeNamespace}"` : '',
    }
    const conditions = Object.entries(conditionSets)
      .filter(([, value]) => !!value)
      .map(([, value]) => value)
    const conditionString = conditions.join(',')
    return [
      {
        name: '成功率：100%',
        query: conditions.length
          ? `sum(upstream_rq_total{callee_result="success",${conditionString}}) by (callee_namespace, callee_service) 
          / sum(upstream_rq_total{${conditionString}}) by (callee_namespace, callee_service) == 1`
          : `sum(upstream_rq_total{callee_result="success"}) by (callee_namespace, callee_service) 
          / sum(upstream_rq_total) by (callee_namespace, callee_service) == 1`,
        unit: '个服务',
        labelName: '100%',
      },
      {
        name: '成功率：90% ～ 100%',
        query: conditions.length
          ? `sum(upstream_rq_total{callee_result="success",${conditionString}}) by (callee_namespace, callee_service) 
          / sum(upstream_rq_total{${conditionString}}) by (callee_namespace, callee_service) <1 >=0.9`
          : `sum(upstream_rq_total{callee_result="success"}) by (callee_namespace, callee_service) 
          / sum(upstream_rq_total) by (callee_namespace, callee_service) <1 >=0.9`,
        unit: '个服务',
        labelName: '90-100%',
      },
      {
        name: '成功率：75% ～ 90%',
        query: conditions.length
          ? `sum(upstream_rq_total{callee_result="success",${conditionString}}) by (callee_namespace, callee_service) 
          / sum(upstream_rq_total{${conditionString}}) by (callee_namespace, callee_service) < 0.9 >= 0.75`
          : `sum(upstream_rq_total{callee_result="success"}) by (callee_namespace, callee_service) 
          / sum(upstream_rq_total) by (callee_namespace, callee_service) < 0.9 >= 0.75`,
        unit: '个服务',
        labelName: '75-90%',
      },
      {
        name: '成功率：50% ～ 75%',
        query: conditions.length
          ? `sum(upstream_rq_total{callee_result="success",${conditionString}}) by (callee_namespace, callee_service) 
          / sum(upstream_rq_total{${conditionString}}) by (callee_namespace, callee_service) < 0.75 >= 0.5`
          : `sum(upstream_rq_total{callee_result="success"}) by (callee_namespace, callee_service) 
          / sum(upstream_rq_total) by (callee_namespace, callee_service) < 0.75 >= 0.5`,
        unit: '个服务',
        labelName: '50-75%',
      },
      {
        name: '成功率：< 50%',
        query: conditions.length
          ? `sum(upstream_rq_total{callee_result="success",${conditionString}}) by (callee_namespace, callee_service) 
          / sum(upstream_rq_total{${conditionString}}) by (callee_namespace, callee_service) < 0.5`
          : `sum(upstream_rq_total{callee_result="success"}) by (callee_namespace, callee_service) 
          / sum(upstream_rq_total) by (callee_namespace, callee_service) < 0.5`,
        unit: '个服务',
        labelName: '<50%',
      },
    ]
  },
  [MetricName.Timeout]: (queryParam = {} as any) => {
    const { calleeNamespace } = queryParam
    const conditionSets = {
      CalleeNamespace: calleeNamespace ? `callee_namespace="${calleeNamespace}"` : '',
    }
    const conditions = Object.entries(conditionSets)
      .filter(([, value]) => !!value)
      .map(([, value]) => value)
    const conditionString = conditions.join(',')
    return [
      {
        name: 'P99时延：< 5ms',
        query: conditions.length
          ? `quantile(0.99, upstream_rq_timeout{${conditionString}}) by (callee_namespace, callee_service) <= 5`
          : `quantile(0.99, upstream_rq_timeout) by (callee_namespace, callee_service) <= 5`,
        unit: '个服务',
        labelName: '<5ms',
      },
      {
        name: 'P99时延：5ms ~ 10ms',
        query: conditions.length
          ? `quantile(0.99, upstream_rq_timeout{${conditionString}}) by (callee_namespace, callee_service) <= 10 > 5`
          : `quantile(0.99, upstream_rq_timeout) by (callee_namespace, callee_service) <= 10 > 5`,
        unit: '个服务',
        labelName: '5-10ms',
      },
      {
        name: 'P99时延：10ms ~ 50ms',
        query: conditions.length
          ? `quantile(0.99, upstream_rq_timeout{${conditionString}}) by (callee_namespace, callee_service) <= 50 > 10`
          : `quantile(0.99, upstream_rq_timeout) by (callee_namespace, callee_service) <= 50 > 10`,
        unit: '个服务',
        labelName: '10-50ms',
      },
      {
        name: 'P99时延：50ms ~ 100ms',
        query: conditions.length
          ? `quantile(0.99, upstream_rq_timeout{${conditionString}}) by (callee_namespace, callee_service) <= 100 > 50`
          : `quantile(0.99, upstream_rq_timeout) by (callee_namespace, callee_service) <= 100 > 50`,
        unit: '个服务',
        labelName: '50-100ms',
      },
      {
        name: 'P99时延：> 100ms',
        query: conditions.length
          ? `quantile(0.99, upstream_rq_timeout{${conditionString}}) by (callee_namespace, callee_service) > 100`
          : `quantile(0.99, upstream_rq_timeout) by (callee_namespace, callee_service) > 100`,
        unit: '个服务',
        labelName: '>100ms',
      },
    ]
  },
}
export const getTableQueryMap = {
  [MetricName.RetCodeDistribute]: (queryParam = {} as any) => {
    const { calleeNamespace, calleeService, calleeMethod, calleeInstance } = queryParam
    const conditionSets = {
      CalleeNamespace: calleeNamespace ? `callee_namespace="${calleeNamespace}"` : '',
      CalleeService: calleeService ? `callee_service="${calleeService}"` : '',
      CalleeMethod: calleeMethod ? `callee_method="${calleeMethod}"` : '',
      CalleeInstance: calleeInstance ? `callee_instance="${calleeInstance}"` : '',
    }
    const conditions = Object.entries(conditionSets)
      .filter(([, value]) => !!value)
      .map(([, value]) => value)
    const conditionString = conditions.join(',')
    return [
      {
        name: '返回码统计',
        query: conditions.length
          ? `sort_desc(sum by (callee_result_code) (upstream_rq_total{${conditionString}}))`
          : 'sort_desc(sum by (callee_result_code) (upstream_rq_total))',
        minStep: miniStep,
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
  return Math.floor(value * Math.pow(10, n)) / Math.pow(10, n)
}
