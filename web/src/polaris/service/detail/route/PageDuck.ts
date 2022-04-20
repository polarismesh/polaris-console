import { createToPayload, reduceFromPayload } from 'saga-duck'
import GridPageDuck, { Filter as BaseFilter } from '@src/polaris/common/ducks/GridPage'
import { RuleType, EditType } from './types'
import { describeRoutes, Routing, modifyRoutes, createRoutes, deleteRoutes } from './model'
import { takeLatest } from 'redux-saga-catch'
import { DynamicRouteCreateDuck } from './operations/CreateDuck'
import { put, select, take } from 'redux-saga/effects'
import { Modal } from 'tea-component'
import { Service } from '../../types'

interface Filter extends BaseFilter {
  namespace: string
  service: string
  ruleType: RuleType
  routeData: Routing
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
      SET_ROUTE_DATA,
      LOAD,
      SET_DRAWER_STATUS,
      DRAWER_SUBMIT,
      SUBMIT,
      SET_EDIT_STATUS,
      SET_ORIGIN_DATA,
      SET_EDIT_TYPE,
      SET_JSON_VALUE,
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
      dynamicCreateDuck: DynamicRouteCreateDuck,
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
      routeData: reduceFromPayload<Routing>(types.SET_ROUTE_DATA, null),
      drawerStatus: reduceFromPayload<DrawerStatus>(types.SET_DRAWER_STATUS, {
        visible: false,
      } as any),
      edited: reduceFromPayload<boolean>(types.SET_EDIT_STATUS, false),
      originData: reduceFromPayload<Routing>(types.SET_ORIGIN_DATA, null),
      editType: reduceFromPayload<EditType>(types.SET_EDIT_TYPE, EditType.Table),
      jsonValue: reduceFromPayload<string>(types.SET_JSON_VALUE, ''),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      edit: createToPayload<void>(types.EDIT),
      remove: createToPayload<number>(types.REMOVE),
      create: createToPayload<number>(types.CREATE),
      drawerSubmit: createToPayload<void>(types.DRAWER_SUBMIT),
      setExpandedKeys: createToPayload<string[]>(types.SET_EXPANDED_KEYS),
      load: createToPayload<ComposedId>(types.LOAD),
      setRuleType: createToPayload<RuleType>(types.SET_RULE_TYPE),
      setDrawerStatus: createToPayload<DrawerStatus>(types.SET_DRAWER_STATUS),
      submit: createToPayload<void>(types.SUBMIT),
      setEditType: createToPayload<EditType>(types.SET_EDIT_TYPE),
      setJsonValue: createToPayload<string>(types.SET_JSON_VALUE),
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
        routeData: state.routeData,
      }),
    }
  }

  *saga() {
    const { types, creators, selector, ducks } = this
    yield* this.sagaInitLoad()
    yield* super.saga()
    yield takeLatest(types.CREATE, function*(action) {
      const {
        data: { name, namespace },
        routeData,
        ruleType,
      } = selector(yield select())
      const createId = Math.round(Math.random() * 1000000).toString()
      yield put(ducks.dynamicCreateDuck.creators.createDuck(createId))
      const createDuck = ducks.dynamicCreateDuck.getDuck(createId)
      const ruleIndex = action.payload
      yield put({
        type: types.SET_DRAWER_STATUS,
        payload: {
          title: '新建路由规则',
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
          ...JSON.parse(JSON.stringify(routeData)),
          service: name,
          namespace,
          ruleIndex,
          ruleType,
          isEdit: false,
        }),
      )
    })
    yield takeLatest(types.EDIT, function*(action) {
      const {
        data: { name, namespace },
        ruleType,
        routeData,
      } = selector(yield select())
      const createId = Math.round(Math.random() * 1000000).toString()
      yield put(ducks.dynamicCreateDuck.creators.createDuck(createId))
      const createDuck = ducks.dynamicCreateDuck.getDuck(createId)
      const ruleIndex = action.payload
      yield put({
        type: types.SET_DRAWER_STATUS,
        payload: {
          title: '编辑路由规则',
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
          ...JSON.parse(JSON.stringify(routeData)),
          service: name,
          namespace,
          ruleIndex,
          ruleType,
          isEdit: true,
        }),
      )
    })
    // yield takeLatest(types.REMOVE, function* (action) {
    //   const ids = action.payload;
    //   const confirm = yield Modal.confirm({
    //     message: `确认删除实例`,
    //     description: "删除后，无法恢复",
    //   });
    //   if (confirm) {
    //     const res = yield deleteInstances(ids.map((id) => ({ id })));
    //   }
    //   yield put(creators.reload());
    // });
    yield takeLatest(ducks.grid.types.FETCH_DONE, function*(action) {
      const { routeData, originData } = action.payload
      yield put({ type: types.SET_ROUTE_DATA, payload: routeData })
      yield put({ type: types.SET_ORIGIN_DATA, payload: originData })
    })
    yield takeLatest(types.RESET_DATA, function*() {
      const { originData } = selector(yield select())
      yield put({ type: types.SET_ROUTE_DATA, payload: originData })
      yield put({
        type: types.SET_EDIT_STATUS,
        payload: false,
      })
      yield put(creators.reload())
    })
    yield takeLatest(types.SUBMIT, function*() {
      const {
        originData,
        routeData,
        data: { name, namespace },
      } = selector(yield select())
      if (originData?.ctime) {
        if (routeData.inbounds.length === 0 && routeData.outbounds.length === 0) {
          yield deleteRoutes([{ service: name, namespace }])
        } else {
          yield modifyRoutes([routeData])
        }
      } else {
        yield createRoutes([routeData])
      }
      yield put({
        type: types.SET_EDIT_STATUS,
        payload: false,
      })
      yield put({
        type: types.SET_ROUTE_DATA,
        payload: null,
      })
      yield put(creators.reload())
    })
    yield takeLatest(types.DRAWER_SUBMIT, function*() {
      const {
        drawerStatus: { createId, ruleType, ruleIndex, isEdit },
        routeData,
        data: { name, namespace },
      } = selector(yield select())
      const formValue = yield* ducks.dynamicCreateDuck.getDuck(createId).submit()
      if (!formValue) return
      const originData = routeData || ({ service: name, namespace, inbounds: [], outbounds: [] } as Routing)
      if (ruleType === RuleType.Inbound) {
        let newArray
        const tempArray = [...originData.inbounds] || []
        tempArray.splice(ruleIndex, isEdit ? 1 : 0, formValue)
        newArray = tempArray
        yield put({
          type: types.SET_ROUTE_DATA,
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
          type: types.SET_ROUTE_DATA,
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
    yield takeLatest(types.REMOVE, function*(action) {
      const confirm = yield Modal.confirm({
        message: `确认删除路由规则`,
        description: '删除后，无法恢复',
      })
      if (confirm) {
        const removeIndex = action.payload
        const { routeData, ruleType } = selector(yield select())
        const routing = routeData
        routing[ruleType].splice(removeIndex, 1)
        const newRouteData = {
          ...routing,
          [ruleType]: routing[ruleType],
        }

        yield put({ type: types.SET_ROUTE_DATA, payload: newRouteData })
        yield put({
          type: types.SET_EDIT_STATUS,
          payload: true,
        })
        yield put(creators.reload())
      }
    })
  }

  *sagaInitLoad() {}
  async getData(filters: this['Filter']) {
    const { page, count, namespace, service, ruleType } = filters
    let routeData = filters.routeData
    let originData
    if (!routeData) {
      const result = await describeRoutes({
        namespace,
        service,
      })
      if (!result?.[0]) {
        return {
          totalCount: 0,
          list: [],
          originData: null,
          routeData: null,
        }
      }
      routeData = result[0]
      originData = JSON.parse(JSON.stringify(result[0]))
    }

    const offset = (page - 1) * count
    const listSlice = routeData[ruleType]?.slice(offset, offset + count) || []
    return {
      totalCount: routeData[ruleType]?.length || 0,
      list: listSlice.map((item, index) => ({
        ...item,
        id: (offset + index).toString(),
      })),
      routeData,
      originData,
    }
  }
}
