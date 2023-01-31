import DetailPage from '@src/polaris/common/ducks/DetailPage'
import { ClsInfo, describeAlertRules } from '../model'
import { AlertInfo } from '../types'

interface ComposedId {
  id: string
}

interface Data {
  alertInfo: AlertInfo
  clsInfo: ClsInfo
}

export default class RouteDetailPageDuck extends DetailPage {
  ComposedId: ComposedId
  Data: Data

  get baseUrl() {
    return `/#/alert-detail`
  }

  get params() {
    const { types } = this
    return [
      ...super.params,
      {
        key: 'id',
        type: types.SET_ID,
        defaults: '',
      },
    ]
  }

  get rawSelectors() {
    type State = this['State']
    return {
      ...super.rawSelectors,
      composedId: (state: State) => ({
        id: state.id,
      }),
    }
  }

  get quickTypes() {
    enum Types {}
    return {
      ...super.quickTypes,
      ...Types,
    }
  }

  get quickDucks() {
    return {
      ...super.quickDucks,
    }
  }

  get creators() {
    return {
      ...super.creators,
    }
  }

  get reducers() {
    return {
      ...super.reducers,
    }
  }

  *saga() {
    yield* super.saga()
  }

  async getData(composedId: ComposedId) {
    const result = await Promise.all([describeAlertRules({ id: composedId.id, offset: 0, limit: 20 })])

    return {
      alertInfo: result?.[0]?.data?.[0],
      clsInfo: {} as any,
    }
  }
}
