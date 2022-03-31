import { takeLatest } from 'redux-saga-catch'
import {
  describeGovernanceGroups,
  UserGroup,
  describeGovernanceGroupToken,
  deleteGovernanceGroups,
  describeGovernanceGroupDetail,
} from '../model'
import { reduceFromPayload, createToPayload } from 'saga-duck'
import { put, select } from 'redux-saga/effects'
import { resolvePromise } from 'saga-duck/build/helper'
import CreateDuck from './operation/CreateDuck'
import React from 'react'
import { Modal, Text, notification } from 'tea-component'
import Create from './operation/Create'
import AttachUserGroupDuck from '../user/operation/AttachUserGroupDuck'
import AttachUserGroup from '../user/operation/AttachUserGroup'
import { AuthSubjectType } from '../policy/Page'
import Auth from '../user/operation/Auth'
import AuthDuck from '../user/operation/AuthDuck'
import GridPageDuck, { Filter as BaseFilter } from '@src/polaris/common/ducks/GridPage'
import { showDialog } from '@src/polaris/common/helpers/showDialog'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import ShowToken from '../user/operation/ShowToken'

interface Filter extends BaseFilter {
  name?: string
  source?: string
  userId: string
}
interface ComposedId {
  userId?: string
}
export default class PageDuck extends GridPageDuck {
  get baseUrl() {
    return '/#/usergroup'
  }
  Filter: Filter
  Item: UserGroup
  get quickTypes() {
    enum Types {
      CREATE,
      LOAD,
      SET_COMPOSE_ID,
      SET_DATA,
      MODIFY,
      SHOW_TOKEN,
      DELETE,
      ATTACH_USER_GROUP,
      AUTH_GROUP,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get initialFetch() {
    return false
  }
  get recordKey() {
    return 'id'
  }
  get params() {
    return [...super.params]
  }
  get watchTypes() {
    return [...super.watchTypes, this.types.SET_COMPOSE_ID]
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
    }
  }
  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      composedId: reduceFromPayload<ComposedId>(types.SET_COMPOSE_ID, {} as ComposedId),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      create: createToPayload<void>(types.CREATE),
      edit: createToPayload<UserGroup>(types.MODIFY),
      showToken: createToPayload<UserGroup>(types.SHOW_TOKEN),
      delete: createToPayload<UserGroup>(types.DELETE),
      load: (composedId, data) => ({
        type: types.LOAD,
        payload: { composedId, data },
      }),
      attachGroup: createToPayload<void>(types.ATTACH_USER_GROUP),
      auth: createToPayload<UserGroup>(types.AUTH_GROUP),
    }
  }
  get rawSelectors() {
    return {
      ...super.rawSelectors,
      filter: (state: this['State']) => ({
        page: state.page,
        count: state.count,
        keyword: state.keyword,
        userId: state.composedId.userId,
      }),
    }
  }

  *saga() {
    const { types, selector, creators } = this
    yield* super.saga()
    yield takeLatest(types.LOAD, function*(action) {
      const { composedId } = action.payload
      yield put({ type: types.SET_COMPOSE_ID, payload: composedId })
    })
    yield takeLatest(types.CREATE, function*() {
      const result = yield* resolvePromise(
        new Promise(resolve => {
          showDialog(Create, CreateDuck, function*(duck: CreateDuck) {
            try {
              resolve(
                yield* duck.execute(
                  {},
                  {
                    users: [],
                    isModify: false,
                  },
                ),
              )
            } finally {
              resolve(false)
            }
          })
        }),
      )
      if (result) {
        yield put(creators.reload())
      }
    })
    yield takeLatest(types.ATTACH_USER_GROUP, function*() {
      const {
        composedId: { userId },
      } = selector(yield select())
      const { list: originGroupList } = yield getAllList(describeGovernanceGroups, { listKey: 'content' })({
        user_id: userId,
      })
      const result = yield* resolvePromise(
        new Promise(resolve => {
          showDialog(AttachUserGroup, AttachUserGroupDuck, function*(duck: AttachUserGroupDuck) {
            try {
              resolve(
                yield* duck.execute(
                  {},
                  {
                    originGroupIds: originGroupList.map(item => item.id),
                    userId,
                  },
                ),
              )
            } finally {
              resolve(false)
            }
          })
        }),
      )
      if (result) {
        notification.success({ description: '关联成功' })
        yield put(creators.reload())
      }
    })
    yield takeLatest(types.DELETE, function*(action) {
      const group = action.payload as UserGroup
      const confirm = yield Modal.confirm({
        message: '确认删除用户组？',
        description: (
          <>
            <Text>{'删除后，用户组不可用且无法恢复'}</Text>
          </>
        ),
      })
      if (confirm) {
        const result = yield deleteGovernanceGroups([{ id: group.id }])
        if (result) {
          notification.success({ description: '删除成功' })
          yield put(creators.reload())
        } else {
          notification.error({ description: '删除失败' })
        }
      }
    })
    yield takeLatest(types.AUTH_GROUP, function*(action) {
      const { id, name } = action.payload
      const result = yield* resolvePromise(
        new Promise(resolve => {
          showDialog(Auth, AuthDuck, function*(duck: AuthDuck) {
            try {
              resolve(
                yield* duck.execute(
                  {},
                  {
                    id,
                    authSubjectType: AuthSubjectType.USERGROUP,
                    name,
                  },
                ),
              )
            } finally {
              resolve(false)
            }
          })
        }),
      )
      if (result) {
        notification.success({ description: '编辑成功' })
        yield put(creators.reload())
      }
    })
    yield takeLatest(types.MODIFY, function*(action) {
      const { id: groupId } = action.payload
      const { userGroup } = yield describeGovernanceGroupDetail({ id: groupId })
      const result = yield* resolvePromise(
        new Promise(resolve => {
          showDialog(Create, CreateDuck, function*(duck: CreateDuck) {
            try {
              resolve(
                yield* duck.execute(action.payload, {
                  users: userGroup?.relation?.users || [],
                  isModify: true,
                  groupId,
                }),
              )
            } finally {
              resolve(false)
            }
          })
        }),
      )
      if (result) {
        notification.success({ description: '编辑成功' })
        yield put(creators.reload())
      }
    })
    yield takeLatest(types.SHOW_TOKEN, function*(action) {
      const { id, name } = action.payload
      const {
        userGroup: { auth_token },
      } = yield describeGovernanceGroupToken({ id })
      const { destroy } = Modal.show({
        size: 'xl',
        caption: `查看${name}的token`,
        children: <ShowToken token={auth_token} name={name}></ShowToken>,
        onClose: () => destroy(),
      })
    })
  }

  async getData(filters: Filter) {
    const { page, count, userId } = filters
    const result = await describeGovernanceGroups({
      limit: count,
      offset: (page - 1) * count,
      user_id: userId || undefined,
    })
    return {
      totalCount: result.totalCount,
      list:
        result.content?.map(item => ({
          ...item,
          id: item.id,
        })) || [],
    }
  }
}
