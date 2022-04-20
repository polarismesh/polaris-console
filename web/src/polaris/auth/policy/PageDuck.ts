import { put, select } from 'redux-saga/effects'
import { takeLatest } from 'redux-saga-catch'
import { reduceFromPayload, createToPayload } from 'saga-duck'
import {
  describeGovernanceStrategies,
  AuthStrategy,
  describeGovernanceStrategyDetail,
  deleteGovernanceStrategies,
} from '../model'
import { PrincipalTypeMap } from '../constants'

import { Modal, notification } from 'tea-component'
import PageDuck from '@src/polaris/common/ducks/Page'
import router from '@src/polaris/common/util/router'
import { getAllList } from '@src/polaris/common/util/apiRequest'
interface ComposedId {
  principalId?: string
  principalType?: string
}
export default abstract class PolicyPageDuck extends PageDuck {
  get baseUrl() {
    return '/#/policy'
  }
  get quickTypes() {
    enum Types {
      LOAD,
      RELOAD,
      SET_DATA,
      SET_COMPOSE_ID,
      FETCH_DATA,
      SET_AUTH_LIST,
      SET_LOADING,
      SET_CURRENT_AUTH_ITEM,
      FETCH_CURRENT_AUTH_ITEM,
      CREATE,
      MODIFY,
      SET_SEARCHWORD,
      SEARCH,
      DELETE,
    }
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

  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      composedId: reduceFromPayload(types.SET_COMPOSE_ID, {} as ComposedId),
      authList: reduceFromPayload(types.SET_AUTH_LIST, [] as AuthStrategy[]),
      loading: reduceFromPayload(types.SET_LOADING, false),
      currentAuthItem: reduceFromPayload(types.SET_CURRENT_AUTH_ITEM, {} as AuthStrategy),
      searchword: reduceFromPayload(types.SET_SEARCHWORD, ''),
    }
  }

  get creators() {
    const { types } = this
    return {
      ...super.creators,
      load: composedId => ({
        type: types.LOAD,
        payload: { composedId },
      }),
      create: createToPayload<void>(types.CREATE),
      fetchCurrentAuthItem: createToPayload<string>(types.FETCH_CURRENT_AUTH_ITEM),
      modify: createToPayload<string>(types.MODIFY),
      setSearchword: createToPayload<string>(types.SET_SEARCHWORD),
      search: createToPayload<void>(types.SEARCH),
      reload: createToPayload<void>(types.RELOAD),
      delete: createToPayload<string>(types.DELETE),
    }
  }

  get rawSelectors() {
    type State = this['State']
    return {
      ...super.rawSelectors,
      composedId: (state: State) => state.composedId,
    }
  }
  abstract getReplicas()
  *saga() {
    yield* super.saga()
    const { types, selector, creators } = this
    yield takeLatest(types.LOAD, function*(action) {
      const { composedId } = action.payload
      yield put({ type: types.SET_COMPOSE_ID, payload: composedId })
      yield put({ type: types.FETCH_DATA, payload: composedId })
    })
    yield takeLatest(types.FETCH_CURRENT_AUTH_ITEM, function*(action) {
      const id = action.payload

      const { strategy } = yield describeGovernanceStrategyDetail({ id })
      yield put({ type: types.SET_CURRENT_AUTH_ITEM, payload: strategy })
    })
    yield takeLatest(types.CREATE, function*() {
      router.navigate(`/policy-create`)
    })
    yield takeLatest(types.MODIFY, function*(action) {
      const id = action.payload

      router.navigate(`/policy-create?id=${id}`)
    })
    yield takeLatest(types.DELETE, function*(action) {
      const id = action.payload
      const confirm = yield Modal.confirm({
        message: '确认删除如下策略？',
        description: '删除后，策略不可用且无法恢复',
      })
      if (confirm) {
        const result = yield deleteGovernanceStrategies([{ id }])
        if (result) {
          notification.success({ description: '删除成功' })
          yield put(creators.reload())
        } else {
          notification.error({ description: '删除失败' })
        }
      }
    })
    yield takeLatest([types.FETCH_DATA, types.RELOAD, types.SEARCH], function*(action) {
      const {
        composedId: { principalId, principalType },
        searchword,
        currentAuthItem,
      } = selector(yield select())
      yield put({ type: types.SET_LOADING, payload: true })
      try {
        const { list: authList } = yield getAllList(describeGovernanceStrategies, { listKey: 'content' })({
          ...(searchword ? { name: searchword } : {}),
          principal_id: principalId,
          principal_type: PrincipalTypeMap[principalType],
        })
        yield put({ type: types.SET_AUTH_LIST, payload: authList })
        if (
          authList.length > 0 &&
          (!currentAuthItem.id || action.type === types.RELOAD || action.type === types.SEARCH)
        ) {
          if (authList.find(item => item.id === currentAuthItem.id))
            yield put({ type: types.FETCH_CURRENT_AUTH_ITEM, payload: currentAuthItem.id })
          else yield put({ type: types.FETCH_CURRENT_AUTH_ITEM, payload: authList[0].id })
        }
      } finally {
        yield put({ type: types.SET_LOADING, payload: false })
      }
    })
    yield put({ type: types.FETCH_DATA, payload: {} })
  }
}
