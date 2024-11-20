import { select, put } from 'redux-saga/effects'
import FormDuck from '@src/polaris/common/ducks/Form'
import Base from '@src/polaris/common/ducks/DialogPure'
import Create from './ReleaseConfig'
import { showDialog } from '@src/polaris/common//helpers/showDialog'
import { ConfigFileRelease } from '../../../types'
import { releaseConfigFile } from '../../../model'

interface Data {
  lastRelease: ConfigFileRelease
  namespace: string
  group: string
  content: string
  format: string
  name: string
}
export default class ReleaseConfigDuck extends Base {
  Data: Data

  get quickDucks() {
    return {
      ...super.quickDucks,
      form: CreateFormDuck,
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
      showDialog(Create, ReleaseConfigDuck, function* (duck) {
        yield duck.show(data, function* () {
          resolve(yield duck.ducks.form.submit())
        })
      })
    })
  }
}

export interface Fvalues {
  regionId: number
  instanceId: string
  comment: string
  releaseVersion: string
  namespace: string
  group: string
  name: string
}
export class CreateFormDuck extends FormDuck {
  Values: Fvalues
  validate(v, metaData) {
    return validator(v, metaData)
  }
  *submit() {
    const { creators, selectors, selector } = this
    yield put(creators.setAllTouched(true))
    const firstInvalid = yield select(selectors.firstInvalid)
    if (firstInvalid) {
      throw firstInvalid
    }
    const { values } = yield select(selector)
    const { name, namespace, group, releaseVersion, comment } = values
    const result = yield releaseConfigFile({
      namespace,
      group,
      fileName: name,
      name: releaseVersion,
      releaseDescription: comment,
    })
    return result
  }
}
// 一些校验
const validator = CreateFormDuck.combineValidators<Fvalues>({
  releaseVersion(v) {
    if (!v) {
      return '请输入版本号'
    }
  },
})
