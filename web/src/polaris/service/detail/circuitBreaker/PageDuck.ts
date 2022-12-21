import { createToPayload, reduceFromPayload } from 'saga-duck'
import GridPageDuck, { Filter as BaseFilter } from '@src/polaris/common/ducks/GridPage'
import { RuleType } from './types'
import {
  describeServiceCircuitBreaker,
  CircuitBreaker,
  createServiceCircuitBreakerVersion,
  releaseServiceCircuitBreaker,
  createServiceCircuitBreaker,
  unbindServiceCircuitBreaker,
  deleteServiceCircuitBreaker,
} from './model'
import { takeLatest } from 'redux-saga-catch'
import { put, select, take } from 'redux-saga/effects'
import { Modal } from 'tea-component'
import { DynamicCircuitBreakerCreateDuck } from './operations/CreateDuck'
import { Service } from '../../types'

interface Filter extends BaseFilter {
  namespace: string
  service: string
  ruleType: RuleType
  circuitBreaker: CircuitBreaker
}

interface ComposedId {
  name: string
  namespace: string
}
interface DrawerStatus {
  visible: boolean
  title?: string
  createId?: string
  ruleIndex?: number
  ruleType?: string
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
      SET_RULE_TYPE,
      SET_CIRCUIT_BREAKER,
      SET_DRAWER_STATUS,
      DRAWER_SUBMIT,
      SET_EDIT_STATUS,
      LOAD,
      SET_ORIGIN_DATA,
      SUBMIT,
      RESET_DATA,
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
    return [...super.watchTypes, this.types.SEARCH, this.types.LOAD, this.types.SET_RULE_TYPE]
  }
  get params() {
    return [...super.params]
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      dynamicCreateDuck: DynamicCircuitBreakerCreateDuck,
    }
  }
  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      data: reduceFromPayload<Service>(types.LOAD, {} as Service),
      expandedKeys: reduceFromPayload<string[]>(
        types.SET_EXPANDED_KEYS,
        [...new Array(100)].map((i, index) => index.toString()),
      ),
      ruleType: reduceFromPayload<RuleType>(types.SET_RULE_TYPE, RuleType.Inbound),
      circuitBreaker: reduceFromPayload<CircuitBreaker>(types.SET_CIRCUIT_BREAKER, null),
      drawerStatus: reduceFromPayload<DrawerStatus>(types.SET_DRAWER_STATUS, {
        visible: false,
      } as any),
      edited: reduceFromPayload<boolean>(types.SET_EDIT_STATUS, false),
      originData: reduceFromPayload<CircuitBreaker>(types.SET_ORIGIN_DATA, null),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      edit: createToPayload<void>(types.EDIT),
      remove: createToPayload<number>(types.REMOVE),
      create: createToPayload<number>(types.CREATE),
      setExpandedKeys: createToPayload<string[]>(types.SET_EXPANDED_KEYS),
      load: createToPayload<ComposedId>(types.LOAD),
      setRuleType: createToPayload<RuleType>(types.SET_RULE_TYPE),
      setDrawerStatus: createToPayload<DrawerStatus>(types.SET_DRAWER_STATUS),
      drawerSubmit: createToPayload<void>(types.DRAWER_SUBMIT),
      submit: createToPayload<void>(types.SUBMIT),
      reset: createToPayload<void>(types.RESET_DATA),
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
        ruleType: state.ruleType,
        circuitBreaker: state.circuitBreaker,
      }),
    }
  }

  *saga() {
    const { types, creators, selector, ducks } = this
    yield* this.sagaInitLoad()
    yield* super.saga()
    yield takeLatest(types.CREATE, function* (action) {
      const {
        data: { name, namespace },
        circuitBreaker,
        ruleType,
      } = selector(yield select())
      const createId = Math.round(Math.random() * 1000000).toString()
      yield put(ducks.dynamicCreateDuck.creators.createDuck(createId))
      const createDuck = ducks.dynamicCreateDuck.getDuck(createId)
      const ruleIndex = action.payload
      yield put({
        type: types.SET_DRAWER_STATUS,
        payload: {
          title: '新建熔断规则',
          visible: true,
          createId,
          ruleIndex,
          ruleType,
          isEdit: false,
        },
      })
      yield take(createDuck.types.READY)
      yield put(
        createDuck.creators.load({
          values: { ...JSON.parse(JSON.stringify(circuitBreaker)) },
          service: name,
          namespace,
          ruleIndex,
          ruleType,
          isEdit: false,
        }),
      )
    })
    yield takeLatest(types.EDIT, function* (action) {
      const {
        data: { name, namespace },
        ruleType,
        circuitBreaker,
      } = selector(yield select())
      const createId = Math.round(Math.random() * 1000000).toString()
      yield put(ducks.dynamicCreateDuck.creators.createDuck(createId))
      const createDuck = ducks.dynamicCreateDuck.getDuck(createId)
      const ruleIndex = action.payload
      yield put({
        type: types.SET_DRAWER_STATUS,
        payload: {
          title: '编辑规则',
          visible: true,
          createId,
          ruleIndex,
          ruleType,
          isEdit: true,
        },
      })
      yield take(createDuck.types.READY)
      yield put(
        createDuck.creators.load({
          values: { ...JSON.parse(JSON.stringify(circuitBreaker)) },
          service: name,
          namespace,
          ruleIndex,
          ruleType,
          isEdit: true,
        }),
      )
    })
    yield takeLatest(types.REMOVE, function* (action) {
      const confirm = yield Modal.confirm({
        message: `确认删除规则`,
        description: '删除后，无法恢复',
      })
      if (confirm) {
        const removeIndex = action.payload
        const { circuitBreaker, ruleType } = selector(yield select())
        const cloneBreaker = circuitBreaker
        cloneBreaker[ruleType].splice(removeIndex, 1)
        const newRouteData = {
          ...cloneBreaker,
          [ruleType]: cloneBreaker[ruleType],
        }

        yield put({ type: types.SET_CIRCUIT_BREAKER, payload: newRouteData })
        yield put({
          type: types.SET_EDIT_STATUS,
          payload: true,
        })
        yield put(creators.reload())
      }
    })
    yield takeLatest(types.DRAWER_SUBMIT, function* () {
      const {
        drawerStatus: { createId, ruleType, ruleIndex, isEdit },
        circuitBreaker,
        data: { name, namespace },
      } = selector(yield select())
      const formValue = yield* ducks.dynamicCreateDuck.getDuck(createId).submit()
      if (!formValue) return
      const originData =
        circuitBreaker || ({ service: name, namespace, inbounds: [], outbounds: [] } as unknown as CircuitBreaker)
      if (ruleType === RuleType.Inbound) {
        let newArray
        const tempArray = [...originData.inbounds] || []
        tempArray.splice(ruleIndex, isEdit ? 1 : 0, formValue)
        newArray = tempArray
        yield put({
          type: types.SET_CIRCUIT_BREAKER,
          payload: {
            ...originData,
            inbounds: newArray,
            outbounds: originData?.outbounds || [],
          },
        })
      } else {
        let newArray
        const tempArray = [...originData?.outbounds] || []
        tempArray.splice(ruleIndex, isEdit ? 1 : 0, formValue)
        newArray = tempArray
        yield put({
          type: types.SET_CIRCUIT_BREAKER,
          payload: {
            ...originData,
            inbounds: originData?.inbounds || [],
            outbounds: newArray,
          },
        })
      }
      yield put({
        type: types.SET_DRAWER_STATUS,
        payload: {
          visible: false,
        },
      })
      yield put({
        type: types.SET_EDIT_STATUS,
        payload: true,
      })
      yield put(creators.reload())
    })
    yield takeLatest(ducks.grid.types.FETCH_DONE, function* (action) {
      const { circuitBreaker, originData } = action.payload
      yield put({ type: types.SET_CIRCUIT_BREAKER, payload: circuitBreaker })
      if (originData || originData === null) yield put({ type: types.SET_ORIGIN_DATA, payload: originData })
    })
    yield takeLatest(types.RESET_DATA, function* () {
      const { originData } = selector(yield select())
      yield put({ type: types.SET_CIRCUIT_BREAKER, payload: originData })
      yield put({
        type: types.SET_EDIT_STATUS,
        payload: false,
      })
      yield put(creators.reload())
    })
    yield takeLatest(types.SUBMIT, function* () {
      const {
        originData,
        circuitBreaker,
        data: { name: service, namespace },
      } = selector(yield select())
      const params = {
        service,
        namespace,
        inbounds: circuitBreaker.inbounds,
        outbounds: circuitBreaker.outbounds,
      }
      if (originData?.ctime) {
        if (params.inbounds.length === 0 && params.outbounds.length === 0) {
          // 如果出入都没有了，删除熔断规则
          yield unbindServiceCircuitBreaker([
            {
              service: {
                name: service,
                namespace,
              },
              circuitBreaker: {
                id: originData.id,
                name: service,
                namespace: namespace,
                version: originData.version,
              },
            },
          ])
          yield deleteServiceCircuitBreaker([
            {
              service: service,
              service_namespace: namespace,
              id: originData.id,
              name: service,
              namespace: namespace,
              version: originData.version,
            },
          ])
          yield deleteServiceCircuitBreaker([
            {
              service: service,
              service_namespace: namespace,
              id: originData.id,
              name: service,
              namespace: namespace,
              version: 'Master',
            },
          ])
        } else {
          const version = new Date().getTime().toString()
          // 只是更新熔断规则，直接创建出新的版本并直接 release
          yield createServiceCircuitBreakerVersion([{ ...params, id: originData.id, version, name: service }])
          const releaseParams = {
            service: {
              name: service,
              namespace,
            },
            circuitBreaker: {
              name: service,
              namespace,
              version,
            },
          }
          yield releaseServiceCircuitBreaker([releaseParams])
        }
      } else {
        const createResult = yield createServiceCircuitBreaker([{ ...params, owners: 'Polaris', name: service }])
        if (createResult.code === 200000) {
          const version = new Date().getTime().toString()
          yield createServiceCircuitBreakerVersion([{ ...params, id: undefined, version, name: service }])
          const releaseParams = {
            service: {
              name: service,
              namespace,
            },
            circuitBreaker: {
              name: service,
              namespace,
              version,
            },
          }
          yield releaseServiceCircuitBreaker([releaseParams])
        }
      }
      yield put({
        type: types.SET_EDIT_STATUS,
        payload: false,
      })
      yield put({
        type: types.SET_CIRCUIT_BREAKER,
        payload: null,
      })
      yield put(creators.reload())
    })
  }

  *sagaInitLoad() {}
  async getData(filters: this['Filter']) {
    const { page, count, namespace, service, ruleType } = filters
    let circuitBreaker = filters.circuitBreaker
    let originData
    if (!circuitBreaker) {
      const result = await describeServiceCircuitBreaker({
        namespace,
        service,
      })
      if (!result?.id) {
        return {
          totalCount: 0,
          list: [],
          circuitBreaker: null,
        }
      }
      circuitBreaker = result
      originData = result ? JSON.parse(JSON.stringify(result)) : null
    }
    const offset = (page - 1) * count
    const listSlice = circuitBreaker[ruleType]?.slice(offset, offset + count + 1) || []
    return {
      totalCount: circuitBreaker[ruleType]?.length || 0,
      list: listSlice.map((item, index) => ({
        ...item,
        id: (offset + index).toString(),
      })),
      circuitBreaker: circuitBreaker,
      originData: originData,
    }
  }
}
