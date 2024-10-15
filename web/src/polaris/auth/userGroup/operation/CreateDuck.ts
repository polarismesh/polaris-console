import { put, select } from 'redux-saga/effects'
import { describeGovernanceUsers, createGovernanceGroup, modifyGovernanceGroup, User, describeServerFunctions, ServerFunctionGroup } from '../../model'
import { UserItem } from '../../user/PageDuck'
import FormDialog from '@src/polaris/common/ducks/FormDialog'
import SearchableMultiSelect from '@src/polaris/common/ducks/SearchableMultiSelect'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import { diffAddRemoveArray } from '@src/polaris/common/util/common'
import Form from '@src/polaris/common/ducks/Form'
import { notification } from 'tea-component'

export interface DialogOptions {
  isModify: boolean
  users: User[]
  groupId?: string
}

export default class CreateDuck extends FormDialog {
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
      user: UserSelectDuck,
    }
  }
  *onSubmit() {
    const { selectors, selector } = this
    const { isModify, users, groupId } = selectors.options(yield select())
    const {
      form: {
        values: { name, comment },
      },
      user: { selection },
    } = selector(yield select())
    if (isModify) {
      const selectedIds = selection.map(item => item.id)
      const { addArray, removeArray } = diffAddRemoveArray(
        users.map(item => item.id),
        selectedIds,
      )
      const result = yield modifyGovernanceGroup([
        {
          id: groupId,
          comment,
          add_relations: { group_id: groupId, users: addArray.map(item => ({ id: item })) },
          remove_relations: { group_id: groupId, users: removeArray.map(item => ({ id: item })) },
        },
      ])
      if (result) {
        notification.success({ description: '编辑成功' })
      } else {
        notification.error({ description: '编辑失败' })
      }
      return result
    } else {
      const result = yield createGovernanceGroup({
        name,
        comment,
        relation: { users: selection.map(item => ({ id: item.id })) },
      })
      if (result) {
        notification.success({ description: '创建成功' })
      } else {
        notification.error({ description: '创建失败' })
      }
      return result
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
      ducks: { form, user },
    } = this
    const options = selectors.options(yield select())
    const data = selectors.data(yield select())
    const { users } = options
    yield put(form.creators.setMeta(options))
    yield put(
      form.creators.setValues({
        ...data,
      }),
    )
    yield put(user.creators.load({}))
    if (options.isModify) yield put(user.creators.select(users))
    // TODO 表单弹窗逻辑，在弹窗关闭后自动cancel
  }
}
export interface Values {
  name: string
  comment: string
  chosenUsers: string[]
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
    if (!v) {
      return '请输入名称'
    }
    if (!v.match(/^[\u4E00-\u9FA5A-Za-z0-9_\\-]+$/)) {
      return '只能使用中文、数字、大小写字母 以及- _组成'
    }
    if (v.length > 64) {
      return '最大长度为64'
    }
  },
})
export class UserSelectDuck extends SearchableMultiSelect {
  Item: UserItem
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

    const result = await getAllList(describeGovernanceUsers, { listKey: 'content' })(keyword ? { name: keyword } : {})

    return result
  }
}


