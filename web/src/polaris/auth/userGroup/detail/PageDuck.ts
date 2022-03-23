import { reduceFromPayload, createToPayload } from 'saga-duck'
import DetailPage from '@src/polaris/common/ducks/DetailPage'
import {
  modifyGovernanceGroupToken,
  resetGovernanceGroupToken,
  describeGovernanceGroupDetail,
  describeGovernanceGroupToken,
  UserGroup,
  modifyGovernanceGroup,
} from '../../model'
import { takeLatest, select, put } from 'redux-saga/effects'
import PolicyPageDuck from '../../policy/PageDuck'
import UserDuck from '../../user/PageDuck'

import { AuthSubjectType } from '../../policy/Page'
import ModifyCommentDuck, { ModifyCommentFormDuck } from '../../user/operation/ModifyCommentDuck'
import ModifyComment from '../../user/operation/ModifyComment'
import { showDialog } from '@src/polaris/common/helpers/showDialog'
import { notification } from 'tea-component'
import { delay } from 'redux-saga'
import UseableResourceFetcher from '../../common/UseableResourceFetcher'

interface ComposedId {
  id: string
}

export default abstract class CreateDuck extends DetailPage {
  Data: UserGroup
  ComposedId: ComposedId

  get baseUrl() {
    return `/#/usergroup-detail`
  }
  get quickTypes() {
    enum Types {
      SET_INSTANCE_ID,
      TOGGLE_TOKEN,
      RESET_TOKEN,
      MODIFY_COMMENT,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get params() {
    const { types } = this
    return [
      ...super.params,
      {
        key: 'instanceId',
        type: types.SET_INSTANCE_ID,
        defaults: '',
      },
    ]
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      policy: PolicyPageDuck,
      user: UserDuck,
      useableResource: UseableResourceFetcher,
    }
  }
  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      instanceId: reduceFromPayload(types.SET_INSTANCE_ID, ''),
    }
  }

  get rawSelectors() {
    type State = this['State']
    return {
      ...super.rawSelectors,
      composedId: (state: State) => ({
        id: state.id,
      }),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      toggleToken: createToPayload<void>(types.TOGGLE_TOKEN),
      resetToken: createToPayload<void>(types.RESET_TOKEN),
      modifyComment: createToPayload<void>(types.MODIFY_COMMENT),
    }
  }
  *saga() {
    yield* super.saga()
    const {
      ducks: { policy, user, useableResource },
      types,
      selectors,
      selector,
      creators,
    } = this
    yield takeLatest(types.FETCH_DONE, function*() {
      const { id } = selectors.composedId(yield select())
      yield put(policy.creators.load({ principalId: id, principalType: AuthSubjectType.USERGROUP }))
      yield put(user.creators.load({ groupId: id }, {}))
      yield put(useableResource.creators.fetch({ principal_id: id, principal_type: AuthSubjectType.USERGROUP }))
    })
    yield takeLatest(types.MODIFY_COMMENT, function*() {
      const { regionId, instanceId, id } = yield select(selectors.composedId)
      const data = selectors.data(yield select())
      const result = yield IModifyCommentDuck.show({ comment: data.comment, instanceId, regionId, id })
      if (result) {
        notification.success({ description: '修改成功' })
        yield put(creators.reload())
      } else {
        notification.error({ description: '修改失败' })
      }
    })
    yield takeLatest(types.TOGGLE_TOKEN, function*() {
      const { id } = selectors.composedId(yield select())
      const {
        data: { token_enable },
      } = selector(yield select())
      const result = yield modifyGovernanceGroupToken({ id, token_enable: !token_enable })
      if (result) {
        notification.success({ description: `${token_enable ? '禁用' : '启用'}成功` })
        yield delay(3000) // token refresh has a delay
        yield put(creators.reload())
      } else {
        notification.error({ description: `${token_enable ? '禁用' : '启用'}失败` })
      }
    })
    yield takeLatest(types.RESET_TOKEN, function*() {
      const { id } = selectors.composedId(yield select())

      const result = yield resetGovernanceGroupToken({ id })
      if (result) {
        notification.success({ description: '重置成功' })
        yield put(creators.reload())
      } else {
        notification.error({ description: '重置失败' })
      }
    })
  }
  async getData(composedId) {
    const { id } = composedId
    if (!id) return {} as UserGroup
    const { userGroup } = await describeGovernanceGroupDetail({ id })
    const { userGroup: tokenResult } = await describeGovernanceGroupToken({ id })
    return { ...userGroup, token_enable: tokenResult.token_enable, auth_token: tokenResult.auth_token }
  }
}

class IModifyCommentDuck extends ModifyCommentDuck {
  get quickDucks() {
    return {
      ...super.quickDucks,
      form: IModifyCommentFormDuck,
    }
  }
  static show(data: any) {
    return new Promise(resolve => {
      showDialog(ModifyComment, IModifyCommentDuck, function*(duck) {
        yield duck.show(data, function*() {
          resolve(yield duck.ducks.form.submit())
        })
      })
    })
  }
}
class IModifyCommentFormDuck extends ModifyCommentFormDuck {
  *submit() {
    const { creators, selectors, selector } = this
    yield put(creators.setAllTouched(true))
    const firstInvalid = yield select(selectors.firstInvalid)
    if (firstInvalid) {
      return false
    }
    const { values } = yield select(selector)
    const { comment, id } = values
    const result = yield modifyGovernanceGroup([
      {
        id,
        comment,
      },
    ])
    return result
  }
}
