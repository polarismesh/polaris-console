import { put, select } from 'redux-saga/effects'

import { NamespaceItem } from '../PageDuck'
import FormDialog from '@src/polaris/common/ducks/FormDialog'
import { resolvePromise } from '@src/polaris/common/helpers/saga'
import Form from '@src/polaris/common/ducks/Form'
import { modifyNamespace, createNamespace, describeComplicatedNamespaces } from '../model'
import { AuthStrategy, describeGovernanceStrategies } from '@src/polaris/auth/model'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import { UserSelectDuck } from '@src/polaris/auth/userGroup/operation/CreateDuck'
import { UserGroupSelectDuck } from '@src/polaris/auth/user/operation/AttachUserGroupDuck'
import { diffAddRemoveArray } from '@src/polaris/common/util/common'
import { DescribeStrategyOption } from '@src/polaris/auth/constants'
import { VisibilityMode, CheckVisibilityMode } from '@src/polaris/service/operation/CreateDuck'

export interface DialogOptions {
  namespaceList?: NamespaceItem[]
  isModify: boolean
  token?: string
  authOpen: boolean
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
      userSelect: UserSelectDuck,
      userGroupSelect: UserGroupSelectDuck,
    }
  }
  *onSubmit() {
    const {
      selectors,
      ducks: { form, userGroupSelect, userSelect },
    } = this
    const { userIds: originUsers, groupIds: originGroups } = selectors.data(yield select())
    const options = selectors.options(yield select())
    const values = form.selectors.values(yield select())
    const userIds = userSelect.selector(yield select()).selection.map(item => item.id)
    const groupIds = userGroupSelect.selector(yield select()).selection.map(item => item.id)
    const service_export_to =
      values.visibilityMode === VisibilityMode.Single
        ? [values.name]
        : values.visibilityMode === VisibilityMode.All
        ? ['*']
        : values.service_export_to
    if (options.isModify) {
      const { removeArray: removeUserIds } = diffAddRemoveArray(originUsers, userIds)
      const { removeArray: removeGroupIds } = diffAddRemoveArray(originGroups, groupIds)
      const res = yield* resolvePromise(
        modifyNamespace([
          {
            name: values.name,
            comment: values.comment,
            user_ids: userIds,
            group_ids: groupIds,
            remove_user_ids: removeUserIds,
            remove_group_ids: removeGroupIds,
            service_export_to,
            sync_to_global_registry: values.sync_to_global_registry,
          },
        ]),
      )
      return res
    } else {
      const res = yield* resolvePromise(
        createNamespace([
          {
            name: values.name,
            comment: values.comment,
            user_ids: userIds,
            group_ids: groupIds,
            service_export_to,
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
      ducks: { form, userSelect, userGroupSelect },
      types,
    } = this
    const options = selectors.options(yield select())
    const data = selectors.data(yield select())
    if (options.authOpen) {
      yield put(userGroupSelect.creators.load({}))
      yield put(userSelect.creators.load({}))
    }
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
    if (options.isModify && options.authOpen) {
      const { list: allStrategies } = yield getAllList(describeGovernanceStrategies, { listKey: 'content' })({
        res_id: data.id,
        res_type: 'namespace',
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
    const visibilityMode = CheckVisibilityMode(data.service_export_to, data.name)
    if (visibilityMode === VisibilityMode.All) data.service_export_to = []
    yield put(form.creators.setMeta(options))
    yield put(
      form.creators.setValues({
        ...data,
        visibilityMode,
        sync_to_global_registry: data.sync_to_global_registry ?? false,
      }),
    )
    // TODO 表单弹窗逻辑，在弹窗关闭后自动cancel
  }
}
export interface Values {
  name: string
  comment: string
  owners: string
  id: string
  userIds: string[]
  groupIds: string[]
  service_export_to?: string[]
  visibilityMode?: string
  sync_to_global_registry: boolean
}
class CreateForm extends Form {
  Values: Values
  Meta: {}
  validate(v: this['Values'], meta: this['Meta']) {
    return validator(v, meta)
  }
  get defaultValue(): this['Values'] {
    return {
      visibilityMode: VisibilityMode.Single,
      sync_to_global_registry: false,
    } as this['Values']
  }
}
const validator = CreateForm.combineValidators<Values, {}>({
  name(v) {
    if (!v) return '请填写名称'
  },
})
