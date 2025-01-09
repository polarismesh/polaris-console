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
import { createFaultDetect, DescribeFaultDetects, modifyFaultDetect } from '../model'
import { BlockHttpBodyMethod, FaultDetectProtocol, FaultDetectRule } from '../types'
import { BreakerType } from '../../types'

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
    return `/#/faultDetect-create`
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
    }
  }
  *saga() {
    yield* super.saga()
    const { types, ducks, selectors } = this
    yield fork([this, this.sagaOnFetchLists])

    // 规则创建
    yield takeLatest(types.SUBMIT, function*() {
      try {
        yield* ducks.form.submit()
      } catch (e) {
        return
      }
      const values = ducks.form.selectors.values(yield select())
      const { id, namespace, service } = yield select(selectors.composedId)
      let result
      const cloneValues = JSON.parse(JSON.stringify(values))
      if (BlockHttpBodyMethod.includes(values.httpConfig.method as any)) {
        delete cloneValues.httpConfig.body
      }
      if (id) {
        delete cloneValues['@type']
        delete cloneValues.ctime
        delete cloneValues.mtime
        result = yield modifyFaultDetect([cloneValues])
      } else {
        result = yield createFaultDetect([cloneValues])
      }

      yield call(delay, 5)
      if (result.code === 200000) {
        if (namespace) {
          router.navigate(`/service-detail?name=${service}&namespace=${namespace}&tab=${TAB.CircuitBreaker}`)
        } else {
          router.navigate(`/circuitBreaker?type=${BreakerType.FaultDetect}`)
        }
      }
    })

    // 规则编辑
    yield takeLatest(types.SET_ID, function*(action) {
      let rule
      if (action.payload) {
        const result = yield DescribeFaultDetects({
          id: action.payload,
          offset: 0,
          limit: 10,
          brief: false,
        })
        result.list =
          result.totalCount > 0 &&
          result.list.map((item: FaultDetectRule) => ({
            ...item,
          }))
        rule = result.list[0]
        yield put(ducks.form.creators.setValues(rule))
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

const validator = Form.combineValidators<FaultDetectRule>({
  name(v) {
    if (!v) {
      return '请填写规则名称'
    }
    if (!/^[a-zA-Z0-9-_]([a-zA-Z0-9-_]{1,64})?$/.test(v)) {
      return '名称只能含有数字，字母，下划线及中划线'
    }
  },
  targetService: {
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
  timeout(v) {
    if (!v) return '请输入超时时间'
  },
  httpConfig(v, values) {
    if (values.protocol !== FaultDetectProtocol.HTTP) return
    const res = Form.combineValidators<FaultDetectRule['httpConfig']>({
      url(v) {
        if (!v) {
          return '请输入url'
        }
      },
      headers: [
        {
          key(v) {
            if (!v) {
              return '请输入键'
            }
          },
          value(v) {
            if (!v) {
              return '请输入值'
            }
          },
        },
      ],
    })(v, values.httpConfig)
    return res
  },
  tcpConfig(v, values) {
    if (values.protocol !== FaultDetectProtocol.TCP) return
    return Form.combineValidators<FaultDetectRule['tcpConfig']>({})(v, values.tcpConfig)
  },
  udpConfig(v, values) {
    if (values.protocol !== FaultDetectProtocol.UDP) return
    return Form.combineValidators<FaultDetectRule['udpConfig']>({})(v, values.udpConfig)
  },
})

export class BreakerRuleCreateDuck extends Form {
  Values: FaultDetectRule

  validate(values: FaultDetectRule) {
    return validator(values, values)
  }

  get defaultValue(): this['Values'] {
    return {
      name: '',
      description: '',
      targetService: {
        namespace: '',
        service: '',
        method: {
          type: 'EXACT',
          value: '',
        },
      },
      interval: 30,
      timeout: 60,
      port: 0,
      // 协议，支持HTTP, TCP, UPD
      protocol: 'HTTP',
      httpConfig: {
        method: 'GET',
        url: '',
        headers: [],
        body: '',
      },
      tcpConfig: {
        send: '',
        receive: [],
      },
      udpConfig: {
        send: '',
        receive: [],
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
