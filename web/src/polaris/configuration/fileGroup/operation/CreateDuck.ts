import { put, select } from 'redux-saga/effects'
import { NamespaceItem } from '@src/polaris/namespace/PageDuck'
import FormDialog from '@src/polaris/common/ducks/FormDialog'
import Form from '@src/polaris/common/ducks/Form'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import { describeComplicatedNamespaces } from '@src/polaris/namespace/model'
import { modifyConfigFileGroup, createConfigFileGroup } from '../model'

export interface DialogOptions {
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

    const { name, comment, namespace } = form.selectors.values(yield select())
    if (options.isModify) {
      const { configFileGroup } = yield modifyConfigFileGroup({ namespace, name, comment })
      return configFileGroup.name
    } else {
      const { configFileGroup } = yield createConfigFileGroup({ namespace, name, comment })
      return configFileGroup.name
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
      },
    })
    yield put(form.creators.setMeta(options))
    yield put(
      form.creators.setValues({
        ...data,
      }),
    )
    // TODO 表单弹窗逻辑，在弹窗关闭后自动cancel
  }
}
export interface Values {
  id: string
  namespace: string
  comment: string
  name: string
}
class CreateForm extends Form {
  Values: Values
  Meta: any
  validate(v: this['Values'], meta: this['Meta']) {
    return validator(v, meta)
  }
}
const validator = CreateForm.combineValidators<Values, any>({
  name(v) {
    if (!v) return '请填写分组名'
  },
})
