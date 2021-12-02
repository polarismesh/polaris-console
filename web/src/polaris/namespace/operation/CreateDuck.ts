import { put, select } from "redux-saga/effects";

import { NamespaceItem } from "../PageDuck";
import FormDialog from "@src/polaris/common/ducks/FormDialog";
import { resolvePromise } from "@src/polaris/common/helpers/saga";
import Form from "@src/polaris/common/ducks/Form";
import { modifyNamespace, createNamespace } from "../model";

export interface DialogOptions {
  namespaceList?: NamespaceItem[];
  isModify: boolean;
  token?: string;
}

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
    if (options.isModify) {
      const res = yield* resolvePromise(
        modifyNamespace([
          {
            name: values.name,
            comment: values.comment,
            owners: values.owners,
            token: "polaris@12345678",
          },
        ]),
      );
      return res;
    } else {
      const res = yield* resolvePromise(
        createNamespace([
          {
            name: values.name,
            comment: values.comment,
            owners: values.owners,
          },
        ]),
      );
      return res;
    }
  }
  *beforeSubmit() {
    const {
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
    } = this;
    const options = selectors.options(yield select());
    const data = selectors.data(yield select());

    yield put(form.creators.setMeta(options));
    yield put(
      form.creators.setValues({
        ...data,
      }),
    );
    // TODO 表单弹窗逻辑，在弹窗关闭后自动cancel
  }
}
export interface Values {
  name: string;
  comment: string;
  owners: string;
}
class CreateForm extends Form {
  Values: Values;
  Meta: {};
  validate(v: this["Values"], meta: this["Meta"]) {
    return validator(v, meta);
  }
}
const validator = CreateForm.combineValidators<Values, {}>({
  name(v) {
    if (!v) return "请填写名称";
  },
});
