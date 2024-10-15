import { put, select } from 'redux-saga/effects'
import { AuthStrategy, UserGroup, describeGovernanceGroups, describeGovernanceStrategies, modifyGovernanceGroup } from '../../model'
import FormDialog from '@src/polaris/common/ducks/FormDialog'
import { diffAddRemoveArray } from '@src/polaris/common/util/common'
import { resolvePromise } from 'saga-duck/build/helper'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import SearchableMultiSelect from '@src/polaris/common/ducks/SearchableMultiSelect'
import Form from '@src/polaris/common/ducks/Form'

export interface DialogOptions {
  userId: string
  originGroupIds?: string[]
}

export default class AttachUserGroupDuck extends FormDialog {
  Options: DialogOptions
  get Form() {
    return CreateForm
  }
  get quickTypes() {
    enum Types { }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      userGroup: UserGroupSelectDuck,
    }
  }
  *onSubmit() {
    const {
      selectors,
      ducks: { userGroup },
    } = this
    const options = selectors.options(yield select())
    const { selection } = userGroup.selector(yield select())
    const { addArray, removeArray } = diffAddRemoveArray(
      options.originGroupIds,
      selection.map(item => item.id),
    )
    const userId = options.userId
    const res = yield* resolvePromise(
      modifyGovernanceGroup([
        ...addArray.map(id => ({
          id,
          add_relations: { group_id: id, users: [{ id: userId }] },
          remove_relations: { group_id: id, users: [] },
        })),
        ...removeArray.map(id => ({
          id,
          remove_relations: { group_id: id, users: [{ id: userId }] },
          add_relations: { group_id: id, users: [] },
        })),
      ]),
    )
    return res
  }
  *onShow() {
    yield* super.onShow()
    const {
      selectors,
      ducks: { userGroup, form },
      types,
    } = this
    const options = selectors.options(yield select())
    const data = selectors.data(yield select())
    const { regionId, instanceId, userId } = options
    const { list: originGroupList } = yield getAllList(describeGovernanceGroups, { listKey: 'content' })({
      user_id: userId,
    })
    yield put({
      type: types.SET_OPTIONS,
      payload: { ...options, originGroupIds: originGroupList.map(item => item.id) },
    })
    yield put(userGroup.creators.load({ regionId, instanceId }))
    yield put(userGroup.creators.select(originGroupList))
    yield put(form.creators.setMeta(options))
    yield put(
      form.creators.setValues({
        ...data,
      }),
    )
    // TODO 表单弹窗逻辑，在弹窗关闭后自动cancel
  }
}
class CreateForm extends Form {
  Values: {}
  Meta: {}
  validate(v: this['Values'], meta: this['Meta']) {
    return validator(v, meta)
  }
}
const validator = CreateForm.combineValidators<{}, {}>({})

export class UserGroupSelectDuck extends SearchableMultiSelect {
  Item: UserGroup
  getId(item: this['Item']) {
    return item.id
  }

  get autoSearch() {
    return false
  }

  get autoClearBeforeLoad() {
    return false
  }

  async getData(filter) {
    const { keyword } = filter
    const params = { ...(keyword ? { name: keyword } : {}) }

    const result = await getAllList(describeGovernanceGroups, { listKey: 'content' })(params)

    return result
  }
}


export class AuthPolicySelectDuck extends SearchableMultiSelect {
  Item: AuthStrategy
  getId(item: this['Item']) {
    return item.id
  }

  get autoSearch() {
    return false
  }

  get autoClearBeforeLoad() {
    return false
  }

  async getData(filter) {
    const { keyword } = filter
    const params = { ...(keyword ? { name: keyword } : {}) }

    const result = await getAllList(describeGovernanceStrategies, { listKey: 'content' })(params)

    return result
  }
}