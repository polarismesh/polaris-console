import DetailPageDuck from '@src/polaris/common/ducks/DetailPage'
import { reduceFromPayload, createToPayload } from 'saga-duck'
import { select, put, takeLatest, take } from 'redux-saga/effects'
import { TAB, ComposedId } from './types'
import InfoDuck from './info/PageDuck'
import InstanceDuck from './instance/PageDuck'
import AccessLimitDuck from '@src/polaris/administration/accessLimiting/PageDuck'
import RouteDuck from '@src/polaris/administration/dynamicRoute/customRoute/PageDuck'
import CircuitBreakerDuck from '@src/polaris/administration/breaker/PageDuck'

import { Service } from '../types'
import { describeServices } from '../model'
import InterfacePageDuck from './interface/PageDuck'

export default class RegistryDetailDuck extends DetailPageDuck {
  ComposedId: ComposedId
  Data: Service

  get baseUrl() {
    return '/#/service-detail'
  }

  get params() {
    const { types } = this
    return [
      ...super.params,
      {
        key: 'namespace',
        type: types.SET_NAMESPACE,
        defaults: '',
      },
      {
        key: 'name',
        type: types.SET_SERVICE_NAME,
        defaults: '',
      },
      {
        key: 'tab',
        type: types.SWITCH,
        defaults: TAB.Instance,
      },
    ]
  }
  get quickTypes() {
    enum Types {
      SWITCH,
      SET_NAMESPACE,
      SET_SERVICE_NAME,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      [TAB.Info]: InfoDuck,
      [TAB.Instance]: InstanceDuck,
      [TAB.Route]: RouteDuck,
      [TAB.AccessLimit]: AccessLimitDuck,
      [TAB.CircuitBreaker]: CircuitBreakerDuck,
      [TAB.Interface]: InterfacePageDuck,
    }
  }
  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      tab: reduceFromPayload(types.SWITCH, TAB.Instance),
      namespace: reduceFromPayload(types.SET_NAMESPACE, ''),
      name: reduceFromPayload(types.SET_SERVICE_NAME, ''),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      switch: createToPayload<string>(types.SWITCH),
    }
  }
  get rawSelectors() {
    type State = this['State']
    return {
      ...super.rawSelectors,
      composedId: (state: State) => ({
        name: state.name,
        namespace: state.namespace,
      }),
      tab: (state: State) => state.tab,
    }
  }
  async getData(composedId: this['ComposedId']) {
    const { name, namespace } = composedId
    const result = await describeServices({
      namespace,
      name,
      offset: 0,
      limit: 10,
    })
    return result.list?.[0]
  }
  *saga() {
    yield* super.saga()
    yield* this.watchTabs()
  }
  *watchTabs() {
    const duck = this
    const { types, ducks, selectors } = duck
    yield takeLatest([types.SWITCH, types.FETCH_DONE], function*() {
      const composedId = selectors.composedId(yield select())
      const tab = selectors.tab(yield select())
      const data = selectors.data(yield select())
      if (!composedId || !data) {
        return
      }
      const subDuck = ducks[tab]
      const ready = yield select(subDuck.selectors.ready)
      if (!ready) {
        yield take(subDuck.types.READY)
      }
      yield put(subDuck.creators.load({ ...composedId, ...data }))
    })
  }
}
