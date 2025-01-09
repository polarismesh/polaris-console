import { createToPayload, reduceFromPayload } from 'saga-duck'
import DetailPage from '@src/polaris/common/ducks/DetailPage'
import Form from '@src/polaris/common/ducks/Form'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import { describeComplicatedNamespaces } from '@src/polaris/namespace/model'
import { cacheFetchAllServices } from '@src/polaris/service/model'
import { select, put, call, fork } from 'redux-saga/effects'
import { takeLatest } from 'redux-saga-catch'
import { delay } from 'redux-saga'
import router from '@src/polaris/common/util/router'
import { TAB } from '@src/polaris/service/detail/types'
import { createCircuitBreaker, DescribeCircuitBreakers, modifyCircuitBreaker } from '../model'
import { BreakerType, BreakLevelType, CircuitBreakerRule, FallbackConfig } from '../types'

interface ComposedId {
  id: string
  namespace: string
  service: string
}

interface Data {
  namespaceList: { value: string; text: string }[]
  serviceList: { value: string; text: string; namespace: string }[]
}

export default class CircuitBreakerCreatePageDuck extends DetailPage {
  ComposedId: ComposedId
  Data: Data

  get baseUrl() {
    return `/#/circuitBreaker-create`
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
        key: 'type',
        type: types.SET_TYPE,
        defaults: BreakerType.Service,
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
      SET_TYPE,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }

  get quickDucks() {
    return {
      ...super.quickDucks,
      form: BreakerRuleCreateDuck,
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
      type: reduceFromPayload<string>(types.SET_TYPE, BreakerType.Service),
    }
  }

  *saga() {
    yield* super.saga()
    const { types, ducks, selectors, selector } = this
    yield fork([this, this.sagaOnFetchLists])

    yield takeLatest(types.SET_TYPE, function*(action) {
      if (action.payload === BreakerType.Interface) {
        yield put(ducks.form.creators.setValue('level', BreakLevelType.Instance))
      }
      if (action.payload === BreakerType.Service) {
        yield put(ducks.form.creators.setValue('level', BreakLevelType.Method))
      }
    })
    // 规则创建
    yield takeLatest(types.SUBMIT, function*() {
      try {
        yield* ducks.form.submit()
      } catch (e) {
        return
      }
      const values = ducks.form.selectors.values(yield select())
      const { id, namespace, service } = yield select(selectors.composedId)
      const { type } = selector(yield select())
      let result
      if (values.level !== BreakLevelType.Method) {
        delete values.ruleMatcher.destination.method
      }

      // values暂时没有定义block_configs结构，暂时先类型断言这么写
      delete (values as any)?.block_configs

      if (id) {
        delete values['@type']
        delete values.ctime
        delete values.mtime
        delete values.etime
        result = yield modifyCircuitBreaker([values])
      } else {
        result = yield createCircuitBreaker([values])
      }

      yield call(delay, 5)
      if (result.code === 200000) {
        if (namespace) {
          router.navigate(
            `/service-detail?name=${service}&namespace=${namespace}&tab=${TAB.CircuitBreaker}&type=${type}`,
          )
        } else {
          router.navigate(`/circuitBreaker?type=${type}`)
        }
      }
    })

    // 规则编辑
    yield takeLatest(types.SET_ID, function*(action) {
      let circuitBreakerRule
      if (action.payload) {
        const result = yield DescribeCircuitBreakers({
          id: action.payload,
          offset: 0,
          limit: 10,
          brief: false,
        })
        result.list =
          result.totalCount > 0 &&
          result.list.map((item: CircuitBreakerRule) => ({
            ...item,
          }))
        circuitBreakerRule = result.list[0]
        yield put(ducks.form.creators.setValues(circuitBreakerRule))
      }
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

const validator = Form.combineValidators<CircuitBreakerRule>({
  name(v) {
    if (!v) {
      return '请填写路由规则名称'
    }
    if (!/^[a-zA-Z0-9-_]([a-zA-Z0-9-_]{1,64})?$/.test(v)) {
      return '名称只能含有数字，字母，下划线及中划线'
    }
  },
  ruleMatcher(v, values) {
    return Form.combineValidators<any>({
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
        method: {
          value(v) {
            if (values?.level !== BreakLevelType.Method) return
            if (!v) {
              return '请输入接口名'
            }
          },
        },
      },
    })(v, values)
  },
  errorConditions: [
    {
      condition: {
        value(v) {
          if (!v) {
            return '请输入条件'
          }
        },
      },
    },
  ],
  level(v) {
    if (!v) {
      return '请选择熔断粒度'
    }
  },
  fallbackConfig(v, values) {
    return Form.combineValidators<FallbackConfig>({
      response: {
        headers: [
          {
            key(v) {
              if (!values.fallbackConfig.enable) return
              if (!v) {
                return '请输入键'
              }
            },
            value(v) {
              if (!values.fallbackConfig.enable) return
              if (!v) {
                return '请输入值'
              }
            },
          },
        ],
      },
    })(v, values.fallbackConfig)
  },
})

export class BreakerRuleCreateDuck extends Form {
  Values: CircuitBreakerRule

  validate(values: CircuitBreakerRule) {
    return validator(values, values)
  }

  get defaultValue(): this['Values'] {
    return {
      name: '',
      enable: false,
      level: '',
      description: '',
      ruleMatcher: {
        source: {
          service: '',
          namespace: '',
        },
        destination: {
          service: '',
          namespace: '',
          method: {
            type: 'EXACT',
            value: '',
          },
        },
      },
      errorConditions: [
        {
          inputType: 'RET_CODE',
          condition: {
            type: 'EXACT',
            value: '',
          },
        },
      ],
      triggerCondition: [
        {
          triggerType: 'ERROR_RATE',
          errorCount: 10,
          errorPercent: 50,
          interval: 30,
          minimumRequest: 5,
        },
      ],
      recoverCondition: {
        sleepWindow: 60,
        consecutiveSuccess: 3,
      },
      faultDetectConfig: {
        enable: true,
      },
      fallbackConfig: {
        enable: false,
        response: {
          code: 0,
          headers: [],
          body: '',
        },
      },
      editable: true,
      deleteable: true,
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
