import DetailPageDuck from "@src/polaris/common/ducks/DetailPage";
import { reduceFromPayload, createToPayload } from "saga-duck";
import { takeLatest } from "redux-saga-catch";
import { select, put } from "redux-saga/effects";
import Form from "@src/polaris/common/ducks/Form";
import { format as prettyFormat } from "pretty-format";

import {
  Destination,
  Source,
  RuleType,
  DestinationItem,
  SourceItem,
  MATCH_TYPE,
  PolicyName,
  BREAK_RESOURCE_TYPE,
  OutlierDetectWhen,
  getTemplateCircuitBreakerInbounds,
  getTemplateCircuitBreakerOutbounds,
} from "../types";
import {
  describeServiceCircuitBreaker,
  CircuitBreaker,
  createServiceCircuitBreaker,
  modifyServiceCircuitBreaker,
  releaseServiceCircuitBreaker,
  createServiceCircuitBreakerVersion,
} from "../model";
import { ComposedId } from "../../types";
import { EditType } from "./Create";
import router from "@src/polaris/common/util/router";
import service from "@src/polaris/service";
import { MetadataItem } from "../../route/types";
import tips from "@src/polaris/common/util/tips";

const convertMetadataMapToArray = (metadata) => {
  return Object.keys(metadata).map((key) => {
    return {
      key,
      value: metadata[key].value,
      type: metadata[key].type ? metadata[key].type : MATCH_TYPE.EXACT,
    };
  });
};
const convertMetadataArrayToMap = (metadataArray) => {
  const metadataMap = {};
  metadataArray.forEach((metadata) => {
    const { key, value, type } = metadata;
    metadataMap[key] = { value, type };
  });
  return metadataMap;
};
const convertPolicyArrayToMap = (policyArray) => {
  const metadataMap = {};
  policyArray.forEach((policy) => {
    const {
      policyName,
      errorRateToOpen,
      slowRateToOpen,
      maxRt,
      requestVolumeThreshold,
      consecutiveErrorToOpen,
    } = policy;
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
          };
  });
  return metadataMap;
};
const convertPolicyMapToArray = (policy) => {
  const policyArray = Object.keys(policy).map((key) => {
    return { policyName: key, ...policy[key] };
  });
  return policyArray;
};
export default class RouteCreateDuck extends DetailPageDuck {
  ComposedId: ComposedId;
  Data: CircuitBreaker;

  get baseUrl() {
    return "/#/circuitBreaker-create";
  }

  get params() {
    const { types } = this;
    return [
      ...super.params,
      {
        key: "namespace",
        type: types.SET_NAMESPACE,
        defaults: "",
      },
      {
        key: "service",
        type: types.SET_SERVICE_NAME,
        defaults: "",
      },
      {
        key: "ruleIndex",
        type: types.SET_RULEINDEX,
        defaults: -1,
      },
      {
        key: "ruleType",
        type: types.SET_RULE_TYPE,
        defaults: RuleType.Inbound,
      },
      {
        key: "ruleId",
        type: types.SET_RULE_ID,
        defaults: "",
      },
    ];
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
    }
    return {
      ...super.quickTypes,
      ...Types,
    };
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      form: CreateForm,
    };
  }
  get reducers() {
    const { types } = this;
    return {
      ...super.reducers,
      namespace: reduceFromPayload(types.SET_NAMESPACE, ""),
      service: reduceFromPayload(types.SET_SERVICE_NAME, ""),
      ruleId: reduceFromPayload(types.SET_RULE_ID, ""),
      ruleIndex: reduceFromPayload(types.SET_RULEINDEX, -1),
      ruleType: reduceFromPayload(types.SET_RULE_TYPE, RuleType.Inbound),
    };
  }
  get creators() {
    const { types } = this;
    return {
      ...super.creators,
      submit: createToPayload<void>(types.SUBMIT),
    };
  }
  get rawSelectors() {
    type State = this["State"];
    return {
      ...super.rawSelectors,
      composedId: (state: State) => ({
        name: state.service,
        namespace: state.namespace,
      }),
    };
  }
  async getData(composedId: this["ComposedId"]) {
    const { name, namespace } = composedId;
    const result = await describeServiceCircuitBreaker({
      namespace,
      service: name,
    });
    return result || ({} as any);
  }
  *saga() {
    const { types, selector, creators, ducks } = this;
    yield* super.saga();
    yield takeLatest(types.FETCH_DONE, function* (action) {
      const values = action.payload;
      const { ruleIndex, ruleType, service, namespace } = selector(
        yield select()
      );
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
              sleepWindow: "1s",
              outlierDetectWhen: OutlierDetectWhen.ON_RECOVER,
            },
            resource: BREAK_RESOURCE_TYPE.INSTANCE,
            method: {
              value: "",
            },
          },
        ],
        inboundSources: [
          {
            service: "",
            namespace: "",
            labels: [{ key: "", value: "", type: MATCH_TYPE.EXACT }],
          },
        ],
        outboundSources: [
          {
            service: "",
            namespace: "",
            labels: [{ key: "", value: "", type: MATCH_TYPE.EXACT }],
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
              sleepWindow: "1s",
              outlierDetectWhen: OutlierDetectWhen.ON_RECOVER,
            },
            resource: BREAK_RESOURCE_TYPE.INSTANCE,
            method: {
              value: "",
            },
          },
        ],
        inboundNamespace: "*",
        inboundService: "*",
        outboundService: "*",
        outboundNamespace: "*",
        editType: EditType.Manual,
        ruleType: RuleType.Inbound,
        inboundJsonValue: getTemplateCircuitBreakerInbounds(),
        outboundJsonValue: getTemplateCircuitBreakerOutbounds(),
      };
      if (Number(ruleIndex) === -1) {
        yield put(ducks.form.creators.setValues(emptyRule));
      } else {
        const circuitBreaker = values as CircuitBreaker;
        const rule = circuitBreaker[ruleType][ruleIndex];
        const ruleNamespace =
          ruleType === RuleType.Inbound
            ? rule.sources?.[0].namespace
            : rule.destinations?.[0].namespace;
        const ruleService =
          ruleType === RuleType.Inbound
            ? rule.sources?.[0].service
            : rule.destinations?.[0].service;
        const formValueKey =
          ruleType === RuleType.Inbound ? "inbound" : "outbound";
        return yield put(
          ducks.form.creators.setValues({
            ...emptyRule,
            [`${formValueKey}Destinations`]: rule.destinations.map((item) => ({
              ...item,
              policy: convertPolicyMapToArray(item.policy),
              resource: item.resource
                ? item.resource
                : BREAK_RESOURCE_TYPE.INSTANCE,
            })),
            [`${formValueKey}Sources`]: rule.sources.map((item) => ({
              ...item,
              labels: convertMetadataMapToArray(item.labels),
            })),
            ruleType,
            [`${formValueKey}Namespace`]: ruleNamespace,
            [`${formValueKey}Service`]: ruleService,
            [`${formValueKey}JsonValue`]: JSON.stringify(rule, null, 4),
          })
        );
      }
    });
    yield takeLatest(types.SUBMIT, function* (action) {
      const { values } = ducks.form.selector(yield select());
      const { ruleIndex, data, namespace, service } = selector(yield select());
      yield put(ducks.form.creators.setAllTouched(true));
      const firstInvalid = yield select(ducks.form.selectors.firstInvalid);
      if (firstInvalid) {
        return false;
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
      } = values;
      let params = {
        service: currentService,
        namespace: currentNamespace,
      } as any;
      if (ruleType === RuleType.Inbound) {
        const editItem =
          editType === EditType.Json
            ? JSON.parse(inboundJsonValue)
            : {
                sources: inboundSources.map((source) => {
                  return {
                    ...source,
                    labels: convertMetadataArrayToMap(source.labels),
                    namespace: inboundNamespace,
                    service: inboundService,
                  };
                }),
                destinations: inboundDestinations.map((destination) => {
                  return {
                    ...destination,
                    policy: convertPolicyArrayToMap(destination.policy),

                    namespace: undefined,
                    service: undefined,
                  };
                }),
              };
        let newArray;
        if (Number(ruleIndex) === -1) {
          newArray = (data.inbounds || []).concat([editItem]);
        } else {
          (data.inbounds || []).splice(ruleIndex, 1, editItem);
          newArray = data.inbounds;
        }
        params = {
          ...params,
          inbounds: newArray,
          outbounds: data.outbounds || [],
        };
      } else {
        const editItem =
          editType === EditType.Json
            ? JSON.parse(outboundJsonValue)
            : {
                sources: outboundSources.map((source) => {
                  return {
                    ...source,
                    labels: convertMetadataArrayToMap(source.labels),
                    namespace: undefined,
                    service: undefined,
                  };
                }),
                destinations: outboundDestinations.map((destination) => {
                  return {
                    ...destination,
                    namespace: outboundNamespace,
                    service: outboundService,
                    policy: convertPolicyArrayToMap(destination.policy),
                  };
                }),
              };
        let newArray;
        if (Number(ruleIndex) === -1) {
          newArray = (data.outbounds || []).concat([editItem]);
        } else {
          (data.outbounds || []).splice(ruleIndex, 1, editItem);
          newArray = data.outbounds;
        }
        params = {
          ...params,
          inbounds: data.inbounds || [],
          outbounds: newArray,
        };
      }
      if (data.id) {
        const version = new Date().getTime().toString();
        const versionResult = yield createServiceCircuitBreakerVersion([
          { ...params, id: data.id, version, name: service },
        ]);
        const releaseParams = {
          service: {
            name: service,
            namespace,
          },
          circuitBreaker: {
            name: service,
            namespace,
            version,
          },
        };
        yield releaseServiceCircuitBreaker([releaseParams]);
      } else {
        const createResult = yield createServiceCircuitBreaker([
          { ...params, owners: "Polaris", name: service },
        ]);
        if (createResult.code === 200000) {
          const version = new Date().getTime().toString();
          const versionResult = yield createServiceCircuitBreakerVersion([
            { ...params, id: data.id, version, name: service },
          ]);
          const releaseParams = {
            service: {
              name: service,
              namespace,
            },
            circuitBreaker: {
              name: service,
              namespace,
              version,
            },
          };
          yield releaseServiceCircuitBreaker([releaseParams]);
        }
      }
      router.navigate(
        `/service-detail?namespace=${currentNamespace}&name=${currentService}&tab=circuitBreaker`
      );
    });
  }
}
export interface Values {
  service: string;
  namespace: string;
  inboundDestinations: DestinationItem[];
  inboundSources: SourceItem[];
  outboundDestinations: DestinationItem[];
  outboundSources: SourceItem[];
  inboundNamespace: string;
  inboundService: string;
  outboundService: string;
  outboundNamespace: string;
  editType: EditType;
  ruleType: RuleType;
  inboundJsonValue?: string;
  outboundJsonValue?: string;
}
class CreateForm extends Form {
  Values: Values;
  Meta: {};
  validate(v: this["Values"], meta: this["Meta"]) {
    return validator(v, meta);
  }
}
const validator = CreateForm.combineValidators<Values, {}>({
  inboundJsonValue(v, meta) {
    if (meta.editType === EditType.Json && meta.ruleType === RuleType.Inbound) {
      try {
        JSON.parse(v);
      } catch (e) {
        return "请输入正确的JSON字符串";
      }
    }
  },
  outboundJsonValue(v, meta) {
    if (
      meta.editType === EditType.Json &&
      meta.ruleType === RuleType.Outbound
    ) {
      try {
        JSON.parse(v);
      } catch (e) {
        return "请输入正确的JSON字符串";
      }
    }
  },
  inboundNamespace(v, meta) {
    if (
      !v &&
      meta.ruleType === RuleType.Inbound &&
      meta.editType !== EditType.Json
    ) {
      return "请输入命名空间";
    }
  },
  inboundService(v, meta) {
    if (
      !v &&
      meta.ruleType === RuleType.Inbound &&
      meta.editType !== EditType.Json
    ) {
      return "请输入服务名";
    }
  },
  outboundNamespace(v, meta) {
    if (
      !v &&
      meta.ruleType === RuleType.Outbound &&
      meta.editType !== EditType.Json
    ) {
      return "请输入命名空间";
    }
  },
  outboundService(v, meta) {
    if (
      !v &&
      meta.ruleType === RuleType.Outbound &&
      meta.editType !== EditType.Json
    ) {
      return "请输入服务名";
    }
  },
  inboundSources(v, meta) {
    if (meta.ruleType !== RuleType.Inbound || meta.editType === EditType.Json) {
      return;
    }
    const res = Form.combineValidators<SourceItem[]>([
      {
        labels(v, meta) {
          const res = Form.combineValidators<MetadataItem[]>([
            {
              key(v) {
                if (!v) return "标签键不能为空";
              },
              value(v) {
                if (!v) return "标签值不能为空";
              },
            },
          ])(v, meta);
          return res;
        },
      },
    ])(v, meta);
    return res;
  },
  outboundSources(v, meta) {
    if (
      meta.ruleType !== RuleType.Outbound ||
      meta.editType === EditType.Json
    ) {
      return;
    }
    const res = Form.combineValidators<SourceItem[]>([
      {
        labels(v, meta) {
          const res = Form.combineValidators<MetadataItem[]>([
            {
              key(v) {
                if (!v) return "标签键不能为空";
              },
              value(v) {
                if (!v) return "标签值不能为空";
              },
            },
          ])(v, meta);
          return res;
        },
      },
    ])(v, meta);
    return res;
  },
});
