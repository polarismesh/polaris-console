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
import { ServerFunctionGroup, User, UserGroup } from '../../model'
import { autotip } from 'tea-component/lib/table/addons'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import SearchableTransfer from '@src/polaris/common/duckComponents/SearchableTransfer'
import Input from '@src/polaris/common/duckComponents/form/Input'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import { Namespace, Service } from '@src/polaris/service/types'
import router from '@src/polaris/common/util/router'
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
  const { name, useAllNamespace, useAllService, useAllConfigGroup, useAllFunctions, comment, effect } = ducks.form
    .getAPI(store, dispatch)
    .getFields(['name', 'useAllNamespace', 'useAllService', 'useAllConfigGroup', 'useAllFunctions', 'comment', 'effect'])
  const isModify = !!id

  const [showAuthSubjectType, setShowAuthSubjectType] = React.useState(AuthSubjectType.USER)
  const [showAuthResourceType, setShowAuthResourceType] = React.useState(AuthResourceType.NAMESPACE)

  const serverFunctionGroups = {
    namespaceView: "命名空间",
    configView: "配置中心",
    discoverView: "注册发现",
    governanceView: "治理规则",
  };

  const serverFunctionOptions = [
    { groupKey: "namespaceView", text: "命名空间", value: "namespace" },
    { groupKey: "configView", text: "配置分组", value: "config_group" },
    { groupKey: "configView", text: "配置文件", value: "config_file" },
    { groupKey: "discoverView", text: "服务", value: "service" },
    { groupKey: "discoverView", text: "实例", value: "instance" },
    { groupKey: "governanceView", text: "路由规则", value: "router_rule" },
    { groupKey: "governanceView", text: "限流规则", value: "ratelimit" },
    { groupKey: "governanceView", text: "熔断规则", value: "circuit_breaker" },
    { groupKey: "governanceView", text: "探测规则", value: "fault_detect" },
  ];

  const [serverFunctionView, setServerFunctionView] = React.useState("namespace");

  const {
    user: { selection: userSelection },
    userGroup: { selection: userGroupSelection },
    namespace: { selection: namespaceSelection },
    service: { selection: serviceSelection },
    configGroup: { selection: configGroupSelection },
    functions: { selection: functionSelection },
    originPolicy,
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
                      value={serverFunctionView.toString()}
                      onChange={val => {
                        setServerFunctionView(val)
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
                      itemRenderer={(record: ServerFunctionGroup) => (
                        <>
                          {
                            record.id
                          }
                        </>
                      )}
                    />
                  </>
                )}
              </FormItem>
            </Form>
          )}
          {step === '3' && (
            <Form>
              <FormItem label={'资源'}>
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
                  {effect.getValue() === 'ALLOW'? '允许' : '禁止'}
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
                        render: x => x,
                      },
                    ]}
                    addons={[autotip({})]}
                  />
                )}
              </FormItem>
              <FormItem label={'资源'}>
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
