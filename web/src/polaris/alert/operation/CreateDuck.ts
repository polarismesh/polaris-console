import { put, select } from 'redux-saga/effects'
import FormDialog from '@src/polaris/common/ducks/FormDialog'
import { resolvePromise } from '@src/polaris/common/helpers/saga'
import Form from '@src/polaris/common/ducks/Form'
import { modifyAlertRule, createAlertRule } from '../model'
import { AlertInfo, AlterExpr, CallbackType } from '../types'
import { notification } from 'tea-component'

export interface DialogOptions {
  isModify: boolean
  data?: AlertInfo
}

export default class CreateDuck extends FormDialog {
  Options: DialogOptions
  get Form() {
    return CreateForm
  }
  get quickTypes() {
    enum Types {}
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
    }
  }
  *onSubmit() {
    const {
      selectors,
      ducks: { form },
    } = this
    const options = selectors.options(yield select())
    const values = form.selectors.values(yield select())
    if (options.isModify) {
      const res = yield* resolvePromise(
        modifyAlertRule([
          {
            id: values.id,
            name: values.name,
            monitor_type: values.monitor_type,
            alter_expr: {
              metrics_name: values.alter_expr.metrics_name,
              expr: values.alter_expr.expr,
              value: values.alter_expr.value.toString(),
              for: values.alter_expr.for,
              for_unit: values.alter_expr.for_unit,
            },
            interval: values.interval,
            interval_unit: values.interval_unit,
            topic: values.topic,
            message: values.message,
            callback: {
              type: CallbackType.WebHook,
              info: {
                url: values?.callback?.info?.url,
              },
            },
          },
        ]),
      )
      if (res.code !== 200000) {
        notification.error({ description: res.info })
        throw false
      }
      return res
    } else {
      const res = yield* resolvePromise(
        createAlertRule([
          {
            name: values.name,
            monitor_type: values.monitor_type,
            alter_expr: {
              metrics_name: values.alter_expr.metrics_name,
              expr: values.alter_expr.expr,
              value: values.alter_expr.value.toString(),
              for: values.alter_expr.for,
              for_unit: values.alter_expr.for_unit,
            },
            interval: values.interval,
            interval_unit: values.interval_unit,
            topic: values.topic,
            message: values.message,
            callback: {
              type: CallbackType.WebHook,
              info: {
                url: values?.callback?.info?.url,
              },
            },
            enable: false,
          },
        ]),
      )
      if (res.code !== 200000) {
        notification.error({ description: res.info })
        throw false
      }
      return res
    }
  }
  *beforeSubmit() {
    const {
      ducks: { form },
    } = this
    yield put(form.creators.setAllTouched(true))
    const firstInvalid = yield select(form.selectors.firstInvalid)
    if (firstInvalid) {
      throw false
    }
  }
  *onShow() {
    yield* super.onShow()
    const {
      selectors,
      ducks: { form },
    } = this
    const options = selectors.options(yield select())
    yield put(form.creators.setMeta(options))
    yield put(
      form.creators.setValues({
        ...options.data,
      }),
    )
    // TODO 表单弹窗逻辑，在弹窗关闭后自动cancel
  }
}
export type Values = AlertInfo
class CreateForm extends Form {
  Values: Values
  Meta: {}
  validate(v: this['Values'], meta: this['Meta']) {
    return validator(v, meta)
  }
}
const validator = CreateForm.combineValidators<Values, {}>({
  name(v) {
    if (!v) return '请填写名称'
  },
  monitor_type(v) {
    if (!v) return '请填写监控类型'
  },
  alter_expr(v, meta) {
    const res = CreateForm.combineValidators<AlterExpr>({
      metrics_name(v) {
        if (!v) return '请选择请求指标'
      },
      expr(v) {
        if (!v) return '请选择表达式'
      },
      value(v) {
        if (!v) return '请选择阈值'
      },
      for(v) {
        if (!v) return '请输入持续时长'
      },
      for_unit(v) {
        if (!v) return '请选择持续时长单位'
      },
    })(v, meta)
    return res
  },
  interval(v) {
    if (!v) return '请选择告警周期'
  },
  interval_unit(v) {
    if (!v) return '请选择告警周期'
  },
  topic(v) {
    if (!v) return '请输入告警主题'
  },
  message(v) {
    if (!v) return '请输入告警消息'
  },
})
