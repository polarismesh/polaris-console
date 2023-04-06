import FormDialog from '@src/polaris/common/ducks/FormDialog'
import Form from '@src/polaris/common/ducks/Form'
import { put, select } from 'redux-saga/effects'
import { takeLatest } from 'redux-saga-catch'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import { describeComplicatedNamespaces } from '@src/polaris/namespace/model'
import { describeConfigFileGroups, importConfigFile } from '../model'
import { createToPayload } from 'saga-duck'
import { isReadOnlyNamespace } from '@src/polaris/service/utils'

export interface IImportOption {
  namespaceList: string[]
  showImportResult: boolean
}

export default class ImportDuck extends FormDialog {
  Options: IImportOption

  get Form() {
    return ImportForm
  }

  get quickDucks() {
    return {
      ...super.quickDucks,
    }
  }

  get quickTypes() {
    enum Types {
      IMPORT_CONFIG_FILES,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }

  get creators() {
    const { types } = this
    return {
      ...super.creators,
      importConfig: createToPayload(types.IMPORT_CONFIG_FILES),
    }
  }

  *execute() {
    yield super.execute(this.ducks.form.defaultValue)
  }

  *saga() {
    const { types } = this
    const {
      ducks: { form },
      selectors,
      creators,
    } = this
    yield* super.saga()

    yield takeLatest(types.IMPORT_CONFIG_FILES, function*() {
      const data = form.selectors.values(yield select())

      const options = selectors.options(yield select())

      const importResult = yield importConfigFile(data)
      // 如果没有结果返回，就说明请求失败了
      if (importResult) {
        yield put({
          type: types.SET_OPTIONS,
          payload: {
            ...options,
            showImportResult: true,
            importResult,
          },
        })
      } else {
        yield put(creators.hide())
      }
    })
  }
  *onSubmit() {}

  *beforeSubmit() {}

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
        showImportResult: false,
        importResult: {},
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

export type TConflictHandling = 'skip' | 'overwrite'

export interface Values {
  namespace: string
  config: File
  group?: string
  conflict_handling: TConflictHandling
}

class ImportForm extends Form {
  Values: Values
  Meta: any

  get defaultValue() {
    return {
      namespace: '',
      config: null,
      group: '',
      conflict_handling: 'skip' as TConflictHandling,
    }
  }

  validate(v: this['Values'], meta: this['Meta']) {
    return validator(v, meta)
  }
}

const validator = ImportForm.combineValidators<Values, any>({
  namespace(v) {
    if (!v) return '请填写分组名'
  },
})
