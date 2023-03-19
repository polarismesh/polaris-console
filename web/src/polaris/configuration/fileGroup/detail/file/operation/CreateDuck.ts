import { put, select } from 'redux-saga/effects'
import { takeLatest } from 'redux-saga-catch'
import { NamespaceItem } from '@src/polaris/namespace/PageDuck'
import FormDialog from '@src/polaris/common/ducks/FormDialog'
import Form from '@src/polaris/common/ducks/Form'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import { describeComplicatedNamespaces } from '@src/polaris/namespace/model'
import { KeyValuePair, ConfigFileGroup } from '@src/polaris/configuration/fileGroup/types'
import {
  describeConfigFileGroups,
  createConfigFile,
  modifyConfigFile,
} from '@src/polaris/configuration/fileGroup/model'
import { reduceFromPayload } from 'saga-duck'
import { notification } from 'tea-component'
import { isReadOnlyConfigGroup, isReadOnlyNamespace } from '@src/polaris/service/utils'

export interface DialogOptions {
  namespaceList?: NamespaceItem[]
  isModify?: boolean
}

export default class CreateDuck extends FormDialog {
  Options: DialogOptions
  get Form() {
    return CreateForm
  }
  get quickTypes() {
    enum Types {
      SET_NAMESPACE_LIST,
      SET_CONFIGGROUP_LIST,
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
  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      configGroupList: reduceFromPayload(types.SET_CONFIGGROUP_LIST, [] as ConfigFileGroup[]),
    }
  }
  *onSubmit() {
    const {
      ducks: { form },
      selectors,
    } = this

    const { name, comment, namespace, group, format, tags } = form.selectors.values(yield select())
    const options = selectors.options(yield select())
    const data = selectors.data(yield select())
    const parsedName = name
      .split('/')
      .filter(item => item !== '')
      .join('/')

    if (options.isModify) {
      const { configFile } = yield modifyConfigFile({
        ...data,
        name: parsedName,
        comment,
        namespace,
        group,
        format,
        tags,
      })
      if (configFile?.name) {
        notification.success({ description: this.t('编辑成功') })
        return true
      } else {
        notification.error({ description: this.t('编辑失败') })
        return false
      }
    } else {
      const { configFile } = yield createConfigFile({
        name: parsedName,
        comment,
        namespace,
        group,
        format,
        tags,
        content: '',
      })
      if (configFile?.name) {
        notification.success({ description: this.t('创建成功') })
        return true
      } else {
        notification.error({ description: this.t('创建失败') })
        return false
      }
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
  *saga() {
    const {
      ducks: { form },
      types,
      selector,
      selectors,
    } = this
    super.saga()
    yield takeLatest(form.types.SET_VALUE, function*(action) {
      if (!action.path || action.path?.indexOf('namespace') === -1) {
        return
      }
      const options = selectors.options(yield select())
      const {
        form: {
          values: { namespace },
        },
      } = selector(yield select())
      const { list } = yield getAllList(describeConfigFileGroups, {})({ namespace })
      yield put({
        type: types.SET_OPTIONS,
        payload: {
          ...options,
          configFileGroupList: list.map(item => {
            const disabled = isReadOnlyConfigGroup(item)
            return {
              ...item,
              text: item.name,
              value: item.name,
              disabled,
              tooltip: disabled && this.t('该配置分组为只读配置分组'),
            }
          }),
        },
      })
    })
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
    const { list: configFileGroupList } = yield getAllList(
      describeConfigFileGroups,
      {},
    )({ namespace: data?.namespace || namespaceList?.[0].name })
    yield put({
      type: types.SET_OPTIONS,
      payload: {
        ...options,
        namespaceList: namespaceList.map(item => {
          const disabled = isReadOnlyNamespace(item)
          return {
            ...item,
            text: item.name,
            value: item.name,
            disabled,
            tooltip: disabled && this.t('该命名空间为只读命名空间'),
          }
        }),
        configFileGroupList: configFileGroupList.map(item => {
          const disabled = isReadOnlyConfigGroup(item)
          return {
            ...item,
            text: item.name,
            value: item.name,
            disabled,
            tooltip: disabled && this.t('该配置分组为只读配置分组'),
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
  group: string
  format: string
  tags?: Array<KeyValuePair>
}
class CreateForm extends Form {
  Values: Values
  Meta: any
  validate(v: this['Values'], meta: this['Meta']) {
    return validator(v, meta)
  }
  get quickTypes() {
    enum Types {
      SET_NAMESPACE,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get actionMapping() {
    return {
      ...super.actionMapping,
      namespace: this.types.SET_NAMESPACE,
    }
  }
}
const validator = CreateForm.combineValidators<Values, any>({
  name(v) {
    if (!v) return this.t('请填写文件名')

    if (v.split('/').filter(item => !item).length > 1) {
      return this.t('文件夹名字不可为空')
    }
  },
  namespace(v) {
    if (!v) return this.t('请选择命名空间')
  },
  group(v) {
    if (!v) return this.t('请选择分组')
  },
  format(v) {
    if (!v) return this.t('请选择格式')
  },
})
