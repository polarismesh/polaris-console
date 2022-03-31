import { select, put } from 'redux-saga/effects'
import ModifyComment from './ModifyComment'
import { showDialog } from '@src/polaris/common/helpers/showDialog'
import DialogPure from '@src/polaris/common/ducks/DialogPure'
import Form from '@src/polaris/common/ducks/Form'
import { modifyGovernanceUser } from '../../model'

enum Types {}
interface Data {
  regionId: number
  instanceId: string
  comment: string
}
export default class ModifyCommentDuck extends DialogPure {
  Data: Data

  get quickTypes() {
    return {
      ...super.quickTypes,
      ...Types,
    }
  }

  get quickDucks() {
    return {
      ...super.quickDucks,
      form: ModifyCommentFormDuck,
    }
  }
  *onShow() {
    const duck = this
    const { selector } = duck
    const { data } = yield select(selector)
    yield* this.initData(data)
  }

  *initData(data) {
    const { ducks } = this
    yield put(ducks.form.creators.setAllTouched(false))
    yield put(ducks.form.creators.setValues(data, true))
  }
  static show(data: any) {
    return new Promise(resolve => {
      showDialog(ModifyComment, ModifyCommentDuck, function*(duck) {
        yield duck.show(data, function*() {
          resolve(yield duck.ducks.form.submit())
        })
      })
    })
  }
}
export interface Fvalues {
  regionId: number
  instanceId: string
  id: string
  comment: string
}
export class ModifyCommentFormDuck extends Form {
  Values: Fvalues
  validate(v, metaData) {
    return validator(v, metaData)
  }
  *submit() {
    const { creators, selectors, selector } = this
    yield put(creators.setAllTouched(true))
    const firstInvalid = yield select(selectors.firstInvalid)
    if (firstInvalid) {
      return false
    }
    const { values } = yield select(selector)
    const { comment, id } = values
    const result = yield modifyGovernanceUser({
      id,
      comment,
    })
    return result
  }
}
// 一些校验
const validator = ModifyCommentFormDuck.combineValidators<Data>({})
