import { createToPayload, reduceFromPayload } from 'saga-duck'
import router from '@src/polaris/common/util/router'
import { takeLatest } from 'redux-saga-catch'
import { put, fork, all, select } from 'redux-saga/effects'
import GridPageDuck, { Filter as BaseFilter, Operation, OperationType } from '@src/polaris/common/ducks/GridPage'
import { Modal } from 'tea-component'
import { deleteRateLimit, describeLimitRules, DescribeLimitRulesParams, enableRateLimit, RateLimit } from './model'
import getColumns from './getColumns'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import { describeComplicatedNamespaces } from '@src/polaris/namespace/model'
import { cacheFetchAllServices } from '@src/polaris/service/model'
import { RuleStatus, SwitchStatusAction } from './types'
import LimitRuleCreatePageDuck from './operations/CreateDuck'
import { ComposedId } from '@src/polaris/service/detail/types'
import { checkFeatureValid } from '@src/polaris/common/util/checkFeature'

interface Filter {
  namespace: string
  service: string
  status: string
  name: string
}

export default class AccessLimitingDuck extends GridPageDuck {
  Filter: Filter & BaseFilter
  Item: RateLimit

  get baseUrl() {
    return 'accesslimit'
  }

  get initialFetch() {
    return false
  }

  get quickTypes() {
    enum Types {
      LOAD,

      SET_NAMESPACE_LIST,
      SET_NAMESPACE,

      SET_SERVICE_LIST,
      SET_SERVICE,

      SET_NAME,
      SET_STATUS,

      CREATE,
      MODIFY,
      DELETE,
      SWITCH_STATUS,
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
    return [...super.watchTypes, types.SEARCH, types.SET_NAMESPACE, types.SET_SERVICE, types.SET_STATUS, types.SET_NAME]
  }

  get quickDucks() {
    return {
      ...super.quickDucks,
      createLimitRule: LimitRuleCreatePageDuck,
    }
  }

  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      loadData: reduceFromPayload<ComposedId>(types.LOAD, null),
      namespaceList: reduceFromPayload<[]>(types.SET_NAMESPACE_LIST, []),
      namespace: reduceFromPayload<string>(types.SET_NAMESPACE, ''),
      serviceList: reduceFromPayload<[]>(types.SET_SERVICE_LIST, []),
      service: reduceFromPayload<string>(types.SET_SERVICE, ''),
      status: reduceFromPayload<string>(types.SET_STATUS, ''),
      name: reduceFromPayload<string>(types.SET_NAME, ''),
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
      delete: createToPayload<RateLimit>(types.DELETE),
      create: () => ({ type: types.CREATE }),
      modify: createToPayload<RateLimit>(types.MODIFY),
      switchStatus: (id: string, name: string, swtichStatusAction: SwitchStatusAction) => ({
        type: types.SWITCH_STATUS,
        payload: {
          id,
          name,
          swtichStatusAction,
        },
      }),
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
            router.navigate(`/accesslimit-create?ns=${loadData.namespace}&service=${loadData.name}`)
          } else {
            router.navigate(`/accesslimit-create`)
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
            router.navigate(`/accesslimit-create?id=${item.id}&ns=${loadData.namespace}&service=${loadData.name}`)
          } else {
            router.navigate(`/accesslimit-create?id=${item.id}`)
          }
          return null
        },
      },
      {
        type: OperationType.SINGLE,
        watch: types.DELETE,
        fn: function*(item) {
          const confirm = yield Modal.confirm({
            message: `确认删除限流规则 ${item.name} 吗？`,
            description: '删除后，无法恢复',
          })
          if (confirm) {
            yield deleteRateLimit([{ id: item.id }])
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
            message: `确认${ops}限流规则 ${item.name} 吗？`,
          })
          if (confirm) {
            yield enableRateLimit([{ id: item.id, disable }])
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
    yield fork([this, this.sagaOnFetchLists])
    yield takeLatest(types.LOAD, function*(action) {
      const data = action.payload
      if (data) {
        yield put(creators.changeNamespace(data.namespace))
        yield put(creators.changeService(data.name))
      }
    })
  }

  *sagaOnFetchLists() {
    const { types } = this
    yield takeLatest(types.ROUTE_INITIALIZED, function*() {
      const [namespaceList, serviceList] = yield all([
        getAllList(describeComplicatedNamespaces, {
          listKey: 'namespaces',
          totalKey: 'amount',
        })({}),
        cacheFetchAllServices(),
      ])

      const namespaceOptions = namespaceList.list.map(item => ({
        text: item.name,
        value: item.name,
      }))

      const serviceOptions = serviceList.list.map(item => ({
        text: item.name,
        value: item.name,
        namespace: item.namespace,
      }))

      yield put({
        type: types.SET_NAMESPACE_LIST,
        payload: namespaceOptions,
      })

      yield put({
        type: types.SET_SERVICE_LIST,
        payload: serviceOptions,
      })
    })
  }

  async getData(filters: this['Filter']) {
    const { page, count, namespace, service, status, name } = filters
    const params: DescribeLimitRulesParams = {
      brief: true,
      offset: (page - 1) * count,
      limit: count,
    }
    const available = await checkFeatureValid('circuitbreaker')
    if (!available) return { totalCount: 0, list: [] }
    if (namespace) {
      params.namespace = namespace
    }
    if (service) {
      params.service = service
    }

    //这边之所以分开写，是避免status为空，也识别为disable为false
    if (status === RuleStatus.enabled) {
      params.disable = false
    }

    if (status === RuleStatus.notEnabled) {
      params.disable = true
    }

    if (name) {
      params.name = name
    }

    const result = await describeLimitRules(params)

    result.list =
      result.totalCount > 0 &&
      result.list.map(item => ({
        ...item,
        //disable字段为false则为状态【启用】
        disable: item.disable === false ? true : false,
      }))
    return result
  }
}
