import { createToPayload, reduceFromPayload } from 'saga-duck'
import GridPageDuck, { Filter as BaseFilter } from '../../../common/ducks/GridPage'
import { takeLatest } from 'redux-saga-catch'
import { put, select } from 'redux-saga/effects'
import { Modal, TagValue } from 'tea-component'

import { NamespaceItem } from '@src/polaris/service/PageDuck'
import { describeNamespaces } from '@src/polaris/service/model'
import { deleteFaultDetect, DescribeFaultDetects } from './model'
import { DefaultBreakerTag, TagSearchType } from './Page'
import { FaultDetectRule } from './types'
import { checkFeatureValid } from '@src/polaris/common/util/checkFeature'

export const EmptyCustomFilter = {
  name: '',
  dstService: '',
  dstNamespace: '',
  dstMethod: '',
  description: '',
}

interface Filter extends BaseFilter {
  name?: string
  service?: string
  serviceNamespace?: string
  dstService?: string
  dstNamespace?: string
  dstMethod?: string
  description?: string
  loadData?: ComposedId
}
interface CustomFilters {
  name?: string
  dstService?: string
  dstNamespace?: string
  dstMethod?: string
  description?: string
}
export interface ComposedId {
  name: string
  namespace: string
}
export default class FaultDetectDuck extends GridPageDuck {
  Filter: Filter
  Item: FaultDetectRule
  get baseUrl() {
    return null
  }
  get quickTypes() {
    enum Types {
      SET_CUSTOM_FILTERS,
      SET_NAMESPACE_LIST,
      CHANGE_TAGS,
      SET_TAGS,
      SET_FILTER_TIME,
      SET_EXTEND_INFO,
      LOAD,
      SET_EXPANDED_KEY,
      SET_RULE_INFO_MAP,
      REMOVE,
      SET_TYPE,
      SET_NAMESPACE,
      SET_ID,
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
    return [...super.watchTypes, this.types.SEARCH, this.types.SET_CUSTOM_FILTERS]
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
      namespaceList: reduceFromPayload<NamespaceItem[]>(types.SET_NAMESPACE_LIST, []),
      tags: reduceFromPayload<TagValue[]>(types.SET_TAGS, []),
      loadData: reduceFromPayload<ComposedId>(types.LOAD, null),
      expandedKeys: reduceFromPayload<string[]>(types.SET_EXPANDED_KEY, []),
      ruleInfoMap: reduceFromPayload<Map<string, FaultDetectRule>>(types.SET_RULE_INFO_MAP, {} as any),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      setCustomFilters: createToPayload<CustomFilters>(types.SET_CUSTOM_FILTERS),
      changeTags: createToPayload(types.CHANGE_TAGS),
      load: createToPayload<ComposedId>(types.LOAD),
      remove: createToPayload<FaultDetectRule>(types.REMOVE),
      setExpandedKeys: createToPayload<string[]>(types.SET_EXPANDED_KEY),
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
        dstService: state.customFilters.dstService,
        dstNamespace: state.customFilters.dstNamespace,
        dstMethod: state.customFilters.dstMethod,
        description: state.customFilters.description,
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
      payload: options,
    })
  }

  *saga() {
    const { types, selector, creators } = this
    yield* super.saga()
    yield* this.loadInfo()
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
          const result = yield DescribeFaultDetects({ limit: 10, offset: 0, id: expandedKeys[i], brief: false })
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
        yield deleteFaultDetect([{ id: rule.id }])
        yield put(creators.reload())
      }
      return null
    })
  }

  async getData(filters: this['Filter']) {
    const { page, count, name, dstService, dstNamespace, dstMethod, description, loadData } = filters
    const available = await checkFeatureValid('circuitbreaker')
    if (!available) return { totalCount: 0, list: [] }
    const { totalCount, list } = await DescribeFaultDetects({
      limit: count,
      offset: (page - 1) * count,
      brief: true,
      name: name || undefined,
      dstService: dstService || undefined,
      dstNamespace: dstNamespace || undefined,
      dstMethod: dstMethod || undefined,
      description: description || undefined,
      service: loadData?.name || undefined,
      serviceNamespace: loadData?.namespace || undefined,
    })
    return {
      list,
      totalCount,
    }
  }
}
