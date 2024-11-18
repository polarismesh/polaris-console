import { select, put, call } from 'redux-saga/effects'
import { takeLatest } from 'redux-saga-catch'
import { createToPayload } from 'saga-duck'
import Page from '@src/polaris/common/ducks/Page'
import Form from '@src/polaris/common/ducks/Form'
import { initAdminUser } from '../model'

export default abstract class CreateDuck extends Page {
  get baseUrl() {
    return `/#/init`
  }
  get preEffects() {
    return [call([this, this.ready], this), call([this, this.checkLicense], this)]
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
    yield takeLatest(types.SUBMIT, function* () {
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
      yield initAdminUser({ name: values.userName, password: values.password })
      window.location.hash = "/login"
    } catch (e) {
      yield put(creators.markInvalid('password', '网络异常'))
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
