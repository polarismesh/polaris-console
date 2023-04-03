import DetailPageDuck from '@src/polaris/common/ducks/DetailPage'
import { reduceFromPayload, createToPayload } from 'saga-duck'
import { select, put, takeLatest } from 'redux-saga/effects'

import moment from 'moment'
import { describeComplicatedNamespaces } from '@src/polaris/namespace/model'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import { Namespace } from '@src/polaris/service/types'
import { TAB } from './Page'
import OverviewDuck from './overview/PageDuck'
import { delay } from 'redux-saga'
import ServiceDuck from './service/PageDuck'

export interface ComposedId {
  start: number
  end: number
  step: number
  namespace: string
}
export interface NamespaceItem extends Namespace {
  text: string
  value: string
}
export default class RegistryDetailDuck extends DetailPageDuck {
  ComposedId: ComposedId
  Data: NamespaceItem[]
  get watchTypes() {
    return [
      ...super.watchTypes,
      this.types.SET_END,
      this.types.SET_START,
      this.types.SET_NAMESPACE,
      this.types.SET_STEP,
    ]
  }
  get baseUrl() {
    return '/#/service-monitor'
  }

  get params() {
    const { types } = this
    return [
      ...super.params,
      {
        key: 'tab',
        type: types.SWITCH,
        defaults: TAB.Overview,
      },
      {
        key: 'namespace',
        type: types.SET_NAMESPACE,
        defaults: '',
      },
      {
        key: 'start',
        type: types.SET_START,
      },
      {
        key: 'end',
        type: types.SET_END,
      },
      {
        key: 'step',
        type: types.SET_STEP,
        defaults: 1,
      },
    ]
  }
  get quickTypes() {
    enum Types {
      SWITCH,
      SET_START,
      SET_END,
      SET_STEP,
      SET_NAMESPACE,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      overview: OverviewDuck,
      service: ServiceDuck,
    }
  }
  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      tab: reduceFromPayload(types.SWITCH, TAB.Overview),
      start: reduceFromPayload(
        types.SET_START,
        moment()
          .subtract(1, 'h')
          .unix(),
      ),
      end: reduceFromPayload(types.SET_END, moment().unix()),
      namespace: reduceFromPayload(types.SET_NAMESPACE, ''),
      step: reduceFromPayload(types.SET_STEP, 1),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      switch: createToPayload<string>(types.SWITCH),
      setNamespace: createToPayload<string>(types.SET_NAMESPACE),
      setStart: createToPayload<number>(types.SET_START),
      setEnd: createToPayload<number>(types.SET_END),
      setStep: createToPayload<number>(types.SET_STEP),
    }
  }
  get rawSelectors() {
    type State = this['State']
    return {
      ...super.rawSelectors,
      composedId: (state: State) => ({
        start: state.start,
        end: state.end,
        step: state.step,
        namespace: state.namespace,
      }),
      tab: (state: State) => state.tab,
      needAllNamespace: (state: State) => state.tab !== TAB.Service,
      loading: () => false, //避免重新绘制页面，关闭全局loading提示
    }
  }
  async getData() {
    await delay(500)
    const result = await getAllList(describeComplicatedNamespaces, {
      listKey: 'namespaces',
      totalKey: 'amount',
    })({})
    return result.list.map(item => ({ ...item, text: item.name, value: item.name }))
  }
  *saga() {
    const { types, selector, ducks, creators } = this
    yield* super.saga()
    yield* this.watchTabs()
    yield takeLatest([types.SET_START, types.SET_END], function*() {
      const { start, end } = selector(yield select())
      const gap = end - start
      if (gap > 60 * 60 && gap < 60 * 60 * 24) {
        yield put({ type: types.SET_STEP, payload: 60 })
      }
      if (gap > 60 * 60 * 24 && gap < 60 * 60 * 24 * 7) {
        yield put({ type: types.SET_STEP, payload: 300 })
      }
      if (gap > 60 * 60 * 24 * 7) {
        yield put({ type: types.SET_STEP, payload: 3600 })
      }
    })
    yield takeLatest(ducks.overview.types.GOTO_SERVICE_DETAIL, function*(action: any) {
      const { service, namespace } = action.payload
      yield put(creators.setNamespace(namespace))
      yield put(creators.switch(TAB.Service))
      yield put(ducks.service.creators.setService(service))
    })
  }
  *watchTabs() {
    const duck = this
    const { types, ducks, selectors, selector } = duck
    yield takeLatest([types.SWITCH, types.FETCH_DONE], function*() {
      const composedId = selectors.composedId(yield select())
      const tab = selectors.tab(yield select())
      const data = selectors.data(yield select())
      const { namespace } = selector(yield select())
      if (!composedId || !data) {
        return
      }
      const subDuck = ducks[tab]
      if (tab === TAB.Service && !namespace) {
        const defaultNamespace = data?.[0]?.value
        yield put({ type: types.SET_NAMESPACE, payload: defaultNamespace })
        yield put(subDuck.creators.load({ ...composedId, namespace: defaultNamespace }))
      } else {
        yield put(subDuck.creators.load({ ...composedId }))
      }
    })
  }
}
