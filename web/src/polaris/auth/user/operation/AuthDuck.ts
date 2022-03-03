import { put, select } from 'redux-saga/effects'
import { describeGovernanceStrategies, AuthStrategy, modifyGovernanceStrategy } from '../../model'
import { AuthSubjectType } from '../../policy/Page'
import { PrincipalTypeMap, DescribeStrategyOption } from '../../constants'
import { notification } from 'tea-component'
import FormDialog from '@src/polaris/common/ducks/FormDialog'
import { diffAddRemoveArray } from '@src/polaris/common/util/common'
import { resolvePromise } from 'saga-duck/build/helper'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import SearchableMultiSelect from '@src/polaris/common/ducks/SearchableMultiSelect'
import Form from '@src/polaris/common/ducks/Form'

export interface DialogOptions {
  id: string
  name: string
  originStrategies?: string[]
  authSubjectType: AuthSubjectType
}

export default class AuthDuck extends FormDialog {
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
      policy: StrategySelectDuck,
    }
  }
  *onSubmit() {
    const {
      selectors,
      ducks: { policy },
    } = this
    const { id: subjectId, originStrategies, authSubjectType } = selectors.options(yield select())
    const { selection } = policy.selector(yield select())
    const { addArray, removeArray } = diffAddRemoveArray(
      originStrategies,
      selection.map(item => item.id),
    )
    if (addArray.length <= 0 && removeArray.length <= 0) {
      notification.warning({ description: '未做改动' })
      throw '未做改动'
    }
    const principleName = authSubjectType === AuthSubjectType.USER ? 'users' : 'groups'
    const res = yield* resolvePromise(
      modifyGovernanceStrategy([
        ...addArray.map(strategyId => ({ add_principals: { [principleName]: [{ id: subjectId }] }, id: strategyId })),
        ...removeArray.map(strategyId => ({
          remove_principals: { [principleName]: [{ id: subjectId }] },
          id: strategyId,
        })),
      ]),
    )
    return res
  }
  *onShow() {
    yield* super.onShow()
    const {
      selectors,
      ducks: { policy, form },
      types,
    } = this
    const options = selectors.options(yield select())
    const data = selectors.data(yield select())
    const { regionId, instanceId, id } = options
    const { list } = yield getAllList(describeGovernanceStrategies, { listKey: 'content' })({
      principal_id: id,
      principal_type: PrincipalTypeMap[options.authSubjectType],
      default: DescribeStrategyOption.NoDefault,
    })
    const originStrategies = list.filter(item => !item.default)
    yield put({
      type: types.SET_OPTIONS,
      payload: { ...options, originStrategies: originStrategies.map(item => item.id) },
    })
    yield put(policy.creators.load({ regionId, instanceId }))
    yield put(policy.creators.select(originStrategies))
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

export class StrategySelectDuck extends SearchableMultiSelect {
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
    const { keyword, instanceId } = filter
    const params = { name: `${keyword ? `${keyword}*` : ''}`, instanceId, default: DescribeStrategyOption.NoDefault }

    const result = await getAllList(describeGovernanceStrategies, { listKey: 'content' })(params)

    return result
  }
}
