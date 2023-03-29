import FormDialog from '@src/polaris/common/ducks/FormDialog'
import Form from '@src/polaris/common/ducks/Form'
import { put, select } from 'redux-saga/effects'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import { describeComplicatedNamespaces } from '@src/polaris/namespace/model'
import { isReadOnlyNamespace } from '@src/polaris/service/utils'
import { describeConfigFileGroups } from '../model'

export interface IExportOption {}

export default class ExportDuck extends FormDialog {
  Options: IExportOption

  get Form() {
    return ExportForm
  }

  get quickDucks() {
    return {
      ...super.quickDucks,
    }
  }

  *onSubmit(values: this['FormValues'], initialValues: this['Data'], options: this['Options']) {
    throw new Error('Method not implemented.')
  }

  *beforeSubmit() {
    // return true
  }

  *onShow() {
    yield* super.onShow()
    const {
      selectors,
      ducks: { form },
    } = this
    const options = selectors.options(yield select())
    const data = selectors.data(yield select())
    const { list: namespaceList } = yield getAllList(describeComplicatedNamespaces, {
      listKey: 'namespaces',
      totalKey: 'amount',
    })({})
    const { list: configFileGroupList } = yield getAllList(describeConfigFileGroups, {
      listKey: 'list',
      totalKey: 'totalCount',
    })({})

    yield put({
      type: this.types.SET_OPTIONS,
      payload: {
        ...options,
        configFileGroupList,
        namespaceList: namespaceList.map(item => {
          const disabled = isReadOnlyNamespace(item)
          return {
            ...item,
            text: item.name,
            value: item.name,
            disabled,
            tooltip: disabled && '该命名空间为只读命名空间',
          }
        }),
      },
    })
    yield put(form.creators.setMeta(options))
    yield put(form.creators.setValues({ ...data }))
  }
}

export interface Values {
  namespace: string
  groups: string[]
  exportType: string
}

class ExportForm extends Form {
  Values: Values
  Meta: any

  validate(v: this['Values'], meta: this['Meta']) {
    return validator(v, meta)
  }
}

const validator = ExportForm.combineValidators<Values, any>({
  namespace(v) {
    if (!v) return '请填写分组名'
  },
})
