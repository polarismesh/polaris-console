import { reduceFromPayload, createToPayload } from 'saga-duck'
import { select, put, takeLatest } from 'redux-saga/effects'
import { TAB } from './Page'
import FileGroupDuck from './fileGroup/PageDuck'
import ReleaseDuck from './releaseHistory/PageDuck'
import PageDuck from '../common/ducks/Page'

export default class ServiceDetailDuck extends PageDuck {
  get baseUrl() {
    return '/configuration'
  }

  get params() {
    const { types } = this
    return [
      ...super.params,
      {
        key: 'namespace',
        type: types.SET_NAMESPACE,
        selector: this.selectors.namespace,
      },
      {
        key: 'group',
        type: types.SET_GROUP_NAME,
        selector: this.selectors.group,
      },
      {
        key: 'fileName',
        type: types.SET_FILENAME,
        selector: this.selectors.fileName,
      },
      {
        key: 'tab',
        type: types.SWITCH,
        defaults: TAB.FileGroup,
      },
    ]
  }
  get quickTypes() {
    enum Types {
      SWITCH,
      SET_NAMESPACE,
      SET_SERVICE_NAME,
      SET_GROUP_NAME,
      SET_FILENAME,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      [TAB.FileGroup]: FileGroupDuck,
      [TAB.Release]: ReleaseDuck,
    }
  }
  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      tab: reduceFromPayload(types.SWITCH, TAB.FileGroup),
      namespace: reduceFromPayload(types.SET_NAMESPACE, ''),
      fileName: reduceFromPayload(types.SET_FILENAME, ''),
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
        fileName: state.fileName,
        group: state.group,
        namespace: state.namespace,
      }),
      tab: (state: State) => state.tab,
      namespace: (state: State) => state.namespace,
      fileName: (state: State) => state.fileName,
      group: (state: State) => state.group,
    }
  }
  async getData() {
    return {
      list: [],
      totalCount: 0,
    }
  }
  *saga() {
    yield* super.saga()
    yield* this.watchTabs()
  }
  *watchTabs() {
    const duck = this
    const { types, ducks, selectors } = duck
    yield takeLatest(types.SWITCH, function*() {
      const composedId = selectors.composedId(yield select())
      const tab = selectors.tab(yield select())
      const subDuck = ducks[tab]
      yield put(subDuck.creators.load({ ...composedId }))
    })
  }
}
