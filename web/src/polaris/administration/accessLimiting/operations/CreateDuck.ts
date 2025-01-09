import { createToPayload, reduceFromPayload } from 'saga-duck'
import DetailPage from '@src/polaris/common/ducks/DetailPage'
import Form from '@src/polaris/common/ducks/Form'
import {
  CreateLimitRulesBaseParams,
  CreateLimitRulesParams,
  createRateLimit,
  describeLimitRules,
  LimitArgumentsConfigForFormFilling,
  LimitConfigForFormFilling,
  modifyRateLimit,
  RateLimit,
} from '@src/polaris/administration/accessLimiting/model'
import { generateDefaultValues, LimitArgumentsType } from '../types'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import { describeComplicatedNamespaces } from '@src/polaris/namespace/model'
import { cacheFetchAllServices } from '@src/polaris/service/model'
import { select, put, call, all, fork } from 'redux-saga/effects'
import { takeLatest } from 'redux-saga-catch'
import { delay } from 'redux-saga'
import router from '@src/polaris/common/util/router'
import { TAB } from '@src/polaris/service/detail/types'

interface ComposedId {
  id: string
  namespace: string
  service: string
}

interface Data {
  namespaceList: { value: string; text: string }[]
  serviceList: { value: string; text: string; namespace: string }[]
  hasGlobalLimit?: boolean
}

export interface Values extends CreateLimitRulesBaseParams {
  amounts: LimitConfigForFormFilling[]
  arguments: LimitArgumentsConfigForFormFilling[]
}

const validator = Form.combineValidators<Values>({
  name(v) {
    if (!v) {
      return '请填写限流规则名称'
    }
  },
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
      type(v) {
        if (!v) {
          return '请选择类型'
        }
      },
      value(v, data) {
        if (!v && data.type === LimitArgumentsType.CALLER_SERVICE) {
          return '请选择服务名'
        }
        if (!v && data.type === LimitArgumentsType.CALLER_IP) {
          return '请输入IP'
        }
        if (!v && data.type !== LimitArgumentsType.CALLER_IP) {
          return '请输入value值'
        }
      },
      key(v, data) {
        if (!v && data.type === LimitArgumentsType.CALLER_SERVICE) {
          return '请选择命名空间'
        }
        if (!v) {
          return '请输入key值'
        }
      },
    },
  ],
})

class LimitRuleCreateFormDuck extends Form {
  Values: Values

  validate(values: Values) {
    return validator(values)
  }

  get defaultValue(): this['Values'] {
    return generateDefaultValues
  }

  get quickTypes() {
    enum Types {
      SET_ARGUMENTS,
      SET_AMOUNTS,
    }
    return {
      ...super.quickTypes,
      ...Types,
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
      form: LimitRuleCreateFormDuck,
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

      /**
       * 重新处理数值
       * amounts中的统计窗口时间是需要拼接数值+单位的
       * arguments要变更为LimitArgumentsConfig结构, value是一个复杂类型。。
       */
      const handledAmounts = values.amounts.map(item => ({
        maxAmount: item.maxAmount,
        validDuration: `${item.validDurationNum}${item.validDurationUnit}`,
      }))

      const handledArguments = values.arguments.map(item => ({
        type: item.type,
        key: item.key,
        value: {
          type: item.operator,
          value: item.value,
        },
      }))
      const handeledDisable = !values.disable
      const params: CreateLimitRulesParams = {
        ...values,
        amounts: handledAmounts,
        arguments: handledArguments,
        disable: handeledDisable,
        id,
      }

      let result
      if (id) {
        result = yield modifyRateLimit([params])
      } else {
        result = yield createRateLimit([params])
      }

      yield call(delay, 5)
      if (result.code === 200000) {
        if (namespace) {
          router.navigate(`/service-detail?name=${service}&namespace=${namespace}&tab=${TAB.AccessLimit}`)
        } else {
          router.navigate(`/accesslimit`)
        }
      }
    })

    // 规则编辑
    yield takeLatest(types.SET_ID, function*(action) {
      if (action.payload) {
        let ruleDetailInfo: Values = null
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
        yield put(ducks.form.creators.setValues(ruleDetailInfo))
      }
    })
  }
  *sagaOnFetchLists() {
    const { types } = this
    yield takeLatest(types.ROUTE_INITIALIZED, function*() {
      const [namespaceList, serviceList] = yield all([
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
    return { namespaceList: [], serviceList: [] }
  }
}
