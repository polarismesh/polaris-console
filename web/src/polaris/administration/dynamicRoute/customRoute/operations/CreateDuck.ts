import { createToPayload, reduceFromPayload } from 'saga-duck'
import DetailPage from '@src/polaris/common/ducks/DetailPage'
import Form from '@src/polaris/common/ducks/Form'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import { describeComplicatedNamespaces } from '@src/polaris/namespace/model'
import { cacheFetchAllServices } from '@src/polaris/service/model'
import { select, put, call, fork } from 'redux-saga/effects'
import { takeLatest, takeEvery } from 'redux-saga-catch'
import { delay } from 'redux-saga'
import router from '@src/polaris/common/util/router'
import { TAB } from '@src/polaris/service/detail/types'
import {
  createCustomRoute,
  CreateCustomRoutesParams,
  CustomRoute,
  describeCustomRoute,
  modifyCustomRoute,
  RoutingRuleDestination,
} from '../model'
import { RouteLabelMatchType, RoutingArgumentsType, RoutingValueType } from '../types'
import { describeInstanceLabels } from '@src/polaris/service/detail/instance/model'

interface ComposedId {
  id: string
  namespace: string
  service: string
}

interface Data {
  namespaceList: { value: string; text: string }[]
  serviceList: { value: string; text: string; namespace: string }[]
}

export const convertDestinations = (destinations: RoutingRuleDestination[]) => {
  const handledDestinations = []
  const priorityCount = Array.from(new Set(destinations.map(item => item.priority)))
  const priorityMap = priorityCount.reduce((prev, curr, index) => {
    prev[curr] = index
    return prev
  }, {})
  destinations.forEach(item => {
    const destinationIndex = priorityMap[item.priority]
    const handledItem = {
      ...item,
      labels: Object.entries(item.labels).map(([key, value]) => ({ key, ...value })),
    }
    if (!handledDestinations[destinationIndex]) {
      handledDestinations[destinationIndex] = [handledItem]
    } else {
      handledDestinations[destinationIndex].push(handledItem)
    }
  })
  return handledDestinations
}

export default class CustomRouteCreatePageDuck extends DetailPage {
  ComposedId: ComposedId
  Data: Data

  get baseUrl() {
    return `/#/custom-route-create`
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
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }

  get quickDucks() {
    return {
      ...super.quickDucks,
      form: RouteCreateDuck,
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
      namespace: reduceFromPayload<string>(types.SET_NAMESPACE, ''),
      service: reduceFromPayload<string>(types.SET_SERVICE, ''),
      sourceLabelList: reduceFromPayload(types.SET_SOURCE_LABEL_LIST, []),
      destinationLabelList: reduceFromPayload(types.SET_DESTINATION_LABEL_LIST, []),
    }
  }
  *getLabelList(namespace, service, type) {
    if (!namespace || !service) return
    try {
      const labelData = (yield describeInstanceLabels({
        namespace: namespace,
        service: service,
      })) as Record<string, { values: string[] }>
      const labelList = Object.entries(labelData).map(([key, { values }]) => {
        return { text: key, value: key, valueOptions: values.map(item => ({ text: item, value: item })) }
      })
      yield put({ type: type, payload: labelList })
    } catch (e) {
      yield put({ type: type, payload: [] })
    }
  }
  *saga() {
    yield* super.saga()
    const { types, ducks, selectors, selector, getLabelList } = this
    yield fork([this, this.sagaOnFetchLists])

    // 规则创建
    yield takeLatest(types.SUBMIT, function*() {
      try {
        yield* ducks.form.submit()
      } catch (e) {
        return
      }
      const originValues = ducks.form.selectors.values(yield select())
      const { id, namespace, service } = yield select(selectors.composedId)
      const values = JSON.parse(JSON.stringify(originValues))
      let handledRules
      try {
        handledRules = values.rules.map((rule, index) => {
          const handledDestinations = rule.destinations
            .map((destination, index) =>
              destination.map(group => ({
                ...group,
                service: values.destination.service,
                namespace: values.destination.namespace,
                labels: group?.labels?.reduce((map, curr) => {
                  map[curr.key] = curr
                  delete curr.key
                  return map
                }, {}) as any,
                priority: group.priority || index,
              })),
            )
            .reduce((prev, curr) => {
              return [...prev, ...curr]
            }, [])

          const handledSources = rule.sources.map(source => ({
            service: values.source.service,
            namespace: values.source.namespace,
            arguments: source.arguments.map(item => ({
              type: item.type,
              key: item.key,
              value: {
                type: item.value_type,
                value: item.value,
                value_type: item.value_value_type,
              },
            })),
          }))
          return {
            name: `规则${index}`,
            sources: handledSources,
            destinations: handledDestinations,
          }
        })
      } catch (e) {
        console.log(e)
      }
      const params = {
        ...values,
        rules: undefined,
        routing_config: {
          '@type': 'type.googleapis.com/v2.RuleRoutingConfig',
          sources: [
            {
              service: values.source.service,
              namespace: values.source.namespace,
            },
          ],
          destinations: [
            {
              service: values.destination.service,
              namespace: values.destination.namespace,
            },
          ],
          rules: handledRules,
        },
        id: id ? id : undefined,
        source: undefined,
        destination: undefined,
      } as CreateCustomRoutesParams
      delete params['@type']
      let result
      if (id) {
        result = yield modifyCustomRoute([params])
      } else {
        result = yield createCustomRoute([params])
      }

      yield call(delay, 5)
      if (result.code === 200000) {
        if (namespace) {
          router.navigate(`/service-detail?name=${service}&namespace=${namespace}&tab=${TAB.Route}`)
        } else {
          router.navigate(`/custom-route`)
        }
      }
    })

    // 规则编辑
    yield takeLatest(types.SET_ID, function*(action) {
      if (action.payload) {
        let ruleDetailInfo: Values = null
        const result = yield describeCustomRoute({
          id: action.payload,
          offset: 0,
          limit: 10,
        })
        result.list =
          result.totalCount > 0 &&
          result.list.map((item: CustomRoute) => {
            return {
              ...item,
              source: {
                service: item.routing_config?.rules?.[0]?.sources?.[0].service,
                namespace: item.routing_config?.rules?.[0]?.sources?.[0].namespace,
              },
              destination: {
                service: item.routing_config?.rules?.[0].destinations?.[0]?.service,
                namespace: item.routing_config?.rules?.[0].destinations?.[0]?.namespace,
              },
              rules: item.routing_config.rules.map(rule => {
                return {
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
                }
              }),
            }
          })
        ruleDetailInfo = result.list[0]
        yield put(ducks.form.creators.setValues(ruleDetailInfo))
        yield put({
          type: ducks.form.types.SET_SOURCE_SERVICE,
          payload: ruleDetailInfo.source.service,
          noCheckValid: true,
        })
        yield put({
          type: ducks.form.types.SET_DESTINATION_SERVICE,
          payload: ruleDetailInfo.destination.service,
          noCheckValid: true,
        })
      }
    })
    yield takeLatest(types.SET_SERVICE, function*(action) {
      const { namespace } = selector(yield select())
      yield* getLabelList(namespace, action.payload, types.SET_DESTINATION_LABEL_LIST)
    })
    yield takeEvery([ducks.form.types.SET_SOURCE_SERVICE, ducks.form.types.SET_DESTINATION_SERVICE], function*(action) {
      const type = action.type === ducks.form.types.SET_SOURCE_SERVICE ? 'source' : 'destination'
      const setLabelListType =
        action.type === ducks.form.types.SET_SOURCE_SERVICE
          ? types.SET_SOURCE_LABEL_LIST
          : types.SET_DESTINATION_LABEL_LIST
      if (action.payload === '*' || !action.payload) {
        yield put({ type: setLabelListType, payload: [] })
        return
      }
      const { data } = selector(yield select())
      if (!data?.serviceList?.find(item => item.value === action.payload) && !action.noCheckValid) {
        return
      }
      const values = ducks.form.selectors.values(yield select())
      yield* getLabelList(values[type].namespace, action.payload, setLabelListType)
    })
  }
  *sagaOnFetchLists() {
    const { types } = this
    yield takeLatest(types.ROUTE_INITIALIZED, function*() {
      yield delay(10000)
      const [namespaceList, serviceList] = yield Promise.all([
        getAllList(describeComplicatedNamespaces, {
          listKey: 'namespaces',
          totalKey: 'amount',
        })({}),
        cacheFetchAllServices(),
      ])

      const namespaceOptions = namespaceList.list.map(item => ({
        text: item.name,
        value: item.name,
      }))

      const serviceOptions = serviceList.list.map(item => ({
        text: item.name,
        value: item.name,
        namespace: item.namespace,
      }))

      yield put({
        type: types.UPDATE,
        payload: {
          namespaceList: namespaceOptions,
          serviceList: serviceOptions,
          hasGlobalLimit: true,
        },
      })
    })
  }
  async getData() {
    return {
      namespaceList: [],
      serviceList: [],
    }
  }
}
export interface RouteRuleDestinationField {
  service: string
  namespace: string
  labels: RouteDestinationArgument[]
  weight: number
  isolate: boolean
  name: string
}
export interface RouteDestinationArgument {
  key: string
  value: string
  value_type: string
  type: string
}
export interface RouteRuleField {
  name: string
  sources: RouteRuleSourceField[]
  destinations: RouteRuleDestinationField[][]
}
export interface RouteRuleSourceField {
  service: string
  namespace: string
  arguments: RouteSourceArgument[]
}
export interface RouteSourceArgument {
  value_type: string
  value_value_type: string
  key: string
  type: string
  value: string
}
export interface Values {
  id?: string
  name: string // 规则名
  enable: boolean // 是否启用
  description: string
  priority: number
  destination: {
    service: string
    namespace: string
  }
  source: {
    service: string
    namespace: string
  }
  rules: RouteRuleField[]
  tempKey?: RouteDestinationArgument
}

const validator = Form.combineValidators<Values>({
  name(v) {
    if (!v) {
      return '请填写路由规则名称'
    }
  },
  source: {
    namespace(v) {
      if (!v) {
        return '请选择命名空间'
      }
    },
    service(v) {
      if (!v) {
        return '请选择服务名'
      }
    },
  },
  destination: {
    namespace(v) {
      if (!v) {
        return '请选择命名空间'
      }
    },
    service(v) {
      if (!v) {
        return '请选择服务名'
      }
    },
  },
  rules: [
    {
      sources: [
        {
          arguments: [
            {
              key(v) {
                if (!v) {
                  return '请输入key值'
                }
              },
              value(v, data) {
                if (!v && data.type === RoutingArgumentsType.CALLER_IP) {
                  return '请输入IP'
                }
                if (
                  !v &&
                  data.type !== RoutingArgumentsType.CALLER_IP &&
                  data.value_value_type !== RoutingValueType.PARAMETER
                ) {
                  return '请输入value值'
                }
              },
            },
          ],
        },
      ],
      destinations: [
        destination => {
          const res = Form.combineValidators<RouteRuleDestinationField[]>([
            {
              labels(v) {
                if (!v.length) {
                  return '请输入标签分组'
                }
              },
              weight(v) {
                const totalWeight = destination.reduce((prev, curr) => {
                  prev += curr.weight
                  return prev
                }, 0)
                if (totalWeight !== 100) {
                  return '流量目的地权重总和不为100%'
                }
              },
            },
          ])(destination)
          return res
        },
      ],
      //   [
      //     {
      //       labels(v) {
      //         if (!v.length) {
      //           return '请输入标签分组'
      //         }
      //       },
      //     },
      //     {
      //       weight(v, values, meta) {
      //         console.log(v, values, meta)
      //         if (!v && v !== 0) {
      //           return '请输入权重'
      //         }
      //       },
      //     },
      //   ],
      // ],
    },
  ],
})

export class RouteCreateDuck extends Form {
  Values: Values

  validate(values: Values) {
    return validator(values, values)
  }

  get defaultValue(): this['Values'] {
    return {
      name: '',
      enable: false,
      description: '',
      priority: 0,
      destination: {
        service: '',
        namespace: '',
      },
      source: {
        service: '*',
        namespace: '*',
      },
      rules: [
        {
          name: '规则1',
          sources: [
            {
              service: '*',
              namespace: '*',
              arguments: [
                {
                  type: RoutingArgumentsType.CUSTOM,
                  key: '',
                  value: '',
                  value_type: RouteLabelMatchType.EXACT,
                  value_value_type: RoutingValueType.TEXT,
                },
              ],
            },
          ],
          destinations: [
            [
              {
                service: '',
                namespace: '',
                labels: [],
                weight: 100,
                isolate: false,
                name: '分组1',
              },
            ],
          ],
        },
      ],
    }
  }

  get quickTypes() {
    enum Types {
      SET_SOURCE_SERVICE,
      SET_DESTINATION_SERVICE,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }

  get actionMapping() {
    return {
      ...super.actionMapping,
      source: {
        service: this.types.SET_SOURCE_SERVICE,
      },
      destination: {
        service: this.types.SET_DESTINATION_SERVICE,
      },
    }
  }

  get creators() {
    return {
      ...super.creators,
    }
  }

  *submit() {
    const { creators, selectors } = this
    yield put(creators.setAllTouched(true))
    const firstInvalid = yield select(selectors.firstInvalid)
    if (firstInvalid) throw firstInvalid
  }
}
