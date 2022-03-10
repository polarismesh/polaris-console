/**
 * 可搜索多选
 */

import Base from './SearchableList'
import { createToPayload, reduceFromPayload } from 'saga-duck'
import { takeLatest } from 'redux-saga-catch'
import { select, put } from 'redux-saga/effects'

export default abstract class SearchableMultiSelect extends Base {
  ID: string
  abstract getId(o: this['Item']): this['ID']
  get quickTypes() {
    enum Types {
      SELECT,
      ADD,
      REMOVE,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      selection: reduceFromPayload<this['Item'][]>(types.SELECT, []),
      // selection: (state = [], action): this['Item'][] => {
      //   switch (action.type) {
      //     case types.SELECT:
      //       return action.payload
      //     case types.ADD:
      //       return state.concat(action.payload)
      //     case types.REMOVE: {
      //       const removeSet = new Set(
      //         action.payload.map(item => this.getId(item))
      //       )
      //       return state.filter(item => !removeSet.has(this.getId(item)))
      //     }
      //     // 参数变更时，重置选择
      //     case types.LOAD_START:
      //       return []
      //     default:
      //       return state
      //   }
      // }
    }
  }
  get creators() {
    const { types } = this
    type TITEM = this['Item']
    return {
      ...super.creators,
      select: createToPayload<TITEM[]>(types.SELECT),
      add: createToPayload<TITEM[]>(types.ADD),
      remove: createToPayload<TITEM[]>(types.REMOVE),
    }
  }
  *saga() {
    yield* super.saga()
    // 为了让它可以在ducks/Form中正确同步，将select/add/remove/fetch_start操作统一映射为select
    const { types, selector, creators } = this
    const duck = this
    yield takeLatest(types.ADD, function*(action) {
      const { selection } = selector(yield select())
      yield put(creators.select(selection.concat(action.payload)))
    })
    yield takeLatest(types.REMOVE, function*(action) {
      const { selection } = selector(yield select())
      const removeSet = new Set(action.payload.map(item => duck.getId(item)))
      yield put(creators.select(selection.filter(item => !removeSet.has(duck.getId(item)))))
    })
    yield* this.sagaAutoClear()
  }
  get autoClearBeforeLoad() {
    return true
  }
  *sagaAutoClear() {
    const { types, creators } = this
    if (!this.autoClearBeforeLoad) {
      return
    }
    yield takeLatest(types.LOAD_START, function*(action) {
      yield put(creators.select([]))
    })
  }
}
