import { reduceFromPayload, createToPayload } from 'saga-duck'
import { takeLatest } from 'redux-saga-catch'
import { select, put } from 'redux-saga/effects'
import Form from '@src/polaris/common/ducks/Form'

import {
  RuleType,
  DestinationItem,
  SourceItem,
  MATCH_TYPE,
  MetadataItem,
  getTemplateRouteInbounds,
  getTemplateRouteOutbounds,
} from '../types'
import { describeRoutes, Routing } from '../model'
import { ComposedId } from '../../types'
import { EditType } from './Create'
import PageDuck from '@src/polaris/common/ducks/Page'
import DynamicDuck from '@src/polaris/common/ducks/DynamicDuck'

export const convertMetadataMapInArray = o => {
  return o.map(item => {
    const metadata = item.metadata
    const convertedMetadata = Object.keys(metadata).map(key => {
      return {
        key,
        value: metadata[key].value,
        type: metadata[key].type ? metadata[key].type : MATCH_TYPE.EXACT,
      }
    })
    return {
      ...item,
      metadata: convertedMetadata,
    }
  })
}
export const convertMetadataArrayToMap = metadataArray => {
  const metadataMap = {}
  metadataArray.forEach(metadata => {
    const { key, value, type } = metadata
    metadataMap[key] = { value, type }
  })
  return metadataMap
}
const convertRuleValuesToParams = (ruleValues, namespace, service) => {
  return ruleValues.map(rule => {
    return {
      ...rule,
      metadata: convertMetadataArrayToMap(rule.metadata),
      namespace,
      service,
    }
  })
}

interface RuleIndicator {
  ruleIndex: number
  ruleType: RuleType
  isEdit: boolean
}
export default class RouteCreateDuck extends PageDuck {
  ComposedId: ComposedId
  Data: Routing

  get baseUrl() {
    return null
  }

  get quickTypes() {
    enum Types {
      SWITCH,
      SET_NAMESPACE,
      SET_SERVICE_NAME,
      SET_RULEINDEX,
      SET_RULE_TYPE,
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
      data: reduceFromPayload(types.LOAD, {} as Routing & RuleIndicator),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      submit: createToPayload<void>(types.SUBMIT),
      load: createToPayload<this['Data'] & RuleIndicator>(types.LOAD),
    }
  }
  get rawSelectors() {
    return {
      ...super.rawSelectors,
    }
  }
  async getData(composedId: this['ComposedId']) {
    const { name, namespace } = composedId
    const result = await describeRoutes({
      namespace,
      service: name,
    })
    return result
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
      service: currentService,
      namespace: currentNamespace,
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
    if (ruleType === RuleType.Inbound) {
      const editItem =
        editType === EditType.Json
          ? JSON.parse(inboundJsonValue)
          : {
              sources: convertRuleValuesToParams(inboundSources, inboundNamespace, inboundService),
              destinations: convertRuleValuesToParams(inboundDestinations, currentNamespace, currentService),
            }
      return editItem
    } else {
      const editItem =
        editType === EditType.Json
          ? JSON.parse(outboundJsonValue)
          : {
              sources: convertRuleValuesToParams(outboundSources, currentNamespace, currentService),
              destinations: convertRuleValuesToParams(outboundDestinations, outboundNamespace, outboundService),
            }
      return editItem
      // if (Number(ruleIndex) === -1) {
      //   newArray = (originData.outbounds || []).concat([editItem]);
      // } else {
      //   (originData.outbounds || []).splice(ruleIndex, 1, editItem);
      //   newArray = originData.outbounds;
      // }
      // params = {
      //   ...params,
      //   inbounds: originData.inbounds || [],
      //   outbounds: newArray,
      // };
    }
    // if (originData?.inbounds?.length > 0 || originData?.outbounds?.length > 0) {
    //   const result = yield modifyRoutes([params]);
    // } else {
    //   const result = yield createRoutes([params]);
    // }
    // router.navigate(
    //   `/service-detail?namespace=${currentNamespace}&name=${currentService}&tab=route`
    // );
  }

  *saga() {
    const { types, selector, ducks } = this
    yield* super.saga()
    yield takeLatest(types.LOAD, function*(action) {
      const values = action.payload
      const {
        data: { ruleIndex, ruleType, service, namespace, isEdit },
      } = selector(yield select())
      const emptyRule = {
        service,
        namespace,
        inboundDestinations: [
          {
            service,
            namespace,
            metadata: [{ key: '', value: '', type: MATCH_TYPE.EXACT }],
            priority: 0,
            weight: 100,
            isolate: false,
          },
        ],
        inboundSources: [
          {
            service: '',
            namespace: '',
            metadata: [{ key: '', value: '', type: MATCH_TYPE.EXACT }],
          },
        ],
        outboundSources: [
          {
            service: '',
            namespace: '',
            metadata: [{ key: '', value: '', type: MATCH_TYPE.EXACT }],
          },
        ],
        outboundDestinations: [
          {
            service,
            namespace,
            metadata: [{ key: '', value: '', type: MATCH_TYPE.EXACT }],
            priority: 0,
            weight: 100,
            isolate: false,
          },
        ],
        inboundNamespace: '*',
        inboundService: '*',
        outboundService: '*',
        outboundNamespace: '*',
        editType: EditType.Manual,
        ruleType: ruleType,
        inboundJsonValue: getTemplateRouteInbounds(namespace, service),
        outboundJsonValue: getTemplateRouteOutbounds(namespace, service),
      }
      if (!isEdit) {
        yield put(ducks.form.creators.setValues(emptyRule))
      } else {
        if (values.inbounds || values.outbounds) {
          const routing = values as Routing
          const rule = routing[ruleType][ruleIndex]
          const ruleNamespace =
            ruleType === RuleType.Inbound ? rule.sources?.[0].namespace : rule.destinations?.[0].namespace
          const ruleService = ruleType === RuleType.Inbound ? rule.sources?.[0].service : rule.destinations?.[0].service
          const formValueKey = ruleType === RuleType.Inbound ? 'inbound' : 'outbound'
          return yield put(
            ducks.form.creators.setValues({
              ...emptyRule,
              [`${formValueKey}Destinations`]: convertMetadataMapInArray(rule.destinations),
              [`${formValueKey}Sources`]: convertMetadataMapInArray(rule.sources),
              ruleType,
              [`${formValueKey}Namespace`]: ruleNamespace,
              [`${formValueKey}Service`]: ruleService,
              [`${formValueKey}JsonValue`]: JSON.stringify(rule, null, 4),
            }),
          )
        }
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
  inboundSources(v, meta) {
    if (meta.ruleType !== RuleType.Inbound || meta.editType === EditType.Json) {
      return
    }
    const res = Form.combineValidators<SourceItem[]>([
      {
        metadata(v, meta) {
          const res = Form.combineValidators<MetadataItem[]>([
            {
              key(v) {
                if (!v) return '标签键不能为空'
              },
              value(v) {
                if (!v) return '标签值不能为空'
              },
            },
          ])(v, meta)
          const distinctArray = [...new Set(v?.map(item => item.key))]
          if (distinctArray?.length !== v?.length) {
            return '标签键不能一致'
          }
          return res
        },
      },
    ])(v, meta)
    return res
  },
  outboundSources(v, meta) {
    if (meta.ruleType !== RuleType.Outbound || meta.editType === EditType.Json) {
      return
    }
    const res = Form.combineValidators<SourceItem[]>([
      {
        metadata(v, meta) {
          const res = Form.combineValidators<MetadataItem[]>([
            {
              key(v) {
                if (!v) return '标签键不能为空'
              },
              value(v) {
                if (!v) return '标签值不能为空'
              },
            },
          ])(v, meta)
          const distinctArray = [...new Set(v?.map(item => item.key))]
          if (distinctArray?.length !== v?.length) {
            return res.map(item => ({ ...item, key: '标签键不能一致' }))
          }
          return res
        },
      },
    ])(v, meta)
    return res
  },
  inboundDestinations(v, meta) {
    if (meta.ruleType !== RuleType.Inbound || meta.editType === EditType.Json) {
      return
    }
    const res = Form.combineValidators<DestinationItem[]>([
      {
        metadata(v, meta) {
          const res = Form.combineValidators<MetadataItem[]>([
            {
              key(v) {
                if (!v) return '标签键不能为空'
              },
              value(v) {
                if (!v) return '标签值不能为空'
              },
            },
          ])(v, meta)
          const distinctArray = [...new Set(v?.map(item => item.key))]
          if (distinctArray?.length !== v?.length) {
            return '标签键不能一致'
          }
          return res
        },
      },
    ])(v, meta)
    return res
  },
  outboundDestinations(v, meta) {
    if (meta.ruleType !== RuleType.Outbound || meta.editType === EditType.Json) {
      return
    }
    const res = Form.combineValidators<DestinationItem[]>([
      {
        metadata(v, meta) {
          const res = Form.combineValidators<MetadataItem[]>([
            {
              key(v) {
                if (!v) return '标签键不能为空'
              },
              value(v) {
                if (!v) return '标签值不能为空'
              },
            },
          ])(v, meta)
          const distinctArray = [...new Set(v?.map(item => item.key))]
          if (distinctArray?.length !== v?.length) {
            return '标签键不能一致'
          }
          return res
        },
      },
    ])(v, meta)
    return res
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

export class DynamicRouteCreateDuck extends DynamicDuck {
  get ProtoDuck() {
    return RouteCreateDuck
  }
}
