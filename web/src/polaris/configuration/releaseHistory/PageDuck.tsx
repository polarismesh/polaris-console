import { createToPayload } from 'saga-duck'
import { takeLatest } from 'redux-saga-catch'
import { put } from 'redux-saga/effects'
import { TagValue, Modal } from 'tea-component'
import { reduceFromPayload } from 'saga-duck/build/helper'
import { GroupNameTagKey, DefaultGroupTagAttribute } from './Page'
import GridPageDuck, { Filter } from '@src/polaris/common/ducks/GridPage'
import { NamespaceItem } from '@src/polaris/service/PageDuck'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import { describeComplicatedNamespaces } from '@src/polaris/namespace/model'
import { ConfigFileReleaseHistory, ConfigFileGroup } from '../fileGroup/types'
import { describeConfigFileReleaseHistories } from './model'
import { describeConfigFileGroups, describeLastReleaseConfigFile } from '../fileGroup/model'
import React from 'react'
import FileDiff from '../fileGroup/detail/file/FileDiff'

export interface ConfigFileReleaseHistoryItem extends ConfigFileReleaseHistory {
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
export default class ConfigFileReleaseHistoryDuck extends GridPageDuck {
  Filter: Filter & CustomFilters
  Item: ConfigFileReleaseHistoryItem
  get baseUrl() {
    return 'file-release-history'
  }
  get quickTypes() {
    enum Types {
      SET_CUSTOM_FILTERS,
      SET_TAGS,
      CHANGE_TAGS,
      SET_NAMESPACE_LIST,
      SET_GROUP_LIST,
      SHOW_DIFF,
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
      tags: reduceFromPayload<TagValue[]>(types.SET_TAGS, []),
      customFilters: reduceFromPayload<CustomFilters>(types.SET_CUSTOM_FILTERS, EmptyCustomFilter),
      namespaceList: reduceFromPayload<NamespaceItem[]>(types.SET_NAMESPACE_LIST, []),
      configFileGroupList: reduceFromPayload<ConfigFileGroup[]>(types.SET_GROUP_LIST, []),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      setCustomFilters: createToPayload<CustomFilters>(types.SET_CUSTOM_FILTERS),
      changeTags: createToPayload(types.CHANGE_TAGS),
      showDiff: createToPayload(types.SHOW_DIFF),
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
        group: state.customFilters.group,
        fileName: state.customFilters.fileName,
      }),
    }
  }
  *init() {
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
    const { list } = yield getAllList(describeConfigFileGroups, {})({})
    yield put({ type: this.types.SET_GROUP_LIST, payload: list })
  }
  *saga() {
    const { types } = this
    yield* super.saga()
    yield* this.init()
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
    yield takeLatest(types.SHOW_DIFF, function*(action) {
      const { namespace, group, name, content, format } = action.payload
      const { configFileRelease: lastRelease } = yield describeLastReleaseConfigFile({ namespace, name, group })
      yield Modal.confirm({
        size: 'l',
        message: '内容对比',
        description: <FileDiff original={lastRelease.content} now={content} format={format} />,
      })
    })
  }

  async getData(filters: this['Filter']) {
    const { page, count, keyword, namespace, fileName } = filters
    if (!namespace)
      return {
        totalCount: 0,
        list: [],
      }
    const result = await describeConfigFileReleaseHistories({
      limit: count,
      offset: (page - 1) * count,
      group: keyword,
      namespace: namespace || undefined,
      name: fileName,
    })
    return {
      totalCount: result.totalCount,
      list:
        result.list?.map(item => ({
          ...item,
          id: item.name,
        })) || [],
    }
  }
}
