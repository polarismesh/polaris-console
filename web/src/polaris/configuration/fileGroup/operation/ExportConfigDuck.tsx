import FormDialog from '@src/polaris/common/ducks/FormDialog'
import Form from '@src/polaris/common/ducks/Form'
import { put, select } from 'redux-saga/effects'
import { takeLatest } from 'redux-saga-catch'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import { save } from '@src/polaris/common/components/zip'
import { describeComplicatedNamespaces } from '@src/polaris/namespace/model'
import { describeConfigFileGroups, exportConfigFile } from '../model'
import { createToPayload } from 'saga-duck'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IExportConfigOption {
  configFileGroupList: any[]
  namespaceList: any[]
}

export default class ExportConfigDuck extends FormDialog {
  Options: IExportConfigOption

  get Form() {
    return ExportConfigForm
  }

  get quickDucks() {
    return {
      ...super.quickDucks,
    }
  }
  get quickTypes() {
    enum Types {
      CHANGE_NAMESPACE,
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
      changeNamespace: createToPayload(types.CHANGE_NAMESPACE),
    }
  }
  *execute() {
    yield super.execute(this.ducks.form.defaultValue)
  }
  get rawSelectors() {
    type State = this['State']
    return {
      ...super.rawSelectors,
      canSubmit: (state: State) => !state.submitting && !state.disabled && !!state.options?.configFileGroupList?.length,
    }
  }
  *saga() {
    const { types } = this
    const {
      selectors,
      ducks: { form },
    } = this
    yield* super.saga()

    yield takeLatest(types.CHANGE_NAMESPACE, function*(action) {
      const namespace = action.payload

      yield put(form.creators.setValue('namespace', namespace))
      const { list: configFileGroupList } = yield getAllList(describeConfigFileGroups, {
        listKey: 'list',
        totalKey: 'totalCount',
      })({ namespace })

      const options = selectors.options(yield select())
      yield put({
        type: types.SET_OPTIONS,
        payload: {
          ...options,
          configFileGroupList,
        },
      })
    })
  }

  *onSubmit() {
    const {
      selectors,
      ducks: { form },
    } = this

    const options = selectors.options(yield select())
    const data = form.selectors.values(yield select())
    if (data.exportType === '*') {
      data.groups = options.configFileGroupList.map(c => c.name)
    }
    const zipBlob = yield exportConfigFile({
      namespace: data.namespace,
      groups: data.groups,
    })
    save('config.zip', zipBlob)
  }

  *onShow() {
    yield* super.onShow()
    const {
      selectors,
      ducks: { form },
    } = this
    const options = selectors.options(yield select())
    const data = selectors.data(yield select())

    form.selectors.values(yield select())
    const { list: namespaceList } = yield getAllList(describeComplicatedNamespaces, {
      listKey: 'namespaces',
      totalKey: 'amount',
    })({})

    yield put({
      type: this.types.SET_OPTIONS,
      payload: {
        ...options,
        configFileGroupList: [],
        namespaceList: namespaceList.map(item => {
          return {
            ...item,
            text: item.name,
            value: item.name,
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

class ExportConfigForm extends Form {
  Values: Values
  Meta: any

  get defaultValue(): this['Values'] {
    return {
      namespace: '',
      groups: [],
      exportType: '*',
    }
  }

  validate(v: this['Values'], meta: this['Meta']) {
    return validator(v, meta)
  }
}

const validator = ExportConfigForm.combineValidators<Values, any>({
  namespace(v) {
    if (!v) return '请填写分组名'
  },
})
