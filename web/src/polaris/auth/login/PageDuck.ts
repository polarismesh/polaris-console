import { select, put, call } from 'redux-saga/effects'
import { takeLatest } from 'redux-saga-catch'
import { createToPayload } from 'saga-duck'
import Page from '@src/polaris/common/ducks/Page'
import Form from '@src/polaris/common/ducks/Form'
import { loginUser } from '../model'
import {
  PolarisTokenKey,
  LoginRoleKey,
  LoginUserIdKey,
  LoginUserOwnerIdKey,
  LoginUserNameKey,
} from '@src/polaris/common/util/common'
import router from '@src/polaris/common/util/router'

export default abstract class CreateDuck extends Page {
  get baseUrl() {
    return `/#/login`
  }
  get preEffects() {
    return [
      call([this, this.ready], this),
      call([this, this.checkAdminUserExist]),
      call([this, this.checkUserLogin], this),
    ]
  }
  get quickTypes() {
    enum Types {
      SET_INSTANCE_ID,
      SUBMIT,
      SET_ORIGIN_POLICY,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      form: CreateFormDuck,
    }
  }

  get creators() {
    const { types } = this
    return {
      ...super.creators,
      submit: createToPayload<void>(types.SUBMIT),
    }
  }
  *saga() {
    yield* super.saga()
    const duck = this
    const { types, ducks } = duck
    yield takeLatest(types.SUBMIT, function*() {
      try {
        yield* ducks.form.submit()
      } catch (e) {
        return
      }
    })
  }
}
export interface Fvalues {
  userName: string
  password: string
}

export class CreateFormDuck extends Form {
  Values: Fvalues
  Meta: Fvalues
  validate(v, metaData) {
    return validator(v, metaData)
  }

  get quickDucks() {
    return {
      ...super.quickDucks,
    }
  }

  get creators() {
    const { types } = this
    return {
      ...super.creators,
      submit: createToPayload<void>(types.SUBMIT),
    }
  }
  get quickTypes() {
    enum Types {
      CREATE,
      SUBMIT,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get reducers() {
    return {
      ...super.reducers,
    }
  }

  get rawSelectors() {
    return {
      ...super.rawSelectors,
    }
  }
  *submit() {
    const { creators, selectors } = this
    yield put(creators.setAllTouched(true))
    const firstInvalid = yield select(selectors.firstInvalid)
    if (firstInvalid) throw firstInvalid
    try {
      const values = yield select(selectors.values)
      const { loginResponse } = yield loginUser({ name: values.userName, password: values.password, owner: 'polaris' })
      if (loginResponse.token) {
        window.localStorage.setItem(PolarisTokenKey, loginResponse.token)
        window.localStorage.setItem(LoginUserNameKey, loginResponse.name)
        window.localStorage.setItem(LoginRoleKey, loginResponse.role)
        window.localStorage.setItem(LoginUserIdKey, loginResponse.user_id)
        window.localStorage.setItem(LoginUserOwnerIdKey, loginResponse.owner_id)
        router.navigate('/service')
      } else {
        throw new Error()
      }
    } catch (e) {
      yield put(creators.markInvalid('password', '网络异常或用户名，密码错误'))
      throw e
    }
  }
  *saga() {
    yield* super.saga()
  }
}
const validator = CreateFormDuck.combineValidators<Fvalues>({
  userName(v) {
    if (!v) {
      return '请输入用户名'
    }
  },
  password(v) {
    if (!v) {
      return '请输入密码'
    }
  },
})
