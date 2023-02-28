import DetailPage from '@src/polaris/common/ducks/DetailPage'
import { reduceFromPayload, createToPayload } from 'saga-duck'
import { ComposedId } from '../PageDuck'

export default class OverviewDuck extends DetailPage {
  get baseUrl() {
    return null
  }
  Data: any
  ComposedId: ComposedId
  get initialFetch() {
    return false
  }

  get watchTypes() {
    return [...super.watchTypes, this.types.LOAD]
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
    }
  }
  get quickTypes() {
    enum Types {
      LOAD,
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
      composedId: reduceFromPayload(types.LOAD, {} as ComposedId),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      load: createToPayload<ComposedId>(types.LOAD),
    }
  }
  get rawSelectors() {
    type State = this['State']
    return {
      ...super.rawSelectors,
      composedId: (state: State) => state.composedId,
    }
  }
  *saga() {
    yield* super.saga()
  }
  async getData() {
    return {}
  }
}
