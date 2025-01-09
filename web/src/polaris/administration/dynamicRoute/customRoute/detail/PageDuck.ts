import { createToPayload, reduceFromPayload } from 'saga-duck'
import DetailPage from '@src/polaris/common/ducks/DetailPage'
import { put } from 'redux-saga/effects'
import { takeLatest } from 'redux-saga-catch'
import { CustomRoute, describeCustomRoute } from '../model'
import { Values, convertDestinations } from '../operations/CreateDuck'

interface ComposedId {
  id: string
  namespace: string
  service: string
}

export default class RouteDetailPageDuck extends DetailPage {
  ComposedId: ComposedId
  Data: {}

  get baseUrl() {
    return `/#/custom-route-detail`
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
      SET_SOURCE_LABEL_LIST,
      SET_DESTINATION_LABEL_LIST,
      SUBMIT,
      SET_RULE_DETAIL,
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

  get creators() {
    const { types } = this
    return {
      ...super.creators,
      submit: createToPayload<void>(types.SUBMIT),
    }
  }

  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      ruleDetail: reduceFromPayload<Values>(types.SET_RULE_DETAIL, {} as Values),
      namespace: reduceFromPayload<string>(types.SET_NAMESPACE, ''),
      service: reduceFromPayload<string>(types.SET_SERVICE, ''),
      sourceLabelList: reduceFromPayload(types.SET_SOURCE_LABEL_LIST, []),
      destinationLabelList: reduceFromPayload(types.SET_DESTINATION_LABEL_LIST, []),
    }
  }

  *saga() {
    yield* super.saga()
    const { types } = this
    // 规则编辑
    yield takeLatest(types.SET_ID, function*(action) {
      if (action.payload) {
        let ruleDetailInfo = null
        const result = yield describeCustomRoute({
          id: action.payload,
          offset: 0,
          limit: 10,
        })
        result.list =
          result.totalCount > 0 &&
          result.list.map((item: CustomRoute) => ({
            ...item,
            source: {
              service: item.routing_config?.rules?.[0]?.sources?.[0].service,
              namespace: item.routing_config?.rules?.[0]?.sources?.[0].namespace,
            },
            destination: {
              service: item.routing_config?.rules?.[0].destinations?.[0]?.service,
              namespace: item.routing_config?.rules?.[0].destinations?.[0]?.namespace,
            },
            rules: item.routing_config.rules.map(rule => ({
              ...item,
              sources: rule.sources.map(source => ({
                ...source,
                arguments: source?.arguments.map(item => ({
                  type: item.type,
                  key: item.key,
                  value_type: item.value.type,
                  value_value_type: item.value.value_type,
                  value: item.value.value,
                })),
              })),
              destinations: convertDestinations(rule.destinations),
            })),
          }))
        ruleDetailInfo = result.list[0]
        yield put({ type: types.SET_RULE_DETAIL, payload: ruleDetailInfo })
      }
    })
  }

  async getData() {
    return {}
  }
}
