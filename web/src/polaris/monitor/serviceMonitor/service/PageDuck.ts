import DetailPage from '@src/polaris/common/ducks/DetailPage'
import { Instance } from '@src/polaris/service/detail/instance/types'
import { put, select, takeLatest } from 'redux-saga/effects'
import { reduceFromPayload, createToPayload } from 'saga-duck'
import { SortBy } from 'tea-component/lib/table/addons'
import {
  CategoryAllInterface,
  CategoryInterface,
  getAllInstance,
  getAllService,
  getMetricCaller,
  getMetricInstance,
  getMetricInterface,
  MetricCaller,
  MetricInstance,
  MetricService,
} from '../../models'
import { ComposedId } from '../PageDuck'

interface InstanceItem extends Instance {
  ip: string
}

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
      SET_METRIC_INSTANCE_LIST,
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
        category_service: null as CategoryAllInterface,
      }),
      instanceList: reduceFromPayload(types.SET_INSTANCE_LIST, [] as InstanceItem[]),
      sort: reduceFromPayload<SortBy[]>(types.SET_SORT, [] as SortBy[]),
      service: reduceFromPayload<string>(types.SET_SERVICE, ''),
      interfaceName: reduceFromPayload<string>(types.SET_INTERFACE, ''),
      instance: reduceFromPayload<string>(types.SET_INSTANCE, ''),
      callerList: reduceFromPayload<MetricCaller[]>(types.SET_CALLER_LIST, [] as MetricCaller[]),
      metricInstanceList: reduceFromPayload<MetricInstance[]>(types.SET_METRIC_INSTANCE_LIST, [] as MetricInstance[]),
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
      const { composedId } = selector(yield select())
      const { services: serviceList } = yield getAllService({ namespace: composedId.namespace })
      yield put({ type: types.SET_SERVICE_LIST, payload: serviceList })
      const { service } = selector(yield select())
      if (serviceList.length === 0) return
      const serviceExisted = serviceList.find(item => item.name === service)
      if (serviceExisted) {
        yield put(creators.reload())
      }
      if (!service || !serviceExisted) {
        yield put({ type: types.SET_SERVICE, payload: serviceList?.[0]?.name })
      }
    })
    yield takeLatest(types.SET_SERVICE, function*() {
      const { composedId, service, interfaceName } = selector(yield select())
      try {
        const { data: instanceList } = yield getAllInstance({ ...composedId, service })
        yield put({
          type: types.SET_INSTANCE_LIST,
          payload: instanceList.map(item => ({ ...item, ip: `${item.host}:${item.port}` })),
        })
        yield put({ type: types.SET_INSTANCE, payload: '' })

        const { data: metricInstanceList } = yield getMetricInstance({
          ...composedId,
          callee_method: interfaceName,
          service: service,
        })
        yield put({ type: types.SET_METRIC_INSTANCE_LIST, payload: metricInstanceList })
      } catch (e) {
        yield put({
          type: types.SET_INSTANCE_LIST,
          payload: [],
        })
        yield put({ type: types.SET_METRIC_INSTANCE_LIST, payload: [] })
      }
    })
    yield takeLatest(types.SET_INTERFACE, function*() {
      const {
        composedId: { step, start, end, namespace },
        service,
        interfaceName,
      } = selector(yield select())
      const { data: metricInstanceList } = yield getMetricInstance({
        step,
        start,
        end,
        namespace,
        callee_method: interfaceName,
        service: service,
      })
      yield put({ type: types.SET_METRIC_INSTANCE_LIST, payload: metricInstanceList })
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
    yield takeLatest(types.SET_INSTANCE, function*() {
      const { composedId, service, instance } = selector(yield select())
      const { data: interfaceInfo } = yield getMetricInterface({
        ...composedId,
        service,
        callee_instance: instance ? instance : undefined,
      })
      yield put({ type: types.SET_INTERFACE_INFO, payload: interfaceInfo })
      yield put(creators.setInterface(''))
    })
    yield takeLatest(types.RELOAD, function*() {
      const { composedId, service, interfaceName, instance } = selector(yield select())
      const { step, start, end, namespace } = composedId
      const { data: interfaceInfo } = yield getMetricInterface({
        ...composedId,
        service,
        callee_instance: instance ? instance : undefined,
      })
      yield put({ type: types.SET_INTERFACE_INFO, payload: interfaceInfo })
      yield put(creators.setInterface(''))
      const { data: metricInstanceList } = yield getMetricInstance({
        ...composedId,
        service: service,
        callee_method: interfaceName,
      })
      yield put({ type: types.SET_METRIC_INSTANCE_LIST, payload: metricInstanceList })

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
  }
  async getData() {
    return {}
  }
}
