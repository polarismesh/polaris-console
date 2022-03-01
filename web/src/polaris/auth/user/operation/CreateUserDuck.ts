import { put, select } from 'redux-saga/effects'
import { createGovernanceUsers, modifyGovernanceUserPassword } from '../../model'
import FormDialog from '@src/polaris/common/ducks/FormDialog'
import Form from '@src/polaris/common/ducks/Form'
import { notification } from 'tea-component'
import { UserSource } from '../../constants'

export interface DialogOptions {
  isModify: boolean
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
        values: { name, comment, password, old_password, new_password, id },
      },
    } = selector(yield select())
    if (options?.isModify) {
      const result = yield modifyGovernanceUserPassword({
        id,
        old_password,
        new_password,
      })
      if (result) {
        notification.success({ description: '修改密码成功' })
      } else {
        notification.error({ description: '修改密码失败' })
      }
      return result
    } else {
      const result = yield createGovernanceUsers([
        {
          name,
          comment,
          password,
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
      throw false
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
  password(v) {
    if (!v) {
      return '请输入密码'
    }
  },
  old_password(v, values) {
    if (!v && values.id) {
      return '请输入旧密码'
    }
  },
  new_password(v, values) {
    if (!v && values.id) {
      return '请输入新密码'
    }
  },
  confirmPassword(v, values, meta) {
    if (!v) {
      return '请确认密码'
    }
    if (meta.isModify && values.new_password !== v) {
      return '两次输入密码不一致'
    }
    if (meta.isModify && values.password !== v) {
      return '两次输入密码不一致'
    }
  },
})
