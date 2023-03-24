import DetailPage from '@src/polaris/common/ducks/DetailPage'
import { put, select, takeLatest } from 'redux-saga/effects'
import { reduceFromPayload, createToPayload } from 'saga-duck'
import { SortBy } from 'tea-component/lib/table/addons'
import {
  CategoryAllInterface,
  CategoryInterface,
  getMetricCaller,
  getMetricInstance,
  getMetricInterface,
  getMetricService,
  MetricCaller,
  MetricInstance,
  MetricService,
} from '../../models'
import { ComposedId } from '../PageDuck'

export default class ServiceDuck extends DetailPage {
  get baseUrl() {
    return null
  }
  Data: any
  ComposedId: ComposedId
  get initialFetch() {
    return false
  }

  get watchTypes() {
    return [...super.watchTypes, this.types.LOAD]
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
    }
  }
  get quickTypes() {
    enum Types {
      LOAD,
      SET_SERVICE_LIST,
      SET_SORT,
      SET_SERVICE,
      SET_INSTANCE,
      SET_INTERFACE,
      SET_INSTANCE_LIST,
      SET_INTERFACE_INFO,
      SET_CALLER_LIST,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      composedId: reduceFromPayload(types.LOAD, {} as ComposedId),
      serviceList: reduceFromPayload(types.SET_SERVICE_LIST, [] as MetricService[]),
      interfaceInfo: reduceFromPayload(types.SET_INTERFACE_INFO, {
        category_interfaces: [] as CategoryInterface[],
        category_service: {} as CategoryAllInterface,
      }),
      instanceList: reduceFromPayload(types.SET_INSTANCE_LIST, [] as MetricInstance[]),
      sort: reduceFromPayload<SortBy[]>(types.SET_SORT, [] as SortBy[]),
      service: reduceFromPayload<string>(types.SET_SERVICE, ''),
      interfaceName: reduceFromPayload<string>(types.SET_INTERFACE, ''),
      instance: reduceFromPayload<string>(types.SET_INSTANCE, ''),
      callerList: reduceFromPayload<MetricCaller[]>(types.SET_CALLER_LIST, [] as MetricCaller[]),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      load: createToPayload<ComposedId>(types.LOAD),
      setSort: createToPayload<SortBy[]>(types.SET_SORT),
      setService: createToPayload<string>(types.SET_SERVICE),
      setInstance: createToPayload<string>(types.SET_INSTANCE),
      setInterface: createToPayload<string>(types.SET_INTERFACE),
    }
  }
  get rawSelectors() {
    type State = this['State']
    return {
      ...super.rawSelectors,
      composedId: (state: State) => state.composedId,
    }
  }
  *saga() {
    const { types, selector, creators } = this
    yield* super.saga()
    yield takeLatest(types.LOAD, function*() {
      const { composedId, service } = selector(yield select())
      const { data: serviceList } = yield getMetricService({ ...composedId })
      yield put({ type: types.SET_SERVICE_LIST, payload: serviceList })
      const serviceExisted = serviceList.find(item => item.name === service)
      if (!service || !serviceExisted) {
        yield put({ type: types.SET_SERVICE, payload: serviceList?.[0]?.name })
      }
    })
    yield takeLatest(types.SET_SERVICE, function*() {
      const { composedId, service, instance } = selector(yield select())

      const { data: interfaceInfo } = yield getMetricInterface({ ...composedId, service })
      yield put({ type: types.SET_INTERFACE_INFO, payload: interfaceInfo })
      yield put(creators.setInterface(''))

      const { data: instanceList } = yield getMetricInstance({ ...composedId, service })
      const instanceExisted = instanceList.find(item => item.id === instance)
      yield put({ type: types.SET_INSTANCE_LIST, payload: instanceList })
      if (!instance || !instanceExisted) {
        yield put({ type: types.SET_INSTANCE, payload: instanceList?.[0]?.id })
      }
    })
    yield takeLatest(types.SET_INTERFACE, function*() {
      const {
        composedId: { step, start, end, namespace },
        service,
        interfaceName,
      } = selector(yield select())
      const { data: callerList } = yield getMetricCaller({
        step,
        start,
        end,
        callee_namespace: namespace,
        callee_service: service,
        callee_method: interfaceName,
      })
      yield put({ type: types.SET_CALLER_LIST, payload: callerList })
    })
    // yield takeLatest(types.SET_INSTANCE, function*() {
    //   const { composedId, service, instance, interfaceName } = selector(yield select())
    //   const { data: instanceList } = yield getMetricInterface({ ...composedId, service })
    //   const instanceExisted = instanceList.find(item => item.id === instance)
    //   if (!instance || !instanceExisted) {
    //     yield put({ type: types.SET_INSTANCE, payload: instanceList?.[0]?.id })
    //   }
    // })
  }
  async getData() {
    return {}
  }
}
