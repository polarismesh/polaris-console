import { createToPayload, reduceFromPayload } from 'saga-duck'
import GridPageDuck, { Filter as BaseFilter } from '@src/polaris/common/ducks/GridPage'
import { describeLimitRules, LimitRange, RateLimit, deleteRateLimit, modifyRateLimit } from './model'
import { takeLatest } from 'redux-saga-catch'
// import Create from "./operations/Create";
// import CreateDuck from "./operations/CreateDuck";
import { put, select, take } from 'redux-saga/effects'
import { Modal } from 'tea-component'
import { DynamicRateLimitCreateDuck } from './operations/CreateDuck'
import { Service } from '../../types'

interface Filter extends BaseFilter {
  namespace: string
  service: string
  limitRange: LimitRange
  editable: boolean
}

interface ComposedId {
  name: string
  namespace: string
}

interface DrawerStatus {
  visible: boolean
  title?: string
  createId?: string
  ruleId?: string
  isEdit?: boolean
}
export default class ServicePageDuck extends GridPageDuck {
  Filter: Filter
  Item: any
  get baseUrl() {
    return null
  }
  get quickTypes() {
    enum Types {
      SET_CUSTOM_FILTERS,
      EDIT,
      REMOVE,
      CREATE,
      SET_SELECTION,
      SET_EXPANDED_KEYS,
      SET_LIMIT_RANGE,
      SET_ROUTE_DATA,
      TOGGLE_STATUS,
      SET_DRAWER_STATUS,
      DRAWER_SUBMIT,
      LOAD,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get initialFetch() {
    return false
  }
  get recordKey() {
    return 'id'
  }
  get watchTypes() {
    return [...super.watchTypes, this.types.SEARCH, this.types.LOAD, this.types.SET_LIMIT_RANGE]
  }
  get params() {
    return [...super.params]
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      dynamicCreateDuck: DynamicRateLimitCreateDuck,
    }
  }
  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      data: reduceFromPayload<Service>(types.LOAD, {} as Service),
      expandedKeys: reduceFromPayload<string[]>(types.SET_EXPANDED_KEYS, []),
      limitRange: reduceFromPayload<LimitRange>(types.SET_LIMIT_RANGE, LimitRange.LOCAL),
      selection: reduceFromPayload<string[]>(types.SET_SELECTION, []),
      drawerStatus: reduceFromPayload<DrawerStatus>(types.SET_DRAWER_STATUS, {
        visible: false,
      } as any),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      edit: createToPayload<RateLimit>(types.EDIT),
      remove: createToPayload<string[]>(types.REMOVE),
      create: createToPayload<void>(types.CREATE),
      setExpandedKeys: createToPayload<string[]>(types.SET_EXPANDED_KEYS),
      setSelection: createToPayload<string[]>(types.SET_SELECTION),
      load: createToPayload<ComposedId>(types.LOAD),
      setLimitRange: createToPayload<LimitRange>(types.SET_LIMIT_RANGE),
      toggleStatus: createToPayload<RateLimit>(types.TOGGLE_STATUS),
      setDrawerStatus: createToPayload<DrawerStatus>(types.SET_DRAWER_STATUS),
      drawerSubmit: createToPayload<void>(types.DRAWER_SUBMIT),
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
        service: state.data.name,
        namespace: state.data.namespace,
        limitRange: state.limitRange,
        editable: state.data.editable,
      }),
    }
  }

  *saga() {
    const { types, creators, selector, ducks } = this
    yield* this.sagaInitLoad()
    yield* super.saga()
    yield takeLatest(types.CREATE, function*() {
      const {
        data: { name, namespace },
      } = selector(yield select())
      const createId = Math.round(Math.random() * 1000000).toString()
      yield put(ducks.dynamicCreateDuck.creators.createDuck(createId))
      const createDuck = ducks.dynamicCreateDuck.getDuck(createId)
      yield put({
        type: types.SET_DRAWER_STATUS,
        payload: {
          title: '新建路由规则',
          visible: true,
          createId,
          isEdit: false,
        },
      })
      yield take(createDuck.types.READY)
      yield put(
        createDuck.creators.load({
          service: name,
          namespace,
          isEdit: false,
        }),
      )
    })
    yield takeLatest(ducks.grid.types.FETCH_DONE, function*(action) {
      const { list } = action.payload
      const expandedKeys = list.map(item => item.id)
      yield put(creators.setExpandedKeys(expandedKeys))
    })
    yield takeLatest(types.EDIT, function*(action) {
      const {
        data: { name, namespace },
      } = selector(yield select())
      const rule = action.payload
      const createId = Math.round(Math.random() * 1000000).toString()
      yield put(ducks.dynamicCreateDuck.creators.createDuck(createId))
      const createDuck = ducks.dynamicCreateDuck.getDuck(createId)
      yield put({
        type: types.SET_DRAWER_STATUS,
        payload: {
          title: '编辑路由规则',
          visible: true,
          createId,
          rule,
          isEdit: true,
        },
      })
      yield take(createDuck.types.READY)
      yield put(
        createDuck.creators.load({
          rule: { ...JSON.parse(JSON.stringify(rule)) },
          service: name,
          namespace,
          isEdit: true,
        }),
      )
    })
    yield takeLatest(types.DRAWER_SUBMIT, function*() {
      const {
        drawerStatus: { createId },
      } = selector(yield select())
      const formValue = yield* ducks.dynamicCreateDuck.getDuck(createId).submit()
      if (!formValue) return
      yield put({
        type: types.SET_DRAWER_STATUS,
        payload: {
          visible: false,
        },
      })
      yield put(creators.reload())
    })
    yield takeLatest(types.REMOVE, function*(action) {
      const deleteList = action.payload

      const confirm = yield Modal.confirm({
        message: `确认删除限流规则`,
        description: '删除后，无法恢复',
      })
      if (confirm) {
        yield deleteRateLimit(deleteList.map(id => ({ id })))
        yield put(creators.reload())
      }
    })
    yield takeLatest(types.TOGGLE_STATUS, function*(action) {
      const item = action.payload
      const param = {
        ...item,
        disable: !item.disable,
        ctime: undefined,
        mtime: undefined,
        revision: undefined,
      }

      yield modifyRateLimit([param])
      yield put(creators.reload())
    })
  }

  *sagaInitLoad() {}
  async getData(filters: this['Filter']) {
    const { page, count, namespace, service, editable } = filters
    const result = await describeLimitRules({
      namespace,
      service,
      offset: (page - 1) * count,
      limit: count,
    })
    result.list = result.list.map(item => ({
      ...item,
      //太怪了，这里如果没有disable字段，代表是启用状态，我晕了
      disable: item.disable === true ? true : false,
      editable,
    }))
    return result
  }
}
