import DetailPageDuck from "@src/polaris/common/ducks/DetailPage";
import { reduceFromPayload, createToPayload } from "saga-duck";
import { takeLatest } from "redux-saga-catch";
import { select, put } from "redux-saga/effects";
import Form from "@src/polaris/common/ducks/Form";
import { format as prettyFormat } from "pretty-format";

import {
  LimitRange,
  LimitType,
  LimitResource,
  LimitConfig,
  RateLimit,
  describeLimitRules,
  createRateLimit,
  modifyRateLimit,
} from "../model";
import { EditType } from "./Create";
import router from "@src/polaris/common/util/router";
import { MetadataItem, MATCH_TYPE, RuleType } from "../../route/types";
import { ComposedId, LimitThresholdMode, getTemplateRatelimit } from "../types";
import tips from "@src/polaris/common/util/tips";

const convertMetadataMapInArray = (metadata) => {
  const convertedMetadata = Object.keys(metadata).map((key) => {
    return {
      key,
      value: metadata[key].value,
      type: metadata[key].type ? metadata[key].type : MATCH_TYPE.EXACT,
    };
  });
  return convertedMetadata;
};

const convertMetadataArrayToMap = (metadataArray) => {
  const metadataMap = {};
  metadataArray.forEach((metadata) => {
    const { key, value, type } = metadata;
    metadataMap[key] = { value, type };
  });
  return metadataMap;
};
const convertRuleValuesToParams = (ruleValues) => {
  return ruleValues.map((rule) => {
    return {
      ...rule,
      metadata: convertMetadataArrayToMap(rule.metadata),
    };
  });
};

export default class RouteCreateDuck extends DetailPageDuck {
  ComposedId: ComposedId;
  Data: RateLimit;

  get baseUrl() {
    return "/#/ratelimit-create";
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
        ruleId: state.ruleId,
      }),
    };
  }
  async getData(composedId: this["ComposedId"]) {
    const { name, namespace, ruleId } = composedId;
    const result = await describeLimitRules({
      namespace,
      service: name,
      offset: 0,
      limit: 100,
    });
    let item = result.list.find((item) => item.id === ruleId);
    if (item) {
      item = {
        ...item,
        type: !item.type ? LimitRange.GLOBAL : item.type,
        resource: !item.resource ? LimitResource.QPS : item.resource,
        action: !item.action ? LimitType.REJECT : item.action,
        //太怪了，这里如果没有disable字段，代表是启用状态，我晕了
        disable: item.disable === true ? true : false,
      };
    }
    return item || ({} as RateLimit);
  }
  *saga() {
    const { types, selector, creators, ducks } = this;
    yield* super.saga();
    yield takeLatest(types.FETCH_DONE, function* (action) {
      const values = action.payload;
      const { namespace, service, ruleId } = selector(yield select());
      if (!ruleId || !values) {
        const item = {
          service,
          namespace,
          type: LimitRange.LOCAL,
          action: LimitType.REJECT,
          resource: LimitResource.QPS,
          amounts: [
            {
              maxAmount: 1,
              validDuration: 1,
            },
          ],
          disable: false,
          priority: 0,
          labels: [{ key: "*", value: "*", type: MATCH_TYPE.REGEX }],
          amount_mode: LimitThresholdMode.GLOBAL_TOTAL,
          method: {
            value: "*",
            type: MATCH_TYPE.REGEX,
          },
        };
        const jsonValue = getTemplateRatelimit(namespace, service);
        yield put(
          ducks.form.creators.setValues({
            ...item,
            editType: EditType.Manual,
            jsonValue,
          })
        );
      } else {
        const item = {
          ...values,
        };
        delete item.ctime;
        delete item.mtime;
        delete item.revision;
        const labels = {
          ...values.labels,
        };
        if (labels?.["method"]) delete labels["method"];
        const jsonValue = JSON.stringify(item, null, 4);
        yield put(
          ducks.form.creators.setValues({
            ...item,
            labels: convertMetadataMapInArray(labels),
            editType: EditType.Manual,
            jsonValue,
            amounts: item.amounts.map((item) => ({
              ...item,
              validDuration: Number(item.validDuration.replace("s", "")),
            })),
            method: values.labels?.["method"],
          })
        );
      }
    });
    yield takeLatest(types.SUBMIT, function* (action) {
      const { values } = ducks.form.selector(yield select());
      const { data, ruleId } = selector(yield select());
      yield put(ducks.form.creators.setAllTouched(true));

      const firstInvalid = yield select(ducks.form.selectors.firstInvalid);
      if (firstInvalid) {
        return false;
      }
      const {
        service: currentService,
        namespace: currentNamespace,
        action: behavior,
        resource,
        amounts,
        disable,
        priority,
        labels,
        type,
        editType,
        jsonValue,
        amount_mode,
        method,
      } = values;
      let params = {
        service: currentService,
        namespace: currentNamespace,
        action: behavior,
        resource,
        amounts: amounts.map((item) => ({
          ...item,
          validDuration: item.validDuration.toString() + "s",
        })),
        disable,
        priority,
        labels: { ...convertMetadataArrayToMap(labels), method },
        id: ruleId ? ruleId : undefined,
        type,
        amount_mode: type === LimitRange.GLOBAL ? amount_mode : undefined,
        method,
      } as any;
      if (editType === EditType.Json) {
        params = JSON.parse(jsonValue);
      }
      if (ruleId) {
        const result = yield modifyRateLimit([params]);
      } else {
        const result = yield createRateLimit([params]);
      }
      router.navigate(
        `/service-detail?namespace=${currentNamespace}&name=${currentService}&tab=ratelimit`
      );
    });
  }
}
export interface Values {
  service: string;
  namespace: string;
  type: LimitRange;
  action: LimitType;
  amount_mode: LimitThresholdMode;
  resource: LimitResource;
  amounts: LimitConfig[];
  disable: boolean;
  priority: number;
  labels: MetadataItem[];
  editType: EditType;
  jsonValue: string;
  method: {
    value: string;
    type: MATCH_TYPE;
  };
}
class CreateForm extends Form {
  Values: Values;
  Meta: {};
  validate(v: this["Values"], meta: this["Meta"]) {
    return validator(v, meta);
  }
}
const validator = CreateForm.combineValidators<Values, {}>({
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
});
