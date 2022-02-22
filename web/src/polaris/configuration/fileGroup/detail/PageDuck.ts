import DetailPageDuck from '@src/polaris/common/ducks/DetailPage'
import { reduceFromPayload, createToPayload } from 'saga-duck'
import { select, put, takeLatest } from 'redux-saga/effects'

import FileDuck from './file/PageDuck'
import { TAB } from './Page'
import { ConfigFileGroup } from '../types'
import { describeConfigFileGroups } from '../model'

export interface ComposedId {
  group: string
  namespace: string
}
export default class ConfigFileDuck extends DetailPageDuck {
  ComposedId: ComposedId
  Data: ConfigFileGroup

  get baseUrl() {
    return '/#/filegroup-detail'
  }

  get params() {
    const { types } = this
    return [
      ...super.params,
      {
        key: 'namespace',
        type: types.SET_NAMESPACE,
        defaults: '',
      },
      {
        key: 'group',
        type: types.SET_GROUP_NAME,
        defaults: '',
      },
    ]
  }
  get quickTypes() {
    enum Types {
      SWITCH,
      SET_NAMESPACE,
      SET_GROUP_NAME,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      [TAB.File]: FileDuck,
    }
  }
  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      tab: reduceFromPayload(types.SWITCH, TAB.File),
      namespace: reduceFromPayload(types.SET_NAMESPACE, ''),
      group: reduceFromPayload(types.SET_GROUP_NAME, ''),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      switch: createToPayload<string>(types.SWITCH),
    }
  }
  get rawSelectors() {
    type State = this['State']
    return {
      ...super.rawSelectors,
      composedId: (state: State) => ({
        group: state.group,
        namespace: state.namespace,
      }),
      tab: (state: State) => state.tab,
    }
  }
  async getData(composedId: this['ComposedId']) {
    const { group, namespace } = composedId
    const result = await describeConfigFileGroups({
      namespace,
      group: group,
      offset: 0,
      limit: 10,
    })
    return result.list?.[0]
  }
  *saga() {
    yield* super.saga()
    yield* this.watchTabs()
  }
  *watchTabs() {
    const duck = this
    const { types, ducks, selectors } = duck
    yield takeLatest([types.SWITCH, types.FETCH_DONE], function*() {
      const composedId = selectors.composedId(yield select())
      const tab = selectors.tab(yield select())
      const data = selectors.data(yield select())
      if (!composedId || !data) {
        return
      }
      const subDuck = ducks[tab]
      yield put(subDuck.creators.load(composedId, data))
    })
  }
}
