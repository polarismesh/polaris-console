import { createToPayload, reduceFromPayload } from 'saga-duck'
import DetailPage from '@src/polaris/common/ducks/DetailPage'
import Form from '@src/polaris/common/ducks/Form'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import { describeComplicatedNamespaces } from '@src/polaris/namespace/model'
import { describeServices } from '@src/polaris/service/model'
import { select, put, call } from 'redux-saga/effects'
import { takeLatest, takeEvery } from 'redux-saga-catch'
import { delay } from 'redux-saga'
import router from '@src/polaris/common/util/router'
import { TAB } from '@src/polaris/service/detail/types'
import { createCustomRoute, CustomRoute, describeCustomRoute, modifyCustomRoute } from '../model'
import { RouteLabelMatchType, RouteLabelType } from '../types'
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

export default class LimitRuleCreatePageDuck extends DetailPage {
  ComposedId: ComposedId
  Data: Data

  get baseUrl() {
    return `/#/accesslimit-create`
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

  *saga() {
    yield* super.saga()
    const { types, ducks, selectors } = this

    // 规则创建
    yield takeLatest(types.SUBMIT, function*() {
      try {
        yield* ducks.form.submit()
      } catch (e) {
        return
      }
      const values = ducks.form.selectors.values(yield select())
      const { id, namespace, service } = yield select(selectors.composedId)

      const handledDestination = values.destination.instanceGroups.map(item => {
        return {
          ...item,
          labels: item.labels.reduce((map, curr) => {
            map[curr.key] = curr
            delete curr.key
            return map
          }, {}) as any,
          namespace: values.destination.namespace,
          service: values.destination.service,
        }
      })

      const handledArguments = values.source.arguments.map(item => ({
        type: item.type,
        key: item.key,
        value: {
          type: item.operator,
          value: item.value,
          value_type: 'TEXT',
        },
      }))
      const params = {
        ...values,
        routing_config: {
          '@type': 'type.googleapis.com/v2.RuleRoutingConfig',
          sources: [
            {
              ...values.source,
              arguments: handledArguments,
            },
          ],
          destinations: handledDestination,
        },
        id: id ? id : undefined,
        source: undefined,
        destination: undefined,
      }

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
          result.list.map((item: CustomRoute) => ({
            ...item,
            source: {
              ...item.routing_config.sources?.[0],
              arguments: item.routing_config.sources?.[0].arguments.map(item => {
                return {
                  type: item.type,
                  key: item.key,
                  operator: item.value.type,
                  value: item.value.value,
                }
              }),
            },
            destination: {
              service: item.routing_config.destinations?.[0]?.service,
              namespace: item.routing_config.destinations?.[0]?.namespace,
              instanceGroups: item.routing_config.destinations.map(instanceGroup => {
                delete instanceGroup.namespace
                delete instanceGroup.service
                return {
                  ...instanceGroup,
                  labels: Object.entries(instanceGroup.labels).map(([key, value]) => ({ key, ...value })),
                }
              }),
            },
          }))
        ruleDetailInfo = result.list[0]
        yield put(ducks.form.creators.setValues(ruleDetailInfo))
      }
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
      const values = ducks.form.selectors.values(yield select())
      try {
        const labelData = (yield describeInstanceLabels({
          namespace: values[type].namespace,
          service: action.payload,
        })) as Record<string, { values: string[] }>
        const labelList = Object.entries(labelData).map(([key, { values }]) => {
          return { text: key, value: key, valueOptions: values.map(item => ({ text: item, value: item })) }
        })
        yield put({ type: setLabelListType, payload: labelList })
      } catch (e) {
        yield put({ type: setLabelListType, payload: [] })
      }
    })
  }

  async getData() {
    const [namespaceOptions, serviceOptions] = await Promise.all([
      getAllList(describeComplicatedNamespaces, {
        listKey: 'namespaces',
        totalKey: 'amount',
      })({}),
      getAllList(describeServices, {})({}),
    ])

    const namespaceList = namespaceOptions.list.map(item => ({
      text: item.name,
      value: item.name,
    }))

    const serviceList = serviceOptions.list.map(item => ({
      text: item.name,
      value: item.name,
      namespace: item.namespace,
    }))
    return {
      namespaceList,
      serviceList,
    }
  }
}
export interface DestinationInstanceGroup {
  labels: RouteDestinationArgument[]
  weight: number
  priority: number
  isolate: boolean
  name: string
}
export interface RouteDestinationArgument {
  key: string
  value: string
  value_type: string
  type: string
}
export interface RouteSourceArgument {
  type: string
  key: string
  operator: string
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
    instanceGroups: DestinationInstanceGroup[]
  }
  source: {
    service: string
    namespace: string
    arguments: RouteSourceArgument[]
  }
}

const validator = Form.combineValidators<Values>({
  name(v) {
    if (!v) {
      return '请填写限流规则名称'
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
    arguments: [
      {
        key(v) {
          if (!v) {
            return '请输入或者选择key值'
          }
        },
      },
    ],
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
    instanceGroups: [
      {
        name(v) {
          if (!v) {
            return '请输入名称'
          }
        },
        weight(v, data, meta) {
          const weightSum = meta?.destination?.instanceGroups.reduce((sum, curr) => {
            sum += curr.weight
            return sum
          }, 0)
          if (weightSum !== 100) {
            return '所有实例分组权重加和必须为100'
          }
        },
        labels: [
          {
            key(v) {
              if (!v) {
                return '请输入或者选择key值'
              }
            },
          },
        ],
      },
    ],
  },
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
        instanceGroups: [
          {
            labels: [
              {
                key: '',
                value: '',
                value_type: 'TEXT',
                type: RouteLabelMatchType.EXACT,
              },
            ],
            weight: 0,
            priority: 0,
            isolate: false,
            name: '实例分组1',
          },
        ],
      },
      source: {
        service: '',
        namespace: '',
        arguments: [
          {
            type: RouteLabelType.CUSTOM,
            key: '',
            value: '',
            operator: RouteLabelMatchType.EXACT,
          },
        ],
      },
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
