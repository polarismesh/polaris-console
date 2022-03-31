import { takeLatest } from 'redux-saga-catch'
import {
  User,
  describeGovernanceUsers,
  describeGovernanceUserToken,
  deleteGovernanceUsers,
  describeGovernanceGroupDetail,
} from '../model'
import { put, select } from 'redux-saga/effects'
import { reduceFromPayload, createToPayload } from 'saga-duck'

import { Modal, Text, notification } from 'tea-component'
import React from 'react'
import ShowToken from './operation/ShowToken'
import { showDialog } from '@src/polaris/common/helpers/showDialog'
import AttachUserGroupDuck from './operation/AttachUserGroupDuck'
import AttachUserGroup from './operation/AttachUserGroup'
import CreateDuck from '../userGroup/operation/CreateDuck'
import Create from '../userGroup/operation/Create'
import Auth from './operation/Auth'
import AuthDuck from './operation/AuthDuck'
import { AuthSubjectType } from '../policy/Page'
import GridPageDuck, { Filter as BaseFilter } from '@src/polaris/common/ducks/GridPage'
import { resolvePromise } from 'saga-duck/build/helper'
import CreateUser from './operation/CreateUser'
import CreateUserDuck from './operation/CreateUserDuck'

interface Filter extends BaseFilter {
  name?: string
  source?: string
  groupId?: string
}
interface ComposedId {
  groupId?: string
}
export type UserItem = User
export default class PageDuck extends GridPageDuck {
  get baseUrl() {
    return '/#/user'
  }
  Filter: Filter
  Item: UserItem
  get quickTypes() {
    enum Types {
      CREATE,
      LOAD,
      SET_DATA,
      SET_COMPOSE_ID,
      FETCH_DATA,
      SYNC_USERS,
      SHOW_TOKEN,
      DELETE,
      ATTACH_GROUP,
      MODIFY_GROUP,
      AUTH_USER,
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
  get quickDucks() {
    return {
      ...super.quickDucks,
    }
  }
  get watchTypes() {
    return [...super.watchTypes, this.types.SET_COMPOSE_ID]
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
      edit: createToPayload<UserItem>(types.CREATE),
      showToken: createToPayload<UserItem>(types.SHOW_TOKEN),
      delete: createToPayload<UserItem[]>(types.DELETE),
      load: (composedId, data) => ({
        type: types.LOAD,
        payload: { composedId, data },
      }),
      attach: createToPayload<UserItem>(types.ATTACH_GROUP),
      modifyGroup: createToPayload<void>(types.MODIFY_GROUP),
      auth: createToPayload<User>(types.AUTH_USER),
    }
  }
  get rawSelectors() {
    return {
      ...super.rawSelectors,
      filter: (state: this['State']) => ({
        page: state.page,
        count: state.count,
        keyword: state.keyword,
        groupId: state.composedId.groupId,
      }),
    }
  }

  *saga() {
    const { types, selector, creators } = this
    yield* super.saga()
    yield takeLatest(types.LOAD, function*(action) {
      const { composedId } = action.payload
      yield put({ type: types.SET_COMPOSE_ID, payload: composedId })
      yield put({ type: types.FETCH_DATA, payload: composedId })
    })
    yield takeLatest(types.DELETE, function*(action) {
      const users = action.payload
      const confirm = yield Modal.confirm({
        message: '确认删除用户？',
        description: (
          <>
            <Text>{'删除后，用户不可用且无法恢复'}</Text>
          </>
        ),
      })
      if (confirm) {
        const result = yield deleteGovernanceUsers(users.map(item => ({ id: item.id })))
        if (result) {
          notification.success({ description: '删除成功' })
          yield put(creators.reload())
        } else {
          notification.error({ description: '删除失败' })
        }
      }
    })
    yield takeLatest(types.CREATE, function*() {
      const result = yield* resolvePromise(
        new Promise(resolve => {
          showDialog(CreateUser, CreateUserDuck, function*(duck: CreateUserDuck) {
            try {
              resolve(
                yield* duck.execute(
                  {},
                  {
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
    yield takeLatest(types.MODIFY_GROUP, function*() {
      const {
        composedId: { groupId },
      } = selector(yield select())
      const { userGroup } = yield describeGovernanceGroupDetail({ id: groupId })
      const result = yield* resolvePromise(
        new Promise(resolve => {
          showDialog(Create, CreateDuck, function*(duck: CreateDuck) {
            try {
              resolve(
                yield* duck.execute(userGroup, {
                  users: userGroup.relation.users,
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
    yield takeLatest(types.ATTACH_GROUP, function*(action) {
      const { id } = action.payload

      const result = yield* resolvePromise(
        new Promise(resolve => {
          showDialog(AttachUserGroup, AttachUserGroupDuck, function*(duck: AttachUserGroupDuck) {
            try {
              resolve(
                yield* duck.execute(
                  {},
                  {
                    userId: id,
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
    yield takeLatest(types.AUTH_USER, function*(action) {
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
                    authSubjectType: AuthSubjectType.USER,
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

    yield takeLatest(types.SHOW_TOKEN, function*(action) {
      const { id, name } = action.payload
      const {
        user: { auth_token },
      } = yield describeGovernanceUserToken({ id })
      const { destroy } = Modal.show({
        size: 'xl',
        caption: `查看${name}的token`,
        children: <ShowToken token={auth_token} name={name}></ShowToken>,
        onClose: () => destroy(),
      })
    })
  }
  async getData(filters: Filter) {
    const { page, count, groupId } = filters
    let result
    if (groupId) {
      const { userGroup } = await describeGovernanceGroupDetail({
        id: groupId,
      })
      return {
        totalCount: userGroup.relation.users.length,
        list:
          userGroup.relation.users?.map(item => ({
            ...item,
            id: item.id,
          })) || [],
      }
    } else {
      result = await describeGovernanceUsers({
        limit: count,
        offset: (page - 1) * count,
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
}
