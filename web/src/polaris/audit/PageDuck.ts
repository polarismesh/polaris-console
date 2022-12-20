import { createToPayload, reduceFromPayload } from 'saga-duck'
import GridPageDuck, { Filter as BaseFilter } from '../common/ducks/GridPage'
import { describeOperationRecord, describeResourceType, OperationRecord, ResourceType } from './model'
import { takeLatest } from 'redux-saga-catch'
import { put } from 'redux-saga/effects'
import { TagValue } from 'tea-component'
import { DefaultAuditTagAttribute, ResourceNameTag } from './Page'
import { NamespaceItem } from '../service/PageDuck'
import { describeNamespaces } from '../service/model'
import moment from 'moment'
import { once, ttl } from '../common/helpers/cacheable'
const cacheDescribeOperationRecord = once(describeOperationRecord, ttl(30 * 60 * 1000))

export const EmptyCustomFilter = {
  namespace: '',
  resource_type: '',
  resource_name: '',
  operation_type: '',
  operator: '',
  operation_detail: '',
}

interface Filter extends BaseFilter {
  namespace?: string
  resource_type?: string
  resource_name?: string
  operation_type?: string
  operator?: string
  operation_detail?: string
  start_time?: string
  end_time?: string
  extend_info?: Object
}
interface CustomFilters {
  namespace?: string
  resource_type?: string
  resource_name?: string
  operation_type?: string
  operator?: string
  operation_detail?: string
}
export default class ServicePageDuck extends GridPageDuck {
  Filter: Filter
  Item: OperationRecord
  get baseUrl() {
    return '/#/audit'
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
    return [...super.watchTypes, this.types.SEARCH, this.types.SET_CUSTOM_FILTERS, this.types.SET_FILTER_TIME]
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
      authOpen: reduceFromPayload<boolean>(types.SET_AUTH_OPEN, false),
      tags: reduceFromPayload<TagValue[]>(types.SET_TAGS, []),
      resourceTypeList: reduceFromPayload<ResourceType[]>(types.SET_RESOURCE_TYPE_LIST, []),
      filterTime: reduceFromPayload<[moment.Moment, moment.Moment]>(types.SET_FILTER_TIME, [
        moment().subtract(7, 'd'),
        moment(),
      ]),
      extendInfo: reduceFromPayload<Object>(types.SET_EXTEND_INFO, {}),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      setCustomFilters: createToPayload<CustomFilters>(types.SET_CUSTOM_FILTERS),
      changeTags: createToPayload(types.CHANGE_TAGS),
      setFilterTime: createToPayload(types.SET_FILTER_TIME),
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
        resource_type: state.customFilters.resource_type,
        resource_name: state.customFilters.resource_name,
        operation_detail: state.customFilters.operation_detail,
        operation_type: state.customFilters.operation_type,
        operator: state.customFilters.operator,
        start_time: state.filterTime[0].unix().toString(),
        end_time: state.filterTime[1].unix().toString(),
        extend_info: state.extendInfo,
      }),
      customFilters: (state: State) => state.customFilters,
      namespaceList: (state: State) => state.namespaceList,
      resourceTypeMap: (state: State) => {
        return state.resourceTypeList.reduce((prev, curr) => {
          prev[curr.type] = curr.desc
          return prev
        }, {} as any)
      },
    }
  }
  *loadInfo() {
    const namespaceList = yield describeNamespaces()
    const options = namespaceList.map((item) => ({
      ...item,
      text: item.name,
      value: item.name,
      key: item.name,
    }))
    yield put({
      type: this.types.SET_NAMESPACE_LIST,
      payload: options,
    })
    const { data: resourceTypeList } = yield describeResourceType()
    const resourceTypeOption = resourceTypeList.map((item) => ({
      ...item,
      text: item.desc,
      value: item.type,
      name: item.desc,
    }))
    yield put({
      type: this.types.SET_RESOURCE_TYPE_LIST,
      payload: resourceTypeOption,
    })
  }

  *saga() {
    const { types, ducks } = this
    yield* super.saga()
    yield* this.loadInfo()
    yield takeLatest(ducks.grid.types.FETCH_DONE, function* (action) {
      const { extend_info } = action.payload
      yield put({ type: types.SET_EXTEND_INFO, payload: extend_info })
    })
    yield takeLatest(types.RELOAD, function* () {
      yield put(ducks.grid.creators.reset())
    })
    yield takeLatest(types.CHANGE_TAGS, function* (action) {
      const tags = action.payload
      const customFilters = { ...EmptyCustomFilter }
      const validTags = tags.map((item) => {
        if (item.attr) return item
        else return { ...item, attr: DefaultAuditTagAttribute }
      })
      yield put({ type: types.SET_TAGS, payload: validTags })
      validTags.forEach((tag) => {
        const key = tag?.attr?.key || ResourceNameTag

        if (tag.attr.type === 'input') customFilters[key] = tag.values[0].name
        else customFilters[key] = tag.values[0].key || tag.values[0].value
      })
      yield put({ type: types.SET_CUSTOM_FILTERS, payload: customFilters })
    })
  }

  async getData(filters: this['Filter']) {
    const {
      page,
      count,
      namespace,
      resource_type,
      resource_name,
      operation_type,
      operator,
      operation_detail,
      start_time,
      end_time,
      extend_info,
    } = filters
    const requestMethod = page === 1 ? describeOperationRecord : cacheDescribeOperationRecord

    const {
      has_next,
      data,
      extend_info: nextExtendInfo,
    } = await requestMethod({
      limit: count,
      offset: (page - 1) * count,
      namespace: namespace || undefined,
      resource_type: resource_type || undefined,
      resource_name: resource_name ? `${resource_name}*` : undefined,
      operation_type: operation_type || undefined,
      operator: operator ? `${operator}*` : undefined,
      operation_detail: operation_detail ? `${operation_detail}*` : undefined,
      start_time: start_time || undefined,
      end_time: end_time || undefined,
      extend_info: extend_info[page] || undefined,
    })
    if (has_next) {
      extend_info[page + 1] = nextExtendInfo
    }
    return {
      list: data?.map((item) => ({
        ...item,
        id: Math.floor(Math.random() * 10000000),
      })),
      totalCount: has_next ? page * count + 1 : data.length - 1,
      extend_info,
    }
  }
}
