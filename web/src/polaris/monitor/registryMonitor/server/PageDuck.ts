import DetailPage from '@src/polaris/common/ducks/DetailPage'
import { reduceFromPayload, createToPayload } from 'saga-duck'
import { ComposedId } from '../PageDuck'
import { getMetricsInterface, getNamespaceNodes } from '../../models'

export default class ServerMonitorDuck extends DetailPage {
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
      SELECT_INTERFACE,
      SELECT_POD,
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
      selectedInterface: reduceFromPayload(types.SELECT_INTERFACE, []),
      selectedPod: reduceFromPayload(types.SELECT_POD, []),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      load: createToPayload<ComposedId>(types.LOAD),
      selectInterface: createToPayload<string[]>(types.SELECT_INTERFACE),
      selectPod: createToPayload<string[]>(types.SELECT_POD),
    }
  }
  get rawSelectors() {
    type State = this['State']
    return {
      ...super.rawSelectors,
      composedId: (state: State) => state.composedId,
      interfaceMap: (state: State) => {
        if (state.data?.interfaceList) {
          return state.data?.interfaceList.reduce((prev, curr) => {
            prev[curr.value] = curr
            return prev
          }, {})
        }
        return {}
      },
    }
  }
  *saga() {
    yield* super.saga()
  }
  async getData() {
    const [interfaceList, podList] = await Promise.all([getMetricsInterface(), getNamespaceNodes()])
    return {
      interfaceList: interfaceList
        .filter(item => item.query_labels?.length)
        .map(item => {
          const interfaceName = item.query_labels?.join('|')
          const id = btoa(interfaceName)
          return {
            ...item,
            text: item.desc || item.name,
            value: id,
            tooltip: item.name,
            interfaceName,
          }
        }),
      podList: podList.map(item => ({ text: item, value: item })),
    }
  }
}
