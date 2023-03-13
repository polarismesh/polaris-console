import DetailPage from '@src/polaris/common/ducks/DetailPage'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import { describeConfigFileGroups } from '@src/polaris/configuration/fileGroup/model'
import { describeServices } from '@src/polaris/service/model'
import { reduceFromPayload, createToPayload } from 'saga-duck'
import { ComposedId } from '../PageDuck'

export default class ServiceMonitorDuck extends DetailPage {
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
      SELECT_SERVICE,
      SELECT_CONFIG_GROUP,
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
      selectedService: reduceFromPayload(types.SELECT_SERVICE, []),
      selectedConfigGroup: reduceFromPayload(types.SELECT_CONFIG_GROUP, []),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      load: createToPayload<ComposedId>(types.LOAD),
      selectService: createToPayload<string[]>(types.SELECT_SERVICE),
      selectConfigGroup: createToPayload<string[]>(types.SELECT_CONFIG_GROUP),
    }
  }
  get rawSelectors() {
    type State = this['State']
    return {
      ...super.rawSelectors,
      composedId: (state: State) => state.composedId,
      serviceMap: (state: State) => {
        if (state.data?.serviceList) {
          return state.data?.serviceList.reduce((prev, curr) => {
            prev[curr.id] = curr
            return prev
          }, {})
        }
        return {}
      },
      configGroupMap: (state: State) => {
        if (state.data?.configGroupList) {
          return state.data?.configGroupList.reduce((prev, curr) => {
            prev[curr.id] = curr
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
  async getData(composedId: ComposedId) {
    const { namespace } = composedId
    const [configResult, serviceResult] = await Promise.all([
      getAllList(describeConfigFileGroups)({ namespace: namespace ? composedId.namespace : undefined }),
      getAllList(describeServices, {})({ namespace: namespace ? composedId.namespace : undefined }),
    ])
    return {
      configGroupList: configResult.list.map(item => ({ ...item, text: item.name, value: item.id })),
      serviceList: serviceResult.list.map(item => ({ ...item, text: item.name, value: item.id })),
    }
  }
}
