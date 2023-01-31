import { createToPayload, reduceFromPayload } from 'saga-duck'
import GridPageDuck, { Filter as BaseFilter } from '../common/ducks/GridPage'
import { AlertInfo } from './types'
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

  async getData() {
    return {
      totalCount: 0,
      list: [],
    }
  }
}
