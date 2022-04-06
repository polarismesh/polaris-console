import { put, select } from 'redux-saga/effects'
import { createGovernanceUsers, modifyGovernanceUserPassword, modifyGovernanceUser } from '../../model'
import FormDialog from '@src/polaris/common/ducks/FormDialog'
import Form from '@src/polaris/common/ducks/Form'
import { notification } from 'tea-component'
import { UserSource } from '../../constants'
import { passwordRuleText } from './CreateUser'
import { userLogout, getUin, isOwner } from '@src/polaris/common/util/common'
import { delay } from 'redux-saga'

export interface DialogOptions {
  isModify: boolean
  isModifyPassword?: boolean
}

export default class CreateUserDuck extends FormDialog {
  Options: DialogOptions
  get Form() {
    return CreateForm
  }
  get quickTypes() {
    enum Types {}
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
    const { selectors, selector } = this
    const options = selectors.options(yield select())
    const {
      form: {
        values: { name, comment, password, old_password, new_password, id, mobile, email },
      },
    } = selector(yield select())
    if (options?.isModify) {
      let result
      if (options?.isModifyPassword) {
        result = yield modifyGovernanceUserPassword({
          id,
          ...(isOwner() ? {} : { old_password }),
          new_password,
        })
        if (result) {
          notification.success({ description: '修改密码成功' })
          if (id === getUin()) {
            notification.warning({ description: '您已成功重置密码，请重新登录。' })
            yield delay(3000)
            userLogout()
          }
        } else {
          notification.error({ description: '修改密码失败' })
        }
      } else {
        result = yield modifyGovernanceUser({
          id,
          mobile,
          email,
        })
        if (result) {
          notification.success({ description: '编辑成功' })
        } else {
          notification.error({ description: '编辑失败' })
        }
      }
      return result
    } else {
      const result = yield createGovernanceUsers([
        {
          name,
          comment,
          password,
          mobile,
          email,
          source: UserSource.Polaris,
        },
      ])
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
      throw firstInvalid
    }
  }
  *onShow() {
    yield* super.onShow()
    const {
      selectors,
      ducks: { form },
    } = this
    const options = selectors.options(yield select())
    const data = selectors.data(yield select())
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
  name: string
  password: string
  comment: string
  old_password?: string
  new_password?: string
  confirmPassword?: string
  mobile?: string
  email?: string
  id?: string
}
class CreateForm extends Form {
  Values: Values
  Meta: DialogOptions
  validate(v: this['Values'], meta: this['Meta']) {
    return validator(v, meta)
  }
}
const validator = CreateForm.combineValidators<Values, DialogOptions>({
  name(v, values, meta) {
    if (meta.isModify) {
      return
    }
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
  password(v, values) {
    if (values.id) {
      return
    }
    if (!v) {
      return '请输入密码'
    }
    if (v.length < 6 || v.length > 17) {
      return passwordRuleText
    }
  },
  old_password(v, values, meta) {
    if (!meta.isModifyPassword) {
      return
    }
    if (isOwner()) {
      return
    }
    if (!v && values.id) {
      return '请输入旧密码'
    }
  },
  new_password(v, values, meta) {
    if (!meta.isModifyPassword) {
      return
    }
    if (!v && values.id) {
      return '请输入新密码'
    }
    if (v.length < 6 || v.length > 17) {
      return passwordRuleText
    }
  },
  confirmPassword(v, values, meta) {
    if (meta.isModifyPassword || !meta.isModify) {
      if (!v) {
        return '请确认密码'
      }
      if (meta.isModify && values.new_password !== v) {
        return '两次输入密码不一致'
      }
      if (!meta.isModify && values.password !== v) {
        return '两次输入密码不一致'
      }
    }
  },
})
