import { t } from 'i18next'
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
} from 'tea-component'

import Duck from './CreateDuck'
import { AuthResourceType, AuthSubjectType, AuthSubjectTabs, AuthResourceTabs, AUTH_RESOURCE_TYPE_MAP } from '../Page'
import { User, UserGroup } from '../../model'
import { autotip } from 'tea-component/lib/table/addons'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import SearchableTransfer from '@src/polaris/common/duckComponents/SearchableTransfer'
import Input from '@src/polaris/common/duckComponents/form/Input'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import { Namespace, Service } from '@src/polaris/service/types'
import router from '@src/polaris/common/util/router'
import { ConfigFileGroup } from '@src/polaris/configuration/fileGroup/types'
import { useTranslation } from 'react-i18next'
const steps = [
  { id: '1', label: t('选择用户') },
  { id: '2', label: t('授权') },
  { id: '3', label: t('预览') },
]

export default purify(function(props: DuckCmpProps<Duck>) {
  const { t } = useTranslation()

  const { duck, store, dispatch } = props
  const { selectors, ducks, selector, creators } = duck
  const composedId = selectors.composedId(store)
  const { id } = composedId
  const [step, setStep] = React.useState('1')
  const { name, useAllNamespace, useAllService, useAllConfigGroup, comment } = ducks.form
    .getAPI(store, dispatch)
    .getFields(['name', 'useAllNamespace', 'useAllService', 'useAllConfigGroup', 'comment'])
  const isModify = !!id

  const [showAuthSubjectType, setShowAuthSubjectType] = React.useState(AuthSubjectType.USER)
  const [showAuthResourceType, setShowAuthResourceType] = React.useState(AuthResourceType.NAMESPACE)

  const {
    user: { selection: userSelection },
    userGroup: { selection: userGroupSelection },
    namespace: { selection: namespaceSelection },
    service: { selection: serviceSelection },
    configGroup: { selection: configGroupSelection },
    originPolicy,
  } = selector(store)
  return (
    <DetailPage
      store={store}
      duck={duck}
      dispatch={dispatch}
      title={composedId?.id ? t('编辑策略') : t('创建策略')}
      backRoute={'/policy'}
    >
      {/* 内容区域一般使用 Card 组件显示内容 */}
      <Card>
        <Card.Body title={<Stepper steps={steps} current={step} style={{ width: '500px' }}></Stepper>}>
          {step === '1' && (
            <Form>
              <FormField field={name} label={t('名称')} required>
                {isModify ? <FormText>{name.getValue()}</FormText> : <Input field={name} maxLength={64} size={'l'} />}
              </FormField>
              <FormField field={comment} label={t('备注')}>
                <Input field={comment} size={'l'} />
              </FormField>
              <FormItem label={t('角色')}>
                {!originPolicy?.default_strategy || !isModify ? (
                  <Tabs
                    tabs={AuthSubjectTabs}
                    activeId={showAuthSubjectType}
                    onActive={tab => setShowAuthSubjectType(tab.id as AuthSubjectType)}
                  >
                    <TabPanel id={AuthSubjectType.USER}>
                      <SearchableTransfer
                        title={t('请选择用户')}
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
                        title={t('请选择用户组')}
                        duck={ducks.userGroup}
                        store={store}
                        dispatch={dispatch}
                        itemRenderer={(record: UserGroup) => <Text overflow>{record.name}</Text>}
                      />
                    </TabPanel>
                  </Tabs>
                ) : (
                  <FormText>{t('默认策略不可变更授权角色')}</FormText>
                )}
              </FormItem>
            </Form>
          )}
          {step === '2' && (
            <Form>
              <FormItem label={t('资源')}>
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
                      <Radio name={'all'}>{t('全部命名空间（含后续新增）')}</Radio>
                      <Radio name={'partial'}>{t('指定命名空间')}</Radio>
                    </RadioGroup>
                    {!useAllNamespace.getValue() && (
                      <SearchableTransfer
                        style={{ marginTop: '10px' }}
                        title={t('请选择命名空间')}
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
                      <Radio name={'all'}>{t('全部服务（含后续新增）')}</Radio>
                      <Radio name={'partial'}>{t('指定服务')}</Radio>
                    </RadioGroup>
                    {!useAllService.getValue() && (
                      <SearchableTransfer
                        style={{ marginTop: '10px' }}
                        title={t('请选择服务')}
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
                      <Radio name={'all'}>{t('全部配置分组（含后续新增）')}</Radio>
                      <Radio name={'partial'}>{t('指定配置分组')}</Radio>
                    </RadioGroup>
                    {!useAllConfigGroup.getValue() && (
                      <SearchableTransfer
                        style={{ marginTop: '10px' }}
                        title={t('请选择配置分组')}
                        duck={ducks.configGroup}
                        store={store}
                        dispatch={dispatch}
                        itemRenderer={(record: ConfigFileGroup) => <Text overflow>{record.name}</Text>}
                      />
                    )}
                  </TabPanel>
                </Tabs>
              </FormItem>
              <FormItem label={t('操作')}>
                <FormText>{t('读操作｜写操作')}</FormText>
              </FormItem>
            </Form>
          )}
          {step === '3' && (
            <Form>
              <FormItem label={t('策略名称')}>
                <FormText>{name.getValue()}</FormText>
              </FormItem>
              <FormItem label={t('用户')}>
                <FormText>
                  {userSelection.map(item => `${item.name}(${item.id})`).join(',' || t('无选中用户'))}
                </FormText>
              </FormItem>
              <FormItem label={t('用户组')}>
                <FormText>
                  {userGroupSelection.map(item => `${item.name}(${item.id})`).join(',' || t('无选中用户组'))}
                </FormText>
              </FormItem>
              <FormItem label={t('资源')}>
                <Tabs
                  tabs={AuthResourceTabs}
                  activeId={showAuthResourceType}
                  onActive={tab => setShowAuthResourceType(tab.id as AuthResourceType)}
                >
                  <TabPanel id={AuthResourceType.NAMESPACE}>
                    {useAllNamespace.getValue() ? (
                      <FormText>{t('全部命名空间（含后续新增）')}</FormText>
                    ) : (
                      <Table
                        records={namespaceSelection}
                        columns={[
                          {
                            key: 'name',
                            header: t('名称'),
                            render: AUTH_RESOURCE_TYPE_MAP[showAuthResourceType].columnsRender,
                          },
                          { key: 'auth', header: t('权限'), render: () => t('读｜写') },
                        ]}
                        addons={[autotip({})]}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.SERVICE}>
                    {useAllService.getValue() ? (
                      <FormText>{t('全部服务（含后续新增）')}</FormText>
                    ) : (
                      <Table
                        records={serviceSelection}
                        columns={[
                          {
                            key: 'name',
                            header: t('名称'),
                            render: AUTH_RESOURCE_TYPE_MAP[showAuthResourceType].columnsRender,
                          },
                          { key: 'auth', header: t('权限'), render: () => t('读｜写') },
                        ]}
                        addons={[autotip({})]}
                      />
                    )}
                  </TabPanel>
                  <TabPanel id={AuthResourceType.CONFIGURATION}>
                    {useAllService.getValue() ? (
                      <FormText>{t('全部服务（含后续新增）')}</FormText>
                    ) : (
                      <Table
                        records={configGroupSelection}
                        columns={[
                          {
                            key: 'name',
                            header: t('名称'),
                            render: AUTH_RESOURCE_TYPE_MAP[showAuthResourceType].columnsRender,
                          },
                          { key: 'auth', header: t('权限'), render: () => t('读｜写') },
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
          {step === '3' && (
            <Button
              type={'primary'}
              onClick={() => {
                dispatch(creators.submit())
              }}
              style={{ marginRight: '15px' }}
            >
              {t('完成')}
            </Button>
          )}
          {Number(step) < 3 && (
            <Button
              type={'primary'}
              onClick={() => {
                setStep((+step + 1).toString())
              }}
              style={{ marginRight: '15px' }}
            >
              {t('下一步')}
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
              {t('上一步')}
            </Button>
          )}
          <Button
            type={'weak'}
            style={{ marginRight: '15px' }}
            onClick={() => {
              router.navigate(`/policy?authTab=policy`)
            }}
          >
            {t('取消')}
          </Button>
        </Card.Footer>
      </Card>
    </DetailPage>
  )
})
