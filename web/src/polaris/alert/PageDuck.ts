import { createToPayload, reduceFromPayload } from 'saga-duck'
import { takeLatest } from 'redux-saga-catch'
import Create from './operation/Create'
import CreateDuck from './operation/CreateDuck'
import { put } from 'redux-saga/effects'
import GridPageDuck, { Filter as BaseFilter } from '../common/ducks/GridPage'
import { resolvePromise } from 'saga-duck/build/helper'
import { showDialog } from '../common/helpers/showDialog'
import { deleteAlertRule, describeAlertRules, fetchClsInfo, toggleAlertRule } from './model'
import { AlertInfo, MetricNameMap } from './types'
import { Modal, notification } from 'tea-component'
import { BusinessMonitorDuck } from '../monitor/PageDuck'

export default class AlertPageDuck extends GridPageDuck {
  Filter: BaseFilter
  Item: AlertInfo
  get baseUrl() {
    return ''
  }
  get quickTypes() {
    enum Types {
      EDIT,
      REMOVE,
      CREATE,
      SET_METRICNAME_MAP,
      TOGGLE_RULE,
      SET_CLS_INFO,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get initialFetch() {
    return true
  }
  get recordKey() {
    return 'id'
  }
  get watchTypes() {
    return [...super.watchTypes, this.types.SEARCH]
  }
  get params() {
    return [...super.params]
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      business: BusinessMonitorDuck,
    }
  }
  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      metricsNameMap: reduceFromPayload(types.SET_METRICNAME_MAP, {}),
      clsInfo: reduceFromPayload(types.SET_CLS_INFO, {} as any),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      edit: createToPayload<AlertInfo>(types.EDIT),
      remove: createToPayload<AlertInfo>(types.REMOVE),
      create: createToPayload<void>(types.CREATE),
      toggle: createToPayload<AlertInfo>(types.TOGGLE_RULE),
    }
  }
  get rawSelectors() {
    type State = this['State']
    return {
      ...super.rawSelectors,
      filter: (state: State) => ({
        page: state.page,
        count: state.count,
        keyword: state.keyword,
      }),
    }
  }

  *saga() {
    const { types, creators } = this
    yield* super.saga()
    yield put({
      type: types.SET_METRICNAME_MAP,
      payload: MetricNameMap,
    })
    const { data: clsInfo } = yield fetchClsInfo({})
    yield put({ type: types.SET_CLS_INFO, payload: clsInfo })
    yield takeLatest(types.CREATE, function* () {
      const res = yield* resolvePromise(
        new Promise((resolve) => {
          showDialog(Create, CreateDuck, function* (duck: CreateDuck) {
            try {
              resolve(yield* duck.execute({}, { isModify: false, data: {} as any }))
            } finally {
              resolve(false)
            }
          })
        }),
      )
      if (res) {
        yield put(creators.reload())
      }
    })
    yield takeLatest(types.EDIT, function* (action) {
      const data = action.payload
      const res = yield* resolvePromise(
        new Promise((resolve) => {
          showDialog(Create, CreateDuck, function* (duck: CreateDuck) {
            try {
              resolve(yield* duck.execute(data, { isModify: true, data: action.payload }))
            } finally {
              resolve(false)
            }
          })
        }),
      )
      if (res) {
        yield put(creators.reload())
      }
    })
    yield takeLatest(types.TOGGLE_RULE, function* (action) {
      const data = action.payload as AlertInfo
      const res = yield toggleAlertRule([{ id: data.id, enable: !data.enable }])
      if (res) notification.success({ description: '操作成功' })
      yield put(creators.reload())
    })
    yield takeLatest(types.REMOVE, function* (action) {
      const { id } = action.payload
      const confirm = yield Modal.confirm({
        message: `确认删除告警策略`,
        description: '删除后，无法恢复',
        okText: '删除',
      })
      if (confirm) {
        const res = yield deleteAlertRule([{ id }])
        if (res) notification.success({ description: '删除成功' })
        yield put(creators.reload())
      }
    })
  }

  async getData(filters: this['Filter']) {
    const { page, count, keyword } = filters
    const result = await describeAlertRules({
      limit: count,
      offset: (page - 1) * count,
      name: keyword || undefined,
    })
    return {
      totalCount: result.amount,
      list:
        result.data?.map((item) => ({
          ...item,
        })) || [],
    }
  }
}
