import { createToPayload, reduceFromPayload } from 'saga-duck'
import GridPageDuck, { Filter as BaseFilter } from '../common/ducks/GridPage'
import { Service, Namespace } from './types'
import { describeServices, describeNamespaces, deleteService } from './model'
import { takeLatest } from 'redux-saga-catch'
import { resolvePromise } from 'saga-duck/build/helper'
import { showDialog } from '../common/helpers/showDialog'
import Create from './operation/Create'
import CreateDuck, { enableNearbyString } from './operation/CreateDuck'
import { put, select } from 'redux-saga/effects'
import { Modal, TagValue } from 'tea-component'
import { checkAuth } from '../auth/model'
import { KeyValuePair } from '../configuration/fileGroup/types'
import { DefaultServiceTagAttribute, ServiceNameTagKey, MetadataTagKey, HideEmptyServiceTagKey } from './Page'
import { PolarisTokenKey } from '../common/util/common'
import router from '../common/util/router'

export const EmptyCustomFilter = {
  namespace: '',
  serviceName: '',
  instanceIp: '',
  serviceTag: { key: '', value: '' },
  searchMethod: 'accurate',
  department: '',
  business: '',
  hideEmptyService: false,
}

interface Filter extends BaseFilter {
  namespace: string
  serviceName: string
  instanceIp: string
  serviceTag: KeyValuePair
  searchMethod?: string
  department?: string
  business?: string
  hideEmptyService?: boolean
  sync_to_global_registry: string
}
interface CustomFilters {
  namespace?: string
  serviceName?: string
  instanceIp?: string
  serviceTag?: KeyValuePair
  searchMethod?: string
  department?: string
  business?: string
  hideEmptyService?: boolean
}

export interface NamespaceItem extends Namespace {
  text: string
  value: string
}
export interface ServiceItem extends Service {
  id: string
}

const convertMetaData = (metaData: Record<string, string>): KeyValuePair[] => {
  return Object.entries(metaData).map(([key, value]) => ({ key, value }))
}

export default class ServicePageDuck extends GridPageDuck {
  Filter: Filter
  Item: ServiceItem
  get baseUrl() {
    return '/#/service'
  }
  get quickTypes() {
    enum Types {
      SET_CUSTOM_FILTERS,
      EDIT,
      REMOVE,
      CREATE,
      SET_SELECTION,
      SET_NAMESPACE_LIST,
      SET_EXPANDED_KEYS,
      SET_AUTH_OPEN,
      CHANGE_TAGS,
      SET_TAGS,
      SET_SYNC_TO_GLOBAL_REGISTRY,
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
  get watchTypes() {
    return [
      ...super.watchTypes,
      this.types.SEARCH,
      this.types.SET_CUSTOM_FILTERS,
      this.types.SET_SYNC_TO_GLOBAL_REGISTRY,
    ]
  }
  get params() {
    return [...super.params]
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
      customFilters: reduceFromPayload<CustomFilters>(types.SET_CUSTOM_FILTERS, EmptyCustomFilter),
      selection: reduceFromPayload<string[]>(types.SET_SELECTION, []),
      namespaceList: reduceFromPayload<NamespaceItem[]>(types.SET_NAMESPACE_LIST, []),
      expandedKeys: reduceFromPayload<string[]>(types.SET_EXPANDED_KEYS, []),
      authOpen: reduceFromPayload<boolean>(types.SET_AUTH_OPEN, false),
      tags: reduceFromPayload<TagValue[]>(types.SET_TAGS, []),
      sync_to_global_registry: reduceFromPayload<string>(types.SET_SYNC_TO_GLOBAL_REGISTRY, ''),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      setCustomFilters: createToPayload<CustomFilters>(types.SET_CUSTOM_FILTERS),
      edit: (payload: Service) => {
        return {
          type: types.EDIT,
          payload: {
            ...payload,
            enableNearby: payload.metadata && !!payload.metadata[enableNearbyString],
            metadata: convertMetaData(payload.metadata).filter(item => item.key !== enableNearbyString),
          },
        }
      },
      //  createToPayload<Service>(types.EDIT),
      remove: createToPayload<Service[]>(types.REMOVE),
      create: createToPayload<void>(types.CREATE),
      setSelection: createToPayload<string[]>(types.SET_SELECTION),
      setExpandedKeys: createToPayload<string[]>(types.SET_EXPANDED_KEYS),
      changeTags: createToPayload(types.CHANGE_TAGS),
      setSyncToGlobalRegistry: createToPayload<string>(types.SET_SYNC_TO_GLOBAL_REGISTRY),
    }
  }
  get rawSelectors() {
    type State = this['State']
    return {
      ...super.rawSelectors,
      filter: (state: State) => ({
        page: state.page,
        count: state.count,
        keyword: state.keyword,
        namespace: state.customFilters.namespace,
        serviceName: state.customFilters.serviceName,
        instanceIp: state.customFilters.instanceIp,
        serviceTag: state.customFilters.serviceTag,
        searchMethod: state.customFilters.searchMethod,
        department: state.customFilters.department,
        business: state.customFilters.business,
        hideEmptyService: state.customFilters.hideEmptyService,
        sync_to_global_registry: state.sync_to_global_registry,
      }),
      customFilters: (state: State) => state.customFilters,
      selection: (state: State) => state.selection,
      namespaceList: (state: State) => state.namespaceList,
    }
  }
  *loadNamespaceList() {
    const namespaceList = yield describeNamespaces()
    const options = namespaceList.map(item => ({
      ...item,
      text: item.name,
      value: item.name,
      key: item.name,
    }))
    yield put({
      type: this.types.SET_NAMESPACE_LIST,
      payload: options,
    })
  }

  *saga() {
    const { types, creators, selector, ducks } = this
    yield* super.saga()
    const authOpen = yield checkAuth({})
    yield put({ type: types.SET_AUTH_OPEN, payload: authOpen })
    if (authOpen) {
      if (window.localStorage.getItem(PolarisTokenKey)) yield* this.loadNamespaceList()
      else router.navigate('/login')
    } else {
      yield* this.loadNamespaceList()
    }
    yield takeLatest(ducks.grid.types.FETCH_DONE, function*(action) {
      const { list } = action.payload
      const { selection } = selector(yield select())
      const validSelection = selection.filter(id => !!list.find(item => item.id === id))
      yield put(creators.setSelection(validSelection))
    })
    yield takeLatest(types.CREATE, function*() {
      const { authOpen } = selector(yield select())
      const res = yield* resolvePromise(
        new Promise(resolve => {
          showDialog(Create, CreateDuck, function*(duck: CreateDuck) {
            try {
              resolve(yield* duck.execute({}, { isModify: false, authOpen }))
            } finally {
              resolve(false)
            }
          })
        }),
      )
      if (res) {
        yield put(creators.reload())
      }
    })
    yield takeLatest(types.CHANGE_TAGS, function*(action) {
      const tags = action.payload
      const customFilters = { ...EmptyCustomFilter }
      const validTags = tags.map(item => {
        if (item.attr) return item
        else return { ...item, attr: DefaultServiceTagAttribute }
      })
      yield put({ type: types.SET_TAGS, payload: validTags })
      validTags.forEach(tag => {
        const key = tag?.attr?.key || ServiceNameTagKey
        if (key === MetadataTagKey) {
          customFilters[key] = tag.values.map(item => ({ key: item.key, value: item.value }))
        } else if (key === HideEmptyServiceTagKey) {
          customFilters[key] = tag.values[0].value
        } else {
          if (tag.attr.type === 'input') customFilters[key] = tag.values[0].name
          else customFilters[key] = tag.values[0].key || tag.values[0].value
        }
      })
      yield put({ type: types.SET_CUSTOM_FILTERS, payload: customFilters })
    })
    yield takeLatest(types.EDIT, function*(action) {
      const data = action.payload
      const res = yield* resolvePromise(
        new Promise(resolve => {
          showDialog(Create, CreateDuck, function*(duck: CreateDuck) {
            try {
              resolve(yield* duck.execute(data, { isModify: true, authOpen }))
            } finally {
              resolve(false)
            }
          })
        }),
      )
      if (res) {
        yield put(creators.reload())
      }
    })
    yield takeLatest(types.REMOVE, function*(action) {
      const data = action.payload
      const params = data
        .map(item => {
          if (!item) {
            return
          }
          const { namespace, name } = item
          return { namespace, name }
        })
        .filter(item => item)
      const confirm = yield Modal.confirm({
        message: `确认删除服务`,
        description: '删除后，无法恢复',
      })
      if (confirm) {
        yield deleteService(params)
        yield put(creators.reload())
      }
    })
  }

  async getData(filters: this['Filter']) {
    const {
      page,
      count,
      namespace,
      serviceTag,
      instanceIp,
      department,
      business,
      hideEmptyService,
      sync_to_global_registry,
    } = filters
    const { key, value } = serviceTag?.[0] || {}
    const serviceName = filters.serviceName
    const result = await describeServices({
      limit: count,
      offset: (page - 1) * count,
      namespace: namespace || undefined,
      name: serviceName ? `${serviceName}*` : undefined,
      keys: key || undefined,
      values: value || undefined,
      host: instanceIp || undefined,
      department: department || undefined,
      business: business || undefined,
      only_exist_health_instance: hideEmptyService || undefined,
      ...(sync_to_global_registry ? { sync_to_global_registry: sync_to_global_registry === 'true' } : {}),
    })
    return {
      totalCount: result.totalCount,
      list:
        result.list?.map(item => ({
          ...item,
          id: item.id || `${item.namespace}#${item.name}`,
        })) || [],
    }
  }
}
