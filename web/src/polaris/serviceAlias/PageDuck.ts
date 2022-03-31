import { createToPayload, reduceFromPayload } from 'saga-duck'
import { takeLatest } from 'redux-saga-catch'
import { put, select } from 'redux-saga/effects'
import CreateDuck from './operation/CreateDuck'
import Create from './operation/Create'
import GridPageDuck, { Filter as BaseFilter } from '@src/polaris/common/ducks/GridPage'
import { GovernanceAlias, deleteGovernanceAliases, describeGovernanceAliases } from './model'
import { NamespaceItem } from '../service/PageDuck'
import { ComposedId } from '../service/detail/types'
import { TagValue, notification, Modal } from 'tea-component'
import { getAllList } from '../common/util/apiRequest'
import { resolvePromise } from 'saga-duck/build/helper'
import { showDialog } from '../common/helpers/showDialog'
import { describeComplicatedNamespaces } from '../namespace/model'
const EmptyCustomFilter = {
  alias: '',
  service: '',
  alias_namespace: '',
}
const AliasTagKey = 'alias'
export const DefaultAliasTagAttribute = {
  type: 'input',
  key: 'alias',
  name: '服务别名',
}
interface Filter extends BaseFilter {
  alias: string
  service: string
  alias_namespace: string
}
interface CustomFilters {
  alias: string
  service: string
  alias_namespace: string
}
export interface GovernanceAliasItem extends GovernanceAlias {
  id: string
}
export default class ServiceAliasPageDuck extends GridPageDuck {
  Filter: Filter
  Item: GovernanceAliasItem
  baseUrl = null
  get quickTypes() {
    enum Types {
      SET_CUSTOM_FILTERS,
      EDIT,
      REMOVE,
      CREATE,
      SET_SELECTION,
      SET_NAMESPACE_LIST,
      SET_EXPANDED_KEYS,
      LOAD,
      CHANGE_TAGS,
      SET_TAGS,
      SET_DATA,
      SET_COMPOSE_ID,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get initialFetch() {
    return true
  }
  get recordKey() {
    return 'id'
  }
  get watchTypes() {
    return [...super.watchTypes, this.types.SEARCH, this.types.SET_COMPOSE_ID, this.types.SET_CUSTOM_FILTERS]
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
      composedId: reduceFromPayload<ComposedId>(types.SET_COMPOSE_ID, {} as ComposedId),
      tags: reduceFromPayload<TagValue[]>(types.SET_TAGS, []),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      setCustomFilters: createToPayload<CustomFilters>(types.SET_CUSTOM_FILTERS),
      edit: createToPayload<GovernanceAlias>(types.EDIT),
      remove: createToPayload<string[]>(types.REMOVE),
      create: createToPayload<void>(types.CREATE),
      setSelection: createToPayload<string[]>(types.SET_SELECTION),
      setExpandedKeys: createToPayload<string[]>(types.SET_EXPANDED_KEYS),
      load: (composedId, data) => ({
        type: types.LOAD,
        payload: { composedId, data },
      }),
      changeTags: createToPayload(types.CHANGE_TAGS),
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
        alias: state.customFilters.alias,
        alias_namespace: state.customFilters.alias_namespace,
        service: state.customFilters.service,
      }),
      customFilters: (state: State) => state.customFilters,
      selection: (state: State) => state.selection,
      namespaceList: (state: State) => state.namespaceList,
    }
  }
  *loadNamespaceList() {
    const { list: namespaceList } = yield getAllList(describeComplicatedNamespaces, {
      listKey: 'namespaces',
      totalKey: 'amount',
    })({})
    const options = namespaceList.map(item => ({
      ...item,
      text: item.name,
      value: item.name,
      key: item.name,
      name: item.name,
    }))
    //options.unshift({ text: '全部', value: '', key: '', name: '全部' })
    yield put({
      type: this.types.SET_NAMESPACE_LIST,
      payload: options,
    })
  }

  *saga() {
    const { types, creators, selector, ducks } = this
    const duck = this
    yield* super.saga()
    yield takeLatest(types.CHANGE_TAGS, function*(action) {
      const tags = action.payload
      const customFilters = { ...EmptyCustomFilter }
      const validTags = tags.map(item => {
        if (item.attr) return item
        else return { ...item, attr: DefaultAliasTagAttribute }
      })
      yield put({ type: types.SET_TAGS, payload: validTags })
      validTags.forEach(tag => {
        const key = tag?.attr?.key || AliasTagKey
        if (tag.attr.type === 'input') customFilters[key] = tag.values[0].name
        else customFilters[key] = tag.values[0].key
      })
      yield put({ type: types.SET_CUSTOM_FILTERS, payload: customFilters })
    })
    yield takeLatest(ducks.grid.types.FETCH_DONE, function*(action) {
      const { list } = action.payload
      const { selection } = selector(yield select())
      const validSelection = selection.filter(id => !!list.find(item => item.id === id))
      yield put(creators.setSelection(validSelection))
      yield* duck.loadNamespaceList()
    })
    yield takeLatest(types.CREATE, function*() {
      const res = yield* resolvePromise(
        new Promise(resolve => {
          showDialog(Create, CreateDuck, function*(duck: CreateDuck) {
            try {
              resolve(yield* duck.execute({}, { isModify: false }))
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
    yield takeLatest(types.EDIT, function*(action) {
      const data = action.payload
      const res = yield* resolvePromise(
        new Promise(resolve => {
          showDialog(Create, CreateDuck, function*(duck: CreateDuck) {
            try {
              resolve(yield* duck.execute(data, { isModify: true }))
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
      const aliases = data.map(item => {
        const [alias_namespace, alias] = item.split('#')
        return { alias_namespace, alias }
      })
      const confirm = yield Modal.confirm({
        message: `确认删除服务别名`,
        description: '删除后，无法恢复',
        okText: '删除',
      })
      if (confirm) {
        const res = yield deleteGovernanceAliases(aliases)
        if (res) notification.success({ description: '删除成功' })
        yield put(creators.reload())
      }
    })
  }

  async getData(filters: this['Filter']) {
    const { page, count, service, alias, alias_namespace } = filters
    const result = await describeGovernanceAliases({
      limit: count,
      offset: (page - 1) * count,
      alias: alias || undefined,
      service: service || undefined,
      alias_namespace: alias_namespace || undefined,
    })
    return {
      totalCount: result.totalCount,
      list:
        result.content?.map(item => ({
          ...item,
          id: `${item.alias_namespace}#${item.alias}`,
        })) || [],
    }
  }
}
