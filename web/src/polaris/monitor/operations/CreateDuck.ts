import FormDialog from "@src/polaris/common/ducks/FormDialog";
import Form from "@src/polaris/common/ducks/Form";
import { put, select, call } from "redux-saga/effects";
import { resolvePromise } from "saga-duck/build/helper";
import { MetricQuerySet, MonitorFilter } from "../PageDuck";
import { LabelKeyOptions, MetricNameOptions } from "../types";
import { TimePickerTab } from "./Create";
import { delay } from "redux-saga";

export interface DialogOptions {
  isModify: boolean;
  metricQuerySet?: MetricQuerySet;
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
  *onSubmit() {
    const {
      selectors,
      ducks: { form },
    } = this;
    const options = selectors.options(yield select());
    const values = form.selectors.values(yield select());
    const { filterTime, metricName, monitorFilters } = values;
    const { start, end } = filterTime;
    const step =
      end - start < 86400
        ? 60
        : end - start < 86400 * 7
        ? 300
        : start < 86400 * 30
        ? 1800
        : 3600;
    return { metricName, monitorFilters, start: start, end: end, step };
  }
  *execute(data: Partial<this["Data"]>, options: this["Options"] = null) {
    const duck = this;
    const { selector } = duck;
    const { options: oldOptions } = selector(yield select());
    if (options !== oldOptions) {
      yield put({
        type: duck.types.SET_OPTIONS,
        payload: options,
      });
    }
    let submitData;
    yield* this.show(data, function* () {
      const state = selector(yield select());
      const values = state.form.values;

      submitData = yield call(
        [duck, duck.onSubmit],
        values,
        data,
        state.options
      );
    });
    return submitData;
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
    yield delay(100);
    yield put(form.creators.setMeta(options));
    yield put(
      form.creators.setValues({
        metricName: MetricNameOptions[0].value,
        monitorFilters: [
          {
            labelKey: "",
            labelValue: "",
          },
        ],

        ...data,
      })
    );
    // TODO 表单弹窗逻辑，在弹窗关闭后自动cancel
  }
}
interface FilterTime {
  start: number;
  end: number;
}
export interface Values {
  metricName: string;
  monitorFilters: MonitorFilter[];
  filterTime: FilterTime;
  originFilterTime?: FilterTime;
}
class CreateForm extends Form {
  Values: Values;
  Meta: {};
  validate(v: this["Values"], meta: this["Meta"]) {
    return validator(v, meta);
  }
}
const validator = CreateForm.combineValidators<Values, {}>({});
