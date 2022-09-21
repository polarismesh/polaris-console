import { select, put } from 'redux-saga/effects'
import { takeLatest } from 'redux-saga-catch'
import { reduceFromPayload, createToPayload } from 'saga-duck'
import DetailPage from '@src/polaris/common/ducks/DetailPage'
import { UserSelectDuck } from '../../userGroup/operation/CreateDuck'
import { UserGroupSelectDuck } from '../../user/operation/AttachUserGroupDuck'
import {
  AuthStrategy,
  describeGovernanceStrategyDetail,
  createGovernanceStrategy,
  modifyGovernanceStrategy,
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
      user: UserSelectDuck,
      userGroup: UserGroupSelectDuck,
      namespace: NamespaceSelectDuck,
      service: ServiceSelectDuck,
      configGroup: ConfigurationSelectDuck,
    }
  }
  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      instanceId: reduceFromPayload(types.SET_INSTANCE_ID, ''),
      originPolicy: reduceFromPayload(types.SET_ORIGIN_POLICY, {} as AuthStrategy),
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
    }
  }
  *saga() {
    yield* super.saga()
    const duck = this
    const { types, ducks, selectors, selector } = duck
    yield takeLatest(types.SUBMIT, function*() {
      try {
        yield* ducks.form.submit()
      } catch (e) {
        return
      }
      const {
        user: { selection: userSelection },
        userGroup: { selection: userGroupSelection },
        namespace: { selection: namespaceSelection },
        service: { selection: serviceSelection },
        configGroup: { selection: configGroupSelection },
        originPolicy,
      } = selector(yield select())
      const values = ducks.form.selectors.values(yield select())
      const { id } = selectors.composedId(yield select())
      if (id) {
        const {
          principals: { users: originUsers, groups: originUserGroups },
          resources: { namespaces: originNamespaces, services: originServices, config_groups: originConfigGroup },
        } = originPolicy
        const isOriginAllNamespace = !!originNamespaces.find(item => item.id === '*')
        const isOriginAllService = !!originServices.find(item => item.id === '*')
        const isOriginAllConfigGroup = !!originConfigGroup.find(item => item.id === '*')
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
        if (!isOriginAllConfigGroup && values.useAllConfigGroup) {
          addConfigGroup = ['*']
          removeConfigGroup = originConfigGroup.map(item => item.id)
        }
        if (isOriginAllConfigGroup && !values.useAllConfigGroup) {
          addConfigGroup = configGroupSelection.filter(item => item.id !== '*').map(item => item.id)
          removeConfigGroup = ['*']
        }
        if (isOriginAllService && values.useAllService) {
          removeServices = []
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
            },
            remove_principals: {
              users: removeUsers.map(item => ({ id: item })),
              groups: removeGroups.map(item => ({ id: item })),
            },
            remove_resources: {
              namespaces: removeNamespaces.map(item => ({ id: item })),
              services: removeServices.map(item => ({ id: item })),
              config_groups: removeConfigGroup.map(id => ({ id })),
            },
            comment: values.comment,
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
          resources: {
            namespaces: values.useAllNamespace
              ? [{ id: '*' }]
              : namespaceSelection.map(item => ({ id: item.name, namespace: item.name })),
            services: values.useAllService ? [{ id: '*' }] : serviceSelection.map(item => ({ id: item.id })),
            config_groups: values.useAllConfigGroup
              ? [{ id: '*' }]
              : configGroupSelection.map(item => ({ id: item.id })),
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
    yield takeLatest(types.FETCH_DONE, function*(action) {
      const { form, user, userGroup, namespace, service, configGroup } = ducks
      yield put(user.creators.load({}))
      yield put(userGroup.creators.load({}))
      yield put(namespace.creators.load({}))
      yield put(service.creators.load({}))
      yield put(configGroup.creators.load({}))
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
      yield put(user.creators.select(policy.principals.users))
      yield put(userGroup.creators.select(policy.principals.groups))
      yield put(
        namespace.creators.select(policy.resources.namespaces.filter(item => item.id !== '*') as NamespaceItem[]),
      )
      yield put(service.creators.select(policy.resources.services.filter(item => item.id !== '*') as Service[]))
      yield put(
        configGroup.creators.select(
          policy.resources.config_groups.filter(item => item.id !== '*') as ConfigFileGroup[],
        ),
      )
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
  comment: string
  id: string
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
