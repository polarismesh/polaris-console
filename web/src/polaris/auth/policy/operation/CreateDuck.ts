import { select, put } from 'redux-saga/effects'
import { takeLatest } from 'redux-saga-catch'
import { reduceFromPayload, createToPayload } from 'saga-duck'
import DetailPage from '@src/polaris/common/ducks/DetailPage'
import { UserSelectDuck } from '../../userGroup/operation/CreateDuck'
import { AuthPolicySelectDuck, UserGroupSelectDuck } from '../../user/operation/AttachUserGroupDuck'
import {
  AuthStrategy,
  describeGovernanceStrategyDetail,
  createGovernanceStrategy,
  modifyGovernanceStrategy,
  ServerFunctionGroup,
  describeServerFunctions,
  ServerFunction,
  UserGroup,
  getServerFunctionDesc,
} from '../../model'
import { diffAddRemoveArray } from '@src/polaris/common/util/common'
import { Namespace, Service } from '@src/polaris/service/types'
import SearchableMultiSelect from '@src/polaris/common/ducks/SearchableMultiSelect'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import Form from '@src/polaris/common/ducks/Form'
import { describeComplicatedNamespaces } from '@src/polaris/namespace/model'
import { describeServices } from '@src/polaris/service/model'
import { notification } from 'tea-component'
import router from '@src/polaris/common/util/router'
import { ConfigFileGroup } from '@src/polaris/configuration/fileGroup/types'
import { describeConfigFileGroups } from '@src/polaris/configuration/fileGroup/model'
import { DescribeFaultDetects } from '@src/polaris/administration/breaker/faultDetect/model'
import { DescribeCircuitBreakers } from '@src/polaris/administration/breaker/model'
import { describeLimitRules, RateLimit } from '@src/polaris/administration/accessLimiting/model'
import { describeRoutes } from '@src/polaris/service/detail/route/model'
import { CustomRoute, describeCustomRoute } from '@src/polaris/administration/dynamicRoute/customRoute/model'
import { CircuitBreakerRule, FaultDetectConfig } from '@src/polaris/administration/breaker/types'
import { FaultDetectRule } from '@src/polaris/administration/breaker/faultDetect/types'
import Dialog from '@src/polaris/common/duckComponents/Dialog'
import { UserItem } from '../../user/PageDuck'

interface ComposedId {
  id: string
}

export default abstract class CreateDuck extends DetailPage {
  Data: AuthStrategy
  ComposedId: ComposedId

  get baseUrl() {
    return `/#/policy-create`
  }
  get quickTypes() {
    enum Types {
      SET_INSTANCE_ID,
      SUBMIT,
      SET_ORIGIN_POLICY,
      SET_FUNCTION_GROUP,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get params() {
    const { types } = this
    return [
      ...super.params,
      {
        key: 'id',
        type: types.SET_ID,
        defaults: '',
      },
      {
        key: 'instanceId',
        type: types.SET_INSTANCE_ID,
        defaults: '',
      },
    ]
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      form: CreateFormDuck,
      functions: FunctionSelectDuck,
      user: UserSelectDuck,
      userGroup: UserGroupSelectDuck,
      opuser: UserSelectDuck,
      opuserGroup: UserGroupSelectDuck,
      authPolicy: AuthPolicySelectDuck,
      namespace: NamespaceSelectDuck,
      service: ServiceSelectDuck,
      configGroup: ConfigurationSelectDuck,
      routerRules: RouterRulesSelectDuck,
      ratelimitRules: RatelimitRulesSelectDuck,
      circuitbreakerRules: CircuitbreakerRulesSelectDuck,
      faultdetectRules: FaultdetectRulesSelectDuck,
    }
  }
  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      instanceId: reduceFromPayload(types.SET_INSTANCE_ID, ''),
      originPolicy: reduceFromPayload(types.SET_ORIGIN_POLICY, {} as AuthStrategy),
      functionGroup: reduceFromPayload(types.SET_FUNCTION_GROUP, "Namespace"),
    }
  }

  get rawSelectors() {
    type State = this['State']
    return {
      ...super.rawSelectors,
      composedId: (state: State) => ({
        id: state.id,
      }),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      submit: createToPayload<void>(types.SUBMIT),
      setFunctionGroup: createToPayload<string>(types.SET_FUNCTION_GROUP),
    }
  }
  *saga() {
    yield* super.saga()
    const duck = this
    const { types, ducks, selectors, selector } = duck
    yield takeLatest(types.SUBMIT, function* () {
      try {
        yield* ducks.form.submit()
      } catch (e) {
        return
      }
      const {
        user: { selection: userSelection },
        userGroup: { selection: userGroupSelection },

        opuser: { selection: opuserSelection },
        opuserGroup: { selection: opuserGroupSelection },
        authPolicy: { selection: authPolicySelection },
        namespace: { selection: namespaceSelection },
        service: { selection: serviceSelection },
        configGroup: { selection: configGroupSelection },
        routerRules: { selection: routerRuleSelection },
        ratelimitRules: { selection: rateLimitRuleSelection },
        circuitbreakerRules: { selection: circuitbreakerRuleSelection },
        faultdetectRules: { selection: faultdetectRuleSelection },
        functions: { selection: functionSelection },
        originPolicy,
      } = selector(yield select())
      const values = ducks.form.selectors.values(yield select())
      const { id } = selectors.composedId(yield select())
      if (id) {
        const {
          principals: { users: originUsers, groups: originUserGroups },
          resources: {
            namespaces: originNamespaces,
            services: originServices,
            config_groups: originConfigGroup,
            route_rules: originRouterRules,
            ratelimit_rules: originRateLimitRules,
            circuitbreaker_rules: originCircuitBreakerRules,
            faultdetect_rules: originFaultDetectRules,
            users: originOpUsers,
            user_groups: originOpUserGroups,
            auth_policies: originAuthPolicies,
          },
        } = originPolicy
        const isOriginAllNamespace = !!originNamespaces.find(item => item.id === '*')
        const isOriginAllService = !!originServices.find(item => item.id === '*')
        const isOriginAllConfigGroup = !!originConfigGroup.find(item => item.id === '*')
        const isOriginAllRouterRule = !!originRouterRules.find(item => item.id === '*')
        const isOriginAllRateLimitRule = !!originRateLimitRules.find(item => item.id === '*')
        const isOriginAllCircuitBreakerRule = !!originCircuitBreakerRules.find(item => item.id === '*')
        const isOriginAllFaultDetectRule = !!originFaultDetectRules.find(item => item.id === '*')
        const isOriginAllOpUser = !!originOpUsers.find(item => item.id === '*')
        const isOriginAllOpUserGroup = !!originOpUserGroups.find(item => item.id === '*')
        const isOriginAllAuthPolicy = !!originAuthPolicies.find(item => item.id === '*')

        const { addArray: addUsers, removeArray: removeUsers } = diffAddRemoveArray(
          originUsers.map(item => item.id),
          userSelection.map(item => item.id),
        )
        const { addArray: addGroups, removeArray: removeGroups } = diffAddRemoveArray(
          originUserGroups.map(item => item.id),
          userGroupSelection.map(item => item.id),
        )
        let { addArray: addNamespaces, removeArray: removeNamespaces } = diffAddRemoveArray(
          originNamespaces.map(item => item.id),
          namespaceSelection.map(item => item.id),
        )
        let { addArray: addServices, removeArray: removeServices } = diffAddRemoveArray(
          originServices.map(item => item.id),
          serviceSelection.map(item => item.id),
        )
        let { addArray: addConfigGroup, removeArray: removeConfigGroup } = diffAddRemoveArray(
          originConfigGroup.map(item => item.id),
          configGroupSelection.map(item => item.id),
        )
        let { addArray: addRouterRules, removeArray: removeRouterRules } = diffAddRemoveArray(
          originRouterRules.map(item => item.id),
          routerRuleSelection.map(item => item.id),
        )
        let { addArray: addRateLimitRules, removeArray: removeRateLimitRules } = diffAddRemoveArray(
          originRateLimitRules.map(item => item.id),
          rateLimitRuleSelection.map(item => item.id),
        )
        let { addArray: addCircuitBreakerRules, removeArray: removeCircuitBreakerRules } = diffAddRemoveArray(
          originCircuitBreakerRules.map(item => item.id),
          circuitbreakerRuleSelection.map(item => item.id),
        )
        let { addArray: addFaultDetectRules, removeArray: removeFaultDetectRules } = diffAddRemoveArray(
          originFaultDetectRules.map(item => item.id),
          faultdetectRuleSelection.map(item => item.id),
        )
        let { addArray: addOpUsers, removeArray: removeOpUsers } = diffAddRemoveArray(
          originOpUsers.map(item => item.id),
          opuserSelection.map(item => item.id),
        )
        let { addArray: addOpUserGroups, removeArray: removeOpUserGroups } = diffAddRemoveArray(
          originOpUserGroups.map(item => item.id),
          opuserGroupSelection.map(item => item.id),
        )
        let { addArray: addAuthPolicies, removeArray: removeAuthPolicies } = diffAddRemoveArray(
          originAuthPolicies.map(item => item.id),
          authPolicySelection.map(item => item.id),
        )

        if (values.useAllNamespace && !isOriginAllNamespace) {
          addNamespaces = ['*']
          removeNamespaces = originNamespaces.map(item => item.id)
        }
        if (isOriginAllNamespace && !values.useAllNamespace) {
          addNamespaces = namespaceSelection.filter(item => item.id !== '*').map(item => item.id)
          removeNamespaces = ['*']
        }
        if (isOriginAllNamespace && values.useAllNamespace) {
          removeNamespaces = []
        }
        if (values.useAllService && !isOriginAllService) {
          addServices = ['*']
          removeServices = originServices.map(item => item.id)
        }
        if (isOriginAllService && !values.useAllService) {
          addServices = serviceSelection.filter(item => item.id !== '*').map(item => item.id)
          removeServices = ['*']
        }
        if (isOriginAllService && values.useAllService) {
          removeServices = []
        }
        if (!isOriginAllConfigGroup && values.useAllConfigGroup) {
          addConfigGroup = ['*']
          removeConfigGroup = originConfigGroup.map(item => item.id)
        }
        if (isOriginAllConfigGroup && !values.useAllConfigGroup) {
          addConfigGroup = configGroupSelection.filter(item => item.id !== '*').map(item => item.id)
          removeConfigGroup = ['*']
        }
        if (isOriginAllConfigGroup && values.useAllConfigGroup) {
          removeConfigGroup = []
        }
        if (!isOriginAllRouterRule && values.useAllRouterRule) {
          addRouterRules = ['*']
          removeRouterRules = originRouterRules.map(item => item.id)
        }
        if (isOriginAllRouterRule && !values.useAllRouterRule) {
          addRouterRules = routerRuleSelection.filter(item => item.id !== '*').map(item => item.id)
          removeRouterRules = ['*']
        }
        if (isOriginAllRouterRule && values.useAllRouterRule) {
          removeRouterRules = []
        }
        if (!isOriginAllRateLimitRule && values.useAllRatelimitRule) {
          addRateLimitRules = ['*']
          removeRateLimitRules = originRateLimitRules.map(item => item.id)
        }
        if (isOriginAllRateLimitRule && !values.useAllRatelimitRule) {
          addRateLimitRules = rateLimitRuleSelection.filter(item => item.id !== '*').map(item => item.id)
          removeRateLimitRules = ['*']
        }
        if (isOriginAllRateLimitRule && values.useAllRatelimitRule) {
          removeRateLimitRules = []
        }
        if (!isOriginAllCircuitBreakerRule && values.useAllCircuitBreakerRule) {
          addCircuitBreakerRules = ['*']
          removeCircuitBreakerRules = originCircuitBreakerRules.map(item => item.id)
        }
        if (isOriginAllCircuitBreakerRule && !values.useAllCircuitBreakerRule) {
          addCircuitBreakerRules = circuitbreakerRuleSelection.filter(item => item.id !== '*').map(item => item.id)
          removeCircuitBreakerRules = ['*']
        }
        if (isOriginAllCircuitBreakerRule && values.useAllCircuitBreakerRule) {
          removeCircuitBreakerRules = []
        }
        if (!isOriginAllFaultDetectRule && values.useAllFaultDetectRule) {
          addFaultDetectRules = ['*']
          removeFaultDetectRules = originFaultDetectRules.map(item => item.id)
        }
        if (isOriginAllFaultDetectRule && !values.useAllFaultDetectRule) {
          addFaultDetectRules = faultdetectRuleSelection.filter(item => item.id !== '*').map(item => item.id)
          removeFaultDetectRules = ['*']
        }
        if (isOriginAllFaultDetectRule && values.useAllFaultDetectRule) {
          removeFaultDetectRules = []
        }
        if (!isOriginAllOpUser && values.useAllUsers) {
          addOpUsers = ['*']
          removeOpUsers = originOpUsers.map(item => item.id)
        }
        if (isOriginAllOpUser && !values.useAllUsers) {
          addOpUsers = opuserSelection.filter(item => item.id !== '*').map(item => item.id)
          removeOpUsers = ['*']
        }
        if (isOriginAllOpUser && values.useAllUsers) {
          removeOpUsers = []
        }
        if (!isOriginAllOpUserGroup && values.useAllUserGroups) {
          addOpUserGroups = ['*']
          removeOpUserGroups = originOpUserGroups.map(item => item.id)
        }
        if (isOriginAllOpUserGroup && !values.useAllUserGroups) {
          addOpUserGroups = opuserGroupSelection.filter(item => item.id !== '*').map(item => item.id)
          removeOpUserGroups = ['*']
        }
        if (isOriginAllOpUserGroup && values.useAllUserGroups) {
          removeOpUserGroups = []
        }
        if (!isOriginAllAuthPolicy && values.useAllAuthPoliy) {
          addAuthPolicies = ['*']
          removeAuthPolicies = originAuthPolicies.map(item => item.id)
        }
        if (isOriginAllAuthPolicy && !values.useAllAuthPoliy) {
          addAuthPolicies = authPolicySelection.filter(item => item.id !== '*').map(item => item.id)
          removeAuthPolicies = ['*']
        }
        if (isOriginAllAuthPolicy && values.useAllAuthPoliy) {
          removeAuthPolicies = []
        }
        const result = yield modifyGovernanceStrategy([
          {
            id: id,
            add_principals: {
              users: addUsers.map(item => ({ id: item })),
              groups: addGroups.map(item => ({ id: item })),
            },
            add_resources: {
              namespaces: addNamespaces.map(item => ({ id: item })),
              services: addServices.map(item => ({ id: item })),
              config_groups: addConfigGroup.map(id => ({ id })),
              route_rules: addRouterRules.map(item => ({ id: item })),
              ratelimit_rules: addRateLimitRules.map(item => ({ id: item })),
              circuitbreaker_rules: addCircuitBreakerRules.map(item => ({ id: item })),
              faultdetect_rules: addFaultDetectRules.map(item => ({ id: item })),
              users: addOpUsers.map(item => ({ id: item })),
              user_groups: addOpUserGroups.map(item => ({ id: item })),
              auth_policies: addAuthPolicies.map(item => ({ id: item })),
            },
            remove_principals: {
              users: removeUsers.map(item => ({ id: item })),
              groups: removeGroups.map(item => ({ id: item })),
            },
            remove_resources: {
              namespaces: removeNamespaces.map(item => ({ id: item })),
              services: removeServices.map(item => ({ id: item })),
              config_groups: removeConfigGroup.map(id => ({ id })),
              route_rules: removeRouterRules.map(item => ({ id: item })),
              ratelimit_rules: removeRateLimitRules.map(item => ({ id: item })),
              circuitbreaker_rules: removeCircuitBreakerRules.map(item => ({ id: item })),
              faultdetect_rules: removeFaultDetectRules.map(item => ({ id: item })),
              users: removeOpUsers.map(item => ({ id: item })),
              user_groups: removeOpUserGroups.map(item => ({ id: item })),
              auth_policies: removeAuthPolicies.map(item => ({ id: item })),
            },
            action: values.effect,
            comment: values.comment,
            functions: () => {
              if (values.useAllFunctions) {
                return ["*"]
              }
              return functionSelection.map(item => item.id)
            },
          },
        ] as any)
        if (result) {
          notification.success({ description: '编辑成功' })
          router.navigate(`/policy?authTab=policy`)
        } else {
          notification.error({ description: '编辑失败' })
        }
      } else {
        const result = yield createGovernanceStrategy({
          name: values.name,
          principals: {
            users: userSelection.map(item => ({ id: item.id })),
            groups: userGroupSelection.map(item => ({ id: item.id })),
          },
          action: values.effect,
          functions: values.useAllFunctions ? ["*"] : functionSelection.map(item => item.id),
          resources: {
            namespaces: values.useAllNamespace
              ? [{ id: '*' }]
              : namespaceSelection.map(item => ({ id: item.name, namespace: item.name })),
            services: values.useAllService
              ? [{ id: '*' }]
              : serviceSelection.map(item => ({ id: item.id })),
            config_groups: values.useAllConfigGroup
              ? [{ id: '*' }]
              : configGroupSelection.map(item => ({ id: item.id })),
            route_rules: values.useAllRouterRule
              ? [{ id: '*' }]
              : routerRuleSelection.map(item => ({ id: item.id })),
            ratelimit_rules: values.useAllRatelimitRule
              ? [{ id: '*' }]
              : rateLimitRuleSelection.map(item => ({ id: item.id })),
            circuitbreaker_rules: values.useAllCircuitBreakerRule
              ? [{ id: '*' }]
              : circuitbreakerRuleSelection.map(item => ({ id: item.id })),
            faultdetect_rules: values.useAllFaultDetectRule
              ? [{ id: '*' }]
              : faultdetectRuleSelection.map(item => ({ id: item.id })),
            users: values.useAllUsers
              ? [{ id: '*' }]
              : opuserSelection.map(item => ({ id: item.id })),
            user_groups: values.useAllUserGroups
              ? [{ id: '*' }]
              : opuserGroupSelection.map(item => ({ id: item.id })),
            auth_policies: values.useAllAuthPoliy
              ? [{ id: '*' }]
              : authPolicySelection.map(item => ({ id: item.id })),
          },
          comment: values.comment,
        })
        if (result) {
          notification.success({ description: '创建成功' })
          router.navigate(`/policy?authTab=policy`)
        } else {
          notification.error({ description: '创建失败' })
        }
      }
    })
    yield takeLatest(types.FETCH_DONE, function* (action) {
      const { form,
        user, userGroup, authPolicy,
        opuser, opuserGroup,
        namespace,
        service,
        configGroup,
        functions,
        routerRules, ratelimitRules, circuitbreakerRules, faultdetectRules,
      } = ducks
      // 查询资源的 duck 这里需要进行一次 load 加载
      yield put(user.creators.load({}))
      yield put(userGroup.creators.load({}))
      yield put(opuser.creators.load({}))
      yield put(opuserGroup.creators.load({}))
      yield put(authPolicy.creators.load({}))
      yield put(namespace.creators.load({}))
      yield put(service.creators.load({}))
      yield put(configGroup.creators.load({}))
      yield put(functions.creators.load({ "name": "Namespace" }))
      // 治理规则
      yield put(routerRules.creators.load({}))
      yield put(ratelimitRules.creators.load({}))
      yield put(circuitbreakerRules.creators.load({}))
      yield put(faultdetectRules.creators.load({}))
      if (!action.payload.id) return
      const policy = action.payload as AuthStrategy
      yield put({ type: types.SET_ORIGIN_POLICY, payload: policy })
      yield put(form.creators.setValue('name', policy.name))
      yield put(form.creators.setValue('comment', policy.comment))
      yield put(form.creators.setValue('id', policy.id))
      yield put(form.creators.setValue('useAllNamespace', !!policy.resources.namespaces.find(item => item.id === '*')))
      yield put(form.creators.setValue('useAllService', !!policy.resources.services.find(item => item.id === '*')))
      yield put(
        form.creators.setValue('useAllConfigGroup', !!policy.resources.config_groups.find(item => item.id === '*')),
      )
      yield put(
        form.creators.setValue('useAllFunctions', !!policy.functions.find(item => item === '*')),
      )
      yield put(
        form.creators.setValue('useAllRouterRule', !!policy.resources.route_rules.find(item => item.id === '*')),
      )
      yield put(
        form.creators.setValue('useAllRatelimitRule', !!policy.resources.ratelimit_rules.find(item => item.id === '*')),
      )
      yield put(
        form.creators.setValue('useAllCircuitBreakerRule', !!policy.resources.circuitbreaker_rules.find(item => item.id === '*')),
      )
      yield put(
        form.creators.setValue('useAllFaultDetectRule', !!policy.resources.faultdetect_rules.find(item => item.id === '*')),
      )
      yield put(
        form.creators.setValue('useAllUsers', !!policy.resources.users.find(item => item.id === '*')),
      )
      yield put(
        form.creators.setValue('useAllUserGroups', !!policy.resources.user_groups.find(item => item.id === '*')),
      )
      yield put(
        form.creators.setValue('useAllAuthPoliy', !!policy.resources.auth_policies.find(item => item.id === '*')),
      )
      yield put(user.creators.select(policy.principals.users))
      yield put(userGroup.creators.select(policy.principals.groups))

      yield put(form.creators.setValue('effect', policy.action))

      // functions
      yield put(functions.creators.select(policy.functions.map(item => ({ id: item, name: item, desc: getServerFunctionDesc("", item) })).filter(item => item.id !== '*') as ServerFunction[]))

      // 资源
      yield put(opuser.creators.select(policy.resources.users.filter(item => item.id !== '*') as UserItem[]))
      yield put(opuserGroup.creators.select(policy.resources.user_groups.filter(item => item.id !== '*') as UserGroup[]))
      yield put(authPolicy.creators.select(policy.resources.auth_policies.filter(item => item.id !== '*') as AuthStrategy[]))
      yield put(
        namespace.creators.select(policy.resources.namespaces.filter(item => item.id !== '*') as NamespaceItem[]),
      )
      yield put(service.creators.select(policy.resources.services.filter(item => item.id !== '*') as Service[]))
      yield put(
        configGroup.creators.select(
          policy.resources.config_groups.filter(item => item.id !== '*') as ConfigFileGroup[],
        ),
      )
      yield put(routerRules.creators.select(policy.resources.route_rules.filter(item => item.id !== '*') as CustomRoute[]))
      yield put(ratelimitRules.creators.select(policy.resources.ratelimit_rules.filter(item => item.id !== '*') as RateLimit[]))
      yield put(circuitbreakerRules.creators.select(policy.resources.circuitbreaker_rules.filter(item => item.id !== '*') as CircuitBreakerRule[]))
      yield put(faultdetectRules.creators.select(policy.resources.faultdetect_rules.filter(item => item.id !== '*') as FaultDetectRule[]))
    })
    yield takeLatest(types.SET_FUNCTION_GROUP, function* (action) {
      const { form,
        functions,
      } = ducks
      yield put(functions.creators.load({ "name": action.payload }))
    })
  }
  async getData(composedId) {
    const { id } = composedId
    if (!id) return {} as AuthStrategy
    const { strategy } = await describeGovernanceStrategyDetail({ id })
    return strategy
  }
}
export interface Fvalues {
  name: string
  useAllNamespace: boolean
  useAllService: boolean
  useAllConfigGroup: boolean
  useAllFunctions: boolean
  useAllRouterRule: boolean
  useAllCircuitBreakerRule: boolean
  useAllRatelimitRule: boolean
  useAllFaultDetectRule: boolean
  useAllUsers: boolean
  useAllUserGroups: boolean
  useAllAuthPoliy: boolean
  comment: string
  id: string
  effect: string
}

export class CreateFormDuck extends Form {
  Values: Fvalues
  Meta: Fvalues
  validate(v, metaData) {
    return validator(v, metaData)
  }

  get quickDucks() {
    return {
      ...super.quickDucks,
    }
  }

  get creators() {
    const { types } = this
    return {
      ...super.creators,
      submit: createToPayload<void>(types.SUBMIT),
    }
  }
  get quickTypes() {
    enum Types {
      CREATE,
      SUBMIT,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get reducers() {
    return {
      ...super.reducers,
    }
  }

  get rawSelectors() {
    return {
      ...super.rawSelectors,
    }
  }
  *submit() {
    const { creators, selectors } = this
    yield put(creators.setAllTouched(true))
    const firstInvalid = yield select(selectors.firstInvalid)
    if (firstInvalid) throw firstInvalid
  }
  *saga() {
    yield* super.saga()
  }
}
const validator = CreateFormDuck.combineValidators<Fvalues>({
  name(v, values) {
    if (values.id) {
      return
    }
    if (!v) {
      return '请输入名称'
    }
    if (!v.match(/^[\u4E00-\u9FA5A-Za-z0-9_\\-]+$/)) {
      return '只能使用中文、数字、大小写字母 以及- _组成'
    }
    if (v.length > 64) {
      return '最大长度为64'
    }
  },
})
type NamespaceItem = Namespace & { id: string }
export class NamespaceSelectDuck extends SearchableMultiSelect {
  Item: NamespaceItem
  getId(item: this['Item']) {
    return item.name
  }

  get autoSearch() {
    return false
  }

  get autoClearBeforeLoad() {
    return false
  }

  async getData(filter) {
    const { keyword } = filter

    const result = await getAllList(describeComplicatedNamespaces, {
      listKey: 'namespaces',
      totalKey: 'amount',
    })(keyword ? { name: keyword } : {})
    return result
  }
}

export class ServiceSelectDuck extends SearchableMultiSelect {
  Item: Service
  getId(item: this['Item']) {
    return item.id
  }

  get autoSearch() {
    return false
  }

  get autoClearBeforeLoad() {
    return false
  }

  async getData(filter) {
    const { keyword } = filter

    const result = await getAllList(describeServices)(keyword ? { name: keyword } : {})
    result.list = result.list.map(item => ({ ...item }))
    return result
  }
}

export class ConfigurationSelectDuck extends SearchableMultiSelect {
  Item: ConfigFileGroup

  getId(item: this['Item']) {
    return item.id
  }

  get autoSearch() {
    return false
  }

  get autoClearBeforeLoad() {
    return false
  }

  async getData(param) {
    const { keyword } = param

    const result = await getAllList(describeConfigFileGroups)(keyword ? { group: keyword } : {})
    result.list = result.list.map(item => ({ ...item }))

    return result
  }
}

export class RouterRulesSelectDuck extends SearchableMultiSelect {
  Item: CustomRoute

  getId(item: this['Item']) {
    return item.id
  }

  get autoSearch() {
    return false
  }

  get autoClearBeforeLoad() {
    return false
  }

  async getData(param) {
    const { keyword } = param

    const result = await getAllList(describeCustomRoute)(keyword ? { group: keyword } : {})
    result.list = result.list.map(item => ({ ...item }))

    return result
  }
}

export class RatelimitRulesSelectDuck extends SearchableMultiSelect {
  Item: RateLimit

  getId(item: this['Item']) {
    return item.id
  }

  get autoSearch() {
    return false
  }

  get autoClearBeforeLoad() {
    return false
  }

  async getData(param) {
    const { keyword } = param

    const result = await getAllList(describeLimitRules)(keyword ? { group: keyword } : {})
    result.list = result.list.map(item => ({ ...item }))

    return result
  }
}
export class CircuitbreakerRulesSelectDuck extends SearchableMultiSelect {
  Item: CircuitBreakerRule

  getId(item: this['Item']) {
    return item.id
  }

  get autoSearch() {
    return false
  }

  get autoClearBeforeLoad() {
    return false
  }

  async getData(param) {
    const { keyword } = param

    const result = await getAllList(DescribeCircuitBreakers)(keyword ? { group: keyword } : {})
    result.list = result.list.map(item => ({ ...item }))

    return result
  }
}
export class FaultdetectRulesSelectDuck extends SearchableMultiSelect {
  Item: FaultDetectRule

  getId(item: this['Item']) {
    return item.id
  }

  get autoSearch() {
    return false
  }

  get autoClearBeforeLoad() {
    return false
  }

  async getData(param) {
    const { keyword } = param

    const result = await getAllList(DescribeFaultDetects)(keyword ? { group: keyword } : {})
    result.list = result.list.map(item => ({ ...item }))

    return result
  }
}

export class FunctionSelectDuck extends SearchableMultiSelect {
  Item: ServerFunction
  getId(item: this['Item']) {
    return item.id
  }

  get autoSearch() {
    return false
  }

  get autoClearBeforeLoad() {
    return false
  }

  async getData(filter) {
    const keyword: string = filter["name"]
    if (keyword === "" || keyword === undefined) {
      return {
        list: [],
        totalCount: 0,
      }
    }
    const allKeyWord = keyword.split("|")
    const result = await describeServerFunctions()
    const targetGroup = result.list.filter(item => {
      for (const searchKey of allKeyWord) {
        if (searchKey === "" || searchKey === undefined) {
          continue
        }
        if (searchKey === item.name) {
          return true
        }
      }
      return false
    })

    if (targetGroup.length === 0) {
      return {
        list: [],
        totalCount: 0,
      }
    }

    const functionList = new Array()
    for (const group of targetGroup) {
      functionList.push(...group.functions.map(item => ({
        id: item,
        name: item,
        desc: getServerFunctionDesc(group.name, item)
      })))
    }

    return {
      list: functionList,
      totalCount: functionList.length,
    }
  }
}