import { createToPayload, reduceFromPayload } from 'saga-duck'
import GridPageDuck, { Filter as BaseFilter } from '../common/ducks/GridPage'
import { describeEventCenterRecord, describeEventType, EventRecord, EventType } from './model'
import { takeLatest } from 'redux-saga-catch'
import { put } from 'redux-saga/effects'
import { TagValue } from 'tea-component'
import { NamespaceItem } from '../service/PageDuck'
import { describeNamespaces } from '../service/model'
import moment from 'moment'
import { DefaultServiceTagAttribute, ServiceNameTagKey } from '../service/Page'

export const EmptyCustomFilter = {
  namespace: '',
  service: '',
  instance: '',
}

interface Filter extends BaseFilter {
  namespace?: string
  service?: string
  instance?: string
  start_time?: string
  end_time?: string
  extend_info?: string
}
interface CustomFilters {
  namespace?: string
  service?: string
  instance?: string
}
export default class ServicePageDuck extends GridPageDuck {
  Filter: Filter
  Item: EventRecord
  get baseUrl() {
    return '/#/event'
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
      SET_EVENT_TYPE_LIST,
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
      eventTypeList: reduceFromPayload<EventType[]>(types.SET_EVENT_TYPE_LIST, []),
      filterTime: reduceFromPayload<[moment.Moment, moment.Moment]>(types.SET_FILTER_TIME, [
        moment().subtract(7, 'd'),
        moment(),
      ]),
      extendInfo: reduceFromPayload<string>(types.SET_EXTEND_INFO, ''),
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
        service: state.customFilters.service,
        instance: state.customFilters.instance,
        start_time: state.filterTime[0].unix().toString(),
        end_time: state.filterTime[1].unix().toString(),
      }),
      customFilters: (state: State) => state.customFilters,
      namespaceList: (state: State) => state.namespaceList,
      eventTypeMap: (state: State) => {
        return state.eventTypeList.reduce((prev, curr) => {
          return (curr[prev.type] = prev.desc)
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
    const { data: eventTypeList } = yield describeEventType()
    const eventTypeOption = eventTypeList.map((item) => ({
      ...item,
      text: item.desc,
      value: item.type,
      name: item.desc,
    }))
    yield put({
      type: this.types.SET_EVENT_TYPE_LIST,
      payload: eventTypeOption,
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
    yield takeLatest(types.CHANGE_TAGS, function* (action) {
      const tags = action.payload
      const customFilters = { ...EmptyCustomFilter }
      const validTags = tags.map((item) => {
        if (item.attr) return item
        else return { ...item, attr: DefaultServiceTagAttribute }
      })
      yield put({ type: types.SET_TAGS, payload: validTags })
      validTags.forEach((tag) => {
        const key = tag?.attr?.key || ServiceNameTagKey

        if (tag.attr.type === 'input') customFilters[key] = tag.values[0].name
        else customFilters[key] = tag.values[0].key || tag.values[0].value
      })
      yield put({ type: types.SET_CUSTOM_FILTERS, payload: customFilters })
    })
  }

  async getData(filters: this['Filter']) {
    const { page, count, namespace, service, instance, start_time, end_time, extend_info } = filters
    const {
      amount,
      data,
      extend_info: newExtendInfo,
    } = await describeEventCenterRecord({
      limit: count,
      offset: (page - 1) * count,
      namespace: namespace ? `${namespace}*` : undefined,
      service: service ? `${service}*` : undefined,
      instance: instance || undefined,
      start_time: start_time || undefined,
      end_time: end_time || undefined,
      extend_info: extend_info || undefined,
    })
    return {
      list: data,
      totalCount: amount,
      extend_info: newExtendInfo,
    }
  }
}
