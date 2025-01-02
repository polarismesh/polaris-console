import { createToPayload } from 'saga-duck'
import { takeLatest } from 'redux-saga-catch'
import { put, select } from 'redux-saga/effects'
import { Form, FormItem, FormText, Modal, notification } from 'tea-component'
import { reduceFromPayload } from 'saga-duck/build/helper'
import { GroupNameTagKey, DefaultGroupTagAttribute, FileNameTagKey } from './Page'
import React from 'react'
import GridPageDuck, { Filter as BaseFilter } from '@src/polaris/common/ducks/GridPage'
import { ConfigFileGroup, ConfigFileRelease } from '../../types'
import {
  DeleteConfigFileReleases,
  DescribeConfigFileRelease,
  DescribeConfigFileReleases,
  RollbackConfigFileReleases,
} from './model'
import VersionDiffDuck from './operation/VersionDiffDuck'
import { ComposedId } from '@src/polaris/configuration/Page'

interface CustomFilters {
  fileName: string
}
export const EmptyCustomFilter = {
  fileName: '',
}
interface Filter extends BaseFilter {
  namespace: string
  group: string
}
export default class ConfigFileReleaseHistoryDuck extends GridPageDuck {
  Filter: Filter & CustomFilters
  Item: ConfigFileRelease
  get baseUrl() {
    return null
  }
  get quickTypes() {
    enum Types {
      SET_CUSTOM_FILTERS,
      SET_TAGS,
      CHANGE_TAGS,
      SHOW_DIFF,
      SET_NAMESPACE,
      SET_GROUP_NAME,
      SET_FILENAME,
      LOAD,
      SET_INIT_DATA,
      ROLLBACK,
      DELETE,
      SET_SELECTED,
      SET_VERSION_CONFIG_MAP,
      SET_DATA,
      SET_COMPOSE_ID,
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
    return 'uniId'
  }
  get watchTypes() {
    return [
      ...super.watchTypes,
      this.types.SEARCH,
      this.types.SET_CUSTOM_FILTERS,
      this.types.SET_NAMESPACE,
      this.types.SET_COMPOSE_ID,
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
      data: reduceFromPayload(types.SET_DATA, {} as ConfigFileGroup),
      tags: reduceFromPayload<any[]>(types.SET_TAGS, []),
      customFilters: reduceFromPayload<CustomFilters>(types.SET_CUSTOM_FILTERS, EmptyCustomFilter),
      namespace: reduceFromPayload<string>(types.SET_NAMESPACE, ''),
      composedId: reduceFromPayload(types.SET_COMPOSE_ID, {} as ComposedId),
      selected: reduceFromPayload(types.SET_SELECTED, null as ConfigFileRelease & { uniId: string }),
      versionMap: reduceFromPayload(types.SET_VERSION_CONFIG_MAP, {}),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      load: (composedId, data) => ({
        type: types.LOAD,
        payload: { composedId, data },
      }),
      setCustomFilters: createToPayload<CustomFilters>(types.SET_CUSTOM_FILTERS),
      changeTags: createToPayload(types.CHANGE_TAGS),
      showDiff: createToPayload(types.SHOW_DIFF),
      setNamespace: createToPayload(types.SET_NAMESPACE),
      select: createToPayload<ConfigFileRelease>(types.SET_SELECTED),
      rollback: createToPayload<ConfigFileRelease>(types.ROLLBACK),
      delete: createToPayload<ConfigFileRelease>(types.DELETE),
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
        namespace: state.composedId.namespace,
        group: state.composedId.group,
        fileName: state.customFilters.fileName,
      }),
    }
  }
  get waitRouteInitialized() {
    return true
  }

  *saga() {
    const { types, selector, creators } = this
    yield takeLatest(types.LOAD, function*(action) {
      const { composedId, data } = action.payload
      yield put({ type: types.SET_DATA, payload: data })
      yield put({ type: types.SET_COMPOSE_ID, payload: composedId })
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
    yield takeLatest(types.SHOW_DIFF, function*(action) {
      const { namespace, group, name, fileName } = action.payload
      const { configFileRelease } = yield DescribeConfigFileRelease({
        namespace,
        group,
        release_name: name,
        name: fileName,
      })
      yield VersionDiffDuck.show({ currentRelease: configFileRelease })
    })
    yield takeLatest(types.SET_INIT_DATA, function*() {
      const { composedId } = selector(yield select())
      const tags = []
      if (composedId?.fileName) {
        tags.push({
          attr: {
            type: 'input',
            key: FileNameTagKey,
            name: '配置文件名',
          },
          values: [{ name: composedId.fileName }],
        })
      }
      yield put({ type: types.CHANGE_TAGS, payload: tags })
    })
    yield takeLatest(types.SET_SELECTED, function*(action) {
      const { versionMap } = selector(yield select())
      const { namespace, group, name, fileName } = action.payload
      const { configFileRelease } = yield DescribeConfigFileRelease({
        namespace,
        group,
        release_name: name,
        name: fileName,
      })
      yield put({ type: types.SET_VERSION_CONFIG_MAP, payload: { ...versionMap, [name]: configFileRelease } })
    })
    yield takeLatest(types.ROLLBACK, function*(action) {
      const { name, fileName, releaseDescription } = action.payload
      const confirm = yield Modal.confirm({
        message: `确定回滚配置${fileName}到以下版本？`,
        description: (
          <Form>
            <FormItem label={'版本号'}>
              <FormText>{name}</FormText>
            </FormItem>
            <FormItem label={'版本备注'}>
              <FormText>{releaseDescription || '-'}</FormText>
            </FormItem>
          </Form>
        ),
      })
      if (confirm) {
        const result = yield RollbackConfigFileReleases([{ ...action.payload, uniId: undefined }])
        if (result.code === 200000) {
          notification.success({ description: '回滚成功' })
          yield put(creators.reload())
        } else {
          notification.error({ description: `回滚提交失败: ${result.info}` })
        }
      }
    })
    yield takeLatest(types.DELETE, function*(action) {
      const { fileName, namespace, group, name } = action.payload

      const confirm = yield Modal.confirm({
        message: `您确定删除配置${fileName}？`,
        description: '删除后所有数据将被清除且不可恢复，请提前备份数据',
      })
      if (confirm) {
        const result = yield DeleteConfigFileReleases([{ namespace, fileName, group, name: name }])
        if (result) {
          notification.success({ description: '删除成功' })
          yield put(creators.reload())
        } else {
          notification.error({ description: '删除失败' })
        }
      }
    })
    yield* super.saga()
  }

  async getData(filters: this['Filter']) {
    const { page, count, namespace, fileName, group } = filters
    const result = await DescribeConfigFileReleases({
      limit: count,
      offset: (page - 1) * count,
      group: group || undefined,
      namespace: namespace || undefined,
      fileName,
    })
    return {
      totalCount: result.total,
      list:
        result.configFileReleases?.map(item => ({
          ...item,
          uniId: `${item.fileName}-${item.name}`,
        })) || [],
    }
  }
}
