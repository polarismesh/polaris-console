import { put, select } from 'redux-saga/effects'
import { NamespaceItem } from '@src/polaris/namespace/PageDuck'
import FormDialog from '@src/polaris/common/ducks/FormDialog'
import Form from '@src/polaris/common/ducks/Form'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import { describeComplicatedNamespaces } from '@src/polaris/namespace/model'
import { modifyConfigFileGroup, createConfigFileGroup } from '../model'
import { UserSelectDuck } from '@src/polaris/auth/userGroup/operation/CreateDuck'
import { UserGroupSelectDuck } from '@src/polaris/auth/user/operation/AttachUserGroupDuck'
import { DescribeStrategyOption } from '@src/polaris/auth/constants'
import { AuthStrategy, describeGovernanceStrategies } from '@src/polaris/auth/model'
import { diffAddRemoveArray } from '@src/polaris/common/util/common'
import { isReadOnlyNamespace } from '@src/polaris/service/utils'
import { ConfigFileGroupTag } from '../types'
const convertMetadataArrayToMap = metadataArray => {
  const metadataMap = {}
  metadataArray.forEach(metadata => {
    const { key, value } = metadata
    metadataMap[key] = value
  })
  return metadataMap
}
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
      userSelect: UserSelectDuck,
      userGroupSelect: UserGroupSelectDuck,
    }
  }
  *onSubmit() {
    const {
      selectors,
      ducks: { form, userGroupSelect, userSelect },
    } = this
    const userIds = userSelect.selector(yield select()).selection.map(user => user.id)
    const groupIds = userGroupSelect.selector(yield select()).selection.map(group => group.id)
    const { userIds: originUserIds, groupIds: originGroupIds } = selectors.data(yield select())
    const { removeArray: removeUserIds } = diffAddRemoveArray(originUserIds, userIds)
    const { removeArray: removeGroupIds } = diffAddRemoveArray(originGroupIds, groupIds)
    const options = selectors.options(yield select())
    const values = form.selectors.values(yield select())
    const { name, comment, namespace, department, business, metadata: configFileGroupTags } = values

    if (options.isModify) {
      const res = yield modifyConfigFileGroup({
        namespace,
        name,
        comment,
        user_ids: userIds,
        group_ids: groupIds,
        remove_user_ids: removeUserIds,
        remove_group_ids: removeGroupIds,
        department: department || undefined,
        business: business || undefined,
        metadata: configFileGroupTags?.length ? convertMetadataArrayToMap(configFileGroupTags) : undefined,
      })
      return res
    } else {
      const res = yield createConfigFileGroup({
        namespace,
        name,
        comment,
        user_ids: userIds,
        group_ids: groupIds,
        department: department || undefined,
        business: business || undefined,
        metadata: configFileGroupTags?.length ? convertMetadataArrayToMap(configFileGroupTags) : undefined,
      })
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
    const { list: namespaceList } = yield getAllList(describeComplicatedNamespaces, {
      listKey: 'namespaces',
      totalKey: 'amount',
    })({})
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
            tooltip: disabled && '该命名空间为只读命名空间',
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
    yield put(userGroupSelect.creators.load({}))
    yield put(userSelect.creators.load({}))
    if (options.isModify) {
      const { list: allStrategies } = yield getAllList(describeGovernanceStrategies, { listKey: 'content' })({
        res_id: data.id,
        res_type: 'config_group',
        default: DescribeStrategyOption.Default,
        show_detail: true,
      })
      const users = []
      const groups = []
      allStrategies.forEach((strategy: AuthStrategy) => {
        users.push(...strategy.principals.users)
        groups.push(...strategy.principals.groups)
      })
      yield put(userGroupSelect.creators.select(groups))
      yield put(userSelect.creators.select(users))
      yield put({
        type: types.UPDATE,
        payload: {
          ...data,
          userIds: users.map(user => user.id),
          groupIds: groups.map(group => group.id),
        },
      })
    }
    // TODO 表单弹窗逻辑，在弹窗关闭后自动cancel
  }
}
export interface Values {
  id: string
  namespace: string
  comment: string
  name: string
  userIds?: string[]
  groupIds?: string[]
  department: string
  business: string
  metadata?: ConfigFileGroupTag[]
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
  namespace(v) {
    if (!v) return '请填写命名空间'
  },
})
