import DetailPageDuck from '@src/polaris/common/ducks/DetailPage'
import { reduceFromPayload, createToPayload } from 'saga-duck'
import { takeLatest } from 'redux-saga-catch'
import { select, put } from 'redux-saga/effects'
import Form from '@src/polaris/common/ducks/Form'

import {
  RuleType,
  DestinationItem,
  SourceItem,
  MATCH_TYPE,
  PolicyName,
  BREAK_RESOURCE_TYPE,
  OutlierDetectWhen,
  getTemplateCircuitBreakerInbounds,
  getTemplateCircuitBreakerOutbounds,
} from '../types'
import { describeServiceCircuitBreaker, CircuitBreaker } from '../model'
import { ComposedId } from '../../types'
import { EditType } from './Create'

import DynamicDuck from '@src/polaris/common/ducks/DynamicDuck'

const convertPolicyArrayToMap = policyArray => {
  const metadataMap = {}
  policyArray.forEach(policy => {
    const {
      policyName,
      errorRateToOpen,

      requestVolumeThreshold,
      consecutiveErrorToOpen,
    } = policy
    metadataMap[policyName] =
      policyName === PolicyName.ErrorRate
        ? {
            enable: true,
            errorRateToOpen,
            requestVolumeThreshold,
          }
        : {
            enable: true,
            consecutiveErrorToOpen,
          }
  })
  return metadataMap
}
const convertPolicyMapToArray = policy => {
  const policyArray = Object.keys(policy)
    .filter(key => policy[key])
    .map(key => {
      return { policyName: key, ...policy[key] }
    })
  return policyArray
}
export default class CircuitBreakerCreate extends DetailPageDuck {
  ComposedId: ComposedId
  Data: CircuitBreaker

  get baseUrl() {
    return null
  }

  get params() {
    const { types } = this
    return [
      ...super.params,
      {
        key: 'namespace',
        type: types.SET_NAMESPACE,
        defaults: '',
      },
      {
        key: 'service',
        type: types.SET_SERVICE_NAME,
        defaults: '',
      },
      {
        key: 'ruleIndex',
        type: types.SET_RULEINDEX,
        defaults: -1,
      },
      {
        key: 'ruleType',
        type: types.SET_RULE_TYPE,
        defaults: RuleType.Inbound,
      },
      {
        key: 'ruleId',
        type: types.SET_RULE_ID,
        defaults: '',
      },
    ]
  }
  get quickTypes() {
    enum Types {
      SWITCH,
      SET_NAMESPACE,
      SET_SERVICE_NAME,
      SET_RULEINDEX,
      SET_RULE_TYPE,
      SET_RULE_ID,
      SUBMIT,
      LOAD,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      form: CreateForm,
    }
  }
  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      namespace: reduceFromPayload(types.SET_NAMESPACE, ''),
      service: reduceFromPayload(types.SET_SERVICE_NAME, ''),
      ruleId: reduceFromPayload(types.SET_RULE_ID, ''),
      ruleIndex: reduceFromPayload(types.SET_RULEINDEX, -1),
      ruleType: reduceFromPayload(types.SET_RULE_TYPE, RuleType.Inbound),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      submit: createToPayload<void>(types.SUBMIT),
      load: createToPayload(types.LOAD),
    }
  }
  get rawSelectors() {
    type State = this['State']
    return {
      ...super.rawSelectors,
      composedId: (state: State) => ({
        name: state.service,
        namespace: state.namespace,
      }),
    }
  }
  async getData(composedId: this['ComposedId']) {
    const { name, namespace } = composedId
    const result = await describeServiceCircuitBreaker({
      namespace,
      service: name,
    })
    return result || ({} as any)
  }
  *submit() {
    const { ducks } = this
    const { values } = ducks.form.selector(yield select())

    yield put(ducks.form.creators.setAllTouched(true))
    const firstInvalid = yield select(ducks.form.selectors.firstInvalid)
    if (firstInvalid) {
      return false
    }
    const {
      inboundDestinations,
      inboundSources,
      outboundDestinations,
      outboundSources,
      inboundNamespace,
      inboundService,
      outboundService,
      outboundNamespace,
      editType,
      ruleType,
      inboundJsonValue,
      outboundJsonValue,
    } = values

    let editItem
    if (ruleType === RuleType.Inbound) {
      editItem =
        editType === EditType.Json
          ? JSON.parse(inboundJsonValue)
          : {
              sources: inboundSources.map(source => {
                return {
                  ...source,
                  namespace: inboundNamespace,
                  service: inboundService,
                }
              }),
              destinations: inboundDestinations.map(destination => {
                return {
                  ...destination,
                  policy: convertPolicyArrayToMap(destination.policy),

                  namespace: undefined,
                  service: undefined,
                }
              }),
            }
      return editItem
    } else {
      editItem =
        editType === EditType.Json
          ? JSON.parse(outboundJsonValue)
          : {
              sources: outboundSources.map(source => {
                return {
                  ...source,
                  namespace: undefined,
                  service: undefined,
                }
              }),
              destinations: outboundDestinations.map(destination => {
                return {
                  ...destination,
                  namespace: outboundNamespace,
                  service: outboundService,
                  policy: convertPolicyArrayToMap(destination.policy),
                }
              }),
            }
      return editItem
    }
  }
  *saga() {
    const { types, ducks } = this
    yield* super.saga()
    yield takeLatest(types.LOAD, function*(action) {
      const { values, ruleIndex, ruleType, service, namespace, isEdit } = action.payload

      const emptyRule = {
        service,
        namespace,
        inboundDestinations: [
          {
            service,
            namespace,
            policy: [
              {
                policyName: PolicyName.ErrorRate,
                errorRateToOpen: 10,
                slowRateToOpen: 0,
                maxRt: 1,
                requestVolumeThreshold: 10,
                consecutiveErrorToOpen: 10,
              },
            ],
            recover: {
              sleepWindow: '1s',
              outlierDetectWhen: OutlierDetectWhen.NEVER,
            },
            resource: BREAK_RESOURCE_TYPE.INSTANCE,
            method: {
              value: '',
              type: MATCH_TYPE.EXACT,
            },
          },
        ],
        inboundSources: [
          {
            service: '',
            namespace: '',
          },
        ],
        outboundSources: [
          {
            service: '',
            namespace: '',
          },
        ],
        outboundDestinations: [
          {
            service,
            namespace,
            policy: [
              {
                policyName: PolicyName.ErrorRate,
                errorRateToOpen: 10,
                slowRateToOpen: 0,
                maxRt: 1,
                requestVolumeThreshold: 10,
                consecutiveErrorToOpen: 10,
              },
            ],
            recover: {
              sleepWindow: '1s',
              outlierDetectWhen: OutlierDetectWhen.NEVER,
            },
            resource: BREAK_RESOURCE_TYPE.INSTANCE,
            method: {
              value: '',
              type: MATCH_TYPE.EXACT,
            },
          },
        ],
        inboundNamespace: '*',
        inboundService: '*',
        outboundService: '*',
        outboundNamespace: '*',
        editType: EditType.Manual,
        ruleType: RuleType.Inbound,
        inboundJsonValue: getTemplateCircuitBreakerInbounds(),
        outboundJsonValue: getTemplateCircuitBreakerOutbounds(),
      }
      if (!isEdit) {
        yield put(ducks.form.creators.setValues(emptyRule))
      } else {
        const circuitBreaker = values as CircuitBreaker
        const rule = circuitBreaker[ruleType][ruleIndex]
        const ruleNamespace =
          ruleType === RuleType.Inbound ? rule.sources?.[0].namespace : rule.destinations?.[0].namespace
        const ruleService = ruleType === RuleType.Inbound ? rule.sources?.[0].service : rule.destinations?.[0].service
        const formValueKey = ruleType === RuleType.Inbound ? 'inbound' : 'outbound'
        return yield put(
          ducks.form.creators.setValues({
            ...emptyRule,
            [`${formValueKey}Destinations`]: rule.destinations.map(item => ({
              ...item,
              policy: convertPolicyMapToArray(item.policy),
              resource: item.resource ? item.resource : BREAK_RESOURCE_TYPE.INSTANCE,
              recover: {
                ...item.recover,
                outlierDetectWhen: item.recover.outlierDetectWhen
                  ? item.recover.outlierDetectWhen
                  : OutlierDetectWhen.NEVER,
              },
            })),
            [`${formValueKey}Sources`]: rule.sources.map(item => ({
              ...item,
            })),
            ruleType,
            [`${formValueKey}Namespace`]: ruleNamespace,
            [`${formValueKey}Service`]: ruleService,
            [`${formValueKey}JsonValue`]: JSON.stringify(rule, null, 4),
          }),
        )
      }
    })
  }
}
export interface Values {
  service: string
  namespace: string
  inboundDestinations: DestinationItem[]
  inboundSources: SourceItem[]
  outboundDestinations: DestinationItem[]
  outboundSources: SourceItem[]
  inboundNamespace: string
  inboundService: string
  outboundService: string
  outboundNamespace: string
  editType: EditType
  ruleType: RuleType
  inboundJsonValue?: string
  outboundJsonValue?: string
}
class CreateForm extends Form {
  Values: Values
  Meta: {}
  validate(v: this['Values'], meta: this['Meta']) {
    return validator(v, meta)
  }
}
const validator = CreateForm.combineValidators<Values, {}>({
  inboundJsonValue(v, meta) {
    if (meta.editType === EditType.Json && meta.ruleType === RuleType.Inbound) {
      try {
        JSON.parse(v)
      } catch (e) {
        return '请输入正确的JSON字符串'
      }
    }
  },
  outboundJsonValue(v, meta) {
    if (meta.editType === EditType.Json && meta.ruleType === RuleType.Outbound) {
      try {
        JSON.parse(v)
      } catch (e) {
        return '请输入正确的JSON字符串'
      }
    }
  },
  inboundNamespace(v, meta) {
    if (!v && meta.ruleType === RuleType.Inbound && meta.editType !== EditType.Json) {
      return '请输入命名空间'
    }
  },
  inboundService(v, meta) {
    if (!v && meta.ruleType === RuleType.Inbound && meta.editType !== EditType.Json) {
      return '请输入服务名'
    }
  },
  outboundNamespace(v, meta) {
    if (!v && meta.ruleType === RuleType.Outbound && meta.editType !== EditType.Json) {
      return '请输入命名空间'
    }
  },
  outboundService(v, meta) {
    if (!v && meta.ruleType === RuleType.Outbound && meta.editType !== EditType.Json) {
      return '请输入服务名'
    }
  },
})

export class DynamicCircuitBreakerCreateDuck extends DynamicDuck {
  get ProtoDuck() {
    return CircuitBreakerCreate
  }
}
