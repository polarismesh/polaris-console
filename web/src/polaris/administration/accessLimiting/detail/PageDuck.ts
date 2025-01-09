import { reduceFromPayload } from 'saga-duck'
import DetailPage from '@src/polaris/common/ducks/DetailPage'
import { put } from 'redux-saga/effects'
import { takeLatest } from 'redux-saga-catch'
import { describeLimitRules, RateLimit } from '../model'
import { Values } from '../operations/CreateDuck'

interface ComposedId {
  id: string
  namespace: string
  service: string
}

export default class AccessLimitingDetailPageDuck extends DetailPage {
  ComposedId: ComposedId
  Data: {}

  get baseUrl() {
    return `/#/accesslimit-detail`
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
      {
        key: 'ns',
        type: types.SET_NAMESPACE,
        defaults: '',
      },
      {
        key: 'service',
        type: types.SET_SERVICE,
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
        namespace: state.namespace,
        service: state.service,
      }),
    }
  }

  get quickTypes() {
    enum Types {
      SET_NAMESPACE,
      SET_SERVICE,
      SET_ACCESSLIMIT_DETAIL,
    }
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

  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      ruleDetail: reduceFromPayload<Values>(types.SET_ACCESSLIMIT_DETAIL, {} as Values),
      namespace: reduceFromPayload<string>(types.SET_NAMESPACE, ''),
      service: reduceFromPayload<string>(types.SET_SERVICE, ''),
    }
  }

  *saga() {
    yield* super.saga()
    const { types } = this
    // 规则编辑
    yield takeLatest(types.SET_ID, function*(action) {
      if (action.payload) {
        let ruleDetailInfo = null
        const result = yield describeLimitRules({
          id: action.payload,
          offset: 0,
          limit: 10,
        })
        result.list =
          result.totalCount > 0 &&
          result.list.map((item: RateLimit) => ({
            ...item,
            disable: item.disable === false ? true : false,
            amounts:
              item.amounts?.length > 0
                ? item.amounts.map(o => ({
                    id: `${Math.round(Math.random() * 10000)}`,
                    maxAmount: o.maxAmount,
                    validDurationNum: Number(o.validDuration.substring(0, o.validDuration.length - 1)),
                    validDurationUnit: o.validDuration.substring(o.validDuration.length - 1, o.validDuration.length),
                  }))
                : [],
            arguments:
              item.arguments?.length > 0
                ? item.arguments.map(o => ({
                    id: `${Math.round(Math.random() * 10000)}`,
                    type: o.type,
                    key: o.key,
                    value: o.value.value,
                    operator: o.value.type,
                  }))
                : [],
          }))
        ruleDetailInfo = result.list[0]
        yield put({ type: types.SET_ACCESSLIMIT_DETAIL, payload: ruleDetailInfo })
      }
    })
  }

  async getData() {
    return {}
  }
}
