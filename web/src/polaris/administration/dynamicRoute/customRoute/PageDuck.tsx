import { createToPayload, reduceFromPayload } from 'saga-duck'
import router from '@src/polaris/common/util/router'
import { takeLatest } from 'redux-saga-catch'
import { put, select } from 'redux-saga/effects'
import GridPageDuck, { Filter as BaseFilter, Operation, OperationType } from '@src/polaris/common/ducks/GridPage'
import { TagValue, Modal, notification } from 'tea-component'
import {
  CustomRoute,
  deleteCustomRoute,
  describeCustomRoute,
  DescribeCustomRouteParams,
  disableCustomRoute,
  enableCustomRoute,
} from './model'
import { ComposedId } from '@src/polaris/service/detail/types'
import { RuleStatus, SwitchStatusAction } from '../../accessLimiting/types'
import { SortBy } from 'tea-component/lib/table/addons'
import { TagSearchType } from './Page'
import { describeServices, modifyServices } from '@src/polaris/service/model'
import { Service } from '@src/polaris/service/types'
import { resolvePromise } from 'saga-duck/build/helper'
import { enableNearbyString } from '@src/polaris/service/operation/CreateDuck'
import { checkFeatureValid } from '@src/polaris/common/util/checkFeature'

interface Filter {
  namespace: string
  service: string
  status: string
  name: string
  sort: SortBy[]
  validTags: TagValue[]
}

export default class CustomRouteDuck extends GridPageDuck {
  Filter: Filter & BaseFilter
  Item: CustomRoute

  get baseUrl() {
    return 'custom-route'
  }

  get initialFetch() {
    return false
  }

  get quickTypes() {
    enum Types {
      LOAD,

      SET_NAMESPACE,
      SET_SERVICE,

      SET_NAME,
      SET_STATUS,

      CREATE,
      MODIFY,
      DELETE,
      SWITCH_STATUS,
      SET_SORT,
      SET_IN_DETAIL,
      CHANGE_TAGS,
      SET_TAGS,
      SET_SERVICEDATA,
      CHANGE_NEARBY,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }

  get recordKey() {
    return 'id'
  }

  get watchTypes() {
    const { types } = this
    return [
      ...super.watchTypes,
      types.SEARCH,
      types.SET_NAMESPACE,
      types.SET_SERVICE,
      types.SET_STATUS,
      types.SET_NAME,
      types.SET_SORT,
      types.SET_TAGS,
    ]
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
      loadData: reduceFromPayload<ComposedId>(types.LOAD, null),
      namespace: reduceFromPayload<string>(types.SET_NAMESPACE, ''),
      service: reduceFromPayload<string>(types.SET_SERVICE, ''),
      status: reduceFromPayload<string>(types.SET_STATUS, ''),
      name: reduceFromPayload<string>(types.SET_NAME, ''),
      sort: reduceFromPayload<SortBy[]>(types.SET_SORT, []),
      inDetail: reduceFromPayload<boolean>(types.SET_IN_DETAIL, false),
      validTags: reduceFromPayload<TagValue[]>(types.SET_TAGS, []),
      serviceData: reduceFromPayload<Service>(types.SET_SERVICEDATA, null),
    }
  }

  get creators() {
    const { types } = this
    return {
      ...super.creators,
      load: createToPayload<ComposedId>(types.LOAD),
      changeNamespace: createToPayload<string>(types.SET_NAMESPACE),
      changeService: createToPayload<string>(types.SET_SERVICE),
      changeStatus: createToPayload<string>(types.SET_STATUS),
      changeName: createToPayload<string>(types.SET_NAME),
      /** operations */
      delete: createToPayload<CustomRoute>(types.DELETE),
      create: () => ({ type: types.CREATE }),
      modify: createToPayload<CustomRoute>(types.MODIFY),
      switchStatus: (id: string, name: string, swtichStatusAction: SwitchStatusAction) => ({
        type: types.SWITCH_STATUS,
        payload: {
          id,
          name,
          swtichStatusAction,
        },
      }),
      setSort: createToPayload<SortBy[]>(types.SET_SORT),
      changeTags: createToPayload<TagValue[]>(types.CHANGE_TAGS),
      changeNearby: createToPayload<void>(types.CHANGE_NEARBY),
    }
  }

  get rawSelectors() {
    return {
      ...super.rawSelectors,
      filter: (state: this['State']): this['Filter'] => ({
        page: state.page,
        count: state.count,
        keyword: state.keyword,
        namespace: state.namespace,
        service: state.service,
        status: state.status,
        name: state.name,
        sort: state.sort,
        validTags: state.validTags,
      }),
    }
  }

  get operations(): Operation<this['Item']>[] {
    const { types, creators, selector } = this
    return [
      {
        type: OperationType.NO_TARGET,
        watch: types.CREATE,
        fn: function*() {
          const loadData = selector(yield select())?.loadData
          if (loadData) {
            router.navigate(`/custom-route-create?ns=${loadData.namespace}&service=${loadData.name}`)
          } else {
            router.navigate(`/custom-route-create`)
          }

          return null
        },
      },
      {
        type: OperationType.SINGLE,
        watch: types.MODIFY,
        fn: function*(item) {
          const loadData = selector(yield select())?.loadData
          if (loadData) {
            router.navigate(`/custom-route-create?id=${item.id}&ns=${loadData.namespace}&service=${loadData.name}`)
          } else {
            router.navigate(`/custom-route-create?id=${item.id}`)
          }
          return null
        },
      },
      {
        type: OperationType.SINGLE,
        watch: types.DELETE,
        fn: function*(item) {
          const confirm = yield Modal.confirm({
            message: `确认删除路由规则 ${item.name} 吗？`,
            description: '删除后，无法恢复',
          })
          if (confirm) {
            yield deleteCustomRoute([{ id: item.id }])
            yield put(creators.reload())
          }
          return null
        },
      },
      {
        type: OperationType.SINGLE,
        watch: types.SWITCH_STATUS,
        fn: function*(item: any) {
          const ops = item.swtichStatusAction === SwitchStatusAction.disable ? '禁用' : '启用'
          const disable = item.swtichStatusAction === SwitchStatusAction.disable ? true : false
          const confirm = yield Modal.confirm({
            message: `确认${ops}路由规则 ${item.name} 吗？`,
          })
          if (confirm) {
            if (disable) {
              yield disableCustomRoute([{ id: item.id, enable: false }])
            } else {
              yield enableCustomRoute([{ id: item.id, enable: true }])
            }
            yield put(creators.reload())
          }
        },
      },
    ]
  }
  *loadService(name, namespace) {
    const result = yield describeServices({
      namespace,
      name,
      offset: 0,
      limit: 10,
    })
    yield put({ type: this.types.SET_SERVICEDATA, payload: result?.list?.[0] })
  }
  *saga() {
    const { types, creators, selector } = this
    const duck = this
    yield* super.saga()
    yield takeLatest(types.LOAD, function*(action) {
      const data = action.payload
      if (data) {
        yield put(creators.changeNamespace(data.namespace))
        yield put(creators.changeService(data.name))
        yield* duck.loadService(data.name, data.namespace)
        yield put({ type: types.SET_IN_DETAIL, payload: true })
      }
    })
    yield takeLatest(types.CHANGE_NEARBY, function*() {
      const { serviceData, loadData } = selector(yield select())
      let metadata
      const isOpen = serviceData.metadata?.[enableNearbyString]
      if (isOpen) {
        metadata = { ...serviceData.metadata, [enableNearbyString]: undefined }
      } else {
        metadata = { ...serviceData.metadata, [enableNearbyString]: 'true' }
      }
      const confirm = yield Modal.confirm({ message: `确认${isOpen ? '关闭' : '开启'}就近访问？` })
      if (!confirm) return
      const res = yield* resolvePromise(
        modifyServices([
          {
            metadata: metadata,
            owners: 'polaris',
            name: serviceData.name,
            namespace: serviceData.namespace,
            comment: serviceData.comment,
            ports: serviceData.ports,
            business: serviceData.business,
            cmdb_mod1: '',
            cmdb_mod2: '',
            cmdb_mod3: '',
            department: serviceData.department,
            export_to: serviceData.export_to,
          },
        ]),
      )
      if (res) {
        notification.success({ description: '修改成功' })
        yield* duck.loadService(loadData.name, loadData.namespace)
      }
    })
    yield takeLatest(types.CHANGE_TAGS, function*(action) {
      const tags = action.payload
      const validTags = tags.map(item => {
        if (item.attr) return item
        else
          return {
            ...item,
            attr: {
              type: 'input',
              key: TagSearchType.RuleName,
              name: '规则名',
            },
          }
      })
      yield put({ type: types.SET_TAGS, payload: validTags })
    })
  }

  async getData(filters: this['Filter']) {
    const { page, count, namespace, service, status, name, sort, validTags } = filters
    const params: DescribeCustomRouteParams = {
      offset: (page - 1) * count,
      limit: count,
    }
    const available = await checkFeatureValid('circuitbreaker')
    if (!available) return { totalCount: 0, list: [] }
    if (validTags.length) {
      validTags.forEach(tag => {
        if (tag.attr.key === 'name') {
          params[tag.attr.key] = `${tag.values?.[0]?.name}*`
        } else {
          params[tag.attr.key] = tag.values?.[0]?.name
        }
      })
    }

    if (namespace) {
      params.namespace = namespace
    }
    if (service) {
      params.service = service
    }

    //这边之所以分开写，是避免status为空，也识别为disable为false
    if (status === RuleStatus.enabled) {
      params.enable = true
    }

    if (status === RuleStatus.notEnabled) {
      params.enable = false
    }

    if (name) {
      params.name = name ? `${name}*` : undefined
    }

    if (sort.length) {
      params.order_field = sort[0].by
      params.order_type = sort[0].order
    }

    const result = await describeCustomRoute(params)

    result.list =
      result.totalCount > 0 &&
      result.list.map(item => ({
        ...item,
        namespace,
        service,
      }))
    return result
  }
}
