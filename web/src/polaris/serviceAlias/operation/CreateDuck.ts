import { put, select } from 'redux-saga/effects'
import { ServiceItem, NamespaceItem } from '@src/polaris/service/PageDuck'
import FormDialog from '@src/polaris/common/ducks/FormDialog'
import { resolvePromise } from 'saga-duck/build/helper'
import { modifyGovernanceAlias, createGovernanceAlias } from '../model'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import Form from '@src/polaris/common/ducks/Form'
import { describeComplicatedNamespaces } from '@src/polaris/namespace/model'
import { describeServices } from '@src/polaris/service/model'

export interface DialogOptions {
  serviceList?: ServiceItem[]
  namespaceList?: NamespaceItem[]
  isModify: boolean
}

export default class CreateDuck extends FormDialog {
  Options: DialogOptions
  get Form() {
    return CreateForm
  }
  get quickTypes() {
    enum Types {
      SET_NAMESPACE_LIST,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  *onSubmit() {
    const {
      selectors,
      ducks: { form },
    } = this
    const options = selectors.options(yield select())
    const values = form.selectors.values(yield select())
    const [serviceName, namespaceName] = values.service.split('=>')
    if (options.isModify) {
      const res = yield* resolvePromise(
        modifyGovernanceAlias({
          alias: values.alias,
          alias_namespace: values.alias_namespace,
          namespace: namespaceName,
          service: serviceName,
          comment: values.comment,
        }),
      )
      return res
    } else {
      const res = yield* resolvePromise(
        createGovernanceAlias({
          alias: values.alias,
          alias_namespace: values.alias_namespace,
          namespace: namespaceName,
          service: serviceName,
          comment: values.comment,
        }),
      )
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
      types,
    } = this
    const options = selectors.options(yield select())
    const data = selectors.data(yield select())
    const { list: namespaceList } = yield getAllList(describeComplicatedNamespaces, {
      listKey: 'namespaces',
      totalKey: 'amount',
    })({})
    const { list: serviceList } = yield getAllList(describeServices)({})

    yield put({
      type: types.SET_OPTIONS,
      payload: {
        ...options,
        namespaceList: namespaceList.map(item => {
          return {
            ...item,
            value: item.name,
          }
        }),
        serviceList: serviceList.map(item => {
          return {
            ...item,
            text: `${item.name}（${item.namespace}）`,
            value: `${item.name}=>${item.namespace}`,
          }
        }),
      },
    })
    yield put(form.creators.setMeta(options))
    yield put(
      form.creators.setValues({
        ...data,
        service: data.service ? `${data.service}=>${data.namespace}` : undefined,
      }),
    )
    // TODO 表单弹窗逻辑，在弹窗关闭后自动cancel
  }
}
export interface Values {
  alias_namespace: string
  alias: string
  service: string
  namespace: string
  comment: string
}
class CreateForm extends Form {
  Values: Values
  Meta: {}
  validate(v: this['Values'], meta: this['Meta']) {
    return validator(v, meta)
  }
}
const validator = CreateForm.combineValidators<Values, {}>({
  service(v) {
    if (!v) return '请选择指向服务'
  },
  alias_namespace(v) {
    if (!v) return '请选择别名所在命名空间'
  },
  alias(v) {
    if (!v) return '请填写别名'
  },
})
