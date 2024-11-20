import { createToPayload } from 'saga-duck'
import { takeLatest } from 'redux-saga-catch'
import Create from './operation/Create'
import CreateDuck from './operation/CreateDuck'
import { put, select } from 'redux-saga/effects'
import { Modal, notification, TagValue } from 'tea-component'
import { describeConfigFileGroups, deleteConfigFileGroups } from './model'
import { resolvePromise, reduceFromPayload } from 'saga-duck/build/helper'
import { ConfigFileGroup } from './types'
import { GroupNameTagKey, DefaultGroupTagAttribute } from './Page'
import GridPageDuck, { Filter } from '@src/polaris/common/ducks/GridPage'
import { NamespaceItem } from '@src/polaris/service/PageDuck'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import { describeComplicatedNamespaces } from '@src/polaris/namespace/model'
import { showDialog } from '@src/polaris/common/helpers/showDialog'
import ExportConfig from './operation/ExportConfig'
import ExportConfigDuck from './operation/ExportConfigDuck'
import ImportConfig from './operation/ImportConfig'
import ImportConfigDuck from './operation/ImportConfigDuck'
import { ComposedId } from '../Page'
import { convertMetaData } from '@src/polaris/service/detail/instance/operations/CreateDuck'

export interface ConfigFileGroupItem extends ConfigFileGroup {
  id: string
}
interface CustomFilters {
  namespace?: string
  group?: string
  fileName: string
}
export const EmptyCustomFilter = {
  namespace: '',
  group: '',
  fileName: '',
}
export interface EncryptAlgorithm {
  text: string
  value: string
}
export default class ConfigFileGroupDuck extends GridPageDuck {
  Filter: Filter & CustomFilters
  Item: ConfigFileGroupItem
  get baseUrl() {
    return '/#/filegroup'
  }
  get quickTypes() {
    enum Types {
      EDIT,
      REMOVE,
      CREATE,
      LOAD,
      SET_COMPOSE_ID,
      SELECT,
      SET_CUSTOM_FILTERS,
      SET_TAGS,
      CHANGE_TAGS,
      SET_NAMESPACE_LIST,
      SET_NAMESPACE,

      EXPORT_CONFIG,
      IMPORT_CONFIG,
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
    return [...super.watchTypes, this.types.SEARCH, this.types.SET_CUSTOM_FILTERS, this.types.SET_NAMESPACE]
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
      selection: reduceFromPayload(types.SELECT, [] as string[]),
      tags: reduceFromPayload<TagValue[]>(types.SET_TAGS, []),
      customFilters: reduceFromPayload<CustomFilters>(types.SET_CUSTOM_FILTERS, EmptyCustomFilter),
      namespaceList: reduceFromPayload<NamespaceItem[]>(types.SET_NAMESPACE_LIST, []),
      namespace: reduceFromPayload<string>(types.SET_NAMESPACE, ''),
      composedId: reduceFromPayload(types.LOAD, {} as ComposedId),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      edit: createToPayload<ConfigFileGroupItem>(types.EDIT),
      remove: createToPayload<ConfigFileGroupItem>(types.REMOVE),
      create: createToPayload<void>(types.CREATE),
      exportConfig: createToPayload<void>(types.EXPORT_CONFIG),
      importConfig: createToPayload(types.IMPORT_CONFIG),
      load: createToPayload<ComposedId>(types.LOAD),
      select: createToPayload<string[]>(types.SELECT),
      setCustomFilters: createToPayload<CustomFilters>(types.SET_CUSTOM_FILTERS),
      changeTags: createToPayload(types.CHANGE_TAGS),
      setNamespace: createToPayload(types.SET_NAMESPACE),
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
        namespace: state.namespace,
        group: state.customFilters.group,
        fileName: state.customFilters.fileName,
      }),
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
    //options.unshift({ text: t('全部'), value: '', key: '', name: t('全部') })
    yield put({
      type: this.types.SET_NAMESPACE_LIST,
      payload: options,
    })
  }
  *saga() {
    const { types, creators, selector, ducks } = this
    const duck = this
    yield* super.saga()
    yield* duck.loadNamespaceList()
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
    yield takeLatest(types.EXPORT_CONFIG, function*() {
      const res = yield* resolvePromise(
        new Promise(resovle => {
          showDialog(ExportConfig, ExportConfigDuck, function*(duck: ExportConfigDuck) {
            try {
              resovle(yield* duck.execute())
            } finally {
              resovle(false)
            }
          })
        }),
      )
      if (res) {
        yield put(creators.reload())
      }
    })
    yield takeLatest(types.IMPORT_CONFIG, function*() {
      const res = yield* resolvePromise(
        new Promise(resolve => {
          showDialog(ImportConfig, ImportConfigDuck, function*(duck: ImportConfigDuck) {
            try {
              resolve(yield* duck.execute())
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
    yield takeLatest(ducks.grid.types.FETCH_DONE, function*(action) {
      const { list } = action.payload
      const { selection } = selector(yield select())
      const validSelection = selection.filter(id => !!list.find(item => item.id === id))
      yield put(creators.select(validSelection))
      yield* duck.loadNamespaceList()
    })
    yield takeLatest(types.REMOVE, function*(action) {
      const { name, namespace } = action.payload

      const confirm = yield Modal.confirm({
        message: `确认删除配置组`,
        description: '删除配置组也会同时删除配置组下所有配置文件，请谨慎删除。',
        okText: '删除',
      })
      if (confirm) {
        const res = yield deleteConfigFileGroups({ group: name, namespace })
        if (res) notification.success({ description: '删除成功' })
        yield put(creators.reload())
      }
    })
    yield takeLatest(types.CHANGE_TAGS, function*(action) {
      const tags = action.payload
      const customFilters = { ...EmptyCustomFilter }
      const validTags = tags.map(item => {
        if (item.attr) return item
        else return { ...item, attr: DefaultGroupTagAttribute }
      })
      yield put({ type: types.SET_TAGS, payload: validTags })
      validTags.forEach(tag => {
        const key = tag?.attr?.key || GroupNameTagKey

        if (tag.attr.type === 'input') customFilters[key] = tag.values[0].name
        else customFilters[key] = tag.values[0].key
      })
      yield put({ type: types.SET_CUSTOM_FILTERS, payload: customFilters })
    })
  }

  async getData(filters: this['Filter']) {
    const { page, count, namespace, group, fileName } = filters
    const result = await describeConfigFileGroups({
      limit: count,
      offset: (page - 1) * count,
      group: group || undefined,
      namespace: namespace || undefined,
      fileName: fileName || undefined,
    })
    return {
      totalCount: result.totalCount,
      list:
        result.list?.map(item => ({
          ...item,
          id: item.id,
          metadata: item.metadata ? convertMetaData(item.metadata as any) : [],
        })) || [],
    }
  }
}
