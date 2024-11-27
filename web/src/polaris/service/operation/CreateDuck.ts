import FormDialog from '@src/polaris/common/ducks/FormDialog'
import Form from '@src/polaris/common/ducks/Form'
import { put, select } from 'redux-saga/effects'
import { createService, modifyServices, describeNamespaces } from '../model'
import { resolvePromise } from 'saga-duck/build/helper'
import { NamespaceItem } from '../PageDuck'
import { isReadOnlyNamespace } from '../utils'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import { describeGovernanceStrategies, AuthStrategy } from '@src/polaris/auth/model'
import { UserSelectDuck } from '@src/polaris/auth/userGroup/operation/CreateDuck'
import { UserGroupSelectDuck } from '@src/polaris/auth/user/operation/AttachUserGroupDuck'
import { diffAddRemoveArray } from '@src/polaris/common/util/common'
import { DescribeStrategyOption } from '@src/polaris/auth/constants'
import { KeyValuePair } from '@src/polaris/configuration/fileGroup/types'

export enum VisibilityMode {
  Single = 'single',
  All = 'all',
}
export const VisibilityModeMap = {
  [VisibilityMode.Single]: '仅当前命名空间可见',
  [VisibilityMode.All]: '全部命名空间可见（包括新增）',
}
export const CheckVisibilityMode = (exportTo = [], namespace) => {
  if (!exportTo?.length) {
    return VisibilityMode.Single
  }
  return exportTo?.includes('*')
    ? VisibilityMode.All
    : (exportTo.length === 1 && exportTo?.[0] === namespace) || exportTo.length === 0
    ? VisibilityMode.Single
    : ''
}
export interface DialogOptions {
  namespaceList?: NamespaceItem[]
  isModify: boolean
  authOpen: boolean
}
export const enableNearbyString = 'internal-enable-nearby'

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
      userSelect: UserSelectDuck,
      userGroupSelect: UserGroupSelectDuck,
    }
  }
  *onSubmit() {
    const {
      selectors,
      ducks: { form, userGroupSelect, userSelect },
    } = this
    const userIds = userSelect.selector(yield select()).selection.map(item => item.id)
    const groupIds = userGroupSelect.selector(yield select()).selection.map(item => item.id)
    const { userIds: originUsers, groupIds: originGroups } = selectors.data(yield select())
    const options = selectors.options(yield select())
    const values = form.selectors.values(yield select())
    const { removeArray: removeUserIds } = diffAddRemoveArray(originUsers, userIds)
    const { removeArray: removeGroupIds } = diffAddRemoveArray(originGroups, groupIds)
    const metaData: Record<string, string> =
      values?.metadata?.reduce((preV, curV) => {
        preV[curV.key] = curV.value
        return preV
      }, {}) || {}

    if (values.enableNearby) {
      metaData[enableNearbyString] = 'true'
    }
    if (values?.visibilityMode === VisibilityMode.All) {
      values.export_to = ['*']
    }
    if (options.isModify) {
      const res = yield* resolvePromise(
        modifyServices([
          {
            metadata: metaData,
            owners: 'polaris',
            name: values.name,
            namespace: values.namespace,
            comment: values.comment,
            ports: values.ports,
            business: values.business,
            cmdb_mod1: '',
            cmdb_mod2: '',
            cmdb_mod3: '',
            department: values.department,
            user_ids: userIds,
            group_ids: groupIds,
            remove_user_ids: removeUserIds,
            remove_group_ids: removeGroupIds,
            export_to: values.export_to,
            sync_to_global_registry: values.sync_to_global_registry,
          },
        ]),
      )
      return res
    } else {
      const res = yield* resolvePromise(
        createService([
          {
            metadata: metaData,
            owners: 'polaris',
            name: values.name,
            namespace: values.namespace,
            comment: values.comment,
            ports: values.ports,
            business: values.business,
            department: values.department,
            user_ids: userIds,
            group_ids: groupIds,
            export_to: values.export_to,
            sync_to_global_registry: values.sync_to_global_registry,
          },
        ]),
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
      ducks: { form, userGroupSelect, userSelect },
      types,
    } = this
    const options = selectors.options(yield select())
    const data = selectors.data(yield select())
    const namespaceList = yield describeNamespaces()
    const authOpen = options.authOpen
    if (authOpen) {
      yield put(userGroupSelect.creators.load({}))
      yield put(userSelect.creators.load({}))
    }
    if (options.isModify && authOpen) {
      const { list: allStrategies } = yield getAllList(describeGovernanceStrategies, { listKey: 'content' })({
        res_id: data.id,
        res_type: 'service',
        default: DescribeStrategyOption.Default, //only default
        show_detail: true,
      })
      const users = [],
        groups = []
      allStrategies.forEach((item: AuthStrategy) => {
        users.push(...item.principals.users)
        groups.push(...item.principals.groups)
      })
      yield put(userGroupSelect.creators.select(groups))
      yield put(userSelect.creators.select(users))
      yield put({
        type: types.UPDATE,
        payload: { ...data, userIds: users.map(item => item.id), groupIds: groups.map(item => item.id) },
      })
    }
    yield put({
      type: types.SET_OPTIONS,
      payload: {
        ...options,
        namespaceList: namespaceList.map(item => {
          const disabled = isReadOnlyNamespace(item)
          return {
            ...item,
            value: item.name,
            disabled,
            tooltip: disabled && '该命名空间为只读命名空间',
          }
        }),
      },
    })
    yield put(form.creators.setMeta(options))
    const visibilityMode = CheckVisibilityMode(data.export_to, data.namespace)
    if (visibilityMode === VisibilityMode.All) data.export_to = []
    yield put(form.creators.setMeta(options))
    yield put(
      form.creators.setValues({
        ...data,
        visibilityMode,
      }),
    )
    // TODO 表单弹窗逻辑，在弹窗关闭后自动cancel
  }
}
export interface Values {
  namespace: string
  name: string
  business: string
  enableNearby: boolean
  comment: string
  metadata: Array<KeyValuePair>
  ports: string
  department: string
  id?: string
  userIds?: string[]
  groupIds?: string[]
  export_to: string[]
  visibilityMode: string
  sync_to_global_registry: boolean
}
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
  namespace(v) {
    if (!v) return '请填写命名空间'
  },
})
