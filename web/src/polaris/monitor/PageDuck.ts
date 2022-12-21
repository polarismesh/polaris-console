import Page from '@src/polaris/common/ducks/Page'
import { ComposedId } from '../service/detail/types'
import { reduceFromPayload, createToPayload } from 'saga-duck'
import { MonitorLabelKey, MetricNameMap, LabelKeyMap, MetricName } from './types'
import { takeLatest, runAndTakeLatest } from 'redux-saga-catch'

import CreateDuck from './operations/CreateDuck'
import Create from './operations/Create'
import { resolvePromise } from 'saga-duck/build/helper'
import { showDialog } from '@src/polaris/common/helpers/showDialog'
import { DynamicMonitorFetcherDuck } from './MetricFetcher'
import { DynamicLabelFetcher } from './LabelFetcher'

import { put, select } from 'redux-saga/effects'
import moment from 'moment'
import { combineVector } from './combvec'
import { Modal, notification } from 'tea-component'

export interface MonitorFilter {
  labelKey: MonitorLabelKey
  labelValue: string
}
export interface FilterConfig {
  filterTime: {
    start: number
    end: number
  }
  metricNames: string[]
  filterLabels: Record<MonitorLabelKey, string[]>
}

export interface MetricQuerySet {
  metricName: string
  monitorFilters: MonitorFilter[]
  start: number
  end: number
  step: number
  query?: string
  fetcherId?: string
}
export const MonitorConfigLocalStorageKey = 'monitor-graph-config'

export default class MonitorDuck extends Page {
  get baseUrl() {
    return '/#/monitor'
  }
  get type() {
    return 'monitor'
  }
  get titleName() {
    return '监控'
  }
  get initialFetch() {
    return false
  }
  get metricNames() {
    return Object.keys(MetricNameMap)
  }
  get monitorLabels() {
    return Object.keys(LabelKeyMap)
  }
  get params() {
    const { types } = this
    return [
      ...super.params,
      {
        key: 'filterConfig',
        type: types.SET_URL_FILTER_CONFIG,
        defaults: '',
      },
    ]
  }
  get quickTypes() {
    enum Types {
      LOAD,
      SET_METRIC_QUERY_SETS,
      ADD_GRAPH,
      REMOVE_GRAPH,
      MODIFY_GRAPH,
      SAVE_CONFIG,
      GET_MONITOR_CONFIG,
      SET_FILTER_CONFIG,
      SET_URL_FILTER_CONFIG,
      CHANGE_FILTER_CONFIG,
      FETCH_LABELS,
      SEARCH,
      SET_STEP,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      dynamicMonitorFetcher: DynamicMonitorFetcherDuck,
      dynamicLabelFetcher: DynamicLabelFetcher,
    }
  }
  get reducers() {
    const { types, monitorLabels, metricNames } = this
    return {
      ...super.reducers,
      composedId: reduceFromPayload(types.LOAD, {} as ComposedId),
      metricQuerySets: reduceFromPayload(types.SET_METRIC_QUERY_SETS, [] as MetricQuerySet[]),
      filterConfig: reduceFromPayload(types.SET_FILTER_CONFIG, {
        filterTime: {
          start: moment().subtract(1, 'h').unix(),
          end: moment().unix(),
        },
        metricNames: metricNames,
        filterLabels: monitorLabels.reduce((prev, curr) => {
          prev[curr] = []
          return prev
        }, {}),
      } as FilterConfig),
      step: reduceFromPayload(types.SET_STEP, 60),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      load: createToPayload<ComposedId>(types.LOAD),
      setMetricQuerySets: createToPayload<MetricQuerySet[]>(types.SET_METRIC_QUERY_SETS),
      createGraph: createToPayload<void>(types.ADD_GRAPH),
      modifyGraph: createToPayload<MetricQuerySet>(types.MODIFY_GRAPH),
      removeGraph: createToPayload<string>(types.REMOVE_GRAPH),
      saveConfig: createToPayload<void>(types.SAVE_CONFIG),
      changeFilterConfig: createToPayload<FilterConfig>(types.CHANGE_FILTER_CONFIG),
      search: createToPayload<void>(types.SEARCH),
      fetchLabels: createToPayload<string>(types.FETCH_LABELS),
      getFilterConfig: createToPayload<void>(types.GET_MONITOR_CONFIG),
      setStep: createToPayload<number>(types.SET_STEP),
    }
  }
  get rawSelectors() {
    type State = this['State']
    return {
      ...super.rawSelectors,
      composedId: (state: State) => state.composedId,
      metricQuerySets: (state: State) => state.metricQuerySets,
      filterConfig: (state: State) => state.filterConfig,
    }
  }

  *loadAllLabelSelect(needLoad = false) {
    const { ducks } = this
    const { dynamicLabelFetcher } = ducks
    function* getFetcher(id) {
      let fetcher = dynamicLabelFetcher.getDuck(id)
      if (!fetcher) {
        yield put(dynamicLabelFetcher.creators.createDuck(id))
        fetcher = dynamicLabelFetcher.getDuck(id)
      }
      return fetcher
    }
    for (const index in this.monitorLabels) {
      const labelKey = this.monitorLabels[index]
      const fetcher = yield* getFetcher(labelKey)
      if (needLoad) {
        yield fetcher.fetch({
          labelKey,
        })
      }
    }
  }

  *searchPreCheck() {
    const { selector } = this
    const {
      filterConfig: { filterLabels, metricNames },
    } = selector(yield select())
    const labelList =
      Object.keys(filterLabels)
        .filter((labelKey) => filterLabels[labelKey].length !== 0)
        .map((labelKey) => filterLabels[labelKey]) || []
    let queryNumber = metricNames.length
    labelList.forEach((labels) => {
      queryNumber *= labels.length
    })
    let confirmResult = false
    if (queryNumber >= 50) {
      yield Modal.confirm({
        message: '本次筛选配置将会请求大量数据',
        description: '请确认是否请求',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          confirmResult = true
        },
      })
    } else {
      return true
    }
    return confirmResult
  }

  *saga() {
    const { types, creators, ducks, selectors, selector } = this
    const { dynamicMonitorFetcher } = ducks
    const duck = this
    yield* super.saga()
    function* getFetcher(id) {
      let fetcher = dynamicMonitorFetcher.getDuck(id)
      if (!fetcher) {
        yield put(dynamicMonitorFetcher.creators.createDuck(id))
        fetcher = dynamicMonitorFetcher.getDuck(id)
      }
      return fetcher
    }
    yield runAndTakeLatest(types.READY, function* () {
      yield* duck.loadAllLabelSelect()
      yield put(creators.search())
    })
    yield takeLatest(types.SET_URL_FILTER_CONFIG, function* (action) {
      const configString = action.payload
      if (!configString) return
      const filterConfig = JSON.parse(decodeURIComponent(configString))
      yield put({ type: types.SET_FILTER_CONFIG, payload: filterConfig })
    })
    yield takeLatest(types.ADD_GRAPH, function* () {
      const metricQuerySets = selectors.metricQuerySets(yield select())
      const res = yield* resolvePromise(
        new Promise((resolve) => {
          showDialog(Create, CreateDuck, function* (duck: CreateDuck) {
            try {
              resolve(yield* duck.execute({}, { isModify: false }))
            } catch (e) {
              resolve(false)
            }
          })
        }),
      ) as any
      if (!res) return
      const { step } = selector(yield select())
      const { monitorFilters, metricName, start, end } = res
      const queryFilterString = monitorFilters.map((item) => `${item.labelKey}="${item.labelValue}"`).join(',')
      const querySumString = monitorFilters.map((item) => `${item.labelKey}`).join(',')
      const query = `sum(${metricName}{${queryFilterString}}) by(${querySumString})`
      const fetcherId = Math.floor(Math.random() * 1000).toString()
      const fetcher = yield* getFetcher(`${encodeURIComponent(query)}-${fetcherId}`)
      yield fetcher.fetch({ query, start, end, step })
      metricQuerySets.push({
        metricName,
        monitorFilters,
        start,
        end,
        step,
        query,
        fetcherId,
      })
      yield put({
        type: types.SET_METRIC_QUERY_SETS,
        payload: [...metricQuerySets],
      })
    })
    yield takeLatest(types.FETCH_LABELS, function* (action) {
      const labelKey = action.payload
      const fetcher = ducks.dynamicLabelFetcher.getDuck(labelKey)
      const {
        filterConfig: { filterTime, filterLabels, metricNames },
      } = selector(yield select())
      const labelConstraint = []
      Object.keys(filterLabels).forEach((key) => {
        if (labelKey === key) return
        if (filterLabels[key]?.length > 0) {
          labelConstraint.push(`${key}=~"${filterLabels[key].join('|')}"`)
        }
      })
      const match = metricNames.map((metricName) => `${metricName}{${labelConstraint.join(',')}}`)
      yield fetcher.fetch({
        start: filterTime.start,
        end: filterTime.end,
        labelKey,
        match,
      })
    })
    yield takeLatest(types.MODIFY_GRAPH, function* (action) {
      const querySet = action.payload
      const metricQuerySets = selectors.metricQuerySets(yield select())
      const res = yield* resolvePromise(
        new Promise((resolve) => {
          showDialog(Create, CreateDuck, function* (duck: CreateDuck) {
            try {
              resolve(
                yield* duck.execute(
                  {
                    ...querySet,
                    filterTime: { start: querySet.start, end: querySet.end },
                  },
                  { isModify: true },
                ),
              )
            } catch (e) {
              resolve(false)
            }
          })
        }),
      ) as any
      if (!res) return
      const { step } = selector(yield select())
      const { monitorFilters, metricName, start, end } = res
      const queryFilterString = monitorFilters.map((item) => `${item.labelKey}="${item.labelValue}"`).join(',')
      const querySumString = monitorFilters.map((item) => `${item.labelKey}`).join(',')
      const query = `sum(${metricName}{${queryFilterString}}) by(${querySumString}`
      const fetcher = yield* getFetcher(`${encodeURIComponent(query)}-${querySet.fetcherId}`)
      yield fetcher.fetch({ query, start, end, step })
      const prevQuerySetIndex = metricQuerySets.findIndex((item) => item.fetcherId === querySet.fetcherId)
      metricQuerySets.splice(prevQuerySetIndex, 1, {
        metricName,
        monitorFilters,
        start,
        end,
        step,
        query,
        fetcherId: querySet.fetcherId,
      })
      yield put({
        type: types.SET_METRIC_QUERY_SETS,
        payload: [...metricQuerySets],
      })
    })
    yield takeLatest(types.REMOVE_GRAPH, function* (action) {
      const removeIndex = action.payload
      const metricQuerySets = selectors.metricQuerySets(yield select())
      metricQuerySets.splice(removeIndex, 1)
      yield put(creators.setMetricQuerySets([...metricQuerySets]))
    })
    yield takeLatest(types.CHANGE_FILTER_CONFIG, function* (action) {
      const { filterConfig } = action.payload
      yield put({ type: types.SET_FILTER_CONFIG, payload: filterConfig })
    })
    yield takeLatest(types.SEARCH, function* () {
      const {
        filterConfig: { filterLabels, filterTime, metricNames },
      } = selector(yield select())
      const { start, end } = filterTime
      const { step } = selector(yield select())
      const metricQuerySets = []
      const continueSearch = yield duck.searchPreCheck()
      if (!continueSearch) return
      //求所有筛选条件以及指标的笛卡尔积
      metricNames.forEach((metricName) => {
        const labelList = Object.keys(filterLabels)
        const filteredLabelList = labelList.filter((labelKey) => filterLabels[labelKey].length !== 0) || []

        const monitorFilterList = combineVector(
          filteredLabelList.map((labelKey) =>
            filterLabels[labelKey].map((labelValue) => ({
              labelKey,
              labelValue,
            })),
          ),
        )

        let querySet = {
          metricName,
          monitorFilters: [],
          start,
          end,
          step,
          query: `sum(${metricName})`,
          fetcherId: Math.floor(Math.random() * 1000).toString(),
        }
        if (metricName === MetricName.UpstreamRqTimeout) {
          //平均时延
          querySet.query = `sum(avg(${metricName}))`
        }
        if (monitorFilterList.length === 0) {
          metricQuerySets.push(querySet)
        } else {
          monitorFilterList.forEach((monitorFilters) => {
            const queryFilterString = monitorFilters.map((item) => `${item.labelKey}="${item.labelValue}"`).join(',')
            const querySumString = monitorFilters.map((item) => `${item.labelKey}`).join(',')
            let query = `sum(${metricName}{${queryFilterString}}) by(${querySumString})`
            //平均时延
            if (metricName === MetricName.UpstreamRqTimeout) {
              query = `avg(${metricName}{${queryFilterString}})`
            }
            querySet = {
              ...querySet,
              monitorFilters,
              query,
            }
            metricQuerySets.push(querySet)
          })
        }
      })
      for (const index in metricQuerySets) {
        const metricQuerySet = metricQuerySets[index]
        const fetcher = yield* getFetcher(`${encodeURIComponent(metricQuerySet.query)}-${metricQuerySet.fetcherId}`)
        yield fetcher.fetch({ query: metricQuerySet.query, start, end, step })
      }
      yield put(creators.setMetricQuerySets(metricQuerySets))
    })
    yield takeLatest(types.SAVE_CONFIG, function* () {
      const filterConfig = selectors.filterConfig(yield select())
      window.localStorage.setItem(`${duck.type}MonitorConfigLocalStorageKey`, JSON.stringify(filterConfig))
      notification.success({ description: '已保存' })
      yield put({
        type: types.SET_FILTER_CONFIG,
        payload: filterConfig,
      })
    })
    yield takeLatest(types.GET_MONITOR_CONFIG, function* () {
      const savedConfigString = window.localStorage.getItem(`${duck.type}MonitorConfigLocalStorageKey`)
      yield put({
        type: types.SET_FILTER_CONFIG,
        payload: JSON.parse(savedConfigString),
      })
      yield duck.loadAllLabelSelect(true)
      yield put(creators.search())
      //yield put(creators.setMetricQuerySets(metricQuerySets));
    })
  }
}

export class CircuitBreakerMonitorDuck extends MonitorDuck {
  get baseUrl() {
    return '/#/flow-monitor'
  }
  get titleName() {
    return '熔断监控'
  }
  get type() {
    return 'circuit-breaker'
  }
  get metricNames() {
    return [MetricName.CircuitbreakerOpen, MetricName.CircuitbreakerHalfopen]
  }
  get monitorLabels() {
    return Object.keys(LabelKeyMap).filter(
      (labelKey) =>
        labelKey !== MonitorLabelKey.CalleeLabels &&
        labelKey !== MonitorLabelKey.RetCode &&
        labelKey !== MonitorLabelKey.CallerLabels,
    )
  }
}
export class RouteMonitorDuck extends MonitorDuck {
  get baseUrl() {
    return '/#/flow-monitor'
  }
  get titleName() {
    return '路由监控'
  }
  get type() {
    return 'route'
  }
  get metricNames() {
    return [
      MetricName.UpstreamRqTotal,
      MetricName.UpstreamRqSuccess,
      MetricName.UpstreamRqMaxTimeout,
      MetricName.UpstreamRqTimeout,
    ]
  }
  get monitorLabels() {
    return Object.keys(LabelKeyMap).filter((labelKey) => labelKey !== MonitorLabelKey.CalleeLabels)
  }
}
export class RatelimitMonitorDuck extends MonitorDuck {
  get baseUrl() {
    return '/#/flow-monitor'
  }
  get titleName() {
    return '限流监控'
  }
  get type() {
    return 'ratelimit'
  }
  get metricNames() {
    return [MetricName.RatelimitRqTotal, MetricName.RatelimitRqPass, MetricName.RatelimitRqLimit]
  }
  get monitorLabels() {
    return [MonitorLabelKey.Namespace, MonitorLabelKey.Service, MonitorLabelKey.Method, MonitorLabelKey.CalleeLabels]
  }
}

export class BusinessMonitorDuck extends MonitorDuck {
  get baseUrl() {
    return '/#/alert'
  }
  get titleName() {
    return '业务监控'
  }
  get type() {
    return 'business'
  }
  get metricNames() {
    return [MetricName.DiscoveryConnTotal, MetricName.ConfigConnTotal, MetricName.SdkClientTotal]
  }
  get monitorLabels() {
    return []
  }
}
