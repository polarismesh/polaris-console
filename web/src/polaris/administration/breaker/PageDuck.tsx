import { createToPayload, reduceFromPayload } from 'saga-duck'
import GridPageDuck, { Filter as BaseFilter } from '../../common/ducks/GridPage'
import { takeLatest } from 'redux-saga-catch'
import { put, select } from 'redux-saga/effects'
import { Modal, TagValue } from 'tea-component'
import {
  BreakerType,
  BreakLevelSearchParamMap,
  CircuitBreakerRule,
  InterfaceLevelType,
  ServiceLevelType,
} from './types'
import { NamespaceItem } from '@src/polaris/service/PageDuck'
import { describeNamespaces } from '@src/polaris/service/model'
import { deleteCircuitBreaker, DescribeCircuitBreakers, enableCircuitBreaker } from './model'
import { DefaultBreakerTag, TagSearchType } from './Page'
import FaultDetectDuck from './faultDetect/PageDuck'
import { checkFeatureValid } from '@src/polaris/common/util/checkFeature'

export const EmptyCustomFilter = {
  name: '',
  enable: '',
  srcService: '',
  srcNamespace: '',
  dstService: '',
  dstNamespace: '',
  dstMethod: '',
  description: '',
}

interface Filter extends BaseFilter {
  name?: string
  enable?: string
  srcService?: string
  srcNamespace?: string
  dstService?: string
  dstNamespace?: string
  dstMethod?: string
  description?: string
  type?: string
  loadData?: ComposedId
}
interface CustomFilters {
  name?: string
  enable?: string
  srcService?: string
  srcNamespace?: string
  dstService?: string
  dstNamespace?: string
  dstMethod?: string
  description?: string
}
export interface ComposedId {
  name: string
  namespace: string
}
export default class ServicePageDuck extends GridPageDuck {
  Filter: Filter
  Item: CircuitBreakerRule
  get baseUrl() {
    return '/#/circuitBreaker'
  }
  get quickTypes() {
    enum Types {
      SET_CUSTOM_FILTERS,
      SET_NAMESPACE_LIST,
      SET_RESOURCE_TYPE_LIST,
      SET_AUTH_OPEN,
      CHANGE_TAGS,
      SET_TAGS,
      SET_FILTER_TIME,
      SET_EXTEND_INFO,
      LOAD,
      SET_EXPANDED_KEY,
      SET_RULE_INFO_MAP,
      TOGGLE_RULE,
      REMOVE,
      SET_TYPE,
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
    return [...super.watchTypes, this.types.SEARCH, this.types.SET_CUSTOM_FILTERS, this.types.SET_TYPE, this.types.LOAD]
  }
  get params() {
    return [
      ...super.params,
      {
        key: 'type',
        type: this.types.SET_TYPE,
        defaults: BreakerType.Service,
      },
    ]
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      faultDetect: FaultDetectDuck,
    }
  }
  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      customFilters: reduceFromPayload<CustomFilters>(types.SET_CUSTOM_FILTERS, EmptyCustomFilter),
      namespaceList: reduceFromPayload<NamespaceItem[]>(types.SET_NAMESPACE_LIST, []),
      tags: reduceFromPayload<TagValue[]>(types.SET_TAGS, []),
      loadData: reduceFromPayload<ComposedId>(types.LOAD, null),
      expandedKeys: reduceFromPayload<string[]>(types.SET_EXPANDED_KEY, []),
      ruleInfoMap: reduceFromPayload<Map<string, CircuitBreakerRule>>(types.SET_RULE_INFO_MAP, {} as any),
      type: reduceFromPayload<string>(types.SET_TYPE, BreakerType.Service),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      setCustomFilters: createToPayload<CustomFilters>(types.SET_CUSTOM_FILTERS),
      changeTags: createToPayload(types.CHANGE_TAGS),
      load: createToPayload<ComposedId>(types.LOAD),
      remove: createToPayload<CircuitBreakerRule>(types.REMOVE),
      toggle: createToPayload<CircuitBreakerRule>(types.TOGGLE_RULE),
      setExpandedKeys: createToPayload<string[]>(types.SET_EXPANDED_KEY),
      setType: createToPayload<string>(types.SET_TYPE),
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
        name: state.customFilters.name,
        enable: state.customFilters.enable,
        srcService: state.customFilters.srcService,
        srcNamespace: state.customFilters.srcNamespace,
        dstService: state.customFilters.dstService,
        dstNamespace: state.customFilters.dstNamespace,
        dstMethod: state.customFilters.dstMethod,
        description: state.customFilters.description,
        type: state.type,
        loadData: state.loadData,
      }),
      customFilters: (state: State) => state.customFilters,
      namespaceList: (state: State) => state.namespaceList,
    }
  }
  *loadInfo() {
    const namespaceList = yield describeNamespaces()
    const options = namespaceList.map(item => ({
      ...item,
      text: item.name,
      value: item.name,
      key: item.name,
    }))
    yield put({
      type: this.types.SET_NAMESPACE_LIST,
      payload: [{ text: '全部命名空间', name: '全部命名空间', value: '*', key: '*' }, ...options],
    })
  }

  *saga() {
    const { types, selector, creators, ducks } = this
    yield* super.saga()
    yield* this.loadInfo()
    yield takeLatest(types.LOAD, function*(action) {
      yield put(ducks.faultDetect.creators.load(action.payload))
    })
    yield takeLatest(types.RELOAD, function*() {
      yield put(ducks.faultDetect.creators.reload())
    })
    yield takeLatest(ducks.grid.types.FETCH_DONE, function*() {
      yield put(ducks.faultDetect.creators.reload())
    })
    yield takeLatest(types.CHANGE_TAGS, function*(action) {
      const tags = action.payload
      const customFilters = { ...EmptyCustomFilter }
      const validTags = tags.map(item => {
        if (item.attr) return item
        else return { ...item, attr: DefaultBreakerTag }
      })
      yield put({ type: types.SET_TAGS, payload: validTags })
      validTags.forEach(tag => {
        const key = tag?.attr?.key || TagSearchType.Name

        if (tag.attr.type === 'input') customFilters[key] = tag.values[0].name
        else customFilters[key] = tag.values[0].key || tag.values[0].value
      })
      yield put({ type: types.SET_CUSTOM_FILTERS, payload: customFilters })
    })
    yield takeLatest(types.SET_EXPANDED_KEY, function*(action) {
      const { ruleInfoMap } = selector(yield select())
      const expandedKeys = action.payload
      const obj = { ...ruleInfoMap }
      for (let i = 0; i < expandedKeys.length; i++) {
        if (!obj[expandedKeys[i]]) {
          const result = yield DescribeCircuitBreakers({ limit: 10, offset: 0, id: expandedKeys[i], brief: false })
          obj[expandedKeys[i]] = result?.list?.[0]
          yield put({ type: types.SET_RULE_INFO_MAP, payload: obj })
        }
      }
    })
    yield takeLatest(types.REMOVE, function*(action) {
      const rule = action.payload
      const confirm = yield Modal.confirm({
        message: `确认删除规则 ${rule.name} 吗？`,
        description: '删除后，无法恢复',
      })
      if (confirm) {
        yield deleteCircuitBreaker([{ id: rule.id }])
        yield put(creators.reload())
      }
      return null
    })
    yield takeLatest(types.SET_TYPE, function*(action) {
      if (action.payload === BreakerType.FaultDetect) yield put(ducks.faultDetect.creators.reload())
    })
    yield takeLatest(types.TOGGLE_RULE, function*(action) {
      const rule = action.payload
      const ops = rule.enable ? '禁用' : '启用'
      const confirm = yield Modal.confirm({
        message: `确认${ops}规则 ${rule.name} 吗？`,
      })
      if (confirm) {
        yield enableCircuitBreaker([{ id: rule.id, enable: !rule.enable }])
        yield put(creators.reload())
      }
    })
  }

  async getData(filters: this['Filter']) {
    const {
      page,
      count,
      name,
      enable,
      srcService,
      srcNamespace,
      dstService,
      dstNamespace,
      dstMethod,
      description,
      type,
      loadData,
    } = filters
    let level
    if (type === BreakerType.Service) {
      level = ServiceLevelType.map(item => BreakLevelSearchParamMap[item]).join(',')
    }
    if (type === BreakerType.Interface) {
      level = InterfaceLevelType.map(item => BreakLevelSearchParamMap[item]).join(',')
    }
    const available = await checkFeatureValid('circuitbreaker')
    if (!available) return { totalCount: 0, list: [] }
    const { totalCount, list } = await DescribeCircuitBreakers({
      limit: count,
      offset: (page - 1) * count,
      brief: true,
      name: name || undefined,
      enable: enable === '' ? undefined : enable === 'true' ? true : false,
      srcService: srcService || undefined,
      srcNamespace: srcNamespace || undefined,
      dstService: dstService || undefined,
      dstNamespace: dstNamespace || undefined,
      dstMethod: dstMethod || undefined,
      description: description || undefined,
      level: level || undefined,
      service: loadData?.name || undefined,
      serviceNamespace: loadData?.namespace || undefined,
    })
    return {
      list,
      totalCount,
    }
  }
}
