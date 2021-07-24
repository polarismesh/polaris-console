import FormDialog from "@src/polaris/common/ducks/FormDialog";
import Form from "@src/polaris/common/ducks/Form";
import { put, select } from "redux-saga/effects";
import { createService, modifyServices, describeNamespaces } from "../model";
import { resolvePromise } from "saga-duck/build/helper";
import { Namespace, READ_ONLY_NAMESPACE } from "../types";
import { NamespaceItem } from "../PageDuck";
import { isReadOnly } from "../utils";

export interface DialogOptions {
  namespaceList?: NamespaceItem[];
  isModify: boolean;
}
export const enableNearbyString = "internal-enable-nearby";
const convertMetaData = (metaData) => {
  let metaDataString = "";
  Object.keys(metaData).forEach((key, index, arr) => {
    if (key !== enableNearbyString) {
      metaDataString += `${key}:${metaData[key]}${
        index < arr.length ? "\n" : ""
      }`;
    }
  });
  return metaDataString;
};
export default class CreateDuck extends FormDialog {
  Options: DialogOptions;
  get Form() {
    return CreateForm;
  }
  get quickTypes() {
    enum Types {
      SET_NAMESPACE_LIST,
    }
    return {
      ...super.quickTypes,
      ...Types,
    };
  }
  *onSubmit() {
    const {
      selectors,
      ducks: { form },
    } = this;
    const options = selectors.options(yield select());
    const values = form.selectors.values(yield select());
    const metaData = {};
    const tags = values.metadata.split("\n");
    tags.forEach((tag) => {
      const [key, value] = tag.split(":");
      metaData[key] = value;
    });
    if (values.enableNearby) {
      metaData[enableNearbyString] = "true";
    }
    if (options.isModify) {
      const res = yield* resolvePromise(
        modifyServices([
          {
            metadata: metaData,
            owners: "polaris",
            name: values.name,
            namespace: values.namespace,
            comment: values.comment,
            ports: values.ports,
            business: values.business,
            cmdb_mod1: "",
            cmdb_mod2: "",
            cmdb_mod3: "",
            department: values.department,
          },
        ])
      );
      return res;
    } else {
      const res = yield* resolvePromise(
        createService([
          {
            metadata: metaData,
            owners: "polaris",
            name: values.name,
            namespace: values.namespace,
            comment: values.comment,
            ports: values.ports,
            business: values.business,
            department: values.department,
          },
        ])
      );
      return res;
    }
  }
  *beforeSubmit() {
    const {
      selectors,
      ducks: { form },
    } = this;
    yield put(form.creators.setAllTouched(true));
    const firstInvalid = yield select(form.selectors.firstInvalid);
    if (firstInvalid) {
      throw false;
    }
  }
  *onShow() {
    yield* super.onShow();
    const {
      selectors,
      ducks: { form },
      types,
    } = this;
    const options = selectors.options(yield select());
    const data = selectors.data(yield select());
    const namespaceList = yield describeNamespaces();
    yield put({
      type: types.SET_OPTIONS,
      payload: {
        ...options,
        namespaceList: namespaceList.map((item) => {
          const disabled = isReadOnly(item.name);
          return {
            ...item,
            value: item.name,
            disabled,
            tooltip: disabled && "该命名空间为只读命名空间",
          };
        }),
      },
    });
    yield put(form.creators.setMeta(options));
    yield put(
      form.creators.setValues({
        ...data,
        metadata: convertMetaData(data.metadata || {}),
        enableNearby: data.metadata && !!data.metadata[enableNearbyString],
      })
    );
    // TODO 表单弹窗逻辑，在弹窗关闭后自动cancel
  }
}
export interface Values {
  namespace: string;
  name: string;
  business: string;
  enableNearby: boolean;
  comment: string;
  metadata: string;
  ports: string;
  department: string;
}
class CreateForm extends Form {
  Values: Values;
  Meta: {};
  validate(v: this["Values"], meta: this["Meta"]) {
    return validator(v, meta);
  }
}
const validator = CreateForm.combineValidators<Values, {}>({
  name(v, meta) {
    if (!v) return "请填写名称";
  },
  namespace(v, meta) {
    if (!v) return "请填写命名空间";
  },
});
