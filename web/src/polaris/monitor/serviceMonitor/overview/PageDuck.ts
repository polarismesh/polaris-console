import DetailPage from '@src/polaris/common/ducks/DetailPage'
import { put, select, takeLatest } from 'redux-saga/effects'
import { reduceFromPayload, createToPayload } from 'saga-duck'
import { SortBy } from 'tea-component/lib/table/addons'
import { getMetricService, MetricService } from '../../models'
import { ComposedId } from '../PageDuck'

export default class OverviewDuck extends DetailPage {
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
      GOTO_SERVICE_DETAIL,
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
      sort: reduceFromPayload<SortBy[]>(types.SET_SORT, [] as SortBy[]),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      load: createToPayload<ComposedId>(types.LOAD),
      setSort: createToPayload<SortBy[]>(types.SET_SORT),
      gotoServiceDetail: createToPayload(types.GOTO_SERVICE_DETAIL),
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
    const { types, selector } = this
    yield* super.saga()
    yield takeLatest(types.LOAD, function*() {
      const { composedId } = selector(yield select())
      const { data: serviceList } = yield getMetricService({ ...composedId })
      yield put({ type: types.SET_SERVICE_LIST, payload: serviceList })
    })
  }
  async getData() {
    return {}
  }
}
