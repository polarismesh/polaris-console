import Page from '@src/polaris/common/ducks/Page'
import { CircuitBreakerMonitorDuck, RatelimitMonitorDuck, RouteMonitorDuck } from './PageDuck'

export default class FlowMonitorDuck extends Page {
  get baseUrl() {
    return '/#/flow-monitor'
  }
  get quickTypes() {
    enum Types {
      SET_URL_FILTER_CONFIG,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get params() {
    const { types } = this
    return [
      ...super.params,
      {
        key: 'filterConfig',
        type: types.SET_URL_FILTER_CONFIG,
        defaults: '',
      },
    ]
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      circuit: CircuitBreakerMonitorDuck,
      ratelimit: RatelimitMonitorDuck,
      route: RouteMonitorDuck,
    }
  }
}
