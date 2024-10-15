import * as React from 'react'
import { purify, DuckCmpProps } from 'saga-duck'
import {
  Card,
  Stepper,
  Form,
  Text,
  FormItem,
  Tabs,
  TabPanel,
  Radio,
  RadioGroup,
  Table,
  Button,
  FormText,
  Segment,
} from 'tea-component'

import Duck from './CreateDuck'
import { AuthResourceType, AuthSubjectType, AuthSubjectTabs, AuthResourceTabs, AUTH_RESOURCE_TYPE_MAP } from '../Page'
import { AuthStrategy, getServerFunctionDesc, ServerFunction, ServerFunctionZhDesc, User, UserGroup } from '../../model'
import { autotip } from 'tea-component/lib/table/addons'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import SearchableTransfer from '@src/polaris/common/duckComponents/SearchableTransfer'
import Input from '@src/polaris/common/duckComponents/form/Input'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import { Namespace, Service } from '@src/polaris/service/types'
import router from '@src/polaris/common/util/router'
import { CircuitBreakerRule } from '@src/polaris/administration/breaker/types'
import { RateLimit } from '@src/polaris/administration/accessLimiting/model'
import { CustomRoute } from '@src/polaris/administration/dynamicRoute/customRoute/model'
import { FaultDetectRule } from '@src/polaris/administration/breaker/faultDetect/types'
const steps = [
  { id: '1', label: '选择用户' },
  { id: '2', label: '选择接口' },
  { id: '3', label: '选择资源' },
  { id: '4', label: '执行效果' },
  { id: '5', label: '预览' },
]

export default purify(function (props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { selectors, ducks, selector, creators } = duck
  const composedId = selectors.composedId(store)
  const { id } = composedId
  const [step, setStep] = React.useState('1')
  const { name,
    useAllNamespace, useAllService, useAllConfigGroup,
    useAllRouterRule, useAllRatelimitRule, useAllCircuitBreakerRule, useAllFaultDetectRule,
    useAllUsers, useAllUserGroups, useAllAuthPoliy,
    useAllFunctions, comment, effect } = ducks.form
      .getAPI(store, dispatch)
      .getFields(['name',
        'useAllNamespace', 'useAllService', 'useAllConfigGroup',
        'useAllRouterRule', 'useAllRatelimitRule', 'useAllCircuitBreakerRule', 'useAllFaultDetectRule',
        'useAllUsers', 'useAllUserGroups', 'useAllAuthPoliy',
        'useAllFunctions', 'comment', 'effect'])
  const isModify = !!id

  const [showAuthSubjectType, setShowAuthSubjectType] = React.useState(AuthSubjectType.USER)
  const [showAuthResourceType, setShowAuthResourceType] = React.useState(AuthResourceType.NAMESPACE)
  const [showFunctionGroup, setFunctionGroup] = React.useState("Namespace")

  const serverFunctionGroups = {
    namespaceView: "命名空间",
    clientView: "客户端",
    discoverView: "注册发现",
    governanceView: "治理规则",
    configView: "配置中心",
    authView: "鉴权",
  };

  const serverFunctionOptions = [
    { groupKey: "namespaceView", text: "命名空间", value: "Namespace" },
    { groupKey: "clientView", text: "客户端", value: "Client" },
    { groupKey: "discoverView", text: "服务", value: "Service|ServiceContract" },
    { groupKey: "discoverView", text: "实例", value: "Instance" },
    { groupKey: "governanceView", text: "路由规则", value: "RouteRule" },
    { groupKey: "governanceView", text: "限流规则", value: "RateLimitRule" },
    { groupKey: "governanceView", text: "熔断规则", value: "CircuitBreakerRule" },
    { groupKey: "governanceView", text: "探测规则", value: "FaultDetectRule" },
    { groupKey: "configView", text: "配置分组", value: "ConfigGroup" },
    { groupKey: "configView", text: "配置文件", value: "ConfigFile|ConfigRelease" },
    { groupKey: "authView", text: "用户", value: "User" },
    { groupKey: "authView", text: "用户组", value: "UserGroup" },
    { groupKey: "authView", text: "鉴权策略", value: "AuthPolicy" },
  ];

  const serverFunctionGroups = {
    namespaceView: "命名空间",
    clientView: "客户端",
    discoverView: "注册发现",
    governanceView: "治理规则",
    configView: "配置中心",
    authView: "鉴权",
  };

  const serverFunctionOptions = [
    { groupKey: "namespaceView", text: "命名空间", value: "Namespace" },
    { groupKey: "clientView", text: "客户端", value: "Client" },
    { groupKey: "discoverView", text: "服务", value: "Service|ServiceContract" },
    { groupKey: "discoverView", text: "实例", value: "Instance" },
    { groupKey: "governanceView", text: "路由规则", value: "RouteRule" },
    { groupKey: "governanceView", text: "限流规则", value: "RateLimitRule" },
    { groupKey: "governanceView", text: "熔断规则", value: "CircuitBreakerRule" },
    { groupKey: "governanceView", text: "探测规则", value: "FaultDetectRule" },
    { groupKey: "configView", text: "配置分组", value: "ConfigGroup" },
    { groupKey: "configView", text: "配置文件", value: "ConfigFile|ConfigRelease" },
    { groupKey: "authView", text: "用户", value: "User" },
    { groupKey: "authView", text: "用户组", value: "UserGroup" },
    { groupKey: "authView", text: "鉴权策略", value: "AuthPolicy" },
  ];

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
    functionGroup,
  } = selector(store)
  return (
    <DetailPage
      store={store}
      duck={duck}
      dispatch={dispatch}
      title={composedId?.id ? '编辑策略' : '创建策略'}
      backRoute={'/policy'}
    >
      {/* 内容区域一般使用 Card 组件显示内容 */}
      <Card>
        <Card.Body title={<Stepper steps={steps} current={step} style={{ width: '800px' }}></Stepper>}>
          {step === '1' && (
            <Form>
              <FormField field={name} label={'名称'} required>
                {isModify ? <FormText>{name.getValue()}</FormText> : <Input field={name} maxLength={64} size={'l'} />}
              </FormField>
              <FormField field={comment} label={'备注'}>
                <Input field={comment} size={'l'} />
              </FormField>
              <FormItem label={'角色'}>
                {!originPolicy?.default_strategy || !isModify ? (
                  <Tabs
                    tabs={AuthSubjectTabs}
                    activeId={showAuthSubjectType}
                    onActive={tab => setShowAuthSubjectType(tab.id as AuthSubjectType)}
                  >
                    <TabPanel id={AuthSubjectType.USER}>
                      <SearchableTransfer
                        title={'请选择用户'}
                        duck={ducks.user}
                        store={store}
                        dispatch={dispatch}
                        itemRenderer={(record: User) => (
                          <Text overflow>
                            {record.name} ({record.id})
                          </Text>
                        )}
                      />
                    </TabPanel>
                    <TabPanel id={AuthSubjectType.USERGROUP}>
                      <SearchableTransfer
                        title={'请选择用户组'}
                        duck={ducks.userGroup}
                        store={store}
                        dispatch={dispatch}
                        itemRenderer={(record: UserGroup) => <Text overflow>{record.name}</Text>}
                      />
                    </TabPanel>
                  </Tabs>
                ) : (
                  <FormText>{'默认策略不可变更授权角色'}</FormText>
                )}
              </FormItem>
            </Form>
          )}
          {step === '2' && (
            <Form>
              <FormItem label={'可访问接口'}>
                <RadioGroup
                  value={useAllFunctions.getValue() ? 'all' : 'partial'}
                  onChange={value => {
                    useAllFunctions.setValue(value === 'all')
                  }}
                  style={{ marginTop: '10px' }}
                >
                  <Radio name={'all'}>{'全部（含后续新增）'}</Radio>
                  <Radio name={'partial'}>{'指定接口'}</Radio>
                </RadioGroup>
                {!useAllFunctions.getValue() && (
                  <>
                    <Segment
                      defaultValue='Namespace'
                      value={functionGroup}
                      onChange={val => {
                        setFunctionGroup(val)
                        dispatch(creators.setFunctionGroup(val))
                      }}
                      options={serverFunctionOptions}
                      groups={serverFunctionGroups}
                      style={{ marginTop: '10px' }}
                    />
                    <SearchableTransfer
                      title={'请选择接口'}
                      duck={ducks.functions}
                      store={store}
                      dispatch={dispatch}
                      itemRenderer={(record: ServerFunction) => (
                        <Text overflow>{record.id}（{record.desc}）</Text>
                      )}
                    />
                  </>
                )}
              </FormItem>
            </Form>
          )}
          {step === '3' && (
            <Form>
              <FormItem label={'可操作资源'}>
                <Tabs
                  tabs={AuthResourceTabs}
                  activeId={showAuthResourceType}
                  onActive={tab => setShowAuthResourceType(tab.id as AuthResourceType)}
                >
                  <TabPanel id={AuthResourceType.NAMESPACE}>
                    <RadioGroup
                      value={useAllNamespace.getValue() ? 'all' : 'partial'}
                      onChange={value => {
                        useAllNamespace.setValue(value === 'all')
                      }}
                      style={{ marginTop: '10px' }}
                    >
                      <Radio name={'all'}>{'全部命名空间（含后续新增）'}</Radio>
                      <Radio name={'partial'}>{'指定命名空间'}</Radio>
                    </RadioGroup>
                    {!useAllNamespace.getValue() && (
                      <SearchableTransfer
                        style={{ marginTop: '10px' }}
                        title={'请选择命名空间'}
                        duck={ducks.namespace}
                        store={store}
                        dispatch={dispatch}
                        itemRenderer={(record: Namespace) => <Text overflow>{record.name}</Text>}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.SERVICE}>
                    <RadioGroup
                      value={useAllService.getValue() ? 'all' : 'partial'}
                      onChange={value => {
                        useAllService.setValue(value === 'all')
                      }}
                      style={{ marginTop: '10px' }}
                    >
                      <Radio name={'all'}>{'全部服务（含后续新增）'}</Radio>
                      <Radio name={'partial'}>{'指定服务'}</Radio>
                    </RadioGroup>
                    {!useAllService.getValue() && (
                      <SearchableTransfer
                        style={{ marginTop: '10px' }}
                        title={'请选择服务'}
                        duck={ducks.service}
                        store={store}
                        dispatch={dispatch}
                        itemRenderer={(record: Service) => (
                          <Text overflow>
                            {record.name}（{record.namespace}）
                          </Text>
                        )}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.CONFIGURATION}>
                    <RadioGroup
                      value={useAllConfigGroup.getValue() ? 'all' : 'partial'}
                      onChange={value => {
                        useAllConfigGroup.setValue(value === 'all')
                      }}
                      style={{ marginTop: '10px' }}
                    >
                      <Radio name={'all'}>{'全部配置分组（含后续新增）'}</Radio>
                      <Radio name={'partial'}>{'指定配置分组'}</Radio>
                    </RadioGroup>
                    {!useAllConfigGroup.getValue() && (
                      <SearchableTransfer
                        style={{ marginTop: '10px' }}
                        title={'请选择配置分组'}
                        duck={ducks.configGroup}
                        store={store}
                        dispatch={dispatch}
                        itemRenderer={(record: Service) => (
                          <Text overflow>
                            {record.name}（{record.namespace}）
                          </Text>
                        )}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.ROUTER_RULE}>
                    <RadioGroup
                      value={useAllRouterRule.getValue() ? 'all' : 'partial'}
                      onChange={value => {
                        useAllRouterRule.setValue(value === 'all')
                      }}
                      style={{ marginTop: '10px' }}
                    >
                      <Radio name={'all'}>{'全部路由规则（含后续新增）'}</Radio>
                      <Radio name={'partial'}>{'指定路由规则'}</Radio>
                    </RadioGroup>
                    {!useAllRouterRule.getValue() && (
                      <SearchableTransfer
                        style={{ marginTop: '10px' }}
                        title={'请选择路由规则'}
                        duck={ducks.routerRules}
                        store={store}
                        dispatch={dispatch}
                        itemRenderer={(record: CustomRoute) => (
                          <Text overflow>
                            {record.name}（{record.id}）
                          </Text>
                        )}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.RATELIMIT_RULE}>
                    <RadioGroup
                      value={useAllRatelimitRule.getValue() ? 'all' : 'partial'}
                      onChange={value => {
                        useAllRatelimitRule.setValue(value === 'all')
                      }}
                      style={{ marginTop: '10px' }}
                    >
                      <Radio name={'all'}>{'全部限流规则（含后续新增）'}</Radio>
                      <Radio name={'partial'}>{'指定限流规则'}</Radio>
                    </RadioGroup>
                    {!useAllRatelimitRule.getValue() && (
                      <SearchableTransfer
                        style={{ marginTop: '10px' }}
                        title={'请选限流规则'}
                        duck={ducks.ratelimitRules}
                        store={store}
                        dispatch={dispatch}
                        itemRenderer={(record: RateLimit) => (
                          <Text overflow>
                            {record.name}（{record.id}）
                          </Text>
                        )}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.CIRCUIT_BREAKER_RULE}>
                    <RadioGroup
                      value={useAllCircuitBreakerRule.getValue() ? 'all' : 'partial'}
                      onChange={value => {
                        useAllCircuitBreakerRule.setValue(value === 'all')
                      }}
                      style={{ marginTop: '10px' }}
                    >
                      <Radio name={'all'}>{'全部熔断规则（含后续新增）'}</Radio>
                      <Radio name={'partial'}>{'指定熔断规则'}</Radio>
                    </RadioGroup>
                    {!useAllCircuitBreakerRule.getValue() && (
                      <SearchableTransfer
                        style={{ marginTop: '10px' }}
                        title={'请选熔断规则'}
                        duck={ducks.circuitbreakerRules}
                        store={store}
                        dispatch={dispatch}
                        itemRenderer={(record: CircuitBreakerRule) => (
                          <Text overflow>
                            {record.name}（{record.id}）
                          </Text>
                        )}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.FAULTDETECT_RULE}>
                    <RadioGroup
                      value={useAllFaultDetectRule.getValue() ? 'all' : 'partial'}
                      onChange={value => {
                        useAllFaultDetectRule.setValue(value === 'all')
                      }}
                      style={{ marginTop: '10px' }}
                    >
                      <Radio name={'all'}>{'全部探测规则（含后续新增）'}</Radio>
                      <Radio name={'partial'}>{'指定探测规则'}</Radio>
                    </RadioGroup>
                    {!useAllFaultDetectRule.getValue() && (
                      <SearchableTransfer
                        style={{ marginTop: '10px' }}
                        title={'请选探测规则'}
                        duck={ducks.faultdetectRules}
                        store={store}
                        dispatch={dispatch}
                        itemRenderer={(record: FaultDetectRule) => (
                          <Text overflow>
                            {record.name}（{record.id}）
                          </Text>
                        )}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.AUTH_USERS}>
                    <RadioGroup
                      value={useAllUsers.getValue() ? 'all' : 'partial'}
                      onChange={value => {
                        useAllUsers.setValue(value === 'all')
                      }}
                      style={{ marginTop: '10px' }}
                    >
                      <Radio name={'all'}>{'全部用户（含后续新增）'}</Radio>
                      <Radio name={'partial'}>{'指定用户'}</Radio>
                    </RadioGroup>
                    {!useAllUsers.getValue() && (
                      <SearchableTransfer
                        style={{ marginTop: '10px' }}
                        title={'请选用户'}
                        duck={ducks.user}
                        store={store}
                        dispatch={dispatch}
                        itemRenderer={(record: User) => (
                          <Text overflow>
                            {record.name}（{record.id}）
                          </Text>
                        )}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.AUTH_USER_GROUP}>
                    <RadioGroup
                      value={useAllUserGroups.getValue() ? 'all' : 'partial'}
                      onChange={value => {
                        useAllUserGroups.setValue(value === 'all')
                      }}
                      style={{ marginTop: '10px' }}
                    >
                      <Radio name={'all'}>{'全部用户组（含后续新增）'}</Radio>
                      <Radio name={'partial'}>{'指定用户组'}</Radio>
                    </RadioGroup>
                    {!useAllUserGroups.getValue() && (
                      <SearchableTransfer
                        style={{ marginTop: '10px' }}
                        title={'请选用户组'}
                        duck={ducks.userGroup}
                        store={store}
                        dispatch={dispatch}
                        itemRenderer={(record: UserGroup) => (
                          <Text overflow>
                            {record.name}（{record.id}）
                          </Text>
                        )}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.AUTH_POLICY}>
                    <RadioGroup
                      value={useAllAuthPoliy.getValue() ? 'all' : 'partial'}
                      onChange={value => {
                        useAllAuthPoliy.setValue(value === 'all')
                      }}
                      style={{ marginTop: '10px' }}
                    >
                      <Radio name={'all'}>{'全部鉴权策略（含后续新增）'}</Radio>
                      <Radio name={'partial'}>{'指定鉴权策略'}</Radio>
                    </RadioGroup>
                    {!useAllAuthPoliy.getValue() && (
                      <SearchableTransfer
                        style={{ marginTop: '10px' }}
                        title={'请选鉴权策略'}
                        duck={ducks.authPolicy}
                        store={store}
                        dispatch={dispatch}
                        itemRenderer={(record: AuthStrategy) => (
                          <Text overflow>
                            {record.name}（{record.id}）
                          </Text>
                        )}
                      />
                    )}
                  </TabPanel>
                </Tabs>
              </FormItem>
            </Form>
          )}
          {step === '4' && (
            <Form>
              <FormItem label="执行效果" required>
                <RadioGroup
                  value={effect.getValue()}
                  defaultValue='ALLOW'
                  onChange={value => {
                    effect.setValue(value)
                  }}
                  style={{ marginTop: '10px' }}
                >
                  <Radio name={'ALLOW'}>{'允许'}</Radio>
                  <Radio name={'DENY'}>{'禁止'}</Radio>
                </RadioGroup>
              </FormItem>
            </Form>
          )}
          {step === '5' && (
            <Form>
              <FormItem label={'策略名称'}>
                <FormText>{name.getValue()}</FormText>
              </FormItem>
              <FormItem label={'用户'}>
                <FormText>{userSelection.map(item => `${item.name}(${item.id})`).join(',' || '无选中用户')}</FormText>
              </FormItem>
              <FormItem label={'用户组'}>
                <FormText>
                  {userGroupSelection.map(item => `${item.name}(${item.id})`).join(',' || '无选中用户组')}
                </FormText>
              </FormItem>
              <FormItem label={'执行效果'}>
                <FormText>
                  {effect.getValue() === 'ALLOW' ? '允许' : '禁止'}
                </FormText>
              </FormItem>
              <FormItem label={'可访问接口'}>
                {useAllFunctions.getValue() ? (
                  <FormText>{'全部接口（含后续新增）'}</FormText>
                ) : (
                  <Table
                    records={functionSelection}
                    columns={[
                      {
                        key: 'name',
                        header: '名称',
                        render: x => x.id,
                      },
                    ]}
                    addons={[autotip({})]}
                  />
                )}
              </FormItem>
              <FormItem label={'可操作资源'}>
                <Tabs
                  tabs={AuthResourceTabs}
                  activeId={showAuthResourceType}
                  onActive={tab => setShowAuthResourceType(tab.id as AuthResourceType)}
                >
                  <TabPanel id={AuthResourceType.NAMESPACE}>
                    {useAllNamespace.getValue() ? (
                      <FormText>{'全部命名空间（含后续新增）'}</FormText>
                    ) : (
                      <Table
                        records={namespaceSelection}
                        columns={[
                          {
                            key: 'name',
                            header: '名称',
                            render: AUTH_RESOURCE_TYPE_MAP[showAuthResourceType].columnsRender,
                          },
                        ]}
                        addons={[autotip({})]}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.SERVICE}>
                    {useAllService.getValue() ? (
                      <FormText>{'全部服务（含后续新增）'}</FormText>
                    ) : (
                      <Table
                        records={serviceSelection}
                        columns={[
                          {
                            key: 'name',
                            header: '名称',
                            render: AUTH_RESOURCE_TYPE_MAP[showAuthResourceType].columnsRender,
                          },
                        ]}
                        addons={[autotip({})]}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.CONFIGURATION}>
                    {useAllConfigGroup.getValue() ? (
                      <FormText>{'全部配置分组（含后续新增）'}</FormText>
                    ) : (
                      <Table
                        records={configGroupSelection}
                        columns={[
                          {
                            key: 'name',
                            header: '名称',
                            render: AUTH_RESOURCE_TYPE_MAP[showAuthResourceType].columnsRender,
                          },
                        ]}
                        addons={[autotip({})]}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.ROUTER_RULE}>
                    {useAllRouterRule.getValue() ? (
                      <FormText>{'全部路由规则（含后续新增）'}</FormText>
                    ) : (
                      <Table
                        records={routerRuleSelection}
                        columns={[
                          {
                            key: 'name',
                            header: '名称',
                            render: AUTH_RESOURCE_TYPE_MAP[showAuthResourceType].columnsRender,
                          },
                        ]}
                        addons={[autotip({})]}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.RATELIMIT_RULE}>
                    {useAllRatelimitRule.getValue() ? (
                      <FormText>{'全部限流规则（含后续新增）'}</FormText>
                    ) : (
                      <Table
                        records={rateLimitRuleSelection}
                        columns={[
                          {
                            key: 'name',
                            header: '名称',
                            render: AUTH_RESOURCE_TYPE_MAP[showAuthResourceType].columnsRender,
                          },
                        ]}
                        addons={[autotip({})]}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.CIRCUIT_BREAKER_RULE}>
                    {useAllCircuitBreakerRule.getValue() ? (
                      <FormText>{'全部熔断规则（含后续新增）'}</FormText>
                    ) : (
                      <Table
                        records={circuitbreakerRuleSelection}
                        columns={[
                          {
                            key: 'name',
                            header: '名称',
                            render: AUTH_RESOURCE_TYPE_MAP[showAuthResourceType].columnsRender,
                          },
                        ]}
                        addons={[autotip({})]}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.FAULTDETECT_RULE}>
                    {useAllFaultDetectRule.getValue() ? (
                      <FormText>{'全部探测规则（含后续新增）'}</FormText>
                    ) : (
                      <Table
                        records={faultdetectRuleSelection}
                        columns={[
                          {
                            key: 'name',
                            header: '名称',
                            render: AUTH_RESOURCE_TYPE_MAP[showAuthResourceType].columnsRender,
                          },
                        ]}
                        addons={[autotip({})]}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.AUTH_USERS}>
                    {useAllUsers.getValue() ? (
                      <FormText>{'全部用户（含后续新增）'}</FormText>
                    ) : (
                      <Table
                        records={opuserSelection}
                        columns={[
                          {
                            key: 'name',
                            header: '名称',
                            render: AUTH_RESOURCE_TYPE_MAP[showAuthResourceType].columnsRender,
                          },
                        ]}
                        addons={[autotip({})]}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.AUTH_USER_GROUP}>
                    {useAllUserGroups.getValue() ? (
                      <FormText>{'全部用户组（含后续新增）'}</FormText>
                    ) : (
                      <Table
                        records={opuserGroupSelection}
                        columns={[
                          {
                            key: 'name',
                            header: '名称',
                            render: AUTH_RESOURCE_TYPE_MAP[showAuthResourceType].columnsRender,
                          },
                        ]}
                        addons={[autotip({})]}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.AUTH_POLICY}>
                    {useAllAuthPoliy.getValue() ? (
                      <FormText>{'全部鉴权策略（含后续新增）'}</FormText>
                    ) : (
                      <Table
                        records={authPolicySelection}
                        columns={[
                          {
                            key: 'name',
                            header: '名称',
                            render: AUTH_RESOURCE_TYPE_MAP[showAuthResourceType].columnsRender,
                          },
                        ]}
                        addons={[autotip({})]}
                      />
                    )}
                  </TabPanel>
                </Tabs>
              </FormItem>
            </Form>
          )}
        </Card.Body>
        <Card.Footer style={{ padding: '15px' }}>
          {step === '5' && (
            <Button
              type={'primary'}
              onClick={() => {
                dispatch(creators.submit())
              }}
              style={{ marginRight: '15px' }}
            >
              {'完成'}
            </Button>
          )}
          {Number(step) < 5 && (
            <Button
              type={'primary'}
              onClick={() => {
                setStep((+step + 1).toString())
              }}
              style={{ marginRight: '15px' }}
            >
              {'下一步'}
            </Button>
          )}
          {Number(step) > 1 && (
            <Button
              type={'weak'}
              onClick={() => {
                setStep((+step - 1).toString())
              }}
              style={{ marginRight: '15px' }}
            >
              {'上一步'}
            </Button>
          )}
          <Button
            type={'weak'}
            style={{ marginRight: '15px' }}
            onClick={() => {
              router.navigate(`/policy?authTab=policy`)
            }}
          >
            {'取消'}
          </Button>
        </Card.Footer>
      </Card>
    </DetailPage>
  )
})
