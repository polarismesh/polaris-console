import { createToPayload, reduceFromPayload } from 'saga-duck'
import router from '@src/polaris/common/util/router'
import { takeLatest } from 'redux-saga-catch'
import { put, select } from 'redux-saga/effects'
import GridPageDuck, { Filter as BaseFilter, Operation, OperationType } from '@src/polaris/common/ducks/GridPage'
import { Modal } from 'tea-component'
import {
  CustomRoute,
  deleteCustomRoute,
  describeCustomRoute,
  DescribeCustomRouteParams,
  disableCustomRoute,
  enableCustomRoute,
} from './model'
import getColumns from './getColumns'
import { ComposedId } from '@src/polaris/service/detail/types'
import { RuleStatus, SwitchStatusAction } from '../../accessLimiting/types'
import { SortBy } from 'tea-component/lib/table/addons'
import { t } from 'i18next'

interface Filter {
  namespace: string
  service: string
  status: string
  name: string
  sort: SortBy[]
}

export default class CustomRouteDuck extends GridPageDuck {
  Filter: Filter & BaseFilter
  Item: CustomRoute

  get baseUrl() {
    return 'accesslimit'
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
      }),
    }
  }

  get operations(): Operation<this['Item']>[] {
    const { types, creators, selector } = this
    return [
      {
        type: OperationType.NO_TARGET,
        watch: types.CREATE,
        fn: function* () {
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
        fn: function* (item) {
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
        fn: function* (item) {
          const confirm = yield Modal.confirm({
            message: t('确认删除路由规则 {{attr0}} 吗？', { attr0: item.name }),
            description: t('删除后，无法恢复'),
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
        fn: function* (item: any) {
          const ops = item.swtichStatusAction === SwitchStatusAction.disable ? t('禁用') : t('启用')
          const disable = item.swtichStatusAction === SwitchStatusAction.disable ? true : false
          const confirm = yield Modal.confirm({
            message: t('确认{{ops}}路由规则 {{attr0}} 吗？', { ops, attr0: item.name }),
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

  *getColumns() {
    return getColumns(this)
  }

  *saga() {
    const { types, creators } = this
    yield* super.saga()
    yield takeLatest(types.LOAD, function* (action) {
      const data = action.payload
      if (data) {
        yield put(creators.changeNamespace(data.namespace))
        yield put(creators.changeService(data.name))
      }
    })
  }

  async getData(filters: this['Filter']) {
    const { page, count, namespace, service, status, name, sort } = filters
    const params: DescribeCustomRouteParams = {
      offset: (page - 1) * count,
      limit: count,
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
      params.name = name
    }
    if (sort.length) {
      params.order_field = sort[0].by
      params.order_type = sort[0].order
    }

    const result = await describeCustomRoute(params)

    result.list =
      result.totalCount > 0 &&
      result.list.map((item) => ({
        ...item,
      }))
    return result
  }
}
