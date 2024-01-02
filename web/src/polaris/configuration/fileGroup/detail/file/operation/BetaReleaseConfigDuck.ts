import { select, put } from 'redux-saga/effects'
import FormDuck from '@src/polaris/common/ducks/Form'
import Base from '@src/polaris/common/ducks/DialogPure'
import Create from './BetaReleaseConfig'
import { showDialog } from '@src/polaris/common//helpers/showDialog'
import { ClientLabel, ClientLabelView, ConfigFileRelease } from '../../../types'
import { releaseConfigFile } from '../../../model'

interface Data {
  lastRelease: ConfigFileRelease
  namespace: string
  group: string
  content: string
  format: string
  name: string
  clientLabels?: ClientLabel[]
}

export default class BetaReleaseConfigDuck extends Base {
  Data: Data

  get quickDucks() {
    return {
      ...super.quickDucks,
      form: BetaCreateFormDuck,
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
      showDialog(Create, BetaReleaseConfigDuck, function*(duck) {
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
  comment: string
  releaseVersion: string
  namespace: string
  group: string
  name: string
  clientLabels?: ClientLabelView[]
}

export class BetaCreateFormDuck extends FormDuck {
  Values: Fvalues
  validate(v, metaData) {
    return betaValidator(v, metaData)
  }
  *submit() {
    const { creators, selectors, selector } = this
    yield put(creators.setAllTouched(true))
    const firstInvalid = yield select(selectors.firstInvalid)
    if (firstInvalid) {
      throw firstInvalid
    }
    const { values } = yield select(selector)
    const { name, namespace, group, releaseVersion, comment, clientLabels: clientLabels } = values
    const result = yield releaseConfigFile({
      namespace,
      group,
      fileName: name,
      name: releaseVersion,
      releaseDescription: comment,
      betaLabels: clientLabels.map(l => {
        return {
          key: l.key,
          value: {
            value: l.value,
            type: l.type,
            value_type: l.value_type
          },
        }
      }),
      releaseType: 'gray',
    })
    return result
  }
}
// 一些校验
const betaValidator = BetaCreateFormDuck.combineValidators<Fvalues>({
  releaseVersion(v) {
    if (!v) {
      return '请输入版本号'
    }
  },
})
